import * as React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';

import Home from './Home copy.jsx';
import Main from './Main.jsx';
import {Image, Platform, StyleSheet, Text, View} from 'react-native';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TabBarButton = ({focused, tabName, icon, iconFocused}) => {
  return (
    <View
      style={{
        top: 10,
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <Image
        resizeMode="contain"
        style={{height: 30, width: 30}}
        source={focused ? iconFocused : icon}
      />
      <Text
        style={{
          color: focused ? 'black' : 'silver',
          fontFamily: 'Nunito-Bold',
          fontSize: 12,
        }}>
        {tabName}
      </Text>
    </View>
  );
};

export default function MyTabs() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,
          tabBarStyle: {
            position: 'absolute',
            bottom: Platform.OS === 'android' ? 25 : 30,
            left: 20,
            right: 20,
            borderRadius: 15,
            height: 70,
            elevation: 0,
            ...styles.shadow,
          },
        }}>
        <Tab.Screen
          name="Main"
          component={Main}
          options={{
            tabBarIcon: ({focused}) => (
              <TabBarButton
                focused={focused}
                tabName={'Scanner'}
                icon={require('./assets/icon/scanner-100.png')}
                iconFocused={require('./assets/icon/scanner-selected-100.png')}
              />
            ),
          }}
        />
        <Tab.Screen
          name="Settings"
          component={Home}
          options={{
            tabBarIcon: ({focused}) => (
              <TabBarButton
                focused={focused}
                tabName={'Scanner'}
                icon={require('./assets/icon/settings-100.png')}
                iconFocused={require('./assets/icon/settings-100.png')}
              />
            ),
          }}
        />
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
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  shadow:
    Platform.OS === 'ios'
      ? {
          shadowColor: '#171717',
          shadowOffset: {width: -2, height: 4},
          shadowOpacity: 0.2,
          shadowRadius: 3,
        }
      : {
          elevation: 4,
          shadowColor: '#000000',
        },
});
