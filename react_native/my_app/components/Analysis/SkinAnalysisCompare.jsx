import React, { useState, useEffect } from "react";
import {
    ScrollView,
    View,
    Text,
    Image,
    StyleSheet,
    TouchableOpacity,
    Modal,
    Dimensions,
    ActivityIndicator,
} from "react-native";
import { Menu, Button, Provider } from "react-native-paper";
import { getDateList, getPhotoByDate, getAcneInfo } from "../../utils/api/fastapi";
import { BarChart } from "react-native-chart-kit";

export default function SkinCompareScreen({ route, onCompare }) {
    const { acneImageUri, selectedDate, acneCount, acneArea, rednessArea } = route.params || {};
    const [dates, setDates] = useState([]);
    const [selectedPreviousDate, setselectedPreviousDate] = useState(null);
    const [previousImageUri, setPreviousImageUri] = useState(null);
    const [menuVisible, setMenuVisible] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalUrl, setModalUrl] = useState(null);
    const [prevAcneCount, setPrevAcneCount] = useState(null);
    const [prevAcneArea, setPrevAcneArea] = useState(null);
    const [prevRednessArea, setPrevRednessArea] = useState(null);
    const [acneLoading, setAcneLoading] = useState(false);
    const [photoLoading, setPhotoLoading] = useState(false);

    useEffect(() => {
        async function fetchDates() {
            try {
                const res = await getDateList();
                if (res.data && Array.isArray(res.data.dates)) {
                    const filteredDates = res.data.dates.filter(
                        (date) => date !== selectedDate
                    );
                    setDates(filteredDates);
                } else {
                    setDates([]);
                }
            } catch (err) {
                setDates([]);
            }
        }
        fetchDates();
    }, [selectedDate]);

    const openMenu = () => setMenuVisible(true);
    const closeMenu = () => setMenuVisible(false);

    const onSelectDate = async (date) => {
        setselectedPreviousDate(date);
        closeMenu();
        setPreviousImageUri(null);
        setPrevAcneCount(null);
        setPrevAcneArea(null);

        setAcneLoading(true);
        setPhotoLoading(true);

        try {
            const response = await getAcneInfo(date);
            const data = response.data;
            setPrevAcneCount(data.acne_count);
            setPrevAcneArea(data.acne_area);
            setPrevRednessArea(data.redness_area);
        } catch (error) {
            console.error("데이터 불러오기 실패 (여드름):", error);
        } finally {
            setAcneLoading(false);
        }

        try {
            const imageRes = await getPhotoByDate(date);
            setPreviousImageUri(imageRes.data.analysis_photo_acne_url || null);
        } catch (error) {
            console.error("데이터 불러오기 실패 (이미지):", error);
        } finally {
            setPhotoLoading(false);
        }

        closeMenu();
    };

    const screenWidth = Dimensions.get("window").width;

    const chartConfigBlue = {
        backgroundGradientFrom: "#ffffff",
        backgroundGradientTo: "#e0f8ffff",
        color: (opacity = 1) => `rgba(0, 204, 255, ${opacity})`,
        labelColor: (opacity = 1) => `rgba(14, 104, 128, ${opacity})`,
        barPercentage: 1.8,
        propsForBackgroundLines: {
            strokeDasharray: "",
        },
    };

    const chartConfigRed = {
        backgroundGradientFrom: "#ffffffff",
        backgroundGradientTo: "rgba(230, 255, 248, 1)",
        color: (opacity = 1) => `rgba(0, 255, 106, ${opacity})`,
        labelColor: (opacity = 1) => `rgba(5, 128, 65, ${opacity})`,
        barPercentage: 1.8,
        propsForBackgroundLines: {
            strokeDasharray: "",
        },
    };

    const chartConfigGreen = {
        backgroundGradientFrom: "#ffffffff",
        backgroundGradientTo: "rgba(255, 222, 241, 1)",
        color: (opacity = 1) => `rgba(255, 39, 165, ${opacity})`,
        labelColor: (opacity = 1) => `rgba(128, 20, 82, ${opacity})`,
        barPercentage: 1.8,
        propsForBackgroundLines: {
            strokeDasharray: "",
        },
    };

    return (
        <Provider>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.container}>
                    {/* ✅ 비교 이미지 섹션 */}
                    <View style={styles.compareImageContainer}>
                        {/* ✅ 비교 사진 블록 */}
                        <View style={styles.compareImageColumn}>
                            {/* 비교 사진 텍스트 (사진 위쪽 바깥) */}
                            <Text style={styles.imageLabel}>비교 사진</Text>

                            <TouchableOpacity
                                onPress={() => {
                                    setModalVisible(true);
                                    setModalUrl(previousImageUri);
                                }}
                            >
                                {photoLoading ? (
                                    <ActivityIndicator
                                        size="large"
                                        color="#61dafb"
                                        style={styles.image}
                                    />
                                ) : (
                                    <Image
                                        source={{ uri: previousImageUri || "https://via.placeholder.com/600x750.png?text=Acne+View" }}
                                        style={styles.image}
                                        resizeMode="cover"
                                    />
                                )}
                            </TouchableOpacity>

                            {/* 날짜 버튼 */}
                            <Menu
                                visible={menuVisible}
                                onDismiss={closeMenu}
                                anchor={
                                    <Button
                                        mode="outlined"
                                        onPress={openMenu}
                                        style={{
                                            width: 150,
                                            height: 40,
                                            marginTop: 8,
                                            marginBottom: 8,
                                        }}
                                        contentStyle={{
                                            height: 36,            // 버튼 내부 컨텐츠 높이 맞추기
                                            justifyContent: "center", // 세로 가운데 정렬
                                        }}
                                        labelStyle={{
                                            fontSize: 13,
                                        }}
                                    >
                                        {selectedPreviousDate || "날짜를 선택하세요"}
                                    </Button>
                                }
                            >
                                {dates.length === 0 && (
                                    <Menu.Item
                                        title="날짜가 없습니다"
                                        disabled
                                    />
                                )}
                                {dates.map((date) => (
                                    <Menu.Item
                                        key={date}
                                        onPress={() => {
                                            onSelectDate(date);
                                        }}
                                        title={date}
                                    />
                                ))}
                            </Menu>
                        </View>

                        {/* ✅ 현재 사진 블록 */}
                        <View style={styles.compareImageColumn}>
                            {/* 현재 사진 텍스트 (사진 위쪽 바깥) */}
                            <Text style={styles.imageLabel}>현재 사진</Text>

                            <TouchableOpacity
                                onPress={() => {
                                    setModalVisible(true);
                                    setModalUrl(acneImageUri);
                                }}
                            >
                                <Image
                                    source={{ uri: acneImageUri || "https://via.placeholder.com/600x750.png?text=Acne+View" }}
                                    style={styles.image}
                                    resizeMode="cover"
                                />
                            </TouchableOpacity>

                            {/* 날짜 */}
                            <Text style={styles.dateText}>
                                {selectedDate || "선택된 날짜"}
                            </Text>
                        </View>

                        {/* 모달 */}
                        <Modal
                            visible={modalVisible}
                            transparent
                            animationType="fade"
                        >
                            <TouchableOpacity
                                style={styles.fullscreenContainer}
                                onPress={() => {
                                    setModalVisible(false);
                                    setModalUrl("");
                                }}
                                activeOpacity={1}
                            >
                                <Image
                                    source={{
                                        uri:
                                            modalUrl ||
                                            "https://cdn.builder.io/api/v1/image/assets/TEMP/1ef858b39367eae51ddccd974198c6bf36074bc3?placeholderIfAbsent=true",
                                    }}
                                    style={styles.fullscreenImage}
                                    resizeMode="contain"
                                />
                                <Text style={styles.closeText}>
                                    탭해서 닫기
                                </Text>
                            </TouchableOpacity>
                        </Modal>
                    </View>
                    {/* ✅ 여드름 개수 그래프 */}
                    <View
                        style={{
                            marginTop: 40,
                            width: "100%",
                            alignItems: "center",
                        }}
                    >
                        <Text style={styles.chartTitle}>여드름 개수 비교</Text>
                        {acneLoading ? (
                            <ActivityIndicator size="large" color="#61dafb" />
                        ) : (
                            <BarChart
                                data={{
                                    labels: [
                                        selectedPreviousDate || "이전",
                                        selectedDate || "선택",
                                    ],
                                    datasets: [
                                        {
                                            data: [
                                                prevAcneCount || 0,
                                                acneCount || 0,
                                            ],
                                        },
                                    ],
                                }}
                                width={screenWidth - 40}
                                height={160}
                                yAxisSuffix="개"
                                fromZero
                                chartConfig={chartConfigBlue}
                                style={styles.chart}
                                verticalLabelRotation={0}
                            />
                        )}
                    </View>

                    {/* ✅ 여드름 면적 그래프 */}
                    <View
                        style={{
                            marginTop: 40,
                            width: "100%",
                            alignItems: "center",
                        }}
                    >
                        <Text style={styles.chartTitle}>여드름 면적 비교</Text>
                        {acneLoading ? (
                            <ActivityIndicator size="large" color="#FF6347" />
                        ) : (
                            <BarChart
                                data={{
                                    labels: [
                                        selectedPreviousDate || "이전",
                                        selectedDate || "선택",
                                    ],
                                    datasets: [
                                        {
                                            data: [
                                                prevAcneArea || 0,
                                                acneArea || 0,
                                            ],
                                        },
                                    ],
                                }}
                                width={screenWidth - 40}
                                height={160}
                                yAxisSuffix="%"
                                fromZero
                                chartConfig={chartConfigGreen}
                                style={styles.chart}
                                verticalLabelRotation={0}
                            />
                        )}
                    </View>

                    {/* ✅ 홍조 면적 그래프 */}
                    <View
                        style={{
                            marginTop: 40,
                            width: "100%",
                            alignItems: "center",
                        }}
                    >
                        <Text style={styles.chartTitle}>홍조 면적 비교</Text>
                        {acneLoading ? (
                            <ActivityIndicator size="large" color="#FFD700" />
                        ) : (
                            <BarChart
                                data={{
                                    labels: [
                                        selectedPreviousDate || "이전",
                                        selectedDate || "선택",
                                    ],
                                    datasets: [
                                        {
                                            data: [
                                                prevRednessArea || 0,
                                                rednessArea || 0,
                                            ],
                                        },
                                    ],
                                }}
                                width={screenWidth - 40}
                                height={160}
                                yAxisSuffix="%"
                                fromZero
                                chartConfig={chartConfigRed}
                                style={styles.chart}
                                verticalLabelRotation={0}
                            />
                        )}
                    </View>
                </View>
            </ScrollView>
        </Provider>
    );
}

