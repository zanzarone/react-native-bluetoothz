import { NativeModules, Platform, NativeEventEmitter } from 'react-native';
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

/**
 *  ============  ================= ============
 *  ============                    ============
 *  ============      DEFINES       ============
 *  ============                    ============
 *  ============  ================= ============
 */
const DFU_ERROR_DEVICE_DISCONNECTED = Platform.OS === 'android' ? 4096 : 202;

const Defines = {
  CONNECTION_TIMEOUT_MSEC: 10000,
  SCAN_TIMEOUT_MSEC: 8000,
  DEFAULT_MAX_RETRY_COUNT: 5,
  DFU_ERROR_DEVICE_DISCONNECTED,
  DFU_SCAN_FAILED: 'DFU_SCAN_FAILED',
  DFU_INTERFACE_NOT_FOUND: 'DFU_INTERFACE_NOT_FOUND',
  DFU_INTERFACE_CONNECT_FAILED: 'DFU_INTERFACE_CONNECT_FAILED',
  ...BLE.getConstants(),
};
module.exports.Defines = Defines;

/// Inizializzo le variabili di stato
let reconnectCount = null;
let scanWatchDog = null;
let connectionWatchDog = new Map();
let isScanning = false;
let dfuRetryOptions = null;
const scanOptions = { allowDuplicates: false };
const dfuOptions = {
  enableDebug: false,
  packetDelay: 300,
};
module.exports.scanOptions = Object.freeze(scanOptions);
module.exports.dfuOptions = Object.freeze(dfuOptions);

const scheduler = new Scheduler();

/**
 *  ============  ================= ============
 *  ============                    ============
 *  ============      LISTENERS     ============
 *  ============                    ============
 *  ============  ================= ============
 */

/// Emettitore degli eventi nativi
const bleEmitter = new NativeEventEmitter(BLE);
module.exports.emitter = bleEmitter;

/// aggancio ascoltatore connessione alla periferica fallita
bleEmitter.addListener(
  Defines.BLE_PERIPHERAL_CHARACTERISTIC_READ_OK,
  (event) => {
    const { uuid } = event;
    scheduler.dequeue();
  }
);

/// aggancio ascoltatore connessione alla periferica fallita
bleEmitter.addListener(
  Defines.BLE_PERIPHERAL_CHARACTERISTIC_READ_FAILED,
  (event) => {
    console.log('#################################### 000000000000000 ', event);
    const { uuid } = event;
    scheduler.dequeue();
  }
);

/// aggancio ascoltatore connessione alla periferica fallita
bleEmitter.addListener(
  Defines.BLE_PERIPHERAL_CHARACTERISTIC_WRITE_OK,
  (event) => {
    const { uuid } = event;
    scheduler.dequeue();
  }
);

/// aggancio ascoltatore connessione alla periferica fallita
bleEmitter.addListener(
  Defines.BLE_PERIPHERAL_CHARACTERISTIC_WRITE_FAILED,
  (event) => {
    const { uuid } = event;
    scheduler.dequeue();
  }
);

/// aggancio ascoltatore connessione alla periferica fallita
bleEmitter.addListener(Defines.BLE_PERIPHERAL_NOTIFICATION_CHANGED, (event) => {
  const { uuid } = event;
  scheduler.dequeue();
});

/// aggancio ascoltatore connessione alla periferica fallita
bleEmitter.addListener(
  Defines.BLE_PERIPHERAL_ENABLE_NOTIFICATION_FAILED,
  (event) => {
    const { uuid } = event;
    scheduler.dequeue();
  }
);

