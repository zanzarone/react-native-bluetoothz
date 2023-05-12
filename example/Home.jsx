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

function BleBulb({status, requestAdapterStatus}) {
  // console.log(status);
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
}) => (
  <View
    style={{
      minHeight: 70,
      borderBottomColor: 'gray',
      borderBottomWidth: 1,
      // alignItems: 'center',
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
        // alignItems: 'center',
        justifyContent: 'space-between',
        // height: '100%',
        flex: 1,
      }}>
      <TouchableOpacity
        style={{flex: 2, justifyContent: 'center'}}
        disabled={disabled}
        onPress={() => {
          onPress();
        }}>
        <Text style={{fontWeight: 'bold', color: disabled ? 'gray' : 'snow'}}>
          {name}
        </Text>
        <Text
          style={{
            fontSize: 9,
            fontStyle: 'italic',
            color: disabled ? 'gray' : 'snow',
          }}>
          {uuid}
        </Text>
      </TouchableOpacity>
      <View
        style={{
          flex: 1,
          gap: 10,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'flex-end',
        }}>
        {true && (
          <TouchableOpacity
            disabled={disabled}
            onPress={() => {
              onMore(uuid);
            }}
            style={{
              // backgroundColor: 'lightgreen',
              height: 26,
              width: 26,
              borderRadius: 10,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Text style={{color: 'white', fontSize: 13}}>▶︎</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  </View>
);

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
        width: 50,
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
  const [filter, setFilter] = useState('PC8');
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
            // alignItems: 'center',
            // justifyContent: 'center',
            paddingHorizontal: 10,
            gap: 10,
          }}>
          {/* <Text style={{color: 'snow'}}>Allow duplicates:</Text>
          <Switch
            on={allowDuplicates}
            onPress={() => {
              setAllowDup(old => !old);
            }}
          /> */}
          <TouchableOpacity
            onPress={() => {
              if (!isScanning) {
                setDevices([]);
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
              // marginHorizontal: 16,
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
          {/* <TouchableOpacity
            onPress={() => requestAdapterStatus()}
            style={{
              borderRadius: 18,
              padding: 10,
              backgroundColor: 'lightblue',
              alignItems: 'center',
              justifyContent: 'center',
              flex: 1,
              // marginHorizontal: 16,
              flexDirection: 'row',
              gap: 5,
            }}>
            <Text style={{color: 'darkslategray', fontSize: 18}}>Scan</Text>
            <Text
              style={{
                color: 'darkslategray',
                fontWeight: 'bold',
                fontSize: 18,
              }}>
              Settings
            </Text>
          </TouchableOpacity> */}
          {/* <TouchableOpacity
            onPress={() => {
              if (!isScanning) {
                setDevices([]);
                BluetoothZ.startScan({options: {allowDuplicates}, filter});
              } else {
                BluetoothZ.stopScan();
              }
              scan(old => !old);
            }}
            style={{
              backgroundColor: !isScanning ? 'palegreen' : 'crimson',
              padding: 10,
              borderRadius: 20,
              flex: 1,
              alignItems: 'center',
            }}>
            <Text
              style={{
                color: isScanning ? 'snow' : 'green',
                fontSize: 16,
              }}>
              {isScanning ? 'Stop scan' : 'Start scan'}
            </Text>
          </TouchableOpacity> */}
        </View>
        <View
          style={{
            width: '100%',
            paddingHorizontal: 16,
          }}>
          <ScrollView
            style={{
              width: '100%',
              // backgroundColor: 'red',
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
