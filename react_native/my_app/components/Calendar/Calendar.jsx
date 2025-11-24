import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
    Keyboard,
} from "react-native";
import { Calendar } from "react-native-calendars";
import { getDateList } from "../../utils/api/fastapi";
import SkinAnalysisChart from "../Analysis/SkinAnalysisChart";

export default function CalendarScreen({ onAnalyze, navigation }) {
    const [selectedDate, setSelectedDate] = useState(null);
    const [dates, setDates] = useState([]);
    const [showChart, setShowChart] = useState(false);

    useEffect(() => {
        async function fetchDates() {
            try {
                const res = await getDateList();
                if (res.data && Array.isArray(res.data.dates)) {
                    setDates(res.data.dates);
                } else {
                    setDates([]);
                }
            } catch (err) {
                setDates([]);
            }
        }
        fetchDates();
    }, []);

    const getMarkedDates = () => {
        const marked = {};
        dates.forEach((date) => {
            marked[date] = {
                marked: true,
                dots: [{ color: "red", selectedDotColor: "red" }],
            };
        });
        if (selectedDate) {
            if (!marked[selectedDate]) marked[selectedDate] = {};
            marked[selectedDate].selected = true;
            marked[selectedDate].selectedColor = "#61dafb";
        }
        return marked;
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <KeyboardAvoidingView style={{ flex: 1, backgroundColor: "#fff" }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
                <View style={styles.contentContainer}>
                    {showChart ? (
                        <SkinAnalysisChart showHeader={false} navigation={navigation} />
                    ) : (
                        <>
                            <View style={styles.calendarCard}>
                                <Calendar
                                    onDayPress={(day) => {
                                        setSelectedDate(day.dateString);
                                    }}
                                    markedDates={getMarkedDates()}
                                    markingType="multi-dot"
                                    style={styles.calendar}
                                    theme={{
                                        arrowColor: "#61dafb", // 화살표 색상 변경
                                    }}
                                />
                                <Text style={styles.selected_date}>{selectedDate}</Text>
                                <TouchableOpacity
                                    style={[styles.analyzeButton, (!selectedDate || !dates.includes(selectedDate)) && styles.analyzeButtonDisabled]}
                                    disabled={!selectedDate || !dates.includes(selectedDate)}
                                    onPress={() => selectedDate && dates.includes(selectedDate) && onAnalyze(selectedDate)}
                                >
                                    <Text style={styles.analyzeButtonText}>분석하기</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.banner}>
                                <Text style={styles.bannerText}>여드름 관리, 꾸준히 함께해요! 🌟</Text>
                            </View>
                        </>
                    )}
                </View>

                <View style={styles.tabContainer}>
                    <TouchableOpacity style={[styles.tabButton, !showChart && styles.activeTab]} onPress={() => setShowChart(false)}>
                        <Text style={styles.tabText}>📅 캘린더</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.tabButton, showChart && styles.activeTab]} onPress={() => setShowChart(true)}>
                        <Text style={styles.tabText}>📊 차트</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>

        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff", // 홈/로그인 화면과 통일
    },
    contentContainer: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 20,
    },
    calendarCard: {
        backgroundColor: "#fff",
        borderRadius: 15,
        padding: 10,
        marginBottom: 20,
        shadowColor: "#000",
        shadowOpacity: 0.25,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 2,
    },
    calendar: {
        borderRadius: 10,
        marginBottom: 12,
    },
    analyzeButton: {
        marginTop: 16,
        backgroundColor: "#61dafb",
        paddingVertical: 12,
        borderRadius: 25,
        alignItems: "center",
        justifyContent: "center",
    },
    analyzeButtonDisabled: {
        backgroundColor: "#ccc",
    },
    analyzeButtonText: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 16,
    },
    tabContainer: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: "row",
        justifyContent: "space-around",
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: "#eee",
        backgroundColor: "#fff",
    },
    tabButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 20,
        backgroundColor: "#f0f0f0",
    },
    activeTab: {
        backgroundColor: "#61dafb",
    },
    tabText: {
        color: "#333",
        fontWeight: "600",
    },
    banner: {
        alignItems: "center",
        paddingVertical: 10,
        backgroundColor: "#fff",
        borderRadius: 15,
        marginBottom: 20,
        shadowColor: "#000",
        shadowOpacity: 0.25,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 2,
    },
    bannerText: {
        fontSize: 14,
        color: "#888",
        fontWeight: "500",
    },
    selected_date: {
        fontSize: 20,
        color: "#61dafb",
        textAlign: "center",
        marginVertical: 10,
    },
});
