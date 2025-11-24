// React 및 React Native 필수 모듈들을 가져옵니다.
import React, { useState, useEffect, useRef } from "react";
import {
    Platform,
    KeyboardAvoidingView,
    TextInput,
    TouchableOpacity,
    ScrollView,
    View,
    Text,
    StyleSheet,
    Keyboard, // 키보드 상태를 감지하기 위한 모듈
    Image,
    Alert,
} from "react-native";
// 화면의 안전 영역(Safe Area)을 처리하기 위한 모듈
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
// HTTP 통신을 위한 라이브러리
import axios from "axios";
// 마크다운 렌더링 라이브러리
import Markdown from 'react-native-markdown-display';
import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * @description 챗봇 메시지 UI를 렌더링하는 컴포넌트입니다.
 * @param {object} props - 컴포넌트에 전달되는 속성
 * @param {object} props.message - 메시지 객체 (id, type, text 등 포함)
 * @param {string} props.time - 메시지가 표시될 시간
 * @param {Array<string>} props.quickReplies - 표시할 예상 질문 목록
 * @param {function} props.onQuickReplyPress - 예상 질문 버튼 클릭 시 호출될 함수
 */
const ChatBotMessage = ({ message, time, quickReplies, onQuickReplyPress }) => (
    <View style={styles.chatBotMessageContainer}>
        <View style={styles.chatBotAvatar}>
            <Image source={require('../../assets/ChatBotIcon.png')} style={styles.avatarText} />
        </View>
        <View style={styles.chatBotMessageWrapper}>
            <View style={styles.chatBotMessageBubble}>
                {/* --- [수정] Text를 Markdown 컴포넌트로 변경 --- */}
                <Markdown style={markdownStyles}>{message.text}</Markdown>
                {/* quickReplies 데이터가 있을 경우에만 버튼들을 렌더링합니다. */}
                {quickReplies && quickReplies.length > 0 && (
                    <View style={styles.quickRepliesWrapper}>
                        {quickReplies.map((q, i) => (
                            <TouchableOpacity key={i} style={styles.quickReplyButton} onPress={() => onQuickReplyPress(q)}>
                                <Text style={styles.quickReplyText}>{q}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </View>
            <Text style={styles.messageTime}>{time}</Text>
        </View>
    </View>
);

/**
 * @description 사용자 메시지 UI를 렌더링하는 컴포넌트입니다.
 * @param {object} props - 컴포넌트에 전달되는 속성
 * @param {object} props.message - 메시지 객체
 * @param {string} props.time - 메시지 시간
 */
const UserMessage = ({ message, time }) => (
    <View style={styles.userMessageContainer}>
        <View style={styles.userMessageWrapper}>
            <View style={styles.userMessageBubble}>
                <Text style={styles.userMessageText}>{message.text}</Text>
            </View>
            <Text style={styles.userMessageTime}>{time}</Text>
        </View>
    </View>
);

/**
 * @description 메인 채팅 화면 컴포넌트입니다.
 * @param {object} props - React Navigation으로부터 전달받는 속성
 * @param {object} props.navigation - 화면 이동을 제어하는 navigation 객체
 */
const ChatScreen = ({ route, navigation }) => {
    // --- 상태 관리 (State) ---

    // 사용자가 입력창에 입력 중인 텍스트를 관리합니다.
    const [inputText, setInputText] = useState("");
    // 화면에 표시될 전체 메시지 목록을 배열 형태로 관리합니다.
    const [messages, setMessages] = useState(route.params?.initialMessages || []);
    // 챗봇 답변의 타이핑 애니메이션 효과를 제어합니다.
    const [animatingMessage, setAnimatingMessage] = useState(null);
    // 사용자의 스크롤이 현재 맨 아래에 있는지 여부를 추적합니다.
    const [isAtBottom, setIsAtBottom] = useState(true);
    // ScrollView 컴포넌트에 직접 접근하여 스크롤을 제어하기 위해 사용합니다.
    const scrollViewRef = useRef();

    // --- 생명주기 및 효과 (Hooks) ---

    // useEffect: animatingMessage 상태가 변경될 때마다 실행됩니다.
    // 챗봇 답변에 타이핑 애니메이션 효과를 적용합니다.
    useEffect(() => {
        if (!animatingMessage) return; // 애니메이션 대상이 없으면 즉시 종료합니다.

        const { id, fullText } = animatingMessage;
        let index = 0;
        // setInterval을 사용해 일정 간격으로 텍스트를 한 글자씩 추가합니다.
        const intervalId = setInterval(() => {
            if (index < fullText.length) {
                setMessages(prev => prev.map(msg => msg.id === id ? { ...msg, text: fullText.substring(0, index + 1) } : msg));
                index++;
            } else {
                clearInterval(intervalId); // 모든 텍스트가 출력되면 인터벌을 종료합니다.
                setAnimatingMessage(null); // 애니메이션 상태를 초기화합니다.
            }
        }, 30); // 30ms 마다 한 글자씩 출력됩니다. (타이핑 속도)

        // 컴포넌트가 사라지거나, animatingMessage가 바뀌기 전에 실행되는 정리(cleanup) 함수입니다.
        // 메모리 누수를 방지하기 위해 남아있는 인터벌을 제거합니다.
        return () => clearInterval(intervalId);
    }, [animatingMessage]);

    // useEffect: 컴포넌트가 마운트될 때 한 번만 실행됩니다.
    // 키보드가 나타날 때 스크롤을 맨 아래로 이동시켜 채팅창이 가려지는 것을 방지합니다.
    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
            // 키보드 레이아웃 변경 후 스크롤하기 위해 약간의 딜레이를 줍니다.
            setTimeout(() => {
                if (scrollViewRef.current) {
                    scrollViewRef.current.scrollToEnd({ animated: true });
                }
            }, 100);
        });
        // 컴포넌트가 언마운트될 때 이벤트 리스너를 제거합니다.
        return () => keyboardDidShowListener.remove();
    }, []);

    // --- 핸들러 함수 (Event Handlers) ---

    const handleResetChat = async () => {
        Alert.alert(
            "대화 초기화",
            "대화 기록을 정말 초기화하시겠습니까?",
            [
                { text: "취소", style: "cancel" },
                {
                    text: "확인",
                    onPress: async () => {
                        try {
                            const userKey = await AsyncStorage.getItem("user_key");
                            console.log(userKey);
                            // 1. 백엔드에 초기화 요청
                            const response = await axios.post("http://20.81.185.103:8000/reset/", { user_key: userKey });
                            const newQuickReplies = response.data?.quick_replies || [];

                            // 한국 시간(KST)으로 고정
                            const kstTime = new Date().toLocaleTimeString("ko-KR", {
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: true,
                                timeZone: "Asia/Seoul"
                            })
                                .replace("AM", "오전")
                                .replace("PM", "오후");


                            // 2. 채팅창 UI를 초기 상태로 리셋
                            const initialMessage = {
                                id: "bot-welcome-reset",
                                type: "bot",
                                text: "무엇을 도와드릴까요?",
                                time: kstTime,
                                quickReplies: newQuickReplies
                            };

                            setMessages([initialMessage]);
                            // 스크롤을 맨 위로 이동
                            scrollViewRef.current?.scrollTo({ y: 0, animated: true });

                        } catch (error) {
                            console.error("대화 기록 초기화 실패:", error);
                            Alert.alert("오류", "대화 기록 초기화에 실패했습니다. 다시 시도해주세요.");
                        }
                    },
                    style: "destructive"
                }
            ]
        );
    };

    /**
     * @description 사용자가 메시지를 보내는 핵심 함수입니다.
     * @param {string} text - 전송할 메시지 텍스트
     */
    const sendMessage = async (text) => {
        // 메시지가 비어있거나, 다른 답변이 애니메이션 중일 때는 전송을 방지합니다.
        if (!text.trim() || animatingMessage) return;

        // --- [수정] 한국 시간(KST)으로 고정 ---
        const time = new Date().toLocaleTimeString("ko-KR", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
            timeZone: "Asia/Seoul"
        })
            .replace("AM", "오전")
            .replace("PM", "오후");
        const userMessage = { id: `user-${Date.now()}`, type: "user", text, time };

        // [수정] 메시지 삭제 대신, 마지막 챗봇 메시지의 버튼만 제거하도록 수정
        setMessages(prev => {
            const newMessages = [...prev];
            // 마지막 메시지를 찾습니다.
            const lastMessageIndex = newMessages.length - 1;
            if (lastMessageIndex >= 0) {
                const lastMessage = newMessages[lastMessageIndex];
                // 마지막 메시지가 quickReplies를 가진 챗봇 메시지인지 확인합니다.
                if (lastMessage.type === 'bot' && lastMessage.quickReplies) {
                    // quickReplies 속성만 제거한 새로운 메시지 객체를 만듭니다.
                    const updatedLastMessage = { ...lastMessage };
                    delete updatedLastMessage.quickReplies;
                    // 기존 마지막 메시지를 업데이트된 메시지로 교체합니다.
                    newMessages[lastMessageIndex] = updatedLastMessage;
                }
            }
            // 사용자 메시지를 추가하여 반환합니다.
            return [...newMessages, userMessage];
        });

        // 화면에 사용자 메시지와 봇 응답 대기 메시지를 먼저 표시합니다.
        setInputText(""); // 입력창을 비웁니다.
        const botMessagePlaceholder = { id: `bot-${Date.now()}`, type: "bot", text: "...", time }; // AI 응답 대기 중 표시
        setMessages(prev => [...prev, botMessagePlaceholder]);

        try {
            const userKey = await AsyncStorage.getItem("user_key");
            const response = await axios.post("http://20.81.185.103:8000/message/", { user_key: userKey, message: text });
            const botReply = response.data?.reply;
            const quickReplies = response.data?.quick_replies;

            if (botReply) {
                const newBotMessage = {
                    ...botMessagePlaceholder,
                    text: "", // 타이핑 애니메이션을 위해 비움
                    quickReplies: quickReplies || []
                };
                setMessages(prev => prev.map(msg => msg.id === botMessagePlaceholder.id ? newBotMessage : msg));
                setAnimatingMessage({ id: botMessagePlaceholder.id, fullText: botReply });
            } else {
                // 응답은 성공했지만 내용이 없는 경우
                setMessages(prev => prev.filter(msg => msg.id !== botMessagePlaceholder.id));
                Alert.alert("오류", "서버에서 응답이 없습니다.");
            }
        } catch (error) {
            console.error("메시지 전송 오류:", error);
            setMessages(prev => prev.map(msg => msg.id === botMessagePlaceholder.id ? { ...msg, text: "서버 통신 중 오류가 발생했습니다." } : msg));
        }
    };

    /**
     * @description 예상 질문 버튼을 눌렀을 때 sendMessage 함수를 호출합니다.
     * @param {string} text - 선택한 예상 질문 텍스트
     */
    const handleQuickReplyPress = (text) => {
        sendMessage(text);
    };

    /**
     * @description 사용자의 스크롤 위치를 감지하여 isAtBottom 상태를 업데이트합니다.
     */
    const handleScroll = (event) => {
        const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
        // 스크롤이 맨 아래에서 20px 이내에 있는지 확인합니다.
        const paddingToBottom = 20;
        const isScrolledToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;
        setIsAtBottom(isScrolledToBottom);
    };

    /**
     * @description 메시지 목록의 전체 높이가 변경될 때 호출됩니다.
     * 사용자가 스크롤을 맨 아래에 둔 경우에만 자동으로 스크롤을 내립니다.
     */
    const handleContentSizeChange = () => {
        if (isAtBottom && scrollViewRef.current) {
            scrollViewRef.current.scrollToEnd({ animated: true });
        }
    };

    // --- 렌더링 (JSX) ---
    return (
        <SafeAreaProvider>
            <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
                {/* 헤더: 뒤로가기 버튼과 화면 제목 */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Text style={styles.backButtonText}>{'<'}</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Chat-Bot</Text>
                    {/* [수정] placeholder를 초기화 버튼으로 교체 */}
                    <TouchableOpacity onPress={handleResetChat} style={styles.resetButton}>
                        <Image
                            source={require('../../assets/reset_icon.png')}
                            style={styles.resetIcon}
                        />
                    </TouchableOpacity>
                </View>
                {/* 키보드가 올라올 때 화면이 가려지지 않도록 처리하는 뷰 */}
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={{ flex: 1 }}
                    keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
                >
                    {/* 메시지 목록을 보여주는 스크롤 뷰 */}
                    <ScrollView
                        ref={scrollViewRef}
                        style={styles.messagesContainer}
                        contentContainerStyle={{ paddingBottom: 20 }}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                        onScroll={handleScroll}
                        scrollEventThrottle={16} // 16ms마다 스크롤 이벤트를 감지하여 성능 최적화
                        onContentSizeChange={handleContentSizeChange}
                    >
                        {messages.map((msg) =>
                            msg.type === "bot" ? (
                                <ChatBotMessage
                                    key={msg.id}
                                    message={msg}
                                    time={msg.time}
                                    quickReplies={msg.quickReplies}
                                    onQuickReplyPress={handleQuickReplyPress}
                                />
                            ) : (
                                <UserMessage key={msg.id} message={msg} time={msg.time} />
                            )
                        )}
                    </ScrollView>

                    {/* 메시지 입력창 영역 */}
                    <View style={styles.inputContainer}>
                        <View style={styles.inputWrapper}>
                            <TextInput
                                style={styles.textInput}
                                placeholder="메시지 입력"
                                value={inputText}
                                onChangeText={setInputText}
                                onSubmitEditing={() => sendMessage(inputText)}
                                returnKeyType="send"
                                multiline // 여러 줄 입력 활성화
                            />
                            <TouchableOpacity style={styles.sendButton} onPress={() => sendMessage(inputText)} disabled={!!animatingMessage}>
                                <Text style={styles.sendArrowText}>➤</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </SafeAreaProvider>
    );
};

// --- 마크다운 스타일 정의 ---
const markdownStyles = {
    // ### h3 -> 굵은 텍스트, 약간 큰 폰트
    heading3: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 8,
        marginTop: 8,
    },
    // **text** -> 굵은 텍스트
    strong: {
        fontWeight: 'bold',
    },
    // 기본 텍스트 스타일
    body: {
        fontSize: 14,
        color: '#000',
    },
    // 리스트 아이템 (-, *)
    bullet_list: {
        marginBottom: 8,
    },
    list_item: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 4,
    },
};

