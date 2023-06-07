import React, {useEffect, useState} from 'react';
import {useFocusEffect} from '@react-navigation/native';
import {
  Image,
  Text,
  View,
  ScrollView,
  StyleSheet,
  Platform,
} from 'react-native';
import * as BluetoothZ from 'react-native-bluetoothz';
import Header from '../components/Header';
import BackgroundShape from '../components/BackgroundShape';
import Toast from '../components/Toast';
import RoundButton from '../components/RoundButton';
import TouchableDebounce from '../components/TouchableDebounce';
import FilterMenu from '../components/FilterMenu';

function DeviceSignal({rssi}) {
  let image = null;
  if (rssi >= -60)
    image = (
      <Image
        style={{height: 24, width: 24}}
        source={require('../assets/icon/excellent-signal-100.png')}
      />
    );
  else if (rssi >= -70 && rssi < -60)
    image = (
      <Image
        style={{height: 24, width: 24}}
        source={require('../assets/icon/good-signal-100.png')}
      />
    );
  else if (rssi >= -80 && rssi < -70)
    image = (
      <Image
        style={{height: 24, width: 24}}
        source={require('../assets/icon/normal-signal-100.png')}
      />
    );
  else {
    image = (
      <Image
        style={{height: 24, width: 24}}
        source={require('../assets/icon/bad-signal-100.png')}
      />
    );
  }
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
      }}>
      {image}
      <Text
        style={{
          fontFamily: 'Nunito-Regular',
          color: 'black',
        }}>
        {`${rssi}dBm`}
      </Text>
    </View>
  );
}

function Devices({status, devices, onCheckedDevice, isScanning}) {
  return (
    <ScrollView style={{opacity: isScanning ? 0.5 : 1}}>
      {devices
        .sort(function (a, b) {
          return a.name.localeCompare(b.name);
          // return b.rssi - a.rssi;
        })
        .map((device, index) => (
          <View key={device.uuid}>
            <View
              style={{
                marginHorizontal: 5,
                marginBottom: 5,
                minHeight: 110,
                flexDirection: 'row',
                paddingVertical: 15,
                paddingHorizontal: 10,
                gap: 15,
                borderBottomColor: '#555',
                borderBottomWidth: 2,
              }}>
              <View
                style={{
                  backgroundColor: 'transparent',
                  justifyContent: 'center',
                }}>
                <TouchableDebounce
                  disabled={isScanning}
                  onPress={() => {
                    if (!device.connected) {
                      BluetoothZ.connect({uuid: device.uuid});
                    } else {
                      BluetoothZ.disconnect({uuid: device.uuid});
                    }
                  }}
                  style={{
                    height: 46,
                    width: 46,
                    borderRadius: 2232,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#333',
                  }}>
                  <Image
                    resizeMode="contain"
                    style={{height: 32, width: 32}}
                    source={
                      device.connected
                        ? require('../assets/icon/device-connected-100.png')
                        : require('../assets/icon/device-100.png')
                    }
                  />
                </TouchableDebounce>
              </View>
              <View
                style={{
                  // backgroundColor: 'silver',
                  flex: 1,
                }}>
                <View
                  style={{
                    flex: 1,
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexDirection: 'row',
                  }}>
                  <Text
                    style={{
                      fontFamily: 'Nunito-Bold',
                      color: 'black',
                      fontSize: 18,
                    }}>
                    {device.name}
                  </Text>
                </View>
                <View
                  style={{
                    flex: 1,
                    // backgroundColor: 'pink',
                    justifyContent: 'center',
                  }}>
                  <Text
                    style={{
                      fontFamily: 'Nunito-Regular',
                      color: 'black',
                      fontSize: 11,
                    }}>
                    {device.uuid}
                  </Text>
                </View>
                <View
                  style={{
                    flex: 1,
                    alignItems: 'center',
                    flexDirection: 'row',
                    gap: 2,
                  }}>
                  {device.dfuCompliant && (
                    <View
                      style={{
                        backgroundColor: 'black',
                        borderRadius: 12,
                      }}>
                      <Image
                        style={{height: 24, width: 24}}
                        source={require('../assets/icon/dfu-100.png')}
                      />
                    </View>
                  )}
                  <DeviceSignal rssi={device.rssi} />
                  <Text
                    style={{
                      fontFamily: 'Nunito-Bold',
                      color: device.connected ? 'green' : 'black',
                    }}>
                    {device.connected && device.ready && 'Ready'}
                    {device.connected && !device.ready && 'Connected'}
                    {!device.connected && 'Disconnected'}
                  </Text>
                </View>
              </View>
              <TouchableDebounce
                debounceTime={100}
                disabled={isScanning}
                onPress={() => onCheckedDevice(device.uuid)}
                style={{backgroundColor: 'transparent'}}>
                <Image
                  resizeMode="contain"
                  style={{height: 32, width: 32}}
                  source={
                    !device.checked
                      ? require('../assets/icon/uncheck-100.png')
                      : require('../assets/icon/check-100.png')
                  }
                />
              </TouchableDebounce>
            </View>
            {index >= devices.length - 1 && (
              <View key={Date.now()} style={{minHeight: 170}}></View>
            )}
          </View>
        ))}
    </ScrollView>
  );
}

