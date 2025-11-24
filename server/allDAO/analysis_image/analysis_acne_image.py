from ultralytics import YOLO
import torch
import cv2


class Analysis_acne_image:
    def __init__(self):
        self.model = YOLO("/home/skinview/allDAO/analysis_image/analysis_best.pt")

    def draw_boxes(slef, image, results, box_color=(0, 255, 0), thickness=5):
        for box in results[0].boxes:
            x1, y1, x2, y2 = map(int, box.xyxy[0])
            cv2.rectangle(image, (x1, y1), (x2, y2), box_color, thickness)
        return image

    async def analysis_acne_image(self, origin_img, processed_img, area):
        print(f"[DEBUG] 처리된 photo dtype: {processed_img.dtype}")

        results = self.model.predict(
            source=processed_img,
            imgsz = 640,
            conf=0.2,
            iou=0.6,
            save=False,
            device="0" if torch.cuda.is_available() else "cpu",
        )

        if results:
            boxes = results[0].boxes
            num_boxes = len(boxes)

            total_acne_area = 0.0
            for box in boxes.xyxy:
                x1, y1, x2, y2 = box.tolist()
                box_area = (x2 - x1) * (y2 - y1)
                total_acne_area += box_area

            acne_area_ratio_in_face = (total_acne_area / float(area)) * 100 if area > 0 else 0.0

            res_img = self.draw_boxes(origin_img, results, box_color=(0, 255, 0), thickness=5)
            print(f"[DEBUG] Analysis..........Done!!")
            return res_img, num_boxes, acne_area_ratio_in_face
        else:
            print("❌ 추론 결과가 없습니다.")
            return None, 0, 0.0
