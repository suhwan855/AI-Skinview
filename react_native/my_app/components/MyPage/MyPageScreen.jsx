import { useState, useEffect } from "react";
import * as React from "react";
import {
	View,
	Text,
	ScrollView,
	TouchableOpacity,
	Alert,
	RefreshControl,
} from "react-native";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { skinTypeColors } from "../../Styles/MBSTStyles.js";
import { myPageStyles } from "../../Styles/MyPageStyles.js";
import {
	formatPhoneNumber,
	skinConcernsList,
	baumannTypes,
	colorMap,
	displayOrder,
	labels,
	fetchMyPageData,
} from "../../utils/api/fastapi.js";
import LoadingOverlay from "../../components/Common/LoadingOverlay.jsx";
import Ionicons from "react-native-vector-icons/Ionicons";

// Baumann 타입 박스
function BaumannTypeDisplay({
	baumannTypes,
	selectedType,
	colorMap,
	hasSurveyResult,
	userInfo,
	navigation,
}) {
	return (
		<View style={myPageStyles.baumannContainer}>
			{baumannTypes.map((type) => {
				const isSelected = type === selectedType; // 이거 하나만 활성화
				const isEnabled = isSelected; // 활성화 조건

				return (
					<TouchableOpacity
						key={type}
						disabled={!isEnabled} // 비활성화 버튼 터치 막기
						onPress={
							hasSurveyResult && isEnabled
								? () =>
										navigation.navigate(
											"MyBaumannResultScreen",
											{
												surveyData: {
													...userInfo,
													survey_skin_type: type,
												},
											}
										)
								: undefined
						}
						style={[
							myPageStyles.baumannItem,
							{
								backgroundColor: skinTypeColors[type].bgColor,
								borderColor: skinTypeColors[type].bgColor,
								borderWidth: isSelected ? 2.5 : 1,
								opacity: isEnabled
									? 1
									: skinTypeColors[type].disabledOpacity ??
									  0.5,
							},
						]}
					>
						<Text
							style={[
								myPageStyles.baumannText,
								{
									color: skinTypeColors[type].titleColor,
									fontWeight: isSelected ? "bold" : "normal",
									opacity: isEnabled ? 1 : 0.7,
									fontFamily: isSelected
										? "goorm-sans-bold"
										: "goorm-sans-medium",
								},
							]}
						>
							{type}
						</Text>
					</TouchableOpacity>
				);
			})}
		</View>
	);
}

// 피부고민 선택

function SkinConcernsSelector({
	isEditing,
	selectedConcerns,
	setSelectedConcerns,
}) {
	const toggleConcern = (concern) => {
		if (!isEditing) return;

		if (selectedConcerns.includes(concern)) {
			setSelectedConcerns(selectedConcerns.filter((c) => c !== concern));
		} else {
			if (selectedConcerns.length < 3)
				setSelectedConcerns([...selectedConcerns, concern]);
			else Alert.alert("알림", "최대 3개까지 선택 가능합니다.");
		}
	};

	return (
		<View style={myPageStyles.concernContainer}>
			{skinConcernsList.map((concern) => (
				<TouchableOpacity
					key={concern}
					style={[
						myPageStyles.concernItem,
						selectedConcerns.includes(concern) &&
							myPageStyles.concernSelected,
						!isEditing && myPageStyles.concernDisabled,
					]}
					onPress={() => toggleConcern(concern)}
					disabled={!isEditing}
				>
					<Text
						style={
							selectedConcerns.includes(concern)
								? myPageStyles.concernTextSelected
								: myPageStyles.concernText
						}
					>
						{concern}
					</Text>
				</TouchableOpacity>
			))}
		</View>
	);
}

