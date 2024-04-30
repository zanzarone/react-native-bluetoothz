import {useEffect, useState} from 'react';
import TouchableDebounce from './TouchableDebounce';
import {View} from 'react-native';

export default function Switch({on = false, onChange}) {
  const [state, setState] = useState(on);
  useEffect(() => {
    onChange && onChange(state);
  }, [state]);
  return (
    <TouchableDebounce
      debounceTime={0}
      onPress={() => {
        setState(o => !o);
      }}
      style={{
        borderColor: state ? '#D4F174' : '#c0c0c0',
        backgroundColor: state ? '#D4F174' : 'transparent',
        borderWidth: 1,
        height: 30,
        width: 50,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: state ? 'flex-end' : 'flex-start',
      }}>
      <View
        style={{
          height: 24,
          width: 24,
          backgroundColor: state ? 'black' : '#c0c0c0',
          borderRadius: 12,
          marginHorizontal: 2,
        }}
      />
    </TouchableDebounce>
  );
}
