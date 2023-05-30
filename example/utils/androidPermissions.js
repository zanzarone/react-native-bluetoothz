import {useEffect, useState} from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  PermissionsAndroid,
  Platform,
  Modal,
  StyleSheet,
} from 'react-native';
// import Modal from 'react-native-modal';
const app = require('../app.json');

let platformPermissions = [
  PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
  PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
];
const v = +Platform.Version;
if (v >= 31) {
  platformPermissions.push(PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT);
  platformPermissions.push(PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN);
} else {
  platformPermissions.push(PermissionsAndroid.PERMISSIONS.BLUETOOTH);
  platformPermissions.push(
    PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
  );
}

// permissions.map(p => console.log(p.permission));

export const requestPermissions = async () => {
  const title = app.name;
  let granter = {};
  let permissionDenied = [];
  console.log('===========================>');
  try {
    granter = await PermissionsAndroid.requestMultiple(platformPermissions, {
      title,
      buttonPositive: 'OK',
    });
    console.log('granter', granter === PermissionsAndroid.RESULTS.GRANTED);
    Object.keys(granter).map(k => {
      if (granter[k] !== PermissionsAndroid.RESULTS.GRANTED)
        permissionDenied.push(k);
    });
  } catch (err) {
    console.log(err);
    permissionDenied = rights;
  }
  return permissionDenied;
};

export const requestSpecificPermission = async permission => {
  const title = app.name;
  let permissionDenied = [];
  console.log('===========================>');
  try {
    const result = await PermissionsAndroid.request(permission, {
      title,
      buttonPositive: 'OK',
    });
    if (result !== PermissionsAndroid.RESULTS.GRANTED) permissionDenied.push(k);
    console.log('allGranted', granted.length === 0);
  } catch (err) {
    console.log(err);
    permissionDenied = [permission];
  }
  return permissionDenied;
};

export const checkBluetoothPermission = async () => {
  let permissionDenied = [];
  for (let i = 0; i < platformPermissions.length; i++) {
    const permission = platformPermissions[i];
    const granted = await PermissionsAndroid.check(permission);
    console.log(
      permission,
      'isGranted',
      granted === PermissionsAndroid.RESULTS.GRANTED,
    );
    if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
      permissionDenied.push(permission);
    }
  }
  console.log(permissionDenied.length === 0 ? ' OK ' : ' NOOO ');
  return permissionDenied;
};

export const Permission = ({show, title, message, onButtonPress}) => {
  const [isVisible, visible] = useState(show);

  useEffect(() => {
    visible(show);
  }, [show]);

  const styles = StyleSheet.create({
    overlay: {
      backgroundColor: 'rgba(0,0,0,0.3)',
      flex: 1,
      justifyContent: 'flex-end',
    },
  });

  return (
    <Modal animated animationType="fade" transparent visible={isVisible}>
      <View style={styles.overlay}>
        <View
          style={{
            backgroundColor: 'crimson',
            // paddingTop: 12,
            borderTopRightRadius: 12,
            borderTopLeftRadius: 12,
            // maxHeight: '20%',
            minHeight: '25%',
          }}>
          <View
            style={{
              marginHorizontal: 10,
              marginVertical: 10,
              gap: 10,
              flex: 1,
            }}>
            <Text
              style={{
                textAlign: 'center',
                fontSize: 20,
                fontWeight: 'bold',
              }}>
              ⚠️
            </Text>
            <Text
              style={{
                color: 'snow',
                textAlign: 'center',
                fontSize: 18,
                fontWeight: 'bold',
              }}>
              {title}
            </Text>
            <Text
              style={{
                color: 'snow',
                textAlign: 'center',
                fontSize: 16,
              }}>
              {message}
            </Text>
            <TouchableOpacity
              style={{
                backgroundColor: 'snow',
                minHeight: 40,
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: 10,
              }}
              onPress={() => onButtonPress()}>
              <Text
                style={{
                  color: 'dimgray',
                  textAlign: 'center',
                  fontSize: 18,
                  fontWeight: 'bold',
                }}>
                Open settings
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
