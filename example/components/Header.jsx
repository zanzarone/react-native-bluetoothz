import {useEffect, useState} from 'react';
import {Image, Text, TouchableOpacity, View} from 'react-native';
import * as BluetoothZ from 'react-native-bluetoothz';

export default function Header({
  status,
  canScan = false,
  canBrowseFile = false,
  onBrowseButtonPressed,
}) {
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
        backgroundColor: status === true ? '#D4F174' : 'coral',
        gap: 5,
      }}>
      <View style={{alignItems: 'center', flexDirection: 'row'}}>
        <Image
          style={{height: 50, width: 50}}
          source={require('../assets/icon/logo-100.png')}
        />
        <Text
          style={{color: 'black', fontFamily: 'Nunito-Black', fontSize: 20}}>
          BluetoothZ
        </Text>
      </View>
      <View style={{alignItems: 'center', flexDirection: 'row', gap: 5}}>
        {canBrowseFile && (
          <TouchableOpacity
            disabled={status !== true}
            onPress={() => {
              onBrowseButtonPressed && onBrowseButtonPressed();
            }}>
            <Image
              resizeMode="contain"
              style={{
                height: 34,
                width: 34,
                opacity: status !== true ? 0.2 : 1,
              }}
              source={require('../assets/icon/add-file-100.png')}
            />
          </TouchableOpacity>
        )}
        {canScan && (
          <TouchableOpacity
            disabled={status !== true}
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
              style={{
                height: 34,
                width: 34,
                opacity: status !== true ? 0.2 : 1,
              }}
              source={
                !isScanning
                  ? require('../assets/icon/play-100.png')
                  : require('../assets/icon/stop-100.png')
              }
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
