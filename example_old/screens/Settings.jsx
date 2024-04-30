import {useEffect, useState} from 'react';
import * as BluetoothZ from 'react-native-bluetoothz';
import {Image, StyleSheet, View, Platform} from 'react-native';
import BackgroundShape from '../components/BackgroundShape';
import Header from '../components/Header';
import {Text} from 'react-native';
import Switch from '../components/Switch';

export default function Settings({navigation, route}) {
  const [isBluetoothPoweredOn, bluetoothPoweredOn] = useState(undefined);
  useEffect(() => {
    const bleAdapterListener = BluetoothZ.emitter().addListener(
      BluetoothZ.Defines.BLE_ADAPTER_STATUS_DID_UPDATE,
      ({status}) => {
        console.log('oooooooooooo', status);
        bluetoothPoweredOn(
          status === BluetoothZ.Defines.BLE_ADAPTER_STATUS_POWERED_ON,
        );
      },
    );
    ///
    BluetoothZ.adapterStatus();
    return function cleanup() {
      bleAdapterListener?.remove();
    };
  }, []);

  return (
    <View style={{flex: 1, backgroundColor: '#F7F7F7'}}>
      <Header status={isBluetoothPoweredOn} />
      <BackgroundShape bleStatus={isBluetoothPoweredOn} />
      <View style={{alignItems: 'center', flex: 1, gap: 15}}>
        <SectionList title={'GENERAL'}>
          <SectionItem
            icon={require('../assets/icon/scanner-settings-100.png')}
            title={'Scanner'}
            onMore={() => {}}
          />
          <SectionItem
            icon={require('../assets/icon/terminal-100.png')}
            title={'Logger'}
            onToggle={on => {}}
          />
          <SectionItem
            icon={require('../assets/icon/imported-files-100.png')}
            title={'Local files'}
            onMore={() => {}}
            last
          />
        </SectionList>
        <SectionList title={'ABOUT THE APP'}>
          <SectionItem
            icon={require('../assets/icon/app-version-100.png')}
            title={'App version'}
            value={'0.1.12'}
          />
          <SectionItem
            icon={require('../assets/icon/build-number-100.png')}
            title={'Build'}
            value={'230608.2326'}
          />
          <SectionItem
            icon={require('../assets/icon/online-100.png')}
            title={'Online resources'}
            value={'Up to date'}
            valueColor={'palegreen'}
            description={'Checked on ' + Date()}
            last
          />
        </SectionList>
      </View>
    </View>
  );
}

const SectionList = ({children, title}) => {
  return (
    <View style={[styles.sectionList]}>
      <Text
        style={{
          fontFamily: 'Nunito-Bold',
          fontSize: 15,
          color: 'black',
          width: '85%',
        }}>
        {title?.toUpperCase()}
      </Text>
      <View
        style={[
          {
            backgroundColor: 'black',
            borderRadius: 15,
            width: '90%',
          },
          styles.shadow,
        ]}>
        {children}
      </View>
    </View>
  );
};

const SectionItem = ({
  icon,
  title,
  titleColor = undefined,
  onMore,
  onToggle,
  value = undefined,
  valueColor = undefined,
  description = undefined,
  last = false,
}) => {
  return (
    <View
      style={[
        styles.sectionItem,
        {
          paddingRight: onMore || onToggle ? 10 : 15,
          borderBottomWidth: last ? 0 : 1,
        },
      ]}>
      <View
        style={{flexDirection: 'row', alignItems: 'center', gap: 5, flex: 1}}>
        <Image
          style={{height: 26, width: 26}}
          resizeMode="contain"
          source={icon}
        />
        <View style={{justifyContent: 'center'}}>
          <Text
            style={{
              fontFamily: 'Nunito-Regular',
              fontSize: 17,
              color: 'white',
            }}>
            {title}
          </Text>
          {description && (
            <Text
              style={{
                fontFamily: 'Nunito-Regular',
                fontSize: 13,
                color: 'silver',
              }}>
              {description}
            </Text>
          )}
        </View>
      </View>
      {value !== undefined && (
        <Text
          style={{
            flex: 1,
            textAlign: 'right',
            fontFamily: 'Nunito-Regular',
            fontSize: 17,
            color: valueColor ? valueColor : 'silver',
          }}>
          {value}
        </Text>
      )}
      {onMore && (
        <View style={{flex: 1, alignItems: 'flex-end'}}>
          <Image
            style={{height: 22, width: 22}}
            resizeMode="contain"
            source={require('../assets/icon/more-100.png')}
          />
        </View>
      )}
      {onToggle && (
        <View style={{flex: 1, alignItems: 'flex-end'}}>
          <Switch on />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  sectionItem: {
    flexDirection: 'row',
    paddingLeft: 10,
    paddingVertical: 12,
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomColor: 'dimgray',
  },
  sectionList: {
    width: '100%',
    alignItems: 'center',
    gap: 5,
  },
  shadow:
    Platform.OS === 'ios'
      ? {
          shadowColor: '#171717',
          shadowOffset: {width: -2, height: 4},
          shadowOpacity: 0.2,
          shadowRadius: 3,
        }
      : {
          elevation: 8,
          shadowColor: '#000',
        },
});
