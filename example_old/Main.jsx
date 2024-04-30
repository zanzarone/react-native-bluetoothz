import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
const Stack = createNativeStackNavigator();
import DFU from './screens/DFU.jsx';
import Scanner from './screens/Scanner';
import {Platform} from 'react-native';
// import Android from './components/Android.js';
import {Permission} from './utils/androidPermissions.js';

export default function Main({navigation}) {
  return (
    <>
      {Platform.OS === 'android' && <Permission />}
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
    </>
  );
}
