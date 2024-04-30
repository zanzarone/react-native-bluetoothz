/**
 * @format
 */

import {AppRegistry, NativeEventEmitter} from 'react-native';
import App from './App.jsx';
import {name as appName} from './app.json';

import {configure} from 'react-native-bluetoothz';

configure(NativeEventEmitter);

AppRegistry.registerComponent(appName, () => App);
