/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {FlatList, View, Text, Image, Touchable, Platform} from 'react-native';
import BackgroundShape from '../components/BackgroundShape';
import Header from '../components/Header';
import TouchableDebounce from '../components/TouchableDebounce';
import DocumentPicker from 'react-native-document-picker';
import {useEffect, useState} from 'react';
import * as BluetoothZ from 'react-native-bluetoothz';
import RoundButton from '../components/RoundButton';
import {ToastDefines, showDialog, showToast} from '../components/Toast';
import Emitter from '../utils/emitter';

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
            height: 56,
            width:
              currentDevice?.progress !== undefined
                ? (currentDevice.progress * 55) / 100
                : 0,
            top: 7,
            borderRadius: 5,
            left: 9,
          }}
        />
        <Image
          source={require('../assets/icon/processor.png')}
          style={{width: 70, height: 70}}
        />
        <View
          style={{
            backgroundColor: 'transparent',
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Text
            style={{fontFamily: 'Nunito-Black', fontSize: 13, color: 'black'}}>
            {currentDevice?.progress !== undefined
              ? `${currentDevice.progress}%`
              : '0%'}
          </Text>
        </View>
      </View>
      <View style={{alignItems: 'center', flex: 1}}>
        <Text
          style={{
            fontFamily: 'Nunito-Bold',
            color: 'black',
            fontSize: 20,
            // width: '100%',
            // backgroundColor: 'green',
          }}>
          {currentDevice.name}
        </Text>
        <Text
          style={{
            fontFamily: 'Nunito-Bold',
            // backgroundColor: 'green',
            fontSize: 13,
            textAlign: 'center',
            // width: '100%',
            color: currentDevice?.alternativeUUID ? 'coral' : 'black',
          }}>
          {currentDevice?.alternativeUUID
            ? currentDevice.alternativeUUID
            : currentDevice.uuid}
        </Text>
        <Text
          style={{
            fontFamily: 'Nunito-Italic',
            flex: 1,
            color: 'black',
            fontSize: 14,
            textAlign: 'center',
            width: '100%',
            // backgroundColor: 'pink',
          }}>
          {currentDevice.status ? currentDevice.description : 'Idle'}
        </Text>
      </View>
      <View
        style={{
          flexDirection: 'row',
          gap: 10,
        }}>
        <TouchableDebounce
          disabled={!currentDevice.dfuStarting}
          onPress={() => {
            showDialog({
              type: ToastDefines.WARNING,
              title: 'Stop DFU',
              text: `Are you sure you want to terminate the DFU procedure on the device ${currentDevice.name}?`,
              buttonTitle1: 'Yes',
              onButton1Cb: () =>
                BluetoothZ.abortDFU({
                  uuid: currentDevice.uuid,
                }),
              buttonTitle2: 'Cancel',
              onButton2Cb: () => console.log('OOOOOOOOK'),
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
          disabled={!currentDevice.dfuStarting}
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
            opacity: !currentDevice.dfuStarting ? 0.5 : 1,
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
      </View>
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
        <Text style={{fontFamily: 'Nunito-Bold', color: 'snow', fontSize: 16}}>
          Firmware file
        </Text>
        <Text
          style={{
            fontFamily: firmware?.name ? 'Nunito-Regular' : 'Nunito-Italic',
            fontSize: 14,
            color: 'snow',
            // paddingLeft: 5,
          }}>
          {firmware?.name ? firmware.name : '<None>'}
        </Text>
      </View>
      <TouchableDebounce
        onPress={async () => {
          const zip = await pickFirmwareFile();
          onFirmwareSelected(zip);
        }}
        disabled={
          dfuProcess !== State.idle && dfuProcess !== State.file_selected
        }
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
            opacity:
              dfuProcess !== State.idle && dfuProcess !== State.file_selected
                ? 0.5
                : 1,
          }}
          source={require('../assets/icon/folder-100.png')}
        />
      </TouchableDebounce>
    </View>
  );
};

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
    showToast({
      type: ToastDefines.SUCCESS,
      title: 'File imported',
      text: `The firmware file ${res.name} has been successfully imported`,
    });
  } catch (err) {
    if (DocumentPicker.isCancel(err)) {
      console.log('User cancelled the picker');
    } else {
      console.log('Error:', err);
      showToast({
        type: ToastDefines.ERROR,
        title: 'File imported',
        text: 'An error occurred importing the file.',
      });
    }
  }
  return res;
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
        alternativeUUID: undefined,
        status: undefined, // BluetoothZ.Defines.BLE_PERIPHERAL_DFU_STATUS_UPLOADING,
        description: undefined,
        progress: undefined,
        dfuStarting: undefined,
        dfuPaused: false,
      };
    }),
  );

  // console.log('aaaaaaaaaa', dfuProcess);

  useEffect(() => {
    console.log(currentDevices);
    if (
      currentDevices.every(d => {
        // console.log('o mamma ', d);
        return (
          d.status === BluetoothZ.Defines.BLE_PERIPHERAL_DFU_STATUS_COMPLETED ||
          d.status === BluetoothZ.Defines.BLE_PERIPHERAL_DFU_STATUS_ABORTED ||
          d.status === BluetoothZ.Defines.BLE_PERIPHERAL_DFU_PROCESS_FAILED
        );
      })
    ) {
      console.log('SOKETTONE');
      setDfuProcess(State.file_selected);
    }
  }, [currentDevices]);

  useEffect(() => {
    console.log('=================>>>>>>>>>>>> ON');
    const dfuStatusListener = BluetoothZ.emitter().addListener(
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
                    0 ||
                  (event?.alternativeUUID !== undefined &&
                    prevD.uuid
                      .toLowerCase()
                      .localeCompare(event?.alternativeUUID.toLowerCase()) ===
                      0)
                ) {
                  return {
                    ...prevD,
                    error,
                    errorCode,
                    status:
                      event?.status !== undefined ? event.status : prevD.status,
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
          case BluetoothZ.Defines.BLE_PERIPHERAL_DFU_STATUS_COMPLETED: {
            console.log('Dfu completed');
            updateDevices(prevDevs =>
              prevDevs.map(prevD => {
                if (
                  prevD.uuid.toLowerCase().localeCompare(uuid.toLowerCase()) ===
                    0 ||
                  (event?.alternativeUUID !== undefined &&
                    prevD.uuid
                      .toLowerCase()
                      .localeCompare(event?.alternativeUUID.toLowerCase()) ===
                      0)
                ) {
                  return {
                    ...prevD,
                    status:
                      event?.status !== undefined ? event.status : prevD.status,
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
          case BluetoothZ.Defines.BLE_PERIPHERAL_DFU_STATUS_ABORTED: {
            const {error, errorCode} = event;
            console.log('Dfu FAILED', error, errorCode);
            updateDevices(prevDevs =>
              prevDevs.map(prevD => {
                if (
                  prevD.uuid.toLowerCase().localeCompare(uuid.toLowerCase()) ===
                    0 ||
                  (event?.alternativeUUID !== undefined &&
                    prevD.uuid
                      .toLowerCase()
                      .localeCompare(event?.alternativeUUID.toLowerCase()) ===
                      0)
                ) {
                  return {
                    ...prevD,
                    error,
                    errorCode,
                    status:
                      event?.status !== undefined ? event.status : prevD.status,
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
            console.log('Dfu STARTING', uuid, event?.alternativeUUID);
            updateDevices(prevDevs =>
              prevDevs.map(prevD => {
                /// is the device i'm looking for?
                if (
                  prevD.uuid.toLowerCase().localeCompare(uuid.toLowerCase()) !==
                  0
                ) {
                  return prevD;
                }
                /// the advertising uuid is equal to the old one uuid
                if (
                  event?.alternativeUUID !== undefined &&
                  prevD.uuid
                    .toLowerCase()
                    .localeCompare(event?.alternativeUUID.toLowerCase()) === 0
                ) {
                  return prevD;
                }
                return {
                  ...prevD,
                  dfuStarting: true,
                  alternativeUUID:
                    event?.alternativeUUID !== undefined
                      ? event?.alternativeUUID
                      : prevD?.alternativeUUID,
                };
              }),
            );
            break;
          }
          ///
          case BluetoothZ.Defines.BLE_PERIPHERAL_DFU_PROCESS_PAUSED: {
            console.log('Dfu STARTING', uuid, event?.alternativeUUID);
            updateDevices(prevDevs =>
              prevDevs.map(prevD => {
                /// is the device i'm looking for?
                if (
                  prevD.uuid.toLowerCase().localeCompare(uuid.toLowerCase()) !==
                  0
                ) {
                  return prevD;
                }
                /// the advertising uuid is equal to the old one uuid
                if (
                  event?.alternativeUUID !== undefined &&
                  prevD.uuid
                    .toLowerCase()
                    .localeCompare(event?.alternativeUUID.toLowerCase()) === 0
                ) {
                  return prevD;
                }
                return {
                  ...prevD,
                  dfuPaused: true,
                  alternativeUUID:
                    event?.alternativeUUID !== undefined
                      ? event?.alternativeUUID
                      : prevD?.alternativeUUID,
                };
              }),
            );
            break;
          }
          ///
          case BluetoothZ.Defines.BLE_PERIPHERAL_DFU_PROCESS_RESUMED: {
            console.log('Dfu STARTING', uuid, event?.alternativeUUID);
            updateDevices(prevDevs =>
              prevDevs.map(prevD => {
                /// is the device i'm looking for?
                if (
                  prevD.uuid.toLowerCase().localeCompare(uuid.toLowerCase()) !==
                  0
                ) {
                  return prevD;
                }
                /// the advertising uuid is equal to the old one uuid
                if (
                  event?.alternativeUUID !== undefined &&
                  prevD.uuid
                    .toLowerCase()
                    .localeCompare(event?.alternativeUUID.toLowerCase()) === 0
                ) {
                  return prevD;
                }
                return {
                  ...prevD,
                  dfuPaused: false,
                  alternativeUUID:
                    event?.alternativeUUID !== undefined
                      ? event?.alternativeUUID
                      : prevD?.alternativeUUID,
                };
              }),
            );
            break;
          }
          ///
          case BluetoothZ.Defines.BLE_PERIPHERAL_DFU_STATUS_UPLOADING: {
            console.log(
              'Dfu progress=',
              event?.progress,
              event?.alternativeUUID,
            );

            updateDevices(prevDevs =>
              prevDevs.map(prevD => {
                if (
                  prevD.uuid.toLowerCase().localeCompare(uuid.toLowerCase()) ===
                  0
                ) {
                  return {
                    ...prevD,
                    progress:
                      event?.progress !== undefined
                        ? event.progress
                        : prevD.progress,
                    description:
                      event?.description !== undefined
                        ? event.description
                        : prevD.description,
                    status:
                      event?.status !== undefined ? event.status : prevD.status,
                  };
                }
                return prevD;
              }),
            );
            break;
          }
          case BluetoothZ.Defines.BLE_PERIPHERAL_DFU_STATUS_CONNECTING:
          case BluetoothZ.Defines.BLE_PERIPHERAL_DFU_STATUS_VALIDATING:
          case BluetoothZ.Defines.BLE_PERIPHERAL_DFU_STATUS_DISCONNECTING:
          case BluetoothZ.Defines.BLE_PERIPHERAL_DFU_STATUS_ENABLING_DFU:
            updateDevices(prevDevs =>
              prevDevs.map(prevD => {
                if (
                  prevD.uuid.toLowerCase().localeCompare(uuid.toLowerCase()) ===
                  0
                ) {
                  return {
                    ...prevD,
                    description:
                      event?.description !== undefined
                        ? event.description
                        : prevD.description,
                    status:
                      event?.status !== undefined ? event.status : prevD.status,
                  };
                }
                return prevD;
              }),
            );
            break;
          case BluetoothZ.Defines.BLE_PERIPHERAL_DFU_DEBUG:
            console.log(
              '=================>>>>>>>>>>>> %%%%%%%%%%%% % %% %  % % %% % %% %  %% % %  %%',
              event,
            );
            break;
          default:
            // console.log(
            //   '=================>>>>>>>>>>>> %%%%%%%%%%%% % %% %  % % %% % %% %  %% % %  %%',
            //   event,
            // );
            // updateDevices(prevDevs =>
            //   prevDevs.map(prevD => {
            //     if (
            //       prevD.uuid.toLowerCase().localeCompare(uuid.toLowerCase()) ===
            //         0 ||
            //       (event?.alternativeUUID !== undefined &&
            //         prevD.uuid
            //           .toLowerCase()
            //           .localeCompare(event?.alternativeUUID.toLowerCase()) ===
            //           0)
            //     ) {
            //       return {
            //         ...prevD,
            //         description:
            //           event?.description !== undefined
            //             ? event.description
            //             : prevD.description,
            //         status:
            //           event?.status !== undefined ? event.status : prevD.status,
            //       };
            //     }
            //     return prevD;
            //   }),
            // );
            break;
        }
      },
    );

    const bleAdapterListener = BluetoothZ.emitter().addListener(
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
        />
        <View
          style={{
            position: 'absolute',
            // backgroundColor: 'pink',
            height: 70,
            width: '100%',
            bottom: 120,
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'row',
            gap: 10,
            zIndex: 1000,
          }}>
          {dfuProcess !== State.file_selected &&
            dfuProcess !== State.idle &&
            dfuProcess !== State.aborted && (
              <RoundButton
                onPress={async () => {
                  for (let i = 0; i < devices.length; i++) {
                    BluetoothZ.abortDFU({uuid: devices[i]?.uuid});
                  }
                  setDfuProcess(State.file_selected);
                }}
                iconSize={{height: 30, width: 30}}
                buttonSize={{height: 50, width: 50, radius: 25}}
                icon={require('../assets/icon/cancel-100.png')}
              />
            )}
          {dfuProcess === State.running && (
            <RoundButton
              onPress={async () => {
                for (let i = 0; i < devices.length; i++) {
                  BluetoothZ.pauseDFU({uuid: devices[i]?.uuid});
                }
                setDfuProcess(State.paused);
              }}
              iconSize={{height: 30, width: 30}}
              buttonSize={{height: 50, width: 50, radius: 25}}
              icon={require('../assets/icon/pause-b-100.png')}
            />
          )}
          {dfuProcess === State.paused && (
            <RoundButton
              onPress={async () => {
                for (let i = 0; i < devices.length; i++) {
                  BluetoothZ.resumeDFU({uuid: devices[i]?.uuid});
                }
                setDfuProcess(State.running);
              }}
              iconSize={{height: 30, width: 30}}
              buttonSize={{height: 50, width: 50, radius: 25}}
              icon={require('../assets/icon/resume-b-100.png')}
            />
          )}
          {dfuProcess === State.file_selected && (
            <RoundButton
              onPress={async () => {
                for (let i = 0; i < devices.length; i++) {
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
                setDfuProcess(State.running);
              }}
              iconSize={{height: 30, width: 30}}
              buttonSize={{height: 50, width: 50, radius: 25}}
              icon={require('../assets/icon/upload-100.png')}
            />
          )}
        </View>
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

const State = {
  idle: 0,
  running: 1,
  aborted: 2,
  file_selected: 3,
  paused: 4,
};
