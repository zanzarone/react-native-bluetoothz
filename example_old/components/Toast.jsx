import {Image, Modal, StyleSheet, Text, View} from 'react-native';
import Emitter from '../utils/emitter';
import TouchableDebounce from './TouchableDebounce';
import {useEffect, useRef, useState} from 'react';
import ElidedText from './ElidedText';
import {TouchableWithoutFeedback} from 'react-native';

const Constants = {
  Events: {SHOW_TOAST: 'SHOW_TOAST', HIDE_TOAST: 'HIDE_TOAST'},
  Types: {
    ERROR: 'ERROR',
    WARNING: 'WARNING',
    INFO: 'INFO',
    SUCCESS: 'SUCCESS',
  },
  TOAST_TIMEOUT: 4000,
  MAX_MESSAGE_LENGTH: 135,
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
    case Constants.Types.SUCCESS:
      color = 'lightgreen';
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
    case Constants.Types.SUCCESS:
      icon = require('../assets/icon/thumb-up-100.png');
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
      title = 'Info';
      break;
    case Constants.Types.SUCCESS:
      title = 'Success';
      break;
    default:
      title = 'Error';
      break;
  }
  return title;
}

const showToast = ({type, title, text, timeout = Constants.TOAST_TIMEOUT}) =>
  showDialog({type, title, text, timeout});

const hideToast = id => Emitter.emit(Constants.Events.HIDE_TOAST, {id});

function showDialog({
  type,
  title,
  text,
  buttonTitle1 = undefined,
  onButton1Cb = undefined,
  buttonTitle2 = undefined,
  onButton2Cb = undefined,
  buttonTitle3 = undefined,
  onButton3Cb = undefined,
  timeout = undefined,
}) {
  console.log('1', type, title, text, timeout);
  let userInput = [];
  if (buttonTitle1 && onButton1Cb) {
    userInput.push({callback: onButton1Cb, title: buttonTitle1});
  }
  if (buttonTitle2 && onButton2Cb) {
    userInput.push({callback: onButton2Cb, title: buttonTitle2});
  }
  if (buttonTitle3 && onButton3Cb) {
    userInput.push({callback: onButton3Cb, title: buttonTitle3});
  }
  const id = Math.floor(Math.random() * 100) + Date.now();
  Emitter.emit(Constants.Events.SHOW_TOAST, {
    id,
    type,
    title,
    text,
    userInput,
    timeout,
  });
}

let SOKA = [
  {
    id: Math.random() * 100,
    collapsed: true,
    type: Constants.Types.INFO,
    title: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    text: 'Finally, the component returns a Button component with the onPress prop set to onPressButton, triggering the function when the button is pressed',
    userInput: [
      {title: 'Ok', callback: () => console.log()},
      {title: 'Cancel', callback: () => console.log()},
      {title: 'More...', callback: () => console.log()},
    ],
  },
  {
    id: Math.random() * 100,
    collapsed: true,
    type: Constants.Types.WARNING,
    title: 'onPressButton',
    text: 'The onPressButton function is an asynchronous function that handles the button press event. It uses the await keyword to wait for the Promise to resolve or reject, and then logs the result or error accordingly.',
    buttonTitle1: 'azz',
    onButton1Cb: () => hideToast(),
  },
  {
    id: Math.random() * 100,
    collapsed: true,
    type: Constants.Types.ERROR,
    title: 'handleButtonPress',
    text: 'In this example, the handleButtonPress function returns a Promise that resolves or rejects based on the outcome of an asynchronous operation. You can modify this function to perform your desired asynchronous task, such as making an API call using fetch or any other asynchronous operation',
    userInput: [{title: 'Ok', callback: () => console.log()}],
  },
];

SOKA = [];

