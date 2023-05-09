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
let connectionWatchDog = null;
let isScanning = false;
const scanOptions = { allowDuplicates: false };

module.exports.scanOptions = () => Object.freeze(scanOptions);

/// Emettitore degli eventi nativi
const bleEmitter = new NativeEventEmitter(BLE);
module.exports.emitter = bleEmitter;

/// aggancio ascoltatore periferica connessa
bleEmitter.addListener(Defines.BLE_PERIPHERAL_CONNECTED, (event) => {
  reconnectCount = null;
  console.log('!! BLE_PERIPHERAL_CONNECTED ', event);
  clearTimeout(connectionWatchDog);
  connectionWatchDog = setTimeout(() => {
    console.log('====> 1 TIMEOUT CONNECTION', uuid);
    const { uuid } = event;
    reconnectCount = null;
    BLE.cancel(uuid);
  }, Defines.CONNECTION_TIMEOUT_MSEC);
});

/// aggancio ascoltatore periferica pronta
bleEmitter.addListener(Defines.BLE_PERIPHERAL_READY, (event) => {
  console.log('!! BLE_PERIPHERAL_READY ', event);
  clearTimeout(connectionWatchDog);
  connectionWatchDog = null;
});

/// aggancio ascoltatore periferica pronta
bleEmitter.addListener(Defines.BLE_PERIPHERAL_FOUND, (event) => {
  console.log('!! BLE_PERIPHERAL_FOUND ', event);
});

/// aggancio ascoltatore periferica disconnessa
bleEmitter.addListener(Defines.BLE_PERIPHERAL_DISCONNECTED, (event) => {
  console.log('x BLE_PERIPHERAL_DISCONNECTED ', this.autoReconnect);
  if (reconnectCount !== null && reconnectCount > 0) {
    reconnectCount = reconnectCount - 1;
    BLE.connect(event.uuid);
    return;
  }
  reconnectCount = null;
  clearTimeout(connectionWatchDog);
  connectionWatchDog = null;
});

/// aggancio ascoltatore connessione alla periferica fallita
bleEmitter.addListener(Defines.BLE_PERIPHERAL_CONNECT_FAILED, (event) => {
  reconnectCount = null;
  clearTimeout(connectionWatchDog);
  connectionWatchDog = null;
  console.log('x BLE_PERIPHERAL_CONNECT_FAILED ', event);
});

/// aggancio ascoltatore trovata nuova caratteristica
bleEmitter.addListener(
  Defines.BLE_PERIPHERAL_CHARACTERISTIC_DISCOVERED,
  (event) => {
    // console.log('!! BLE_PERIPHERAL_CHARACTERISTIC_DISCOVERED ', event);
    clearTimeout(connectionWatchDog);
    connectionWatchDog = setTimeout(() => {
      console.log('====> 1 TIMEOUT CONNECTION', uuid);
      const { uuid } = event;
      reconnectCount = null;
      BLE.cancel(uuid);
    }, Defines.CONNECTION_TIMEOUT_MSEC);
  }
);

/// Inizializzo il modulo nativo
BLE.setup();

const stopScan = () => {
  console.log('====> STOP SCAN');
  BLE.stopScan();
  clearTimeout(scanWatchDog);
  scanWatchDog = null;
  isScanning = false;
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
  console.log('====> SCAN START');
  filter = filter ? filter : null;
  BLE.startScan(services, filter, options ? options : scanOptions);
  isScanning = true;
  if (timeout > 0) scanWatchDog = setTimeout(() => stopScan(), timeout);
};

/// funzione per interrompere la scansione bluetooth
module.exports.stopScan = () => stopScan();

/// funzione per interrompere la scansione bluetooth
module.exports.connect = ({ uuid, maxRetryCount }) => {
  console.log('====> CONNECT', uuid);
  BLE.connect(uuid);
  clearTimeout(this.connectionTimer);
  connectionWatchDog = setTimeout(() => {
    console.log('====> 1 TIMEOUT CONNECTION', uuid);
    reconnectCount = null;
    BLE.cancel(uuid);
  }, Defines.CONNECTION_TIMEOUT_MSEC);
  if (maxRetryCount > 0 && this.autoReconnect === null) {
    reconnectCount = maxRetryCount;
  }
};

/// funzione per interrompere la scansione bluetooth
module.exports.cancel = ({ uuid }) => {
  console.log('====> CANCEL CONN', uuid);
  BLE.cancel(uuid);
};

/// funzione per interrompere la scansione bluetooth
module.exports.disconnect = ({ uuid }) => {
  console.log('====> DISCONNECT', uuid);
  BLE.disconnect(uuid);
};

/// funzione per interrompere la scansione bluetooth
module.exports.readCharacteristic = ({ uuid, charUUID }) => {
  console.log('====> READ', charUUID);
  BLE.readCharacteristicValue(uuid, charUUID);
};

/// funzione per interrompere la scansione bluetooth
module.exports.changeCharacteristicNotification = ({
  uuid,
  charUUID,
  enable,
}) => {
  console.log('====> ENABLE', charUUID, enable);
  BLE.changeCharacteristicNotification(uuid, charUUID, enable);
};
