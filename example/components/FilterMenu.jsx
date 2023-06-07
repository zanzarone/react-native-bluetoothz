import {Image, Modal, ScrollView, StyleSheet, Text, View} from 'react-native';
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

const ListItem = props => {
  return (
    <View
      style={{
        // minHeight: 100,
        width: '100%',
        // backgroundColor: '#333',
        // borderRadius: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        paddingVertical: 15,
        borderBottomColor: '#333',
        borderBottomWidth: 1,
        // top: '10%',
      }}>
      {props?.children}
    </View>
  );
};

const AllowDuplicates = () => {
  return (
    <ListItem>
      <View style={{flexDirection: 'row', gap: 5, alignItems: 'center'}}>
        <Image
          resizeMode="contain"
          source={require('../assets/icon/duplicate-100.png')}
          style={{height: 30, width: 30}}
        />
        <Text style={{fontFamily: 'Nunito-Regular', fontSize: 18}}>
          Allow duplicates
        </Text>
      </View>
      <TouchableDebounce>
        <Image
          resizeMode="contain"
          source={require('../assets/icon/cancel-100.png')}
          style={{height: 25, width: 25}}
        />
      </TouchableDebounce>
    </ListItem>
  );
};

const AllowNoNameDevices = () => {
  return (
    <ListItem>
      <View style={{flexDirection: 'row', gap: 5, alignItems: 'center'}}>
        <Image
          resizeMode="contain"
          source={require('../assets/icon/no-named-100.png')}
          style={{height: 30, width: 30}}
        />
        <Text style={{fontFamily: 'Nunito-Regular', fontSize: 18}}>
          Show no-named devices
        </Text>
      </View>
      <TouchableDebounce>
        <Image
          resizeMode="contain"
          source={require('../assets/icon/no-named-100.png')}
          style={{height: 25, width: 25}}
        />
      </TouchableDebounce>
    </ListItem>
  );
};

export default function FilterMenu({visible}) {
  return (
    <Modal transparent={true} animationType="fade" visible={visible}>
      <View style={{flex: 1}}>
        <View style={{flex: 1, backgroundColor: 'white', opacity: 0.5}}></View>
        <View
          style={{
            backgroundColor: 'black',
            position: 'absolute',
            zIndex: 2100,
            bottom: 0,
            left: 0,
            right: 0,
            height: '40%',
            alignItems: 'center',
            borderTopLeftRadius: 15,
            borderTopRightRadius: 15,
          }}>
          <ListItem>
            <View />
            <TouchableDebounce>
              <Image
                resizeMode="contain"
                source={require('../assets/icon/cancel-100.png')}
                style={{height: 25, width: 25}}
              />
            </TouchableDebounce>
          </ListItem>
          <ScrollView>
            <AllowDuplicates />
            <AllowNoNameDevices />
            {/* <AllowDuplicates /> */}
            {/* <AllowDuplicates /> */}
          </ScrollView>
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
