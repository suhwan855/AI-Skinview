import { CameraView, useCameraPermissions } from "expo-camera";
import { useRef, useState } from "react";
import {
    Button,
    Pressable,
    StyleSheet,
    Dimensions,
    Text,
    View,
    ActivityIndicator,
    SafeAreaView,
} from "react-native";
import { Image } from "expo-image";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import Header from "../../Styles/header";
import Svg, { Rect, Ellipse, Mask } from "react-native-svg";
import * as ImageManipulator from "expo-image-manipulator";

export default function GuidedCamera({ onRegister, navigation }) {
    const [permission, requestPermission] = useCameraPermissions();
    const ref = useRef(null);
    const [uri, setUri] = useState(null);
    const [facing, setFacing] = useState("front");
    const [loading, setLoading] = useState(false);
    const [isCameraReady, setIsCameraReady] = useState(false);

    if (!permission) return null;

    if (!permission.granted) {
        return (
            <View style={styles.container}>
                <Text style={{ textAlign: "center" }}>
                    We need your permission to use the camera
                </Text>
                <Button onPress={requestPermission} title="Grant permission" />
            </View>
        );
    }

    const toggleFacing = () => {
        setFacing((prev) => (prev === "back" ? "front" : "back"));
    };

    const takePicture = async () => {
        if (!ref.current) return;

        const photo = await ref.current.takePictureAsync({
            quality: 1,
            skipProcessing: false,
        });

        if (!photo) return;

        let fixedPhoto = photo;

        // 전면 카메라일 때만 좌우 반전 처리
        if (facing === "front") {
            fixedPhoto = await ImageManipulator.manipulateAsync(
                photo.uri,
                [{ flip: ImageManipulator.FlipType.Horizontal }],
                { compress: 1, format: ImageManipulator.SaveFormat.JPEG }
            );
        }

        setUri(fixedPhoto.uri);
    };

    const renderPicture = () => (
        <View
            style={{
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            <Image
                source={{ uri }}
                contentFit="contain"
                style={{
                    width: Dimensions.get("window").width - 20,
                    aspectRatio: 9 / 16,
                }}
            />

            <SafeAreaView edges={["bottom"]} style={styles.btnContainer}>
                <View style={styles.bottomBar}>
                    <Pressable
                        onPress={() => {
                            setUri(null);
                            setIsCameraReady(false); // ✅ 카메라 초기화
                        }}
                        style={({ pressed }) => [
                            { opacity: pressed ? 0.5 : 1 },
                        ]}
                    >
                        <Text style={styles.retake}>다시 찍기</Text>
                    </Pressable>
                    <Pressable
                        onPress={async () => {
                            // console.log("등록 버튼 클릭됨, uri:", uri); // 여기가 뜨는지 먼저 확인
                            if (uri) {
                                setLoading(true);
                                try {
                                    await onRegister(uri);
                                } catch (e) {
                                    // console.error("등록 실패", e);
                                    setUri(null);
                                    setIsCameraReady(false); // ✅ 카메라 초기화
                                } finally {
                                    setLoading(false);
                                }
                            }
                        }}
                        style={({ pressed }) => [
                            { opacity: pressed ? 0.5 : 1 },
                        ]}
                    >
                        <Text style={styles.photoRegister}>사진 사용</Text>
                    </Pressable>
                </View>
            </SafeAreaView>
        </View>
    );

    const guideWidth = 300;
    const guideHeight = 410;
    const guideTop = 50;
    const guideRadius = 150;

    const cx = width / 2;
    const cy = guideTop + guideHeight / 2; // guideFace 위치랑 맞추기

    const renderCamera = () => (
        <>
            {/* 1. Header 상단 */}
            <Header title="Camera" onBackPress={() => navigation.goBack()} />
            <View style={styles.cameraWrapper}>
                {!isCameraReady && (
                    <ActivityIndicator
                        size="large"
                        color="rgba(97, 218, 251, 1)"
                        style={{
                            position: "absolute",
                            top: height / 2,
                            left: width / 2,
                            zIndex: 20,
                        }}
                    />
                )}

                <CameraView
                    style={StyleSheet.absoluteFill}
                    ref={ref}
                    pictureSize="high"
                    zoom={0}
                    facing={facing}
                    mute={false}
                    responsiveOrientationWhenOrientationLocked
                    onCameraReady={() => setIsCameraReady(true)} // ✅ 준비 완료
                />

                {isCameraReady && (
                    <>
                        {/* 가이드 오버레이 */}
                        <View style={styles.overlay}>
                            <Svg
                                width={width}
                                height={height}
                                style={{ position: "absolute" }}
                            >
                                <Mask id="mask">
                                    <Rect
                                        width={width}
                                        height={height}
                                        fill="white"
                                    />
                                    <Ellipse
                                        cx={cx}
                                        cy={cy}
                                        rx={guideWidth / 2}
                                        ry={guideHeight / 2}
                                        fill="black"
                                    />
                                </Mask>
                                <Rect
                                    width={width}
                                    height={height}
                                    fill="rgba(0,0,0,0.5)"
                                    mask="url(#mask)"
                                />
                                {/* <View style={styles.guideFace} /> */}
                                <Ellipse
                                    cx={cx}
                                    cy={cy}
                                    rx={guideWidth / 2}
                                    ry={guideHeight / 2}
                                    stroke="rgba(97, 218, 251, 1)" // 선 색상
                                    strokeWidth={3} // 선 두께
                                    fill="transparent" // 안쪽은 비우기
                                />
                            </Svg>
                            <Text style={styles.guideText}>
                                밝은 실내에서 정면을 바라보며 촬영해주세요
                            </Text>
                        </View>

                        {/* 셔터 & 전환 버튼 */}
                        <View style={styles.shutterContainer}>
                            <Pressable
                                onPress={takePicture}
                                style={({ pressed }) => [
                                    styles.shutterBtn,
                                    { opacity: pressed ? 0.5 : 1 },
                                ]}
                                hitSlop={10} // 버튼 판정 범위 조금 넓히고 싶을 때
                            >
                                <View style={styles.shutterBtnInner} />
                            </Pressable>

                            <Pressable
                                onPress={toggleFacing}
                                style={({ pressed }) => [
                                    styles.toggleBtn,
                                    { opacity: pressed ? 0.5 : 1 },
                                    {
                                        shadowColor: "#61dafb",
                                        shadowOffset: { width: 0, height: 0 },
                                        shadowOpacity: 1,
                                        shadowRadius: 5,
                                        elevation: 7,
                                    },
                                ]}
                            >
                                <FontAwesome6
                                    name="rotate-left"
                                    size={32}
                                    color="white"
                                />
                            </Pressable>
                        </View>
                    </>
                )}
            </View>
        </>
    );
    return (
        <View style={styles.container}>
            {uri ? renderPicture() : renderCamera()}

            {loading && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#ffffff" />
                    <Text style={styles.loadingText}>등록 중입니다...</Text>
                </View>
            )}
        </View>
    );
}

// 스타일 정의
const width = Dimensions.get("window").width;
const height = Dimensions.get("window").height;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
    },
    cameraWrapper: {
        flex: 1,
        width: width,
        position: "relative",
    },
    overlay: {
        position: "absolute",
        top: 0,
        left: 0,
        width,
        height,
        justifyContent: "center",
        alignItems: "center",
        zIndex: 10,
    },
    dimBackground: {
        position: "absolute",
        top: 0,
        left: 0,
        width,
        height,
        backgroundColor: "rgba(0,0,0,0.5)",
    },
    guideFace: {
        position: "absolute",
        top: 50,
        width: 300,
        height: 410,
        borderRadius: 150,
        borderWidth: 3,
        borderColor: "rgba(97, 218, 251, 1)",
        backgroundColor: "transparent",
    },
    guideText: {
        marginTop: 150,
        color: "#ccc",
        fontSize: 18,
        textAlign: "center",
    },
    shutterContainer: {
        position: "absolute",
        bottom: 100,
        left: 0,
        right: 0,
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
        zIndex: 10,
    },
    shutterBtn: {
        width: 85,
        height: 85,
        left: width / 2,
        borderRadius: 45,
        borderWidth: 5,
        borderColor: "rgba(97, 218, 251, 1)",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "transparent",
        shadowColor: "#61dafb",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 30,
        elevation: 35,
        transform: [{ translateX: -40 }],
    },
    shutterBtnInner: {
        width: 50,
        height: 50,
        borderRadius: 30,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#fff",
        shadowColor: "#61dafb",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 10,
        elevation: 35,
    },
    toggleBtn: {
        position: "absolute",
        right: 35, // 오른쪽 여백
        alignSelf: "center", // 세로 가운데 맞추기
    },
    loadingOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        width: width,
        height: height,
        backgroundColor: "rgba(97, 218, 251, 1)",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 999,
    },
    loadingText: {
        marginTop: 10,
        color: "white",
        fontSize: 16,
    },
    bottomBar: {
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        width: "100%",
        paddingHorizontal: 40,
        paddingVertical: 10,
        backgroundColor: "transparent",
    },
    retake: {
        fontSize: 16,
        color: "#61dafb",
        fontWeight: "bold",
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#61dafb",
        textAlign: "center",
    },
    photoRegister: {
        fontSize: 16,
        color: "#fff",
        fontWeight: "bold",
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 10,
        backgroundColor: "#61dafb",
        textAlign: "center",
    },

});



