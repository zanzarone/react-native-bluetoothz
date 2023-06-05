import React, {useEffect, useState} from 'react';
import {
  Button,
  Modal,
  SafeAreaView,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  TouchableOpacity,
  View,
  TextInput,
  ScrollView,
  Platform,
  Linking,
} from 'react-native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import * as BluetoothZ from 'react-native-bluetoothz';
// import {requestPermissions, Permission} from './utils/androidPermissions';
// import DocumentPicker from 'react-native-document-picker';
import Header from './components/Header';
import DFUScreen from './screens/DFUScreen';
import Toast from './components/Toast';
const Stack = createNativeStackNavigator();

function DeviceSignalIcon({rssi}) {
  if (rssi >= -60)
    return (
      <Image
        style={{height: 24, width: 24}}
        source={require('./assets/icon/excellent-signal-100.png')}
      />
    );
  if (rssi >= -70 && rssi < -60)
    return (
      <Image
        style={{height: 24, width: 24}}
        source={require('./assets/icon/good-signal-100.png')}
      />
    );
  if (rssi >= -80 && rssi < -70)
    return (
      <Image
        style={{height: 24, width: 24}}
        source={require('./assets/icon/normal-signal-100.png')}
      />
    );
  return (
    <Image
      style={{height: 24, width: 24}}
      source={require('./assets/icon/bad-signal-100.png')}
    />
  );
}

function AdvancedControls({devices, onError, onContinue, onDfu}) {
  if (devices.some(d => d.ready)) {
    let singleDevice = false;
    let dfuAvailable = false;
    const readyDevices = devices.filter(d => d.ready);
    if (readyDevices.length === 1) {
      singleDevice = true;
      dfuAvailable = readyDevices[0].dfuCompliant;
    }
    console.log(devices, singleDevice, dfuAvailable);
    return (
      <View
        style={{
          flexDirection: 'row',
          zIndex: 1999,
          // backgroundColor: 'green',
          alignItems: 'center',
          justifyContent: 'flex-end',
          position: 'absolute',
          bottom: '15%',
          right: '5%',
          minWidth: 100,
          height: 80,
          gap: 10,
        }}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            {opacity: singleDevice && dfuAvailable ? 1 : 0.7},
          ]}
          onPress={() => {
            if (!singleDevice) {
              onError &&
                onError(
                  require('./assets/icon/error-100.png'),
                  'The DFU upgrade can only be performed on one connected device at a time.',
                );
              return;
            }
            if (!dfuAvailable) {
              onError &&
                onError(
                  require('./assets/icon/error-100.png'),
                  'DFU is not available on this device.',
                );

              return;
            }
            onDfu && onDfu(readyDevices[0].uuid);
          }}>
          <Image
            style={{
              height: 44,
              width: 44,
            }}
            resizeMode="contain"
            source={require('./assets/icon/dfu-100.png')}
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.continueButton} onPress={() => {}}>
          <Image
            style={{
              height: 34,
              width: 34,
            }}
            resizeMode="contain"
            source={require('./assets/icon/continue-100.png')}
          />
        </TouchableOpacity>
      </View>
    );
  }
  return null;
}

