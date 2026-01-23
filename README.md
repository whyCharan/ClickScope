# 🎯 ClickScope

**ClickScope** is an AI-powered YouTube video analyzer designed to detect potential clickbait. It compares the "promise" of a video (Title + Thumbnail) against its actual "content" (Audio Transcript) to calculate a consistency score.

## 🚀 Features

- **YouTube Video Analysis**: Accepts YouTube URLs and processes them automatically.
- **Audio Transcription**: Uses **OpenAI Whisper** to transcribe speech to text.
- **Thumbnail Intelligence**:
  - Extracts text using **EasyOCR**.
  - Detects objects using **YOLOv11**.
- **Clickbait Scoring**: Calculates a mismatch score by checking if keywords from the title and thumbnail appear in the video transcript.
- **Modern UI**: A sleek, responsive frontend built with **React** and **Tailwind CSS**.

## 🛠️ Tech Stack

### Backend
- **Framework**: Python, FastAPI
- **AI/ML Models**:
  - `openai-whisper` (Audio Transcription)
  - `ultralytics` (YOLOv11 for Object Detection)
  - `easyocr` (Optical Character Recognition)
- **Utilities**: `yt-dlp` (Video Download), `opencv-python`

### Frontend
- **Framework**: React (Vite)
- **Styling**: Tailwind CSS, Framer Motion
- **Icons**: Lucide React
- **HTTP Client**: Axios

## 📋 Prerequisites

- **Python 3.8+**
- **Node.js 16+**
- **FFmpeg**: Required for audio processing by `yt-dlp` and `whisper`.

## 📦 Installation

### 1. Backend Setup

Navigate to the backend folder and install dependencies.

```bash
cd backend
# Recommended: Create and activate a virtual environment (e.g., using conda or venv)
# pip install -r ../requirements.txt
pip install -r requirements.txt
```

> **Note**: You may need to install PyTorch with CUDA support separately if you have a compatible GPU for faster processing.

### 2. Frontend Setup

Navigate to the frontend folder and install node modules.

```bash
cd frontend
npm install
```

## 🏃‍♂️ Usage

### Start the Backend
```bash
cd backend
python main.py
# Server will start at http://localhost:8000
```
*Alternatively, you can use the provided `run.bat` script if on Windows.*

### Start the Frontend
```bash
cd frontend
npm run dev
# App will open at http://localhost:5173
```

1. Open the frontend in your browser.
2. Paste a YouTube URL.
3. Click **Analyze**.
4. View the Clickbait Score, Reasoning, Detected Objects, and Transcript Preview.

## 🧠 How It Works

1. **Extraction**: The backend downloads the video audio and retrieves the high-quality thumbnail.
2. **Processing**:
   - **Whisper** converts audio to text.
   - **EasyOCR** reads text from the thumbnail image.
   - **YOLO** identifies objects in the thumbnail/video frame.
3. **Analysis**:
   - Keywords are extracted from the **Title** and **Thumbnail Text**.
   - The system checks if these keywords exist in the **Transcript**.
   - A **High Score (>70%)** indicates a high mismatch (Likely Clickbait).
   - A **Low Score (<40%)** indicates good consistency.


# Adjust score based on objects? 
# E.g. if "person" is in thumbnail but no "person" in video? (Hard to detect in audio)
# Ignoring objects for score for now, just returning them.