bleEmitter.addListener(
  Defines.BLE_PERIPHERAL_DFU_PROCESS_FAILED,
  async (event) => {
    console.log('DFU RETRY =======================> 0.', event);
    if (
      event?.errorCode === DFU_ERROR_DEVICE_DISCONNECTED &&
      dfuRetryOptions !== null
    ) {
      const { uuid } = event;
      /// 1. incremento l'uuid(MAC addr + 1)
      const newUUID = incrementMacAddress(uuid);
      console.log('DFU RETRY =======================> 1.', newUUID);
      /// 2. se la piattaforma e' Android devo connettermi
      if (Platform.OS === 'android') {
        console.log(
          'DFU RETRY =======================> Android, provo a riconnettere 2.',
          newUUID
        );
        /// 3. prima scansiono e cerco newUuid
        let devices = [];
        bleEmitter.emit(Defines.BLE_PERIPHERAL_DFU_STATUS_SCANNING, { uuid });
        try {
          devices = await startScanSync({});
        } catch (error) {
          console.log(
            'DFU RETRY =======================> Android, riconnes. errore 3.',
            error
          );
          bleEmitter.emit(Defines.DFU_SCAN_FAILED, { uuid });
          return;
        }
        devices = devices.filter(
          (d) => d.uuid.toLowerCase() === newUUID.toLowerCase()
        );
        if (devices.length <= 0) {
          console.log(
            'DFU RETRY =======================> Android, riconnes. errore 4.'
          );
          bleEmitter.emit(Defines.DFU_INTERFACE_NOT_FOUND, { uuid });
          return;
        }
        let device = devices.shift();
        console.log(
          'DFU RETRY =======================> PROVO DI NUOVO! 4.5',
          device
        );
        bleEmitter.emit(Defines.BLE_PERIPHERAL_DFU_STATUS_DFU_INTERFACE_FOUND, {
          uuid,
        });
        try {
          await connectSync({ uuid: device.uuid });
          console.log('DFU RETRY =======================> PROVO DI NUOVO! 6.');
        } catch (error) {
          console.log(
            'DFU RETRY =======================> Android, riconnes. errore 5.',
            error
          );
          bleEmitter.emit(Defines.DFU_INTERFACE_CONNECT_FAILED, { uuid });
          return;
        }
      }
      /// 3. provo ad effettuare nuovamente la proc DFU
      startDFU({
        uuid: newUUID,
        filePath: dfuRetryOptions.filePath,
        pathType: dfuRetryOptions.pathType,
        retryOnDisconnectionError: false,
        options: dfuRetryOptions.options,
      });
    }
  }
);

/// aggancio ascoltatore periferica connessa
bleEmitter.addListener(Defines.BLE_PERIPHERAL_CONNECTED, (event) => {
  console.log('!! BLE_PERIPHERAL_CONNECTED ', event);
  reconnectCount = null;
  const { uuid } = event;
  stopConnWatchdog(uuid);
  startConnWatchdog(uuid);
});

/// aggancio ascoltatore periferica pronta
bleEmitter.addListener(Defines.BLE_PERIPHERAL_READY, (event) => {
  console.log('!! BLE_PERIPHERAL_READY ', event);
  const { uuid } = event;
  stopConnWatchdog(uuid);
});

/// aggancio ascoltatore periferica pronta
bleEmitter.addListener(Defines.BLE_PERIPHERAL_FOUND, (event) => {
  console.log('!! BLE_PERIPHERAL_FOUND ', event);
});

/// aggancio ascoltatore periferica disconnessa
bleEmitter.addListener(Defines.BLE_PERIPHERAL_DISCONNECTED, (event) => {
  console.log('x BLE_PERIPHERAL_DISCONNECTED ', event);
  const { uuid } = event;
  if (reconnectCount > 0) {
    console.log('====> REDO CONNECT', uuid, reconnectCount - 1);
    connect({ uuid, maxRetryCount: reconnectCount - 1 });
    return;
  }
  reconnectCount = null;
  stopConnWatchdog(uuid);
  /// devo chiamare la invalidate, perche se il dispositivo che si è disconnesso aveva delle operazioni
  /// pendenti, le devo rimuovere
  scheduler.invalidate(uuid);
});

/// aggancio ascoltatore connessione alla periferica fallita
bleEmitter.addListener(Defines.BLE_PERIPHERAL_CONNECT_FAILED, (event) => {
  reconnectCount = null;
  const { uuid } = event;
  stopConnWatchdog(uuid);
  console.log('x BLE_PERIPHERAL_CONNECT_FAILED ', event);
});

/// aggancio ascoltatore trovata nuova caratteristica
bleEmitter.addListener(
  Defines.BLE_PERIPHERAL_CHARACTERISTIC_DISCOVERED,
  (event) => {
    const { uuid } = event;
    // console.log('!! BLE_PERIPHERAL_CHARACTERISTIC_DISCOVERED ', event);
    stopConnWatchdog(uuid);
    startConnWatchdog(uuid);
  }
);

/**
 *  ============  ================= ============
 *  ============                    ============
 *  ============  PRIVATE FUNCTIONS ============
 *  ============                    ============
 *  ============  ================= ============
 */

function stopConnWatchdog(uuid) {
  if (connectionWatchDog.has(uuid)) {
    console.log('- invalidate TIMER ', uuid);
    clearTimeout(connectionWatchDog.get(uuid));
    const deleted = connectionWatchDog.delete(uuid);
    console.log('- invalidate TIMER ', uuid, deleted);
  }
}

