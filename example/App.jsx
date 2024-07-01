/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useEffect, useState} from 'react';
import {
  Button,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';

import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';
const {Buffer} = require('buffer');
import {
  emitter as bleEmitter,
  adapterStatus,
  startScan,
  stopScan,
  connect,
  connectSync,
  disconnect,
  disconnectSync,
  getAllCharacteristic,
  readCharacteristicSync,
  Defines,
} from 'react-native-bluetoothz';
import {Permission} from './src/androidPermissions';

function Section({children, title}) {
  const isDarkMode = useColorScheme() === 'dark';
  return (
    <View style={styles.sectionContainer}>
      <Text
        style={[
          styles.sectionTitle,
          {
            color: isDarkMode ? Colors.white : Colors.black,
          },
        ]}>
        {title}
      </Text>
      {children}
    </View>
  );
}

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const [isBluetoothPoweredOn, bluetoothPoweredOn] = useState(undefined);
  const [isScanning, setScanning] = useState(false);
  const [devices, setDevices] = useState([]);

  useEffect(() => {
    const bleAdapterListener = bleEmitter().addListener(
      Defines.BLE_ADAPTER_STATUS_DID_UPDATE,
      ({status}) => {
        console.log('oooooooooooo', status);
        bluetoothPoweredOn(status === Defines.BLE_ADAPTER_STATUS_POWERED_ON);
      },
    );
    const scanStartedListener = bleEmitter().addListener(
      Defines.BLE_ADAPTER_SCAN_START,
      () => {
        setScanning(true);
      },
    );
    const scanStoppedListener = bleEmitter().addListener(
      Defines.BLE_ADAPTER_SCAN_END,
      () => {
        setScanning(false);
      },
    );
    const peripheralFoundListener = bleEmitter().addListener(
      Defines.BLE_PERIPHERAL_UPDATES,
      ({devices: devs}) => {
        console.log('--->', devs);
        // setDevices(devices.sort((a, b) => b.rssi - a.rssi));
        setDevices(devs);
      },
    );
    // const peripheralReadyListener = bleEmitter().addListener(
    //   Defines.BLE_PERIPHERAL_READY,
    //   ({uuid, dfuCompliant}) => {
    //     console.log('READy');
    //     setDevices(old => {
    //       return old.map(d => {
    //         // console.log('CONN', old, old.uuid, uuid, old.uuid === uuid);
    //         if (d.uuid === uuid) {
    //           console.log('CONN 2');
    //           return {...d, ready: true, dfuCompliant};
    //         }
    //         return d;
    //       });
    //     });
    //   },
    // );
    // const peripheralConnectedListener = bleEmitter().addListener(
    //   Defines.BLE_PERIPHERAL_CONNECTED,
    //   ({uuid}) => {
    //     setDevices(old => {
    //       return old.map(d => {
    //         // console.log('CONN', old, old.uuid, uuid, old.uuid === uuid);
    //         if (d.uuid === uuid) {
    //           console.log('CONN 2');
    //           return {...d, connected: true};
    //         }
    //         return d;
    //       });
    //     });
    //   },
    // );
    // const peripheralDisconnectedListener = bleEmitter().addListener(
    //   Defines.BLE_PERIPHERAL_DISCONNECTED,
    //   ({uuid}) => {
    //     setDevices(old => {
    //       return old.map(d => {
    //         // console.log('CONN', old, old.uuid, uuid, old.uuid === uuid);
    //         if (d.uuid === uuid) {
    //           console.log('CONN 2');
    //           return {...d, connected: false, ready: false, checked: false};
    //         }
    //         return d;
    //       });
    //     });
    //   },
    // );
    adapterStatus();
    return function cleanup() {
      bleAdapterListener?.remove();
      scanStartedListener?.remove();
      scanStoppedListener?.remove();
      peripheralFoundListener?.remove();
      // peripheralReadyListener?.remove();
      // peripheralConnectedListener?.remove();
      // peripheralDisconnectedListener?.remove();
    };
  }, []);

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  return (
    <SafeAreaView style={backgroundStyle}>
      {Platform.OS === 'android' && <Permission />}
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={backgroundStyle}>
        {/* <Header /> */}
        <View
          style={{
            backgroundColor: isDarkMode ? Colors.black : Colors.white,
          }}>
          <Section title="Bluetooth status">
            <Text
              style={[
                styles.sectionTitle,
                {
                  color: 'skyblue',
                },
              ]}>
              {isBluetoothPoweredOn ? 'On' : 'Off'}
            </Text>
            <Button
              title={!isScanning ? 'START SCAN' : 'STOP SCAN'}
              disabled={!isBluetoothPoweredOn}
              onPress={() => {
                if (!isScanning) {
                  // const {filterByName, ...options} = filter;
                  startScan({
                    // filter: filterByName.enabled ? filterByName.text : undefined,
                    filters: ['PC8_[0-9]{1,}', 'SRM_XP_R_[0-9]{1,}'],
                    // options: {allowNoNamed: false},
                    timeout: -1,
                  });
                } else {
                  stopScan();
                }
              }}
            />
          </Section>
          <Section title="Scanning info">
            {devices.map(device => {
              console.log('sooooka', device);
              return (
                <View key={device.uuid}>
                  <Text
                    style={[
                      styles.sectionTitle,
                      {
                        color: 'orange',
                        fontSize: 18,
                      },
                    ]}>
                    {device?.name ?? 'No name'} ({device.uuid})
                  </Text>
                  {device?.rssi !== undefined && (
                    <Text>RSSI: {device.rssi}</Text>
                  )}
                  {device?.connected === true && (
                    <Button
                      color={'limegreen'}
                      disabled={device?.ready !== true}
                      title={'print chars'}
                      onPress={async () => {
                        const chars = await getAllCharacteristic({
                          uuid: device.uuid,
                        });
                        console.log(chars);
                        const pippo = await readCharacteristicSync({
                          uuid: device.uuid,
                          charUUID:
                            Platform.OS === 'android'
                              ? '00002a29-0000-1000-8000-00805f9b34fb'
                              : '2A29',
                        });
                        console.log(pippo, Buffer);
                        try {
                          const buff = Buffer.from(pippo.value, 'base64');
                          console.log(buff.toString());
                        } catch (exc) {
                          console.log(exc);
                        }
                      }}
                    />
                  )}
                  <Button
                    color={!device.connected ? 'blue' : 'red'}
                    // disabled={isScanning}
                    title={!device?.connected ? 'Connect' : 'Disconnect'}
                    onPress={async () => {
                      if (!device?.connected) {
                        // connect({uuid: device.uuid});

                        try {
                          const {uuid} = await connectSync({
                            uuid: device.uuid,
                          });
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
                          console.log(uuid);
                        } catch (error) {
                          console.log(error);
                        }
                      } else {
                        try {
                          const {uuid} = await disconnectSync({
                            uuid: device.uuid,
                          });
                          console.log(uuid);
                          setDevices(old => {
                            return old.map(d => {
                              // console.log('CONN', old, old.uuid, uuid, old.uuid === uuid);
                              if (d.uuid === uuid) {
                                console.log('CONN 2');
                                return {...d, connected: false};
                              }
                              return d;
                            });
                          });
                        } catch (error) {
                          console.log(error);
                        }
                      }
                    }}
                  />
                </View>
              );
            })}
          </Section>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default App;
