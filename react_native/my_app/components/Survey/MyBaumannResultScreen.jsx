// src/survey/MyBaumannResultScreen.js
import React from "react";
import { View, Text, ScrollView } from "react-native";
import baumannDescriptions from "../../components/Description/baumannDescriptions.json";
import CombinationSkinInfo from "../../components/Description/CombinationSkinInfo.jsx";
import { MBSTStyles, skinTypeColors } from "../../Styles/MBSTStyles.js";
import Header from "../../Styles/header";

// --- Baumann 타입 데이터 및 헬퍼 함수 시작 ---

// Baumann 타입의 4가지 파트에 대한 전체 레이블 및 각 끝점 레이블
const partLabelsFull = {
	survey_skin_do: { full: "유수분 밸런스", left: "D", right: "O" },
	survey_skin_sr: { full: "피부 민감도", left: "R", right: "S" },
	survey_skin_pn: { full: "멜라닌 색소 활성도", left: "N", right: "P" },
	survey_skin_wt: { full: "피부 탄력도 및 주름", left: "T", right: "W" },
};

// 각 파트별 점수 범위를 정의하는 객체
const scoreRanges = {
	survey_skin_do: { min: 11, max: 44 },
	survey_skin_sr: { min: 18, max: 72 },
	survey_skin_pn: { min: 10, max: 45 },
	survey_skin_wt: { min: 20, max: 85 },
};

// 각 파트별 점수를 백분율로 변환하는 함수
const calculatePercentage = (key, score) => {
	const range = scoreRanges[key];
	if (!range) return 0;

	let percentage = 0;

	switch (key) {
		case "survey_skin_do":
			// D/O 파트: 점수가 낮을수록 D, 높을수록 O
			// 이 함수는 오른쪽(O)의 퍼센트를 반환합니다.
			if (score <= 16) {
				// D, 매우 건조
				percentage = 0 + ((score - 11) / (16 - 11)) * 25;
			} else if (score <= 26) {
				// D, 약간 건조
				percentage = 25 + ((score - 17) / (26 - 17)) * 25;
			} else if (score <= 33) {
				// O, 약간 유분
				percentage = 50 + ((score - 27) / (33 - 27)) * 25;
			} else {
				// O, 매우 유분
				percentage = 75 + ((score - 34) / (44 - 34)) * 25;
			}
			break;

		case "survey_skin_sr":
			// S/R 파트: 점수가 낮을수록 R, 높을수록 S
			// 이 함수는 오른쪽(S)의 퍼센트를 반환합니다.
			if (score <= 24) {
				// R, 매우 저항
				percentage = 0 + ((score - 18) / (24 - 18)) * 25;
			} else if (score <= 29) {
				// R, 어느 정도 저항
				percentage = 25 + ((score - 25) / (29 - 25)) * 25;
			} else if (score <= 33) {
				// S, 다소 민감
				percentage = 50 + ((score - 30) / (33 - 30)) * 25;
			} else {
				// S, 매우 민감
				percentage = 75 + ((score - 34) / (72 - 34)) * 25;
			}
			break;

		case "survey_skin_pn":
			// P/N 파트: 점수가 낮을수록 N, 높을수록 P
			// 이 함수는 오른쪽(P)의 퍼센트를 반환합니다.
			const pnMidpoint = 30.5;
			if (score <= pnMidpoint) {
				// N 타입
				percentage = 0 + ((score - 10) / (pnMidpoint - 10)) * 50;
			} else {
				// P 타입
				percentage =
					50 + ((score - pnMidpoint) / (45 - pnMidpoint)) * 50;
			}
			break;

		case "survey_skin_wt":
			// W/T 파트: 점수가 낮을수록 T, 높을수록 W
			// 이 함수는 오른쪽(W)의 퍼센트를 반환합니다.
			const wtMidpoint = 40.5;
			if (score <= wtMidpoint) {
				const rangeSpan = wtMidpoint - 20;
				const normalizedScore = score - 20;
				percentage = (normalizedScore / rangeSpan) * 50;
			} else {
				const rangeSpan = 85 - wtMidpoint;
				const normalizedScore = score - wtMidpoint;
				percentage = 50 + (normalizedScore / rangeSpan) * 50;
			}
			break;

		default:
			// 그 외 기본 계산 로직
			const normalizedScore = score - range.min;
			const normalizedMax = range.max - range.min;
			if (normalizedScore <= 0) return 0;
			if (normalizedScore >= normalizedMax) return 100;
			percentage = (normalizedScore / normalizedMax) * 100;
			break;
	}

	return Math.round(percentage);
};

