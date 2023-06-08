import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import TouchableDebounce from './TouchableDebounce';
import {useEffect, useState} from 'react';
import Switch from './Switch';

const ListItem = props => {
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        paddingVertical: 15,
        borderBottomColor: '#333',
        borderBottomWidth: 1,
      }}>
      {props?.children}
    </View>
  );
};

const AllowDuplicates = ({enabled, onChange}) => {
  return (
    <ListItem>
      <View
        style={{
          flexDirection: 'row',
          flex: 1,
          gap: 5,
          alignItems: 'center',
          paddingVertical: 5,
        }}>
        <Text style={{fontFamily: 'Nunito-Bold', fontSize: 18}}>
          Allow duplicates
        </Text>
      </View>
      <View
        style={{
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <Switch on={enabled} onChange={e => onChange && onChange(e)} />
      </View>
    </ListItem>
  );
};

const AllowNoNamed = ({enabled, onChange}) => {
  return (
    <ListItem>
      <View
        style={{
          flexDirection: 'row',
          flex: 1,
          gap: 5,
          alignItems: 'center',
          paddingVertical: 5,
        }}>
        <Text style={{fontFamily: 'Nunito-Bold', fontSize: 18}}>
          No named devices
        </Text>
      </View>
      <View
        style={{
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <Switch on={enabled} onChange={e => onChange && onChange(e)} />
      </View>
    </ListItem>
  );
};

const IncludeFilterOnName = ({state, onChange}) => {
  const [filter, setFilter] = useState(state);
  return (
    <ListItem>
      <View
        style={{
          backgroundColor: 'transparent',
          justifyContent: 'center',
          flex: 1,
        }}>
        <View
          style={{
            flexDirection: 'row',
            flex: 1,
            gap: 5,
            alignItems: 'center',
            paddingVertical: 5,
            justifyContent: 'space-between',
            // backgroundColor: 'red',
          }}>
          <Text style={{fontFamily: 'Nunito-Bold', fontSize: 18}}>
            Filter by
          </Text>
          <View
            style={{
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Switch
              on={filter.enabled}
              onChange={e => {
                const changes = {...filter, enabled: e};
                onChange && onChange(changes);
                setFilter(changes);
              }}
            />
          </View>
        </View>
        <View
          style={{
            flexDirection: 'row',
            flex: 1,
            gap: 10,
            alignItems: 'center',
            paddingVertical: 5,
            justifyContent: 'space-between',
            opacity: filter.enabled ? 1 : 0.3,
            // backgroundColor: 'red',
          }}>
          <Text style={{fontFamily: 'Nunito-Regular', fontSize: 16, flex: 1}}>
            Name
          </Text>
          <TextInput
            editable={filter.enabled}
            defaultValue={filter.text}
            onChangeText={text => {
              const changes = {...filter, text};
              onChange && onChange(changes);
              setFilter(changes);
            }}
            style={{
              fontFamily: 'Nunito-Regular',
              color: 'black',
              backgroundColor: 'silver',
              flex: 2,
              borderRadius: 15,
              fontSize: 16,
              height: 45,
            }}
          />
        </View>
      </View>
    </ListItem>
  );
};

export default function FilterMenu({
  state,
  onClose,
  onNameFilterChange,
  onEnabledNoNamedChange,
  onEnabledDuplicatesChanged,
}) {
  console.log('ou');
  // console.log(state);
  return (
    <Modal transparent={true} animationType="fade" visible={state.open}>
      <View style={{flex: 1}}>
        <View style={{flex: 1, backgroundColor: 'white', opacity: 0.5}}></View>
        <View
          style={{
            backgroundColor: '#111',
            position: 'absolute',
            zIndex: 2100,
            bottom: 0,
            left: 0,
            right: 0,
            height: '40%',
            // alignItems: 'center',
            borderTopLeftRadius: 15,
            borderTopRightRadius: 15,
          }}>
          <ListItem>
            <View />
            <TouchableDebounce
              debounceTime={0}
              onPress={() => {
                onClose && onClose();
              }}>
              <Image
                resizeMode="contain"
                source={require('../assets/icon/close-100.png')}
                style={{height: 25, width: 25}}
              />
            </TouchableDebounce>
          </ListItem>
          <ScrollView>
            <AllowDuplicates
              enabled={state?.allowDuplicates}
              onChange={filter => onEnabledDuplicatesChanged(filter)}
            />
            <AllowNoNamed
              enabled={state?.allowNoNamed}
              onChange={filter => onEnabledNoNamedChange(filter)}
            />
            <IncludeFilterOnName
              state={state?.filterByName}
              onChange={filter => onNameFilterChange(filter)}
            />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalAlert: {
    parent: {
      position: 'absolute',
      zIndex: 2000,
      // top: '8%',
      bottom: '10%',
      width: '100%',
      paddingHorizontal: '5%',
      paddingBottom: 35,
    },
    container: {
      flexDirection: 'row',
      height: '100%',
      borderRadius: 15,
      // minHeight: 120,
      paddingHorizontal: 10,
      paddingVertical: 5,
      gap: 5,
    },
    iconContainer: {
      // backgroundColor: 'green',
      // justifyContent: 'center',
    },
    messageContainer: {
      // backgroundColor: 'pink',
      // justifyContent: 'center',
      minHeight: 35,
      flex: 1,
    },
  },
});

if (Platform.OS === 'ios') {
  styles.modalAlert.container = {
    ...styles.modalAlert.container,
    shadowColor: '#171717',
    shadowOffset: {width: -2, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 3,
  };
} else if (Platform.OS === 'android') {
  styles.modalAlert.container = {
    ...styles.modalAlert.container,
    elevation: 4,
    shadowColor: '#000000',
  };
}
