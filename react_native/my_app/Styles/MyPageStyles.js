import { StyleSheet, Dimensions } from "react-native";

const screenWidth = Dimensions.get("window").width;
const boxesPerRow = 4;
const boxMargin = 4;
const totalSpacing = boxMargin * 2 * boxesPerRow;
const boxWidth = (screenWidth - totalSpacing) / boxesPerRow;

export const myPageStyles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#FFFFFF",
	},
	contentContainer: {
		paddingHorizontal: 16,
		paddingBottom: 40,
	},
	sectionHeader: {
		marginTop: 20,
		marginBottom: 0,
		flexDirection: "row", // 👈 Make this a row
		justifyContent: "space-between", // 👈 Distribute items horizontally
		alignItems: "center",
	},
	titleContainer: {
		flexDirection: "row",
		alignItems: "center",
	},
	titleHighlight: {
		width: 4,
		height: 20,
		backgroundColor: "#61dafb",
		marginRight: 8,
		borderRadius: 2,
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: "700",
		color: "#333333",
		fontFamily: "goorm-sans-bold",
	},
	// 회원정보 전용 스타일
	infoRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingVertical: 16,
		borderBottomWidth: 1,
		borderBottomColor: "#E0E0E0", // 연한 그레이
	},
	label: {
		fontSize: 12,
		color: "#999999",
		textTransform: "uppercase", // 고급스럽게
		letterSpacing: 0.5,
	},
	infoText: {
		fontSize: 16,
		fontWeight: "600",
		color: "#222222",
		textAlign: "right",
	},
	infoRowIcon: {
		flexDirection: "row",
		alignItems: "center",
	},
	infoIcon: {
		marginRight: 6,
		color: "#61dafb",
	},
	baumannSection: {
		marginTop: 25,
		marginBottom: 15,
	},
	baumannHeader: {
		flexDirection: "row",
		justifyContent: "space-between", // 타이틀 왼쪽, 버튼 오른쪽
		alignItems: "center",
		marginBottom: 8,
	},
	baumannTitle: {
		fontSize: 16,
		fontWeight: "600",
		color: "#333333",
	},
	baumannButtonWrapper: {
		flexDirection: "row",
		justifyContent: "flex-end", // 오른쪽 정렬
		marginTop: -20, // 목록과 간격
	},

	baumannInfoButton: {
		backgroundColor: "#6496B1",
		paddingVertical: 6,
		paddingHorizontal: 10,
		borderRadius: 3,
		maxWidth: 130,
		alignItems: "center",
	},
	baumannInfoButtonText: {
		color: "white",
		fontSize: 16,
		textDecorationLine: "underline",
	},
	disabledButton: {
		backgroundColor: "#E0E0E0",
	},
	disabledButtonText: {
		color: "#A0A0A0",
	},
	baumannContainer: {
		flexDirection: "row",
		flexWrap: "wrap",
		justifyContent: "center", // 👉 버튼들 가운데 정렬
		gap: 8,
		marginBottom: 20,
		marginTop: 15,
	},
	baumannItem: {
		width: 62,
		height: 38,
		justifyContent: "center",
		alignItems: "center",
		borderRadius: 2,
		margin: 4,
		backgroundColor: "#dcdcdc",
		borderWidth: 1,
		borderColor: "#ccc",
	},
	baumannText: {
		fontSize: 14,
		fontWeight: "500",
		textAlign: "center",
		color: "#555555",
	},
	baumannTextSelected: {
		color: "white",
	},
	concernSectionHeader: {
		marginTop: 20,
		marginBottom: 10,
	},
	concernContainer: {
		flexDirection: "row",
		flexWrap: "wrap",
		marginBottom: 20,
	},
	concernItem: {
		paddingVertical: 6,
		paddingHorizontal: 12,
		borderRadius: 20,
		backgroundColor: "#F0F0F0",
		marginRight: 10,
		marginBottom: 10,
	},
	concernSelected: {
		backgroundColor: "#61dafb",
	},
	concernDisabled: {
		opacity: 0.6,
	},
	concernText: {
		fontSize: 14,
		color: "#555555",
	},
	concernTextSelected: {
		color: "#FFFFFF",
		fontWeight: "600",
	},
	concernMaxText: {
		fontSize: 12,
		color: "#999999",
		marginTop: 5,
	},
	editButtonContainer: {
		flexDirection: "row",
		marginTop: 5,
	},
	editButtonText: {
		fontSize: 14,
		color: "#61dafb",
		fontWeight: "600",
	},
	buttonGroup: {
		marginTop: 20,
		marginBottom: 30,
	},
	primaryButton: {
		backgroundColor: "#61dafb",
		paddingVertical: 14,
		borderRadius: 25,
		alignItems: "center",
		marginBottom: 10,
	},
	primaryButtonText: {
		color: "#FFFFFF",
		fontWeight: "600",
		fontSize: 16,
	},
	fullScreenCenter: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		paddingHorizontal: 20,
		backgroundColor: "#FFFFFF",
	},
	retryButton: {
		marginTop: 10,
		backgroundColor: "#61dafb",
		paddingVertical: 10,
		paddingHorizontal: 20,
		borderRadius: 25,
	},
	retryButtonText: {
		color: "#FFFFFF",
		fontWeight: "600",
		fontSize: 14,
	},
	errorText: {
		fontSize: 16,
		color: "#888888",
		textAlign: "center",
	},
	routineButton: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "#61dafb69", // 반투명 하늘색 배경
		paddingVertical: 10,
		paddingHorizontal: 16,
		borderRadius: 5,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
		width: "80%",
		marginBottom: 8,
	},
	routineButtonText: {
		color: "#007B9E", // 메인컬러 계열 진한 파란색
		fontWeight: "600",
		fontSize: 12,
		flexShrink: 1,
	},
	rightHeaderContainer: {
		flexDirection: "column", // Align the max text and edit button vertically
		alignItems: "flex-end", // Align them to the right
		justifyContent: "center", // Center them vertically if needed
        marginBottom: 16,
	},
});

export default myPageStyles;
