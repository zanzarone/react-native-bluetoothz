import { NativeModules, Platform } from 'react-native';
const Scheduler = require('./scheduler');
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

let bleEmitter;
let subscriptions = [];
/**
 *  ============  ================= ============
 *  ============                    ============
 *  ============      DEFINES       ============
 *  ============                    ============
 *  ============  ================= ============
 */
const DFU_ERROR_DEVICE_DISCONNECTED = Platform.OS === 'android' ? 4096 : 202;

const Defines = {
  SCAN_TIMEOUT_MSEC: 8000,
  CONNECTION_TIMEOUT_MSEC: 10000,
  DISCONNECT_TIMEOUT_MSEC: 5000,
  DISCOVER_TIMEOUT_MSEC: 15000,
  CHARS_OPERATION_TIMEOUT_MSEC: 10000,
  DEFAULT_MAX_RETRY_COUNT: 5,
  DFU_ERROR_DEVICE_DISCONNECTED,
  DFU_SCAN_FAILED: 'DFU_SCAN_FAILED',
  DFU_INTERFACE_NOT_FOUND: 'DFU_INTERFACE_NOT_FOUND',
  DFU_INTERFACE_CONNECT_FAILED: 'DFU_INTERFACE_CONNECT_FAILED',
  DFU_INTERFACE_FOUND: 'DFU_INTERFACE_FOUND',
  ...BLE.getConstants(),
};
module.exports.Defines = Defines;

//@ Inizializzo le variabili di stato
let reconnect = null;
let scanWatchDog = null;
let connectionWatchDog = new Map();
let isScanning = false;
const scanOptions = { allowDuplicates: false };
const dfuOptions = {
  enableDebug: false,
  packetDelay: 300,
};
module.exports.scanOptions = Object.freeze(scanOptions);
module.exports.dfuOptions = Object.freeze(dfuOptions);

const scheduler = new Scheduler();

/**
 *?  ============  ==================  ============
 *?  ============                      ============
 *?  ============  EXPORTED FUNCTIONS  ============
 *?  ============                      ============
 *?  ============  ==================  ============
 */

