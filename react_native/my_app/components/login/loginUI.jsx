import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  SafeAreaView,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { handleLogin, handleSignUp } from "../../utils/authActions.js";
import { useAuth } from "../../utils/contexts/authContext.js";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

const LoginScreen = ({ navigation }) => {
  const { login: authLogin } = useAuth();
  const [isAutoLogin, setIsAutoLogin] = useState(false);
  const [email, setEmail] = useState("asd123");
  const [password, setPassword] = useState("qweqwe123@");
  const [showPassword, setShowPassword] = useState(false);

  const onLogin = () =>
    handleLogin(email, password, isAutoLogin, authLogin, navigation);
  const signUp = () => handleSignUp(navigation);

  return (
    <LinearGradient
      colors={["#ffffff", "#dff7ff", "#b6ecff"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={{ flex: 1 }}
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />
      <SafeAreaView style={{ flex: 1 }}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
          >
            <View style={styles.formContainer}>
              {/* Title */}
              <View style={styles.titleContainer}>
                <Text style={styles.title}>AI Skin View</Text>
                <Text style={styles.subtitle}>
                  Your trusted partner in skin health.
                </Text>
              </View>

              {/* ID Input */}
              <View style={styles.inputContainer}>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.textInput}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="ID"
                    placeholderTextColor="#888"
                    autoCapitalize="none"
                  />
                </View>
              </View>

              {/* Password Input */}
              <View style={styles.inputContainer}>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.textInput}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Password"
                    placeholderTextColor="#888"
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeButton}
                  >
                    <Ionicons
                      name={showPassword ? "eye-off" : "eye"}
                      size={22}
                      color="#61dafb"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* 자동 로그인 체크박스 */}
              <TouchableOpacity
                style={styles.autoLoginContainer}
                onPress={() => setIsAutoLogin(!isAutoLogin)}
              >
                <View
                  style={[
                    styles.checkbox,
                    isAutoLogin && styles.checkboxChecked,
                  ]}
                >
                  {isAutoLogin && (
                    <Ionicons name="checkmark" size={16} color="#fff" />
                  )}
                </View>
                <Text style={styles.autoLoginText}>자동 로그인</Text>
              </TouchableOpacity>

              {/* 회원가입 버튼 */}
              <TouchableOpacity style={styles.signUpLink} onPress={signUp}>
                <Text style={styles.signUpText}>회원가입</Text>
              </TouchableOpacity>

              {/* 로그인 버튼 */}
              <TouchableOpacity style={styles.loginButton} onPress={onLogin}>
                <Text style={styles.loginButtonText}>로그인</Text>
              </TouchableOpacity>

              <View style={{ height: 100 }} />
            </View>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  formContainer: {
    flex: 1,
    paddingHorizontal: screenWidth * 0.08,
    paddingTop: screenHeight * 0.1, // 안드로이드에서 너무 내려가지 않도록 줄임
  },
  titleContainer: {
    marginBottom: screenHeight * 0.05,
  },
  title: {
    fontSize: screenWidth * 0.12,
    color: "#61dafb",
    lineHeight: screenHeight * 0.08,
    fontFamily: "Raleway-ExtraBoldItalic",
    paddingHorizontal: 10,
  },
  subtitle: {
    fontSize: screenWidth * 0.038,
    color: "#051929",
    marginTop: screenHeight * 0.01,
    fontFamily: "goorm-sans-medium",
  },
  inputContainer: {
    marginBottom: screenHeight * 0.04,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#e0f7ff",
    borderRadius: 12,
    paddingHorizontal: screenWidth * 0.04,
    paddingVertical: 5,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
  },
  textInput: {
    flex: 1,
    fontSize: screenWidth * 0.045,
    color: "#051929",
    borderRadius: 12,
    height: 50,
    padding: 0,
    textAlignVertical: "center",
  },
  eyeButton: {
    padding: screenWidth * 0.015,
    justifyContent: "center",
    alignItems: "center",
  },
  signUpLink: {
    alignSelf: "center",
    marginTop: screenHeight * 0.02,
  },
  signUpText: {
    fontSize: screenWidth * 0.04,
    color: "#61dafb",
    textDecorationLine: "underline",
    fontFamily: "goorm-sans-medium",
  },
  loginButton: {
    marginTop: screenHeight * 0.04,
    backgroundColor: "#61dafb",
    paddingVertical: screenHeight * 0.02,
    borderRadius: 12,
    alignItems: "center",
    alignSelf: "center",
    width: "100%",
    shadowColor: "#61dafb",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: screenWidth * 0.045,
    fontWeight: "700",
  },
  autoLoginContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: screenHeight * -0.01,
    marginLeft: screenWidth * 0.02,
    marginBottom: screenHeight * 0.02,
    paddingRight: 5,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1.5,
    borderColor: "#61dafb",
    borderRadius: 4,
    marginRight: 8,
  },
  checkboxChecked: {
    backgroundColor: "#61dafb",
  },
  autoLoginText: {
    fontSize: screenWidth * 0.04,
    color: "#051929",
    paddingRight: 10,
  },
});
