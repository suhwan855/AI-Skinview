import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, StyleSheet, TouchableOpacity, Dimensions } from "react-native";
import HomeIcon from "../Icons/HomeIcon";
import CalendarIcon from "../Icons/CalendarIcon";
import CameraIcon from "../Icons/CameraIcon";
import MyPageIcon from "../Icons/MyPageIcon";

const { width: screenWidth } = Dimensions.get("window");

const BottomNavigation = ({ active, onHomePress, onCalendarPress, onCameraPress, onMyPagePress }) => {
  const handlePress = (name, callback) => {
    callback && callback();
  };

  const renderIcon = (name, IconComponent, onPress) => {
    let fillColor = "transparent";
    let strokeWidth = 2;

    if (name === "Camera") {
      strokeWidth = active === name ? 3 : 2;
    } else {
      fillColor = active === name ? "#fff" : "transparent";
      strokeWidth = 2;
    }

    return (
      <TouchableOpacity onPress={() => handlePress(name, onPress)} style={styles.iconButton}>
        {/* ✅ 아이콘 컴포넌트의 크기를 키웁니다. */}
        <IconComponent color="#fff" fillColor={fillColor} strokeWidth={strokeWidth} size={28} />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView edges={['bottom']} style={styles.safeAreaContainer}>
      <View style={styles.bottomBarContainer}>
        {renderIcon("Home", HomeIcon, onHomePress)}
        {renderIcon("Calendar", CalendarIcon, onCalendarPress)}
        {renderIcon("Camera", CameraIcon, onCameraPress)}
        {renderIcon("MyPage", MyPageIcon, onMyPagePress)}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeAreaContainer: {
    // 하단바 높이와 동일한 높이를 가지는 컨테이너
    // 하단바가 차지할 공간을 명확하게 확보
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    width: "100%",
    height: 70, // bottomBarContainer의 높이와 동일하게 설정
    backgroundColor: "transparent",
  },
  bottomBarContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    height: 70,
    backgroundColor: "#61dafb",
    paddingHorizontal: screenWidth * 0.05,
  },
  iconButton: {
    justifyContent: "center",
    alignItems: "center",
    width: 60,
    height: 60,
  },
});

export default BottomNavigation;
