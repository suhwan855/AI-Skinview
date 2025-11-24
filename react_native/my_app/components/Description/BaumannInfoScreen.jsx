import React, { useState, useRef } from "react";
import {
	ScrollView,
	Text,
	View,
	TouchableOpacity,
	Linking,
	Image,
} from "react-native";
import SkinTypeBox from "../../Styles/SkinTypeBoxStyles.js"; // 경로는 위치에 따라 조정
import { MBSTStyles } from "../../Styles/MBSTStyles.js";
import Header from "../../Styles/header";

const AccordionItem = ({ title, children, highlightColor }) => {
	const [expanded, setExpanded] = useState(false);

	// 왼쪽에 화살표 표시할 타이틀 목록
	const leftArrowTitles = [
		"소개",
		"서적 및 방송",
		"Skin Type Solutions 알아보기",
		"16가지 Baumann Skin Type 설명",
	];

	const showArrowLeft = leftArrowTitles.includes(title);

	// DS, OS, OR, DR 추출 (선택 사항)
	// const typeMatch = title.match(/\b(DS|OS|OR|DR)\b/i);
	// const typeText = typeMatch ? typeMatch[0].toUpperCase() : "";

	// mainTitle : 타이틀 전체 그대로 사용
	const mainTitle = title;

	return (
		<View>
			<TouchableOpacity
				style={{
					backgroundColor: highlightColor || "#ddd",
					paddingVertical: 10,
					marginTop: 24,
					marginBottom: 0,
					paddingHorizontal: 12,
					borderRadius: 8,
					flexDirection: "row",
					justifyContent: "space-between",
					alignItems: "center",
				}}
				onPress={() => setExpanded(!expanded)}
			>
				{/* 왼쪽 영역 */}
				<View style={{ flexDirection: "row", alignItems: "center" }}>
					{/* 화살표가 왼쪽일 때만 표시 */}
					{showArrowLeft && (
						<Text
							style={{
								fontSize: 20,
								fontWeight: "bold",
								marginRight: 10,
							}}
						>
							{expanded ? "↑" : "↓"}
						</Text>
					)}

					{/* 타이틀 - 전체 그대로 */}
					<Text style={{ fontSize: 20, fontWeight: "bold" }}>
						{mainTitle}
					</Text>
				</View>

				{/* 오른쪽 영역 - DS/OS/OR/DR 표시 안함 */}
				{/* 아래 코드를 삭제 또는 주석 처리 */}
				{/* {!showArrowLeft && (
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            {typeText && (
              <Text style={{ fontSize: 20, fontWeight: "bold", marginRight: 10 }}>
                {typeText}
              </Text>
            )}
            <Text style={{ fontSize: 20, fontWeight: "bold" }}>
              {expanded ? "↑" : "↓"}
            </Text>
          </View>
        )} */}

				{/* 오른쪽에 화살표만 나오게 하고 싶으면 아래처럼 */}
				{!showArrowLeft && (
					<Text style={{ fontSize: 20, fontWeight: "bold" }}>
						{expanded ? "↑" : "↓"}
					</Text>
				)}
			</TouchableOpacity>

			{expanded && (
				<View style={{ paddingHorizontal: 16, paddingVertical: 10 }}>
					{children}
				</View>
			)}
		</View>
	);
};