module.exports.configure = (nativeEventEmitter) => {
  //? se la configure viene chiamata nuovamente, devo assicurarmi che i listeners
  //? dell'istanza precedente siano stati rimossi
  if (subscriptions?.length) {
    for (let i = 0; i < subscriptions.length; i++) {
      subscriptions[i]?.remove();
    }
    subscriptions = [];
  }

  bleEmitter = new nativeEventEmitter(BLE);

  /**
   *?  ============  ================= ============
   *?  ============                    ============
   *?  ============      LISTENERS     ============
   *?  ============                    ============
   *?  ============  ================= ============
   */

  /// aggancio ascoltatore connessione alla periferica fallita
  subscriptions.push(
    bleEmitter.addListener(
      Defines.BLE_PERIPHERAL_CHARACTERISTIC_READ_OK,
      (event) => {
        const { uuid } = event;
        scheduler.dequeue();
      }
    )
  );

  /// aggancio ascoltatore connessione alla periferica fallita
  subscriptions.push(
    bleEmitter.addListener(
      Defines.BLE_PERIPHERAL_CHARACTERISTIC_READ_FAILED,
      (event) => {
        console.log(
          '#################################### 000000000000000 ',
          event
        );
        const { uuid } = event;
        scheduler.dequeue();
      }
    )
  );
  /// aggancio ascoltatore connessione alla periferica fallita
  subscriptions.push(
    bleEmitter.addListener(
      Defines.BLE_PERIPHERAL_CHARACTERISTIC_WRITE_OK,
      (event) => {
        const { uuid } = event;
        scheduler.dequeue();
      }
    )
  );

  /// aggancio ascoltatore connessione alla periferica fallita
  subscriptions.push(
    bleEmitter.addListener(
      Defines.BLE_PERIPHERAL_CHARACTERISTIC_WRITE_FAILED,
      (event) => {
        const { uuid } = event;
        scheduler.dequeue();
      }
    )
  );

  /// aggancio ascoltatore connessione alla periferica fallita
  subscriptions.push(
    bleEmitter.addListener(
      Defines.BLE_PERIPHERAL_NOTIFICATION_CHANGED,
      (event) => {
        const { uuid } = event;
        scheduler.dequeue();
      }
    )
  );

  /// aggancio ascoltatore connessione alla periferica fallita
  subscriptions.push(
    bleEmitter.addListener(
      Defines.BLE_PERIPHERAL_ENABLE_NOTIFICATION_FAILED,
      (event) => {
        const { uuid } = event;
        scheduler.dequeue();
      }
    )
  );

  /// aggancio ascoltatore periferica connessa
  subscriptions.push(
    bleEmitter.addListener(Defines.BLE_PERIPHERAL_CONNECTED, (event) => {
      console.log('!! BLE_PERIPHERAL_CONNECTED ', event);
      reconnect = null;
      const { uuid } = event;
      stopConnWatchdog(uuid);
    })
  );

  /// aggancio ascoltatore periferica connessa
  subscriptions.push(
    bleEmitter.addListener(
      Defines.BLE_PERIPHERAL_DISCONNECT_FAILED,
      (event) => {
        const { uuid, error } = event;
        console.log('!! BLE_PERIPHERAL_DISCONNECT_FAILED ', uuid, error);
      }
    )
  );

  /// aggancio ascoltatore periferica pronta
  subscriptions.push(
    bleEmitter.addListener(Defines.BLE_PERIPHERAL_READY, (event) => {
      console.log('!! BLE_PERIPHERAL_READY ', event);
      const { uuid } = event;
    })
  );

  /// aggancio ascoltatore periferica pronta
  subscriptions.push(
    bleEmitter.addListener(Defines.BLE_PERIPHERAL_FOUND, (event) => {
      console.log('!! BLE_PERIPHERAL_FOUND ', event);
    })
  );

  /// aggancio ascoltatore periferica disconnessa
  subscriptions.push(
    bleEmitter.addListener(Defines.BLE_PERIPHERAL_DISCONNECTED, (event) => {
      console.log('x BLE_PERIPHERAL_DISCONNECTED ', event);
      const { uuid } = event;
      if (reconnect?.count > 0) {
        console.log('====> REDO CONNECT', uuid, reconnect?.count - 1);
        connect({
          uuid,
          enableDiscover: reconnect?.enableDiscover,
          maxRetryCount: reconnect?.count - 1,
        });
        return;
      }
      reconnect = null;
      stopConnWatchdog(uuid);
      /// devo chiamare la invalidate, perche se il dispositivo che si è disconnesso aveva delle operazioni
      /// pendenti, le devo rimuovere
      scheduler.invalidate(uuid);
    })
  );

  /// aggancio ascoltatore connessione alla periferica fallita
  subscriptions.push(
    bleEmitter.addListener(Defines.BLE_PERIPHERAL_CONNECT_FAILED, (event) => {
      reconnect = null;
      const { uuid } = event;
      stopConnWatchdog(uuid);
      console.log('x BLE_PERIPHERAL_CONNECT_FAILED ', event);
    })
  );

  /// aggancio ascoltatore trovata nuova caratteristica
  subscriptions.push(
    bleEmitter.addListener(
      Defines.BLE_PERIPHERAL_CHARACTERISTIC_DISCOVERED,
      (event) => {
        const { uuid } = event;
        // console.log('!! BLE_PERIPHERAL_CHARACTERISTIC_DISCOVERED ', event);
      }
    )
  );

  /// Inizializzo il modulo nativo
  BLE.setup();
};

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

module.exports.isConnectedSync = async ({ uuid }) => {
  if (!uuid) {
    throw new Error('Parameter UUID is mandatory');
  }
  return BLE.isConnectedSync(uuid);
};

module.exports.isDfuCompliantSync = async ({ uuid }) => {
  if (!uuid) {
    throw new Error('Parameter UUID is mandatory');
  }
  return BLE.isDfuCompliantSync(uuid);
};

