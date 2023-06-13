import {FlatList, View, Text, Image, Touchable} from 'react-native';
import BackgroundShape from '../components/BackgroundShape';
import Header from '../components/Header';
import TouchableDebounce from '../components/TouchableDebounce';
import DocumentPicker from 'react-native-document-picker';
import {useEffect, useState} from 'react';
import * as BluetoothZ from 'react-native-bluetoothz';

const Element = ({device, onDeviceFailed}) => {
  console.log(device);
  const currentDevice = device;
  // const [currentDevice, updateDevice] = useState({
  //   ...device,
  //   alternateUUID: undefined,
  //   status: undefined, // BluetoothZ.Defines.BLE_PERIPHERAL_DFU_STATUS_UPLOADING,
  //   description: undefined,
  //   progress: undefined,
  //   dfuStarting: undefined,
  //   dfuPaused: false,
  // });

  // useEffect(() => {
  //   console.log('=================>>>>>>>>>>>> ON');
  //   // const blePeripheralDfuScanFailedListener = BluetoothZ.emitter.addListener(
  //   //   BluetoothZ.Defines.DFU_SCAN_FAILED,
  //   //   ({uuid}) => {
  //   //     nextUpdate({error: 'Could not start scan process!'});
  //   //   },
  //   // );

  //   // const blePeripheralDfuIntNotFoundListener = BluetoothZ.emitter.addListener(
  //   //   BluetoothZ.Defines.DFU_INTERFACE_NOT_FOUND,
  //   //   () => {
  //   //     nextUpdate({error: 'Could not find DFU enabled interface!'});
  //   //   },
  //   // );

  //   // const blePeripheralDfuResumedListener = BluetoothZ.emitter.addListener(
  //   //   BluetoothZ.Defines.BLE_PERIPHERAL_DFU_PROCESS_RESUMED,
  //   //   ({uuid}) => {
  //   //     if (
  //   //       currentDevice.uuid.toLowerCase().localeCompare(uuid.toLowerCase()) ||
  //   //       currentDevice.alternateUUID?.toLowerCase().localeCompare(uuid.toLowerCase())
  //   //     ) {
  //   //       updateDevice({...prevD, dfuPaused: false});
  //   //     }
  //   //   },
  //   // );

  //   // const blePeripheralDfuPausedListener = BluetoothZ.emitter.addListener(
  //   //   BluetoothZ.Defines.BLE_PERIPHERAL_DFU_PROCESS_PAUSED,
  //   //   ({uuid}) => {
  //   //     if (
  //   //       currentDevice.uuid.toLowerCase().localeCompare(uuid.toLowerCase()) ||
  //   //       currentDevice.alternateUUID?.toLowerCase().localeCompare(uuid.toLowerCase())
  //   //     ) {
  //   //       updateDevice({...prevD, dfuPaused: true});
  //   //     }
  //   //   },
  //   // );

  //   const dfuFailedListener = BluetoothZ.emitter.addListener(
  //     BluetoothZ.Defines.BLE_PERIPHERAL_DFU_PROCESS_FAILED,
  //     ({uuid, alternateUUID, error, errorCode}) => {
  //       if (
  //         currentDevice.uuid.toLowerCase().localeCompare(uuid.toLowerCase()) ||
  //         currentDevice.alternateUUID
  //           ?.toLowerCase()
  //           .localeCompare(alternateUUID?.toLowerCase())
  //       ) {
  //         console.log(
  //           '+ DFU + BLE_PERIPHERAL_DFU_PROCESS_FAILED:',
  //           uuid,
  //           'error:',
  //           error,
  //         );
  //         updateDevice({
  //           progress: undefined,
  //           dfuStarting: undefined,
  //           dfuPaused: false,
  //           alternateUUID: undefined,
  //         });
  //       }
  //       /// Mandare alert poi proseguo con il dispo seguente
  //     },
  //   );

  //   const dfuStartingListener = BluetoothZ.emitter.addListener(
  //     BluetoothZ.Defines.BLE_PERIPHERAL_DFU_STATUS_STARTING,
  //     ({uuid, alternateUUID}) => {
  //       if (
  //         currentDevice.uuid.toLowerCase().localeCompare(uuid.toLowerCase())
  //       ) {
  //         console.log('+ DFU + BLE_PERIPHERAL_DFU_STATUS_STARTING:', event);
  //         let dev = {...currentDevice, dfuStarting: true};
  //         updateDevice({
  //           ...dev,
  //           alternateUUID: currentDevice.uuid
  //             .toLowerCase()
  //             .localeCompare(alternateUUID.toLowerCase())
  //             ? alternateUUID
  //             : undefined,
  //         });
  //       }
  //     },
  //   );

  //   const dfuStatusListener = BluetoothZ.emitter.addListener(
  //     BluetoothZ.Defines.BLE_PERIPHERAL_DFU_STATUS_DID_CHANGE,
  //     ({uuid, alternateUUID, status, description, progress}) => {
  //       if (
  //         currentDevice.uuid.toLowerCase().localeCompare(uuid.toLowerCase()) ||
  //         currentDevice.alternateUUID
  //           ?.toLowerCase()
  //           .localeCompare(alternateUUID?.toLowerCase())
  //       ) {
  //         console.log(
  //           '+ DFU + BLE_PERIPHERAL_DFU_STATUS_DID_CHANGE:',
  //           uuid,
  //           'status:',
  //           status,
  //         );
  //         updateDevice(d => {
  //           return {
  //             ...d,
  //             progress: progress !== undefined ? progress : d.progress,
  //             description:
  //               description !== undefined ? description : d.description,
  //             status: status !== undefined ? status : d.status,
  //           };
  //         });
  //       }
  //     },
  //   );

  //   return function cleanUp() {
  //     console.log('=================>>>>>>>>>>>> OFF');
  //     dfuFailedListener?.remove();
  //     dfuStartingListener?.remove();
  //     dfuStatusListener?.remove();
  //   };
  // }, []);

  return (
    <View
      style={{
        backgroundColor: 'transparent',
        minHeight: 120,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#333',
        padding: 15,
        gap: 10,
        opacity: currentDevice?.status === undefined ? 0.5 : 1,
      }}>
      <View style={{backgroundColor: 'transparent'}}>
        <View
          style={{
            position: 'absolute',
            backgroundColor: 'springgreen',
            height: 57,
            width:
              currentDevice?.progress !== undefined
                ? (currentDevice.progress * 57) / 100
                : 0,
            top: 6,
            borderRadius: 10,
            left: 6,
          }}
        />
        <Image
          source={require('../assets/icon/processor.png')}
          style={{width: 70, height: 70}}
        />
        <Text
          style={{
            position: 'absolute',
            fontFamily: 'Nunito-Black',
            color: 'black',
            height: 57,
            width: 57,
            top: 6,
            borderRadius: 10,
            left: 6,
            textAlign: 'center',
            textAlignVertical: 'center',
            // top: 25,
            // left: 17,
            fontSize: 13,
          }}>
          {currentDevice?.progress !== undefined
            ? `${currentDevice.progress}%`
            : '0%'}
        </Text>
      </View>
      <View style={{alignItems: 'center', flex: 1}}>
        <Text
          style={{
            fontFamily: 'Nunito-Bold',
            color: 'black',
            fontSize: 20,
            // backgroundColor: 'green',
          }}>
          {currentDevice.name}
        </Text>
        <Text
          style={{
            fontFamily: 'Nunito-Regular',
            color: currentDevice.alternateUUID ? 'coral' : 'black',
          }}>
          {currentDevice.alternateUUID
            ? currentDevice.alternateUUID
            : currentDevice.uuid}
        </Text>
        <Text
          style={{
            fontFamily: 'Nunito-Italic',
            flex: 1,
            color: 'black',
            fontSize: 16,
            textAlign: 'center',
            // backgroundColor: 'pink',
          }}>
          {currentDevice.status ? currentDevice.description : 'Idle'}
        </Text>
      </View>
      {currentDevice?.status === undefined && (
        <View
          style={{
            flexDirection: 'row',
            gap: 10,
            // opacity: 0.5,
          }}>
          <TouchableDebounce
            disabled={true}
            style={{
              height: 40,
              width: 40,
              borderRadius: 20,
              backgroundColor: '#444',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Image
              style={{width: 30, height: 30}}
              source={require('../assets/icon/upload-100.png')}
            />
          </TouchableDebounce>
          {/* <PauseResumeButton status={currentDevice?.status} /> */}
        </View>
      )}
      {currentDevice?.dfuStarting && (
        <View
          style={{
            flexDirection: 'row',
            gap: 10,
          }}>
          <TouchableDebounce
            disabled={!currentDevice.dfuStarting}
            onPress={() => {
              BluetoothZ.abortDFU({
                uuid: currentDevice.uuid,
              });
            }}
            style={{
              height: 40,
              width: 40,
              borderRadius: 20,
              backgroundColor: '#444',
              justifyContent: 'center',
              alignItems: 'center',
              opacity: !currentDevice.dfuStarting ? 0.5 : 1,
            }}>
            <Image
              style={{width: 30, height: 30}}
              source={require('../assets/icon/cancel-100.png')}
            />
          </TouchableDebounce>
          <TouchableDebounce
            onPress={() => {
              if (!currentDevice?.dfuPaused)
                BluetoothZ.pauseDFU({
                  uuid: currentDevice.uuid,
                });
              else
                BluetoothZ.resumeDFU({
                  uuid: currentDevice.uuid,
                });
            }}
            style={{
              height: 40,
              width: 40,
              borderRadius: 20,
              backgroundColor: '#444',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Image
              style={{width: 30, height: 30}}
              source={
                currentDevice?.dfuPaused
                  ? require('../assets/icon/resume-b-100.png')
                  : require('../assets/icon/pause-b-100.png')
              }
            />
          </TouchableDebounce>
          {/* <PauseResumeButton status={currentDevice?.status} /> */}
        </View>
      )}
    </View>
  );
};

const CommandHeader = ({
  status,
  firmware,
  dfuProcess,
  onFirmwareSelected,
  onUploadPressed,
  onAbortAllPressed,
}) => {
  return (
    <View
      style={{
        // height: 50,
        backgroundColor: '#111',
        justifyContent: 'center',
        padding: 15,
        flexDirection: 'row',
        gap: 10,
        // borderBottomColor: '#444',
        // borderBottomWidth: 1,
      }}>
      <View
        style={{
          flexDirection: 'column',
          flex: 1,
          justifyContent: 'center',
        }}>
        {/* <Image
            source={require('../assets/icon/imported-files-100.png')}
            style={{width: 30, height: 30}}
          /> */}
        <Text style={{fontFamily: 'Nunito-Bold', fontSize: 16}}>
          Firmware file
        </Text>
        <Text
          style={{
            fontFamily: firmware?.name ? 'Nunito-Regular' : 'Nunito-Italic',
            fontSize: 14,
            // paddingLeft: 5,
          }}>
          {firmware?.name ? firmware.name : '<None>'}
        </Text>
      </View>
      {dfuProcess === State.started && (
        <TouchableDebounce
          onPress={() => onAbortAllPressed()}
          disabled={dfuProcess !== State.started}
          style={{
            height: 40,
            width: 40,
            borderRadius: 20,
            backgroundColor: '#444',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Image
            style={{
              width: 30,
              height: 30,
              opacity: dfuProcess !== State.started ? 0.5 : 1,
            }}
            source={require('../assets/icon/cancel-100.png')}
          />
        </TouchableDebounce>
      )}
      {dfuProcess === State.file_selected && (
        <TouchableDebounce
          onPress={() => onUploadPressed()}
          disabled={dfuProcess !== State.file_selected}
          style={{
            height: 40,
            width: 40,
            borderRadius: 20,
            backgroundColor: '#444',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Image
            style={{
              width: 30,
              height: 30,
              opacity: dfuProcess !== State.file_selected ? 0.5 : 1,
            }}
            source={require('../assets/icon/upload-100.png')}
          />
        </TouchableDebounce>
      )}
      <TouchableDebounce
        onPress={async () => {
          const zip = await pickFirmwareFile();
          onFirmwareSelected(zip);
        }}
        disabled={dfuProcess === State.started}
        style={{
          height: 40,
          width: 40,
          borderRadius: 20,
          backgroundColor: '#444',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <Image
          style={{
            width: 30,
            height: 30,
            opacity: dfuProcess === State.started ? 0.5 : 1,
          }}
          source={require('../assets/icon/folder-100.png')}
        />
      </TouchableDebounce>
    </View>
  );
};

export default function TestDFU({navigation, route}) {
  const [firmwareSelected, setFirmwareSelected] = useState(undefined);
  const [dfuProcess, setDfuProcess] = useState(State.idle);
  const [dfuIndex, setDfuIndex] = useState(0);
  const {devices} = route?.params;
  const [currentDevices, updateDevices] = useState(
    route.params.devices.map(device => {
      return {
        ...device,
        alternateUUID: undefined,
        status: undefined, // BluetoothZ.Defines.BLE_PERIPHERAL_DFU_STATUS_UPLOADING,
        description: undefined,
        progress: undefined,
        dfuStarting: undefined,
        dfuPaused: false,
      };
    }),
  );

  useEffect(() => {
    console.log('=================>>>>>>>>>>>> ON');
    // const blePeripheralDfuScanFailedListener = BluetoothZ.emitter.addListener(
    //   BluetoothZ.Defines.DFU_SCAN_FAILED,
    //   ({uuid}) => {
    //     nextUpdate({error: 'Could not start scan process!'});
    //   },
    // );

    // const blePeripheralDfuIntNotFoundListener = BluetoothZ.emitter.addListener(
    //   BluetoothZ.Defines.DFU_INTERFACE_NOT_FOUND,
    //   () => {
    //     nextUpdate({error: 'Could not find DFU enabled interface!'});
    //   },
    // );

    // const blePeripheralDfuResumedListener = BluetoothZ.emitter.addListener(
    //   BluetoothZ.Defines.BLE_PERIPHERAL_DFU_PROCESS_RESUMED,
    //   ({uuid}) => {
    //     if (
    //       currentDevice.uuid.toLowerCase().localeCompare(uuid.toLowerCase()) ||
    //       currentDevice.alternateUUID?.toLowerCase().localeCompare(uuid.toLowerCase())
    //     ) {
    //       updateDevice({...prevD, dfuPaused: false});
    //     }
    //   },
    // );

    // const blePeripheralDfuPausedListener = BluetoothZ.emitter.addListener(
    //   BluetoothZ.Defines.BLE_PERIPHERAL_DFU_PROCESS_PAUSED,
    //   ({uuid}) => {
    //     if (
    //       currentDevice.uuid.toLowerCase().localeCompare(uuid.toLowerCase()) ||
    //       currentDevice.alternateUUID?.toLowerCase().localeCompare(uuid.toLowerCase())
    //     ) {
    //       updateDevice({...prevD, dfuPaused: true});
    //     }
    //   },
    // );

    const dfuFailedListener = BluetoothZ.emitter.addListener(
      BluetoothZ.Defines.BLE_PERIPHERAL_DFU_PROCESS_FAILED,
      ({uuid, alternateUUID, error, errorCode}) => {
        console.log(
          '+ DFU + BLE_PERIPHERAL_DFU_PROCESS_FAILED:',
          uuid,
          alternateUUID,
          'error:',
          error,
        );
        updateDevices(prevDevs =>
          prevDevs.map(prevD => {
            if (
              prevD.uuid.toLowerCase().localeCompare(uuid.toLowerCase()) === 0
            ) {
              return {
                ...prevD,
                error,
                errorCode,
                progress: undefined,
                dfuStarting: undefined,
                dfuPaused: false,
                alternateUUID: undefined,
              };
            }
            return prevD;
          }),
        );
      },
    );

    const dfuStatusListener = BluetoothZ.emitter.addListener(
      BluetoothZ.Defines.BLE_PERIPHERAL_DFU_STATUS_DID_CHANGE,
      ({uuid, alternateUUID, status, description, progress}) => {
        switch (status) {
          case BluetoothZ.Defines.BLE_PERIPHERAL_DFU_STATUS_STARTING: {
            console.log('+ DFU + BLE_PERIPHERAL_DFU_STATUS_STARTING:', uuid);
            updateDevices(prevDevs =>
              prevDevs.map(prevD => {
                if (
                  prevD.uuid.toLowerCase().localeCompare(uuid.toLowerCase()) ===
                  0
                ) {
                  return {
                    ...prevD,
                    alternateUUID:
                      prevD.uuid
                        .toLowerCase()
                        .localeCompare(alternateUUID.toLowerCase()) === 0
                        ? undefined
                        : alternateUUID,
                  };
                }
                return prevD;
              }),
            );
            break;
          }

          case BluetoothZ.Defines.BLE_PERIPHERAL_DFU_STATUS_UPLOADING: {
            updateDevices(prevDevs =>
              prevDevs.map(prevD => {
                console.log(
                  '+ DFU + BLE_PERIPHERAL_DFU_STATUS_DID_CHANGE:',
                  uuid,
                  prevD.uuid,
                  prevD.uuid.toLowerCase().localeCompare(uuid.toLowerCase()),
                );
                if (
                  prevD.uuid.toLowerCase().localeCompare(uuid.toLowerCase()) ===
                  0
                ) {
                  return {
                    ...prevD,
                    progress: progress !== undefined ? progress : d.progress,
                    description:
                      description !== undefined ? description : d.description,
                    status: status !== undefined ? status : d.status,
                  };
                }
                return prevD;
              }),
            );
            break;
          }

          default:
            break;
        }
      },
    );

    const bleAdapterListener = BluetoothZ.emitter.addListener(
      BluetoothZ.Defines.BLE_ADAPTER_STATUS_DID_UPDATE,
      ({status}) => {
        console.log('oooooooooooo', status);
      },
    );

    return function cleanUp() {
      console.log('=================>>>>>>>>>>>> OFF');
      dfuFailedListener?.remove();
      dfuStatusListener?.remove();
      bleAdapterListener?.remove();
    };
  }, []);

  // useEffect(() => {
  //   const bleAdapterListener = BluetoothZ.emitter.addListener(
  //     BluetoothZ.Defines.BLE_ADAPTER_STATUS_DID_UPDATE,
  //     ({status}) => {
  //       console.log('oooooooooooo', status);
  //     },
  //   );

  //   return function cleanUp() {
  //     bleAdapterListener?.remove();
  //   };
  // }, []);

  return (
    <View style={{flex: 1, backgroundColor: '#F7F7F7'}}>
      <Header
        status={true}
        onGoBack={() => {
          navigation.goBack();
        }}
      />
      <BackgroundShape bleStatus={true} />
      <View
        style={{
          flex: 1,
        }}>
        <CommandHeader
          status={true}
          dfuProcess={dfuProcess}
          firmware={firmwareSelected}
          onFirmwareSelected={zip => {
            setFirmwareSelected(zip);
            setDfuProcess(State.file_selected);
          }}
          onUploadPressed={() => {
            const size = devices.length <= 2 ? devices.length : 2;
            for (let i = 0; i < size; i++) {
              console.log('COMINCIO CON ', devices[i]?.uuid);
              startDFU({uuid: devices[i]?.uuid, firmware: firmwareSelected});
            }
            setDfuProcess(State.started);
            setDfuIndex(prevIndex => prevIndex + 1);
          }}
          onAbortAllPressed={() => {
            setDfuProcess(State.aborted);
          }}
        />
        <FlatList
          style={{backgroundColor: 'transparent'}}
          data={currentDevices}
          renderItem={({item}) => (
            <Element device={item} firmware={firmwareSelected} />
          )}
          keyExtractor={item => item.uuid}
        />
      </View>
    </View>
  );
}

const State = {idle: 0, started: 1, aborted: 2, file_selected: 3};

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

async function startDFU({uuid, alternateUUID = undefined, firmware}) {
  // const {uuid} = devices[dfu?.currentDeviceIndex];
  console.log('1 ==============>', uuid);
  if (Platform.OS === 'android') {
    try {
      await BluetoothZ.connectSync({uuid});
    } catch (error) {
      console.log(error, BluetoothZ);
      return;
    }
  }
  BluetoothZ.startDFU({
    uuid,
    alternateUUID,
    filePath: firmware.fileCopyUri,
    pathType:
      Platform.OS === 'ios'
        ? BluetoothZ.Defines.FILE_PATH_TYPE_STRING
        : BluetoothZ.Defines.FILE_PATH_TYPE_URL,
  });
}
