import React, {useEffect, useState} from 'react';
import {
  Button,
  Modal,
  SafeAreaView,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  TouchableOpacity,
  View,
  TextInput,
  ScrollView,
} from 'react-native';

import {
  readCharacteristic,
  writeCharacteristic,
  emitter,
  Defines,
} from 'react-native-bluetoothz';

const styles = StyleSheet.create({
  overlay: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    flex: 1,
    justifyContent: 'flex-end',
  },
});

const chars =
  Platform.OS === 'android'
    ? [
        '00002a24-0000-1000-8000-00805f9b34fb',
        '00002a25-0000-1000-8000-00805f9b34fb',
        '00002a26-0000-1000-8000-00805f9b34fb',
        '00002a27-0000-1000-8000-00805f9b34fb',
        '00002a28-0000-1000-8000-00805f9b34fb',
        '00002a29-0000-1000-8000-00805f9b34fb',
      ]
    : ['2A28', '2A26', '2A29', '2A24', '2A25', '2A27'];

export default function CommonTest({route, navigation}) {
  const {data} = route.params;
  const [devices, setDevices] = useState(data?.devices);

  useEffect(() => {
    console.log('aaaaaaaaa', devices);
    if (devices?.length <= 0) {
      console.log('SSSSSSSSSSSSSSS', devices);
      navigation.goBack();
    }
  }, [devices]);

  useEffect(() => {
    const disconnectListener = emitter.addListener(
      Defines.BLE_PERIPHERAL_DISCONNECTED,
      ({uuid}) => {
        console.log('DISCONNETTO ', uuid);
        setDevices(devs => devs.filter(d => d.uuid !== uuid));
      },
    );

    const charReadListener = emitter.addListener(
      Defines.BLE_PERIPHERAL_CHARACTERISTIC_READ_OK,
      ({uuid, charUUID, value}) => {
        console.log('+ RD + DISPO:', uuid, 'CHAR:', charUUID, 'VALUE:', value);
      },
    );

    const charReadFailedListener = emitter.addListener(
      Defines.BLE_PERIPHERAL_CHARACTERISTIC_READ_FAILED,
      ({uuid, charUUID, error}) => {
        console.log(
          '+ RD ERR + DISPO:',
          uuid,
          'CHAR:',
          charUUID,
          'error:',
          error,
        );
      },
    );

    return function cleanUp() {
      console.log('=================>>>>>>>>>>>> OFF');
      disconnectListener?.remove();
      charReadListener?.remove();
      charReadFailedListener?.remove();
    };
  }, []);

  function start(devs) {
    console.log('GO !', Date.now());
    devs.forEach(dev => {
      chars.forEach(c => {
        readCharacteristic({uuid: dev.uuid, charUUID: c});
      });
    });
  }

  return (
    <View style={{backgroundColor: 'teal', flex: 1}}>
      <SafeAreaView>
        <View
          style={{
            height: 40,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 16,
          }}>
          <TouchableOpacity
            style={{flex: 1, justifyContent: 'center'}}
            onPress={() => navigation.goBack()}>
            <Text style={{color: 'white', fontWeight: 'bold'}}>← Back</Text>
          </TouchableOpacity>
          <Text
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              fontWeight: 'bold',
              fontSize: 16,
              color: 'white',
              textAlign: 'center',
            }}>
            Test
          </Text>
          <View style={{flex: 1}} />
        </View>
      </SafeAreaView>
      <View style={{backgroundColor: 'darkslategray', flex: 1, paddingTop: 10}}>
        <View
          style={{
            flexDirection: 'column',
            flex: 1,
            width: '100%',
            alignItems: 'stretch',
            justifyContent: 'flex-start',
            paddingHorizontal: 16,
            gap: 10,
          }}>
          <TouchableOpacity
            onPress={async () => {
              start(devices);
            }}
            style={{
              borderRadius: 20,
              padding: 10,
              backgroundColor: 'royalblue',
              alignItems: 'center',
              justifyContent: 'center',
              // flex: 1,
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
          <TouchableOpacity
            onPress={async () => {
              console.log('GO !', Date.now());
              setTimeout(
                () =>
                  // {
                  //   for (let i = 0; i < 100; i++) {
                  //     let d = devices[0];
                  //     let c = chars[2];
                  //     readCharacteristic({uuid: d.uuid, charUUID: c});
                  //     c = chars[3];
                  //     readCharacteristic({uuid: d.uuid, charUUID: c});
                  //     d = devices[1];
                  //     c = chars[0];
                  //     readCharacteristic({uuid: d.uuid, charUUID: c});
                  //     c = chars[1];
                  //     readCharacteristic({uuid: d.uuid, charUUID: c});
                  //   }
                  // },
                  devices.forEach(dev => {
                    // const c = chars[0];
                    for (let i = 0; i < 100; i++) {
                      chars.forEach(c => {
                        readCharacteristic({uuid: dev.uuid, charUUID: c});
                      });
                    }
                  }),
                2000,
              );
            }}
            style={{
              borderRadius: 20,
              padding: 10,
              backgroundColor: 'coral',
              alignItems: 'center',
              justifyContent: 'center',
              // flex: 1,
              flexDirection: 'row',
              gap: 5,
            }}>
            <Text style={{color: 'snow', fontSize: 18}}>Disconnect</Text>
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
      </View>
    </View>
  );
}
