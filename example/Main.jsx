import React, {useEffect, useState} from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
const Stack = createNativeStackNavigator();
// import {requestPermissions, Permission} from './utils/androidPermissions';
// import DocumentPicker from 'react-native-document-picker';
import DFU from './screens/DFU';
import Scanner from './screens/Scanner';

export default function Main({navigation}) {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen
        name="Scanner"
        component={Scanner}
        // initialParams={navigation}
      />
      <Stack.Screen
        name="DFU"
        component={DFU}
        // initialParams={navigation}
      />
    </Stack.Navigator>
  );
}
