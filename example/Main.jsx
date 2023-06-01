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

const Header = ({}) => {
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
        alignItems: 'center',
        justifyContent: 'space-between',
        flexDirection: 'row',
        paddingHorizontal: 15,
        paddingVertical: 7,
        backgroundColor: '#D4F174',
        gap: 5,
      }}>
      {/* <Text style={{color: 'black', fontFamily: 'Nunito-Black', fontSize: 30}}>
        BluetoothZ
      </Text> */}
      <View style={{alignItems: 'center', flexDirection: 'row'}}>
        <Image
          style={{height: 50, width: 50}}
          source={require('./assets/icon/logo-100.png')}
        />
        <Text
          style={{color: 'black', fontFamily: 'Nunito-Black', fontSize: 20}}>
          BluetoothZ
        </Text>
      </View>
      <View style={{alignItems: 'center', flexDirection: 'row', gap: 5}}>
        <TouchableOpacity>
          <Image
            resizeMode="contain"
            style={{height: 34, width: 34}}
            source={require('./assets/icon/add-file-100.png')}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={async () => {
            if (!isScanning) {
              BluetoothZ.startScan({});
            } else {
              BluetoothZ.stopScan();
            }
            setScanning(o => !o);
          }}>
          <Image
            resizeMode="contain"
            style={{height: 34, width: 34}}
            source={
              !isScanning
                ? require('./assets/icon/play-100.png')
                : require('./assets/icon/stop-100.png')
            }
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const DevicesList = ({}) => {
  const [devices, setDevices] = useState([]);

  useEffect(() => {
    const stopScanListener = BluetoothZ.emitter.addListener(
      BluetoothZ.Defines.BLE_PERIPHERAL_FOUND,
      ({uuid, name, rssi}) => {
        setDevices(old => {
          return [...old, {uuid, name, rssi, connected: false, ready: false}];
        });
      },
    );
    return function cleanup() {
      stopScanListener?.remove();
    };
  }, []);
  return (
    <ScrollView style={{}}>
      {devices.map(device => (
        <View
          key={device.uuid}
          style={{
            marginHorizontal: 5,
            marginBottom: 5,
            minHeight: 120,
            flexDirection: 'row',
            paddingVertical: 15,
            paddingHorizontal: 10,
            gap: 15,
            borderBottomColor: 'black',
            borderBottomWidth: 1,
          }}>
          <View
            style={{
              backgroundColor: 'transparent',
              justifyContent: 'center',
            }}>
            <View
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
                source={require('./assets/icon/device-100.png')}
              />
            </View>
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
                SRM_PM9_201604
              </Text>
              {/* <View style={{flexDirection: 'row', gap: 4}}>
                <View
                  style={{
                    backgroundColor: '#FAF4F2',
                    height: 28,
                    width: 28,
                    borderRadius: 14,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <Image
                    style={{height: 20, width: 20}}
                    source={require('./assets/icon/good-signal-100.png')}
                  />
                </View>
                <View
                  style={{
                    backgroundColor: 'pink',
                    height: 28,
                    width: 28,
                    borderRadius: 14,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <Image
                    style={{height: 20, width: 20}}
                    source={require('./assets/icon/good-signal-100.png')}
                  />
                </View>
              </View> */}
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
                00001530-1212-EFDE-1523-785FEABCD123
              </Text>
            </View>
            <View
              style={{
                flex: 1,
                alignItems: 'center',
                flexDirection: 'row',
                gap: 5,
              }}>
              <Image
                style={{height: 20, width: 20}}
                source={require('./assets/icon/good-signal-100.png')}
              />
              <Text
                style={{
                  fontFamily: 'Nunito-Regular',
                  color: 'black',
                }}>
                -92dBm
              </Text>
              <Text
                style={{
                  fontFamily: 'Nunito-BoldItalic',
                  color: 'green',
                }}>
                Connected
              </Text>
            </View>
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

export default function Main({navigation}) {
  return (
    <View style={{flex: 1, backgroundColor: 'snow'}}>
      <Header />
      <View style={styles.oval} />
      <DevicesList />
    </View>
  );
}

const styles = StyleSheet.create({
  parent: {
    height: '50%',
    width: '100%',
    zIndex: 100,
    transform: [{scaleX: 2}],
    borderBottomStartRadius: 200,
    borderBottomEndRadius: 1000,
    overflow: 'hidden',
  },
  child: {
    flex: 1,
    transform: [{scaleX: 0.5}],
    backgroundColor: '#D4F174',
    borderColor: 'black',
    alignItems: 'center',
  },
  oval: {
    position: 'absolute',
    top: 0,
    left: '25%',
    // right: 0,
    zIndex: -1,
    width: '130%',
    height: '60%',
    borderRadius: 240,
    backgroundColor: '#D4F174',
    transform: [{scaleX: 2}],
  },
});
