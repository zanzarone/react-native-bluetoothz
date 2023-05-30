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

import * as BluetoothZ from 'react-native-bluetoothz';
import {requestPermissions, Permission} from './utils/androidPermissions';
import DocumentPicker from 'react-native-document-picker';
import RNFS from 'react-native-fs';

const pickDocument = async () => {
  let res;
  try {
    res = await DocumentPicker.pickSingle({
      type: [DocumentPicker.types.allFiles],
      copyTo: 'cachesDirectory',
    });
    console.log('URI:', res.uri);
    console.log('Type:', res.type);
    console.log('Name:', res.name);
    console.log('Size:', res.size);
  } catch (err) {
    if (DocumentPicker.isCancel(err)) {
      console.log('User cancelled the picker');
    } else {
      console.log('Error:', err);
    }
  }
  return res;
};

function BleBulb({status, requestAdapterStatus}) {
  return (
    <View
      style={{
        backgroundColor: 'transparent',
        width: '100%',
        alignItems: 'center',
      }}>
      <View
        style={{
          backgroundColor: 'transparent',
          margin: 5,
          borderRadius: 5,
          width: '100%',
        }}>
        {status === BluetoothZ.Defines.BLE_ADAPTER_STATUS_POWERED_ON && (
          <TouchableOpacity
            onPress={() => requestAdapterStatus()}
            style={{
              borderRadius: 20,
              padding: 10,
              backgroundColor: 'lightgreen',
              alignItems: 'center',
              justifyContent: 'center',
              marginHorizontal: 16,
              flexDirection: 'row',
              gap: 5,
            }}>
            <Text style={{color: 'green', fontSize: 20}}>Bluetooth is</Text>
            <Text
              style={{
                color: 'green',
                fontWeight: 'bold',
                fontSize: 20,
              }}>
              On
            </Text>
          </TouchableOpacity>
        )}
        {status === BluetoothZ.Defines.BLE_ADAPTER_STATUS_POWERED_OFF && (
          <TouchableOpacity
            onPress={() => requestAdapterStatus()}
            style={{
              borderRadius: 20,
              padding: 10,
              backgroundColor: 'coral',
              alignItems: 'center',
              justifyContent: 'center',
              marginHorizontal: 16,
              flexDirection: 'row',
              gap: 5,
            }}>
            <Text style={{color: 'darkslategray', fontSize: 20}}>
              Bluetooth is
            </Text>
            <Text
              style={{
                color: 'darkslategray',
                fontWeight: 'bold',
                fontSize: 20,
              }}>
              Off
            </Text>
          </TouchableOpacity>
        )}
        {status === BluetoothZ.Defines.BLE_ADAPTER_STATUS_UNKNOW && (
          <TouchableOpacity
            onPress={() => requestAdapterStatus()}
            style={{
              borderRadius: 20,
              padding: 10,
              backgroundColor: 'slategray',
              alignItems: 'center',
              justifyContent: 'center',
              marginHorizontal: 16,
              flexDirection: 'row',
              gap: 5,
            }}>
            <Text style={{color: 'darkslategray', fontSize: 20}}>
              Bluetooth is
            </Text>
            <Text
              style={{
                color: 'darkslategray',
                fontWeight: 'bold',
                fontSize: 20,
              }}>
              Unavailable
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

function Section({title, subtitle, children}) {
  return (
    <>
      <View
        style={{
          borderBottomColor: 'silver',
          borderBottomWidth: 1,
          marginVertical: 10,
        }}
      />
      <View
        style={{
          backgroundColor: 'transparent',
          gap: 5,
          alignItems: 'center',
        }}>
        <Text
          style={{
            color: 'white',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            fontWeight: 'bold',
            fontSize: 16,
          }}>
          {title}
        </Text>
        {subtitle && (
          <Text
            style={{
              color: 'silver',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              fontStyle: 'italic',
              fontSize: 10,
            }}>
            {subtitle}
          </Text>
        )}
        {children}
      </View>
    </>
  );
}

const Device = ({
  disabled,
  name,
  uuid,
  onPress,
  connected,
  ready,
  notifying,
  onMore,
}) => {
  const [progress, setProgress] = useState(undefined);
  const [dfuStatus, setDfuStatus] = useState(undefined);
  useEffect(() => {
    const dfuFailedListener = BluetoothZ.emitter.addListener(
      BluetoothZ.Defines.BLE_PERIPHERAL_DFU_PROCESS_FAILED,
      ({uuid, error}) => {
        console.log('+ DFU + DISPO:', uuid, 'error:', error);
      },
    );

    const dfuStatusListener = BluetoothZ.emitter.addListener(
      BluetoothZ.Defines.BLE_PERIPHERAL_DFU_STATUS_DID_CHANGE,
      ({uuid, status}) => {
        console.log('+ DFU STATUS + DISPO:', uuid, 'status:', status);
        setDfuStatus(status);
      },
    );

    const dfuProgressListener = BluetoothZ.emitter.addListener(
      BluetoothZ.Defines.BLE_PERIPHERAL_DFU_PROGRESS,
      ({
        uuid,
        part,
        totalParts,
        progress,
        currentSpeedBytesPerSecond,
        avgSpeedBytesPerSecond,
      }) => {
        console.log(
          '+ DFU PROGRESS + DISPO:',
          uuid,
          'part:',
          part,
          'totalParts:',
          totalParts,
          'progress:',
          progress,
          'currentSpeedBytesPerSecond:',
          currentSpeedBytesPerSecond,
          'avgSpeedBytesPerSecond:',
          avgSpeedBytesPerSecond,
        );
        setProgress(progress);
      },
    );

    return function cleanUp() {
      console.log('=================>>>>>>>>>>>> OFF');
      dfuFailedListener?.remove();
      dfuStatusListener?.remove();
      dfuProgressListener?.remove();
    };
  }, []);
  return (
    <View
      style={{
        minHeight: 130,
        borderBottomColor: 'gray',
        borderBottomWidth: 1,
        gap: 5,
        marginVertical: 1,
        flexDirection: 'row',
        width: '100%',
      }}>
      <View style={{justifyContent: 'center'}}>
        {!connected && (
          <View
            style={{
              backgroundColor: 'slategray',
              height: 24,
              width: 24,
              borderRadius: 12,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Text style={{fontSize: 10}}>❔</Text>
          </View>
        )}
        {connected && !ready && (
          <View
            style={{
              backgroundColor: 'lightskyblue',
              height: 24,
              width: 24,
              borderRadius: 12,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Text style={{fontSize: 10}}>◦</Text>
          </View>
        )}
        {connected && ready && (
          <View
            style={{
              backgroundColor: 'lightgreen',
              height: 24,
              width: 24,
              borderRadius: 12,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Text style={{fontSize: 10}}>✔️</Text>
          </View>
        )}
      </View>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          flex: 1,
          paddingVertical: 5,
        }}>
        <View
          style={{flex: 2, justifyContent: 'space-between'}}
          disabled={disabled}>
          <Text style={{fontWeight: 'bold', color: disabled ? 'gray' : 'snow'}}>
            {name}
          </Text>
          <View style={{flexDirection: 'row', gap: 5}}>
            <Text
              style={{
                fontSize: 9,
                fontStyle: 'italic',
                color: disabled ? 'gray' : 'snow',
              }}>
              {uuid}
            </Text>
            {dfuStatus && (
              <Text
                style={{
                  fontSize: 9,
                  fontStyle: 'italic',
                  fontWeight: 'bold',
                  color: 'cyan',
                }}>
                {dfuStatus}
              </Text>
            )}
          </View>
          <View
            style={{backgroundColor: 'dimgray', borderRadius: 5, height: 20}}>
            <View
              style={{
                backgroundColor: 'yellow',
                borderRadius: 5,
                height: 20,
                width: progress ? `${progress}%` : '0%',
              }}></View>
            <Text
              style={{
                position: 'absolute',
                color: 'black',
                fontWeight: 'bold',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                textAlign: 'center',
              }}>
              {progress ? `${progress}%` : '0%'}
            </Text>
          </View>
          <View
            style={{
              // flex: 1,
              gap: 10,
              flexDirection: 'row',
              alignItems: 'center',
              // justifyContent: 'flex-end',
            }}>
            {true && (
              <TouchableOpacity
                disabled={disabled}
                onPress={async () => {
                  const result = await pickDocument();
                  console.log(result);
                  if (result) {
                    BluetoothZ.startDFU({
                      uuid,
                      filePath: result.fileCopyUri,
                      pathType:
                        Platform.OS === 'ios'
                          ? BluetoothZ.Defines.FILE_PATH_TYPE_STRING
                          : BluetoothZ.Defines.FILE_PATH_TYPE_URL,
                    });
                  }
                }}
                style={{
                  height: 40,
                  backgroundColor: 'yellow',
                  width: 40,
                  borderRadius: 10,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Text style={{color: 'black', fontSize: 13}}>DFU</Text>
              </TouchableOpacity>
            )}
            {true && (
              <TouchableOpacity
                disabled={disabled}
                onPress={async () => {
                  BluetoothZ.pauseDFU({uuid});
                }}
                style={{
                  height: 40,
                  backgroundColor: 'orange',
                  width: 40,
                  borderRadius: 10,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Text style={{color: 'black', fontSize: 13}}>DFU-S</Text>
              </TouchableOpacity>
            )}
            {true && (
              <TouchableOpacity
                disabled={disabled}
                onPress={async () => {
                  BluetoothZ.resumeDFU({uuid});
                }}
                style={{
                  height: 40,
                  backgroundColor: 'palegreen',
                  width: 40,
                  borderRadius: 10,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Text style={{color: 'black', fontSize: 13}}>DFU-R</Text>
              </TouchableOpacity>
            )}
            {true && (
              <TouchableOpacity
                disabled={disabled}
                onPress={async () => {
                  BluetoothZ.abortDFU({uuid});
                }}
                style={{
                  height: 40,
                  backgroundColor: 'crimson',
                  width: 40,
                  borderRadius: 10,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Text style={{color: 'black', fontSize: 13}}>DFU-A</Text>
              </TouchableOpacity>
            )}
            {/* {false && (
              <TouchableOpacity
                disabled={disabled}
                onPress={async () => {
                  console.log('GO !', Date.now(), RNFS.MainBundlePath);
                  const result = await RNFS.readDir(RNFS.MainBundlePath);
                  let firmwarePath = null;
                  result.forEach(element => {
                    if (
                      element.name.includes('XPower_Firmware_Revision_') &&
                      element.isFile()
                    )
                      firmwarePath = element.path;
                    console.log(
                      'GOT RESULT',
                      element.name,
                      element.isDirectory(),
                    );
                  });
                  console.log('===>', uuid, firmwarePath);
                  BluetoothZ.startDFUSync({uuid, filePath: firmwarePath})
                    .then(r => {
                      console.log('OKOKOKOKOKOKOKOKOKOKOKOKOKOKOKOKO');
                    })
                    .catch(e => {
                      console.log('ERREREREREEEEEEREEEEERREEEEEEEEREER', e);
                    });
                }}
                style={{
                  height: 40,
                  backgroundColor: 'cyan',
                  width: 40,
                  borderRadius: 10,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Text style={{color: 'black', fontSize: 13}}>SDFU</Text>
              </TouchableOpacity>
            )} */}
            <TouchableOpacity
              disabled={disabled}
              onPress={() => onPress()}
              style={{
                height: 40,
                backgroundColor: connected ? 'red' : 'green',
                width: 40,
                borderRadius: 10,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Text style={{color: 'black', fontSize: 13}}>
                {connected ? 'D' : 'C'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              disabled={disabled}
              onPress={async () => {
                try {
                  await BluetoothZ.connectSync({uuid});
                  console.log('CONNESSO!!!!');
                } catch (error) {
                  console.log('ERRORE!!!!', error);
                }
              }}
              style={{
                height: 40,
                backgroundColor: 'cyan',
                width: 40,
                borderRadius: 10,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Text style={{color: 'black', fontSize: 13}}>
                {connected ? 'D' : 'C-s'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        {connected && ready && (
          <View
            style={{
              // flex: 1,
              gap: 10,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'flex-end',
            }}>
            <TouchableOpacity
              disabled={disabled}
              onPress={() => {
                onMore(uuid);
              }}
              style={{
                height: 26,
                width: 26,
                borderRadius: 10,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Text style={{color: 'white', fontSize: 13}}>▶︎</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

function Header() {
  return (
    <View
      style={{
        marginTop: Platform.OS === 'android' ? 10 : 0,
        alignItems: 'center',
        gap: 5,
      }}>
      <Image
        resizeMode="stretch"
        style={{height: 60, width: 66}}
        source={require('./assets/logo.png')}
      />
      <Text style={{color: 'white', fontWeight: 'bold', fontSize: 20}}>
        BluetoothZ
      </Text>
    </View>
  );
}

function Switch({on = false, showStatus = true, onPress}) {
  return (
    <TouchableOpacity
      onPress={() => {
        if (onPress) onPress();
      }}
      style={{
        width: 40,
        height: 30,
        backgroundColor: 'transparent',
        borderColor: on ? 'lightgreen' : 'silver',
        borderWidth: 1,
        borderRadius: 20,
        alignItems: on ? 'flex-end' : 'flex-start',
        justifyContent: 'center',
      }}>
      <View
        style={{
          width: 24,
          height: 24,
          backgroundColor: on ? 'lightgreen' : 'silver',
          borderRadius: 12,
          marginEnd: on ? 2 : 0,
          marginStart: on ? 0 : 2,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        {showStatus && (
          <Text
            style={{fontSize: 9, fontWeight: 'bold', color: 'darkslategray'}}>
            {on ? 'ON' : 'OFF'}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

function AndroidPerms() {
  const [permissionGranted, setPermissionGranted] = useState(null);

  useEffect(() => {
    check = async () => {
      let allGranted = await requestPermissions();
      console.log(allGranted?.length > 0 ? '2 OK ' : '2 NOOO ', allGranted);
      setPermissionGranted(allGranted);
    };
    check();
  }, [setPermissionGranted]);

  const handleOpenSettings = () => {
    Linking.openSettings();
  };
  return (
    <Permission
      show={permissionGranted?.length > 0}
      title="Android permission required"
      message="You have to give some permission to the app in order for it to work correctly."
      onButtonPress={() => handleOpenSettings()}
    />
  );
}

export default function Home({route, navigation}) {
  const [isScanning, scan] = useState(false);
  const [bleStatus, setBLEStatus] = useState(
    BluetoothZ.Defines.BLE_ADAPTER_STATUS_UNKNOW,
  );
  const [devices, setDevices] = useState([]);
  const [allowDuplicates, setAllowDup] = useState(
    BluetoothZ.scanOptions.allowDuplicates,
  );
  const [filter, setFilter] = useState('PM9_201604');
  const [modal, setModal] = useState(undefined);

  useEffect(() => {
    console.log('=================>>>>>>>>>>>> ON');
    const statusListener = BluetoothZ.emitter.addListener(
      BluetoothZ.Defines.BLE_ADAPTER_STATUS_DID_UPDATE,
      ({status}) => {
        setBLEStatus(status);
      },
    );
    const deviceFoundListener = BluetoothZ.emitter.addListener(
      BluetoothZ.Defines.BLE_PERIPHERAL_FOUND,
      ({uuid, name, rssi}) => {
        setDevices(old => [
          ...old,
          {uuid, name, rssi, connected: false, ready: false},
        ]);
      },
    );
    const scanEndListener = BluetoothZ.emitter.addListener(
      BluetoothZ.Defines.BLE_ADAPTER_SCAN_END,
      () => {
        scan(false);
      },
    );
    const deviceConnectedListener = BluetoothZ.emitter.addListener(
      BluetoothZ.Defines.BLE_PERIPHERAL_CONNECTED,
      ({uuid}) => {
        console.log('QUIIIIIII');
        setDevices(old => {
          return old.map(d => {
            console.log('QUIIIIIII 2');
            if (d.uuid === uuid) {
              console.log('QUIIIIIII 3');
              return {...d, connected: true};
            }
            return d;
          });
        });
      },
    );
    const deviceDisconnectedListener = BluetoothZ.emitter.addListener(
      BluetoothZ.Defines.BLE_PERIPHERAL_DISCONNECTED,
      ({uuid}) => {
        setDevices(old => {
          return old.map(d => {
            if (d.uuid === uuid) {
              return {...d, connected: false, ready: false};
            }
            return d;
          });
        });
      },
    );
    const deviceReadyListener = BluetoothZ.emitter.addListener(
      BluetoothZ.Defines.BLE_PERIPHERAL_READY,
      ({uuid}) => {
        setDevices(old => {
          return old.map(d => {
            if (d.uuid === uuid) {
              return {...d, ready: true};
            }
            return d;
          });
        });
      },
    );
    BluetoothZ.adapterStatus();
    return function cleanUp() {
      console.log('=================>>>>>>>>>>>> OFF');
      statusListener?.remove();
      deviceFoundListener?.remove();
      deviceConnectedListener?.remove();
      deviceDisconnectedListener?.remove();
      deviceReadyListener?.remove();
      scanEndListener?.remove();
    };
  }, []);

  return (
    <View style={{backgroundColor: 'darkslategray', flex: 1}}>
      <SafeAreaView>
        <Header />
        {Platform.OS === 'android' && <AndroidPerms />}
      </SafeAreaView>
      <Modal
        animationType="slide"
        visible={false}
        transparent
        style={{height: 180}}>
        <View style={{backgroundColor: 'crimson', minHeight: 140}}>
          <SafeAreaView>
            <Text>AAA</Text>
          </SafeAreaView>
        </View>
      </Modal>
      <Section
        title={'Adapter status'}
        subtitle={'You can press the button to retrieve the status'}>
        <BleBulb
          status={bleStatus}
          requestAdapterStatus={async () => {
            const {status} = await BluetoothZ.adapterStatusSync();
            setBLEStatus(status);
          }}
        />
      </Section>
      {/* <ScrollView> */}
      {/* {devices.some(d => d.ready) && (
        <Section title={'Test'}>
          <View
            style={{
              flexDirection: 'row',
              width: '100%',
              alignItems: 'center',
              justifyContent: 'center',
              paddingHorizontal: 16,
              gap: 10,
            }}>
            <TouchableOpacity
              onPress={async () => {
                navigation.push('CommonTest', {
                  data: {
                    devices: devices.filter(d => d.ready),
                  },
                });
              }}
              style={{
                borderRadius: 20,
                padding: 10,
                backgroundColor: 'royalblue',
                alignItems: 'center',
                justifyContent: 'center',
                flex: 1,
                flexDirection: 'row',
                gap: 5,
              }}>
              <Text style={{color: 'snow', fontSize: 18}}>Parallel</Text>
              <Text
                style={{
                  color: 'snow',
                  fontWeight: 'bold',
                  fontSize: 18,
                }}>
                Test
              </Text>
            </TouchableOpacity>
          </View>
        </Section>
      )} */}
      <Section
        title={'Scan devices'}
        subtitle={'You can press the button to retrieve the status'}>
        <View
          style={{
            flexDirection: 'row',
            width: '100%',
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 16,
            gap: 10,
          }}>
          <Text style={{color: 'snow'}}>Filter:</Text>
          <TextInput
            value={filter}
            onChangeText={setFilter}
            placeholder="empty"
            placeholderTextColor="dimgray"
            style={{
              padding: 8,
              flex: 1,
              color: 'white',
              color: 'darkslategray',
              backgroundColor: 'gainsboro',
              borderRadius: 10,
              minHeight: 40,
            }}
          />
        </View>
        <View
          style={{
            flexDirection: 'row',
            width: '100%',
            paddingHorizontal: 10,
            gap: 10,
          }}>
          <TouchableOpacity
            onPress={() => {
              if (!isScanning) {
                setDevices(o => o.filter(d => d.connected));
                BluetoothZ.startScan({options: {allowDuplicates}, filter});
              } else {
                BluetoothZ.stopScan();
              }
              scan(old => !old);
            }}
            style={{
              borderRadius: 20,
              padding: 10,
              backgroundColor: !isScanning ? 'palegreen' : 'crimson',
              alignItems: 'center',
              justifyContent: 'center',
              flex: 1,
              flexDirection: 'row',
              gap: 5,
            }}>
            <Text style={{color: isScanning ? 'snow' : 'green', fontSize: 18}}>
              {isScanning ? 'Stop' : 'Start'}
            </Text>
            <Text
              style={{
                color: isScanning ? 'snow' : 'green',
                fontWeight: 'bold',
                fontSize: 18,
              }}>
              Scan
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={async () => {
              setDevices(o => o.filter(d => d.connected));
              try {
                const devs = await BluetoothZ.startScanSync({
                  options: {allowDuplicates},
                  filter,
                });
                console.log('===========???? ', devs);
                setDevices(
                  devs.map(d => {
                    return {...d, rssi: 60, connected: false, ready: false};
                  }),
                );
              } catch (error) {
                console.log('PROBLEM ------->', error);
                setDevices(o => o.filter(d => d.connected));
              }
            }}
            style={{
              borderRadius: 20,
              padding: 10,
              backgroundColor: 'lightblue',
              alignItems: 'center',
              justifyContent: 'center',
              flex: 1,
              flexDirection: 'row',
              gap: 5,
            }}>
            <Text style={{color: 'snow', fontSize: 18}}>'Start'</Text>
            <Text
              style={{
                color: 'snow',
                fontWeight: 'bold',
                fontSize: 18,
              }}>
              Scan Sync
            </Text>
          </TouchableOpacity>
        </View>
        <View
          style={{
            width: '100%',
            paddingHorizontal: 16,
          }}>
          <ScrollView
            style={{
              width: '100%',
            }}>
            {devices.map((d, index) => {
              return (
                <Device
                  disabled={isScanning}
                  name={d.name}
                  uuid={d.uuid}
                  connected={d.connected}
                  ready={d.ready}
                  key={`${d.uuid}${index}`}
                  onMore={async uuid => {
                    const res = await BluetoothZ.getAllCharacteristic({
                      uuid: d.uuid,
                    });
                    navigation.push('Characteristics', {
                      data: {
                        characteristics: res.characteristics,
                        name: d.name,
                        uuid: d.uuid,
                      },
                    });
                  }}
                  onPress={() => {
                    if (!d.connected) {
                      BluetoothZ.connect({uuid: d.uuid});
                    } else {
                      BluetoothZ.disconnect({uuid: d.uuid});
                    }
                  }}
                />
              );
            })}
            <View style={{minHeight: 600}} />
          </ScrollView>
        </View>
        {/* </ScrollView> */}
      </Section>
    </View>
  );
}
