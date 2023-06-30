import React from 'react';
import {Text} from 'react-native';

const MAX_CHARACTERS = 10; // Maximum number of characters before eliding

const ElidedText = ({style, children, maxNumCharacter = MAX_CHARACTERS}) => {
  if (children.length >= maxNumCharacter) {
    children = children.substring(0, maxNumCharacter) + '[...]';
  }

  return <Text style={style}>{children}</Text>;
};

export default ElidedText;
