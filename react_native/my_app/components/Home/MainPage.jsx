/**
 * @fileoverview 메인페이지 컴포넌트입니다.
 * 드래그 가능한 플로팅 챗봇 버튼을 추가하고, 챗봇 화면으로 이동하는 기능을 구현했습니다.
 */
import React, { useRef, useState, useEffect } from "react";
import { useFonts } from "expo-font";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    PanResponder,
    Animated,
    Dimensions,
    Image,
    FlatList,
    Platform,
} from "react-native";
import { useIsFocused } from "@react-navigation/native";
import ProductListSection, { PersonalizedProductsSection } from "./ProductList";

import Icon from "react-native-vector-icons/FontAwesome";
import { FontAwesome5 } from '@expo/vector-icons';

const { width, height } = Dimensions.get("window");

const images = [
    { id: "1", uri: require("../../assets/banner/banner1.webp") },
    { id: "2", uri: require("../../assets/banner/banner2.png") },
];

const BannerSlider = () => {
    const flatListRef = useRef(null);
    const [currentIndex, setCurrentIndex] = useState(0);

    const loopImages = [
        images[images.length - 1],
        ...images,
        images[0],
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            let nextIndex = currentIndex + 1;
            flatListRef.current?.scrollToIndex({
                index: nextIndex + 1,
                animated: true,
            });
            setCurrentIndex(nextIndex % images.length);
        }, 3000);
        return () => clearInterval(interval);
    }, [currentIndex]);

    const handleScrollEnd = (event) => {
        const contentOffsetX = event.nativeEvent.contentOffset.x;
        const index = Math.round(contentOffsetX / width);

        if (index === 0) {
            flatListRef.current?.scrollToIndex({
                index: images.length,
                animated: false,
            });
            setCurrentIndex(images.length - 1);
        } else if (index === loopImages.length - 1) {
            flatListRef.current?.scrollToIndex({ index: 1, animated: false });
            setCurrentIndex(0);
        } else {
            setCurrentIndex(index - 1);
        }
    };

    return (
        <View style={styles.bannerSectionCard}>
            <FlatList
                data={loopImages}
                ref={flatListRef}
                keyExtractor={(item, index) => `${item.id}-${index}`}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                renderItem={({ item }) => (
                    <Image source={item.uri} style={styles.bannerImage} />
                )}
                getItemLayout={(data, index) => ({
                    length: width,
                    offset: width * index,
                    index,
                })}
                onMomentumScrollEnd={handleScrollEnd}
                onLayout={() => {
                    flatListRef.current?.scrollToIndex({
                        index: 1,
                        animated: false,
                    });
                }}
            />
            <View style={styles.pageIndicator}>
                <Text style={styles.pageText}>
                    {currentIndex + 1}/{images.length}
                </Text>
            </View>
        </View>
    );
};

const Header = ({ title, onMenuPress, onSearchPress }) => {
    return (
        <View style={headerStyles.headerContainer}>
            <View style={headerStyles.leftContainer}>
                <Icon name="bars" size={24} color="#61dafb" onPress={onMenuPress} />
            </View>
            <View style={headerStyles.centerContainer}>
                <Text style={headerStyles.titleText}>{title}</Text>
            </View>
            <View style={headerStyles.rightContainer}>
                <Icon name="search" size={24} color="#61dafb" onPress={onSearchPress} />
            </View>
        </View>
    );
};

const headerStyles = StyleSheet.create({
    headerContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        paddingTop: Platform.OS === "ios" ? 20 : 30,
        paddingHorizontal: 10,
        backgroundColor: "#0000",
        zIndex: 10,
        paddingBottom: 20
    },
    leftContainer: { alignItems: "flex-start", width: 40, left: width * 0.05 },
    centerContainer: { flex: 1, alignItems: "center", justifyContent: "center" },
    rightContainer: { alignItems: "flex-end", width: 40, right: width * 0.05 },
    titleText: {
        fontSize: 22,
        fontWeight: "600",
        color: "#61dafb",
        fontFamily: "Raleway-ExtraBoldItalic",
        textAlign: Platform.OS === "ios" ? "center" : "left",
        flexShrink: 1,
        paddingRight: 15,
        paddingLeft: 15
    },
});