function ScanButton({isScanning}) {
  console.log('scan');
  return (
    <View
      style={{
        flexDirection: 'row',
        zIndex: 1999,
        // backgroundColor: 'green',
        alignItems: 'center',
        justifyContent: 'flex-start',
        position: 'absolute',
        bottom: '12%',
        // right: '5%',
        left: '5%',
        // minWidth: 100,
        height: 80,
        gap: 10,
      }}>
      <RoundButton
        onPress={() => {
          console.log('PIGIAR');
          if (!isScanning) {
            BluetoothZ.startScan({timeout: -1});
          } else {
            BluetoothZ.stopScan();
          }
        }}
        iconSize={{height: 30, width: 30}}
        buttonSize={{height: 50, width: 50, radius: 25}}
        icon={
          !isScanning
            ? require('../assets/icon/scan-100.png')
            : require('../assets/icon/stop-100.png')
        }
      />
    </View>
  );
}

function AdvancedControls({devices, isScanning, onDfu}) {
  const checkedDevices = devices.filter(d => d.checked);
  const readyDevices = devices.filter(d => d.ready);

  return (
    <View
      style={{
        flexDirection: 'row',
        zIndex: 1999,
        // backgroundColor: 'green',
        alignItems: 'center',
        justifyContent: 'flex-start',
        position: 'absolute',
        bottom: '13%',
        right: '5%',
        // left: '5%',
        // minWidth: 100,
        height: 80,
        gap: 10,
      }}>
      <RoundButton
        disabled={isScanning || checkedDevices.length < 1}
        style={{opacity: checkedDevices.length >= 1 ? 1 : 0.6}}
        onPress={() => {
          onDfu && onDfu(checkedDevices);
        }}
        iconSize={{height: 30, width: 30}}
        buttonSize={{height: 50, width: 50, radius: 25}}
        icon={require('../assets/icon/dfu-100.png')}
      />
      <RoundButton
        disabled={isScanning || readyDevices.length !== 1}
        style={{opacity: readyDevices.length === 1 ? 1 : 0.6}}
        onPress={() => {}}
        iconSize={{height: 30, width: 30}}
        buttonSize={{height: 50, width: 50, radius: 25}}
        icon={require('../assets/icon/details-100.png')}
      />
    </View>
  );
}

