import { StyleSheet } from "react-native";

export const skinTypeColors = {
  DSPT: {
    bgColor: "#C469A7",
    titleColor: "#fff",
    indexColor: "#FDE6FF",
    descColor: "#FDE6FF",
    disabledOpacity: 0.5,
  },
  DSNT: {
    bgColor: "#F499C1",
    titleColor: "#222",
    indexColor: "#333",
    descColor: "#333",
    disabledOpacity: 0.5,
  },
  DSPW: {
    bgColor: "#F06788",
    titleColor: "#fff",
    indexColor: "#fff5f5",
    descColor: "#fff5f5",
    disabledOpacity: 0.5,
  },
  DSNW: {
    bgColor: "#F3B5A8",
    titleColor: "#442c2c",
    indexColor: "#4a2f2f",
    descColor: "#4a2f2f",
    disabledOpacity: 0.5,
  },
  OSPT: {
    bgColor: "#F6976E",
    titleColor: "#fff",
    indexColor: "#fff3ed",
    descColor: "#fff3ed",
    disabledOpacity: 0.5,
  },
  OSNT: {
    bgColor: "#FDD6B8",
    titleColor: "#4a2d1e",
    indexColor: "#4a2d1e",
    descColor: "#4a2d1e",
    disabledOpacity: 0.5,
  },
  OSPW: {
    bgColor: "#FCB95C",
    titleColor: "#4a3300",
    indexColor: "#4a3300",
    descColor: "#4a3300",
    disabledOpacity: 0.5,
  },
  OSNW: {
    bgColor: "#FFE3A4",
    titleColor: "#4a3900",
    indexColor: "#4a3900",
    descColor: "#4a3900",
    disabledOpacity: 0.5,
  },
  ORPT: {
    bgColor: "#B5D335",
    titleColor: "#333",
    indexColor: "#444",
    descColor: "#444",
    disabledOpacity: 0.5,
  },
  ORNT: {
    bgColor: "#CCE39D",
    titleColor: "#2c331e",
    indexColor: "#2c331e",
    descColor: "#2c331e",
    disabledOpacity: 0.5,
  },
  ORPW: {
    bgColor: "#83C15C",
    titleColor: "#1e3312",
    indexColor: "#1e3312",
    descColor: "#1e3312",
    disabledOpacity: 0.5,
  },
  ORNW: {
    bgColor: "#9FD6BC",
    titleColor: "#1c1c1c",
    indexColor: "#2a2a2a",
    descColor: "#2a2a2a",
    disabledOpacity: 0.5,
  },
  DRPT: {
    bgColor: "#46A5C4",
    titleColor: "#fff",
    indexColor: "#e4f9ff",
    descColor: "#e4f9ff",
    disabledOpacity: 0.5,
  },
  DRNT: {
    bgColor: "#9EC1E5",
    titleColor: "#253142",
    indexColor: "#2e3b4f",
    descColor: "#2e3b4f",
    disabledOpacity: 0.5,
  },
  DRPW: {
    bgColor: "#A892B2",
    titleColor: "#fff",
    indexColor: "#f7efff",
    descColor: "#f7efff",
    disabledOpacity: 0.5,
  },
  DRNW: {
    bgColor: "#C2B0CE",
    titleColor: "#2e2239",
    indexColor: "#3b2e4f",
    descColor: "#3b2e4f",
    disabledOpacity: 0.5,
  },
};

const MBSTStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f2f5", // Light gray background
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 24,
    color: "#2c3e50", // Dark title color
  },
  resultBox: {
    width: 350,
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  baumannTypeLabel: {
    fontSize: 18,
    fontWeight: "500",
    marginBottom: 4,
  },
  baumannType: {
    fontSize: 56,
    fontWeight: "900",
    letterSpacing: 1.5,
    // 글자 그림자(테두리 효과) 추가
    textShadowColor: "rgba(0, 0, 0, 0.2)", // 그림자 색상 (약간 투명한 검정)
    textShadowOffset: { width: 1, height: 1 }, // 그림자 위치 (약간 오른쪽 아래로)
    textShadowRadius: 3, // 그림자 블러(blur) 정도
  },
  divider: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginVertical: 24,
  },
  partsSection: {
    marginBottom: 24,
  },
  dualBarSection: {
    marginBottom: 24,
  },
  dualBarLabel: {
    fontSize: 18,
    fontWeight: "600",
    color: "#34495e",
    marginBottom: 12,
    textAlign: "center",
  },
  dualBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
    height: 12,
  },
  barWrapper: {
    flex: 1,
    height: "100%",
    backgroundColor: "#e0e0e0",
    borderRadius: 6,
    marginHorizontal: 12,
    overflow: "hidden",
  },
  dominantBar: {
    height: "100%",
    borderRadius: 6,
  },
  dualLabelText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#7f8c8d",
    minWidth: 40,
  },
  dualScoreContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  dualScoreText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#34495e",
  },
  descriptionBox: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 24,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  descriptionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#2c3e50",
  },
  descriptionText: {
    fontSize: 16,
    lineHeight: 24,
    color: "#34495e",
  },
  sectionBox: {
    marginBottom: 20,
    backgroundColor: "#f9f9f9",
    padding: 20,
    borderRadius: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#2c3e50",
  },
  sectionText: {
    fontSize: 16,
    lineHeight: 24,
    color: "#555",
  },
  subTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 10,
    marginBottom: 6,
    color: "#34495e",
  },
  bulletText: {
    fontSize: 16,
    lineHeight: 24,
    marginLeft: 8,
    color: "#555",
  },
  subSection: {
    marginBottom: 12,
  },
  noDataText: {
    fontSize: 18,
    color: "#7f8c8d",
  },
  byline: {
    fontSize: 12,
    color: "#95a5a6",
    textAlign: "right",
    marginTop: 16,
    fontStyle: "italic",
  },

  
  // 여기서부터 SurveyForm styles
  chapterHeader: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginBottom: 10,
    textAlign: "center",
  },
  questionBlock: {
    marginTop: 20,
    marginBottom: 20,
  },
  questionText: {
    fontFamily: "NotoSansKR_700Bold", // 볼드체
    fontSize: 18, // 약간 줄이고
    marginBottom: 12, // 간격 살짝 키움
    color: "#2A2A2A", // 더 진하고 부드러운 다크 그레이
    lineHeight: 26, // 가독성 좋은 줄간격 추가
  },
  noticeText: {
    fontSize: 14,
    color: "#0B486B", // 좀 더 차분한 딥 블루
    backgroundColor: "#D5E8F6", // 연하고 부드러운 하늘색
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginBottom: 25,
    fontFamily: "NotoSansKR_400Regular", // 일반체
    lineHeight: 20,
    borderWidth: 1,
    borderColor: "#9CC6E0", // 은은한 테두리로 깔끔함 강조
    shadowColor: "#8FAECC",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  optionButton: {
    padding: 14, // 약간 여유있게
    marginVertical: 5,
    borderWidth: 1,
    borderColor: "#61DAFB",
    borderRadius: 2.5,
    backgroundColor: "#fff",
  },
  selectedButton: {
    backgroundColor: "#4AAEDC", // 통일된 톤 유지
    borderColor: "#4AAEDC",
  },
  optionText: {
    fontFamily: "NotoSansKR_400Regular", // 일반체
    fontSize: 16, // 질문보다는 작지만 충분히 큼
    textAlign: "left",
    color: "#3A3A3A", // 약간 밝은 다크 그레이
    fontWeight: "500", // 중간 두께로 부담 없게
    lineHeight: 24, // 읽기 좋은 간격
    flexWrap: "wrap",
  },

  selectedText: {
    fontFamily: "NotoSansKR_400Regular", // 일반체
    color: "white",
  },
  nextButton: {
    backgroundColor: "#4AAEDC",
    padding: 15,
    borderRadius: 12,
    marginTop: 20,
  },
  nextButtonDisabled: {
    backgroundColor: "#C6EAF7",
  },
  nextButtonText: {
    // fontFamily: 'NotoSansKR_700Bold', // 일반체
    color: "white",
    fontSize: 18,
    textAlign: "center",
  },
  homeButton: {
    marginTop: 30,
    backgroundColor: "#4A4A4A", // 짙은 회색
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 10,
  },

  homeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  loadingContainer: {
    backgroundColor: "#E9F2F9", // 좀 더 차분하고 부드러운 연블루톤
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#333",
  },
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: "#E9F2F9", // 좀 더 차분하고 부드러운 연블루톤
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  innerContainer: {
    flex: 1,
    alignItems: "center",
  },

  resultContainer: {
    width: "100%",
    alignItems: "center",
  },
  resultCard: {
    backgroundColor: "#FFFFFF", // 흰색 배경으로 통일
    borderRadius: 8,
    padding: 20,
    marginTop: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1, // 그림자를 부드럽게
    shadowRadius: 10,
    elevation: 8,
    alignItems: "center", // 가운데 정렬
  },

  resultHeader: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333", // 어두운 회색으로 부드러움 강조
  },

  tagContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: 15,
    marginBottom: 10,
  },

  hashtagBox: {
    backgroundColor: "#FFFFFF", // 연한 회색 배경
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    margin: 4,
  },

  hashtagText: {
    fontSize: 14,
    color: "#666", // 텍스트 색상을 약간 연하게
    fontWeight: "500", // 너무 굵지 않게
  },

  descriptionItem: {
    flexDirection: "row", // 동그라미 기호와 텍스트를 한 줄에
    alignItems: "flex-start", // 위쪽을 기준으로 정렬
    marginBottom: 15, // 항목 사이의 여백
  },

  bulletPoint: {
    fontSize: 16,
    lineHeight: 22,
    marginRight: 10,
    color: "#333",
  },

  descriptionText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    color: "#555",
  },
});

export default MBSTStyles;
