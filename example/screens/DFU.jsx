import {Image, Platform, Text, View} from 'react-native';
import {useEffect, useRef, useState} from 'react';
import * as BluetoothZ from 'react-native-bluetoothz';
import Header from '../components/Header';
import DocumentPicker from 'react-native-document-picker';
import Toast from '../components/Toast';
import BackgroundShape from '../components/BackgroundShape';
import RoundButton from '../components/RoundButton';
import TouchableDebounce from '../components/TouchableDebounce';

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

const DFUStatusDescription = ({
  status = undefined,
  description = undefined,
}) => {
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
        {description ? description : 'Idle'}
      </Text>
    </View>
  );
};

const DFUDevice = ({devices = undefined, index = 0, onNext, onPrevious}) => {
  return (
    <View
      style={{
        // backgroundColor: 'pink',
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
      }}>
      <View style={{backgroundColor: 'transparent', height: 30, width: 30}}>
        {/* {devices.length > 1 && index > 0 && (
          <TouchableDebounce
            onPress={() => onPrevious()}
            style={{
              backgroundColor: 'black',
              borderRadius: 15,
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Image
              style={{
                height: 20,
                width: 20,
              }}
              resizeMode="contain"
              source={require('../assets/icon/back-100.png')}
            />
          </TouchableDebounce>
        )} */}
      </View>
      <View>
        <Text
          style={{
            fontFamily: 'Nunito-Black',
            color: 'black',
            fontSize: 22,
            textAlign: 'center',
          }}>
          {devices?.length ? devices[index]?.name : '-'}
        </Text>
        <Text
          style={{
            fontFamily: 'Nunito-Bold',
            color: 'black',
            fontSize: 20,
            textAlign: 'center',
          }}>
          {`(Device ${index + 1} of ${devices?.length})`}
        </Text>
      </View>
      <View style={{backgroundColor: 'transparent', height: 30, width: 30}}>
        {/* {devices.length > 1 && index < devices.length - 1 && (
          <TouchableDebounce
            onPress={() => onNext()}
            style={{
              backgroundColor: 'black',
              borderRadius: 15,
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Image
              style={{
                height: 20,
                width: 20,
              }}
              resizeMode="contain"
              source={require('../assets/icon/forward-100.png')}
            />
          </TouchableDebounce>
        )} */}
      </View>
    </View>
  );
};

const DFUShowProgress = ({progress = undefined}) => {
  // console.log('SOOOOOOOOOKA', progress);
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
          // backgroundColor: 'goldenrod',
          backgroundColor: 'springgreen',
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
  status = undefined,
  fwFile = undefined,
  onFwFileSelected,
  onStart,
  onPause,
  onResume,
  onAbort,
}) => {
  return (
    <View style={{flexDirection: 'row', gap: 10}}>
      {!fwFile && (
        <RoundButton
          onPress={async () => {
            const fwFile = await pickFirmwareFile();
            if (fwFile) {
              onFwFileSelected && onFwFileSelected(fwFile);
            }
          }}
          iconSize={{height: 34, width: 34}}
          icon={require('../assets/icon/folder-100.png')}
        />
      )}
      {fwFile && status === undefined && (
        <RoundButton
          onPress={() => {
            onStart && onStart();
          }}
          iconSize={{height: 34, width: 34}}
          icon={require('../assets/icon/upload-100.png')}
        />
      )}
      {fwFile && status !== undefined && (
        <RoundButton
          onPress={() => {
            onAbort && onAbort();
          }}
          iconSize={{height: 34, width: 34}}
          icon={require('../assets/icon/cancel-100.png')}
        />
      )}
      {(status === BluetoothZ.Defines.BLE_PERIPHERAL_DFU_STATUS_UPLOADING ||
        status === BluetoothZ.Defines.BLE_PERIPHERAL_DFU_PROCESS_RESUMED) && (
        <RoundButton
          onPress={() => {
            onPause && onPause();
          }}
          iconSize={{height: 34, width: 34}}
          icon={require('../assets/icon/pause-b-100.png')}
        />
      )}
      {status === BluetoothZ.Defines.BLE_PERIPHERAL_DFU_PROCESS_PAUSED && (
        <RoundButton
          onPress={() => {
            onResume && onResume();
          }}
          iconSize={{height: 34, width: 34}}
          icon={require('../assets/icon/resume-b-100.png')}
        />
      )}
    </View>
  );
};

