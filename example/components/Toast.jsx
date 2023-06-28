import {Image, Modal, StyleSheet, Text, View} from 'react-native';
import Emitter from '../utils/emitter';
import TouchableDebounce from './TouchableDebounce';
import {useEffect, useState} from 'react';

const Constants = {
  Events: {SHOW_TOAST: 'SHOW_TOAST', HIDE_TOAST: 'HIDE_TOAST'},
  Types: {
    ERROR: 'ERROR',
    WARNING: 'WARNING',
    INFO: 'INFO',
  },
};

function toastColor({state}) {
  let color;
  switch (state?.type) {
    case Constants.Types.ERROR:
      color = 'coral';
      break;
    case Constants.Types.WARNING:
      color = '#FCC419';
      break;
    case Constants.Types.INFO:
    default:
      color = 'lightblue';
      break;
  }
  return color;
}

function toastIcon({state}) {
  let icon;
  switch (state?.type) {
    case Constants.Types.ERROR:
      icon = require('../assets/icon/error-100.png');
      break;
    case Constants.Types.WARNING:
      icon = require('../assets/icon/warn-100.png');
      break;
    case Constants.Types.INFO:
    default:
      icon = require('../assets/icon/info-100.png');
      break;
  }
  return icon;
}

function toastTitle({state}) {
  let title;
  switch (state?.type) {
    case Constants.Types.ERROR:
      title = 'Error';
      break;
    case Constants.Types.WARNING:
      title = 'Warning';
      break;
    case Constants.Types.INFO:
    default:
      title = 'Error';
      break;
  }
  return title;
}

function showToast({type, title, text, timeout = 3000}) {
  // console.log('1', type, title, text, timeout);
  Emitter.emit(Constants.Events.SHOW_TOAST, {
    type,
    title,
    text,
    visible: true,
  });
  if (timeout > 0) {
    setTimeout(() => Emitter.emit(Constants.Events.HIDE_TOAST, null), timeout);
  }
}

function hideToast() {
  // console.log('1', type, title, text, timeout);
  Emitter.emit(Constants.Events.HIDE_TOAST, null);
}

function showDialog({
  type,
  title,
  text,
  onButton1Title = undefined,
  onButton1Cb = undefined,
  onButton2Title = undefined,
  onButton2Cb = undefined,
  onButton3Title = undefined,
  onButton3Cb = undefined,
}) {
  // console.log('1', type, title, text, timeout);
  let userInput = [];
  if (onButton1Title && onButton1Cb) {
    userInput.push({callback: onButton1Cb, title: onButton1Title});
  }
  if (onButton2Title && onButton2Cb) {
    userInput.push({callback: onButton2Cb, title: onButton2Title});
  }
  if (onButton3Title && onButton3Cb) {
    userInput.push({callback: onButton3Cb, title: onButton3Title});
  }
  Emitter.emit(Constants.Events.SHOW_TOAST, {
    type,
    title,
    text,
    userInput,
    visible: true,
  });
}

const initialState = {
  visible: false,
  type: undefined,
  title: undefined,
  text: undefined,
  userInput: [],
};

const SOKA = [
  {
    id: Math.random() * 100,
    type: Constants.Types.INFO,
    title: 'Finally',
    text: 'Finally, the component returns a Button component with the onPress prop set to onPressButton, triggering the function when the button is pressed',
    onButton1Title: 'azz',
    onButton1Cb: () => hideToast(),
  },
  {
    id: Math.random() * 100,
    type: Constants.Types.WARNING,
    title: 'onPressButton',
    text: 'The onPressButton function is an asynchronous function that handles the button press event. It uses the await keyword to wait for the Promise to resolve or reject, and then logs the result or error accordingly.',
    onButton1Title: 'azz',
    onButton1Cb: () => hideToast(),
  },
  {
    id: Math.random() * 100,
    type: Constants.Types.ERROR,
    title: 'handleButtonPress',
    text: 'In this example, the handleButtonPress function returns a Promise that resolves or rejects based on the outcome of an asynchronous operation. You can modify this function to perform your desired asynchronous task, such as making an API call using fetch or any other asynchronous operation',
    onButton1Title: 'azz',
    onButton1Cb: () => hideToast(),
  },
];