function BaumannInfo({ navigation }) {
	const openURL = (url) => Linking.openURL(url);

	return (
		<>
			<Header
				title="바우만 피부타입 정보"
				onBackPress={() => navigation.goBack()}
			/>
			<ScrollView style={{ flex: 1, padding: 0, backgroundColor: "#fff" }}>
				<View
					style={{
						backgroundColor: "#2F3572",
						padding: 10,
						marginBottom: 16,
					}}
				>
					<Text
						style={{
							fontWeight: "bold",
							fontSize: 40,
							color: "#fffFFF",
							marginBottom: 18,
						}}
					>
						Baumann Skin Types®
					</Text>
					<Text
						style={{ fontSize: 19, color: "#D9D9DD", marginBottom: 25 }}
					>
						Baumann Skin Types®를 알고 계신가요?
					</Text>
				</View>

				<Text style={{ fontSize: 16.5, padding: 16 }}>
					Baumann Skin Types®에 대해 배우고 자신만의 맞춤 스킨케어 루틴을
					처방받기 위해 저희 Skin Type Solutions 의사 파트너 중 한 곳을
					방문해 보세요! Skin Type Solutions 시스템을 사용하는 의사를
					찾으시려면 여기를 클릭하세요.
				</Text>

				<TouchableOpacity
					onPress={() => openURL("https://baumannskintypes.com/")}
				>
					<Text
						style={{
							fontSize: 16,
							color: "#1765a4ff",
							textDecorationLine: "underline",
							marginBottom: 16.5,
							padding: 16,
						}}
					>
						더 알아보기
					</Text>
				</TouchableOpacity>

				{/* 소개 */}
				<AccordionItem title="소개" highlightColor="#F6F6F6">
					<Text style={{ fontSize: 16.5, marginBottom: 12 }}>
						Baumann Skin Types®는 Skin Type Solutions Skin Typing System
						(STS)의 일부로, 16가지 고유한 Baumann Skin Types®로 구성된
						피부 타입 분류 시스템입니다.
					</Text>

					<Text style={{ fontSize: 16.5, marginBottom: 12 }}>
						이 피부 타입 분류 방법은 2004년 피부과 전문의{" "}
						<Text
							style={{
								color: "#1765a4ff",
								textDecorationLine: "underline",
							}}
							onPress={() =>
								openURL("https://www.lesliebaumannmd.com/")
							}
						>
							Leslie Baumann, M.D.
						</Text>{" "}
						에 의해 개발되었으며, 화장품 연구 시험에서 데이터 수집 및
						분석을 용이하게 하기 위해 연구 참가자를 세분화하는 데
						사용되었습니다.
					</Text>

					<Text style={{ fontSize: 16.5, marginBottom: 12 }}>
						STS 시스템은 전 세계 의사들 사이에서 피부 타입 분석의 골드
						스탠다드로 인정받고 있습니다.
					</Text>
				</AccordionItem>

				{/* 서적 및 방송 */}
				<AccordionItem title="서적 및 방송" highlightColor="#F6F6F6">
					<Text style={{ fontSize: 16.5, marginBottom: 12 }}>
						미국에서는 16가지 Baumann Skin Types®가 뉴욕 타임즈
						베스트셀러 도서인 The Skin Type Solution (Bantam 2005,
						2010)과{" "}
						<Text
							style={{
								color: "#1765a4ff",
								textDecorationLine: "underline",
							}}
							onPress={() =>
								openURL(
									"https://www.youtube.com/watch?v=U_e-RelmpPM"
								)
							}
						>
							PBS 특집 방송 Skin Type Solutions with Dr. Leslie
							Baumann (2010, 2011)
						</Text>{" "}
						의 주제가 되었습니다.
					</Text>

					<Text style={{ fontSize: 16.5, marginBottom: 12 }}>
						이 스킨 타입 솔루션은 호주, 영국, 브라질, 터키, 중국,
						베트남, 대한민국 등 여러 국가에서도 출판되었습니다.
					</Text>

					<Text style={{ fontSize: 16.5, marginBottom: 12 }}>
						피부 타입 분류 시스템은 2004년에 특허를 받았습니다.
					</Text>
				</AccordionItem>

				{/* Skin Type Solutions 알아보기 */}
				<AccordionItem
					title="Skin Type Solutions 알아보기"
					highlightColor="#F6F6F6"
				>
					<Text style={{ fontSize: 16.5, marginBottom: 12 }}>
						Skin Type Solutions는 디지털 스킨케어 분석, 추천 및 교육
						소프트웨어 시스템으로, 환자의 피부 건강을 개선하고, 병원의
						효율성을 극대화하며, 직원 생산성을 높입니다.{" "}
						<Text
							style={{
								color: "#1765a4ff",
								textDecorationLine: "underline",
							}}
							onPress={() =>
								openURL("https://skintypesolutions.com/")
							}
						>
							Skin Type Solutions 방문하기
						</Text>
					</Text>
				</AccordionItem>

				{/* 16가지 Baumann Skin Type 설명 */}
				<AccordionItem
					title="16가지 Baumann Skin Type 설명"
					highlightColor="#F6F6F6"
				>
					<Image
						source={{
							uri: "https://cdn.shopify.com/s/files/1/0740/5984/1838/files/img_1_-_16-baumann-skin-types.png?v=1689709313",
						}}
						style={{
							width: "100%",
							height: 430,
							resizeMode: "contain",
						}}
					/>

					<View style={MBSTStyles.sectionBox}>
						<Text style={MBSTStyles.sectionTitle}>
							지성(OILY) ↔ 건성(DRY)
						</Text>
						<Text style={MBSTStyles.descriptionText}>
							O 타입: 자고 일어나면 얼굴에 유분감이 충분한 피부.{"\n"}
							D 타입: 세안 후 피부 당김이 심하거나 시간이 흘러도
							유분이 생성되지 않는 건조한 피부.
						</Text>

						<Text style={MBSTStyles.sectionTitle}>
							민감성(SENSITIVE) ↔ 저항성(RESISTANCE)
						</Text>
						<Text style={MBSTStyles.descriptionText}>
							S 타입: 피부 발진, 가려움이 있거나 화장품을 바꾸면
							트러블이 생기는 예민한 피부.{"\n"}R 타입: 피부병이 없고
							화장품을 바꿔도 무던한 피부.
						</Text>

						<Text style={MBSTStyles.sectionTitle}>
							색소성(PIGMENTED) ↔ 비색소성(NON-PIGMENTED)
						</Text>
						<Text style={MBSTStyles.descriptionText}>
							P 타입: 기미나 주근깨가 있는 피부.{"\n"}N 타입: 트러블
							흔적 및 기미나 주근깨가 많지 않은 매끈한 피부.
						</Text>

						<Text style={MBSTStyles.sectionTitle}>
							주름(WRINKLED) ↔ 탱탱함(TIGHT)
						</Text>
						<Text style={MBSTStyles.descriptionText}>
							W 타입: 피부 건조로 인해 주름이 깊게 생긴 피부.{"\n"}T
							타입: 다양한 표정 변화에도 주름이 잘 생기지 않는 피부.
						</Text>
					</View>
					{/* 1. DS (건성 + 민감성) */}
					<AccordionItem
						title="Ⅰ. DS (건성 + 민감성)"
						highlightColor="#d2559a92"
					>
						<SkinTypeBox
							bgColor="#C469A7"
							titleColor="#fff"
							indexColor="#FDE6FF"
							descColor="#FDE6FF"
							title="1 DSPT"
							index="건성 · 민감성 · 색소 불균일 · 탄력 있음"
							description="이 건성 피부 타입은 반복적인 피부 염증과 고르지 않은 피부 톤이 특징입니다. DSPT 피부 관리 루틴은 건조함과 염증을 먼저 치료한 후 색소 침착을 관리하는 순서로 진행해야 합니다."
						/>

						<SkinTypeBox
							bgColor="#F499C1"
							titleColor="#222"
							indexColor="#333"
							descColor="#333"
							title="2 DSNT"
							index="건성 · 민감성 · 색소 불균일 없음 · 탄력 있음"
							description="피부 건조가 주된 특징이며, 염증이 간헐적으로 발생하기도 합니다. DSNT 피부는 고른 피부 톤을 가지고 있으며 주름은 거의 없거나 아예 없습니다. 리놀레산과 오메가-3 지방산이 풍부한 오일을 식단에 추가하는 것이 좋습니다."
						/>

						<SkinTypeBox
							bgColor="#F06788"
							titleColor="#fff"
							indexColor="#fff5f5"
							descColor="#fff5f5"
							title="3 DSPW"
							index="건성, 민감성, 색소 불균일, 주름 취약"
							description="이 건성 피부 타입은 반복적인 염증, 고르지 않은 피부 톤, 주름이 생기기 쉬운 특징을 가지고 있습니다. DSPW 피부는 건조함과 염증을 악화시키지 않으면서 색소침착과 주름을 관리하는 스킨케어가 필요합니다."
						/>

						<SkinTypeBox
							bgColor="#F3B5A8"
							titleColor="#442c2c"
							indexColor="#4a2f2f"
							descColor="#4a2f2f"
							title="4 DSNW"
							index="건성, 민감성, 색소 불균일 없음, 주름 취약"
							description="피부 건조와 염증이 주된 특징이며, DSNW는 고른 피부 톤을 가지고 있지만 주름이 생기기 쉬운 편입니다. 피부 장벽 강화 보습제, 매일 바르는 항산화제, 밤에 사용하는 레티놀, 그리고 항염 성분을 포함한 관리가 필요합니다."
						/>
					</AccordionItem>

					{/* 2. OS (지성 + 민감성) */}
					<AccordionItem
						title="Ⅱ. OS (지성 + 민감성)"
						highlightColor="#ef9b5e92"
					>
						<SkinTypeBox
							bgColor="#F6976E"
							titleColor="#fff"
							indexColor="#fff3ed"
							descColor="#fff3ed"
							title="5 OSPT"
							index="지성, 민감성, 색소 불균일, 탄력 있음"
							description="이 피부 타입은 염증이 자주 발생하고 피부 톤이 고르지 않습니다. 다른 타입보다 주름에 덜 취약한데, 이는 피부 색소가 많아 노화를 막아주고, 피부 피지에 자연스럽게 포함된 항산화제가 보호 역할을 하기 때문입니다."
						/>

						<SkinTypeBox
							bgColor="#FDD6B8"
							titleColor="#4a2d1e"
							indexColor="#4a2d1e"
							descColor="#4a2d1e"
							title="6 OSNT"
							index="지성, 민감성, 색소 불균일 없음, 탄력 있음"
							description="지성에 염증이 동반되는 타입으로, 항산화제가 풍부한 피지가 주름 예방에 도움을 주어 주름 발생이 상대적으로 적습니다. 좋은 생활 습관을 유지하면 나이가 들수록 관리가 더 수월해질 것입니다."
						/>

						<SkinTypeBox
							bgColor="#FCB95C"
							titleColor="#4a3300"
							indexColor="#4a3300"
							descColor="#4a3300"
							title="7 OSPW"
							index="지성, 민감성, 색소 불균일, 주름 취약"
							description="이 피부 타입은 염증이 자주 발생하며, 색소 침착이 고르지 않고 주름이 생기기 쉬운 특징을 가지고 있습니다. 피부의 자연 피지가 일부 항산화 보호를 제공하지만, 이 타입에는 충분하지 않으므로 꾸준한 일상적인 스킨케어 관리가 필수적입니다."
						/>

						<SkinTypeBox
							bgColor="#FFE3A4"
							titleColor="#4a3900"
							indexColor="#4a3900"
							descColor="#4a3900"
							title="8 OSNW"
							index="지성, 민감성, 색소 불균일 없음, 주름 취약"
							description="염증과 노화 취약성을 가진 타입으로, 피부 자연 피지 내 높은 항산화제가 일부 노화 예방에 도움을 줄 수 있으나, 토피컬 항산화제, 밤에 사용하는 레티놀, 항염 성분을 일상 관리에 포함해야 합니다."
						/>
					</AccordionItem>

					{/* 3. OR (지성 + 저항성) */}
					<AccordionItem
						title="Ⅲ. OR (지성 + 저항성)"
						highlightColor="#b0d23592"
					>
						<SkinTypeBox
							bgColor="#B5D335"
							titleColor="#333"
							indexColor="#444"
							descColor="#444"
							title="9 ORPT"
							index="지성, 저항성, 색소 불균일, 탄력 있음"
							description="다른 타입보다 주름과 자극에 덜 취약하지만, 고른 피부 톤 유지를 위해 매일 자외선 차단제가 필요합니다. ORPT 타입은 고농도의 활성 성분을 포함한 제품을 사용하여 색소 침착을 개선해야 합니다."
						/>

						<SkinTypeBox
							bgColor="#CCE39D"
							titleColor="#2c331e"
							indexColor="#2c331e"
							descColor="#2c331e"
							title="10 ORNT"
							index="지성, 저항성, 색소 불균일 없음, 탄력 있음"
							description="이 타입은 이상적인 피부 유형입니다! 적절하거나 다량의 피지를 분비하며, 피지에는 강력한 항노화 성분인 비타민 E가 풍부하게 함유되어 있습니다. ORNT 피부는 고른 피부 톤을 유지하며 노화 위험이 낮습니다. 따라서 매일 보습제를 사용할 필요가 없을 수도 있습니다."
						/>

						<SkinTypeBox
							bgColor="#83C15C"
							titleColor="#1e3312"
							indexColor="#1e3312"
							descColor="#1e3312"
							title="11 ORPW"
							index="지성, 저항성, 색소 불균일, 주름 취약"
							description="고르지 않은 피부 톤과 주름 발생 경향이 있는 타입입니다. 피부의 자연 피지가 노화 방지에 도움을 주지만, 식단과 스킨케어에 항산화제를 추가하는 것이 필요합니다. 고농도의 활성 성분 제품을 사용하는 것이 권장됩니다."
						/>

						<SkinTypeBox
							bgColor="#9FD6BC"
							titleColor="#1c1c1c"
							indexColor="#2a2a2a"
							descColor="#2a2a2a"
							title="12 ORNW"
							index="지성, 저항성, 색소 불균일 없음, 주름 취약"
							description="이 피부 타입은 주름이 생기기 쉬우나, 항산화제가 풍부한 보호 피지 덕분에 건성 피부 타입보다 주름 발생이 적습니다. ORNW 피부는 주름 개선을 위해 레티노이드와 알파 하이드록시산(AHA)과 같은 강력한 성분을 사용하는 것이 필요합니다."
						/>
					</AccordionItem>

					{/* 4. DR (건성 + 저항성) */}
					<AccordionItem
						title="Ⅳ. DR (건성 + 저항성)"
						highlightColor="#7da8dd92"
					>
						<SkinTypeBox
							bgColor="#46A5C4"
							titleColor="#fff"
							indexColor="#e4f9ff"
							descColor="#e4f9ff"
							title="13 DRPT"
							index="건성, 저항성, 색소 불균일, 탄력 있음"
							description="DRPT 피부 타입은 건조함과 고르지 않은 색소 침착이 주요 특징이며, 염증 발생은 드물고 주름도 적은 편입니다. 스킨케어는 매일 SPF 30 이상의 자외선 차단제, 보습제, 그리고 미백 성분을 포함해야 합니다."
						/>

						<SkinTypeBox
							bgColor="#9EC1E5"
							titleColor="#253142"
							indexColor="#2e3b4f"
							descColor="#2e3b4f"
							title="14 DRNT"
							index="건성, 저항성, 색소 불균일 없음, 탄력 있음"
							description="이 피부 타입은 건조함이 주된 특징이며, 고른 피부 톤과 적은 주름을 가지고 있습니다. 각질 제거 성분, 보습제, 그리고 매일 SPF 15 이상의 자외선 차단제 사용이 권장됩니다. 거품이 많이 나는 클렌저는 피하는 것이 좋습니다."
						/>

						<SkinTypeBox
							bgColor="#A892B2"
							titleColor="#fff"
							indexColor="#f7efff"
							descColor="#f7efff"
							title="15 DRPW"
							index="건성, 저항성, 색소 불균일, 주름 취약"
							description="DRPW 피부 타입은 건조함, 고르지 않은 색소 침착, 그리고 주름 발생 취약성이 주요 특징입니다. 스킨케어는 매일 자외선 차단제, 국소 항산화제, 밤에 사용하는 레티놀, 보습제, 알파 하이드록시 산(AHA), 그리고 피부 톤을 고르게 하는 성분을 포함해야 합니다."
						/>

						<SkinTypeBox
							bgColor="#C2B0CE"
							titleColor="#2e2239"
							indexColor="#3b2e4f"
							descColor="#3b2e4f"
							title="16 DRNW"
							index="건성, 저항성, 색소 불균일 없음, 주름 취약"
							description="고른 피부 톤을 가지지만 건조함과 주름에 취약합니다. SPF 15+ 자외선 차단제, 매일 국소 항산화제, 야간 레티놀이 포함된 스킨케어를 권장하며, 좋은 생활 습관과 항산화제 보충제를 식단에 추가하는 것이 좋습니다."
						/>
					</AccordionItem>
				</AccordionItem>
				<View style={{ height: 150 }} />
			</ScrollView>
		</>
	);
}

export default BaumannInfo;