export default function DFU({navigation, route}) {
  const {devices} = route.params;
  // console.log('======>', uuid, name);
  const [modalAlert, setModalAlert] = useState(undefined);
  const [bluetoothStatus, setBluetoothStatus] = useState(undefined);
  const [dfu, setDfu] = useState({
    currentDeviceIndex: 0,
    currentDeviceUUID: undefined,
    status: undefined,
    description: undefined,
    progress: undefined,
    fwFile: undefined,
  });

  async function initDFU({uuid}) {
    // const {uuid} = devices[dfu?.currentDeviceIndex];
    const fwFile = dfu?.fwFile;
    console.log('1 ==============>', uuid, fwFile);
    if (Platform.OS === 'android') {
      try {
        await BluetoothZ.connectSync({uuid});
      } catch (error) {
        console.log(error, BluetoothZ);
        setModalAlert({
          type: 'error',
          text: 'Could not connect to selected device',
        });
        setTimeout(() => setModalAlert(undefined), 3000);
        return;
      }
    }
    BluetoothZ.startDFU({
      uuid,
      filePath: fwFile.fileCopyUri,
      pathType:
        Platform.OS === 'ios'
          ? BluetoothZ.Defines.FILE_PATH_TYPE_STRING
          : BluetoothZ.Defines.FILE_PATH_TYPE_URL,
    });
  }

  function nextUpdate({error}) {
    if (dfu?.currentDeviceIndex + 1 < devices.length) {
      const {uuid} = devices[dfu?.currentDeviceIndex + 1];
      initDFU({uuid});
      setDfu(o => {
        return {...o, currentDeviceIndex: o.currentDeviceIndex + 1};
      });
    } else {
      /// ho finito, ripulisco
      setDfu({currentDeviceIndex: 0});
      setModalAlert({type: 'error', text: error});
      setTimeout(() => setModalAlert(undefined), 3000);
    }
  }

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

    const blePeripheralDfuScanFailedListener = BluetoothZ.emitter.addListener(
      BluetoothZ.Defines.DFU_SCAN_FAILED,
      ({uuid}) => {
        nextUpdate({error: 'Could not start scan process!'});
      },
    );

    const blePeripheralDfuIntNotFoundListener = BluetoothZ.emitter.addListener(
      BluetoothZ.Defines.DFU_INTERFACE_NOT_FOUND,
      () => {
        nextUpdate({error: 'Could not find DFU enabled interface!'});
      },
    );

    const blePeripheralDfuConnectFailedListener =
      BluetoothZ.emitter.addListener(
        BluetoothZ.Defines.DFU_INTERFACE_CONNECT_FAILED,
        ({uuid}) => {
          nextUpdate({
            error: 'Could not connect to discovered DFU interface interface!',
          });
        },
      );

    const dfuFailedListener = BluetoothZ.emitter.addListener(
      BluetoothZ.Defines.BLE_PERIPHERAL_DFU_PROCESS_FAILED,
      ({uuid, error, errorCode}) => {
        console.log(
          '+ DFU + BLE_PERIPHERAL_DFU_PROCESS_FAILED:',
          uuid,
          'error:',
          error,
        );
        /// Mandare alert poi proseguo con il dispo seguente
        if (errorCode !== BluetoothZ.Defines.DFU_ERROR_DEVICE_DISCONNECTED) {
          nextUpdate({error});
        }
      },
    );

    const PIPPO = BluetoothZ.emitter.addListener(
      BluetoothZ.Defines.BLE_PERIPHERAL_DFU_PROCESS_PAUSE_FAILED,
      event => {
        console.log('+ DFU + BLE_PERIPHERAL_DFU_PROCESS_PAUSE_FAILED:', event);
      },
    );

    const dfuStatusListener = BluetoothZ.emitter.addListener(
      BluetoothZ.Defines.BLE_PERIPHERAL_DFU_STATUS_DID_CHANGE,
      ({
        uuid,
        status,
        description,
        progress = undefined,
        currentSpeedBytesPerSecond,
        avgSpeedBytesPerSecond,
      }) => {
        console.log(
          '+ DFU + BLE_PERIPHERAL_DFU_STATUS_DID_CHANGE:',
          uuid,
          'status:',
          status,
        );
        switch (status) {
          case BluetoothZ.Defines.BLE_PERIPHERAL_DFU_STATUS_STARTING: {
            setDfu(d => {
              return {...d, currentDeviceUUID: uuid};
            });
            break;
          }
          case BluetoothZ.Defines.BLE_PERIPHERAL_DFU_STATUS_COMPLETED: {
            if (dfu?.currentDeviceIndex + 1 < devices.length) {
              const {uuid} = devices[dfu?.currentDeviceIndex + 1];
              initDFU({uuid});
              setDfu(o => {
                return {
                  ...o,
                  status,
                  description,
                  currentDeviceIndex: o.currentDeviceIndex + 1,
                };
              });
            } else {
              setDfu({
                currentDeviceIndex: 0,
                currentDeviceUUID: undefined,
                status: undefined,
                progress: undefined,
                fwFile: undefined,
              });
            }
            break;
          }

          default: {
            setDfu(d => {
              return {...d, status, description, progress};
            });
            break;
          }
        }
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
        setDfu(d => {
          return {...d, progress};
        });
      },
    );

    BluetoothZ.adapterStatus();

    return function cleanUp() {
      console.log('=================>>>>>>>>>>>> OFF');
      dfuFailedListener?.remove();
      dfuStatusListener?.remove();
      dfuProgressListener?.remove();
      bleAdapterListener?.remove();
      PIPPO?.remove();
    };
  }, [dfu, setDfu]);

  return (
    <View style={{flex: 1, backgroundColor: '#F7F7F7'}}>
      <Header
        status={bluetoothStatus}
        onGoBack={() => {
          if (dfu?.status) {
            setModalAlert({
              type: 'error',
              text: 'Stop or wait the completion of DFU procedure before exit',
            });
            setTimeout(() => setModalAlert(undefined), 3000);
            return;
          } else {
            navigation.goBack();
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
          <DFUDevice
            devices={devices}
            index={dfu?.currentDeviceIndex}
            onPrevious={() => {
              setDfu(o => {
                return {...o, currentDeviceIndex: o.currentDeviceIndex - 1};
              });
            }}
            onNext={() => {
              setDfu(o => {
                return {...o, currentDeviceIndex: o.currentDeviceIndex + 1};
              });
            }}
          />
          <DFUShowProgress progress={dfu?.progress} />
          <DFUStatusDescription
            status={dfu?.status}
            description={dfu?.description}
          />
          <DFUFirmwareFile fwFile={dfu?.fwFile} />
          <Controls
            navigation={navigation}
            status={dfu?.status}
            fwFile={dfu?.fwFile}
            onFwFileSelected={fwFile => {
              setDfu(old => {
                return {...old, fwFile};
              });
            }}
            onAbort={() => {
              setModalAlert({
                type: 'warn',
                text: 'Are you sure you want to abort?',
                userInput: [
                  {
                    callback: () => {
                      setModalAlert(undefined);
                      // clearInterval(testTimer.current);
                      const {uuid} = devices[dfu?.currentDeviceIndex];
                      BluetoothZ.abortDFU({uuid});
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
            }}
            onStart={async () => {
              const size = devices.length < 2 ? devices.length : 2;
              // const {uuid} = devices[dfu?.currentDeviceIndex];
              // initDFU({uuid});
              // setDfu(o => {
              //   return {...o, currentDeviceUUID: uuid};
              // });
            }}
            onPause={() => {
              console.log('-----------', dfu?.currentDeviceUUID);
              BluetoothZ.pauseDFU({uuid: dfu?.currentDeviceUUID});
            }}
            onResume={() => {
              BluetoothZ.resumeDFU({uuid: dfu?.currentDeviceUUID});
            }}
          />
        </View>
      </View>
    </View>
  );
}

// testTimer.current = setInterval(() => {
//   setDfu(o => {
//     if (!o.progress || o.progress + 1 <= 100)
//       return {
//         ...o,
//         status: 'upload',
//         progress: o.progress >= 0 ? o.progress + 1 : 0,
//       };
//     clearInterval(testTimer.current);
//     return {...o, progress: 0, status: undefined};
//   });
// }, 500);
