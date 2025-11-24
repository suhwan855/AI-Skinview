// SkinAnalysisChart.js
import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    Dimensions,
    ActivityIndicator,
    ScrollView,
    StyleSheet,
} from "react-native";
import { getAcneDates } from "../../utils/api/fastapi";
import { LineChart } from "react-native-chart-kit";
import {
    GestureHandlerRootView,
    ScrollView as GestureScrollView,
} from "react-native-gesture-handler";

export default function SkinAnalysisChart() {
    const [dates, setDates] = useState([]);
    const [acneCounts, setAcneCounts] = useState([]);
    const [acneAreas, setAcneAreas] = useState([]);
    const [rednessAreas, setRednessAreas] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchAcneData() {
            try {
                const res = await getAcneDates();

                const rawData = Array.isArray(res.data?.data)
                    ? res.data.data
                    : [];

                rawData.sort(
                    (a, b) => new Date(a.acne_date) - new Date(b.acne_date)
                );

                const dates = rawData.map((item) => item.acne_date);
                const counts = rawData.map((item) => item.acne_count);
                const areas = rawData.map((item) => item.acne_area);
                const redness = rawData.map((item) => item.redness_area);

                setDates(dates);
                setAcneCounts(counts);
                setAcneAreas(areas);
                setRednessAreas(redness);
            } catch (err) {
                console.error("여드름 데이터 가져오기 실패", err);
            } finally {
                setLoading(false);
            }
        }

        fetchAcneData();
    }, []);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#61dafb" />
                <Text style={styles.loadingText}>피부 데이터 로딩 중...</Text>
            </View>
        );
    }

    const sliceDates = dates.map((d) => d.slice(5)); // 'MM-DD'
    const screenWidth = Dimensions.get("window").width;

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <View style={styles.container}>
                <GestureScrollView
                    contentContainerStyle={styles.scrollContent}
                    nestedScrollEnabled
                >
                    <Text style={styles.title}>
                        전체 여드름 차트 (개수 & 면적)
                    </Text>

                    <Text style={[styles.chartLabel, { marginTop: 0 }]}>
                        📌 여드름 개수
                    </Text>
                    <GestureScrollView
                        horizontal
                        nestedScrollEnabled
                        directionalLockEnabled
                        showsHorizontalScrollIndicator={false}
                    >
                        <LineChart
                            data={{
                                labels: sliceDates || [],
                                datasets: [
                                    {
                                        data: acneCounts?.length ? acneCounts : [0],
                                    },
                                ],
                            }}
                            // ✅ width를 화면 너비에 맞추고, 데이터가 많을 경우 최소 너비 보장
                            width={Math.max(screenWidth, (sliceDates?.length || 1) * 60)}
                            height={220}
                            fromZero
                            chartConfig={{
                                backgroundGradientFrom: "#ffffffff",
                                backgroundGradientTo: "#e0f8ffff",
                                color: (opacity = 1) => `rgba(0, 204, 255, ${opacity})`,
                                labelColor: (opacity = 1) => `rgba(14, 104, 128, ${opacity})`,
                                propsForBackgroundLines: {
                                    stroke: "#ccc",
                                },
                            }}
                            renderDotContent={({ x, y, index, indexData }) => (
                                <Text
                                    key={index}
                                    style={{
                                        position: "absolute",
                                        left: x + 5,
                                        top: y,
                                        fontSize: 12,
                                        color: "rgba(14, 104, 128, 1)",
                                    }}
                                >
                                    {indexData}
                                </Text>
                            )}
                            style={styles.chart}
                        />
                    </GestureScrollView>

                    <Text style={styles.chartLabel}>📏 여드름 비율 (%)</Text>
                    <GestureScrollView
                        horizontal
                        nestedScrollEnabled
                        directionalLockEnabled
                        showsHorizontalScrollIndicator={false}
                    >
                        <LineChart
                            data={{
                                labels: sliceDates || [],
                                datasets: [
                                    {
                                        data: acneAreas?.length ? acneAreas : [0],
                                    },
                                ],
                            }}
                            // ✅ width를 화면 너비에 맞추고, 데이터가 많을 경우 최소 너비 보장
                            width={Math.max(screenWidth, (sliceDates?.length || 1) * 60)}
                            height={220}
                            fromZero
                            chartConfig={{
                                backgroundGradientFrom: "#ffffffff",
                                backgroundGradientTo: "rgba(230, 255, 248, 1)",
                                color: (opacity = 1) => `rgba(0, 255, 106, ${opacity})`,
                                labelColor: (opacity = 1) => `rgba(5, 128, 65, ${opacity})`,
                                propsForBackgroundLines: {
                                    stroke: "#ccc",
                                },
                                propsForDots: {
                                    r: "4",
                                },
                            }}
                            renderDotContent={({ x, y, index, indexData }) => (
                                <Text
                                    key={index}
                                    style={{
                                        position: "absolute",
                                        left: x + 5,
                                        top: y,
                                        fontSize: 12,
                                        color: "rgba(5, 128, 65, 1)",
                                    }}
                                >
                                    {indexData}%
                                </Text>
                            )}
                            style={styles.chart}
                        />
                    </GestureScrollView>

                    <Text style={styles.chartLabel}>📏 홍조 비율 (%)</Text>
                    <GestureScrollView
                        horizontal
                        nestedScrollEnabled
                        directionalLockEnabled
                        showsHorizontalScrollIndicator={false}
                    >
                        <LineChart
                            data={{
                                labels: sliceDates || [],
                                datasets: [
                                    {
                                        data: rednessAreas?.length ? rednessAreas : [0],
                                    },
                                ],
                            }}
                            // ✅ width를 화면 너비에 맞추고, 데이터가 많을 경우 최소 너비 보장
                            width={Math.max(screenWidth, (sliceDates?.length || 1) * 60)}
                            height={220}
                            fromZero
                            chartConfig={{
                                backgroundGradientFrom: "#ffffffff",
                                backgroundGradientTo: "rgba(255, 222, 241, 1)",
                                color: (opacity = 1) => `rgba(255, 39, 165, ${opacity})`,
                                labelColor: (opacity = 1) => `rgba(128, 20, 82, ${opacity})`,
                                propsForBackgroundLines: {
                                    stroke: "#ccc",
                                },
                                propsForDots: {
                                    r: "4",
                                },
                            }}
                            renderDotContent={({ x, y, index, indexData }) => (
                                <Text
                                    key={index}
                                    style={{
                                        position: "absolute",
                                        left: x + 5,
                                        top: y,
                                        fontSize: 12,
                                        color: "rgba(128, 20, 82, 1)",
                                    }}
                                >
                                    {indexData}%
                                </Text>
                            )}
                            style={styles.chart}
                        />
                    </GestureScrollView>
                </GestureScrollView>
            </View>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        paddingBottom: 80,
    },
    scrollContent: {
        paddingBottom: 50,
        paddingHorizontal: 0, // ✅ 여백 제거
        paddingTop: 30,
    },
    scrollContainer: {
        paddingBottom: 50,
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 20,
        paddingHorizontal: 20, // ✅ 타이틀은 여백 유지
    },
    chartLabel: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 10,
        marginTop: 20,
        paddingHorizontal: 20, // ✅ 라벨은 여백 유지
    },
    chart: {
        // borderRadius: 12,
        marginBottom: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: "#333",
    },
});