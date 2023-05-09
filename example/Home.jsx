import React, {useEffect, useState} from 'react';
import {
  Button,
  FlatList,
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
} from 'react-native';

import * as BluetoothZ from 'react-native-bluetoothz';

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
            }}>
            <Text style={{color: 'green', fontWeight: 'bold', fontSize: 20}}>
              On
            </Text>
          </TouchableOpacity>
        )}
        {status === BluetoothZ.Defines.BLE_ADAPTER_STATUS_POWERED_OFF && (
          <TouchableOpacity
            onPress={() => requestAdapterStatus()}
            style={{
              // height: 40,
              // width: 40,
              borderRadius: 5,
              padding: 10,
              backgroundColor: 'red',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Text style={{color: 'white', fontWeight: 'bold', fontSize: 20}}>
              Off
            </Text>
          </TouchableOpacity>
        )}
        {status === BluetoothZ.Defines.BLE_ADAPTER_STATUS_UNKNOW && (
          <TouchableOpacity
            onPress={() => requestAdapterStatus()}
            style={{
              // height: 40,
              // width: 40,
              borderRadius: 5,
              padding: 10,
              backgroundColor: 'black',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Text style={{color: 'silver', fontWeight: 'bold', fontSize: 20}}>
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

const Device = ({title, selected, pressed}) => (
  <TouchableOpacity
    onPress={() => pressed()}
    style={{
      backgroundColor: selected ? 'skyblue' : 'transparent',
      padding: 5,
      marginVertical: 1,
      flexDirection: 'row',
      width: '100%',
    }}>
    <Text style={{}}>{selected ? 'v' : 'x'}</Text>
    <Text style={{paddingHorizontal: 16}}>{title}</Text>
  </TouchableOpacity>
);

function Header() {
  return (
    <View
      style={{
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
        borderColor: on ? 'lightgreen' : 'tomato',
        borderWidth: 1,
        borderRadius: 20,
        alignItems: on ? 'flex-end' : 'flex-start',
        justifyContent: 'center',
      }}>
      <View
        style={{
          width: 24,
          height: 24,
          backgroundColor: on ? 'lightgreen' : 'tomato',
          borderRadius: 12,
          marginEnd: on ? 2 : 0,
          marginStart: on ? 0 : 2,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        {showStatus && (
          <Text style={{fontSize: 9, fontWeight: 'bold', color: 'royalblue'}}>
            {on ? 'ON' : 'OFF'}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

export default function Home() {
  const [bleStatus, setBLEStatus] = useState(
    BluetoothZ.Defines.BLE_ADAPTER_STATUS_UNKNOW,
  );
  const [devices, setDevices] = useState([]);
  const [allowDuplicates, setAllowDup] = useState(
    BluetoothZ.scanOptions.allowDuplicates,
  );
  const [isScanning, scan] = useState(false);
  const [filter, setFilter] = useState('');

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
        setDevices(old => [...old, {uuid, name, rssi, selected: false}]);
      },
    );
    BluetoothZ.adapterStatus();
    return function cleanUp() {
      console.log('=================>>>>>>>>>>>> OFF');
      statusListener?.remove();
      deviceFoundListener?.remove();
    };
  }, []);

  return (
    <SafeAreaView style={{backgroundColor: 'royalblue', flex: 1}}>
      <Header />
      <ScrollView>
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
            <Text style={{color: 'snow'}}>Allow duplicates:</Text>
            <Switch
              on={allowDuplicates}
              onPress={() => {
                setAllowDup(old => !old);
              }}
            />
            <TouchableOpacity
              onPress={() => {
                setDevices([]);
                console.log('mandoooo', filter);
                BluetoothZ.startScan({allowDuplicates, filter});
              }}
              style={{
                backgroundColor: 'navy',
                padding: 10,
                borderRadius: 20,
                flex: 1,
                alignItems: 'center',
              }}>
              <Text style={{color: 'white', fontSize: 16, fontWeight: 'bold'}}>
                Start scan
              </Text>
            </TouchableOpacity>
          </View>
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
                backgroundColor: 'snow',
                color: 'white',
                borderRadius: 5,
                color: 'navy',
              }}
            />
          </View>
          <ScrollView style={{height: 150, width: '100%'}}>
            {devices.map((d, index) => {
              return (
                <Device
                  title={d.name}
                  selected={d.selected}
                  key={`${d.uuid}${index}`}
                  pressed={() =>
                    setDevices(old => {
                      return old.map(dev => {
                        if (dev.uuid === d.uuid)
                          return {...dev, selected: !dev.selected};
                        return dev;
                      });
                    })
                  }
                />
              );
            })}
          </ScrollView>
          {/* <FlatList
            data={devices}
            style={{
              width: '100%',
            }}
            renderItem={({item}) => <Device title={item.name} />}
            keyExtractor={item => item.id}
          /> */}
        </Section>
        {devices.some(d => d.selected) && (
          <Section title={'Connect to device'} subtitle={'Connect devices'}>
            <TouchableOpacity
              onPress={() => {
                setDevices([]);
                console.log('mandoooo', filter);
                BluetoothZ.startScan({allowDuplicates, filter});
              }}
              style={{
                backgroundColor: 'navy',
                padding: 10,
                borderRadius: 20,
                flex: 1,
                alignItems: 'center',
              }}>
              <Text style={{color: 'white', fontSize: 16, fontWeight: 'bold'}}>
                Connect
              </Text>
            </TouchableOpacity>
          </Section>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
