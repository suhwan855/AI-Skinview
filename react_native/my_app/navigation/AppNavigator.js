import React, { useEffect } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Alert, TouchableOpacity, View, Text } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";

// 화면 컴포넌트
import AuthLoadingScreen from "../components/login/authLoadingScreen";
import LoginScreen from "../components/login/loginUI";
import SignupForm from "../components/Join/joinUI";
import localSearch from "../components/Join/NaverLocalSearch";
import SurveyForm from "../components/Survey/SurveyForm";
import MainPage from "../components/Home/MainPage";
import CalendarScreen from "../components/Calendar/Calendar";
import SkinAnalysisScreen from "../components/Analysis/SkinAnalysisScreen";
import SkinCompareScreen from "../components/Analysis/SkinAnalysisCompare";
import GuidedCamera from "../components/Camera/GuidedCamera";
import MyPageScreen from "../components/MyPage/MyPageScreen";
import BaumannInfo from "../components/Description/BaumannInfoScreen";
import MyBaumannResultScreen from "../components/Survey/MyBaumannResultScreen";
import UserInfoEditScreen from "../components/MyPage/UserInfoEditScreen";
import SettingsScreen from "../components/MyPage/SettingsScreen";
import ChatBot from "../components/ChatBot/chatBotUI"; // ChatBotUI 컴포넌트
import Category from "../components/Product/CategoryList";
import ProductList from "../components/Product/ProductListScreen";
import LoadingOverlay from "../components/Common/LoadingOverlay";
import LoadingScreen from "../components/Common/LoadingScreen"; // LoadingScreen 컴포넌트
import MyRoutineLogScreen from "../components/MyPage/MyRoutineLogScreen";

// utils
import formatDate from "../utils/formatDate";
import {
  uploadPhoto,
  getPhotoByDate,
  uploadSurvey,
} from "../utils/api/fastapi";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// 카메라 버튼
const CameraButton = ({ onPress, children }) => (
  <TouchableOpacity
    style={{
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    }}
    onPress={onPress}
  >
    {children}
  </TouchableOpacity>
);

// CalendarScreen → 분석 페이지 이동
const onAnalyze = async (date, navigation) => {
  LoadingOverlay(true);
  const formattedDate = formatDate(date);
  try {
    const res = await getPhotoByDate(date);
    navigation.navigate("SkinAnalysis", {
      selectedDate: formattedDate,
      acneImageUri: res.data.analysis_photo_acne_url || null,
      rednessImageUri: res.data.analysis_photo_redness_url || null,
    });
  } catch (err) {
    console.error("분석 데이터 조회 실패:", err);
    Alert.alert(
      "알림",
      "분석 데이터 조회에 실패했습니다. 사진을 먼저 등록해주세요.",
      [{ text: "확인" }]
    );
    navigation.navigate("MainApp", { screen: "MainTab" });
  } finally {
    LoadingOverlay(false);
  }
};

// SkinAnalysis → 비교 페이지 이동
const onCompare = (params, navigation) => {
  LoadingOverlay(true);
  navigation.navigate("SkinCompare", params);
};

// GuidedCamera → 업로드 후 캘린더 이동
const onRegister = async (uri, navigation) => {
  LoadingOverlay(true);
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const date = formatDate(`${month}/${day}`);

  try {
    await uploadPhoto(uri, date);
    Alert.alert("알림", "업로드 성공", [{ text: "확인" }]);
    navigation.navigate("MainApp", { screen: "CalendarTab" });
  } catch (err) {
    console.error("업로드 실패:", err);
    Alert.alert("알림", "업로드에 실패했습니다. 다시 시도해 주세요.", [
      { text: "확인" },
    ]);
    throw err;
  } finally {
    LoadingOverlay(false);
  }
};

const onSurvey = async ({ surveyScores, skin_combination_type }) => {
  LoadingOverlay(true);
  try {
    await uploadSurvey(surveyScores, skin_combination_type);
    Alert.alert("알림", "설문 업로드 성공", [{ text: "확인" }]);
    // navigation 이동 제거
  } catch (err) {
    console.error("[uploadSurvey] 설문 업로드 실패:", err);
    Alert.alert("알림", "설문 업로드에 실패했습니다. 다시 시도해 주세요.", [
      { text: "확인" },
    ]);
  } finally {
    LoadingOverlay(false);
  }
};

// StartChat 컴포넌트는 더 이상 사용하지 않으므로 삭제합니다.
// 챗봇 진입 시 API를 호출하는 로직은 LoadingScreen으로 옮겨졌습니다.

const HomeStack = createNativeStackNavigator();

