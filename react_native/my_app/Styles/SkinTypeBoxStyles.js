// SkinTypeBoxStyles.js
import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function SkinTypeBoxStyles({ bgColor, titleColor, indexColor, descColor, title, index, description }) {
  return (
    <View
      style={{
        backgroundColor: bgColor,
        padding: 16,
        borderRadius: 12,
        marginBottom: 10,
      }}
    >
      <Text
        style={{
          fontWeight: "bold",
          fontSize: 27.5,
          color: titleColor,
          marginBottom: 3,
        }}
      >
        {title}
      </Text>
{/* ↓↑ */}
      <Text
        style={{
          fontSize: 17.5,
          fontWeight: "600",
          color: indexColor,
          marginBottom: 14,
        }}
      >
        {index}
      </Text>

      <Text
        style={{
          fontSize: 16,
          color: descColor,
          lineHeight: 21,
          marginBottom: 12,
        }}
      >
        {description}
        
      </Text>
    </View>
  );
}