/**
 *?  ============  ================= ============
 *?  ============                    ============
 *?  ============  PRIVATE FUNCTIONS ============
 *?  ============                    ============
 *?  ============  ================= ============
 */

function stopConnWatchdog(uuid) {
  if (connectionWatchDog.has(uuid)) {
    console.log('- invalidate TIMER ', uuid);
    clearTimeout(connectionWatchDog.get(uuid));
    const deleted = connectionWatchDog.delete(uuid);
    console.log('- invalidate TIMER ', uuid, deleted);
  }
}

// function stopDiscoverWatchdog(uuid) {
//   if (discoverWatchDog.has(uuid)) {
//     console.log('discoverWatchDog - invalidate TIMER ', uuid);
//     clearTimeout(discoverWatchDog.get(uuid));
//     const deleted = discoverWatchDog.delete(uuid);
//     console.log('discoverWatchDog - invalidate TIMER ', uuid, deleted);
//   }
// }

function startConnWatchdog(uuid) {
  console.log('+ startConnWatchdog ', uuid);
  for (const [key, value] of connectionWatchDog) {
    console.log(`!!!! ${key} = ${value}`);
  }
  connectionWatchDog.set(
    uuid,
    setTimeout(() => {
      console.log('====> 1 TIMEOUT CONNECTION', uuid);
      reconnect = null;
      cancelConnection({ uuid });
    }, Defines.CONNECTION_TIMEOUT_MSEC)
  );
}

// function startDiscoverWatchdog(uuid) {
//   console.log('+ discoverWatchDog ', uuid);
//   for (const [key, value] of discoverWatchDog) {
//     console.log(`!!!! ${key} = ${value}`);
//   }
//   discoverWatchDog.set(
//     uuid,
//     setTimeout(() => {
//       console.log('====> discoverWatchDog TIMEOUT CONNECTION', uuid);
//     }, Defines.CONNECTION_TIMEOUT_MSEC)
//   );
// }

function stopScan() {
  console.log('====> STOP SCAN');
  BLE.stopScan();
  clearTimeout(scanWatchDog);
  scanWatchDog = null;
  isScanning = false;
}

function cancelConnection({ uuid }) {
  if (!uuid) {
    throw new Error('Parameters UUID is mandatory');
  }
  console.log('====> CANCEL CONN', uuid);
  stopConnWatchdog(uuid);
  BLE.cancel(uuid);
}

function connect({
  uuid,
  enableDiscover = true,
  maxRetryCount = Defines.DEFAULT_MAX_RETRY_COUNT,
}) {
  if (!uuid) {
    throw new Error('Parameters UUID is mandatory');
  }
  if (connectionWatchDog.has(uuid)) {
    console.log('====> Cancel previous connection ', uuid);
    cancelConnection({ uuid });
  }
  console.log('====> CONNECT', uuid);
  startConnWatchdog(uuid);
  BLE.connect(uuid, enableDiscover);
  reconnect = {
    count: maxRetryCount > 0 ? maxRetryCount : null,
    enableDiscover,
  };
}

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

