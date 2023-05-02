<!-- ![repository logo](/assets/images/logo.png) -->
<p align="center">
  <img
    alt="react-native-bluetoothz library logo"
    src="assets/images/logo.png"
    height="130"
  />
</p>

# react-native-bluetoothz

Bluetooth Low Energy (BLE) is a wireless communication technology designed for low-power devices. It is a variant of the Bluetooth standard that was introduced in 2010 as part of the Bluetooth 4.0 specification. BLE is now widely used in various IoT applications, such as wearable devices, sensors, and other low-power devices.

The purpose of this project is to make the native Bluetooth LE(not **classic Bluetooth**) functionalities available on Android/iOS platforms accessible via Javascript.

---

## Features

With this library, you can perform the following operations:

- Scan for nearby Bluetooth LE devices
- Observe the Bluetooth's adapter state changes
- Connect and discover the characteristics and services of Bluetooth LE peripherals
- Automatic reconnection with custom numbers of attempts
- Read and write Bluetooth LE characteristics
- Observe the values of characteristics that support notification/indication mode

---

## Installation

To install the package, simply:

```sh
npm install react-native-bluetoothz
```

---

## Usage

```js
import { multiply } from 'react-native-bluetoothz';

// ...

const result = await multiply(3, 7);
```

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
