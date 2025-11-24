// apis/photo.js
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect } from "react";
import { Alert } from "react-native";

const BASE_URL = "http://20.81.185.103:8000";
// 정규식 조건
const USER_ID_REGEX = /^[A-Za-z0-9]{4,20}$/;
const PASSWORD_REGEX =
  /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%])[A-Za-z\d!@#$%]{8,20}$/;
const PHONE_REGEX = /^\d{11}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// 사진 업로드
export const uploadPhoto = async (uri, date) => {
  const userKey = await AsyncStorage.getItem("user_key");

  const formData = new FormData();
  formData.append("user_key", userKey);
  formData.append("photo", { uri, name: "photo.jpg", type: "image/jpeg" });
  formData.append("date", date);

  return axios.post(`${BASE_URL}/upload/`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    withCredentials: true,
  });
};

export const uploadSurvey = async (surveyScores, skin_combination_type) => {
  try {
    const userKey = await AsyncStorage.getItem("user_key");

    if (!userKey) {
      throw new Error("유저키가 없습니다. 로그인 상태를 확인해주세요.");
    }

    const formData = new FormData();
    formData.append("user_key", userKey);
    formData.append("skin_do", surveyScores[0]);
    formData.append("skin_sr", surveyScores[1]);
    formData.append("skin_pn", surveyScores[2]);
    formData.append("skin_wt", surveyScores[3]);
    formData.append(
      "skin_combination_type",
      skin_combination_type ? "true" : "false"
    );

    console.log("[uploadSurvey] 보낼 데이터:", formData);

    return axios.post(`${BASE_URL}/survey/`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
      withCredentials: true,
    });
  } catch (error) {
    console.error("[uploadSurvey] 업로드 실패:", error);
    throw error;
  }
};

// 저장된 스킨타입 불러오기
export const getSkinType = async () => {
  const userKey = await AsyncStorage.getItem("user_key");
  const formData = new FormData();
  formData.append("user_key", userKey);
  return axios.post(`${BASE_URL}/skin.type/`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    withCredentials: true,
  });
};

// 특정 날짜의 사진 가져오기
export const getPhotoByDate = async (date) => {
  const userKey = await AsyncStorage.getItem("user_key");
  const formData = new FormData();
  formData.append("date", date);
  formData.append("user_key", userKey);

  return axios.post(`${BASE_URL}/get.data/`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    withCredentials: true,
  });
};

// 저장된 날짜 리스트 불러오기
export const getDateList = async () => {
  const userKey = await AsyncStorage.getItem("user_key");
  const formData = new FormData();
  formData.append("user_key", userKey);
  return axios.post(`${BASE_URL}/dates/`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    withCredentials: true,
  });
};

// 특정 날짜, 특정 유저의 여드름 정보 가져오기
export const getAcneInfo = async (date) => {
  const userKey = await AsyncStorage.getItem("user_key");
  const formData = new FormData();
  formData.append("user_key", userKey);
  formData.append("date", date);

  return axios.post(`${BASE_URL}/get.acne/`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    withCredentials: true,
  });
};

export const getAcneDates = async () => {
  const userKey = await AsyncStorage.getItem("user_key");
  const formData = new FormData();
  formData.append("user_key", userKey);
  return axios.post(`${BASE_URL}/get.dates_acne/`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    withCredentials: true,
  });
};

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 로그인
export async function login(userId, password) {
  console.log("[login] 호출됨");
  console.log("입력값:", { user_id: userId, user_password: password });

  try {
    const response = await axios.post(`${BASE_URL}/login/`, {
      user_id: userId,
      user_password: password,
    });

    console.log("[login] 응답:", response.data);

    if (response.status === 200) {
      const json = response.data;
      console.log("[login] 로그인 성공, user_key:", json.user_key);

      // ✅ AsyncStorage에 'user_key'로 토큰을 저장합니다.
      await AsyncStorage.setItem("user_key", json.user_key);
      return {
        success: true,
        userKey: json.user_key,
        hasSurvey: json.hasSurvey
      };
    } else {
      console.warn("[login] 예상치 못한 응답 코드:", response.status);
      return { success: false };
    }
  } catch (error) {
    console.error("[login] 에러 발생:", error);

    if (error.response) {
      console.error("[login] 서버 응답 데이터:", error.response.data);
      console.error("[login] 상태 코드:", error.response.status);
    } else if (error.request) {
      console.error("[login] 요청은 되었지만 응답 없음:", error.request);
    } else {
      console.error("[login] 요청 설정 중 오류:", error.message);
    }

    return { success: false, error };
  }
}

