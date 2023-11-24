import React from "react";
import { View, StyleSheet } from "react-native";


export default function Divider({ type }) {
  return (
    <View style={[styles.container, type === 'horizontal' ? styles.horizontal : styles.vertical]} />
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#E5E5E5',
  },
  horizontal: {
    height: 1,
    width: '80%',
  },
  vertical: {
    height: '80%',
    width: 1,
  }
});