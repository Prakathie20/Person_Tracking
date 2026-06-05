import cv2
from ultralytics import YOLO

# Load YOLOv8 model
model = YOLO("yolov8n.pt")  # lightweight + fast

# Open webcam
cap = cv2.VideoCapture(0)

if not cap.isOpened():
    print("Camera not opening")
    exit()

while True:
    ret, frame = cap.read()
    if not ret:
        break

    # 🔥 Tracking (ByteTrack is built-in)
    results = model.track(
        frame,
        persist=True,
        conf=0.25,
        iou=0.5,
        classes=[0],   # ONLY person
        verbose=False
    )

    # Draw results
    annotated_frame = results[0].plot()

    cv2.putText(
        annotated_frame,
        "Person_Track_with_ID",
        (20, 40),
        cv2.FONT_HERSHEY_SIMPLEX,
        1,
        (0, 0, 255),
        2
    )

    cv2.imshow("Best Tracker", annotated_frame)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()