const MainPage = ({ navigation }) => {
    const isFocused = useIsFocused();
    const [fontsLoaded] = useFonts({
        "Raleway-ExtraBoldItalic": require("../../assets/fonts/Raleway-ExtraBoldItalic.ttf"),
        "goorm-sans-medium": require("../../assets/fonts/goorm-sans-medium.otf"),
        "goorm-sans-bold": require("../../assets/fonts/goorm-sans-bold.otf"),
    });

    if (fontsLoaded) {
        const oldTextRender = Text.render;
        Text.render = function (...args) {
            const origin = oldTextRender.call(this, ...args);
            return React.cloneElement(origin, {
                style: [{ fontFamily: "goorm-sans-medium" }, origin.props.style],
            });
        };
    }

    const { width: screenW, height: screenH } = Dimensions.get("window");
    const initialX = screenW * 0.8;
    const initialY = screenH * 0.75;
    const pan = useRef(new Animated.ValueXY({ x: initialX, y: initialY })).current;

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderGrant: () => {
                pan.setOffset({ x: pan.x._value, y: pan.y._value });
                pan.setValue({ x: 0, y: 0 });
            },
            onPanResponderMove: Animated.event(
                [null, { dx: pan.x, dy: pan.y }],
                { useNativeDriver: false }
            ),
            onPanResponderRelease: (evt, gestureState) => {
                const CLICK_THRESHOLD = 5;

                if (
                    Math.abs(gestureState.dx) < CLICK_THRESHOLD &&
                    Math.abs(gestureState.dy) < CLICK_THRESHOLD
                ) {
                    pan.flattenOffset(); // 클릭 시 offset 제거
                    navigation.navigate("LoadingScreen"); // 클릭 시 이동
                    return;
                }

                const CHATBOT_BUTTON_SIZE = 60;
                const PADDING_HORIZONTAL = 30;
                const PADDING_TOP = screenH * 0.1;
                const PADDING_BOTTOM = screenH * 0.18;

                const finalX = pan.x._offset + pan.x._value;
                const finalY = pan.y._offset + pan.y._value;

                pan.setOffset({ x: 0, y: 0 });

                const newFinalX = finalX > screenW / 2
                    ? screenW - CHATBOT_BUTTON_SIZE - PADDING_HORIZONTAL
                    : PADDING_HORIZONTAL;

                const newFinalY = Math.max(
                    PADDING_TOP,
                    Math.min(finalY, screenH - CHATBOT_BUTTON_SIZE - PADDING_BOTTOM)
                );

                pan.setValue({ x: newFinalX, y: newFinalY });
            },
        })
    ).current;

    return (
        <View style={styles.container}>
            <Header
                title="AI-SkinView"
                onMenuPress={() => navigation.navigate("CategoryList")}
                onSearchPress={() => navigation.navigate("SurveyForm")}
            />
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <BannerSlider />

                {/* 개인 맞춤형 제품 추천 */}
                <PersonalizedProductsSection
                    styles={{
                        sectionHeader: styles.sectionHeader,
                        sectionTitle: styles.sectionTitle,
                        highlightText: styles.highlightText,
                        mySectionCard: styles.mySectionCard,
                    }}
                />

                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>
                        <Text style={styles.highlightText}>스킨/토너</Text> 추천 제품
                    </Text>
                </View>
                <View style={styles.sectionCard}>
                    <ProductListSection type="스킨/토너" />
                </View>

                {/* 인기 미스트 추천 */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>
                        <Text style={styles.highlightText}>크림</Text> 추천 제품
                    </Text>
                </View>
                <View style={styles.sectionCard}>
                    <ProductListSection type="크림" />
                </View>

                {/* 인기 로션 추천 */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>
                        <Text style={styles.highlightText}>
                            에센스/세럼/앰플
                        </Text>{" "}
                        추천 제품
                    </Text>
                </View>
                <View style={styles.sectionCard}>
                    <ProductListSection type="에센스/세럼/앰플" />
                </View>

                {/* 인기 로션 추천 */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>
                        <Text style={styles.highlightText}>로션</Text> 추천 제품
                    </Text>
                </View>
                <View style={styles.sectionCard}>
                    <ProductListSection type="로션" />
                </View>

                {/* 인기 로션 추천 */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>
                        <Text style={styles.highlightText}>미스트</Text> 추천 제품
                    </Text>
                </View>
                <View style={styles.sectionCard}>
                    <ProductListSection type="미스트" />
                </View>
                <View style={styles.bottomSpacing} />
            </ScrollView>

            {/* 드래그 + 클릭 가능한 챗봇 버튼 */}
            <Animated.View
                style={[styles.chatBotButton, { transform: pan.getTranslateTransform() }]}
                {...panResponder.panHandlers}
            >
                <FontAwesome5 name="robot" size={28} color="#fff" />
            </Animated.View>
        </View>
    );
};

export const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff", fontFamily: "Inter" },
    content: { flex: 1 },
    sectionHeader: { width: "100%", paddingHorizontal: 16, marginTop: 10, marginBottom: 20 },
    sectionTitle: { fontSize: 18, fontWeight: "600", color: "#333", fontFamily: "goorm-sans-medium" },
    highlightText: { color: "#61dafb", fontWeight: "700", fontFamily: "goorm-sans-bold" },
    mySectionCard: {
        backgroundColor: "#fff",
        marginBottom: 20,
        paddingVertical: 10,
        shadowColor: "#61dafb",
        shadowOpacity: 0.5,
        shadowOffset: { height: 1 },
        shadowRadius: 5,
        elevation: 4,
    },
    sectionCard: {
        backgroundColor: "#fff",
        marginBottom: 20,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowOffset: { height: 6 },
        shadowRadius: 3,
        elevation: 2,
    },
    bottomSpacing: { height: 20 },
    bannerSectionCard: { backgroundColor: "#fff", marginTop: 20, marginBottom: 20 },
    bannerImage: { width: width - 30, height: 160, borderRadius: 15, resizeMode: "cover", marginHorizontal: 15 },
    chatBotButton: {
        position: "absolute",
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: "#61dafb",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 8,
    },
    pageIndicator: {
        position: "absolute",
        bottom: height * 0.14,
        right: width * 0.07,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(255,255,255,0.8)",
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 8,
        minWidth: 45,
    },
});

export default MainPage;
