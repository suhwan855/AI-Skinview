import React, { useState } from "react";
import {
    View,
    StyleSheet,
    Text,
    TouchableOpacity,
    ScrollView,
    TextInput,
    Keyboard,
    Alert
} from "react-native";
import Header from "../../Styles/header";
import { Ionicons } from "@expo/vector-icons";
import { searchProducts } from "../../utils/api/fastapi";

export default function Category({ navigation }) {
    const [skinCareExpanded, setSkinCareExpanded] = useState(false);
    const [sunCareExpanded, setSunCareExpanded] = useState(false);
    const [cleanCareExpanded, setCleanCareExpanded] = useState(false);
    const [keyword, setKeyword] = useState("");
    const [loading, setLoading] = useState(false);

    const toggleSkinCare = () => setSkinCareExpanded(!skinCareExpanded);
    const toggleSunCare = () => setSunCareExpanded(!sunCareExpanded);
    const toggleCleanCare = () => setCleanCareExpanded(!cleanCareExpanded);

    const handleSearch = async () => {
        if (!keyword.trim()) {
            Alert.alert("알림", "검색어를 입력하세요.");
            return;
        }

        setLoading(true);
        try {
            const products = await searchProducts(keyword);

            navigation.navigate("ProductList", {
                categoryTitle: keyword,
                products,
                searchKeyword: keyword
            });

            Keyboard.dismiss();
        } catch (err) {
            console.error("검색 실패:", err);
            Alert.alert("오류", "검색 중 문제가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    const CategoryItem = ({
        text,
        onPress,
        isSubCategory = false,
        isToggle = false,
        expanded,
        style,
    }) => (
        <TouchableOpacity
            style={[
                styles.categoryItem,
                isSubCategory && styles.subCategoryItem,
                isToggle && styles.toggleCategoryItem,
            ]}
            onPress={() => onPress && onPress(text)}
            activeOpacity={0.7}
        >
            <Text
                style={[
                    isSubCategory ? styles.subCategoryText : styles.categoryText,
                    style,
                ]}
            >
                {text}
            </Text>
            {isToggle && (
                <Text style={styles.toggleIcon}>{expanded ? "▲" : "▼"}</Text>
            )}
        </TouchableOpacity>
    );

    const renderSubCategories = (items) =>
        items.map((text, index) => (
            <CategoryItem
                key={`${text}-${index}`}
                text={text}
                isSubCategory
                style={styles.subCategoryText}
                onPress={(selectedText) =>
                    navigation.navigate("ProductList", { categoryTitle: selectedText })
                }
            />
        ));

    const skinCareItems = [
        "스킨케어 ALL",
        "스킨/토너",
        "에센스/세럼/앰플",
        "미스트",
        "크림",
        "로션",
        "오일",
        "아이크림",
        "마스크/팩",
    ];

    const sunCareItems = [
        "선케어 ALL",
        "선크림",
        "선스틱",
        "선쿠션",
        "수딩/애프터선",
    ];

    const cleanCareItems = [
        "클렌징 ALL",
        "밤/오일/크림",
        "워터",
        "폼/젤",
        "티슈",
        "립/아이리무버",
        "스크럽/필링",
    ];

    return (
        <>
            <Header title="Category" onBackPress={() => navigation.goBack()} />
            
            {/* 🔍 검색창 */}
            <View style={styles.searchBarContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="상품명을 입력하세요"
                    value={keyword}
                    onChangeText={setKeyword}
                    onSubmitEditing={handleSearch}
                    returnKeyType="search"
                />
                <TouchableOpacity onPress={handleSearch} style={styles.searchIconWrapper}>
                    <Ionicons name="search" size={22} color="#999" />
                </TouchableOpacity>
            </View>

            <View style={styles.container}>
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContentContainer}
                >
                    <CategoryItem
                        text="스킨 케어"
                        onPress={toggleSkinCare}
                        isToggle
                        expanded={skinCareExpanded}
                        style={styles.categoryTitle}
                    />
                    {skinCareExpanded && renderSubCategories(skinCareItems)}

                    <CategoryItem
                        text="선 케어"
                        onPress={toggleSunCare}
                        isToggle
                        expanded={sunCareExpanded}
                        style={styles.categoryTitle}
                    />
                    {sunCareExpanded && renderSubCategories(sunCareItems)}

                    <CategoryItem
                        text="클렌징"
                        onPress={toggleCleanCare}
                        isToggle
                        expanded={cleanCareExpanded}
                        style={styles.categoryTitle}
                    />
                    {cleanCareExpanded && renderSubCategories(cleanCareItems)}
                </ScrollView>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        maxWidth: 520,
        backgroundColor: "#ffffff",
    },
    scrollView: { flex: 1 },
    scrollContentContainer: { paddingVertical: 20 },
    categoryItem: {
        width: "100%",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#e0e0e0",
        backgroundColor: "#fff",
    },
    toggleCategoryItem: {
        justifyContent: "space-between",
    },
    subCategoryItem: {
        paddingLeft: 40,
        backgroundColor: "#f5faff",
        borderLeftWidth: 3,
        borderLeftColor: "#61dafb",
    },
    categoryText: {
        fontSize: 18,
        fontWeight: "500",
        color: "#051929",
        fontFamily: "goorm-sans-medium",
    },
    subCategoryText: {
        fontSize: 16,
        fontWeight: "400",
        color: "#051929",
        fontFamily: "goorm-sans-medium",
    },
    toggleIcon: {
        fontSize: 18,
        color: "#61dafb",
        fontWeight: "700",
    },
    categoryTitle: {
        fontFamily: "goorm-sans-bold",
        fontWeight: "normal",
    },
    searchBarContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#f5f5f5",
        paddingHorizontal: 16,
        paddingVertical: 10,
        margin: 12,
        borderRadius: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
    },
    searchIconWrapper: {
        marginLeft: 10,
    },
});
