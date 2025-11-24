// src/member/MyRoutineLogScreen.js

import React, { useEffect, useState } from "react";
import {
	View,
	Text,
	TouchableOpacity,
	ActivityIndicator,
	ScrollView,
	Alert,
} from "react-native";
// ✅ Ionicons 컴포넌트 추가
import Ionicons from "react-native-vector-icons/Ionicons";

import {
	fetchMyRoutineLog,
	processRoutineData,
	parseUsageGuide,
	renderContentWithHighlight,
	deleteRoutine,
} from "../MyPage/MyRoutineLogFunctions";
import myRoutineLogStyles from "../../Styles/MyRoutineLogStyles";
export default function MyRoutineLogScreen({ route }) {
	const userId = route.params?.userId;
	const [routineSections, setRoutineSections] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [expandedSections, setExpandedSections] = useState({});
	const [deletingId, setDeletingId] = useState(null);

	const loadRoutine = async (forceRefresh = false) => {
		setLoading(true);
		try {
			const rawData = await fetchMyRoutineLog(userId, forceRefresh);
			const processedSections = processRoutineData(rawData);
			setRoutineSections(processedSections);

			const initialExpanded = {};
			processedSections.forEach((section) => {
				initialExpanded[section.title] = false;
			});
			setExpandedSections(initialExpanded);
		} catch (err) {
			setError("루틴을 불러오는데 실패했습니다.");
		} finally {
			setLoading(false);
			setDeletingId(null);
		}
	};
	console.log(myRoutineLogStyles);

	useEffect(() => {
		if (userId) {
			loadRoutine();
		}
	}, [userId]);

	const toggleSection = (title) => {
		setExpandedSections((prev) => ({
			...prev,
			[title]: !prev[title],
		}));
	};

	const handleDeleteRoutine = async (routineId) => {
		Alert.alert("루틴 삭제", "정말로 이 루틴을 삭제하시겠습니까?", [
			{
				text: "취소",
				style: "cancel",
			},
			{
				text: "삭제",
				onPress: async () => {
					setDeletingId(routineId);
					try {
						await deleteRoutine(routineId, userId);
						loadRoutine(true);
					} catch (e) {
						Alert.alert("오류", "루틴 삭제에 실패했습니다.");
						setDeletingId(null);
					}
				},
				style: "destructive",
			},
		]);
	};

	if (loading) {
		return (
			<View style={myRoutineLogStyles.fullScreenCenter}>
				<ActivityIndicator size="large" color="#007AFF" />
			</View>
		);
	}

	if (error) {
		return (
			<View style={myRoutineLogStyles.fullScreenCenter}>
				<Text style={{ color: "#FF3B30" }}>{error}</Text>
			</View>
		);
	}

	if (routineSections.length === 0) {
		return (
			<View style={myRoutineLogStyles.fullScreenCenter}>
				<Text style={{ color: "#888", textAlign: "center" }}>
					등록된 루틴이 없습니다.
				</Text>
			</View>
		);
	}

	let lastRenderedDate = null;

	return (
		<View style={{ flex: 1 }}>
			<View style={myRoutineLogStyles.headerContainer}>
				<TouchableOpacity
					style={myRoutineLogStyles.refreshButton}
					onPress={() => loadRoutine(true)}
					disabled={loading}
				>
					{loading ? (
						<ActivityIndicator size="small" color="#666" />
					) : (
						<Ionicons
							name="reload-outline"
							size={24}
							color="#666"
						/>
					)}
				</TouchableOpacity>
			</View>

			<ScrollView style={myRoutineLogStyles.container}>
				{routineSections.map((section, idx) => {
					const currentDate = section.data[0].preset_date;
					const showDateHeader = lastRenderedDate !== currentDate;

					if (showDateHeader) {
						lastRenderedDate = currentDate;
					}

					// ✅ 날짜 형식을 "YYYY년 MM월 DD일"로 변환
					const [year, month, day] = currentDate.split("-");
					const formattedDate = `${year}년 ${month}월 ${day}일`;

					return (
						<View key={idx}>
							{showDateHeader && (
								<Text style={myRoutineLogStyles.datedHeader}>
									{formattedDate}
								</Text>
							)}
							<View style={myRoutineLogStyles.card}>
								<TouchableOpacity
									onPress={() => toggleSection(section.title)}
									style={myRoutineLogStyles.cardHeader}
								>
									<View style={{ flex: 1 }}>
										<Text
											style={
												myRoutineLogStyles.sectionTitle
											}
										>
											{section.title}
										</Text>
									</View>
									<Text style={myRoutineLogStyles.expandIcon}>
										{expandedSections[section.title]
											? "접기"
											: ""}
									</Text>
								</TouchableOpacity>

								{expandedSections[section.title] &&
									section.data.map((item, itemIdx) => {
										const usageSections = parseUsageGuide(
											item.preset_usage_guide
										);
										const isLastItem =
											itemIdx === section.data.length - 1;

										return (
											<View
												key={itemIdx}
												style={[
													myRoutineLogStyles.item,
													!isLastItem &&
														myRoutineLogStyles.itemUnderline,
												]}
											>
												<Text
													style={
														myRoutineLogStyles.productName
													}
												>
													{item.preset_product_name}
												</Text>

												{usageSections.map(
													(usage, usageIdx) => (
														<View
															key={usageIdx}
															style={
																myRoutineLogStyles.usageSection
															}
														>
															<Text
																style={
																	myRoutineLogStyles.usageTitle
																}
															>
																{usage.title}
															</Text>
															{renderContentWithHighlight(
																usage.content,
																myRoutineLogStyles.usageContent,
																{
																	fontWeight:
																		"bold",
																	color: "#3dac1cff",
																}
															)}
														</View>
													)
												)}
												<TouchableOpacity
													onPress={() =>
														handleDeleteRoutine(
															item.id
														)
													}
													style={
														myRoutineLogStyles.deleteButton
													}
													disabled={
														deletingId === item.id
													}
												>
													{deletingId === item.id ? (
														<ActivityIndicator
															size="small"
															color="#FF3B30"
														/>
													) : (
														<Text
															style={
																myRoutineLogStyles.deleteButtonText
															}
														>
															이 로그 삭제하기
														</Text>
													)}
												</TouchableOpacity>
											</View>
										);
									})}
							</View>
						</View>
					);
				})}
			</ScrollView>
		</View>
	);
}
