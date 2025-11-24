import { login } from "../utils/api/fastapi.js";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CommonActions } from '@react-navigation/native';


export const handleLogin = async (email, password, isAutoLogin, authLogin, navigation) => {
  console.log("[handleLogin] 로그인 버튼 클릭됨");
  const result = await login(email, password);

  if (result.success) {
    console.log("[handleLogin] 로그인 성공 -> AuthContext 상태 업데이트");
    console.log('유저키가 뭘까요??', result.userKey);
    authLogin(result.userKey);
    console.log(result.userKey);
    console.log(result.hasSurvey);

    // ✅ 자동 로그인 체크 시 userKey를 AsyncStorage에 저장
    if (isAutoLogin) {
      try {
        await AsyncStorage.setItem('userKey', result.userKey);
        console.log('자동 로그인을 위해 userKey가 저장되었습니다.');
      } catch (error) {
        console.error('userKey 저장 실패:', error);
      }
    }

    if (!result.hasSurvey) {
      navigation.replace("SurveyForm");
    } else {
      navigation.replace("MainApp");
    }
  } else {
    console.log("[handleLogin] 로그인 실패");
  }
};

export const handleLogout = async (authLogout, navigation) => {
  console.log("[handleLogout] 로그아웃 처리 시작");

  try {
    // 1. AsyncStorage에 저장된 userKey 삭제
    await AsyncStorage.removeItem('userKey');
    console.log("userKey가 AsyncStorage에서 삭제되었습니다.");

    // 2. AuthContext 상태 초기화 (로그아웃 처리)
    authLogout(); // 이 함수는 AuthContext에서 로그아웃 상태로 변경하는 함수입니다.

    // 3. 내비게이션 스택 초기화 및 로그인 화면으로 이동
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      })
    );

  } catch (error) {
    console.error("[handleLogout] 로그아웃 중 오류 발생:", error);
  }
};

export const handleSignUp = (navigation) => {
  navigation.navigate("SignUp");
};
