// join/MyApp/components/SignupForm.jsx
import React, { useState, useEffect, useRef, useContext } from "react";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import { AddressContext } from "../../utils/contexts/addressContext";
import {
	View,
	Text,
	TextInput,
	TouchableOpacity,
	StyleSheet,
	ScrollView,
	Alert,
	KeyboardAvoidingView,
	Platform,
} from "react-native";
import {
	checkIdAvailability,
	checkPasswordsMatch,
	checkPhoneAvailability,
	isFormValid,
	checkEmailAvailability,
} from "../../utils/api/fastapi";
import Header from "../../Styles/header";

const SignupForm = ({ navigation }) => {
	const { address } = useContext(AddressContext);

	const middlePhoneRef = useRef(null);
	const lastPhoneRef = useRef(null);
	const yearRef = useRef(null);
	const monthRef = useRef(null);
	const dayRef = useRef(null);

	const [formData, setFormData] = useState({
		userId: "",
		password: "",
		passwordConfirm: "",
		email: "",
		phoneNumber: "010",
		gender: "",
		postalCode: "",
		address1: "",
		address2: "",
		birthdate: "",
	});

	useEffect(() => {
		if (address?.postalCode) {
			setFormData((prev) => ({
				...prev,
				postalCode: address.postalCode,
				address1: address.address1,
				address2: address.address2 || "",
			}));
		}
	}, [address]);

	const [validationState, setValidationState] = useState({
		isIdAvailable: null,
		isIdChecked: false,
		passwordsMatch: null,
		isPhoneVerified: false,
		isEmailAvailable: null,
		isEmailChecked: false,
		isPhoneAvailable: null,
		isPhoneChecked: false,
	});

	const updateFormData = (field, value) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
		if (field === "userId") {
			setValidationState((prev) => ({
				...prev,
				isIdChecked: false,
				isIdAvailable: null,
			}));
		}
	};

	useEffect(() => {
		if (formData.password && formData.passwordConfirm) {
			setValidationState((prev) => ({
				...prev,
				passwordsMatch: checkPasswordsMatch(
					formData.password,
					formData.passwordConfirm
				),
			}));
		} else {
			setValidationState((prev) => ({ ...prev, passwordsMatch: null }));
		}
	}, [formData.password, formData.passwordConfirm]);

	const handleSubmit = () => {
		if (!isFormValid(formData, validationState)) {
			Alert.alert("입력 오류", "모든 필수 항목을 정확히 입력해주세요.");
			return;
		}

		const birthdate =
			formData.birthdate.length === 8
				? `${formData.birthdate.slice(0, 4)}-${formData.birthdate.slice(
					4,
					6
				)}-${formData.birthdate.slice(6, 8)}`
				: null;

		const userAddress = `${formData.postalCode} ${formData.address1} ${formData.address2}`.trim();

		const dataToSend = {
			user_id: formData.userId,
			user_password: formData.password,
			user_phone_number: formData.phoneNumber,
			user_email: formData.email || null,
			user_birth: birthdate,
			user_gender: formData.gender,
			user_address: userAddress,
		};

		axios
			.post("http://20.81.185.103:8000/signup/", dataToSend, {
				headers: { "Content-Type": "application/json" },
			})
			.then((response) => {
				Alert.alert("회원가입 성공", "회원가입이 완료되었습니다.");
				navigation.navigate("Login");
			})
			.catch((error) => {
				Alert.alert(
					"회원가입 오류",
					error.response?.data?.message || "서버와 연결할 수 없습니다."
				);
			});
	};

	const handleEmailChange = (email) => {
		setFormData((prev) => ({ ...prev, email: email.trim() }));
	};

	const handlePostalCodeSearch = () => {
		navigation.navigate("PostcodeSearch", {
			onAddressSelected: (selectedAddress) => {
				setFormData((prev) => ({
					...prev,
					postalCode: selectedAddress.postalCode || "",
					address1: selectedAddress.address || selectedAddress.roadAddress || "",
				}));
			},
		});
	};

	return (
		<KeyboardAvoidingView
			behavior={Platform.OS === "ios" ? "padding" : "height"}
			style={{ flex: 1 }}
		>
			<Header
				title="회원가입"
				onBackPress={() => navigation.goBack()}
			/>
			<ScrollView contentContainerStyle={styles.scrollContainer}>
				{/* 아이디 */}
				<View style={styles.inputGroup}>
					<Text style={styles.label}>아이디 *</Text>
					<View style={styles.row}>
						<TextInput
							style={[styles.input, { flex: 1 }]}
							placeholder="아이디 영문 4자 이상"
							value={formData.userId}
							onChangeText={(text) => updateFormData("userId", text)}
						/>
						<TouchableOpacity
							style={styles.checkButton}
							onPress={() =>
								checkIdAvailability(
									formData.userId,
									setValidationState,
									updateFormData
								)
							}
							disabled={!formData.userId}
						>
							<Text style={styles.checkButtonText}>중복 확인</Text>
						</TouchableOpacity>
					</View>
				</View>

				{/* 비밀번호 */}
				<View style={styles.inputGroup}>
					<Text style={styles.label}>비밀번호 *</Text>
					<Text style={styles.helperText}>
						영문, 숫자, 특수문자(!, @, #, $, %) 포함, 8~20자
					</Text>
					<TextInput
						style={styles.input}
						placeholder="비밀번호 8자 이상"
						secureTextEntry
						value={formData.password}
						onChangeText={(text) => updateFormData("password", text)}
					/>
				</View>

				{/* 비밀번호 확인 */}
				<View style={styles.inputGroup}>
					<Text style={styles.label}>비밀번호 확인 *</Text>
					<TextInput
						style={styles.input}
						placeholder="비밀번호 확인"
						secureTextEntry
						value={formData.passwordConfirm}
						onChangeText={(text) => updateFormData("passwordConfirm", text)}
					/>
					{validationState.passwordsMatch !== null && (
						<Text
							style={{
								marginTop: 5,
								color: validationState.passwordsMatch ? "#32a0ff" : "red",
							}}
						>
							{validationState.passwordsMatch
								? "비밀번호가 일치합니다."
								: "비밀번호가 일치하지 않습니다."}
						</Text>
					)}
				</View>

				{/* 이메일 */}
				<View style={styles.inputGroup}>
					<Text style={styles.label}>이메일</Text>
					<View style={styles.row}>
						<TextInput
							style={[styles.input, { flex: 1 }]}
							placeholder="aiskinview@gmail.com"
							value={formData.email}
							onChangeText={handleEmailChange}
							keyboardType="email-address"
							autoCapitalize="none"
						/>
						<TouchableOpacity
							style={styles.checkButton}
							onPress={() =>
								checkEmailAvailability(formData.email, setValidationState)
							}
							disabled={!formData.email}
						>
							<Text style={styles.checkButtonText}>중복 확인</Text>
						</TouchableOpacity>
					</View>
					{validationState.isEmailChecked && (
						<Text
							style={{
								marginTop: 5,
								color: validationState.isEmailAvailable ? "#32a0ff" : "red",
							}}
						>
							{validationState.isEmailAvailable
								? "사용 가능한 이메일입니다."
								: "이미 등록된 이메일입니다."}
						</Text>
					)}
				</View>

				{/* 생년월일 */}
				<View style={styles.inputGroup}>
					<Text style={styles.label}>생년월일 *</Text>
					<View style={styles.row}>
						<TextInput
							ref={yearRef}
							style={[styles.input, { flex: 1 }]}
							placeholder="YYYY"
							value={formData.birthdate.slice(0, 4)}
							onChangeText={(text) => {
								const cleaned = text.replace(/[^0-9]/g, "").slice(0, 4);
								updateFormData("birthdate", cleaned + formData.birthdate.slice(4));
								if (cleaned.length === 4) monthRef.current?.focus();
							}}
							keyboardType="numeric"
						/>
						<TextInput
							ref={monthRef}
							style={[styles.input, { flex: 1 }]}
							placeholder="MM"
							value={formData.birthdate.slice(4, 6)}
							onChangeText={(text) => {
								const cleaned = text.replace(/[^0-9]/g, "").slice(0, 2);
								updateFormData(
									"birthdate",
									formData.birthdate.slice(0, 4) + cleaned + formData.birthdate.slice(6)
								);
								if (cleaned.length === 2) dayRef.current?.focus();
							}}
							keyboardType="numeric"
						/>
						<TextInput
							ref={dayRef}
							style={[styles.input, { flex: 1 }]}
							placeholder="DD"
							value={formData.birthdate.slice(6)}
							onChangeText={(text) => {
								const cleaned = text.replace(/[^0-9]/g, "").slice(0, 2);
								updateFormData(
									"birthdate",
									formData.birthdate.slice(0, 6) + cleaned
								);
							}}
							keyboardType="numeric"
						/>
					</View>
				</View>

				{/* 성별 */}
				<View style={styles.inputGroup}>
					<Text style={styles.label}>성별 *</Text>
					<View style={styles.row}>
						<TouchableOpacity
							style={[
								styles.genderButton,
								formData.gender === "여성" && styles.genderButtonSelected,
							]}
							onPress={() => updateFormData("gender", "여성")}
						>
							<Text
								style={[
									styles.genderText,
									formData.gender === "여성" && styles.genderTextSelected, // ✅ 수정
								]}
							>
								여성
							</Text>
						</TouchableOpacity>
                        <TouchableOpacity
							style={[
								styles.genderButton,
								formData.gender === "남성" && styles.genderButtonSelected,
							]}
							onPress={() => updateFormData("gender", "남성")}
						>
							<Text
								style={[
									styles.genderText,
									formData.gender === "남성" && styles.genderTextSelected,
								]}
							>
								남성
							</Text>
						</TouchableOpacity>
					</View>
				</View>

				{/* 전화번호 */}
				<View style={styles.inputGroup}>
					<Text style={styles.label}>전화번호 *</Text>
					<View style={[styles.row, { alignItems: "center" }]}>
						{/* 앞자리 */}
						<TextInput
							style={[styles.input, { flex: 1 }]}
							placeholder="010"
							value={formData.phoneNumber.slice(0, 3)}
							editable={false}
						/>
						{/* 중간자리 */}
						<TextInput
							ref={middlePhoneRef}
							style={[styles.input, { flex: 1 }]}
							placeholder="1234"
							value={formData.phoneNumber.slice(3, 7)}
							onChangeText={(text) => {
								const cleaned = text.replace(/[^0-9]/g, "").slice(0, 4);
								updateFormData(
									"phoneNumber",
									formData.phoneNumber.slice(0, 3) + cleaned + formData.phoneNumber.slice(7)
								);
								if (cleaned.length === 4) lastPhoneRef.current?.focus();
							}}
							keyboardType="numeric"
						/>
						{/* 끝자리 */}
						<TextInput
							ref={lastPhoneRef}
							style={[styles.input, { flex: 1 }]}
							placeholder="5678"
							value={formData.phoneNumber.slice(7)}
							onChangeText={(text) => {
								const cleaned = text.replace(/[^0-9]/g, "").slice(0, 4);
								updateFormData("phoneNumber", formData.phoneNumber.slice(0, 7) + cleaned);
							}}
							keyboardType="numeric"
						/>

						{/* ✅ 중복확인 버튼 */}
						<TouchableOpacity
							style={styles.checkButton}
							onPress={() =>
								checkPhoneAvailability(formData.phoneNumber, setValidationState)
							}
							disabled={formData.phoneNumber.length !== 11}
						>
							<Text style={styles.checkButtonText}>중복 확인</Text>
						</TouchableOpacity>
					</View>

					{/* 결과 메시지 */}
					{validationState.isPhoneChecked && (
						<Text
							style={{
								marginTop: 6,
								color: validationState.isPhoneAvailable ? "green" : "red",
							}}
						>
							{validationState.isPhoneAvailable ? "사용 가능" : "이미 등록됨"}
						</Text>
					)}
				</View>


				{/* 주소 */}
				<View style={styles.inputGroup}>
					<Text style={styles.label}>주소 *</Text>
					<View style={styles.row}>
						<TextInput
							style={[styles.input, { flex: 1 }]}
							placeholder="우편번호"
							value={formData.postalCode}
							editable={false}
						/>
						<TouchableOpacity style={styles.checkButton} onPress={handlePostalCodeSearch}>
							<Text style={styles.checkButtonText}>검색</Text>
						</TouchableOpacity>
					</View>
					<TextInput
						style={styles.input}
						placeholder="주소"
						value={formData.address1}
						editable={false}
					/>
					<TextInput
						style={styles.input}
						placeholder="상세주소"
						value={formData.address2}
						onChangeText={(text) => updateFormData("address2", text)}
					/>
				</View>

				<TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
					<Text style={styles.submitButtonText}>가입하기</Text>
				</TouchableOpacity>
			</ScrollView>
		</KeyboardAvoidingView>
	);
};

