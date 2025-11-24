import { StyleSheet } from "react-native";

const myRoutineLogStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAF9F6", // 연한 아이보리 종이색
    padding: 16,
  },
  fullScreenCenter: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    backgroundColor: "#FFFDF7", // 약간 밝은 종이색 (배경과 큰 차이 없음)
    borderRadius: 0, // 종이 느낌 내기 위해 둥글게 안 함
    marginBottom: 10,
    paddingVertical: 16,
    paddingHorizontal: 14,
    borderLeftWidth: 3, // 노트의 줄 느낌
    borderLeftColor: "#6496B1", // 올리브 옐로우 톤의 줄 색상 (종이에 그린 듯)
    shadowColor: "transparent", // 그림자 없애서 튀지 않게
    elevation: 0,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#3B3B3B", // 부드러운 다크 그레이
    fontFamily: "MyRoutineLogFont",
  },
  item: {
    borderTopWidth: 1,
    borderTopColor: "#EEE9D9", // 연한 노란 줄 (종이 줄 느낌)
    paddingTop: 12,
    marginTop: 8,
  },
  productName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#3A3A3A",
    marginBottom: 6,
  },
  usageSection: {
    marginTop: 10,
  },
  usageTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#5A5A5A",
    marginBottom: 4,
  },
  usageContent: {
    fontSize: 13,
    lineHeight: 22,
    color: "#5E5E5E",
  },
  deleteButtonText: {
    alignSelf: "flex-end",
    color: "#B22222",
    fontWeight: "600",
    fontSize: 12,
    textDecorationLine: "underline",
  },
  datedHeader: {
    fontSize: 16,
    fontWeight: "700",
    color: "#6B6B6B",
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#6496b1a9", // 연한 올리브 톤 선
  },
  headerContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 15,
    paddingTop: 10,
  },
  refreshButton: {
    padding: 5,
  },
});

export default myRoutineLogStyles;