export default function MyPageScreen() {
	const navigation = useNavigation();
	const isFocused = useIsFocused();

	const [refreshing, setRefreshing] = useState(false);
	const [userInfo, setUserInfo] = useState(null);
	const [selectedConcerns, setSelectedConcerns] = useState([]);
	const [isEditingSkinConcerns, setIsEditingSkinConcerns] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [isError, setIsError] = useState(false);
	const [hasSurveyResult, setHasSurveyResult] = useState(false);

	// userInfo 있으면 API 호출 생략
	useEffect(() => {
		if (isFocused && !userInfo) loadUserInfo();
	}, [isFocused]);

	const loadUserInfo = async () => {
		setIsLoading(true);
		setIsError(false);
		try {
			const response = await fetchMyPageData();
			if (response.success) {
				setUserInfo(response.data);
				setSelectedConcerns(response.data.skinConcerns || []);
				setHasSurveyResult(!!response.data.survey_skin_type);
			} else setIsError(true);
		} catch (error) {
			console.error("회원 정보 로딩 중 에러 발생:", error);
			setIsError(true);
		} finally {
			setIsLoading(false);
		}
	};

	const onRefresh = async () => {
		setRefreshing(true);
		await loadUserInfo();
		setRefreshing(false);
	};

	const handleRetry = () => loadUserInfo();

	if (isLoading || !userInfo) return <LoadingOverlay visible={true} />;

	if (isError)
		return (
			<View style={myPageStyles.fullScreenCenter}>
				<Text style={myPageStyles.errorText}>
					정보를 불러오는 데 실패했습니다. 😞
				</Text>
				<TouchableOpacity
					style={myPageStyles.retryButton}
					onPress={handleRetry}
				>
					<Text style={myPageStyles.retryButtonText}>다시 시도</Text>
				</TouchableOpacity>
			</View>
		);

	return (
		<>
			<ScrollView
				style={myPageStyles.container}
				contentContainerStyle={myPageStyles.contentContainer}
				refreshControl={
					<RefreshControl
						refreshing={refreshing}
						onRefresh={onRefresh}
					/>
				}
			>
				{/* 회원정보 */}
				<View style={myPageStyles.sectionHeader}>
					<View style={myPageStyles.titleContainer}>
						<View style={myPageStyles.titleHighlight} />
						<Text style={myPageStyles.sectionTitle}>회원정보</Text>
					</View>
				</View>
				<View>
					{displayOrder.map((key) => (
						<View key={key} style={myPageStyles.infoRow}>
							<View style={myPageStyles.infoRowIcon}>
								{key === "user_id" && (
									<Ionicons
										name="at-outline"
										size={16}
										style={myPageStyles.infoIcon}
									/>
								)}
								{key === "user_name" && (
									<Ionicons
										name="person-outline"
										size={16}
										style={myPageStyles.infoIcon}
									/>
								)}
								{key === "user_email" && (
									<Ionicons
										name="mail-outline"
										size={16}
										style={myPageStyles.infoIcon}
									/>
								)}
								{key === "user_phone_number" && (
									<Ionicons
										name="call-outline"
										size={16}
										style={myPageStyles.infoIcon}
									/>
								)}
								{key === "user_address" && (
									<Ionicons
										name="location-outline"
										size={16}
										style={myPageStyles.infoIcon}
									/>
								)}
								{key === "user_birth" && (
									<Ionicons
										name="calendar-outline"
										size={16}
										style={myPageStyles.infoIcon}
									/>
								)}
								{key === "user_gender" && (
									<Ionicons
										name={
											userInfo[key] === "남자"
												? "woman-outline"
												: "man-outline"
										}
										size={16}
										style={myPageStyles.infoIcon}
									/>
								)}
								{key === "user_password" && (
									<Ionicons
										name="lock-closed-outline"
										size={16}
										style={myPageStyles.infoIcon}
									/>
								)}
								<Text style={myPageStyles.label}>
									{labels[key]}
								</Text>
							</View>

							<Text style={myPageStyles.infoText}>
								{key === "user_email"
									? userInfo.user_email
									: key === "user_address"
									? userInfo.postalCode && userInfo.address1
										? `(${userInfo.postalCode}) ${
												userInfo.address1
										  } ${userInfo.address2 || ""}`.trim()
										: "주소 정보 없음"
									: key === "user_phone_number"
									? formatPhoneNumber(userInfo[key])
									: key === "user_password"
									? "* * * * * * * *"
									: userInfo[key]}
							</Text>
						</View>
					))}
				</View>

				{/* Baumann 피부타입 */}
				<View style={myPageStyles.baumannSection}>
					{/* 타이틀 + 컬러 블록 */}
					<View style={myPageStyles.titleContainer}>
						<View style={myPageStyles.titleHighlight} />
						<Text style={myPageStyles.sectionTitle}>
							나의 Baumann 피부타입
						</Text>
					</View>

					<View style={myPageStyles.baumannButtonWrapper}>
						<TouchableOpacity
							style={[
								myPageStyles.baumannInfoButton,
								!hasSurveyResult && myPageStyles.disabledButton,
							]}
							onPress={
								hasSurveyResult
									? () =>
											navigation.navigate("BaumannInfo", {
												surveyData: userInfo,
											})
									: undefined
							}
							disabled={!hasSurveyResult}
						>
							<Text
								style={[
									myPageStyles.baumannInfoButtonText,
									!hasSurveyResult &&
										myPageStyles.disabledButtonText,
								]}
							>
								Baumann Skin Types®↗
							</Text>
						</TouchableOpacity>
					</View>

					{/* Baumann 타입 16개 4줄 표시 */}
					<BaumannTypeDisplay
						baumannTypes={baumannTypes}
						selectedType={userInfo.survey_skin_type || ""}
						colorMap={colorMap}
						hasSurveyResult={hasSurveyResult}
						userInfo={userInfo}
						navigation={navigation}
					/>
				</View>

				{/* 나의 루틴 확인하기 헤더 */}
				<View style={myPageStyles.sectionHeader}>
					<View style={myPageStyles.titleContainer}>
						<View style={myPageStyles.titleHighlight} />
						<Text style={myPageStyles.sectionTitle}>나의 루틴</Text>
					</View>
				</View>
				{/* 나만의 피부 솔루션 확인하기 버튼 */}
				<View style={myPageStyles.buttonGroup}>
					<TouchableOpacity
						style={myPageStyles.routineButton}
						onPress={() => {
							console.log(
								"나만의 피부 솔루션 확인하기 버튼 눌림 (디버그)"
							);
							console.log("userInfo:", userInfo);
							console.log(
								"userInfo?.user_key:",
								userInfo?.user_key
							);

							if (!userInfo?.user_key) {
								alert(
									"사용자 정보가 없습니다. 잠시 후 다시 시도해주세요."
								);
								return;
							}

							navigation.navigate("MyRoutineLog", {
								userId: userInfo.user_key,
							});
						}}
						// disabled 제거
					>
						<View
							style={{
								flexDirection: "row",
								alignItems: "center",
							}}
						>
							<Text style={myPageStyles.routineButtonText}>
								나만의 피부 솔루션 라이브러리로 이동하기
							</Text>
							<Ionicons
								name="bookmark"
								size={22}
								color="#007B9E"
								style={{ marginLeft: 8 }}
							/>
						</View>
					</TouchableOpacity>
				</View>

				{/* 피부고민 */}
				<View style={myPageStyles.sectionHeader}>
					<View style={myPageStyles.titleContainer}>
						<View style={myPageStyles.titleHighlight} />
						<Text style={myPageStyles.sectionTitle}>
							나의 피부고민
						</Text>
					</View>
					{/* Wrap the other two elements in a container for the right side */}
					<View style={myPageStyles.rightHeaderContainer}>
						<Text style={myPageStyles.concernMaxText}>
							최대 3개 선택 가능
						</Text>
						<View style={myPageStyles.editButtonContainer}>
							{isEditingSkinConcerns && (
								<TouchableOpacity
									onPress={() =>
										setIsEditingSkinConcerns(false)
									}
								>
									<Text style={myPageStyles.editButtonText}>
										취소
									</Text>
								</TouchableOpacity>
							)}
							<TouchableOpacity
								onPress={() =>
									setIsEditingSkinConcerns(
										!isEditingSkinConcerns
									)
								}
								style={{ marginLeft: 10 }}
							>
								<Text style={myPageStyles.editButtonText}>
									{isEditingSkinConcerns
										? "저장하기"
										: "수정하기↗"}
								</Text>
							</TouchableOpacity>
						</View>
					</View>
				</View>
				<SkinConcernsSelector
					isEditing={isEditingSkinConcerns}
					selectedConcerns={selectedConcerns}
					setSelectedConcerns={setSelectedConcerns}
				/>

				{/* 버튼 그룹 */}
				<View style={myPageStyles.buttonGroup}>
					<TouchableOpacity
						style={{ marginTop: 10, alignItems: "center" }}
						onPress={() => navigation.navigate("Settings")}
					>
						<Text
							style={[
								myPageStyles.editButtonText,
								{
									fontFamily: "goorm-sans-bold",
								},
							]}
						>
							설정
						</Text>
					</TouchableOpacity>
				</View>
			</ScrollView>
		</>
	);
}
