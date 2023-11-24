import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Callout } from "react-native-maps";
import RenderHtml from 'react-native-render-html';

import { removeHyphens, capitalizeEachWord } from "../Utils/stringUtils";


export default function MarkerCallout({ title, description, ...props }) {

  return (
    <Callout {...props}>
      <View style={styles.calloutContainer}>
        <Text style={styles.calloutTitle}>{removeHyphens(capitalizeEachWord(title))}</Text>
        <RenderHtml
          contentWidth={200}
          source={{ html: description }}
          baseStyle={styles.calloutDescription}
        />
      </View>
    </Callout>
  );
}

const styles = StyleSheet.create({
  calloutContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    width: 200,
    padding: 5,
  },
  calloutTitle: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  calloutDescription: {
    fontSize: 14,
    textAlign: "center",
  },
});