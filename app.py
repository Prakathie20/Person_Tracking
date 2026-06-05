import streamlit as st
import cv2
import tempfile
from ultralytics import YOLO

st.set_page_config(page_title="Person Tracking System", layout="wide")

st.title("🚶 AI Person Tracking System")
st.write("Upload a video to detect and track people using YOLOv8 + ByteTrack")

uploaded_file = st.file_uploader(
    "Upload Video",
    type=["mp4", "avi", "mov", "mkv"]
)

if uploaded_file is not None:

    temp_input = tempfile.NamedTemporaryFile(delete=False, suffix=".mp4")
    temp_input.write(uploaded_file.read())
    temp_input.close()

    st.success("Video uploaded successfully!")

    model = YOLO("yolov8n.pt")

    cap = cv2.VideoCapture(temp_input.name)

    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    fps = cap.get(cv2.CAP_PROP_FPS)

    output_path = "tracked_output.mp4"

    writer = cv2.VideoWriter(
        output_path,
        cv2.VideoWriter_fourcc(*"mp4v"),
        fps,
        (width, height)
    )

    frame_placeholder = st.empty()
    count_placeholder = st.empty()

    unique_ids = set()

    while cap.isOpened():

        success, frame = cap.read()

        if not success:
            break

        results = model.track(
            frame,
            persist=True,
            tracker="bytetrack.yaml",
            classes=[0],
            conf=0.5
        )

        annotated_frame = results[0].plot()

        if results[0].boxes.id is not None:
            ids = results[0].boxes.id.cpu().numpy().astype(int)

            for track_id in ids:
                unique_ids.add(track_id)

        count_placeholder.metric(
            "Total Unique Persons Detected",
            len(unique_ids)
        )

        frame_placeholder.image(
            cv2.cvtColor(annotated_frame, cv2.COLOR_BGR2RGB),
            use_container_width=True
        )

        writer.write(annotated_frame)

    cap.release()
    writer.release()

    st.success("Processing completed!")

    with open(output_path, "rb") as f:
        st.download_button(
            label="📥 Download Tracked Video",
            data=f,
            file_name="tracked_output.mp4",
            mime="video/mp4"
        )