import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from "@react-native-async-storage/async-storage";

const getKSTTime = () => {
    return new Date().toLocaleTimeString("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        timeZone: "Asia/Seoul"
    })
        .replace("AM", "오전")
        .replace("PM", "오후");
};

const LoadingScreen = ({ navigation }) => {
    useEffect(() => {
        const fetchData = async () => {
            const userKey = await AsyncStorage.getItem("user_key");
            if (!userKey) return;

            try {
                const response = await axios.post("http://20.81.185.103:8000/start_chat/", { user_key: userKey });
                const initialMessages = response.data?.initialMessages;

                if (!initialMessages) {
                    throw new Error("초기 메시지 데이터가 없습니다.");
                }

                // API 응답 데이터에 시간 정보와 예상 질문을 추가
                const updatedInitialMessages = initialMessages.map(msg => ({
                    ...msg,
                    time: getKSTTime(), // 한국 시간 추가
                }));

                navigation.replace('ChatBot', { initialMessages: updatedInitialMessages });
            } catch (error) {
                console.error("초기 데이터 로딩 중 오류 발생:", error);
                Alert.alert(
                    "오류 발생",
                    "채팅방 입장에 실패했습니다. 잠시 후 다시 시도해주세요.",
                    [{
                        text: "확인",
                        onPress: () => {
                            if (navigation.canGoBack()) {
                                navigation.goBack();
                            } else {
                                navigation.replace("MainPage");  // 없으면 홈으로
                            }
                        }
                    }]
                );
            }
        };

        fetchData();
    }, [navigation]);

    return (
        <SafeAreaView style={styles.container}>
            <ActivityIndicator size="large" color="#56B8FF" />
            <Text style={styles.text}>채팅방에 입장하는 중...</Text>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    text: {
        marginTop: 10,
        fontSize: 16,
        color: '#666',
    },
});

export default LoadingScreen;