function startConnWatchdog(uuid) {
  console.log('+ startConnWatchdog ', uuid);
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

function incrementMacAddress(macAddress) {
  // Dividiamo l'indirizzo MAC in coppie di caratteri
  const macParts = macAddress.split(':');
  // Convertiamo ogni parte dell'indirizzo MAC in un numero intero esadecimale
  const decimalParts = macParts.map((part) => parseInt(part, 16));
  let index = decimalParts.length - 1;
  // Incrementiamo l'ultimo numero intero di 1
  decimalParts[index] += 1;

  while (index >= 0) {
    if (decimalParts[index] > 255) {
      decimalParts[index] = 0;
      if (index - 1 >= 0) decimalParts[index - 1] += 1;
    }
    index--;
  }
  // Convertiamo i numeri decimali in stringhe esadecimali a 2 cifre
  const incrementedParts = decimalParts.map((part) =>
    part.toString(16).padStart(2, '0')
  );
  // Uniamo le parti dell'indirizzo MAC in una stringa con i due punti
  const incrementedMacAddress = incrementedParts.join(':');
  return incrementedMacAddress.toUpperCase();
}

function stopScan() {
  console.log('====> STOP SCAN');
  BLE.stopScan();
  clearTimeout(scanWatchDog);
  scanWatchDog = null;
  isScanning = false;
}

function cancel({ uuid }) {
  if (!uuid) {
    throw new Error('Parameters UUID is mandatory');
  }
  console.log('====> CANCEL CONN', uuid);
  stopConnWatchdog(uuid);
  BLE.cancel(uuid);
}

/// funzione per interrompere la scansione bluetooth
async function startDFU({
  uuid,
  filePath,
  pathType = Defines.FILE_PATH_TYPE_STRING,
  retryOnDisconnectionError = true,
  options = dfuOptions,
}) {
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
  if (retryOnDisconnectionError) {
    dfuRetryOptions = { filePath, pathType, options };
  } else {
    dfuRetryOptions = null;
  }
  BLE.startDFU(uuid, filePath, pathType, options);
}

function connect({ uuid, maxRetryCount = Defines.DEFAULT_MAX_RETRY_COUNT }) {
  if (!uuid) {
    throw new Error('Parameters UUID is mandatory');
  }
  if (connectionWatchDog.has(uuid)) {
    console.log('====> ESTABILISHING CONNECTION ', uuid);
    cancel({ uuid });
  }
  console.log('====> CONNECT', uuid);
  startConnWatchdog(uuid);
  BLE.connect(uuid);
  reconnectCount = maxRetryCount > 0 ? maxRetryCount : null;
}

async function connectSync({ uuid }) {
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
}

async function startScanSync({
  services,
  filter,
  options,
  timeout = Defines.SCAN_TIMEOUT_MSEC,
}) {
  if (isScanning) {
    stopScan();
  }
  filter = filter ? filter : undefined;
  services = services ? services : undefined;
  options = options ? options : scanOptions;
  console.log('====> SCAN START', options);
  const stopScanSignal = new Promise((resolve, reject) => {
    setTimeout(() => stopScan(), timeout);
  });
  isScanning = true;
  return Promise.race([
    BLE.startScanSync(services, filter, options),
    stopScanSignal,
  ]);
}

/**
 *  ============  ==================  ============
 *  ============                      ============
 *  ============  EXPORTED FUNCTIONS  ============
 *  ============                      ============
 *  ============  ==================  ============
 */

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

module.exports.startScanSync = async ({
  services,
  filter,
  options,
  timeout = Defines.SCAN_TIMEOUT_MSEC,
}) =>
  startScanSync({
    services,
    filter,
    options,
    timeout,
  });

/// funzione per interrompere la scansione bluetooth
module.exports.stopScan = () => stopScan();

/// funzione per interrompere la scansione bluetooth
module.exports.connect = ({
  uuid,
  maxRetryCount = Defines.DEFAULT_MAX_RETRY_COUNT,
}) => connect({ uuid, maxRetryCount });

module.exports.connectSync = async ({ uuid }) => connectSync({ uuid });

/// funzione per interrompere la scansione bluetooth
module.exports.cancel = ({ uuid }) => cancel({ uuid });

/// funzione per interrompere la scansione bluetooth
module.exports.disconnect = ({ uuid }) => {
  if (!uuid) {
    throw new Error('Parameters UUID is mandatory');
  }
  console.log('====> DISCONNECT', uuid);
  stopConnWatchdog(uuid);
  BLE.disconnect(uuid);
};

/// funzione per interrompere la scansione bluetooth
module.exports.getAllCharacteristic = async ({ uuid }) => {
  if (!uuid) {
    throw new Error('Parameters UUID is mandatory');
  }
  try {
    return await BLE.getAllCharacteristicSync(uuid);
  } catch (error) {
    return [];
  }
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
module.exports.writeCharacteristic = ({ uuid, charUUID, value }) => {
  if (!uuid || !charUUID || value === undefined) {
    throw new Error('Parameters UUID, charsUUID and value are mandatory');
  }
  console.log('====> WRITE', charUUID);
  const task = () => BLE.writeCharacteristicValue(uuid, charUUID, value);
  scheduler.enqueue(task, uuid);
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

module.exports.startDFU = startDFU;

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

/// Inizializzo il modulo nativo
BLE.setup();
