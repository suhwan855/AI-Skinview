import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Dimensions, Platform, TouchableOpacity, Linking, ActivityIndicator } from "react-native";
import axios from 'axios';
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { styles as mainStyles } from "../Home/MainPage";

const ProductCard = ({ productImageUrl, productName, productDescription, productLink }) => (
  <TouchableOpacity
    style={styles.card_container}
    onPress={() => productLink && Linking.openURL(productLink)}
  >
    <Image source={{ uri: productImageUrl }} style={styles.productImage} />
    <Text numberOfLines={1} ellipsizeMode="tail" style={styles.productName}>{productName}</Text>
    <Text numberOfLines={1} ellipsizeMode="tail" style={styles.productDescription}>{productDescription}</Text>
  </TouchableOpacity>
);
const MAX_VISIBLE = 5;
const { width: screenWidth } = Dimensions.get("window");

const ProductListSection = ({ type }) => {
  const navigation = useNavigation(); // <- 여기서 navigation 가져오기
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const formData = new FormData();
    formData.append("product_type", type); // <-- type 값 바로 전송

    axios
      .post("http://20.81.185.103:8000/get.products/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((response) => setProducts(response.data))
      .catch((error) => console.error("Error fetching products:", error));
  }, [type]);
  const visibleProducts = products.slice(0, MAX_VISIBLE);
  // ✅ onMorePress 정의
  const onMorePress = () => {
    try {
      console.log("선택한 카테고리:", type);
      navigation.navigate("ProductList", { categoryTitle: type });
    } catch (err) {
      console.error("카테고리 이동 실패:", err);
      navigation.navigate("MainPage");
    }
  };
  return (
    <View style={styles.list_container}>
      <ScrollView
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollView}
      >
        {visibleProducts.map((product, index) => (
          <ProductCard
            key={index}
            productImageUrl={product.product_image}
            productName={product.product_name}
            productDescription={product.product_description}
            productLink={product.product_link}
          />
        ))}
        {products.length > MAX_VISIBLE && (
          <TouchableOpacity
            style={[styles.card_container, styles.moreCard]}
            onPress={onMorePress} // 전체 상품 페이지로 이동
          >
            <View style={styles.moreContent}>
              <Text style={styles.plus}>+</Text>
              <Text style={styles.moreText}>더보기</Text>
            </View>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
};

// --- [추가] 개인 맞춤형 제품 추천을 위한 새로운 컴포넌트 ---
export const PersonalizedProductsSection = () => {
  const [userName, setUserName] = useState("고객");
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPersonalizedData = async () => {
      setIsLoading(true);
      try {
        const userKey = await AsyncStorage.getItem("user_key");
        if (!userKey) {
          console.log("로그인 정보 없음. 맞춤 추천을 생략합니다.");
          return;
        }

        const formData = new FormData();
        formData.append("user_key", userKey);

        const response = await axios.post("http://20.81.185.103:8000/get.advanced_recommendations/", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        if (response.data && response.data.recommendations) {
          setUserName(response.data.user_id || "고객");
          setProducts(response.data.recommendations);
        }
      } catch (error) {
        console.error("Error fetching personalized products:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPersonalizedData();
  }, []);

  if (isLoading) {
    return <ActivityIndicator size="large" style={{ marginVertical: 20 }} />;
  }

  if (!products || products.length === 0) {
    return null; // 추천 상품이 없으면 섹션 전체를 숨김
  }

  return (
    <>
      <View style={mainStyles.mySectionCard}>
        <View style={mainStyles.sectionHeader}>
          <Text style={mainStyles.sectionTitle}>
            <Text style={mainStyles.highlightText}>{userName}</Text>님의
            개인 맞춤형 제품
          </Text>
        </View>
        <View style={styles.list_container}>
          <ScrollView
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            style={styles.scrollView}
          >
            {products.map((product, index) => (
              <ProductCard
                key={index}
                productImageUrl={product.product_image}
                productName={product.product_name}
                productDescription={product.product_description}
                productLink={product.product_link}
              />
            ))}
          </ScrollView>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  list_container: {
    paddingTop: 0,
    paddingRight: Platform.OS === "ios" ? 0 : 17,
    paddingBottom: 0,
    paddingLeft: 0,
    marginBottom: 20,
  },
  scrollView: {
    minWidth: "100%",
    paddingLeft: 17,
  },
  scrollContent: {
    alignItems: "flex-start",
    gap: 20,
    minWidth: 580,
    paddingRight: 17

  },
  card_container: {
    width: screenWidth * 0.45, // 화면 너비의 45%
    // ✅ OS에 따라 aspectRatio를 다르게 설정
    aspectRatio: Platform.OS === "ios" ? 0.7 : 0.7, // iOS는 0.9, Android는 0.8
    position: "relative",
    flexShrink: 0,
  },
  productImage: {
    width: screenWidth * 0.45,
    aspectRatio: 1,
    borderRadius: 15,
    backgroundColor: "#E1F5FE",
  },
  productName: {
    width: screenWidth * 0.45, // 화면 너비의 45%
    marginLeft: 5,
    aspectRatio: 0.8, // 너비 대비 높이 비율 (0.9 = 높이가 너비의 90%)
    color: "#000",
    position: "absolute",
    top: Platform.OS === "ios" ? 190 : 203, // iOS는 0.9, Android는 0.8,
    fontSize: 16,
    fontFamily: "goorm-sans-medium",
  },
  productDescription: {
    width: screenWidth * 0.43, // 화면 너비의 45%
    marginLeft: 5,
    aspectRatio: 0.8, // 너비 대비 높이 비율 (0.9 = 높이가 너비의 90%)
    color: "#000000aa",
    position: "absolute",
    top: Platform.OS === "ios" ? 215 : 233,
    fontSize: 13,
    fontFamily: "goorm-sans-regular",
  },
  moreCard: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5", // 연한 회색
    borderRadius: 15,
    width: screenWidth * 0.45,
    aspectRatio: 0.7,
    flexShrink: 0,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  moreContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  plus: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#61dafb",
    marginBottom: 5,
  },
  moreText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#61dafb",
  },
});

export default ProductListSection;