const styles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1,
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        paddingBottom: 40,
    },
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "flex-start",
        paddingVertical: 20,
        backgroundColor: "#FFFFFF",
        paddingTop: Dimensions.get("window").height * 0.05,
        paddingBottom: Dimensions.get("window").height * 0.1,
    },
    compareImageContainer: {
        flexDirection: "row",
        justifyContent: "space-between", // "space-around"를 "space-between"으로 변경
        width: "100%",
        backgroundColor: '#FFFFFF',
        padding: 15,
        paddingVertical: 10,
        shadowColor: "#61dafb",
        shadowOpacity: 0.3,
        shadowOffset: { height: 10 },
        shadowRadius: 5,
        elevation: 4,
    },
    compareImageColumn: {
        flex: 1,
        alignItems: "center",
        marginHorizontal: 5, // ✅ 간격 조정
    },
    image: {
        width: 150,
        height: 150,
        borderRadius: 12,
    },
    dateText: {
        marginTop: 8,
        fontSize: 14,
        color: "#5C6A7B",
    },
    fullscreenContainer: {
        flex: 1,
        backgroundColor: "rgba(97, 218, 251, 0.8)",
        justifyContent: "center",
        alignItems: "center",
    },
    fullscreenImage: {
        width: "90%",
        height: "90%",
    },
    closeText: {
        position: "absolute",
        bottom: 50,
        color: "white",
        fontSize: 16,
        fontWeight: "bold",
    },
    chartTitle: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 10,
        color: "#333",
    },
    chart: {
        borderRadius: 12,
    },
    localLoadingContainer: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(255, 255, 255, 0.7)",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: "#555",
    },
    imageLabel: {
        fontSize: 16,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 6, // 사진과 간격
        color: "#333",
    },

});

