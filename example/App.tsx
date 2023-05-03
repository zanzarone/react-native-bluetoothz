import React, {useEffect, useState} from 'react';
import {
  Button,
  FlatList,
  SafeAreaView,
  // ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';

import {
  // adapterStatus,
  startScan,
  Defines,
  emitter,
} from 'react-native-bluetoothz';

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

// console.log(adapterStatus());
interface Device {
  uuid: string;
  name: string;
}

function App(): JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? '#222' : '#fefefe',
    flex: 1,
  };

  const [devices, updateDevices] = useState<Array<Device>>([]);

  const newDeviceFound = (device: Device) => {
    updateDevices((d: Array<Device>) => [
      ...d,
      {uuid: device.uuid, name: device.name},
    ]);
  };

  useEffect(() => {
    // event.on(Defines.BLE_PERIPHERAL_FOUND, newDeviceFound);
    console.log('AAAAAAAAAAAA', Defines.BLE_PERIPHERAL_FOUND);
    const sub = emitter.addListener(
      Defines.BLE_PERIPHERAL_FOUND,
      newDeviceFound,
    );
    // // console.log(DEFINES);
    return function cleanup() {
      emitter.removeSubscription(sub);
    };
  }, []);

  type ItemProps = {name: string};

  const Item = ({name}: ItemProps) => (
    <View style={{}}>
      <Text style={{}}>{name}</Text>
    </View>
  );

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <View style={{}}>
        <Text style={styles.sectionTitle}>Adapter Status</Text>
      </View>
      <View style={{minHeight: 200}}>
        <Text style={styles.sectionTitle}>Scan</Text>
        <Button
          title="SCAN"
          onPress={() => {
            startScan({});
          }}></Button>
        <FlatList
          data={devices}
          renderItem={({item}) => <Item name={item.name} />}
          keyExtractor={item => item.uuid}
        />
      </View>
    </SafeAreaView>
  );
}

export default App;
