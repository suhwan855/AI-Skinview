import React, { useState } from "react";
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	Alert,
	SafeAreaView,
	ScrollView,
	Switch,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../../utils/contexts/authContext";
import { handleLogout } from "../../utils/authActions";
import Header from "../../Styles/header";
import Ionicons from "react-native-vector-icons/Ionicons";

const SettingsScreen = () => {
	const { logout: authLogout } = useAuth();
	const navigation = useNavigation();

	// 알림 상태
	const [notificationsEnabled, setNotificationsEnabled] = useState(true);

	// 토글 함수 (나중에 서버 호출 포함 가능)
	const toggleNotifications = () => {
		const newValue = !notificationsEnabled;
		setNotificationsEnabled(newValue);

		// TODO: 나중에 서버 저장 로직 추가
		// 예: await saveNotificationSetting(newValue);
		console.log("알림 상태 변경:", newValue);
	};

	return (
		<>
			<Header title="환경설정" onBackPress={() => navigation.goBack()} />
			<SafeAreaView style={styles.container}>
				<ScrollView contentContainerStyle={styles.scroll}>
					<View style={styles.section}>
						{/* 회원정보 수정 */}
						<TouchableOpacity
							style={styles.item}
							onPress={() => navigation.navigate("UserInfoEdit")}
						>
							<View style={styles.row}>
								<Ionicons name="person-outline" size={20} style={styles.icon} />
								<Text style={styles.itemText}>회원정보 수정</Text>
							</View>
							<Ionicons name="chevron-forward" size={18} color="#bbb" />
						</TouchableOpacity>

						{/* 설문조사 다시하기 */}
						<TouchableOpacity
							style={styles.item}
							onPress={() => navigation.navigate("SurveyForm")} // <- 네비게이션 대상 스크린 이름 맞게 바꿔줘!
						>
							<View style={styles.row}>
								<Ionicons name="clipboard-outline" size={20} style={styles.icon} />
								<Text style={styles.itemText}>설문조사 다시하기</Text>
							</View>
							<Ionicons name="chevron-forward" size={18} color="#bbb" />
						</TouchableOpacity>

						{/* 알림 설정 (Switch) */}
						<View style={styles.item}>
							<View style={styles.row}>
								<Ionicons
									name="notifications-outline"
									size={20}
									style={styles.icon}
								/>
								<Text style={styles.itemText}>알림 설정</Text>
							</View>
							<Switch
								value={notificationsEnabled}
								onValueChange={toggleNotifications}
								trackColor={{ false: "#ccc", true: "#b3e9f2" }}
								thumbColor={notificationsEnabled ? "#78D1E2" : "#f4f3f4"}
							/>
						</View>

						{/* 약관 및 정책 */}
						<TouchableOpacity style={styles.item}>
							<View style={styles.row}>
								<Ionicons
									name="document-text-outline"
									size={20}
									style={styles.icon}
								/>
								<Text style={styles.itemText}>약관 및 정책</Text>
							</View>
							<Ionicons name="chevron-forward" size={18} color="#bbb" />
						</TouchableOpacity>

						{/* 앱 정보 */}
						<TouchableOpacity style={styles.item}>
							<View style={styles.row}>
								<Ionicons
									name="information-circle-outline"
									size={20}
									style={styles.icon}
								/>
								<Text style={styles.itemText}>앱 정보</Text>
							</View>
							<Ionicons name="chevron-forward" size={18} color="#bbb" />
						</TouchableOpacity>
					</View>

					{/* 로그아웃 */}
					<View style={styles.footer}>
						<TouchableOpacity
							style={styles.logoutButton}
							onPress={() => {
								Alert.alert("로그아웃", "정말 로그아웃 하시겠습니까?", [
									{ text: "취소", style: "cancel" },
									{
										text: "확인",
										onPress: () => handleLogout(authLogout, navigation),
									},
								]);
							}}
						>
							<Text style={styles.logoutText}>로그아웃</Text>
						</TouchableOpacity>
					</View>
				</ScrollView>
			</SafeAreaView>
		</>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#fff",
	},
	scroll: {
		paddingHorizontal: 20,
		paddingTop: 10,
	},
	section: {
		backgroundColor: "#fff",
	},
	item: {
		height: 60,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingVertical: 5,
		borderBottomWidth: 1,
		borderBottomColor: "#eee",
	},
	row: {
		flexDirection: "row",
		alignItems: "center",
	},
	icon: {
		marginRight: 12,
		color: "#78D1E2",
	},
	itemText: {
		fontSize: 16,
		color: "#333",
	},
	footer: {
		marginTop: 40,
		alignItems: "center",
	},
	logoutButton: {
		width: "100%",
		paddingVertical: 16,
		borderRadius: 8,
		backgroundColor: "#f8f8f8",
		alignItems: "center",
	},
	logoutText: {
		color: "#E53935",
		fontSize: 16,
		fontWeight: "600",
		fontFamily: "goorm-sans-bold",
	},
});

export default SettingsScreen;
