import { NativeModules, Platform, NativeEventEmitter } from 'react-native';

const LINKING_ERROR =
  `The package 'react-native-bluetoothz' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n';

const BLE = NativeModules.BluetoothZ
  ? NativeModules.BluetoothZ
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );

const Defines = {
  CONNECTION_TIMEOUT_MSEC: 10000,
  SCAN_TIMEOUT_MSEC: 8000,
  DEFAULT_MAX_RETRY_COUNT: 5,
  ...BLE.getConstants(),
};

module.exports.Defines = Defines;

/// Inizializzo le variabili di stato
let reconnectCount = null;
let scanWatchDog = null;
let connectionWatchDog = new Map();
let isScanning = false;
const scanOptions = { allowDuplicates: false };
module.exports.scanOptions = Object.freeze(scanOptions);

class Queue {
  constructor() {
    this.operations = [];
    this.busy = false;
    this.mutexLock = false;
  }

  exec() {
    const { task } = this.operations.shift();
    console.log('enq, executing op, l:', this.operations.length);
    task();
  }

  enqueue(task, uuid) {
    if (this.mutexLock) {
      console.log('enq, waiting, l:', this.operations.length);
      // setTimeout(enqueue, 1000, task, uuid)
      return;
    }
    this.operations.push({ task, uuid });
    if (!this.busy) {
      this.busy = true;
      this.exec();
    } else {
      console.log('queue busy! l:', this.operations.length);
    }
  }

  dequeue(uuid) {
    if (this.mutexLock) {
      console.log('dequeue, waiting, l:', this.operations.length);
      // setTimeout(dequeue, 1000, uuid)
      return;
    }
    this.busy = false;
    if (this.operations.length > 0) {
      this.busy = true;
      this.exec();
    }
  }

  invalidate(uuid) {
    this.mutexLock = true;
    console.log('MUTEX LOCKED', this.operations.length);
    this.operations = this.operations.filter((op) => op.uuid !== uuid);
    this.mutexLock = false;
    console.log('MUTEX UNLOCKED', this.operations.length);
    this.dequeue();
  }
}

const queue = new Queue();

/// Emettitore degli eventi nativi
const bleEmitter = new NativeEventEmitter(BLE);
module.exports.emitter = bleEmitter;

/// aggancio ascoltatore connessione alla periferica fallita
bleEmitter.addListener(
  Defines.BLE_PERIPHERAL_CHARACTERISTIC_READ_OK,
  (event) => {
    const { uuid } = event;
    queue.dequeue(uuid);
  }
);
/// aggancio ascoltatore connessione alla periferica fallita
bleEmitter.addListener(
  Defines.BLE_PERIPHERAL_CHARACTERISTIC_READ_FAILED,
  (event) => {
    console.log('#################################### 000000000000000 ', event);
    const { uuid } = event;
    queue.dequeue(uuid);
  }
);
/// aggancio ascoltatore connessione alla periferica fallita
bleEmitter.addListener(
  Defines.BLE_PERIPHERAL_CHARACTERISTIC_WRITE_OK,
  (event) => {
    const { uuid } = event;
    queue.dequeue(uuid);
  }
);
/// aggancio ascoltatore connessione alla periferica fallita
bleEmitter.addListener(
  Defines.BLE_PERIPHERAL_CHARACTERISTIC_WRITE_FAILED,
  (event) => {
    const { uuid } = event;
    queue.dequeue(uuid);
  }
);

/// aggancio ascoltatore connessione alla periferica fallita
// bleEmitter.addListener(Defines.BLE_PERIPHERAL_NOTIFICATION_UPDATES, (event) => {
//   queue.dequeue(uuid)
// });
/// aggancio ascoltatore connessione alla periferica fallita
bleEmitter.addListener(Defines.BLE_PERIPHERAL_NOTIFICATION_CHANGED, (event) => {
  const { uuid } = event;
  queue.dequeue(uuid);
});
/// aggancio ascoltatore connessione alla periferica fallita
bleEmitter.addListener(
  Defines.BLE_PERIPHERAL_ENABLE_NOTIFICATION_FAILED,
  (event) => {
    const { uuid } = event;
    queue.dequeue(uuid);
  }
);

/**
 *
 */

function stopScan() {
  console.log('====> STOP SCAN');
  BLE.stopScan();
  clearTimeout(scanWatchDog);
  scanWatchDog = null;
  isScanning = false;
}

function cancel({ uuid }) {
  console.log('====> CANCEL CONN', uuid);
  invalideConnWatchdog(uuid);
  BLE.cancel(uuid);
}

function invalideConnWatchdog(uuid) {
  if (connectionWatchDog.has(uuid)) {
    console.log('- invalidate TIMER ', uuid);
    clearTimeout(connectionWatchDog.get(uuid));
    const deleted = connectionWatchDog.delete(uuid);
    console.log('- invalidate TIMER ', uuid, deleted);
  }
}

function startWatchdog(uuid) {
  console.log('+ startWatchdog ', uuid);
  for (const [key, value] of connectionWatchDog) {
    console.log(`!!!! ${key} = ${value}`);
  }
  connectionWatchDog.set(
    uuid,
    setTimeout(() => {
      console.log('====> 1 TIMEOUT CONNECTION', uuid);
      reconnectCount = null;
      cancel({ uuid });
    }, Defines.CONNECTION_TIMEOUT_MSEC)
  );
}

/// aggancio ascoltatore periferica connessa
bleEmitter.addListener(Defines.BLE_PERIPHERAL_CONNECTED, (event) => {
  reconnectCount = null;
  console.log('!! BLE_PERIPHERAL_CONNECTED ', event);
  const { uuid } = event;
  invalideConnWatchdog(uuid);
  startWatchdog(uuid);
});

/// aggancio ascoltatore periferica pronta
bleEmitter.addListener(Defines.BLE_PERIPHERAL_READY, (event) => {
  console.log('!! BLE_PERIPHERAL_READY ', event);
  const { uuid } = event;
  invalideConnWatchdog(uuid);
});

/// aggancio ascoltatore periferica pronta
bleEmitter.addListener(Defines.BLE_PERIPHERAL_FOUND, (event) => {
  console.log('!! BLE_PERIPHERAL_FOUND ', event);
});

/// aggancio ascoltatore periferica disconnessa
bleEmitter.addListener(Defines.BLE_PERIPHERAL_DISCONNECTED, (event) => {
  console.log('x BLE_PERIPHERAL_DISCONNECTED ', event);
  const { uuid } = event;
  if (reconnectCount !== null && reconnectCount > 0) {
    reconnectCount = reconnectCount - 1;
    BLE.connect(uuid);
    return;
  }
  reconnectCount = null;
  invalideConnWatchdog(uuid);
  queue.invalidate(uuid);
});

/// aggancio ascoltatore connessione alla periferica fallita
bleEmitter.addListener(Defines.BLE_PERIPHERAL_CONNECT_FAILED, (event) => {
  reconnectCount = null;
  const { uuid } = event;
  invalideConnWatchdog(uuid);
  console.log('x BLE_PERIPHERAL_CONNECT_FAILED ', event);
});

/// aggancio ascoltatore trovata nuova caratteristica
bleEmitter.addListener(
  Defines.BLE_PERIPHERAL_CHARACTERISTIC_DISCOVERED,
  (event) => {
    const { uuid } = event;
    // console.log('!! BLE_PERIPHERAL_CHARACTERISTIC_DISCOVERED ', event);
    invalideConnWatchdog(uuid);
    startWatchdog(uuid);
  }
);

/// Inizializzo il modulo nativo
BLE.setup();

/// funzione per ricavare lo stato dell'adattatore
module.exports.adapterStatusSync = async () => {
  try {
    return await BLE.statusSync();
  } catch (error) {
    return Defines.BLE_ADAPTER_STATUS_UNKNOW;
  }
};

/// funzione per ricavare lo stato dell'adattatore
module.exports.adapterStatus = () => BLE.status();

/// funzione per iniziare la scansione bluetooth
module.exports.startScan = ({
  services,
  filter,
  options,
  timeout = Defines.SCAN_TIMEOUT_MSEC,
}) => {
  if (isScanning) {
    stopScan();
  }
  filter = filter ? filter : undefined;
  services = services ? services : undefined;
  options = options ? options : scanOptions;
  console.log('====> SCAN START', options);
  BLE.startScan(services, filter, options);
  isScanning = true;
  if (timeout > 0) scanWatchDog = setTimeout(() => stopScan(), timeout);
};

/// funzione per interrompere la scansione bluetooth
module.exports.stopScan = () => stopScan();

/// funzione per interrompere la scansione bluetooth
module.exports.connect = ({
  uuid,
  maxRetryCount = Defines.DEFAULT_MAX_RETRY_COUNT,
}) => {
  if (connectionWatchDog.has(uuid)) {
    console.log('====> ESTABILISHING CONNECTION ', uuid);
    cancel({ uuid });
  }
  console.log('====> CONNECT', uuid);
  startWatchdog(uuid);
  BLE.connect(uuid);
  if (maxRetryCount > 0 && this.autoReconnect === null) {
    reconnectCount = maxRetryCount;
  }
};

/// funzione per interrompere la scansione bluetooth
module.exports.cancel = ({ uuid }) => cancel({ uuid });

/// funzione per interrompere la scansione bluetooth
module.exports.disconnect = ({ uuid }) => {
  console.log('====> DISCONNECT', uuid);
  invalideConnWatchdog(uuid);
  BLE.disconnect(uuid);
};

/// funzione per interrompere la scansione bluetooth
module.exports.getAllCharacteristic = async ({ uuid }) => {
  try {
    return await BLE.getAllCharacteristicSync(uuid);
  } catch (error) {
    return [];
  }
};

/// funzione per interrompere la scansione bluetooth
module.exports.readCharacteristic = ({ uuid, charUUID }) => {
  console.log('====> READ', charUUID);
  const task = () => BLE.readCharacteristicValue(uuid, charUUID);
  queue.enqueue(task, uuid);
};

/// funzione per interrompere la scansione bluetooth
module.exports.writeCharacteristic = ({ uuid, charUUID, value }) => {
  console.log('====> WRITE', charUUID);
  const task = () => BLE.writeCharacteristicValue(uuid, charUUID, value);
  queue.enqueue(task, uuid);
};

/// funzione per interrompere la scansione bluetooth
module.exports.changeCharacteristicNotification = ({
  uuid,
  charUUID,
  enable,
}) => {
  console.log('====> ENABLE', charUUID, enable);
  const task = () =>
    BLE.changeCharacteristicNotification(uuid, charUUID, enable);
  queue.enqueue(task, uuid);
};
