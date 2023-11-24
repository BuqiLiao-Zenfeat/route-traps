import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function SearchBarButton({ buttonText, onPress, leftIcon, rightIcon }){
  return (
    <View style={styles.container}>
      {leftIcon}
      <TouchableOpacity 
        style={styles.textContainer} 
        onPress={onPress}
      >
        <Text numberOfLines={1} style={styles.buttonText}>{buttonText}</Text>
      </TouchableOpacity>
      {rightIcon}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    padding: 10,
    width: '100%',
  },
  textContainer: {
    flex: 1,
    marginHorizontal: 10,
  },
  buttonText: {
    fontSize: 16,
    overflow: 'hidden',
  },
});

