import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {useEffect, useState} from 'react';
import * as BluetoothZ from 'react-native-bluetoothz';
import Header from '../components/Header';
// import Progress from '../components/Progress';
import DocumentPicker from 'react-native-document-picker';
import Toast from '../components/Toast';

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

export default function DFUScreen({navigation}) {
  const [modalAlert, setModalAlert] = useState(undefined);
  const [bluetoothStatus, setBluetoothStatus] = useState(undefined);
  const [dfu, setDfu] = useState({});

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
    BluetoothZ.adapterStatus();
    return function cleanup() {
      bleAdapterListener?.remove();
    };
  }, []);
  return (
    <View style={{flex: 1, backgroundColor: 'snow'}}>
      <Header
        status={bluetoothStatus}
        canBrowseFile
        onBrowseButtonPressed={() => {
          pickDocument();
        }}
      />
      <View
        style={[
          styles.oval,
          {backgroundColor: bluetoothStatus === true ? '#D4F174' : 'coral'},
        ]}
      />
      <Toast state={modalAlert} />
      <View
        style={{
          flex: 1,
          alignItems: 'center',
        }}>
        <View
          style={{
            flex: 1,
            flexDirection: 'column',
            // paddingTop: '5%',
            width: '100%',
            alignItems: 'center',
            gap: 15,
          }}>
          <View>
            <Text
              style={{
                fontFamily: 'Nunito-Black',
                color: 'black',
                fontSize: 20,
                textAlign: 'center',
              }}>
              Status
            </Text>
            <Text
              style={{
                fontFamily: 'Nunito-Bold',
                color: 'black',
                fontSize: 20,
                textAlign: 'center',
              }}>
              Idle
            </Text>
          </View>
          <View
            style={{height: 120, width: 120, backgroundColor: 'transparent'}}>
            <Text
              style={{
                position: 'absolute',
                fontFamily: 'Nunito-Black',
                color: 'black',
                fontSize: 20,
                top: 47,
                left: 0,
                right: 0,
                textAlign: 'center',
              }}>
              {dfu?.progress >= 0 ? `${dfu?.progress}%` : '0%'}
            </Text>
            <View
              style={{
                position: 'absolute',
                backgroundColor: 'goldenrod',
                //   borderRadius: 5,
                top: 27,
                left: 27,
                height: 70,
                width: dfu?.progress >= 0 ? (dfu?.progress * 66) / 100 : 0,
              }}
            />
            <Image
              style={{height: 120, width: 120}}
              source={require('../assets/icon/processor.png')}
            />
          </View>
          <View>
            <View style={{flexDirection: 'row', gap: 5}}>
              <Text
                style={{
                  fontFamily: 'Nunito-Black',
                  color: 'black',
                  fontSize: 20,
                  textAlign: 'center',
                }}>
                File selected:
              </Text>
              <Text
                style={{
                  fontFamily: 'Nunito-Regular',
                  color: 'black',
                  fontSize: 20,
                  textAlign: 'center',
                }}>
                No file
              </Text>
            </View>
          </View>
          <View style={{flexDirection: 'row', gap: 10}}>
            <TouchableOpacity
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'row',
                backgroundColor: 'black',
                width: 60,
                height: 60,
                borderRadius: 30,
                opacity:
                  dfu?.status !==
                  BluetoothZ.Defines.BLE_PERIPHERAL_DFU_STATUS_UPLOADING
                    ? 0.6
                    : 1,
              }}
              onPress={() => {
                setModalAlert({
                  icon: require('../assets/icon/back-100.png'),
                  text: 'Soka',
                });
                setTimeout(() => {
                  setModalAlert(undefined);
                }, 5000);
              }}>
              <Image
                style={{
                  height: 34,
                  width: 34,
                }}
                resizeMode="contain"
                source={require('../assets/icon/back-100.png')}
              />
            </TouchableOpacity>

            {dfu?.fwFile && (
              <TouchableOpacity
                style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'row',
                  backgroundColor: 'black',
                  width: 60,
                  height: 60,
                  borderRadius: 30,
                }}
                onPress={() => {}}>
                <Image
                  style={{
                    height: 34,
                    width: 34,
                  }}
                  resizeMode="contain"
                  source={require('../assets/icon/upload-100.png')}
                />
              </TouchableOpacity>
            )}
            {dfu?.status ===
              BluetoothZ.Defines.BLE_PERIPHERAL_DFU_STATUS_UPLOADING && (
              <TouchableOpacity
                style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'row',
                  backgroundColor: 'black',
                  width: 60,
                  height: 60,
                  borderRadius: 30,
                }}
                onPress={() => {}}>
                <Image
                  style={{
                    height: 34,
                    width: 34,
                  }}
                  resizeMode="contain"
                  source={require('../assets/icon/pause-100.png')}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
