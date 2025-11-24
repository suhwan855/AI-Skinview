import React from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, View, Text } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { useFonts } from "expo-font";

// 컴포넌트 임포트
import AppNavigator from "./navigation/AppNavigator";
import LoadingOverlay from "./components/Common/LoadingOverlay";

import AddressProvider from "./utils/contexts/addressContext";
import { AuthProvider } from "./utils/contexts/authContext";

export default function App() {
  // 폰트 로딩 (GoormSansMedium + Raleway-ExtraBoldItalic)
  const [fontsLoaded] = useFonts({
    GoormSansMedium: require("./assets/fonts/goorm-sans-medium.otf"),
    "Raleway-ExtraBoldItalic": require("./assets/fonts/Raleway-ExtraBoldItalic.ttf"),
  });

  if (!fontsLoaded) {
    return <LoadingOverlay />;
  }

  // 전역 기본 폰트 설정 (GoormSansMedium)
  if (Text.defaultProps == null) Text.defaultProps = {};
  Text.defaultProps.style = { fontFamily: "GoormSansMedium" };

  return (
    <AuthProvider>
      <AddressProvider>
        <View style={styles.container}>
          <StatusBar style="auto" />
          <NavigationContainer>
            <AppNavigator />
            <LoadingOverlay />
          </NavigationContainer>
        </View>
      </AddressProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 40, // 상태바 영역 확보
  },
});