const styles = StyleSheet.create({
	scrollContainer: {
		padding: 20,
		backgroundColor: "#f9fafd",
	},
	inputGroup: {
		marginBottom: 20,
	},
	label: {
		fontWeight: "600",
		marginBottom: 8,
		color: "#333",
	},
	helperText: {
		fontSize: 12,
		color: "#666",
		marginBottom: 5,
	},
	row: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 10,
	},
	input: {
		borderWidth: 1,
		borderColor: "#cbefff", // 테마색과 어울리는 연한 블루
		backgroundColor: "#fff",
		borderRadius: 10,
		padding: 12,
		marginRight: 10,
		shadowColor: "#000",
		shadowOpacity: 0.05,
		shadowOffset: { width: 0, height: 1 },
		shadowRadius: 2,
	},
	checkButton: {
		backgroundColor: "#61dafb", // 테마 메인 색상
		paddingVertical: 10,
		paddingHorizontal: 16,
		borderRadius: 10,
		alignItems: "center",
		justifyContent: "center",
	},
	checkButtonText: {
		color: "#fff",
		fontWeight: "600",
		fontSize: 14,
	},
	genderButton: {
		flex: 1,
		borderWidth: 1,
		borderColor: "#61dafb", // 테마 포인트 색
		borderRadius: 10,
		paddingVertical: 10,
		marginRight: 10,
		alignItems: "center",
	},
	genderButtonSelected: {
		backgroundColor: "#61dafb",
	},
	genderText: {
		color: "#61dafb",
		fontWeight: "600",
	},
	genderTextSelected: {
		color: "#fff",
	},
	submitButton: {
		backgroundColor: "#61dafb",
		paddingVertical: 16,
		borderRadius: 12,
		marginTop: 30,
		alignItems: "center",
		shadowColor: "#61dafb",
		shadowOpacity: 0.3,
		shadowOffset: { width: 0, height: 4 },
		shadowRadius: 6,
		elevation: 5,
	},
	submitButtonText: {
		color: "#fff",
		fontWeight: "700",
		fontSize: 16,
	},
});


export default SignupForm;