// ✅ 저장된 user_key 확인 후 자동 로그인 여부 반환
export async function checkAutoLogin() {
  try {
    const userKey = await AsyncStorage.getItem("user_key");
    if (userKey) {
      console.log("[checkAutoLogin] 자동 로그인 가능, user_key:", userKey);
      return { success: true, userKey };
    } else {
      console.log("[checkAutoLogin] user_key 없음 → 로그인 필요");
      return { success: false };
    }
  } catch (error) {
    console.error("[checkAutoLogin] 오류 발생:", error);
    return { success: false, error };
  }
}

// 아이디 중복 확인
export const checkIdAvailability = async (userId, setValidationState, updateFormData) => {
  console.log("[checkIdAvailability] 호출됨, userId:", userId);

  if (!userId.trim()) {
    Alert.alert("오류", "아이디를 입력해주세요.");
    return false;
  }

  try {
    console.log("[checkIdAvailability] axios 요청 시작");
    const response = await axios.post(
      `${BASE_URL}/checkId/`,
      {
        user_id: userId,
      }
    );
    console.log("[checkIdAvailability] axios 요청 완료");

    const data = response.data;
    console.log("[checkIdAvailability] 서버 응답:", data);

    setValidationState((prev) => ({
      ...prev,
      isIdChecked: true,
      isIdAvailable: data.available,
    }));

    Alert.alert(
      "아이디 중복 확인",
      data.available
        ? "사용 가능한 아이디입니다."
        : "이미 사용 중인 아이디입니다."
    );

    // 이미 사용 중이면 input 초기화
    if (!data.available && updateFormData) {
      updateFormData("userId", "");
    }

    return data.available;
  } catch (error) {
    console.error("[checkIdAvailability] 오류 발생:", error.message);
    Alert.alert("오류", error.message);
    return false;
  }
};

// 비밀번호 일치 여부 확인
export const checkPasswordsMatch = (password, passwordConfirm) => {
  console.log(
    "[checkPasswordsMatch] 호출됨, password:",
    password,
    "passwordConfirm:",
    passwordConfirm
  );
  return password === passwordConfirm;
};

