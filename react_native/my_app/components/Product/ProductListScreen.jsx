// ProductList.js
import React, { useState, useEffect, useMemo, useRef } from "react";
import {
    View,
    StyleSheet,
    Text,
    ScrollView,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    Alert,
    Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { getProducts } from "../../utils/api/fastapi";
import Header from "../../Styles/header";

export default function ProductList({ route }) {
    const navigation = useNavigation();
    const scrollRef = useRef(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [currentPage, setCurrentPage] = useState(1);
    const PRODUCTS_PER_PAGE = 10;

    const params = route.params || {};
    const categoryTitle = params.categoryTitle || "모든 상품";
    const initialProducts = params.products || null;
    const searchKeyword = params.searchKeyword || null;

    const headerTitle = searchKeyword
        ? `검색 결과: "${searchKeyword}"`
        : categoryTitle;
    useEffect(() => {
        const fetchProductsData = async () => {
            console.log("route.params:", route.params);

            setLoading(true);
            setError(null);

            try {
                let allProducts = [];

                if (initialProducts) {
                    // 검색에서 넘어온 결과 처리
                    if (initialProducts.length > 0) {
                        allProducts = initialProducts;
                    } else {
                        setProducts([]);
                        setError("검색 결과가 없습니다.");
                        setLoading(false);
                        setCurrentPage(1);
                        return;
                    }
                } else {
                    // 카테고리별 ALL 처리
                    let categoriesToFetch = [];

                    if (categoryTitle === "스킨케어 ALL") {
                        categoriesToFetch = [
                            "스킨/토너",
                            "에센스/세럼/앰플",
                            "미스트",
                            "크림",
                            "로션",
                            "오일",
                            "아이크림",
                            "마스크/팩",
                        ];
                    } else if (categoryTitle === "선케어 ALL") {
                        categoriesToFetch = [
                            "선크림",
                            "선스틱",
                            "선쿠션",
                            "수딩/애프터선",
                        ];
                    } else if (categoryTitle === "클렌징 ALL") {
                        categoriesToFetch = [
                            "밤/오일/크림",
                            "워터",
                            "폼/젤",
                            "티슈",
                            "립/아이리무버",
                            "스크럽/필링",
                        ];
                    } else {
                        categoriesToFetch = [categoryTitle];
                    }

                    // 각 카테고리별 API 요청
                    for (const cat of categoriesToFetch) {
                        const res = await getProducts([cat]);
                        if (res?.data && res.data.length > 0) {
                            allProducts = allProducts.concat(res.data);
                        }
                    }

                    if (allProducts.length === 0) {
                        setProducts([]);
                        setError("검색 결과가 없습니다.");
                        setLoading(false);
                        setCurrentPage(1);
                        return;
                    }
                }

                // 공통: UI용 필드명 변환
                const formattedProducts = allProducts.map((product, idx) => ({
                    __key: product.id ? `${product.id}_${idx}` : `init_${idx}`,
                    id: product.id || `product_${idx}`,
                    name: product.product_name,
                    description: product.product_description,
                    image:
                        product.product_image ||
                        "https://via.placeholder.com/150",
                    brandLink: product.product_link || null,
                    brand: product.product_brand || "브랜드 없음",
                }));

                console.log("formattedProducts:", formattedProducts);

                setProducts(formattedProducts);
                setCurrentPage(1);
            } catch (err) {
                console.error("상품 가져오기 실패:", err);
                setError("상품을 불러오는 중 네트워크 오류가 발생했습니다.");
                Alert.alert(
                    "오류",
                    "상품 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchProductsData();
    }, [categoryTitle, initialProducts]);

    const totalPages = useMemo(
        () => Math.ceil(products.length / PRODUCTS_PER_PAGE),
        [products.length]
    );

    const currentProducts = useMemo(() => {
        const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
        const slice = products.slice(
            startIndex,
            startIndex + PRODUCTS_PER_PAGE
        );

        return slice;
    }, [products, currentPage]);

    const renderPaginationButtons = () => {
        const pages = [];
        const maxPageButtons = 5;

        let startPage = Math.max(
            1,
            currentPage - Math.floor(maxPageButtons / 2)
        );
        let endPage = Math.min(totalPages, startPage + maxPageButtons - 1);

        if (endPage - startPage + 1 < maxPageButtons) {
            startPage = Math.max(1, endPage - maxPageButtons + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(
                <TouchableOpacity
                    key={`page_${i}`}
                    style={[
                        styles.pageButton,
                        currentPage === i && styles.activePageButton,
                    ]}
                    onPress={() => {
                        setCurrentPage(i);
                        scrollRef.current?.scrollTo({ y: 0, animated: false });
                    }}
                >
                    <Text
                        style={[
                            styles.pageText,
                            currentPage === i && styles.activePageText,
                        ]}
                    >
                        {i}
                    </Text>
                </TouchableOpacity>
            );
        }

        return (
            <View style={styles.paginationContainer}>
                {currentPage > 1 && (
                    <TouchableOpacity
                        style={styles.pageButton}
                        onPress={() => setCurrentPage((prev) => prev - 1)}
                    >
                        <Ionicons
                            name="chevron-back"
                            size={16}
                            color="#051929"
                        />
                    </TouchableOpacity>
                )}
                {pages}
                {currentPage < totalPages && (
                    <TouchableOpacity
                        style={styles.pageButton}
                        onPress={() => setCurrentPage((prev) => prev + 1)}
                    >
                        <Ionicons
                            name="chevron-forward"
                            size={16}
                            color="#051929"
                        />
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <ScrollView
                ref={scrollRef}
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
            >
                <Header
                    title={headerTitle}
                    onBackPress={() => navigation.goBack()}
                />
                <View style={styles.productGrid}>
                    {/* 🔹 디버깅용 */}
                    {console.log("currentProducts in render:", currentProducts)}

                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator
                                size="large"
                                color={DesignTokens.color.primary}
                            />
                            <Text style={styles.loadingText}>
                                상품을 불러오는 중...
                            </Text>
                        </View>
                    ) : error ? (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>{error}</Text>
                        </View>
                    ) : currentProducts.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>
                                현재 페이지에 상품이 없습니다.
                            </Text>
                        </View>
                    ) : (
                        currentProducts.map((product) => (
                            <TouchableOpacity
                                key={product.__key}
                                style={styles.productCard}
                                onPress={() => {
                                    product.brandLink
                                        ? Linking.openURL(product.brandLink)
                                        : Alert.alert(
                                              "알림",
                                              "브랜드 링크가 없습니다."
                                          );
                                }}
                            >
                                <View style={styles.productImageContainer}>
                                    <Image
                                        source={{ uri: product.image }}
                                        style={styles.productImage}
                                        resizeMode="cover"
                                    />
                                </View>
                                <View style={styles.productDetailsContainer}>
                                    <Text style={styles.brandName}>
                                        {product.brand}
                                    </Text>
                                    <Text style={styles.productName}>
                                        {product.name}
                                    </Text>
                                    <Text
                                        style={styles.productDescription}
                                        numberOfLines={3}
                                    >
                                        {product.description}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        ))
                    )}
                </View>
                {!loading &&
                    !error &&
                    products.length > PRODUCTS_PER_PAGE &&
                    renderPaginationButtons()}
            </ScrollView>
        </View>
    );
}

// --- Design Tokens & Styles ---
const DesignTokens = {
    color: {
        primary: "#61dafb",
        secondary: "#f5f7fa",
        background: "#ffffff",
        textPrimary: "#051929",
        textSecondary: "#676767",
        border: "#e0e0e0",
        icon: "#051929",
        favoriteActive: "#ff4757",
        ratingStar: "#FF6B00",
        placeholder: "#D9D9D9",
        black: "#000",
        white: "#fff",
    },
    spacing: {
        xSmall: 4,
        small: 8,
        medium: 12,
        large: 16,
        xLarge: 20,
        xxLarge: 30,
    },
    fontSize: {
        xxSmall: 12,
        xSmall: 13,
        small: 16,
        medium: 22,
        large: 24,
    },
    fontWeight: {
        regular: "400",
        medium: "500",
        semiBold: "700",
        bold: "900",
    },
    borderRadius: {
        small: 12,
        medium: 32.5,
        pagination: 6,
    },
    borderWidth: {
        thin: 0.5,
        medium: 1,
    },
};

const styles = StyleSheet.create({
    productGrid: {
        flexDirection: "row", // 가로 정렬로 변경
        flexWrap: "wrap", // 여러 줄로 감싸기 허용
        justifyContent: "space-between", // 아이템 간 균등한 간격 설정
        paddingHorizontal: DesignTokens.spacing.medium,
    },
    container: { flex: 1, backgroundColor: DesignTokens.color.background },
    scrollView: { flex: 1 },
    productCard: {
        width: "100%",
        marginBottom: DesignTokens.spacing.xxLarge,
        backgroundColor: DesignTokens.color.white,
        padding: DesignTokens.spacing.small,
        shadowColor: DesignTokens.color.black,
        shadowOffset: { height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
        elevation: 3,
        flexDirection: "row",
        alignItems: "center",
    },
    productImageContainer: {
        width: 100,
        height: 100,
        borderRadius: DesignTokens.borderRadius.small,
        overflow: "hidden",
        marginRight: DesignTokens.spacing.medium,
    },
    productImage: { width: "100%", height: "100%" },
    productDetailsContainer: {
        flex: 1,
        justifyContent: "flex-start",
        flexDirection: "column",
    },
    brandName: {
        fontSize: DesignTokens.fontSize.xSmall,
        color: DesignTokens.color.textSecondary,
        marginBottom: DesignTokens.spacing.small,
    },
    productName: {
        fontSize: DesignTokens.fontSize.small,
        color: DesignTokens.color.textPrimary,
        fontWeight: DesignTokens.fontWeight.semiBold,
        marginBottom: 0,
    },
    productDescription: {
        fontSize: DesignTokens.fontSize.xxSmall,
        color: DesignTokens.color.textSecondary,
        lineHeight: 18,
        marginTop: 0,
    },
    loadingContainer: {
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: DesignTokens.spacing.xxLarge,
    },
    loadingText: {
        fontSize: DesignTokens.fontSize.small,
        color: DesignTokens.color.textSecondary,
        marginTop: 10,
    },
    emptyContainer: {
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: DesignTokens.spacing.xxLarge,
    },
    emptyText: {
        fontSize: DesignTokens.fontSize.small,
        color: DesignTokens.color.textSecondary,
        marginTop: DesignTokens.spacing.medium,
    },
    paginationContainer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginTop: DesignTokens.spacing.medium,
        marginBottom: DesignTokens.spacing.large,
        paddingBottom: 10,
    },
    pageButton: {
        paddingHorizontal: DesignTokens.spacing.medium,
        paddingVertical: DesignTokens.spacing.small,
        marginHorizontal: 4,
        borderRadius: DesignTokens.borderRadius.pagination,
        borderWidth: DesignTokens.borderWidth.thin,
        borderColor: DesignTokens.color.border,
        minWidth: 36,
        alignItems: "center",
        justifyContent: "center",
    },
    activePageButton: {
        backgroundColor: DesignTokens.color.primary,
        borderColor: DesignTokens.color.primary,
    },
    pageText: {
        fontSize: DesignTokens.fontSize.small,
        color: DesignTokens.color.textPrimary,
        fontWeight: DesignTokens.fontWeight.regular,
    },
    activePageText: {
        color: DesignTokens.color.white,
        fontWeight: DesignTokens.fontWeight.semiBold,
    },
});