function Toast() {
  const [state, updateState] = useState(SOKA);
  const timersRef = useRef([]);

  function changeState(data) {
    console.log('2', data);
    let collapsed =
      data?.text?.length >= Constants.MAX_MESSAGE_LENGTH ? true : undefined;
    updateState(prev => [...prev, {...data, collapsed}]);
    if (data?.timeout) {
      const timer = setTimeout(
        () => Emitter.emit(Constants.Events.HIDE_TOAST, {id: data.id}),
        data.timeout,
      );
      timersRef.current.push(timer);
    }
  }

  function clearToast({id}) {
    updateState(prevState => prevState.filter(el => el.id !== id));
  }

  useEffect(() => {
    console.log('oooook');
    Emitter.on(Constants.Events.HIDE_TOAST, clearToast);
    Emitter.on(Constants.Events.SHOW_TOAST, changeState);
    return () => {
      console.log('offff');
      Emitter.off(Constants.Events.HIDE_TOAST, clearToast);
      Emitter.off(Constants.Events.SHOW_TOAST, changeState);
      timersRef.current.forEach(timer => clearInterval(timer));
    };
  }, []);

  return (
    <View style={[styles.modalAlert.parent]}>
      {state.map((item, index) => {
        console.log('====> aaaa ', JSON.stringify(item, null, 2), index);
        return (
          <TouchableWithoutFeedback
            onPress={() => {
              console.log(')))))))))))))))))))))))))))');
              updateState(prevState => {
                return prevState.map(el => {
                  if (el.id === item.id && el.collapsed !== undefined) {
                    return {...el, collapsed: !el.collapsed};
                  }
                  return el;
                });
              });
            }}
            key={item.id}>
            <View
              style={[
                styles.modalAlert.container,
                {
                  backgroundColor: toastColor({state: item}),
                  zIndex: styles.modalAlert.container.zIndex + index,
                  // left:
                  //   index === state.length - 1
                  //     ? styles.modalAlert.container.left
                  //     : styles.modalAlert.container.left - 10,
                  // right:
                  //   index === state.length - 1
                  //     ? styles.modalAlert.container.right
                  //     : styles.modalAlert.container.right + 10,
                  // left: index === state.length - 1 ? styles.modalAlert.container.zIndex : styles.modalAlert.container.zIndex + 5,
                  // bottom:
                  //   styles.modalAlert.container.bottom +
                  //   (state.length - 1 - index) * 10,
                  top:
                    styles.modalAlert.container.top +
                    (state.length - 1 - index) * 10,
                  // maxHeight:
                  //   item?.collapsed === false
                  //     ? 'auto'
                  //     : styles.modalAlert.container.maxHeight,
                },
              ]}>
              <View
                style={{
                  flexDirection: 'row',
                  paddingHorizontal: 10,
                  paddingTop: 10,
                  gap: 5,
                  // maxHeight:
                  //   index === state.length - 1
                  //     ? 'auto'
                  //     : styles.modalAlert.container.maxHeight,
                }}>
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
                    <ElidedText
                      maxNumCharacter={20}
                      style={{
                        color: 'black',
                        fontFamily: 'Nunito-Bold',
                        fontSize: 18,
                      }}>
                      {item?.title ? item.title : toastTitle({state: item})}
                    </ElidedText>
                  </View>
                  <View
                    style={
                      ([styles.modalAlert.messageContainer],
                      {
                        flexShrink: 1,
                        // backgroundColor: 'green',
                        marginBottom: 0,
                      })
                    }>
                    {item?.collapsed === true && (
                      <ElidedText
                        maxNumCharacter={Constants.MAX_MESSAGE_LENGTH}
                        style={{
                          color: 'black',
                          fontFamily: 'Nunito-Regular',
                          fontSize: 16,
                          height: 100,
                        }}>
                        {item?.text}
                      </ElidedText>
                    )}
                    {!item?.collapsed && (
                      <Text
                        style={{
                          color: 'black',
                          fontFamily: 'Nunito-Regular',
                          fontSize: 16,
                        }}>
                        {item?.text}
                      </Text>
                    )}
                  </View>
                  <View style={{alignItems: 'center'}}>
                    {item?.collapsed === false && (
                      <Image
                        source={require('../assets/icon/collapse-up-100.png')}
                        style={{height: 20, width: 20}}
                      />
                    )}
                    {item?.collapsed === true && (
                      <Image
                        source={require('../assets/icon/collapse-down-100.png')}
                        style={{height: 20, width: 20}}
                      />
                    )}
                  </View>
                </View>
                <TouchableDebounce
                  onPress={() => {
                    updateState(prevState => {
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
              {/* {item?.userInput?.length > 0 && ( */}
              <View
                style={{
                  flexDirection: 'row',
                  minHeight: 45,
                  justifyContent: 'space-between',
                  // backgroundColor: 'red',
                  borderTopColor: 'dimgray',
                  borderTopWidth: 1,
                  gap: 0,
                }}>
                {item?.userInput?.map((op, index) => {
                  return (
                    <TouchableDebounce
                      key={op?.title}
                      onPress={() => {
                        console.log('oooooo');
                        op?.callback();
                        updateState(prevState => {
                          return prevState.filter(el => el.id !== item.id);
                        });
                      }}
                      style={{
                        borderRightColor: 'gray',
                        borderRightWidth:
                          index !== item.userInput.length - 1 ? 1 : 0,
                        borderBottomLeftRadius: index === 0 ? 15 : 0,
                        borderBottomRightRadius:
                          index === item.userInput.length - 1 ? 15 : 0,
                        // backgroundColor: 'red',
                        flex: 1,
                        padding: 8,
                        justifyContent: 'center',
                        // minWidth: 70,
                      }}>
                      <Text
                        style={{
                          fontFamily: 'Nunito-Black',
                          fontSize: 15,
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
            {/* )} */}
          </TouchableWithoutFeedback>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  modalAlert: {
    parent: {
      position: 'absolute',
      zIndex: 2000,
      backgroundColor: 'red',
      top: 0,
      // height: '100%',
      width: '100%',
    },
    container: {
      position: 'absolute',
      flexDirection: 'column',
      zIndex: 2001,
      // height: '100%',
      borderRadius: 15,
      // minHeight: 200,
      // bottom: 0,
      top: 100,
      left: 15,
      right: 15,
      gap: 5,
    },
    messageContainer: {
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
