import React, { useState, useEffect } from "react";
import {
    View,
    StyleSheet,
    Image,
    Text,
    TouchableOpacity,
    Modal,
    ActivityIndicator,
    ScrollView,
    Dimensions,
} from "react-native";
import { getAcneInfo } from "../../utils/api/fastapi";

const SkinAnalysisScreen = ({ route, navigation }) => {
    const { selectedDate, acneImageUri, rednessImageUri } = route.params || {};
    const [modalVisible, setModalVisible] = useState(false);
    const [selected, setSelected] = useState("acne");

    const [acneCount, setAcneCount] = useState(0);
    const [acneArea, setAcneArea] = useState(0);
    const [rednessArea, setRednessArea] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentImage, setCurrentImage] = useState(acneImageUri || null);

    const showAcne = () => { setCurrentImage(acneImageUri || null); setSelected("acne"); };
    const showRedness = () => { setCurrentImage(rednessImageUri || null); setSelected("redness"); };

    const options = [
        { key: "acne", label: "여드름", action: showAcne },
        { key: "redness", label: "홍조", action: showRedness },
    ];

    useEffect(() => {
        const fetchAcneData = async () => {
            if (!selectedDate) { setLoading(false); return; }
            setLoading(true);
            try {
                const response = await getAcneInfo(selectedDate);
                const data = response.data;
                setAcneCount(data.acne_count);
                setAcneArea(data.acne_area);
                setRednessArea(data.redness_area);
            } catch (error) {
                console.error("여드름 데이터 불러오기 실패:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAcneData();
    }, [selectedDate]);

    const handleCompare = () => {
        if (navigation) {
            navigation.navigate("SkinCompare", {
                selectedDate,
                acneImageUri,
                acneCount,
                acneArea,
                rednessArea,
            });
        }
    };

    const getAcneMessage = () => {
        if (acneCount === 0) return "피부가 깨끗해요! 지금처럼 관리 잘 하시면 좋겠어요 😊";
        if (acneCount <= 5) return "여드름이 조금 보이네요. 스트레스나 수면 관리가 도움 될 수 있어요!";
        if (acneCount <= 15) return "여드름이 다소 있으신 편이에요. 세안과 보습을 조금 더 신경 써보세요!";
        return "여드름이 많이 보이네요. 피부과 진료나 전문 케어를 추천드려요!";
    };

    return (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.container}>
                {/* 사진 컨테이너 */}
                <View style={styles.imageContainer}>
                    <TouchableOpacity onPress={() => setModalVisible(true)}>
                        <Image
                            source={{ uri: currentImage || "https://via.placeholder.com/600x750.png?text=Acne+View" }}
                            style={styles.image}
                            resizeMode="cover" // 변경: contain -> cover
                        />
                    </TouchableOpacity>
                    {/* 제목/날짜 */}
                    <View style={styles.imageTextWrapper}>
                        <Text style={styles.titleText}>Skin View</Text>
                        <Text style={styles.dateText}>{selectedDate || "날짜를 선택해주세요"}</Text>
                    </View>
                </View>

                {/* 여드름 / 홍조 선택 */}
                <View style={styles.rContainer}>
                    {options.map((opt) => {
                        const disabled = opt.key === "redness" && (rednessArea === 0 || rednessArea === null);
                        return (
                            <TouchableOpacity
                                key={opt.key}
                                style={styles.radioContainer}
                                disabled={disabled}
                                onPress={opt.action}
                            >
                                <View
                                    style={[
                                        styles.radioOuter,
                                        selected === opt.key && styles.radioOuterSelected,
                                        disabled && styles.radioOuterDisabled,
                                    ]}
                                >
                                    {selected === opt.key && <View style={styles.radioInner} />}
                                </View>
                                <Text
                                    style={[
                                        styles.radioLabel,
                                        selected === opt.key && styles.radioLabelSelected,
                                        disabled && styles.disabledText,
                                    ]}
                                >
                                    {opt.label}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* 비교 버튼 */}
                <TouchableOpacity style={styles.compareButton} onPress={handleCompare}>
                    <Text style={styles.compareButtonText}>비교하기</Text>
                </TouchableOpacity>

                {/* 분석 박스 */}
                <View style={styles.bottomSection}>
                    <View style={styles.analysisBox}>
                        {loading ? (
                            <>
                                <ActivityIndicator size="large" color="#61dafb" />
                                <Text style={[styles.analysisText, { marginTop: 16 }]}>데이터 불러오는 중...</Text>
                            </>
                        ) : (
                            <Text style={styles.analysisText}>
                                사진에 대해 살펴보니{"\n"}
                                여드름이 약 <Text style={styles.highlight}>{acneArea}%</Text> 정도 있으신 것 같아요{"\n"}
                                총 <Text style={styles.highlight}>{acneCount}</Text> 개의 여드름이 탐지되었습니다.{"\n"}
                                홍조 면적은 약 <Text style={styles.highlight}>{rednessArea}%</Text> 입니다.{"\n"}
                                {getAcneMessage()}{"\n\n"}
                                궁금하신 게 있다면 <Text style={styles.highlight}>뷰티봇</Text>에게 물어보세요!
                            </Text>
                        )}
                    </View>
                </View>

                {/* 이미지 모달 */}
                <Modal visible={modalVisible} transparent animationType="fade">
                    <TouchableOpacity style={styles.fullscreenContainer} onPress={() => setModalVisible(false)} activeOpacity={1}>
                        <Image
                            source={{ uri: currentImage || "https://via.placeholder.com/600x750.png?text=Acne+View" }}
                            style={{ width: "90%", height: "90%" }}
                            resizeMode="contain"
                        />
                        <Text style={styles.closeText}>탭해서 닫기</Text>
                    </TouchableOpacity>
                </Modal>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1,
        alignItems: "center",
        backgroundColor: "#F0F4F7",
        paddingBottom: 40
    },
    container: {
        width: "100%",
        paddingTop: 30,
        alignItems: "center"
    },
    // 사진 컨테이너 (위치 변경)
    imageContainer: {
        width: Dimensions.get("window").width * 0.9,
        height: Dimensions.get("window").width * 0.9 * (750 / 600),
        borderRadius: 20,
        position: 'relative', // 자식 요소 위치를 위해 추가
        overflow: 'hidden', // 컨테이너 밖으로 나가는 이미지 부분 잘라내기
    },
    image: {
        width: '100%',
        height: '100%',
        borderRadius: 20,
    },
    // 제목/날짜 (사진 위에 띄우기)
    imageTextWrapper: {
        position: 'absolute',
        top: 20,
        left: 20,
        right: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    titleText: {
        fontSize: 24,
        fontWeight: "700",
        color: "#fff",
    },
    dateText: {
        fontSize: 15,
        color: "#fff",
    },
    // 여드름/홍조 라디오
    rContainer: {
        marginTop: 35,
        flexDirection: "row",
        gap: 30,
        marginVertical: 12
    },
    radioContainer: {
        flexDirection: "row",
        alignItems: "center"
    },
    radioOuter: {
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 2,
        borderColor: "#BDC3C7",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 10
    },
    radioOuterSelected: {
        borderColor: "#61dafb"
    },
    radioOuterDisabled: {
        borderColor: "#BDC3C7",
        backgroundColor: "#EBEFF2"
    },
    radioInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: "#61dafb"
    },
    radioLabel: {
        fontSize: 16,
        color: "#5C6A7B"
    },
    radioLabelSelected: {
        fontWeight: "600",
        color: "#61dafb"
    },
    disabledText: {
        color: "#BDC3C7"
    },
    // 비교 버튼
    compareButton: {
        marginTop: 30,
        backgroundColor: "#61dafb",
        paddingVertical: 18,
        paddingHorizontal: 40,
        borderRadius: 30,
        shadowColor: "#61dafb",
        shadowOpacity: 0.5,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 6 },
        elevation: 6,
    },
    compareButtonText: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 17
    },
    // 분석 박스
    bottomSection: {
        marginTop: 30,
        width: "90%",
        alignItems: "center",
        paddingBottom: 20
    },
    analysisBox: {
        width: "100%",
        backgroundColor: "#fff",
        borderRadius: 20,
        paddingVertical: 35,
        paddingHorizontal: 25,
        borderWidth: 1,
        borderColor: "#E0E5EC",
        shadowColor: "#A7C0DA",
        shadowOpacity: 0.2,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 5 },
        elevation: 5,
        alignItems: "center",
    },
    analysisText: {
        fontSize: 16,
        lineHeight: 26,
        textAlign: "center",
        color: "#34495E",
        fontWeight: "500",
    },
    highlight: {
        fontWeight: "bold",
        color: "red",
        fontSize: 18
    },
    // 모달
    fullscreenContainer: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.8)",
        justifyContent: "center",
        alignItems: "center"
    },
    closeText: {
        position: "absolute",
        bottom: 50,
        color: "white",
        fontSize: 16,
        fontWeight: "bold"
    },
});

export default SkinAnalysisScreen;