// --- 스타일 정의 ---
const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: "center",
        justifyContent: "space-between", // space-between으로 변경
        paddingVertical: 10, // 패딩 조정
        paddingHorizontal: 15, // 패딩 조정
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    backButton: {
        padding: 5,
        minWidth: 40, // 너비 지정
        alignItems: 'flex-start'
    },
    backButtonText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: "#56B8FF", // 아이콘 색상과 통일
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#000",
        // 중앙 정렬을 위해 flex: 1과 textAlign: 'center'를 사용하지 않음
        // space-between 레이아웃에 의해 자연스럽게 중앙에 위치
    },
    resetButton: {
        minWidth: 40, // 너비 지정
        alignItems: 'flex-end',
        padding: 5
    },
    resetIcon: {
        width: 24,
        height: 24,
        tintColor: '#56B8FF', // 아이콘 색상 적용
        backgroundColor: 'transparent' // 배경 투명
    },
    placeholder: { // 이 스타일은 이제 사용되지 않음
        width: 30,
    },
    messagesContainer: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    chatBotMessageContainer: {
        flexDirection: "row",
        marginBottom: 20,
    },
    chatBotAvatar: {
        width: 50,
        height: 50,
        borderRadius: 5,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 10,
    },
    avatarText: {
        width: 50,
        height: 50
    },
    chatBotMessageWrapper: {
        flex: 1,
    },
    chatBotMessageBubble: {
        backgroundColor: "#F1F1F1",
        borderRadius: 10,
        padding: 12,
    },
    chatBotMessageText: {
        fontSize: 14,
        color: "#000",
    },
    quickRepliesWrapper: {
        marginTop: 10,
        flexDirection: "row",
        flexWrap: "wrap",
    },
    quickReplyButton: {
        backgroundColor: "#fff",
        borderRadius: 20,
        paddingVertical: 8,
        paddingHorizontal: 14,
        margin: 4,
        borderWidth: 1,
        borderColor: "#CFCFCF",
    },
    quickReplyText: {
        fontSize: 12,
        color: "#000",
    },
    messageTime: {
        fontSize: 10,
        color: "#888",
        marginTop: 5,
    },
    userMessageTime: {
        fontSize: 10,
        color: "#888",
        marginTop: 5,
    },
    userMessageContainer: {
        alignItems: "flex-end",
        marginBottom: 20,
    },
    userMessageWrapper: {
        alignItems: "flex-end",
    },
    userMessageBubble: {
        backgroundColor: "#B5F8FF",
        borderRadius: 10,
        padding: 12,
        maxWidth: "85%",
    },
    userMessageText: {
        fontSize: 14,
        color: "#000",
    },
    inputContainer: {
        borderTopWidth: 1,
        borderColor: "#e3e3e3",
        padding: 15,
        backgroundColor: "#fff",
    },
    inputWrapper: {
        flexDirection: "row",
        alignItems: "center",
    },
    textInput: {
        flex: 1,
        minHeight: 40,
        maxHeight: 120,
        fontSize: 14,
        color: "#000",
        backgroundColor: "#f9f9f9",
        borderRadius: 8,
        paddingHorizontal: 15,
        paddingTop: 10,
        paddingBottom: 10,
    },
    sendButton: {
        backgroundColor: "#56B8FF",
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center",
        marginLeft: 10,
        alignSelf: 'flex-end',
    },
    sendArrowText: {
        color: "#fff",
        fontSize: 16,
    },
});

export default ChatScreen;
