import { StyleSheet } from "react-native";

export const myPageStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8FAFC",
        paddingHorizontal: 20,
        paddingTop: 16,
    },
    contentContainer: {
        paddingBottom: 40,
    },
    sectionHeader: {
        marginBottom: 16,
    },
    titleContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    titleHighlight: {
        width: 4,
        height: 24,
        backgroundColor: "#61dafb",
        borderRadius: 2,
        marginRight: 8,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#1E293B",
    },
    infoRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#E2E8F0",
    },
    infoRowIcon: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    infoIcon: {
        marginRight: 10,
    },
    label: {
        fontSize: 15,
        fontWeight: "500",
        color: "#334155",
    },
    infoText: {
        flex: 2,
        fontSize: 15,
        color: "#64748B",
    },
    textInput: {
        flex: 2,
        fontSize: 15,
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: "#F1F5F9",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#E2E8F0",
        color: "#1E293B",
    },
    inputGroup: {
        flex: 2,
    },
    emailInputWrapper: {
        flexDirection: "row",
        alignItems: "center",
    },

    emailCheckButton: {
        backgroundColor: "#61dafb",
        height: 30, // 주소검색 버튼 높이와 동일
        paddingHorizontal: 12, // 좌우 간격
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
        marginLeft: 8,
    },
    emailCheckButtonText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "600",
    },
    addressInputGroup: {
        flex: 2,
    },
    postalCodeWrapper: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
    },
    postalCodeInput: {
        flex: 1,
        fontSize: 15,
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: "#F1F5F9",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#E2E8F0",
        color: "#1E293B",
    },
    addressSearchButton: {
        marginLeft: 8,
        backgroundColor: "#61dafb",
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 10,
    },
    addressSearchButtonText: {
        color: "#FFFFFF",
        fontWeight: "600",
        fontSize: 13,
    },
    addressInputDisabled: {
        fontSize: 15,
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: "#E2E8F0",
        borderRadius: 12,
        color: "#64748B",
        marginBottom: 8,
    },
    addressInput: {
        fontSize: 15,
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: "#F1F5F9",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#E2E8F0",
        color: "#1E293B",
    },
    buttonGroup: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 24,
    },
    primaryButton: {
        flex: 1,
        backgroundColor: "#61dafb",
        paddingVertical: 14,
        borderRadius: 14,
        alignItems: "center",
        marginRight: 8,
    },
    primaryButtonText: {
        color: "#FFFFFF",
        fontWeight: "600",
        fontSize: 16,
    },
    secondaryButton: {
        flex: 1,
        backgroundColor: "#E2E8F0",
        paddingVertical: 14,
        borderRadius: 14,
        alignItems: "center",
        marginLeft: 8,
    },
    secondaryButtonText: {
        color: "#334155",
        fontWeight: "600",
        fontSize: 16,
    },
});
