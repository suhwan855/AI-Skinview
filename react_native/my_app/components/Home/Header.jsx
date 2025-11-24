// src/components/Header.js
import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';

// hasBorder 속성을 추가하고 기본값을 true로 설정합니다.
const Header = ({ title, onBackPress, onResetPress, hasBorder = true }) => {
  return (
    // hasBorder가 true일 때만 headerBorder 스타일을 적용합니다.
    <View style={[styles.headerContainer, hasBorder && styles.headerBorder]}>
      {/* 왼쪽: 뒤로가기 */}
      <TouchableOpacity onPress={onBackPress} style={styles.iconButton}>
        <Feather name="arrow-left" size={26} color="#61dafb" />
      </TouchableOpacity>

      {/* 중앙: 제목 */}
      <Text style={styles.headerTitle} numberOfLines={1}>
        {title}
      </Text>

      {/* 오른쪽: 리셋 버튼 (있을 때만) */}
      {onResetPress ? (
        <TouchableOpacity
          onPress={onResetPress}
          style={styles.iconButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Image
            source={require('../assets/reset_icon.png')}
            style={styles.resetIcon}
          />
        </TouchableOpacity>
      ) : (
        <View style={styles.iconPlaceholder} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    paddingTop: 30,
    paddingHorizontal: 16,
    paddingBottom: 10,
    backgroundColor: "#fff",

  },
  backText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#61dafb', // 회원가입 버튼 톤과 맞춤
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "600",
    color: "#61dafb",
    fontFamily: "Raleway-ExtraBoldItalic",
    textShadowColor: "rgba(0,0,0,0.12)", // 제목 그림자
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  iconButton: {
    padding: 8,
    borderRadius: 8, // 버튼 라운드
  },
  resetIcon: {
    width: 24,
    height: 24,
    tintColor: '#61dafb',
    opacity: 0.85,
  },
  iconPlaceholder: {
    width: 32,
  },
});


export default Header;