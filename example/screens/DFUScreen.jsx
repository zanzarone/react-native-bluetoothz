import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {useEffect, useRef, useState} from 'react';
import * as BluetoothZ from 'react-native-bluetoothz';
import Header from '../components/Header';
// import Progress from '../components/Progress';
import DocumentPicker from 'react-native-document-picker';
import Toast from '../components/Toast';
import BackgroundShape from '../components/BackgroundShape';

const pickFirmwareFile = async () => {
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

const DFUStatusDescription = ({status = undefined}) => {
  return (
    <View>
      <Text
        style={{
          fontFamily: 'Nunito-Black',
          color: 'black',
          fontSize: 20,
          textAlign: 'center',
        }}>
        Status:
      </Text>
      <Text
        style={{
          fontFamily: 'Nunito-Italic',
          color: 'black',
          fontSize: 18,
          textAlign: 'center',
        }}>
        {status ? status : 'Idle'}
      </Text>
    </View>
  );
};

const DFUShowProgress = ({progress = undefined}) => {
  return (
    <View style={{height: 120, width: 120, backgroundColor: 'transparent'}}>
      <Text
        style={{
          position: 'absolute',
          zIndex: 2000,
          fontFamily: 'Nunito-Black',
          color: 'black',
          fontSize: 20,
          top: 47,
          left: 0,
          right: 0,
          textAlign: 'center',
        }}>
        {progress >= 0 ? `${progress}%` : '0%'}
      </Text>
      <View
        style={{
          position: 'absolute',
          backgroundColor: 'goldenrod',
          //   borderRadius: 5,
          top: 27,
          left: 27,
          height: 70,
          width: progress >= 0 ? (progress * 66) / 100 : 0,
        }}
      />
      <Image
        style={{height: 120, width: 120}}
        source={require('../assets/icon/processor.png')}
      />
    </View>
  );
};

const DFUFirmwareFile = ({fwFile = undefined}) => {
  return (
    <View>
      <View style={{flexDirection: 'column', gap: 5}}>
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
            fontFamily: 'Nunito-Italic',
            color: 'black',
            fontSize: 18,
            textAlign: 'center',
          }}>
          {fwFile ? fwFile?.name : 'None'}
        </Text>
      </View>
    </View>
  );
};

const Controls = ({
  navigation,
  status = undefined,
  fwFile = undefined,
  onExit,
  onStart,
  onPause,
  onResume,
}) => {
  return (
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
          opacity: status !== 'upload' ? 1 : 0.6,
        }}
        onPress={() => {
          if (!status) {
            if (!fwFile) {
              navigation.goBack();
              return;
            } else {
              onExit && onExit();
            }
          }
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
      {fwFile && (
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
          onPress={() => {
            onStart && onStart();
          }}>
          {status === undefined && (
            <Image
              style={{
                height: 34,
                width: 34,
              }}
              resizeMode="contain"
              source={require('../assets/icon/upload-100.png')}
            />
          )}
          {status !== undefined && (
            <Image
              style={{
                height: 34,
                width: 34,
              }}
              resizeMode="contain"
              source={require('../assets/icon/cancel-100.png')}
            />
          )}
        </TouchableOpacity>
      )}
      {(status === 'upload' || status === 'paused') && (
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
          onPress={() => {
            if (status === 'upload') {
              onPause && onPause();
              return;
            }
            if (status === 'paused') {
              onResume && onResume();
              return;
            }
          }}>
          {status === 'upload' && (
            <Image
              style={{
                height: 34,
                width: 34,
              }}
              resizeMode="contain"
              source={require('../assets/icon/pause-b-100.png')}
            />
          )}
          {status === 'paused' && (
            <Image
              style={{
                height: 34,
                width: 34,
              }}
              resizeMode="contain"
              source={require('../assets/icon/resume-b-100.png')}
            />
          )}
        </TouchableOpacity>
      )}
    </View>
  );
};

export default function DFUScreen({navigation}) {
  const [modalAlert, setModalAlert] = useState(undefined);
  const [bluetoothStatus, setBluetoothStatus] = useState(undefined);
  const [dfu, setDfu] = useState({
    status: undefined,
    progress: undefined,
    fwFile: undefined,
  });
  const testTimer = useRef(undefined);

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
        onBrowseButtonPressed={async () => {
          const fwFile = await pickFirmwareFile();
          if (fwFile) {
            setDfu(old => {
              return {...old, fwFile};
            });
          }
        }}
      />
      <BackgroundShape bleStatus={bluetoothStatus} />
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
          <DFUStatusDescription status={dfu?.status} />
          <DFUShowProgress progress={dfu?.progress} />
          <DFUFirmwareFile fwFile={dfu?.fwFile} />
          <Controls
            navigation={navigation}
            status={dfu?.status}
            fwFile={dfu?.fwFile}
            onExit={() => {
              setModalAlert({
                type: 'warn',
                text: 'Are you sure you want to go back?',
                userInput: [
                  {
                    callback: () => {
                      navigation.goBack();
                    },
                    name: 'OK',
                  },
                  {
                    callback: () => {
                      setModalAlert(undefined);
                    },
                    name: 'Cancel',
                  },
                ],
              });
              // setTimeout(() => {
              //   setModalAlert(undefined);
              // }, 5000);
            }}
            onStart={() => {
              testTimer.current = setInterval(() => {
                setDfu(o => {
                  if (!o.progress || o.progress + 1 <= 100)
                    return {
                      ...o,
                      status: 'upload',
                      progress: o.progress >= 0 ? o.progress + 1 : 0,
                    };
                  clearInterval(testTimer.current);
                  return {...o, progress: 0, status: undefined};
                });
              }, 1000);
            }}
            onPause={() => {
              setDfu(o => {
                return {...o, status: 'paused'};
              });
              clearInterval(testTimer.current);
            }}
            onResume={() => {
              testTimer.current = setInterval(() => {
                setDfu(o => {
                  if (!o.progress || o.progress + 1 <= 100)
                    return {
                      ...o,
                      status: 'upload',
                      progress: o.progress >= 0 ? o.progress + 1 : 0,
                    };
                  clearInterval(testTimer.current);
                  return {...o, progress: 0, status: undefined};
                });
              }, 1000);
            }}
          />
        </View>
      </View>
    </View>
  );
}
