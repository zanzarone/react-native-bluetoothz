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

---

## Features

With this library, you can perform the following operations:

- Scan for nearby Bluetooth LE devices
- Observe the Bluetooth's adapter state changes
- Connect and discover the characteristics and services of Bluetooth LE peripherals
- Multiple peripheral connection
- Automatic reconnection with custom numbers of attempts
- Read and write Bluetooth LE characteristics
- Observe the values of characteristics that support notification/indication mode

---

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

- _Minimum SDK version_, in top level **build.gradle**, needs to be at least **21**.
  ```sh
  ...
  buildscript {
   ext {
       ...
       minSdkVersion = 21
   }
   ...
  ```

---

## API

### Adapter status

To know the current state of the Bluetooth adapter

```js
import { adapterStatus } from 'react-native-bluetoothz';

const getBLEStatus = async () => {
  const status = await adapterStatus();
};
```

where **status** is one of the following:

- _BLE_ADAPTER_STATUS_POWERED_ON_
- _BLE_ADAPTER_STATUS_POWERED_OFF_
- _BLE_ADAPTER_STATUS_INVALID_
- _BLE_ADAPTER_STATUS_UNKNOW_

---

### Scan

To know the current state of the Bluetooth adapter

```js
import { adapterStatus } from 'react-native-bluetoothz';

const getBLEStatus = async () => {
  const status = await adapterStatus();
};
```

where **status** is one of the following:

- _BLE_ADAPTER_STATUS_POWERED_ON_
- _BLE_ADAPTER_STATUS_POWERED_OFF_
- _BLE_ADAPTER_STATUS_INVALID_
- _BLE_ADAPTER_STATUS_UNKNOW_

---

### Listen to the events

The library exposes the following signals that can be observed via an EventListener

- **BLE_ADAPTER_STATUS_DID_UPDATE**

  This event notifies the change in state of the Bluetooth adapter

  ```js
  ...addListener(BLE_ADAPTER_STATUS_DID_UPDATE, status => ...
  ```

  where **status** is one of the following:

  - _BLE_ADAPTER_STATUS_POWERED_ON_
  - _BLE_ADAPTER_STATUS_POWERED_OFF_
  - _BLE_ADAPTER_STATUS_INVALID_
  - _BLE_ADAPTER_STATUS_UNKNOW_

---

- **BLE_PERIPHERAL_FOUND**

  This event notifies the discovery of a new device

  ```js
  ...addListener(BLE_PERIPHERAL_FOUND, device => ...
  ```

  where **device** is composed like:

  ```ts
  /**
   * UUID - Identifier of the device
   * name - Local name of the device
   * rssi - Received Signal Strength of the device
   */
  const { uuid: string, name: string, rssi: number } = device;
  ```

---

- **BLE_PERIPHERAL_READY**

  This event notifies that services and characteristics have been discovered for a certain device

  ```js
  ...addListener(BLE_PERIPHERAL_READY, device => ...
  ```

  where **device** is composed like:

  ```ts
  /**
   * UUID - Identifier of the device
   */
  const { uuid: string } = device;
  ```

---

- **BLE_PERIPHERAL_CONNECTED**

  This event notifies that the device is connected

  ```js
  ...addListener(BLE_PERIPHERAL_CONNECTED, device => ...
  ```

  where **device** is composed like:

  ```ts
  /**
   * UUID - Identifier of the device
   */
  const { uuid: string } = device;
  ```

---

- BLE_PERIPHERAL_DISCONNECTED

  This event notifies that the device is disconnected

  ```js
  ...addListener(BLE_PERIPHERAL_DISCONNECTED, device => ...
  ```

  where **device** is composed like:

  ```ts
  /**
   * UUID - Identifier of the device
   */
  const { uuid: string } = device;
  ```

---

- `BLE_PERIPHERAL_CONNECT_FAILED`
- `BLE_PERIPHERAL_DISCOVER_SERVICES_FAILED`
- `BLE_PERIPHERAL_CHARACTERISTIC_DISCOVERED`
- `BLE_PERIPHERAL_CHARACTERISTIC_READ_OK`
- `BLE_PERIPHERAL_CHARACTERISTIC_READ_FAILED`
- `BLE_PERIPHERAL_CHARACTERISTIC_WRITE_OK`
- `BLE_PERIPHERAL_CHARACTERISTIC_WRITE_FAILED`
- `BLE_PERIPHERAL_NOTIFICATION_UPDATES`
- `BLE_PERIPHERAL_ENABLE_NOTIFICATION_FAILED`
- `BLE_PERIPHERAL_NOTIFICATION_CHANGED`

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
