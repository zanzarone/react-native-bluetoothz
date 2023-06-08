// import {TouchableOpacity} from 'react-native';

import {useRef} from 'react';
import {TouchableOpacity} from 'react-native';

export default function TouchableDebounce(props) {
  const lockRef = useRef(false);
  const {onPress, ...newProps} = props;
  // console.log(props)
  return (
    <TouchableOpacity
      onPress={() => {
        if (!lockRef.current) {
          lockRef.current = true;
          // if (props?.debounceTime <= 0) {
          onPress();
          lockRef.current = false;
          return;
          // }
          // setTimeout(
          //   () => {
          //     onPress();
          //     lockRef.current = false;
          //   },
          //   props?.debounceTime ? props.debounceTime : 500,
          // );
        }
      }}
      {...newProps}>
      {props?.children}
    </TouchableOpacity>
  );
}
