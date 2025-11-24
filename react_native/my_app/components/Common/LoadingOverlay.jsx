// components/common/LoadingOverlay.js
import React from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";

export default function LoadingOverlay({ visible }) {
  if (!visible) return null;
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#61dafb" />
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    position: "absolute",
    left: 0, right: 0, top: 0, bottom: 0,
    backgroundColor: "rgba(255,255,255,0.9)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
  },
});
