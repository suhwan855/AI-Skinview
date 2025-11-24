import cv2
import numpy as np

from allDAO.analysis_image.analysis_acne_image import Analysis_acne_image

analysis_acne_image = Analysis_acne_image()

class Preprocess_img:
    async def apply_clahe_and_white_balance(self, photo, face_area):

        # 디버깅을 위한 데이터 타입 및 형태 출력 (문제 발생 시 유용)

        # (여기에 전처리 작업)
        # BGR을 LAB로 변환하고 float32로 캐스팅
        lab = cv2.cvtColor(photo, cv2.COLOR_BGR2LAB).astype(np.float32)
        # 화이트 밸런싱 로직
        avg_a = lab[:, :, 1].mean()
        avg_b = lab[:, :, 2].mean()

        lab[:, :, 1] -= ((avg_a - 128) * (lab[:, :, 0] / 255.0) * 1.1)
        lab[:, :, 2] -= ((avg_b - 128) * (lab[:, :, 0] / 255.0) * 1.1)

        # 결과값을 0-255 범위로 클리핑하고 uint8로 다시 캐스팅
        lab = np.clip(lab, 0, 255).astype(np.uint8)


        # # CLAHE 적용을 위한 LAB 변환
        l, a, b = cv2.split(lab)

        # CLAHE 객체 생성 및 L 채널에 적용
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        cl = clahe.apply(l)

        # CLAHE 적용된 L 채널과 원본 a, b 채널을 다시 병합
        final = cv2.merge((cl, a, b))

        # 최종 LAB를 BGR로 변환
        processed_img = cv2.cvtColor(final, cv2.COLOR_LAB2BGR)

        # 처리된 이미지를 JPG 형식으로 인코딩

        analy_img, acne_count, acne_area = await analysis_acne_image.analysis_acne_image(photo, processed_img, face_area)
        print(f"[DEBUG] iPPC..........Done!!")
        # 인코딩된 바이트 반환
        return analy_img, acne_count, acne_area