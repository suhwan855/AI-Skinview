import React, { useState } from "react";
import {
	ScrollView,
	View,
	Text,
	TouchableOpacity,
	StyleSheet,
} from "react-native";

const AccordionSection = ({ title, isOpen, onToggle, children }) => (
	<View style={{ marginTop: 20 }}>
		<TouchableOpacity
			onPress={onToggle}
			style={{
				flexDirection: "row",
				justifyContent: "space-between",
				alignItems: "center",
			}}
		>
			<Text style={{ fontSize: 18, fontWeight: "700", color: "#111827" }}>
				{title}
			</Text>
			<Text style={{ fontSize: 14, color: "#3b82f6", fontWeight: "700" }}>
				{isOpen ? "" : ""}
			</Text>
		</TouchableOpacity>
		{isOpen && <View style={{ marginTop: 8 }}>{children}</View>}
	</View>
);

const Paragraph = ({ children }) => (
	<Text
		style={{
			fontSize: 16,
			lineHeight: 28,
			color: "#4b5563",
			fontWeight: "400",
		}}
	>
		{children}
	</Text>
);

const CombinationSkinInfo = () => {
	const [showMain, setShowMain] = useState(false);
	const [sections, setSections] = useState({});

	const toggleSection = (key) => {
		setSections((prev) => ({
			...prev,
			[key]: !prev[key],
		}));
	};

	return (
		<ScrollView
			contentContainerStyle={styles.contentContainer}
			style={styles.container}
		>
			<View>
				<Text
					style={{
						fontWeight: "700",
						fontSize: 22,
					}}
				>
					또한
				</Text>
				<TouchableOpacity
					onPress={() => setShowMain(!showMain)}
					style={styles.accordionHeader}
				>
					<Text
						style={[
							styles.sectionTitle,
							{ backgroundColor: "#61dafb70" },
						]}
					>
						당신은 복합성 피부일 수 있습니다.
					</Text>
					<Text
						style={{
							color: "#3b82f6",
							textDecorationLine: "underline",
							fontWeight: "700",
							fontSize: 16,
						}}
					>
						{showMain ? "닫기" : " click!"}
					</Text>
				</TouchableOpacity>

				{showMain && (
					<>
						<AccordionSection
							title=" 복합성 피부란?"
							isOpen={sections.skinType}
							onToggle={() => toggleSection("skinType")}
						>
							<Paragraph>
								복합성 피부는 지성 피부와 건성 피부의 특징을
								모두 나타냅니다. T존(이마, 코, 턱)이나 O존(입
								주변)은 주로 유분기가 많은 반면 뺨과 눈 밑에는
								대개 건조함이 눈에 띕니다.
							</Paragraph>
						</AccordionSection>

						<AccordionSection
							title=" 피부 밸런스"
							isOpen={sections.balance}
							onToggle={() => toggleSection("balance")}
						>
							<Paragraph>
								T존과 O존은 유분이 많고, 뺨과 눈 밑은 건조함.
								지복합성은 이마와 코, 턱에 번들거림이 있고,
								건복합성은 이마와 턱이 건조합니다.
							</Paragraph>
						</AccordionSection>

						<AccordionSection
							title=" 원인"
							isOpen={sections.cause}
							onToggle={() => toggleSection("cause")}
						>
							<Paragraph>
								유전은 피부의 특성과 반응에 중요한 역할을
								합니다. 복합성 피부도 예외는 아닙니다. 복합성
								피부는 반응도, 붉어짐, 여드름 증상을 나타내는
								성향이 있습니다. 특히 호르몬과 기후 변화에
								민감합니다. 복합성 피부는 또한 자극을 받거나
								민감한 피부와도 연관이 있습니다. 번들거림으로
								표현되는 피지 분비의 증가는 모공을 막아 여드름을
								악화시킬 수 있습니다. 이러한 점을 고려해 정화,
								모공 문제, 진정을 동시에 해결하는 제품이 복합성
								피부의 균형을 잡아주는 데 특히 효과적일 수
								있습니다.
							</Paragraph>
						</AccordionSection>

						<AccordionSection
							title=" 유용한 성분"
							isOpen={sections.usefulIngredients}
							onToggle={() => toggleSection("usefulIngredients")}
						>
							<Paragraph>
								-복합성 피부가 지성에 가까운 경우, 피부의 균형을
								유지하기 위해 과도한 피지 분비를 잡아주는 성분을
								함유한 제품을 사용할 것을 추천합니다. 수렴
								효과가 뛰어난 성분(위치하젤, 유칼립투스 오일,
								그린 티 추출물)은 열린 상태의 넓은 모공 문제를
								해결하는 데 도움을 줄 수 있습니다. 한편, 정화
								작용이 뛰어난 성분(쥬니퍼 베리, 티 트리 리프,
								비터 오렌지)은 막힌 모공을 완화하는 데 도움이
								됩니다. 제품 라벨에 변성 알코올로 표시되는 에틸
								알코올은 피부 표면의 과도한 피지를 용해합니다.
								클렌징 과정에 도움을 주며, 이 성분이 함유된
								제품은 깔끔하고 매트한 마무리감을 선사합니다.
							</Paragraph>
						</AccordionSection>

						<AccordionSection
							title=" 유분이 많은 복합성 피부 관리"
							isOpen={sections.oilyCare}
							onToggle={() => toggleSection("oilyCare")}
						>
							<Paragraph>
								건조 부위에 영향을 주지 않으며 과도한 피지를
								제거하는 클렌저 사용. 토너는 피부 밸런스를
								조절하고 수분 공급에 적합.
							</Paragraph>
						</AccordionSection>

						<AccordionSection
							title=" 건조한 복합성 피부 관리"
							isOpen={sections.dryCare}
							onToggle={() => toggleSection("dryCare")}
						>
							<Paragraph>
								피부의 자연 오일을 제거하지 않는 순한 클렌징
								사용. 페이셜 오일은 피지를 오히려 조절하고
								메이크업 잔여물 제거에도 효과적.
							</Paragraph>
						</AccordionSection>

						<AccordionSection
							title=" 기후에 따른 추천"
							isOpen={sections.climate}
							onToggle={() => toggleSection("climate")}
						>
							<Paragraph>
								- 겨울: 영양이 풍부한 보습 크림{"\n"}- 여름:
								알로에 베라 베이스의 가벼운 보습제{"\n"}- 건조할
								때: 수분 전달 토너
							</Paragraph>
						</AccordionSection>

						<AccordionSection
							title=" 딥 클렌징"
							isOpen={sections.deepCleanse}
							onToggle={() => toggleSection("deepCleanse")}
						>
							<Paragraph>
								일주일에 1~2회, 부드러운 각질 제거와 함께 균형
								유지에 도움을 주는 딥 클렌징을 권장합니다.
							</Paragraph>
						</AccordionSection>

						<Text style={styles.footer}>
							출처: Aesop 복합성 피부를 위한 가이드 | Aesop
							대한민국
						</Text>
					</>
				)}
			</View>
		</ScrollView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#f5f7fa",
	},
	contentContainer: {
		padding: 24,
		paddingBottom: 40,
	},
	sectionTitle: {
		fontSize: 20,
		fontWeight: "700",
		color: "#111827",
		letterSpacing: 0.5,
		backgroundColor: "transparent", // 추가
	},
	accordionHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingVertical: 4, // 기존 8 -> 4로 줄임 (필요하면 0도 가능)
		paddingHorizontal: 8, // 기존 12 -> 8로 줄임
		backgroundColor: "transparent",
		borderWidth: 0,
		borderColor: "transparent",
	},
	accordionToggle: {
		fontSize: 16,
		color: "#3b82f6",
		fontWeight: "700",
		backgroundColor: "transparent", // 추가
	},
	footer: {
		fontSize: 13,
		color: "#9ca3af",
		textAlign: "center",
		marginTop: 40,
		fontStyle: "italic",
	},
});

export default CombinationSkinInfo;
