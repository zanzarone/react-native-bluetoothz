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

const DEFINES = {
  CONNECTION_TIMEOUT_MSEC: 10000,
  SCAN_TIMEOUT_MSEC: 8000,
  ...BLE.getConstants(),
};

console.log(DEFINES);

module.exports.Defines = DEFINES;

/// Inizializzo il modulo nativo
BLE.setup();

/// Inizializzo le variabili di stato
let reconnectCount = null;
let scanWatchDog = null;
let connectionWatchDog = null;

/// Emettitore degli eventi nativi
const bleEmitter = new NativeEventEmitter(BLE);
module.exports.emitter = bleEmitter;

/// aggancio ascoltatore periferica connessa
bleEmitter.addListener(DEFINES.BLE_PERIPHERAL_CONNECTED, (event) => {
  reconnectCount = null;
  console.log('!! BLE_PERIPHERAL_CONNECTED ', event);
  clearTimeout(connectionWatchDog);
  connectionWatchDog = setTimeout(() => {
    console.log('====> 1 TIMEOUT CONNECTION', uuid);
    const { uuid } = event;
    reconnectCount = null;
    BLE.cancel(uuid);
  }, DEFINES.DEFINES.CONNECTION_TIMEOUT_MSEC);
});

/// aggancio ascoltatore periferica pronta
bleEmitter.addListener(DEFINES.BLE_PERIPHERAL_READY, (event) => {
  console.log('!! BLE_PERIPHERAL_READY ', event);
  clearTimeout(connectionWatchDog);
  connectionWatchDog = null;
});

/// aggancio ascoltatore periferica disconnessa
bleEmitter.addListener(DEFINES.BLE_PERIPHERAL_DISCONNECTED, (event) => {
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
bleEmitter.addListener(DEFINES.BLE_PERIPHERAL_CONNECT_FAILED, (event) => {
  reconnectCount = null;
  clearTimeout(connectionWatchDog);
  connectionWatchDog = null;
  console.log('x BLE_PERIPHERAL_CONNECT_FAILED ', event);
});

/// aggancio ascoltatore trovata nuova caratteristica
bleEmitter.addListener(
  DEFINES.BLE_PERIPHERAL_CHARACTERISTIC_DISCOVERED,
  (event) => {
    // console.log('!! BLE_PERIPHERAL_CHARACTERISTIC_DISCOVERED ', event);
    clearTimeout(connectionWatchDog);
    connectionWatchDog = setTimeout(() => {
      console.log('====> 1 TIMEOUT CONNECTION', uuid);
      const { uuid } = event;
      reconnectCount = null;
      BLE.cancel(uuid);
    }, DEFINES.DEFINES.CONNECTION_TIMEOUT_MSEC);
  }
);

/// funzione per ricavare lo stato dell'adattatore
module.exports.adapterStatus = async () => {
  try {
    return await BLE.status();
  } catch (error) {
    return DEFINES.BLE_ADAPTER_STATUS_UNKNOW;
  }
};

/// funzione per iniziare la scansione bluetooth
module.exports.startScan = ({
  services,
  filter,
  timeout = DEFINES.SCAN_TIMEOUT_MSEC,
  onEnd = undefined,
}) => {
  console.log('====> START SCAN');
  if (scanWatchDog) {
    console.log('====> SCAN ALREADY ACTIVE ');
    return;
  }
  BLE.startScan(services, filter);
  scanWatchDog = setTimeout(() => this.stopScan({ onEnd }), timeout);
};

/// funzione per interrompere la scansione bluetooth
module.exports.stopScan = ({ onEnd = undefined }) => {
  console.log('====> STOP SCAN');
  clearTimeout(scanWatchDog);
  scanWatchDog = null;
  BLE.stopScan();
  if (onEnd) {
    onEnd();
  }
};

/// funzione per interrompere la scansione bluetooth
module.exports.connect = ({ uuid, keepConnection }) => {
  console.log('====> CONNECT', uuid);
  BLE.connect(uuid);
  clearTimeout(this.connectionTimer);
  connectionWatchDog = setTimeout(() => {
    console.log('====> 1 TIMEOUT CONNECTION', uuid);
    reconnectCount = null;
    BLE.cancel(uuid);
  }, DEFINES.DEFINES.CONNECTION_TIMEOUT_MSEC);
  if (keepConnection && this.autoReconnect === null) {
    reconnectCount = 5;
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
