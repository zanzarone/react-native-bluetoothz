import * as React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';

// import Home from './Home copy.jsx';
import Main from './Main.jsx';
import {Image, Text, View} from 'react-native';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

export default function MyTabs() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,
          tabBarStyle: {
            position: 'absolute',
            bottom: 25,
            left: 20,
            right: 20,
            borderRadius: 15,
            height: 70,
          },
        }}>
        {/* <Tab.Screen
          name="Home"
          component={Home}
          options={{
            tabBarIcon: ({focused}) => {
              return (
                <View style={{alignItems: 'center'}}>
                  <Image
                    resizeMode="contain"
                    style={{height: 30, width: 30}}
                    source={
                      focused
                        ? require('./assets/icon/scanner-selected-100.png')
                        : require('./assets/icon/scanner-100.png')
                    }
                  />
                  <Text
                    style={{
                      color: focused ? 'black' : 'silver',
                      fontFamily: 'Nunito-Bold',
                      fontSize: 12,
                    }}>
                    Scanner
                  </Text>
                </View>
              );
            },
          }}
        /> */}
        <Tab.Screen
          name="Main"
          component={Main}
          options={{
            tabBarIcon: ({focused}) => {
              return (
                <View style={{alignItems: 'center'}}>
                  <Image
                    resizeMode="contain"
                    style={{height: 30, width: 30}}
                    source={
                      focused
                        ? require('./assets/icon/scanner-selected-100.png')
                        : require('./assets/icon/scanner-100.png')
                    }
                  />
                  <Text
                    style={{
                      color: focused ? 'black' : 'silver',
                      fontFamily: 'Nunito-Bold',
                      fontSize: 12,
                    }}>
                    Scanner
                  </Text>
                </View>
              );
            },
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