function HomeNavigator() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="MainScreen" component={MainPage} />
      <Stack.Screen
        name="CategoryList"
        component={Category}
        options={{
          headerShown: false,
          presentation: "card",
          animation: "slide_from_left",
        }}
      />
      <HomeStack.Screen name="ProductList" component={ProductList} />
    </HomeStack.Navigator>
  );
}

// MainTabs 수정
function MainTabs() {
  const navigation = useNavigation();

  return (
    <Tab.Navigator
      initialRouteName="MainTab"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#61dafb",
        tabBarInactiveTintColor: "#D3D3D3",
        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopWidth: 1,
          borderTopColor: "#D3D3D3",
        },
      }}
    >
      <Tab.Screen
        name="MainTab"
        component={HomeNavigator}
        options={{
          tabBarLabel: 'main',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="CalendarTab"
        options={{
          tabBarLabel: '캘린더',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" color={color} size={size} />
          ),
        }}
      >
        {(props) => (
          <CalendarScreen
            {...props}
            onAnalyze={(date) => onAnalyze(date, props.navigation)}
          />
        )}
      </Tab.Screen>
      <Tab.Screen
        name="CameraTab"
        component={View}
        options={{
          tabBarLabel: '사진',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="camera-outline" color={color} size={size + 4} />
          ),
          tabBarButton: (props) => (
            <CameraButton {...props} onPress={() => navigation.navigate('Camera')} />
          ),
        }}
      />
      <Tab.Screen
        name="MyPageTab"
        component={MyPageScreen}
        options={{
          tabBarLabel: '마이 페이지',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <Stack.Navigator initialRouteName="AuthLoading">
      <Stack.Screen
        name="AuthLoading"
        component={AuthLoadingScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="SignUp"
        component={SignupForm}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="PostcodeSearch"
        component={localSearch}
        options={{ headerShown: false }}
      />

      <Stack.Screen name="Main" component={MainPage} />
      {/* 메인 탭 내비게이터 */}
      <Stack.Screen
        name="MainApp"
        component={MainTabs}
        options={{ headerShown: false }}
      />

      {/* 카메라, 분석, 설문 화면에 필요한 prop 전달 */}
      <Stack.Screen name="Camera" options={{ headerShown: false }}>
        {(props) => (
          <GuidedCamera
            {...props}
            onRegister={(uri) => onRegister(uri, props.navigation)}
          />
        )}
      </Stack.Screen>

      <Stack.Screen name="SkinAnalysis" options={{ headerShown: false }}>
        {(props) => {
          useEffect(() => {
            const unsubscribe = props.navigation.addListener(
              "focus",
              () => {
                LoadingOverlay(false);
              }
            );
            return unsubscribe;
          }, [props.navigation]);

          return (
            <SkinAnalysisScreen
              {...props}
              onCompare={(params) =>
                onCompare(params, props.navigation)
              }
            />
          );
        }}
      </Stack.Screen>

      <Stack.Screen name="SkinCompare" options={{ headerShown: false }}>
        {(props) => {
          useEffect(() => {
            const unsubscribe = props.navigation.addListener(
              "focus",
              () => {
                LoadingOverlay(false);
              }
            );
            return unsubscribe;
          }, [props.navigation]);

          return <SkinCompareScreen {...props} />;
        }}
      </Stack.Screen>

      <Stack.Screen name="SurveyForm" options={{ headerShown: false }}>
        {(props) => (
          <SurveyForm
            {...props}
            onSurvey={onSurvey} // navigation은 넘기지 않음
          />
        )}
      </Stack.Screen>

      <Stack.Screen
        name="MyRoutineLog"
        component={MyRoutineLogScreen}
        options={{ title: "나만의 피부 솔루션 라이브러리" }}
      />

      {/* prop이 필요 없는 나머지 화면들 */}
      <Stack.Screen name="BaumannInfo" component={BaumannInfo} options={{ headerShown: false }} />
      <Stack.Screen name="MyBaumannResultScreen" component={MyBaumannResultScreen} options={{ headerShown: false }} />
      <Stack.Screen name="UserInfoEdit" component={UserInfoEditScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Settings" component={SettingsScreen} options={{ headerShown: false }} />
      
      {/* ⭐️ 이전 'StartChat' 컴포넌트를 사용하던 부분을 수정 */}
      {/* 챗봇 진입 시 로딩을 담당하는 화면으로 LoadingScreen을 사용 */}
      <Stack.Screen name="LoadingScreen" component={LoadingScreen} options={{ headerShown: false }} />
      {/* 실제 챗봇 UI 화면 */}
      <Stack.Screen name="ChatBot" component={ChatBot} options={{ headerShown: false }} />

    </Stack.Navigator>
  );
}
