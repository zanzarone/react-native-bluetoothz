import React, {useEffect, useState} from 'react';
import {useFocusEffect} from '@react-navigation/native';
import {
  Image,
  Text,
  TouchableOpacity,
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

function DeviceSignalIcon({rssi}) {
  if (rssi >= -60)
    return (
      <Image
        style={{height: 24, width: 24}}
        source={require('../assets/icon/excellent-signal-100.png')}
      />
    );
  if (rssi >= -70 && rssi < -60)
    return (
      <Image
        style={{height: 24, width: 24}}
        source={require('../assets/icon/good-signal-100.png')}
      />
    );
  if (rssi >= -80 && rssi < -70)
    return (
      <Image
        style={{height: 24, width: 24}}
        source={require('../assets/icon/normal-signal-100.png')}
      />
    );
  return (
    <Image
      style={{height: 24, width: 24}}
      source={require('../assets/icon/bad-signal-100.png')}
    />
  );
}

function AdvancedControls({devices, onError, onContinue, onDfu, onTEST}) {
  const checkedDevices = devices.filter(d => d.checked);
  const readyDevices = devices.filter(d => d.ready);
  const [isScanning, setScanning] = useState(false);
  useEffect(() => {
    const stopScanListener = BluetoothZ.emitter.addListener(
      BluetoothZ.Defines.BLE_ADAPTER_SCAN_END,
      event => {
        setScanning(false);
      },
    );
    return function cleanup() {
      stopScanListener?.remove();
    };
  }, []);

  return (
    <View
      style={{
        flexDirection: 'row',
        zIndex: 1999,
        // backgroundColor: 'green',
        alignItems: 'center',
        justifyContent: 'flex-start',
        position: 'absolute',
        bottom: '15%',
        right: '5%',
        left: '5%',
        // minWidth: 100,
        height: 80,
        gap: 10,
      }}>
      <RoundButton
        onPress={() => {
          if (!isScanning) {
            BluetoothZ.startScan({timeout: -1});
          } else {
            BluetoothZ.stopScan();
          }
          setScanning(o => !o);
        }}
        iconSize={{height: 30, width: 30}}
        buttonSize={{height: 50, width: 50, radius: 25}}
        icon={
          !isScanning
            ? require('../assets/icon/scan-100.png')
            : require('../assets/icon/stop-100.png')
        }
      />
      <RoundButton
        disabled={checkedDevices.length < 1}
        style={{opacity: checkedDevices.length >= 1 ? 1 : 0.6}}
        onPress={() => {
          onDfu && onDfu(checkedDevices);
        }}
        iconSize={{height: 30, width: 30}}
        buttonSize={{height: 50, width: 50, radius: 25}}
        icon={require('../assets/icon/dfu-100.png')}
      />
      <RoundButton
        disabled={readyDevices.length !== 1}
        style={{opacity: readyDevices.length === 1 ? 1 : 0.6}}
        onPress={() => {}}
        iconSize={{height: 30, width: 30}}
        buttonSize={{height: 50, width: 50, radius: 25}}
        icon={require('../assets/icon/details-100.png')}
      />
    </View>
  );
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
          const dev = {
            uuid,
            name,
            rssi,
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
        // setModalAlert({
        //   type: 'error',
        //   text: `Device ${uuid} disconnected.`,
        // });
        // setTimeout(() => setModalAlert(undefined), 3000);
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
        onTEST={() => navigation.push('DFUScreen')}
        onError={(icon, text) => {
          setModalAlert({icon, text});
          setTimeout(() => {
            setModalAlert(undefined);
          }, 5000);
        }}
        onDfu={devices => {
          navigation.navigate('DFU', {devices});
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
      {status === true &&
        // !isScanning &&
        devices.length > 0 && (
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
                              ? require('../assets/icon/device-connected-100.png')
                              : require('../assets/icon/device-100.png')
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
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      onPress={() => {
                        setDevices(old => {
                          return old.map(d => {
                            // console.log('CONN', old, old.uuid, uuid, old.uuid === uuid);
                            if (d.uuid === device.uuid) {
                              console.log('check');
                              return {...d, checked: !d.checked};
                            }
                            return d;
                          });
                        });
                      }}
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
                    </TouchableOpacity>
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

export default function Scanner({navigation}) {
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
      <Header status={bluetoothStatus} canScan />
      <BackgroundShape bleStatus={bluetoothStatus} />
      <DevicesList status={bluetoothStatus} navigation={navigation} />
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
