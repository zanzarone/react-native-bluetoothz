<p align="center">
  <img
    alt="react-native-bluetoothz library logo"
    src="assets/images/logo.png"
    height="130"
  />
</p>

# BluetoothZ

Bluetooth Low Energy (BLE) is a wireless communication technology designed for low-power devices. It is a variant of the Bluetooth standard that was introduced in 2010 as part of the Bluetooth 4.0 specification. BLE is now widely used in various IoT applications, such as wearable devices, sensors, and other low-power devices.

The purpose of this project is to make the native Bluetooth LE(not **classic Bluetooth**) functionalities available on Android/iOS platforms accessible via Javascript.

<hr style='background-color:#00C674'/>

## Features

With this library, you can perform the following operations:

- Scan for nearby Bluetooth LE devices
- Observe the Bluetooth's adapter state changes
- Connect and discover the characteristics and services of Bluetooth LE peripherals
- Multiple peripheral connection
- Automatic reconnection with custom numbers of attempts
- Read and write Bluetooth LE characteristics
- Observe the values of characteristics that support notification/indication mode

<hr style='background-color:#00C674'/>

## Installation

To install the package, simply:

```sh
npm install react-native-bluetoothz
```

<div>
  <img style="vertical-align:middle" src="assets/images/icons8-apple-logo-20.png">
  <span style="">iOS</span>
</div>

For the iOS platform, the following steps are required:

- Update pods
  ```sh
  cd ios && pod install
  ```
