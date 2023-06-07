import {Image, Platform, Text, View} from 'react-native';
import TouchableDebounce from './TouchableDebounce';
import {SafeAreaView} from 'react-native-safe-area-context';

export default function Header({status, onGoBack}) {
  let leftPart = (
    <View style={{alignItems: 'center', flexDirection: 'row'}}>
      {onGoBack && (
        <TouchableDebounce onPress={() => onGoBack()}>
          <Image
            style={{height: 35, width: 20}}
            source={require('../assets/icon/goback-100.png')}
          />
        </TouchableDebounce>
      )}
      <Image
        style={{height: 50, width: 50}}
        source={require('../assets/icon/logo-100.png')}
      />
      <Text style={{color: 'black', fontFamily: 'Nunito-Black', fontSize: 20}}>
        BluetoothZ
      </Text>
    </View>
  );
  let rightPart = (
    <View style={{alignItems: 'center', flexDirection: 'row', gap: 5}}></View>
  );
  return Platform.OS === 'android' ? (
    <View
      style={{
        alignItems: 'center',
        justifyContent: 'space-between',
        flexDirection: 'row',
        paddingHorizontal: 15,
        paddingVertical: 7,
        backgroundColor: status === true ? '#D4F174' : 'coral',
        gap: 5,
      }}>
      {leftPart}
      {rightPart}
    </View>
  ) : (
    <View
      style={{
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        flexDirection: 'row',
        paddingHorizontal: 15,
        paddingVertical: 0,
        backgroundColor: status === true ? '#D4F174' : 'coral',
        paddingTop: 45,
        paddingBottom: 5,
        // height: 100,
        gap: 5,
      }}>
      {leftPart}
      {rightPart}
    </View>
  );
}
