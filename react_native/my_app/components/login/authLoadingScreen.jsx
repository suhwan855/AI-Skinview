import React, { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../../utils/contexts/authContext";


const AuthLoadingScreen = ({ navigation }) => {
    const { login: authLogin } = useAuth();

    useEffect(() => {
        const checkLoginStatus = async () => {
            try {
                const userKey = await AsyncStorage.getItem("userKey");
                if (userKey) {
                    console.log("[AuthLoadingScreen] 저장된 userKey 발견 → 자동 로그인 시도");
                    authLogin(userKey); // Context 상태 업데이트
                    navigation.replace("MainApp");
                } else {
                    console.log("[AuthLoadingScreen] 저장된 userKey 없음 → 로그인 화면으로 이동");
                    navigation.replace("Login");
                }
            } catch (error) {
                console.error("자동 로그인 확인 중 오류:", error);
                navigation.replace("Login");
            }
        };

        checkLoginStatus();
    }, []);

    return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <ActivityIndicator size="large" color="#0000ff" />
        </View>
    );
}

export default AuthLoadingScreen;