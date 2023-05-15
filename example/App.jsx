import * as React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Home from './Home.jsx';
import Characteristics from './Characteristics.jsx';
import CommonTest from './CommonTest.jsx';

const Stack = createNativeStackNavigator();

export default function MyStack() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}>
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="Characteristics" component={Characteristics} />
        <Stack.Screen name="CommonTest" component={CommonTest} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}