- Add [_NSBluetoothAlwaysUsageDescription_](https://developer.apple.com/documentation/bundleresources/information_property_list/nsbluetoothalwaysusagedescription)(mandatory since iOS 13) key in **Info.plist** file.

<div>
  <img style="vertical-align:middle" src="assets/images/icons8-android-os-20.png">
  <span style=""> Android</span>
</div>

For Android platform, the following steps are required:

- _Minimum SDK version_, in top level **build.gradle** file, needs to be at least **21**.
  ```sh
  ...
  buildscript {
   ext {
       ...
       minSdkVersion = 21
   }
   ...
  ```

<hr style='background-color:#00C674'/>

## Import

Import all the library

```js
import * as bleLibrary from 'react-native-bluetoothz';
```

Import single funcionality

```js
import { adapterStatus } from 'react-native-bluetoothz';
```

<hr style='background-color:#00C674'/>

## API

### **Get adapter status**

Returns the current state of the Bluetooth adapter.

```ts
async function adapterStatus();
```

Returned value can be one of the following defines:

- `BLE_ADAPTER_STATUS_POWERED_ON`
- `BLE_ADAPTER_STATUS_POWERED_OFF`
- `BLE_ADAPTER_STATUS_INVALID`
- `BLE_ADAPTER_STATUS_UNKNOW`

### **Scan devices**

Start the scan procedure for discover nearby Bluetooth LE devices

```ts
/**
* @param services - Array of strings. Represents the UUIDs of the services you want to discover.
* @param filter   - String. The parameter is used to filter devices by name using regular expression passed.
* @param timeout  - Number. It represents the number of seconds after which the scan is stopped. Passing 0(or a negative number) means the scan will never stops. Default value is Defines.SCAN_TIMEOUT_MSEC = 10s
*/

function startScan({ services : Array<string>, filter : string, timeout : number = Defines.SCAN_TIMEOUT_MSEC })
```

discovered devices can be observed with [_BLE_PERIPHERAL_FOUND_](#BLE_PERIPHERAL_FOUND) event.

### **Manually stop scan**

Stop the scan procedure

```js
function stopScan()
```

### **Connect to device**

Initiate the connection with the device

```js
/**
* @param uuid             - String. Represents the UUIDs of the device.
* @param maxRetryCount    - Number. Represents the maximum number of attempts to establish a connection. Default value is Defines.DEFAULT_MAX_RETRY_COUNT = 5
*/

function connect({ uuid, maxRetryCount = Defines.DEFAULT_MAX_RETRY_COUNT })
```

This events can be observed:

- [BLE_PERIPHERAL_CONNECTED](#BLE_PERIPHERAL_CONNECTED) if the connection succedeed.
- [BLE_PERIPHERAL_DISCONNECTED](#BLE_PERIPHERAL_DISCONNECTED) if device disconnect right after connection.
- [BLE_PERIPHERAL_CONNECT_FAILED](#BLE_PERIPHERAL_CONNECT_FAILED) if the connection fails.

### **Disconnect to device**

Disconnect from a connected device

```js
/**
* @param uuid - String. Represents the UUIDs of the connected device.
*/

function disconnect({ uuid })
```

This events can be observed:

- [BLE_PERIPHERAL_DISCONNECTED](#BLE_PERIPHERAL_DISCONNECTED) when device is disconnected.

### **Cancel a pending connection**

Cancel the connection previously started to a device

```js
/**
* @param uuid - String. Represents the UUIDs of the device.
*/

function cancel({ uuid })
```

This events can be observed:

- [BLE_PERIPHERAL_DISCONNECTED](#BLE_PERIPHERAL_DISCONNECTED) when device is disconnected.

### **Reading characteristic's value**

Cancel the connection previously started to a device

```js
/**
* @param uuid     - String. Represents the UUIDs of the device.
* @param charUUID - String. Represents the UUIDs of the characteristic.
*/

function readCharacteristic({ uuid, charUUID })
```

This events can be observed:

- [BLE_PERIPHERAL_CHARACTERISTIC_READ_OK](#BLE_PERIPHERAL_CHARACTERISTIC_READ_OK) if the read from characteristic was successfull.
- [BLE_PERIPHERAL_CHARACTERISTIC_READ_FAILED](#BLE_PERIPHERAL_CHARACTERISTIC_READ_FAILED) if the read from characteristic failed.

### **Change characteristc's notification/indication mode**

Cancel the connection previously started to a device

```js
/**
* @param uuid     - String. Represents the UUIDs of the device.
* @param charUUID - String. Represents the UUIDs of the characteristic.
* @param enable   - Bool. Represents the status of notification. true - enable notification, false - disable notification
*/

function changeCharacteristicNotification = ({ uuid, charUUID, enable })
```

This events can be observed:

- [BLE_PERIPHERAL_NOTIFICATION_CHANGED](#BLE_PERIPHERAL_NOTIFICATION_CHANGED) if notification have been enabled or disabled.
- [BLE_PERIPHERAL_ENABLE_NOTIFICATION_FAILED](#BLE_PERIPHERAL_ENABLE_NOTIFICATION_FAILED) if enabling/disabling notification failed.

<hr style='background-color:#00C674'/>

## Listen to the events

The library exposes the following signals that can be observed via an EventListener.

### <a id="BLE_ADAPTER_STATUS_DID_UPDATE"></a> **BLE_ADAPTER_STATUS_DID_UPDATE** ![ios-logo](/assets/images/icons8-apple-logo-20.png) ![ios-logo](/assets/images/icons8-android-os-20.png)

This event notifies the change in state of the Bluetooth adapter

```ts
addListener(BLE_ADAPTER_STATUS_DID_UPDATE, (status : string) => {}
```

where **status** is one of the following:

```js
BLE_ADAPTER_STATUS_POWERED_ON;
BLE_ADAPTER_STATUS_POWERED_OFF;
BLE_ADAPTER_STATUS_INVALID;
BLE_ADAPTER_STATUS_UNKNOW;
```

### <a id="BLE_PERIPHERAL_FOUND"></a> **BLE_PERIPHERAL_FOUND** ![ios-logo](/assets/images/icons8-apple-logo-20.png) ![ios-logo](/assets/images/icons8-android-os-20.png)

This event notifies the discovery of a new device

```js
...addListener(BLE_PERIPHERAL_FOUND, device => ...
```

where **device** is composed like:

```ts
/**
 * @param uuid - String. Identifier of the device
 * @param name - String. Local name of the device
 * @param rssi - Number. Received signal strength of the device
 */
const { uuid: string, name: string, rssi: number } = device;
```

### <a id="BLE_PERIPHERAL_READY"></a> **BLE_PERIPHERAL_READY** ![ios-logo](/assets/images/icons8-apple-logo-20.png) ![ios-logo](/assets/images/icons8-android-os-20.png)

This event notifies that services and characteristics have been discovered for a certain device

```js
...addListener(BLE_PERIPHERAL_READY, device => ...
```

where **device** is composed like:

```ts
/**
 * @param uuid - String. Identifier of the device
 */
const { uuid: string } = device;
```

### <a id="BLE_PERIPHERAL_CONNECTED"></a> **BLE_PERIPHERAL_CONNECTED** ![ios-logo](/assets/images/icons8-apple-logo-20.png) ![ios-logo](/assets/images/icons8-android-os-20.png)

This event notifies that the device is connected

```js
...addListener(BLE_PERIPHERAL_CONNECTED, device => ...
```

where **device** is composed like:

```ts
/**
 * @param uuid - String. Identifier of the device
 */
const { uuid: string } = device;
```

### <a id="BLE_PERIPHERAL_DISCONNECTED"></a> **BLE_PERIPHERAL_DISCONNECTED** ![ios-logo](/assets/images/icons8-apple-logo-20.png) ![ios-logo](/assets/images/icons8-android-os-20.png)

This event notifies that the device is disconnected

```js
...addListener(BLE_PERIPHERAL_DISCONNECTED, device => ...
```

where **device** is composed like:

```ts
/**
 * @param uuid - String. Identifier of the device
 */
const { uuid: string } = device;
```

### <a id="BLE_PERIPHERAL_CONNECT_FAILED"></a> **BLE_PERIPHERAL_CONNECT_FAILED** ![ios-logo](/assets/images/icons8-apple-logo-20.png) ![ios-logo](/assets/images/icons8-android-os-20.png)

This event notifies that the connection failed

```js
...addListener(BLE_PERIPHERAL_CONNECT_FAILED,  => info ...
```

where **info** is composed like:

```ts
/**
 * @param uuid  - String. Identifier of the device
 * @param error - String. Reason of the failure.
 */
const { uuid: string, error: string } = info;
```

### <a id="BLE_PERIPHERAL_DISCOVER_SERVICES_FAILED"></a> **BLE_PERIPHERAL_DISCOVER_SERVICES_FAILED** ![ios-logo](/assets/images/icons8-apple-logo-20.png)

This event notifies that the service's discovering failed

```js
...addListener(BLE_PERIPHERAL_DISCOVER_SERVICES_FAILED,  => info ...
```

where **info** is composed like:

```ts
/**
 * @param uuid  - String. Identifier of the device
 * @param error - String. Reason of the failure.
 */
const { uuid: string, error: string } = info;
```

### <a id="BLE_PERIPHERAL_CHARACTERISTIC_DISCOVERED"></a> **BLE_PERIPHERAL_CHARACTERISTIC_DISCOVERED** ![ios-logo](/assets/images/icons8-apple-logo-20.png) ![ios-logo](/assets/images/icons8-android-os-20.png)

This event notifies that a new characteristic have been found.

```js
...addListener(BLE_PERIPHERAL_CHARACTERISTIC_DISCOVERED,  => data ...
```

where **data** is composed like:

```ts
/**
 * @param uuid      - String. Identifier of the device
 * @param charUUID  - String. Identifier of the characteristic.
 */
const { uuid: string, charUUID: string } = data;
```

### <a id="BLE_PERIPHERAL_CHARACTERISTIC_READ_OK"></a> **BLE_PERIPHERAL_CHARACTERISTIC_READ_OK** ![ios-logo](/assets/images/icons8-apple-logo-20.png) ![ios-logo](/assets/images/icons8-android-os-20.png)

This event notifies that the characteristic's value has been read.

```js
...addListener(BLE_PERIPHERAL_CHARACTERISTIC_READ_OK,  => info ...
```

where **info** is composed like:

```ts
/**
 * @param uuid      - String. Identifier of the device
 * @param charUUID  - String. Identifier of the characteristic.
 * @param value     - Hex string. An hex string represent the characteristic's value.
 */
const { uuid: string, error: string } = device;
```

### <a id="BLE_PERIPHERAL_CHARACTERISTIC_READ_FAILED"></a> **BLE_PERIPHERAL_CHARACTERISTIC_READ_FAILED** ![ios-logo](/assets/images/icons8-apple-logo-20.png) ![ios-logo](/assets/images/icons8-android-os-20.png)

This event notifies that the connection failed

```js
...addListener(BLE_PERIPHERAL_CONNECT_FAILED,  => info ...
```

where **info** is composed like:

```ts
/**
 * @param uuid  - String. Identifier of the device
 * @param error - String. Reason of the failure.
 */
const { uuid: string, error: string } = device;
```

### <a id="BLE_PERIPHERAL_CHARACTERISTIC_WRITE_OK"></a> **BLE_PERIPHERAL_CHARACTERISTIC_WRITE_OK** ![ios-logo](/assets/images/icons8-apple-logo-20.png) ![ios-logo](/assets/images/icons8-android-os-20.png)

This event notifies that the connection failed

```js
...addListener(BLE_PERIPHERAL_CONNECT_FAILED,  => info ...
```

where **info** is composed like:

```ts
/**
 * @param uuid  - String. Identifier of the device
 * @param error - String. Reason of the failure.
 */
const { uuid: string, error: string } = device;
```

### <a id="BLE_PERIPHERAL_CHARACTERISTIC_WRITE_FAILED"></a> **BLE_PERIPHERAL_CHARACTERISTIC_WRITE_FAILED** ![ios-logo](/assets/images/icons8-apple-logo-20.png) ![ios-logo](/assets/images/icons8-android-os-20.png)

This event notifies that the connection failed

```js
...addListener(BLE_PERIPHERAL_CONNECT_FAILED,  => info ...
```

where **info** is composed like:

```ts
/**
 * @param uuid  - String. Identifier of the device
 * @param error - String. Reason of the failure.
 */
const { uuid: string, error: string } = device;
```

### <a id="BLE_PERIPHERAL_NOTIFICATION_UPDATES"></a> **BLE_PERIPHERAL_NOTIFICATION_UPDATES** ![ios-logo](/assets/images/icons8-apple-logo-20.png) ![ios-logo](/assets/images/icons8-android-os-20.png)

This event notifies that the connection failed

```js
...addListener(BLE_PERIPHERAL_CONNECT_FAILED,  => info ...
```

where **info** is composed like:

```ts
/**
 * @param uuid  - String. Identifier of the device
 * @param error - String. Reason of the failure.
 */
const { uuid: string, error: string } = device;
```

### <a id="BLE_PERIPHERAL_ENABLE_NOTIFICATION_FAILED"></a> **BLE_PERIPHERAL_ENABLE_NOTIFICATION_FAILED** ![ios-logo](/assets/images/icons8-apple-logo-20.png) ![ios-logo](/assets/images/icons8-android-os-20.png)

This event notifies that the connection failed

```js
...addListener(BLE_PERIPHERAL_CONNECT_FAILED,  => info ...
```

where **info** is composed like:

```ts
/**
 * @param uuid  - String. Identifier of the device
 * @param error - String. Reason of the failure.
 */
const { uuid: string, error: string } = device;
```

### <a id="BLE_PERIPHERAL_NOTIFICATION_CHANGED"></a> **BLE_PERIPHERAL_NOTIFICATION_CHANGED** ![ios-logo](/assets/images/icons8-apple-logo-20.png) ![ios-logo](/assets/images/icons8-android-os-20.png)

This event notifies that the connection failed

```js
...addListener(BLE_PERIPHERAL_CONNECT_FAILED,  => info ...
```

where **info** is composed like:

```ts
/**
 * @param uuid  - String. Identifier of the device
 * @param error - String. Reason of the failure.
 */
const { uuid: string, error: string } = device;
```

---

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

---

## License

MIT

---

## Attribution

All icons used on this page are provided by [_Icon8_](https://icons8.com/).

---
