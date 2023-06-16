import {FlatList, View, Text, Image, Touchable} from 'react-native';
import BackgroundShape from '../components/BackgroundShape';
import Header from '../components/Header';
import TouchableDebounce from '../components/TouchableDebounce';
import DocumentPicker from 'react-native-document-picker';
import {useEffect, useState} from 'react';
import * as BluetoothZ from 'react-native-bluetoothz';

const Element = ({device, onDeviceFailed}) => {
  // console.log(device);
  const currentDevice = device;
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
            fontFamily: 'Nunito-Bold',
            color: currentDevice.alternativeUUID ? 'coral' : 'black',
          }}>
          {currentDevice.alternativeUUID
            ? currentDevice.alternativeUUID
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

async function startDFU({uuid, alternativeUUID = undefined, firmware}) {
  // const {uuid} = devices[dfu?.currentDeviceIndex];
  console.log('1 ==============>', uuid);
  if (Platform.OS === 'android') {
    try {
      console.log('2 ==============>', uuid);

      await BluetoothZ.connectSync({uuid});

      console.log('3 ==============>', uuid);
    } catch (error) {
      console.log(error);
      return;
    }
  }
  BluetoothZ.startDFU({
    uuid,
    alternativeUUID,
    filePath: firmware.fileCopyUri,
    pathType:
      Platform.OS === 'ios'
        ? BluetoothZ.Defines.FILE_PATH_TYPE_STRING
        : BluetoothZ.Defines.FILE_PATH_TYPE_URL,
  });
}

export default function TestDFU({navigation, route}) {
  const [firmwareSelected, setFirmwareSelected] = useState(undefined);
  const [dfuProcess, setDfuProcess] = useState(State.idle);
  const [dfuIndex, setDfuIndex] = useState(0);
  const {devices} = route?.params;
  const [currentDevices, updateDevices] = useState(
    route.params.devices.map(device => {
      return {
        ...device,
        alternativeUUID: undefined,
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
    const dfuStatusListener = BluetoothZ.emitter.addListener(
      BluetoothZ.Defines.BLE_PERIPHERAL_DFU_STATUS_DID_CHANGE,
      event => {
        const {status, uuid} = event;
        console.log('Dfu status=', status, uuid);
        switch (status) {
          ///
          case BluetoothZ.Defines.BLE_PERIPHERAL_DFU_PROCESS_FAILED: {
            const {error, errorCode} = event;
            console.log('Dfu FAILED', error, errorCode);
            updateDevices(prevDevs =>
              prevDevs.map(prevD => {
                if (
                  prevD.uuid.toLowerCase().localeCompare(uuid.toLowerCase()) ===
                  0
                ) {
                  return {
                    ...prevD,
                    error,
                    errorCode,
                    progress: undefined,
                    dfuStarting: undefined,
                    dfuPaused: false,
                    alternativeUUID: undefined,
                  };
                }
                return prevD;
              }),
            );

            break;
          }
          ///
          case BluetoothZ.Defines.BLE_PERIPHERAL_DFU_STATUS_STARTING: {
            const alternativeUUID = event.alternativeUUID;
            console.log('Dfu STARTING', uuid, alternativeUUID);
            updateDevices(prevDevs =>
              prevDevs.map(prevD => {
                /// is the device i'm looking for?
                if (
                  prevD.uuid.toLowerCase().localeCompare(uuid.toLowerCase()) !==
                  0
                ) {
                  return prevD;
                }
                /// it is advertising an alternate uuid
                if (!alternativeUUID) {
                  return prevD;
                }
                /// the advertising uuid is equal to the old one uuid
                if (
                  prevD.uuid
                    .toLowerCase()
                    .localeCompare(alternativeUUID.toLowerCase()) === 0
                ) {
                  return prevD;
                }
                return {
                  ...prevD,
                  alternativeUUID,
                };
              }),
            );
            break;
          }
          ///
          case BluetoothZ.Defines.BLE_PERIPHERAL_DFU_STATUS_UPLOADING: {
            const alternativeUUID = event.alternativeUUID;
            updateDevices(prevDevs =>
              prevDevs.map(prevD => {
                if (
                  prevD.uuid.toLowerCase().localeCompare(uuid.toLowerCase()) ===
                    0 ||
                  prevD.uuid
                    .toLowerCase()
                    .localeCompare(alternativeUUID.toLowerCase()) === 0
                ) {
                  return {
                    ...prevD,
                    progress:
                      event?.progress !== undefined
                        ? event.progress
                        : d.progress,
                    description:
                      event?.description !== undefined
                        ? event.description
                        : d.description,
                    status:
                      event?.status !== undefined ? event.status : d.status,
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
          onUploadPressed={async () => {
            const size = devices.length <= 2 ? devices.length : 2;
            let success = true;
            // for (let i = 0; i < size; i++) {
            //   console.log('COMINCIO CON ', devices[i]?.uuid, devices[i]?.name);
            //   // startDFU({uuid: devices[i]?.uuid, firmware: firmwareSelected});
            //   try {
            //     console.log('2 ==============>', devices[i]?.uuid);

            //     await BluetoothZ.connectSync({
            //       uuid: devices[i]?.uuid,
            //       enableDiscover: false,
            //     });

            //     console.log('3 ==============>', devices[i]?.uuid);
            //   } catch (error) {
            //     console.log(error);
            //     success = false;
            //     // return;
            //   }
            // }
            if (success) {
              for (let i = 0; i < size; i++) {
                console.log('SFU CON ', devices[i]?.uuid, devices[i]?.name);
                BluetoothZ.startDFU({
                  uuid: devices[i]?.uuid,
                  filePath: firmwareSelected.fileCopyUri,
                  pathType:
                    Platform.OS === 'ios'
                      ? BluetoothZ.Defines.FILE_PATH_TYPE_STRING
                      : BluetoothZ.Defines.FILE_PATH_TYPE_URL,
                });
              }
            }
            setDfuProcess(State.started);
            setDfuIndex(prevIndex => prevIndex + 1);
          }}
          onAbortAllPressed={() => {
            setDfuProcess(State.aborted);
            const size = devices.length <= 2 ? devices.length : 2;
            for (let i = 0; i < size; i++) {
              console.log('DISCONNECTO ', devices[i]?.uuid, devices[i]?.name);
              BluetoothZ.disconnect({uuid: devices[i]?.uuid});
            }
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
