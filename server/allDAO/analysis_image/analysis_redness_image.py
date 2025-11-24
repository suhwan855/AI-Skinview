import torch
import cv2
import numpy as np
from ultralytics import YOLO


class Analysis_redness_image:
    def __init__(self):
        self.model = YOLO("/home/skinview/allDAO/analysis_image/redness_best.pt")

    async def analysis_redness_image(self, origin_img, area):
        redness_image = origin_img.copy()  # 기본값 초기화
        ratio = 0.0
        print(f"[DEBUG] origin_img dtype: {origin_img.dtype}")
        results = self.model.predict(
            source=origin_img,
            imgsz=640,
            conf=0.5,
            iou=0.6,
            save=False,
            device="0" if torch.cuda.is_available() else "cpu",
        ) 

        if results:
            for r in results:
                print(r.names)
                print(r.masks)
                print(r.boxes.conf)

                masks = r.masks
                if masks is None:
                    continue

                for mask_tensor in masks.data:
                    mask = mask_tensor.cpu().numpy().astype(np.uint8)

                    mask_resized = cv2.resize(mask, (origin_img.shape[1], origin_img.shape[0]))
                    mask_resized = (mask_resized > 0.5).astype(np.uint8)  # 이진 마스크 변환

                    # 면적 계산 (픽셀 단위)
                    mask_pixels = np.sum(mask_resized)
                    print(f"세그멘테이션 영역 픽셀 수: {mask_pixels}")

                    if area > 0:
                        ratio = (mask_pixels / area) * 100
                        print(f"얼굴 대비 홍조 비율 : {ratio:.2f}%")
                    else:
                        ratio = 0
                        print("홍조 없음")

                    color_hex = "#61dafb"
                    color = [int(color_hex[i:i+2], 16) for i in (1, 3, 5)]  # R,G,B 정수 리스트

                    colored_mask = np.zeros_like(origin_img, dtype=np.uint8)
                    for c in range(3):
                        colored_mask[:, :, c] = mask_resized * color[c]

                    redness_image = cv2.addWeighted(origin_img, 1.0, colored_mask, 0.4, 0)
      
        return redness_image, ratio