// 전화번호 일치 검색
// signupFunctions.js
export const checkPhoneAvailability = async (
  phoneNumber,
  setValidationState
) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/checkPhonenumber/`,
      {
        phone_number: phoneNumber,
      }
    );
    if (response.data.available) {
      setValidationState((prev) => ({
        ...prev,
        isPhoneAvailable: true,
        isPhoneChecked: true,
      }));
      Alert.alert("사용 가능", "사용 가능한 전화번호입니다.");
    } else {
      setValidationState((prev) => ({
        ...prev,
        isPhoneAvailable: false,
        isPhoneChecked: true,
      }));
      Alert.alert("중복", "이미 등록된 전화번호입니다.");
    }
  } catch (error) {
    console.error("전화번호 중복 확인 오류", error);
    Alert.alert("오류", "전화번호 중복 확인에 실패했습니다.");
  }
};

// 전체 폼 유효성 검사
export const isFormValid = (formData, validationState) => {
  console.log(
    "[isFormValid] 호출됨, formData:",
    formData,
    "validationState:",
    validationState
  );

  const userIdValid = USER_ID_REGEX.test(formData.userId);
  if (!userIdValid) console.log("[isFormValid] userId 형식 오류");

  if (!validationState.isIdChecked)
    console.log("[isFormValid] 아이디 중복 확인 안됨");
  if (!validationState.isIdAvailable)
    console.log("[isFormValid] 아이디 사용 불가");

  const passwordValid = PASSWORD_REGEX.test(formData.password);
  if (!passwordValid) console.log("[isFormValid] 비밀번호 형식 오류");

  if (!formData.passwordConfirm)
    console.log("[isFormValid] 비밀번호 확인 입력 안됨");

  if (!validationState.passwordsMatch)
    console.log("[isFormValid] 비밀번호 불일치");

  const phoneValid = PHONE_REGEX.test(formData.phoneNumber);
  if (!phoneValid) console.log("[isFormValid] 전화번호 형식 오류");

  if (!validationState.isPhoneChecked)
    console.log("[isFormValid] 전화번호 중복 확인 안됨");
  if (!validationState.isPhoneAvailable)
    console.log("[isFormValid] 전화번호 이미 등록됨");

  if (!formData.gender) console.log("[isFormValid] 성별 입력 안됨");
  if (!formData.postalCode) console.log("[isFormValid] 우편번호 입력 안됨");
  if (!formData.address1) console.log("[isFormValid] 주소 입력 안됨");

  // const birthValid = BIRTHDATE_REGEX.test(formData.birthdate);
  // if (!birthValid) console.log("[isFormValid] 생년월일 형식 오류");

  const emailValid =
    formData.email === "" || EMAIL_REGEX.test(formData.email);
  if (!emailValid) console.log("[isFormValid] 이메일 형식 오류");

  const valid =
    userIdValid &&
    validationState.isIdChecked &&
    validationState.isIdAvailable &&
    passwordValid &&
    formData.passwordConfirm &&
    validationState.passwordsMatch &&
    phoneValid &&
    validationState.isPhoneChecked && // ✅ 추가
    validationState.isPhoneAvailable && // ✅ 추가
    formData.gender &&
    formData.postalCode &&
    formData.address1 &&
    emailValid;

  console.log("[isFormValid] 결과:", valid);

  return valid;
};

// 회원가입 데이터 서버 전송
export const submitSignupForm = async (formData) => {
  console.log("[submitSignupForm] 호출됨, formData:", formData);
  try {
    const response = await axios.post(
      `${BASE_URL}/signup/`,
      formData
    );
    console.log("[submitSignupForm] 서버 응답:", response.data);
    return response.data;
  } catch (error) {
    console.log("[submitSignupForm] 오류 발생:", error.message);
    throw error;
  }
};

// 주소 검색 네비게이션 함수
export const searchPostalCode = (navigation, onAddressSelected) => {
  console.log("[searchPostalCode] 호출됨");
  navigation.navigate("PostcodeSearch", {
    onAddressSelected,
  });
};

// 이메일 중복확인 버튼 클릭시 유효성 검사
export const checkEmailAvailability = async (email, setValidationState) => {
  console.log("[checkEmailAvailability] 호출됨, email:", email);

  if (!email.trim()) {
    Alert.alert("오류", "이메일을 입력해주세요.");
    return false;
  }

  try {
    const response = await axios.post(
      `${BASE_URL}/checkEmail/`,
      {
        user_email: email,
      }
    );

    console.log("[checkEmailAvailability] 서버 응답:", response.data);

    setValidationState((prev) => ({
      ...prev,
      isEmailChecked: true,
      isEmailAvailable: response.data.available,
    }));

    Alert.alert(
      "이메일 중복 확인",
      response.data.available
        ? "사용 가능한 이메일입니다."
        : "이미 등록된 이메일입니다."
    );

    return response.data.available;
  } catch (error) {
    console.log("[checkEmailAvailability] 오류 발생:", error.message);
    Alert.alert("오류", error.message);
    return false;
  }
};

// Helper Functions
export function formatPhoneNumber(number) {
  if (!number || number.length !== 11) return number;
  return `${number.slice(0, 3)}-${number.slice(3, 7)}-${number.slice(7)}`;
}

// API Call Functions
export const handleAddressSave = async (userInfo) => {
  if (!userInfo.postalCode || !userInfo.address1) {
    Alert.alert(
      "주소 입력 오류",
      "우편번호와 기본 주소는 필수 입력 항목입니다."
    );
    return false;
  }
  const fullAddress = `(${userInfo.postalCode}) ${userInfo.address1} ${userInfo.address2 || ""
    }`.trim();
  const dataToSend = {
    user_id: userInfo.user_id,
    user_address: fullAddress,
  };
  try {
    await axios.post(`${BASE_URL}/user/updateAddress/`, dataToSend, {
      headers: { "Content-Type": "application/json" },
    });
    Alert.alert("주소 저장 성공", "주소 정보가 성공적으로 저장되었습니다.");
    return true;
  } catch (error) {
    console.error("주소 저장 오류:", error.response || error);
    Alert.alert(
      "주소 저장 실패",
      error.response?.data?.message || "서버와 연결할 수 없습니다."
    );
    return false;
  }
};

import baumannDescriptions from "../../components/Description/baumannDescriptions.json";
console.log('불러온 바우만 타입:', Object.keys(baumannDescriptions));

// Constants
export const skinConcernsList = [
  "트러블",
  "잡티",
  "미백",
  "주름/탄력",
  "수분부족지성",
  "아토피",
  "다크서클",
  "홍조",
  "각질",
  "피지/블랙헤드",
];

export const baumannTypes = Object.keys(baumannDescriptions);
export const colorMap = [
  "#C469A7", "#F499C1", "#F06788", "#F3B5A8",
  "#F6976E", "#FDD6B8", "#FCB95C", "#FFE3A4",
  "#B5D335", "#CCE39D", "#83C15C", "#9FD6BC",
  "#46A5C4", "#9EC1E5", "#4D7FB9", "#B3A8D2",
];

// UI에 표시될 필드 순서와 레이블
export const displayOrder = [
  "user_id",
  "user_password",
  "user_phone_number",
  "user_birth",
  "user_gender",
  "user_email",
  "user_address",
];

export const labels = {
  user_id: "아이디",
  user_password: "비밀번호",
  user_phone_number: "전화번호",
  user_birth: "생년월일",
  user_gender: "성별",
  user_email: "이메일",
  user_address: "주소",
};

function parseAddress(userAddress) {
  if (!userAddress || typeof userAddress !== 'string') {
    return { postalCode: '', address1: '', address2: '' };
  }

  const addressParts = userAddress.trim().split(" ");

  if (addressParts.length < 2) {
    return { postalCode: '', address1: userAddress, address2: '' };
  }

  const postalCode = addressParts[0];
  const detailedAddress = addressParts.slice(1).join(" ");

  // 괄호로 상세 주소 분리
  const match = detailedAddress.match(/^(.*?)\s*\((.*?)\)$/);

  if (match) {
    return {
      postalCode: postalCode,
      address1: match[1].trim(),
      address2: match[2].trim()
    };
  } else {
    // 괄호가 없을 경우의 처리
    const lastPart = addressParts[addressParts.length - 1];
    // 마지막 부분이 숫자나 특정 문자열이면 상세주소로 추정
    if (/\d|호$|층$/.test(lastPart)) {
      return {
        postalCode: postalCode,
        address1: addressParts.slice(1, -1).join(" "),
        address2: lastPart
      };
    } else {
      return {
        postalCode: postalCode,
        address1: detailedAddress,
        address2: ''
      };
    }
  }
}

/**
 * 마이페이지에 필요한 모든 데이터를 한 번의 호출로 가져옵니다.
 * 사용자 정보와 설문조사 결과를 병렬로 가져와 성능을 최적화합니다.
 * @returns {Promise<{success: boolean, data?: object, error?: string}>} - 결과 객체.
 */
export async function fetchMyPageData() {
  try {
    const userKey = await AsyncStorage.getItem("user_key");
    if (!userKey) {
      console.error("사용자 키를 찾을 수 없습니다.");
      return { success: false, error: "사용자 키를 찾을 수 없습니다." };
    }

    // 사용자 정보와 설문조사 결과를 병렬로 호출
    const [userResponse, surveyResponse] = await Promise.all([
      axios.post(`${BASE_URL}/getUserInfo/`, { user_key: userKey }).catch(e => {
        console.error("사용자 정보 로딩 오류:", e);
        return { data: null };
      }),
      axios.post(`${BASE_URL}/showSurveyResult/`, { user_key: userKey }).catch(e => {
        // 설문조사 결과가 없을 경우 404 에러는 정상적인 상황으로 간주
        if (e.response?.status === 404) {
          return { data: null };
        }
        console.error("설문조사 결과 로딩 오류:", e);
        throw e; // 다른 종류의 에러는 다시 던집니다.
      })
    ]);

    const userData = userResponse.data;
    const surveyData = surveyResponse.data;

    if (!userData) {
      console.error("사용자 정보를 불러올 수 없습니다.");
      return { success: false, error: "사용자 정보를 불러올 수 없습니다." };
    }

    // ✅ surveyData 전체를 병합 (원래 코드 방식)
    const combinedData = {
      ...userData,
      ...(surveyData || {
        survey_skin_type: null,
        survey_skin_combination_type: null,
      }),
    };

    // 주소 파싱 및 데이터에 추가
    const parsedAddress = parseAddress(combinedData.user_address);
    Object.assign(combinedData, parsedAddress);

    return { success: true, data: combinedData };
  } catch (error) {
    console.error("[fetchMyPageData] 예상치 못한 에러:", error);
    Alert.alert("오류", "데이터를 불러오는 중 문제가 발생했습니다.");
    return { success: false, error: "데이터 로딩 실패" };
  }
}


/**
 * 변경된 사용자 정보를 API로 전송하여 저장합니다.
 * @param {object} userInfo - 현재 사용자 정보.
 * @param {object} originalUserInfo - 원본 사용자 정보.
 * @param {Function} setIsEditingUserInfo - 편집 모드 상태 변경 함수.
 * @param {Function} setOriginalUserInfo - 원본 사용자 정보 상태 변경 함수.
 * @returns {Promise<boolean>} - 저장 성공 여부.
 */
export async function handleSaveUserInfo(
  userInfo,
  originalUserInfo,
  setIsEditingUserInfo,
  setOriginalUserInfo
) {
  const changes = {};

  // 변경된 필드만 추출
  if (userInfo.user_password && userInfo.user_password !== originalUserInfo.user_password) {
    changes.new_password = userInfo.user_password;
  }
  if (userInfo.user_email !== originalUserInfo.user_email) {
    changes.new_email = userInfo.user_email;
  }
  if (
    userInfo.postalCode !== originalUserInfo.postalCode ||
    userInfo.address1 !== originalUserInfo.address1 ||
    userInfo.address2 !== originalUserInfo.address2
  ) {
    changes.new_address = `${userInfo.postalCode} ${userInfo.address1} ${userInfo.address2}`.trim();
  }

  // 변경 사항이 없을 경우
  if (Object.keys(changes).length === 0) {
    Alert.alert("알림", "변경된 내용이 없습니다.");
    setIsEditingUserInfo(false);
    return true;
  }

  try {
    const userKey = await AsyncStorage.getItem("user_key");
    if (!userKey) {
      throw new Error("사용자 키를 찾을 수 없습니다.");
    }

    // 비밀번호, 이메일, 주소 업데이트를 위한 단일 API 호출
    await axios.post(`${BASE_URL}/updateUserInfo/`, {
      user_key: userKey,
      ...changes,
    });

    Alert.alert("저장 성공", "회원 정보가 성공적으로 저장되었습니다.");
    setIsEditingUserInfo(false);
    setOriginalUserInfo(userInfo);
    return true;
  } catch (error) {
    console.error("정보 저장 오류:", error.response?.data || error);
    Alert.alert("저장 실패", "정보 저장 중 오류가 발생했습니다.");
    return false;
  }
}

// 특정 타이틀의 제품정보 가져오기
export const getProducts = async (categoryTitles) => {
  const formData = new FormData();

  // categoryTitles가 배열이면 하나씩 append, 문자열이면 그대로 append
  if (Array.isArray(categoryTitles)) {
    categoryTitles.forEach((title) => formData.append("product_type", title));
  } else {
    formData.append("product_type", categoryTitles);
  }

  return axios.post(`${BASE_URL}/get.products/`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    withCredentials: true,
  });
};

export const searchProducts = async (keyword) => {
  const formData = new FormData();
  formData.append("keyword", keyword); 

  try{
    const res = await axios.post(`${BASE_URL}/search.products/`, formData, {
      headers: {"Content-Type" : "multipart/form-data"},
      withCredentials: true,
    });
    return res.data;
  } catch(err){
    console.error("검색 API 오류:", err);
    return [];
  }
}