function Toast() {
  const [state, updateState] = useState(SOKA);

  function setState(data) {
    // console.log('2', data);
    updateState(data);
  }

  function clearState() {
    updateState([
      {
        visible: false,
        type: undefined,
        title: undefined,
        text: undefined,
        userInput: [],
      },
    ]);
  }

  useEffect(() => {
    Emitter.on(Constants.Events.HIDE_TOAST, clearState);
    Emitter.on(Constants.Events.SHOW_TOAST, setState);
    return () => {
      Emitter.off(Constants.Events.HIDE_TOAST, clearState);
      Emitter.off(Constants.Events.SHOW_TOAST, setState);
    };
  }, []);

  return (
    <Modal transparent={true} animationType="fade" visible={true}>
      <View style={[styles.modalAlert.parent]}>
        {state.map((item, index) => {
          console.log(item, index);
          return (
            <View
              key={item.id}
              style={[
                styles.modalAlert.container,
                {
                  backgroundColor: toastColor({state: item}),
                  zIndex: styles.modalAlert.container.zIndex - index,
                  bottom:
                    styles.modalAlert.container.bottom +
                    (state.length - 1 - index) * 10,
                  maxHeight:
                    index === 0
                      ? 'auto'
                      : styles.modalAlert.container.maxHeight,
                },
              ]}>
              <View style={styles.modalAlert.iconContainer}>
                <Image
                  resizeMode="contain"
                  style={{height: 32, width: 32}}
                  source={toastIcon({state: item})}
                />
              </View>
              <View
                style={{
                  flex: 1,
                  gap: 0,
                }}>
                <View
                  style={{
                    minHeight: 32,
                    justifyContent: 'center',
                  }}>
                  <Text
                    style={{
                      color: 'black',
                      fontFamily: 'Nunito-Bold',
                      fontSize: 16,
                    }}>
                    {item?.title ? item.title : toastTitle({state: item})}
                  </Text>
                </View>
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
                    {item?.text}
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    paddingBottom: 8,
                    justifyContent: 'flex-end',
                    gap: 5,
                  }}>
                  {state?.userInput?.map(op => {
                    return (
                      <TouchableDebounce
                        key={op?.title}
                        onPress={() => op?.callback()}
                        style={{
                          borderColor: 'black',
                          borderRadius: 15,
                          backgroundColor: 'red',
                          padding: 8,
                          minWidth: 70,
                        }}>
                        <Text
                          style={{
                            fontFamily: 'Nunito-Black',
                            textAlign: 'center',
                            color: 'black',
                          }}>
                          {op?.title}
                        </Text>
                      </TouchableDebounce>
                    );
                  })}
                </View>
              </View>
              <TouchableDebounce
                onPress={() => {
                  setState(prevState => {
                    return prevState.filter(el => el.id !== item.id);
                  });
                }}
                style={styles.modalAlert.iconContainer}>
                <Image
                  resizeMode="contain"
                  style={{height: 28, width: 28}}
                  source={require('../assets/icon/close-100.png')}
                />
              </TouchableDebounce>
            </View>
          );
        })}
      </View>
      {/* <View style={styles.modalAlert.parent}>
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
          <View
            style={{
              // backgroundColor: 'green',
              // justifyContent: 'center',
              flex: 1,
              gap: 0,
            }}>
            <View
              style={{
                minHeight: 32,
                justifyContent: 'center',
              }}>
              <Text
                style={{
                  color: 'black',
                  // textAlignVertical: 'center',
                  fontFamily: 'Nunito-Bold',
                  fontSize: 16,
                }}>
                {state?.title ? state.title : toastTitle({state})}
              </Text>
            </View>
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
                    key={op?.title}
                    onPress={() => op?.callback()}
                    style={{
                      borderColor: 'black',
                      // borderWidth: 1,
                      borderRadius: 15,
                      backgroundColor: 'red',
                      padding: 8,
                      minWidth: 70,
                    }}>
                    <Text
                      style={{
                        fontFamily: 'Nunito-Black',
                        textAlign: 'center',
                        color: 'black',
                      }}>
                      {op?.title}
                    </Text>
                  </TouchableDebounce>
                );
              })}
            </View>
          </View>
        </View>
      </View> */}
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalAlert: {
    parent: {
      position: 'absolute',
      // backgroundColor: 'red',
      top: '8%',
      bottom: '13%',
      width: '100%',
      justifyContent: 'flex-end',
    },
    container: {
      position: 'absolute',
      flexDirection: 'row',
      zIndex: 2000,
      // height: '100%',
      borderRadius: 15,
      maxHeight: 120,
      bottom: 0,
      left: 20,
      right: 20,
      paddingHorizontal: 20,
      paddingVertical: 20,
      gap: 5,
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

module.exports = {
  Toast,
  ToastDefines: {...Constants.Types},
  showToast,
  showDialog,
  hideToast,
};
