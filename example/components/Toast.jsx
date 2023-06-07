import {Image, Modal, StyleSheet, Text, View} from 'react-native';
import TouchableDebounce from './TouchableDebounce';

function toastColor({state}) {
  let color;
  switch (state?.type) {
    case 'error':
      color = 'coral';
      break;
    case 'warn':
      color = '#FCC419';
      break;
    case 'info':
      color = 'lightblue';
      break;
    default:
      color = 'lightblue';
      break;
  }
  return color;
}

function toastIcon({state}) {
  let color;
  switch (state?.type) {
    case 'error':
      color = require('../assets/icon/error-100.png');
      break;
    case 'warn':
      color = require('../assets/icon/error-100.png');
      break;
    case 'info':
      color = require('../assets/icon/error-100.png');
      break;
    default:
      color = require('../assets/icon/error-100.png');
      break;
  }
  return color;
}

function toastTitle({state}) {
  let color;
  switch (state?.type) {
    case 'error':
      color = 'Error';
      break;
    case 'warn':
      color = 'Warning';
      break;
    case 'info':
      color = 'Info';
      break;
    default:
      color = 'Error';
      break;
  }
  return color;
}

export default function Toast({state}) {
  return (
    <Modal transparent animationType="fade" visible={state !== undefined}>
      <View style={styles.modalAlert.parent}>
        <View
          style={[
            styles.modalAlert.container,
            {backgroundColor: toastColor({state})},
          ]}>
          <View style={styles.modalAlert.iconContainer}>
            <Image
              resizeMode="contain"
              style={{height: 32, width: 32}}
              source={toastIcon({state})}
            />
          </View>
          <View style={{backgroundColor: 'transparent', flex: 1, gap: 0}}>
            <Text
              style={{
                color: 'black',
                // backgroundColor: 'pink',
                textAlignVertical: 'center',
                fontFamily: 'Nunito-Bold',
                fontSize: 16,
                minHeight: 32,
              }}>
              {state?.title ? state.title : toastTitle({state})}
            </Text>
            <View
              style={[
                styles.modalAlert.messageContainer,
                {flexShrink: 1, backgroundColor: 'transparent'},
              ]}>
              <Text
                style={{
                  color: 'black',
                  fontFamily: 'Nunito-Regular',
                  fontSize: 16,
                }}>
                {state?.text}
              </Text>
            </View>
            <View
              style={{
                flexDirection: 'row',
                paddingBottom: 8,
                // backgroundColor: 'yellow',
                // flex: 1,
                // width: '90%',
                justifyContent: 'flex-end',
                gap: 5,
              }}>
              {state?.userInput?.map(op => {
                return (
                  <TouchableDebounce
                    key={op?.name}
                    onPress={() => op?.callback()}
                    style={{
                      borderColor: 'black',
                      borderWidth: 1,
                      borderRadius: 15,
                      padding: 8,
                      minWidth: 70,
                    }}>
                    <Text
                      style={{
                        fontFamily: 'Nunito-Bold',
                        textAlign: 'center',
                        color: 'black',
                      }}>
                      {op?.name}
                    </Text>
                  </TouchableDebounce>
                );
              })}
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalAlert: {
    parent: {
      position: 'absolute',
      zIndex: 2000,
      // top: '8%',
      bottom: '10%',
      width: '100%',
      paddingHorizontal: '5%',
      paddingBottom: 35,
    },
    container: {
      flexDirection: 'row',
      height: '100%',
      borderRadius: 15,
      // minHeight: 120,
      paddingHorizontal: 10,
      paddingVertical: 5,
      gap: 5,
    },
    iconContainer: {
      // backgroundColor: 'green',
      // justifyContent: 'center',
    },
    messageContainer: {
      // backgroundColor: 'pink',
      // justifyContent: 'center',
      minHeight: 35,
      flex: 1,
    },
  },
});

if (Platform.OS === 'ios') {
  styles.modalAlert.container = {
    ...styles.modalAlert.container,
    shadowColor: '#171717',
    shadowOffset: {width: -2, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 3,
  };
} else if (Platform.OS === 'android') {
  styles.modalAlert.container = {
    ...styles.modalAlert.container,
    elevation: 4,
    shadowColor: '#000000',
  };
}
