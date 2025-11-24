import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
} from "react-native";
import axios from "axios";

export default function JusoSearch({ navigation, route }) {
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 부모로부터 전달받은 콜백 함수
  const onAddressSelected = route.params?.onAddressSelected;

  const confmKey = "devU01TX0FVVEgyMDI1MDgxODEyMTgzOTExNjA3OTg=";

  const searchAddress = async () => {
    if (!keyword.trim()) return;
    setLoading(true);
    setError("");
    setResults([]);

    try {
      const res = await axios.get(
        "https://www.juso.go.kr/addrlink/addrLinkApi.do",
        {
          params: {
            confmKey,       // 인증키
            currentPage: 1, // 현재 페이지
            countPerPage: 10, // 한 페이지 결과 수
            keyword,        // 검색어
            resultType: "json",
          },
        }
      );

      console.log("전체 응답 데이터:\n", JSON.stringify(res.data, null, 2));

      // 행정안전부 API는 res.data.results.juso 배열에 결과 있음
      if (res.data.results && res.data.results.juso) {
        setResults(res.data.results.juso);
      } else {
        setError("검색 결과가 없습니다.");
      }
    } catch (e) {
      console.error("API 호출 에러:", e);
      setError("검색 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const onItemPress = (item) => {
    console.log("선택된 주소 아이템:", item);

    const postalCode = item.zipNo || "";

    if (onAddressSelected) {
      onAddressSelected({
        postalCode,
        address: item.jibunAddr || "",
        roadAddress: item.roadAddr || "",
        title: item.roadAddr || "",
        telephone: "",
      });
    }
    navigation.goBack();
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <TextInput
        placeholder="도로명주소 검색어 입력"
        value={keyword}
        onChangeText={setKeyword}
        style={{ borderWidth: 1, padding: 8, marginBottom: 10 }}
      />
      <Button title="검색" onPress={searchAddress} />
      {loading && <ActivityIndicator size="large" style={{ marginTop: 20 }} />}
      {error ? (
        <Text style={{ color: "red", marginTop: 10 }}>{error}</Text>
      ) : null}

      <FlatList
        data={results}
        keyExtractor={(item, index) => item.zipNo + index.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => onItemPress(item)}
            style={{ paddingVertical: 10, borderBottomWidth: 1 }}
          >
            <Text style={{ fontWeight: "bold" }}>{item.roadAddr}</Text>
            <Text>지번주소: {item.jibunAddr}</Text>
            <Text>우편번호: {item.zipNo}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