module.exports.startScanSync = async ({
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
  console.log('====> SCAN START SYNC', options);
  const stopScanSignal = new Promise((resolve, reject) => {
    setTimeout(() => stopScan(), timeout);
  });
  isScanning = true;
  return Promise.race([
    BLE.startScanSync(services, filter, options),
    stopScanSignal,
  ]);
};

//@ funzione per interrompere la scansione bluetooth
module.exports.stopScan = () => stopScan();

/// funzione per interrompere la scansione bluetooth
module.exports.connect = ({
  uuid,
  enableDiscover,
  maxRetryCount = Defines.DEFAULT_MAX_RETRY_COUNT,
}) => connect({ uuid, enableDiscover, maxRetryCount });

module.exports.connectSync = async ({ uuid }) => {
  if (!uuid) {
    throw new Error('Parameters UUID is mandatory');
  }
  const newUuid = uuid.toUpperCase();
  const cancelSignal = new Promise((resolve, reject) => {
    setTimeout(
      () => reject(Defines.BLE_PERIPHERAL_CONNECT_FAILED),
      Defines.CONNECTION_TIMEOUT_MSEC
    );
  });
  return Promise.race([BLE.connectSync(newUuid), cancelSignal]);
};

///@ funzione per cancellare una connessione pendente
module.exports.cancel = ({ uuid }) => cancelConnection({ uuid });

//! funzioni disponibili solo per Android
if (Platform.OS === 'android') {
  ///@ funzione per interrompere la scansione bluetooth
  module.exports.requestMtu = ({ uuid, mtu }) => {
    if (!uuid) {
      throw new Error('Parameters UUID is mandatory');
    }
    BLE.requestMtu(uuid, mtu);
  };
  //@ funzione per interrompere la scansione bluetooth
  module.exports.requestConnectionPriority = ({ uuid, priority }) => {
    if (!uuid) {
      throw new Error('Parameters UUID is mandatory');
    }
    BLE.requestConnectionPriority(uuid, priority);
  };
}

///@ funzione per disconnettere una periferica
module.exports.disconnect = ({ uuid }) => {
  if (!uuid) {
    throw new Error('Parameters UUID is mandatory');
  }
  console.log('====> DISCONNECT', uuid);
  stopConnWatchdog(uuid);
  BLE.disconnect(uuid);
};

///@ funzione per disconnettere una periferica
module.exports.disconnectSync = ({ uuid }) => {
  if (!uuid) {
    throw new Error('Parameters UUID is mandatory');
  }
  console.log('====> DISCONNECT', uuid);
  const cancelSignal = new Promise((resolve, reject) => {
    setTimeout(
      () => reject(Defines.BLE_PERIPHERAL_DISCONNECT_FAILED),
      Defines.DISCONNECT_TIMEOUT_MSEC
    );
  });
  return Promise.race([BLE.disconnectSync(uuid), cancelSignal]);
};

//@ funzione per interrompere la scansione bluetooth
module.exports.discoverSync = ({ uuid }) => {
  if (!uuid) {
    throw new Error('Parameters UUID is mandatory');
  }
  const cancelSignal = new Promise((resolve, reject) => {
    setTimeout(
      () => reject(Defines.BLE_PERIPHERAL_DISCOVER_FAILED),
      Defines.DISCOVER_TIMEOUT_MSEC
    );
  });
  return Promise.race([BLE.discoverSync(uuid), cancelSignal]);
};

/// funzione per interrompere la scansione bluetooth
module.exports.getAllCharacteristicSync = async ({ uuid }) => {
  if (!uuid) {
    throw new Error('Parameters UUID is mandatory');
  }
  const cancelSignal = new Promise((resolve, reject) => {
    setTimeout(
      () => reject(Defines.BLE_PERIPHERAL_CHARACTERISTIC_RETRIEVE_FAILED),
      Defines.DISCOVER_TIMEOUT_MSEC
    );
  });
  return Promise.race([BLE.getAllCharacteristicSync(uuid), cancelSignal]);
};

/// funzione per interrompere la scansione bluetooth
module.exports.getAllServicesSync = async ({ uuid }) => {
  if (!uuid) {
    throw new Error('Parameters UUID is mandatory');
  }
  const cancelSignal = new Promise((resolve, reject) => {
    setTimeout(
      () => reject(Defines.BLE_PERIPHERAL_SERVICES_RETRIEVE_FAILED),
      Defines.DISCOVER_TIMEOUT_MSEC
    );
  });
  return Promise.race([BLE.getAllServicesSync(uuid), cancelSignal]);
};

/// funzione per interrompere la scansione bluetooth
module.exports.readCharacteristic = ({ uuid, charUUID }) => {
  if (!uuid || !charUUID) {
    throw new Error('Parameters UUID, charsUUID are mandatory');
  }
  console.log('====> READ', charUUID);
  const task = () => BLE.readCharacteristicValue(uuid, charUUID);
  scheduler.enqueue(task, uuid);
};

/// funzione per interrompere la scansione bluetooth
module.exports.readCharacteristicSync = async ({ uuid, charUUID }) => {
  if (!uuid || !charUUID) {
    throw new Error('Parameters UUID, charsUUID are mandatory');
  }
  const cancelSignal = new Promise((_, reject) => {
    setTimeout(
      () => reject(Defines.BLE_PERIPHERAL_CHARACTERISTIC_READ_FAILED),
      Defines.CHARS_OPERATION_TIMEOUT_MSEC
    );
  });
  return Promise.race([
    BLE.readCharacteristicValueSync(uuid, charUUID),
    cancelSignal,
  ]);
};

/// funzione per interrompere la scansione bluetooth
module.exports.writeCharacteristic = ({ uuid, charUUID, value }) => {
  if (!uuid || !charUUID || value === undefined) {
    throw new Error('Parameters UUID, charsUUID and value are mandatory');
  }
  console.log('====> WRITE', charUUID);
  const task = () => BLE.writeCharacteristicValue(uuid, charUUID, value);
  scheduler.enqueue(task, uuid);
};

/// funzione per interrompere la scansione bluetooth
module.exports.writeCharacteristicSync = async ({ uuid, charUUID, value }) => {
  if (!uuid || !charUUID || value === undefined) {
    throw new Error('Parameters UUID, charsUUID and value are mandatory');
  }
  const cancelSignal = new Promise((_, reject) => {
    setTimeout(
      () => reject(Defines.BLE_PERIPHERAL_CHARACTERISTIC_WRITE_FAILED),
      Defines.CHARS_OPERATION_TIMEOUT_MSEC
    );
  });
  return Promise.race([
    BLE.writeCharacteristicValue(uuid, charUUID, value),
    cancelSignal,
  ]);
};

/// funzione per interrompere la scansione bluetooth
module.exports.changeCharacteristicNotification = ({
  uuid,
  charUUID,
  enable,
}) => {
  if (!uuid || !charUUID || enable === undefined) {
    throw new Error('Parameters UUID, charsUUID and value are mandatory');
  }
  console.log('====> ENABLE', charUUID, enable);
  const task = () =>
    BLE.changeCharacteristicNotification(uuid, charUUID, enable);
  scheduler.enqueue(task, uuid);
};

/**
 *?  ============  ================= ============
 *?  ============                    ============
 *?  ============  DFU               ============
 *?  ============                    ============
 *?  ============  ================= ============
 */

module.exports.startDFU = ({
  uuid,
  filePath,
  pathType = Defines.FILE_PATH_TYPE_STRING,
  options = dfuOptions,
}) => {
  if (!uuid) {
    throw new Error('Parameter UUID is mandatory');
  }
  if (Platform.OS !== 'ios' && Platform.OS !== 'android') {
    throw new Error('Platform not supported (not android or ios)');
  }
  if (
    pathType !== Defines.FILE_PATH_TYPE_STRING &&
    pathType !== Defines.FILE_PATH_TYPE_URL
  ) {
    throw new Error(
      `Path type not supported. Types available: ${Defines.FILE_PATH_TYPE_STRING}, ${Defines.FILE_PATH_TYPE_URL}`
    );
  }
  BLE.startDFU(uuid, filePath, pathType, options);
};

module.exports.pauseDFU = ({ uuid }) => {
  if (!uuid) {
    throw new Error('Parameter UUID is mandatory');
  }
  BLE.pauseDFU(uuid);
};

module.exports.resumeDFU = ({ uuid }) => {
  if (!uuid) {
    throw new Error('Parameter UUID is mandatory');
  }
  BLE.resumeDFU(uuid);
};

module.exports.abortDFU = ({ uuid }) => {
  if (!uuid) {
    throw new Error('Parameter UUID is mandatory');
  }
  BLE.abortDFU(uuid);
};

module.exports.emitter = function () {
  return bleEmitter;
};
