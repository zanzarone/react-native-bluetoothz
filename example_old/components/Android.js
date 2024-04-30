import {View, Text, Platform, PermissionsAndroid} from 'react-native';
import React from 'react';
import {useFocusEffect} from '@react-navigation/native';

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

const requestCameraPermission = async () => {
  let granter = {};
  let permissionDenied = [];
  console.log('===========================>');
  try {
    granter = await PermissionsAndroid.requestMultiple(platformPermissions, {
      title: 'Example',
      buttonPositive: 'OK',
    });
    console.log('granter', granter === PermissionsAndroid.RESULTS.GRANTED);
    Object.keys(granter).map(k => {
      if (granter[k] !== PermissionsAndroid.RESULTS.GRANTED) {
        permissionDenied.push(k);
      }
    });
  } catch (err) {
    console.log(err);
    permissionDenied = platformPermissions;
  }
  return permissionDenied;
};

const Android = () => {
  useFocusEffect(
    React.useCallback(() => {
      requestCameraPermission();
    }, []),
  );
  return <View />;
};

export default Android;
