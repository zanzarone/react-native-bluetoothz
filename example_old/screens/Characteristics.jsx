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

function Operation({details, onDismiss, onRead, onWrite, onIndicationUpdates}) {
  const [readValue, setReadValue] = useState(undefined);
  const [writeValue, setWriteValue] = useState({
    raw: [170, 0, 6, 65, 1, 4, 67, 73, 65, 79],
  });
  const [error, setError] = useState(undefined);
  useEffect(() => {
    const charReadListener = emitter.addListener(
      Defines.BLE_PERIPHERAL_CHARACTERISTIC_READ_OK,
      ({uuid, charUUID, value}) => {
        console.log('+ RD + DISPO:', uuid, 'CHAR:', charUUID, 'VALUE:', value);
        setReadValue({raw: value, string: String.fromCharCode(...value)});
      },
    );

    const charReadFailedListener = emitter.addListener(
      Defines.BLE_PERIPHERAL_CHARACTERISTIC_READ_FAILED,
      ({uuid, charUUID, error}) => {
        setError(error);
        console.log(
          '+ RD ERR + DISPO:',
          uuid,
          'CHAR:',
          charUUID,
          'error:',
          error,
        );
        setTimeout(() => {
          setError(undefined);
        }, 3000);
      },
    );
    const charWriteListener = emitter.addListener(
      Defines.BLE_PERIPHERAL_CHARACTERISTIC_WRITE_OK,
      ({uuid, charUUID}) => {
        console.log('+ WR + DISPO:', uuid, 'CHAR:', charUUID, 'VALUE:', value);
      },
    );

    const charWriteFailedListener = emitter.addListener(
      Defines.BLE_PERIPHERAL_CHARACTERISTIC_WRITE_FAILED,
      ({uuid, charUUID, error}) => {
        setError(error);
        console.log(
          '+ WR ERR + DISPO:',
          uuid,
          'CHAR:',
          charUUID,
          'VALUE:',
          value,
        );
        setTimeout(() => {
          setError(undefined);
        }, 3000);
      },
    );
    return function cleanUp() {
      console.log('=================>>>>>>>>>>>> OFF');
      charReadListener?.remove();
      charReadFailedListener?.remove();
      charWriteListener?.remove();
      charWriteFailedListener?.remove();
    };
  }, []);

  return (
    <Modal
      animated
      animationType="fade"
      visible={details !== undefined}
      transparent>
      <View style={styles.overlay}>
        <View
          style={{
            backgroundColor: 'teal',
            borderTopRightRadius: 12,
            borderTopLeftRadius: 12,
            minHeight: '50%',
          }}>
          <View
            style={{
              height: 40,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingHorizontal: 16,
            }}>
            <TouchableOpacity
              style={{
                flex: 1,
                justifyContent: 'center',
              }}
              onPress={() => {
                setReadValue(undefined);
                onDismiss();
              }}>
              <Text style={{color: 'white', fontWeight: 'bold'}}>Dismiss</Text>
            </TouchableOpacity>
            <View style={{}}>
              <Text
                style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  fontWeight: 'bold',
                  fontSize: 16,
                  color: 'white',
                  textAlign: 'center',
                }}>
                Operation
              </Text>
            </View>
            <View style={{flex: 1}} />
          </View>
          <View
            style={{
              marginHorizontal: 10,
              marginVertical: 10,
              gap: 15,
              flex: 1,
            }}>
            <View style={{borderBottomColor: 'silver', borderBottomWidth: 1}} />
            <Text style={{textAlign: 'center', color: 'silver'}}>Read</Text>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-around',
                gap: 5,
              }}>
              <TextInput
                editable={false}
                placeholder="-"
                placeholderTextColor={'darkgray'}
                value={readValue?.string}
                style={{
                  color: 'dimgray',
                  flex: 1,
                  backgroundColor: 'silver',
                  borderRadius: 10,
                  minHeight: 40,
                  paddingLeft: 5,
                }}
              />
              <TouchableOpacity
                onPress={() => onRead(details)}
                style={{
                  height: 30,
                  width: 30,
                  borderRadius: 15,
                  backgroundColor: 'lightgreen',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Text>↓</Text>
              </TouchableOpacity>
            </View>
            <View style={{borderBottomColor: 'silver', borderBottomWidth: 1}} />
            <Text style={{textAlign: 'center', color: 'silver'}}>Write</Text>
            <View
              style={{
                flexDirection: 'row',
                flex: 1,
                justifyContent: 'space-around',
                gap: 5,
              }}>
              <TextInput
                editable={false}
                multiline
                numberOfLines={4}
                maxLength={40}
                placeholder="-"
                placeholderTextColor={'darkgray'}
                value={writeValue?.raw.join()}
                style={{
                  color: 'black',
                  flex: 1,
                  backgroundColor: 'gainsboro',
                  borderRadius: 10,
                  minHeight: 40,
                  paddingLeft: 5,
                }}
              />
              <TouchableOpacity
                onPress={() => onWrite(details, writeValue.raw)}
                style={{
                  height: 30,
                  width: 30,
                  borderRadius: 15,
                  backgroundColor: 'lightgreen',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Text style={{}}>↑</Text>
              </TouchableOpacity>
            </View>
            {error && (
              <View
                style={{
                  backgroundColor: 'coral',
                  borderRadius: 20,
                  padding: 5,
                  marginBottom: 10,
                }}>
                <Text
                  style={{
                    fontStyle: 'italic',
                    paddingVertical: 2,
                    textAlign: 'center',
                  }}>
                  {error}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default function Characteristics({route, navigation}) {
  const {data} = route.params;
  const [details, setDetails] = useState(undefined);
  const [randomRead, setRandomRead] = useState(false);
  useEffect(() => {
    const disconnectListener = emitter.addListener(
      Defines.BLE_PERIPHERAL_DISCONNECTED,
      ({uuid}) => {
        if (uuid === data?.uuid) {
          navigation.goBack();
        }
      },
    );

    return function cleanUp() {
      console.log('=================>>>>>>>>>>>> OFF');
      disconnectListener?.remove();
    };
  }, []);

  return (
    <View style={{backgroundColor: 'teal', flex: 1}}>
      <Operation
        details={details}
        onDismiss={() => setDetails(undefined)}
        onRead={char => {
          readCharacteristic({uuid: char.uuid, charUUID: char.charUUID});
        }}
        onWrite={(char, value) => {
          console.log('=======>', value);
          writeCharacteristic({
            uuid: char.uuid,
            charUUID: char.charUUID,
            value: value,
          });
        }}
      />
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
            {data?.name}
          </Text>
          <View style={{flex: 1}} />
        </View>
      </SafeAreaView>
      <ScrollView style={{backgroundColor: 'darkslategray'}}>
        {data?.characteristics?.map(c => {
          return (
            <TouchableOpacity
              onPress={() => {
                setDetails({uuid: data?.uuid, charUUID: c});
              }}
              key={c}
              style={{
                backgroundColor: '#ffffff44',
                marginVertical: 0,
                marginHorizontal: 0,
                marginBottom: 4,
                height: 50,
                flexDirection: 'row',
                gap: 4,
              }}>
              <View
                style={{
                  borderLeftColor: 'orange',
                  borderLeftWidth: 6,
                }}
              />
              <View
                style={{
                  borderLeftColor: 'orange',
                  borderLeftWidth: 6,
                }}
              />
              <View
                style={{
                  justifyContent: 'center',
                  paddingVertical: 10,
                }}>
                <Text
                  style={{
                    fontWeight: 'bold',
                    color: 'gainsboro',
                    fontSize: 13,
                    paddingLeft: 3,
                  }}>
                  {c}
                </Text>
                {/* <View style={{flexDirection: 'row', gap: 7}}> */}
                {/*
                 */}
                {/* </View> */}
              </View>
            </TouchableOpacity>
          );
        })}
        <View style={{minHeight: 20}}></View>
      </ScrollView>
    </View>
  );
}
