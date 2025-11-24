// src/member/functions/MyRoutineLogFunctions.js
import React from "react";
import { Text } from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const CACHE_KEY = "@myRoutineLog_";

// ✅ forceRefresh 인자를 추가합니다. 기본값은 false
export async function fetchMyRoutineLog(user_key, forceRefresh = false) {
    const cacheKey = `${CACHE_KEY}${user_key}`;
    try {
        // ✅ forceRefresh가 true면 캐시를 무시하고 바로 서버 호출
        if (!forceRefresh) {
            const cachedData = await AsyncStorage.getItem(cacheKey);
            if (cachedData) {
                console.log("✅ 캐시된 루틴 데이터 사용");
                return JSON.parse(cachedData);
            }
        }

        console.log("🌐 루틴 데이터 API 호출");
        const response = await axios.post(
            "http://20.81.185.103:8000/routine/get/",
            { user_key: user_key }
        );
        const routines = response.data.routines;

        await AsyncStorage.setItem(cacheKey, JSON.stringify(routines));
        console.log("✅ 루틴 데이터 캐시 완료");
        return routines;
    } catch (error) {
        console.error("루틴 불러오기 실패:", error);
        throw error;
    }
}

// 이 함수가 핵심입니다. 피부 고민별로 그룹화하고, 각 그룹의 루틴들을 날짜 내림차순으로 정렬합니다.
export function processRoutineData(rawData) {
    // 1. 피부 고민(preset_concerns)별로 루틴을 그룹화합니다.
    const grouped = rawData.reduce((acc, item) => {
        const concern = item.preset_concerns;
        if (!acc[concern]) acc[concern] = [];
        acc[concern].push(item);
        return acc;
    }, {});

    // 2. 각 그룹을 섹션 배열로 변환합니다.
    const sections = Object.entries(grouped).map(([concern, items]) => ({
        title: concern, // 섹션 타이틀은 피부 고민으로 설정
        data: items,
    }));
    
    // 3. 섹션(피부 고민)을 최신 루틴의 날짜를 기준으로 정렬합니다.
    sections.sort((a, b) => {
        // 각 섹션의 가장 최신 루틴 날짜를 찾습니다.
        const latestDateA = a.data.reduce((maxDate, item) => {
            const itemDate = new Date(item.preset_date);
            return maxDate > itemDate ? maxDate : itemDate;
        }, new Date(0));

        const latestDateB = b.data.reduce((maxDate, item) => {
            const itemDate = new Date(item.preset_date);
            return maxDate > itemDate ? maxDate : itemDate;
        }, new Date(0));

        // 최신 날짜를 기준으로 내림차순 정렬 (최신 순)
        return latestDateB - latestDateA;
    });

    return sections;
}

// ### 기준으로 나누고, 첫번째는 타이틀, 나머지는 내용
export function parseUsageGuide(text) {
    if (!text) return [];
    const sections = text
        .split("###")
        .filter(Boolean)
        .map((section) => section.trim());
    return sections.map((section) => {
        const lines = section.split("\n").filter((line) => line.trim() !== "");
        return {
            title: lines[0] || "",
            content: lines.slice(1).join("\n") || "",
        };
    });
}

// **성분명** 부분을 찾아서 강조 텍스트로 분리해 리턴하는 함수
export function renderContentWithHighlight(
    text,
    baseStyle = {},
    highlightStyle = {}
) {
    if (!text) return null;
    const lines = text.split("\n");

    return lines.map((line, lineIndex) => {
        const parts = line.split(/(\*\*.*?\*\*)/g).filter(Boolean);
        return (
            <Text key={lineIndex}>
                {parts.map((part, partIndex) => {
                    const isHighlight = part.startsWith("**") && part.endsWith("**");
                    const content = isHighlight
                        ? part.substring(2, part.length - 2)
                        : part;

                    return (
                        <Text
                            key={partIndex}
                            style={
                                isHighlight
                                    ? [baseStyle, highlightStyle]
                                    : baseStyle
                            }
                        >
                            {content}
                        </Text>
                    );
                })}
                {lineIndex < lines.length - 1 && <Text>{"\n"}</Text>}
            </Text>
        );
    });
}
export async function deleteRoutine(routineId, user_key) {
    console.log(`Deleting routine with ID: ${routineId} for user: ${user_key}`);
    if (!routineId || isNaN(Number(routineId))) {
        const error = new Error("Invalid routineId provided.");
        console.error("❌ 잘못된 routineId 전달:", routineId);
        throw error;
    }
    try {
        const response = await axios.post(
            "http://20.81.185.103:8000/routine/delete/",
            {
                preset_id: Number(routineId),
                user_key: user_key,
            }
        );
        console.log("✅ Deletion successful:", response.data);
        return response.data;
    } catch (error) {
        if (error.response) {
            const status = error.response.status;
            const message =
                error.response.data.message || "서버 오류가 발생했습니다.";
            console.error("루틴 삭제 실패 - 서버 응답:", status, message);
            throw new Error(`삭제 실패: ${message} (상태 코드: ${status})`);
        } else if (error.request) {
            console.error("루틴 삭제 실패 - 응답 없음:", error.request);
            throw new Error(
                "서버에 연결할 수 없습니다. 네트워크 상태를 확인해 주세요."
            );
        } else {
            console.error("루틴 삭제 실패 - 요청 오류:", error.message);
            throw new Error("요청 중 알 수 없는 오류가 발생했습니다.");
        }
    }
}