// 각 바의 양쪽 색상을 정의하는 객체
const dualBarColors = {
  survey_skin_do: {
    left: "#4A90E2",
    right: "#F5A623",
  },
  survey_skin_sr: {
    left: "#7ED6A4",
    right: "#FF6B6B",
  },
  survey_skin_pn: {
    left: "#A0A0A0",
    right: "#8B5E3C",
  },
  survey_skin_wt: {
    left: "#76C1FA",
    right: "#B491F2",
  },
};

// --- Baumann 타입 데이터 및 헬퍼 함수 끝 ---
const renderDualBar = (key, score, userBaumannType) => {
	if (typeof score !== "number" || isNaN(score)) {
		console.error(
			`ERROR: '${key}'의 점수(score: ${score})가 유효하지 않습니다. 해당 바를 렌더링하지 않습니다.`
		);
		return null;
	}
	const range = scoreRanges[key];
	if (!range) return null;

	const {
		full: label,
		left: leftLabel,
		right: rightLabel,
	} = partLabelsFull[key];
	const { left: leftColor, right: rightColor } = dualBarColors[key];

	const partIndex = Object.keys(partLabelsFull).indexOf(key);
	if (!userBaumannType || userBaumannType.length < partIndex + 1) {
		console.error(
			`ERROR: userBaumannType '${userBaumannType}'이 유효하지 않습니다.`
		);
		return null;
	}
	const userChar = userBaumannType.charAt(partIndex);

	const rightSidePercentage = calculatePercentage(key, score);
	const leftSidePercentage = 100 - rightSidePercentage;

	let barColor = "";
	let barPositionStyle = {};
	let barWidth = "0%";

	if (userChar === leftLabel) {
		barColor = leftColor;
		barPositionStyle = { left: 0 };
		barWidth = `${leftSidePercentage}%`;
	} else {
		barColor = rightColor;
		barPositionStyle = { right: 0 };
		barWidth = `${rightSidePercentage}%`;
	}

	// 한 줄에 레이블 + 퍼센트 같이 출력 (예: D 40% - O 60%)
	return (
		<View key={key} style={MBSTStyles.dualBarSection}>
			<Text style={MBSTStyles.dualBarLabel}>{label}</Text>

			{/* 퍼센트 + 막대기 한 줄 */}
			<View style={MBSTStyles.barWithPercentRow}>
				<Text style={MBSTStyles.percentLabel}>
					{leftSidePercentage}%
				</Text>

				<View style={MBSTStyles.dualBarContainer}>
					<View style={MBSTStyles.barWrapper}>
						<View
							style={[
								MBSTStyles.dominantBar,
								{
									width: barWidth,
									backgroundColor: barColor,
									...barPositionStyle,
									position: "absolute",
								},
							]}
						/>
					</View>
				</View>

				<Text style={MBSTStyles.percentLabel}>
					{rightSidePercentage}%
				</Text>
			</View>

			{/* 양쪽 알파벳 */}
			<View style={MBSTStyles.letterRow}>
				<Text style={MBSTStyles.alphabetLabel}>{leftLabel}</Text>
				<Text style={MBSTStyles.alphabetLabel}>{rightLabel}</Text>
			</View>
		</View>
	);
};