const DevicesList = ({status, navigation, isScanning}) => {
  const [devices, setDevices] = useState([]);
  const [modalAlert, setModalAlert] = useState(undefined);

  useEffect(() => {
    if (isScanning === true) {
      setDevices([]);
    } else if (isScanning === false) {
    }
  }, [isScanning]);

  useEffect(() => {
    const peripheralFoundListener = BluetoothZ.emitter.addListener(
      BluetoothZ.Defines.BLE_PERIPHERAL_FOUND,
      ({uuid, name, dfuCompliant, rssi}) => {
        console.log('FOUND');
        setDevices(old => {
          const dev = {
            uuid,
            name,
            rssi,
            dfuCompliant,
            connected: false,
            ready: false,
            checked: false,
          };
          // console.log(dev);
          const arr = [...old, dev];
          console.log(arr);
          return arr;
        });
      },
    );
    const peripheralRSSIUpdatedListener = BluetoothZ.emitter.addListener(
      BluetoothZ.Defines.BLE_PERIPHERAL_UPDATED_RSSI,
      ({uuid, rssi}) => {
        // console.log('RSSI');
        setDevices(old => {
          return old.map(d => {
            // console.log('CONN', old, old.uuid, uuid, old.uuid === uuid);
            if (d.uuid === uuid) {
              return {...d, rssi};
            }
            return d;
          });
        });
      },
    );
    const peripheralReadyListener = BluetoothZ.emitter.addListener(
      BluetoothZ.Defines.BLE_PERIPHERAL_READY,
      ({uuid, dfuCompliant}) => {
        console.log('READy');
        setDevices(old => {
          return old.map(d => {
            // console.log('CONN', old, old.uuid, uuid, old.uuid === uuid);
            if (d.uuid === uuid) {
              console.log('CONN 2');
              return {...d, ready: true, dfuCompliant};
            }
            return d;
          });
        });
      },
    );
    const peripheralConnectedListener = BluetoothZ.emitter.addListener(
      BluetoothZ.Defines.BLE_PERIPHERAL_CONNECTED,
      ({uuid}) => {
        setDevices(old => {
          return old.map(d => {
            // console.log('CONN', old, old.uuid, uuid, old.uuid === uuid);
            if (d.uuid === uuid) {
              console.log('CONN 2');
              return {...d, connected: true};
            }
            return d;
          });
        });
      },
    );
    const peripheralDisconnectedListener = BluetoothZ.emitter.addListener(
      BluetoothZ.Defines.BLE_PERIPHERAL_DISCONNECTED,
      ({uuid}) => {
        setDevices(old => {
          return old.map(d => {
            // console.log('CONN', old, old.uuid, uuid, old.uuid === uuid);
            if (d.uuid === uuid) {
              console.log('CONN 2');
              return {...d, connected: false, ready: false, checked: false};
            }
            return d;
          });
        });
      },
    );
    if (status !== true) {
      setDevices([]);
    }
    return function cleanup() {
      console.log('CLEANUP');
      peripheralFoundListener?.remove();
      peripheralRSSIUpdatedListener?.remove();
      peripheralReadyListener?.remove();
      peripheralConnectedListener?.remove();
      peripheralDisconnectedListener?.remove();
    };
  }, [status]);

  return (
    <View style={{flex: 1}}>
      <AdvancedControls
        devices={devices}
        onDfu={devs => navigation.push('DFU', {devices: devs})}
      />
      {status !== true && (
        <View
          style={{
            height: '100%',
            width: '100%',
            position: 'absolute',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Image
            resizeMode="contain"
            style={{height: 60, width: 60}}
            source={require('../assets/icon/error-100.png')}
          />
          <Text
            style={{color: 'black', fontFamily: 'Nunito-Bold', fontSize: 24}}>
            There's a Bluetooth problem.
          </Text>
          <Text
            style={{
              color: 'black',
              fontFamily: 'Nunito-Regular',
              fontSize: 18,
            }}>
            Check your settings
          </Text>
        </View>
      )}
      {status === true && !isScanning && devices.length <= 0 && (
        <View
          style={{
            height: '100%',
            width: '100%',
            position: 'absolute',
            paddingTop: '50%',
            // backgroundColor: 'silver',
            // justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Image
            resizeMode="contain"
            style={{height: 60, width: 60}}
            source={require('../assets/icon/no-devices-100.png')}
          />
          <Text
            style={{color: 'black', fontFamily: 'Nunito-Bold', fontSize: 24}}>
            No devices found.
          </Text>
        </View>
      )}
      {status === true && devices.length > 0 && (
        <Devices
          status={status}
          isScanning={isScanning}
          devices={devices}
          onCheckedDevice={uuid => {
            setDevices(old => {
              return old.map(d => {
                // console.log('CONN', old, old.uuid, uuid, old.uuid === uuid);
                if (d.uuid === uuid) {
                  console.log('check');
                  return {...d, checked: !d.checked};
                }
                return d;
              });
            });
          }}
        />
      )}
    </View>
  );
};

export default function Scanner({navigation}) {
  const [bluetoothStatus, setBluetoothStatus] = useState(undefined);
  const [isScanning, setScanning] = useState(false);
  console.log('mamma mia');
  useEffect(() => {
    const bleAdapterListener = BluetoothZ.emitter.addListener(
      BluetoothZ.Defines.BLE_ADAPTER_STATUS_DID_UPDATE,
      ({status}) => {
        console.log('oooooooooooo', status);
        setBluetoothStatus(
          status === BluetoothZ.Defines.BLE_ADAPTER_STATUS_POWERED_ON,
        );
      },
    );
    const scanStartedListener = BluetoothZ.emitter.addListener(
      BluetoothZ.Defines.BLE_ADAPTER_SCAN_START,
      () => {
        setScanning(true);
      },
    );
    const scanStoppedListener = BluetoothZ.emitter.addListener(
      BluetoothZ.Defines.BLE_ADAPTER_SCAN_END,
      () => {
        setScanning(false);
      },
    );
    ///
    BluetoothZ.adapterStatus();
    return function cleanup() {
      bleAdapterListener?.remove();
      scanStartedListener?.remove();
      scanStoppedListener?.remove();
    };
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      return function cleanup() {
        console.log(
          '============= asdbjnsajkdjksasjkafjsdfbdsjbfdsjhfdshjbfjhk',
        );
        BluetoothZ.stopScan();
      };
    }, []),
  );

  return (
    <View style={{flex: 1, backgroundColor: 'snow'}}>
      <Header status={bluetoothStatus} onFilter={() => {}} />
      <BackgroundShape bleStatus={bluetoothStatus} />
      <DevicesList
        status={bluetoothStatus}
        navigation={navigation}
        isScanning={isScanning}
      />
      <Toast
      // state={modalAlert}
      />
      <FilterMenu visible />
      <ScanButton isScanning={isScanning} />
    </View>
  );
}

const styles = StyleSheet.create({
  continueButton: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    backgroundColor: 'black',
    width: 60,
    height: 60,
    borderRadius: 30,
  },
});

if (Platform.OS === 'ios') {
  styles.continueButton = {
    ...styles.continueButton,
    shadowColor: '#171717',
    shadowOffset: {width: -2, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 3,
  };
} else if (Platform.OS === 'android') {
  styles.continueButton = {
    ...styles.continueButton,
    elevation: 4,
    shadowColor: '#000000',
  };
}
