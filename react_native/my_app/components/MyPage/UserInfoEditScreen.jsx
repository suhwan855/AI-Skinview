import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { myPageStyles } from "../../Styles/MyPageUpdateStyles.js";
import Icon from "react-native-vector-icons/FontAwesome";
import {
  formatPhoneNumber,
  checkEmailAvailability,
  displayOrder,
  labels,
  searchPostalCode,
  fetchMyPageData,
  handleSaveUserInfo,
} from "../../utils/api/fastapi.js";
import LoadingOverlay from "../../components/Common/LoadingOverlay.jsx";
import { SafeAreaView } from "react-native-safe-area-context";

const editableFields = new Set([
  "user_password",
  "user_email",
  "user_address",
]);

export default function UserInfoEditScreen() {
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [originalUserInfo, setOriginalUserInfo] = useState(null);
  const [validationState, setValidationState] = useState({
    isEmailChecked: false,
    isEmailAvailable: null,
  });

  useEffect(() => {
    loadUserInfo();
  }, []);

  const loadUserInfo = async () => {
    setIsLoading(true);
    try {
      const response = await fetchMyPageData();
      if (response.success) {
        setUserInfo(response.data);
        setOriginalUserInfo(response.data);
      } else {
        Alert.alert("에러", "회원 정보를 불러올 수 없습니다.");
      }
    } catch (error) {
      console.error("회원정보 로딩 오류:", error);
      Alert.alert("에러", "오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setUserInfo(originalUserInfo);
    navigation.goBack();
  };

  const handleSave = async () => {
    await handleSaveUserInfo(
      userInfo,
      originalUserInfo,
      () => { },
      setOriginalUserInfo
    );
    navigation.goBack();
  };

  if (isLoading || !userInfo) return <LoadingOverlay visible={true} />;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <ScrollView
        style={myPageStyles.container}
        contentContainerStyle={myPageStyles.contentContainer}
      >
        <View style={myPageStyles.sectionHeader}>
          <View style={myPageStyles.titleContainer}>
            <View style={myPageStyles.titleHighlight} />
            <Text style={myPageStyles.sectionTitle}>회원정보 수정</Text>
          </View>
        </View>

        {displayOrder.map((key) => (
          <View key={key} style={myPageStyles.infoRow}>
            <View style={myPageStyles.infoRowIcon}>
              {key === "user_id" && (
                <Icon name="at" size={16} color="#78D1E2" style={myPageStyles.infoIcon} />
              )}
              {key === "user_name" && (
                <Icon name="user" size={16} color="#78D1E2" style={myPageStyles.infoIcon} />
              )}
              {key === "user_email" && (
                <Icon name="envelope" size={16} color="#78D1E2" style={myPageStyles.infoIcon} />
              )}
              {key === "user_phone_number" && (
                <Icon name="phone" size={16} color="#78D1E2" style={myPageStyles.infoIcon} />
              )}
              {key === "user_address" && (
                <Icon name="map-marker" size={16} color="#78D1E2" style={myPageStyles.infoIcon} />
              )}
              {key === "user_birth" && (
                <Icon name="calendar" size={16} color="#78D1E2" style={myPageStyles.infoIcon} />
              )}
              {key === "user_gender" && (
                <Icon
                  name={userInfo[key] === "남자" ? "male" : "female"}
                  size={16}
                  color="#78D1E2"
                  style={myPageStyles.infoIcon}
                />
              )}
              {key === "user_password" && (
                <Icon name="lock" size={16} color="#78D1E2" style={myPageStyles.infoIcon} />
              )}
              <Text style={myPageStyles.label}>{labels[key]}</Text>
            </View>

            {editableFields.has(key) ? (
              key === "user_email" ? (
                <View style={myPageStyles.inputGroup}>
                  <View style={myPageStyles.emailInputWrapper}>
                    <TextInput
                      style={myPageStyles.textInput}
                      value={userInfo.user_email}
                      onChangeText={(text) =>
                        setUserInfo({ ...userInfo, user_email: text })
                      }
                      keyboardType="email-address"
                      autoCapitalize="none"
                      placeholder="이메일을 입력하세요"
                    />
                    <TouchableOpacity
                      onPress={async () => {
                        try {
                          const result = await checkEmailAvailability(userInfo.user_email);
                          setValidationState(prev => ({
                            ...prev,
                            isEmailChecked: result.checked,
                            isEmailAvailable: result.available,
                          }));
                          Alert.alert(
                            "이메일 중복 확인",
                            result.available
                              ? "사용 가능한 이메일입니다."
                              : "이미 등록된 이메일입니다."
                          );
                        } catch (error) {
                          console.error("[checkEmailAvailability] 오류:", error);
                          Alert.alert("오류", "이메일 중복 확인 중 오류가 발생했습니다.");
                        }
                      }}
                      style={myPageStyles.emailCheckButton}
                    >
                      <Text style={myPageStyles.emailCheckButtonText}>중복검사</Text>
                    </TouchableOpacity>

                  </View>
                  {validationState.isEmailChecked && (
                    <Text style={{ color: validationState.isEmailAvailable ? "green" : "red" }}>
                      {validationState.isEmailAvailable
                        ? "사용 가능한 이메일입니다."
                        : "이미 사용 중인 이메일입니다."}
                    </Text>
                  )}
                </View>
              ) : key === "user_address" ? (
                <View style={myPageStyles.addressInputGroup}>
                  <View style={myPageStyles.postalCodeWrapper}>
                    <TextInput
                      style={myPageStyles.postalCodeInput}
                      placeholder="우편번호"
                      value={userInfo.postalCode}
                      editable={false}
                    />
                    <TouchableOpacity
                      style={myPageStyles.addressSearchButton}
                      onPress={() =>
                        searchPostalCode(navigation, (addr) =>
                          setUserInfo((prev) => ({
                            ...prev,
                            postalCode: addr.zonecode,
                            address1: addr.address,
                          }))
                        )
                      }
                    >
                      <Text style={myPageStyles.addressSearchButtonText}>주소 검색</Text>
                    </TouchableOpacity>
                  </View>
                  <TextInput
                    style={myPageStyles.addressInputDisabled}
                    placeholder="기본 주소"
                    value={userInfo.address1}
                    editable={false}
                  />
                  <TextInput
                    style={myPageStyles.addressInput}
                    placeholder="상세 주소 입력"
                    value={userInfo.address2}
                    onChangeText={(text) =>
                      setUserInfo((prev) => ({ ...prev, address2: text }))
                    }
                  />
                </View>
              ) : (
                <TextInput
                  style={myPageStyles.textInput}
                  value={userInfo[key]}
                  onChangeText={(text) => setUserInfo({ ...userInfo, [key]: text })}
                  secureTextEntry={key === "user_password"}
                  placeholder={key === "user_password" ? "비밀번호를 입력하세요" : ""}
                />
              )
            ) : (
              <Text style={myPageStyles.infoText}>
                {key === "user_password"
                  ? userInfo[key]
                    ? "••••••••"
                    : ""
                  : key === "user_phone_number"
                    ? formatPhoneNumber(userInfo[key])
                    : userInfo[key]}
              </Text>
            )}
          </View>
        ))}

        <View style={myPageStyles.buttonGroup}>
          <TouchableOpacity style={myPageStyles.primaryButton} onPress={handleSave}>
            <Text style={myPageStyles.primaryButtonText}>저장하기</Text>
          </TouchableOpacity>
          <TouchableOpacity style={myPageStyles.secondaryButton} onPress={handleCancel}>
            <Text style={myPageStyles.secondaryButtonText}>취소</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