// MyBaumannResultScreen 메인 컴포넌트
const MyBaumannResultScreen = ({ route, navigation }) => {
	const { surveyData } = route.params || {};

	if (!surveyData || !surveyData.survey_skin_type) {
		return (
			<View style={MBSTStyles.centered}>
				<Text style={MBSTStyles.noDataText}>
					설문조사 결과가 없습니다.
				</Text>
			</View>
		);
	}

	const userBaumannType = surveyData.survey_skin_type;
	const userDescription = baumannDescriptions[userBaumannType] || {};
	const currentColors = skinTypeColors[userBaumannType] || {
		bgColor: "#fff",
		titleColor: "#000",
		indexColor: "#000",
		descColor: "#000",
	};

	return (
		<>
			<Header
				title="설문조사 결과"
				onBackPress={() => navigation.goBack()}
			/>
			<ScrollView style={MBSTStyles.container}>
				<Text style={MBSTStyles.title}>Baumann 피부타입 분석 결과</Text>

				<View
					style={[
						MBSTStyles.resultBox,
						{ backgroundColor: currentColors.bgColor },
					]}
				>
					<Text
						style={[
							MBSTStyles.baumannTypeLabel,
							{ color: currentColors.indexColor },
						]}
					>
						당신의 피부타입은
					</Text>
					<Text
						style={[
							MBSTStyles.baumannType,
							{ color: currentColors.titleColor },
						]}
					>
						{userBaumannType}
					</Text>
					<Text
						style={[
							MBSTStyles.baumannTypeLabel,
							{ color: currentColors.indexColor },
						]}
					>
						입니다
					</Text>
				</View>
				<View style={MBSTStyles.divider} />

				<View style={MBSTStyles.partsSection}>
					{Object.keys(partLabelsFull).map((key) =>
						renderDualBar(key, surveyData[key], userBaumannType)
					)}
				</View>

				{/* survey_skin_combination_type 있을 때만 복합성 피부 설명 보여주기 */}
				{surveyData.survey_skin_combination_type && (
					<CombinationSkinInfo />
				)}

				<View style={MBSTStyles.divider} />
				<View style={MBSTStyles.descriptionBox}>
					<Text style={MBSTStyles.descriptionTitle}>
						{userDescription.title}
					</Text>
					<View style={MBSTStyles.divider} />

					<Text style={MBSTStyles.descriptionText}>
						{userDescription.description}
					</Text>
					<View style={MBSTStyles.divider} />

					<View style={MBSTStyles.sectionBox}>
						<Text style={MBSTStyles.sectionTitle}>장점</Text>
						<Text style={MBSTStyles.sectionText}>
							{userDescription.pros}
						</Text>
					</View>

					<View style={MBSTStyles.sectionBox}>
						<Text style={MBSTStyles.sectionTitle}>단점</Text>
						<Text style={MBSTStyles.sectionText}>
							{userDescription.cons}
						</Text>
					</View>
					<View style={MBSTStyles.divider} />

					<View style={MBSTStyles.sectionBox}>
						<Text style={MBSTStyles.sectionTitle}>추천 성분</Text>
						<Text style={MBSTStyles.sectionText}>
							{
								userDescription?.recommended_ingredients
									?.description
							}
						</Text>
						{userDescription?.recommended_ingredients?.list?.map(
							(item, index) => (
								<Text key={index} style={MBSTStyles.bulletText}>
									• {item}
								</Text>
							)
						)}
					</View>
					<View style={MBSTStyles.sectionBox}>
						<Text style={MBSTStyles.sectionTitle}>
							피해야 할 성분
						</Text>
						<Text style={MBSTStyles.sectionText}>
							{userDescription?.ingredients_to_avoid?.description}
						</Text>
						{userDescription?.ingredients_to_avoid?.list?.map(
							(item, index) => (
								<Text key={index} style={MBSTStyles.bulletText}>
									• {item}
								</Text>
							)
						)}
					</View>

					<View style={MBSTStyles.divider} />
					<View style={MBSTStyles.sectionBox}>
						<Text style={MBSTStyles.sectionTitle}>
							어떤 유형의 제품을 사용하면 좋을까요?
						</Text>

						{userDescription?.product_recommendations?.products?.map(
							(item, index) => (
								<View key={index} style={MBSTStyles.subSection}>
									<Text style={MBSTStyles.subTitle}>
										• {item.name}
									</Text>
									<Text style={MBSTStyles.sectionText}>
										{item.desc}
									</Text>
								</View>
							)
						)}
					</View>

					<View style={MBSTStyles.sectionBox}>
						<Text style={MBSTStyles.sectionTitle}>
							어떤 유형의 제품을 피하는 것이 좋을까요?
						</Text>

						{userDescription?.products_to_avoid?.items?.map(
							(item, index) => (
								<Text
									key={index}
									style={MBSTStyles.sectionText}
								>
									• {item.name}: {item.desc}
								</Text>
							)
						)}
					</View>

					<View style={MBSTStyles.sectionBox}>
						<Text style={MBSTStyles.sectionTitle}>
							나의 피부 유형에 적합한 미용 시술은 무엇인가요?
						</Text>
						{userDescription?.procedures?.description && (
							<Text style={MBSTStyles.sectionText}>
								{userDescription.procedures.description}
							</Text>
						)}
					</View>

					<View style={MBSTStyles.divider} />
					<View style={MBSTStyles.sectionBox}>
						<Text style={MBSTStyles.sectionTitle}>요약</Text>
						<Text style={MBSTStyles.sectionText}>
							{userDescription.summary}
						</Text>
					</View>
					<Text style={MBSTStyles.sectionText}>
						By Dr. Leslie Baumann on 2021
					</Text>
				</View>
			</ScrollView>
		</>
	);
};

export default MyBaumannResultScreen;
