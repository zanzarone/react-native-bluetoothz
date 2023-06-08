import {Image, Platform, Text, View} from 'react-native';
import TouchableDebounce from './TouchableDebounce';
import {useEffect, useState} from 'react';

const BarButton = ({
  badge,
  badgeValue,
  badgeColor = 'black',
  badgeValueColor = 'white',
  status,
  isScanning,
  icon,
  onPress,
}) => {
  return (
    <View style={{backgroundColor: 'transparent'}}>
      {badge && (
        <View
          style={{
            position: 'absolute',
            zIndex: 100,
            top: -4,
            right: -5,
            height: 18,
            width: 18,
            borderRadius: 9,
            backgroundColor: badgeColor,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Text
            style={{
              fontFamily: 'Nunito-Black',
              color: badgeValueColor,
              fontSize: 10,
            }}>
            {badgeValue}
          </Text>
        </View>
      )}
      <TouchableDebounce
        disabled={!status || isScanning}
        debounceTime={0}
        onPress={() => onPress()}>
        <Image
          resizeMode="contain"
          style={{height: 30, width: 30}}
          source={icon}
        />
      </TouchableDebounce>
    </View>
  );
};

export default function Header({
  status,
  isScanning = false,
  onGoBack,
  filterMenu,
  onFilter,
}) {
  const [filtersActive, setFiltersActive] = useState(0);
  useEffect(() => {
    let activeFilters = 0;
    if (filterMenu?.allowDuplicates) activeFilters += 1;
    if (filterMenu?.allowNoNamed) activeFilters += 1;
    if (filterMenu?.filterByName?.enabled) activeFilters += 1;
    setFiltersActive(activeFilters);
  }, [filterMenu]);
  let leftPart = (
    <View style={{alignItems: 'center', flexDirection: 'row'}}>
      {onGoBack && (
        <TouchableDebounce debounceTime={0} onPress={() => onGoBack()}>
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
    <View
      style={{
        alignItems: 'center',
        flexDirection: 'row',
        gap: 2,
        opacity: !status || isScanning ? 0.5 : 1,
      }}>
      {false && (
        <BarButton
          status={status}
          isScanning={isScanning}
          icon={require('../assets/icon/error-100.png')}
        />
      )}
      {onFilter && (
        <BarButton
          onPress={() => onFilter()}
          badgeValue={filtersActive}
          badge={filtersActive > 0}
          badgeColor="red"
          status={status}
          isScanning={isScanning}
          icon={require('../assets/icon/filter2-100.png')}
        />
      )}
    </View>
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
