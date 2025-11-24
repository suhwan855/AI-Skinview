from fastapi.responses import JSONResponse
from ultralytics import YOLO
import torch
import numpy as np
import cv2
from allDAO.image.iPPC import Preprocess_img
from allDAO.analysis_image.analysis_redness_image import Analysis_redness_image

analysis_redness_image = Analysis_redness_image()

preprocess_photo = Preprocess_img()

class Check_face:
    def __init__(self):
        self.model = YOLO("/home/skinview/allDAO/check_face/check_face_best.pt")

    async def check_face(self, photo):

        image = await photo.read()
        np_arr = np.frombuffer(image, np.uint8)
    
        # OpenCV 이미지로 디코딩
        decode_image = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
        # print(f"[DEBUG] 처리된 decode_image dtype: {decode_image.dtype}")

        predict_result = self.model.predict(
            source=decode_image,
            imgsz=1280,
            conf=0.6, 
            iou=0.5,
            save=False,  # 저장하지 않음
            device="0" if torch.cuda.is_available() else "cpu"
        )

        if len(predict_result) > 0:
            boxes = predict_result[0].boxes
            print(f"탐지된 객체 수: {len(boxes)}")
            if len(boxes) > 0:
                faces = []
                for box in boxes:
                    # box.xyxy: tensor 형태. 1x4 크기, (xmin, ymin, xmax, ymax)
                    xyxy = box.xyxy[0].cpu().numpy().astype(int)  # numpy 배열로 변환
                    xmin, ymin, xmax, ymax = xyxy

                    width = xmax - xmin
                    height = ymax - ymin
                    area = width * height
                    print(f"바운딩 박스 넓이: {area} (가로: {width}, 세로: {height})")

                    # 원본 이미지에서 얼굴 부분 crop
                    face_crop = decode_image[ymin:ymax, xmin:xmax]
                    
                    redness_image, redness_area = await analysis_redness_image.analysis_redness_image(face_crop, area)
                    # 필요 시 후처리
                    processed_face, acne_count, acne_area = await preprocess_photo.apply_clahe_and_white_balance(face_crop, area)
                    
                    faces.append(processed_face)
                
                # 만약 여러 얼굴 중 첫 번째 얼굴만 반환하려면
                return faces[0], redness_image, acne_count, acne_area, redness_area
            else:
                return None
            # 혹은 모든 얼굴 리스트를 반환하거나, 별도 처리 가능
        else:
            print("결과가 없습니다.")
            return None