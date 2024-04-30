/**
 * @format
 */

import {AppRegistry, NativeEventEmitter} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import {configure as configureBluetooth} from 'react-native-bluetoothz';

configureBluetooth(NativeEventEmitter);

AppRegistry.registerComponent(appName, () => App);