const DevicesList = ({status, navigation, setSelectedDevices}) => {
  const [devices, setDevices] = useState([]);
  const [isScanning, scan] = useState(false);
  const [modalAlert, setModalAlert] = useState(undefined);

  useEffect(() => {
    const scanStartedListener = BluetoothZ.emitter.addListener(
      BluetoothZ.Defines.BLE_ADAPTER_SCAN_START,
      () => {
        setDevices([]);
        scan(true);
      },
    );
    const scanStoppedListener = BluetoothZ.emitter.addListener(
      BluetoothZ.Defines.BLE_ADAPTER_SCAN_END,
      () => {
        scan(false);
      },
    );
    const peripheralFoundListener = BluetoothZ.emitter.addListener(
      BluetoothZ.Defines.BLE_PERIPHERAL_FOUND,
      ({uuid, name, rssi}) => {
        console.log('FOUND');
        setDevices(old => {
          const dev = {uuid, name, rssi, connected: false, ready: false};
          console.log(dev);
          const arr = [...old, dev];
          console.log(arr);
          return arr;
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
              return {...d, connected: false, ready: false};
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
      scanStartedListener?.remove();
      scanStoppedListener?.remove();
      peripheralReadyListener?.remove();
      peripheralConnectedListener?.remove();
      peripheralDisconnectedListener?.remove();
    };
  }, [status]);

  return (
    <View style={{flex: 1}}>
      <Toast state={modalAlert} />
      <AdvancedControls
        devices={devices}
        onError={(icon, text) => {
          setModalAlert({icon, text});
          setTimeout(() => {
            setModalAlert(undefined);
          }, 5000);
        }}
        onDfu={uuid => {
          navigation.navigate('DFUScreen');
        }}
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
            source={require('./assets/icon/error-100.png')}
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
            source={require('./assets/icon/no-devices-100.png')}
          />
          <Text
            style={{color: 'black', fontFamily: 'Nunito-Bold', fontSize: 24}}>
            No devices found.
          </Text>
        </View>
      )}
      {status === true && isScanning && (
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
            source={require('./assets/icon/loading-100.png')}
          />
          <Text
            style={{color: 'black', fontFamily: 'Nunito-Bold', fontSize: 24}}>
            Scanning, please wait...
          </Text>
        </View>
      )}
      {status === true && !isScanning && devices.length > 0 && (
        <ScrollView style={{}}>
          {devices
            .sort(function (a, b) {
              return b.rssi - a.rssi;
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
                    borderBottomColor: 'black',
                    borderBottomWidth: 2,
                  }}>
                  <View
                    style={{
                      backgroundColor: 'transparent',
                      justifyContent: 'center',
                    }}>
                    <TouchableOpacity
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
                            ? require('./assets/icon/device-connected-100.png')
                            : require('./assets/icon/device-100.png')
                        }
                      />
                    </TouchableOpacity>
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
                        gap: 5,
                      }}>
                      <DeviceSignalIcon rssi={device.rssi} />
                      <Text
                        style={{
                          fontFamily: 'Nunito-Regular',
                          color: 'black',
                        }}>
                        {`${device.rssi}dBm`}
                      </Text>
                      <Text
                        style={{
                          fontFamily: 'Nunito-Bold',
                          color: device.connected ? 'green' : 'black',
                        }}>
                        {device.connected && device.ready && 'Ready'}
                        {device.connected && !device.ready && 'Connected'}
                        {!device.connected && 'Disconnected'}
                        {/* {device.connected ?  device.ready ?  'Ready' : 'Connected' : 'Disconnected'} */}
                      </Text>
                    </View>
                  </View>
                </View>
                {index >= devices.length - 1 && (
                  <View key={Date.now()} style={{minHeight: 120}}></View>
                )}
              </View>
            ))}
        </ScrollView>
      )}
    </View>
  );
};

const Scanner = ({navigation}) => {
  const [bluetoothStatus, setBluetoothStatus] = useState(undefined);

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
    ///
    BluetoothZ.adapterStatus();
    return function cleanup() {
      bleAdapterListener?.remove();
    };
  }, []);
  return (
    <View style={{flex: 1, backgroundColor: 'snow'}}>
      <Header status={bluetoothStatus} canScan />
      <View
        style={[
          styles.oval,
          {backgroundColor: bluetoothStatus === true ? '#D4F174' : 'coral'},
        ]}
      />
      <DevicesList status={bluetoothStatus} navigation={navigation} />
    </View>
  );
};

export default function Main({navigation}) {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen
        name="Scanner"
        component={Scanner}
        initialParams={{navigation}}
      />
      <Stack.Screen
        name="DFUScreen"
        component={DFUScreen}
        initialParams={{navigation}}
      />
    </Stack.Navigator>
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
  oval: {
    position: 'absolute',
    top: 0,
    left: '25%',
    zIndex: -1,
    width: '130%',
    height: '70%',
    borderRadius: 240,
    transform: [{scaleX: 2}],
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
