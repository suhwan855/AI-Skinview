import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import questionsData from "./questions.json";
import skinTypesData from "./skinTypes.json";
import MBSTStyles, { skinTypeColors } from "./MBSTStyles";
import { getSkinType } from "../../utils/api/fastapi";
import {
  useFonts,
  NotoSansKR_400Regular,
  NotoSansKR_700Bold,
} from "@expo-google-fonts/noto-sans-kr";

const defaultScoreMap = [1, 2, 3, 4, 2.5]; // 기본 점수
const customScoreMap = {
  29: [0, 5],
  30: [0, 2],
  41: [0, 5],
  62: [0, 5],
};

const chapterRanges = [
  { name: "Dry vs Oily", start: 0, end: 11 },
  { name: "Sensitive vs Resistant", start: 11, end: 31 },
  { name: "Pigmented", start: 31, end: 42 },
  { name: "Wrinkled", start: 42, end: 63 },
];

export default function SurveyForm({ onSurvey, navigation }) {
  const [fontsLoaded] = useFonts({
    NotoSansKR_400Regular,
    NotoSansKR_700Bold,
  });

  const [chapter, setChapter] = useState(0);
  const [answers, setAnswers] = useState(Array(questionsData.length).fill(null));
  const [showResult, setShowResult] = useState(false);
  const [chapterScores, setChapterScores] = useState([0, 0, 0, 0]);
  const [skinType, setSkinType] = useState(null);
  const [loading, setLoading] = useState(false);

  // db에서 타입 가져오기
  const fetchSkinType = async () => {
    try {
      const res = await getSkinType();
      if (typeof res.data.skin_type[0] === "string") {
        const db_skinType = res.data.skin_type[0];
        setSkinType(db_skinType);
        console.log("데이터", res.data.skin_type[0]);
      } else {
        console.warn("데이터 형식 오류:", res.data);
        setSkinType(null);
      }
    } catch (err) {
      console.error("결과 가져오기 실패:", err);
      setSkinType(null);
    }
  };

  const handleShowResult = async (scoresFromNext) => {
    try {
      setLoading(true);
      const q10Answer = answers[9];
      const skin_combination_type = q10Answer === 3 || q10Answer === 4;

      onSurvey({
        surveyScores: scoresFromNext,
        skin_combination_type,
      });

      await new Promise((resolve) => setTimeout(resolve, 1000));
      await fetchSkinType();
    } catch (err) {
      console.error("설문 저장 실패:", err);
    } finally {
      setShowResult(true);
      setLoading(false);
    }
  };

  const matchedSkinData = skinTypesData.find(
    (item) => item.skin_type === skinType
  );

  const scrollRef = useRef(null);
  const getChapterRange = () => chapterRanges[chapter];
  const { start, end } = getChapterRange();
  const visibleQuestions = questionsData.slice(start, end);
  const isCurrentPageComplete = !answers.slice(start, end).includes(null);

  const handleSelect = (qIndex, oIndex) => {
    const updated = [...answers];
    updated[qIndex] = oIndex;
    setAnswers(updated);
  };

  const handleNext = () => {
    scrollRef.current?.scrollTo({ y: 0, animated: true });

    if (chapter < chapterRanges.length - 1) {
      setChapter(chapter + 1);
    } else {
      const scores = [0, 0, 0, 0];

      answers.forEach((selectedIdx, idx) => {
        if (selectedIdx === null) return;

        const scoreArray = customScoreMap[idx] || defaultScoreMap;
        const score = scoreArray[selectedIdx] ?? 0;

        for (let i = 0; i < chapterRanges.length; i++) {
          const { start, end } = chapterRanges[i];
          if (idx >= start && idx < end) {
            scores[i] += score;
            break;
          }
        }
      });

      setChapterScores(scores);
      handleShowResult(scores);
    }
  };

  const currentColors = skinTypeColors[skinType] || {
    bgColor: "#fff",
    titleColor: "#000",
    indexColor: "#000",
    descColor: "#000",
  };

  if (loading) {
    return (
      <View style={MBSTStyles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={MBSTStyles.loadingText}>설문조사 계산 중...</Text>
      </View>
    );
  }

  if (showResult) {
    return (
      <ScrollView
        contentContainerStyle={[
          MBSTStyles.scrollContainer,
          { backgroundColor: currentColors.bgColor },
        ]}
        ref={scrollRef}
      >
        <View style={MBSTStyles.innerContainer}>
          <View style={MBSTStyles.resultContainer}></View>
          {showResult && skinType && matchedSkinData ? (
            <View style={MBSTStyles.resultContainer}>
              <View style={MBSTStyles.innerContainer}>
                <Text style={MBSTStyles.resultHeader}>당신의 피부타입은</Text>
                <Text
                  style={[
                    MBSTStyles.baumannType,
                    { color: currentColors.titleColor },
                  ]}
                >
                  {skinType}
                </Text>

                {matchedSkinData.characteristics && (
                  <View style={MBSTStyles.tagContainer}>
                    {matchedSkinData.characteristics.map((char, index) => (
                      <View key={index} style={MBSTStyles.hashtagBox}>
                        <Text style={MBSTStyles.hashtagText}>{char}</Text>
                      </View>
                    ))}
                  </View>
                )}

                <View style={[MBSTStyles.resultCard, { padding: 25 }]}>
                  {matchedSkinData.descriptions.map((text, index) => (
                    <View key={index} style={MBSTStyles.descriptionItem}>
                      <Text style={MBSTStyles.bulletPoint}>•</Text>
                      <Text style={MBSTStyles.descriptionText}>{text}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          ) : (
            <Text style={MBSTStyles.loadingText}>결과를 불러오는 중입니다...</Text>
          )}

          {/* ✅ 홈으로 이동 버튼 */}
          <TouchableOpacity
            style={MBSTStyles.homeButton}
            onPress={() => navigation.navigate("Main")}
          >
            <Text style={MBSTStyles.homeButtonText}>홈으로 돌아가기</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={MBSTStyles.scrollContainer} ref={scrollRef}>
      <Text style={MBSTStyles.chapterHeader}>
        챕터 {chapter + 1} ({end - start}문항)
      </Text>

      {visibleQuestions.map((item, index) => {
        const globalIndex = start + index;
        return (
          <View key={globalIndex} style={MBSTStyles.questionBlock}>
            {globalIndex === 43 && (
              <Text style={MBSTStyles.noticeText}>
                ※ 아래 44-49번의 질문 안내 ※ {"\n"}
                {"\n"}본인만이 아니라 다양한 인종과 비교하여 신중하게 작성해 주시기 바랍니다.
                {"\n"}
                {"\n"}잘 알지 못하는 가족 구성원은 가족분들께 문의하시거나 사진을 참고해 주세요.
              </Text>
            )}

            <Text style={MBSTStyles.questionText}>
              {globalIndex + 1}. {item.question}
            </Text>
            {item.options.map((option, oIndex) => (
              <TouchableOpacity
                key={oIndex}
                style={[
                  MBSTStyles.optionButton,
                  answers[globalIndex] === oIndex && MBSTStyles.selectedButton,
                ]}
                onPress={() => handleSelect(globalIndex, oIndex)}
              >
                <Text
                  style={[
                    MBSTStyles.optionText,
                    answers[globalIndex] === oIndex && MBSTStyles.selectedText,
                  ]}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        );
      })}

      <TouchableOpacity
        style={[
          MBSTStyles.nextButton,
          !isCurrentPageComplete && MBSTStyles.nextButtonDisabled,
        ]}
        onPress={handleNext}
        disabled={!isCurrentPageComplete}
      >
        <Text style={MBSTStyles.nextButtonText}>
          {chapter === chapterRanges.length - 1 ? "제출" : "다음"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
