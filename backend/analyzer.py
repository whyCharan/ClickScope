import os
import yt_dlp
import whisper
import easyocr
from ultralytics import YOLO
import cv2
import re
import static_ffmpeg


static_ffmpeg.add_paths()

# Global Models (Lazy loading or load on startup)
# We load them on module request or first use to avoid blocking main thread import too long
whisper_model = None
reader = None
yolo_model = None

def load_models():
    global whisper_model, reader, yolo_model
    if whisper_model is None:
        print("Loading Whisper...")
        whisper_model = whisper.load_model("base")
    if reader is None:
        print("Loading EasyOCR...")
        reader = easyocr.Reader(['en'])
    if yolo_model is None:
        print("Loading YOLOv11...")
        yolo_model = YOLO("yolo11n.pt")

def download_video_data(url, output_dir="temp"):
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
    
    ydl_opts = {
        'format': 'bestaudio/best',
        'outtmpl': f'{output_dir}/%(id)s.%(ext)s',
        'postprocessors': [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'mp3',
            'preferredquality': '192',
        }],
        'writethumbnail': True,
        'writesubtitles': False,
        'nopart': True,
    }
    
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(url, download=True)
        video_id = info['id']
        title = info['title']
        
        
        audio_path = f"{output_dir}/{video_id}.mp3"
        
        thumbnail_path = None
        for file in os.listdir(output_dir):
            if file.startswith(video_id) and file.lower().endswith(('.jpg', '.jpeg', '.png', '.webp')):
                thumbnail_path = os.path.join(output_dir, file)
                break
        
        metadata = {
            'view_count': info.get('view_count', 0),
            'duration': info.get('duration', 0),
            'uploader': info.get('uploader', 'Unknown'),
            'upload_date': info.get('upload_date', 'Unknown')
        }
                
    return audio_path, thumbnail_path, title, metadata

def analyze_audio(audio_path):
    load_models()
    result = whisper_model.transcribe(audio_path, fp16=False)
    return result['text']

def analyze_thumbnail(image_path):
    load_models()
    # OCR
    # Manual load to ensure grayscale (fixes unpacking error in some easyocr versions)
    img = cv2.imread(image_path)
    if img is None:
        return "", [] # Handle empty
        
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    ocr_result = reader.readtext(gray, detail=0)
    thumbnail_text = " ".join(ocr_result)
    
    # YOLO Object Detection
    results = yolo_model(image_path)
    objects = []
    for r in results:
        for box in r.boxes:
            cls_id = int(box.cls[0])
            objects.append(yolo_model.names[cls_id])
            
    return thumbnail_text, list(set(objects)) # Unique objects

def calculate_clickbait_score(title, thumbnail_text, transcript, objects):
    
    def get_keywords(text):
        
        clean = re.sub(r'[^a-zA-Z0-9\s]', '', text.lower())
        words = clean.split()
        
        stop_words = {'the', 'is', 'in', 'at', 'of', 'on', 'and', 'a', 'to', 'for', 'with', 'it', 'this', 'that', 'my', 'video'}
        return set([w for w in words if w not in stop_words and len(w) > 2])

    
    promise_keywords = get_keywords(title + " " + thumbnail_text)
    
    transcript_lower = transcript.lower()
    
    matches = 0
    missing_keywords = []
    
    for kw in promise_keywords:
        if kw in transcript_lower:
            matches += 1
        else:
            missing_keywords.append(kw)
            
    total_promises = len(promise_keywords)
    if total_promises == 0:
        return 0, [], "No significant keywords found in title/thumbnail.", {}
        
    score = 1 - (matches / total_promises)
    
    
    reasoning = f"Found {matches}/{total_promises} keywords in video."
    if score > 0.7:
        reasoning += " High mismatch! Likely Clickbait."
    elif score > 0.4:
        reasoning += " Some mismatch. Potential Clickbait."
    else:
        reasoning += " Content matches title/thumbnail."

    stats = {
        "matches": matches,
        "total_keywords": total_promises,
        "keywords_found": [kw for kw in promise_keywords if kw in transcript_lower]
    }

    return round(score * 100, 2), missing_keywords, reasoning, stats

def cleanup(output_dir="temp"):
    if os.path.exists(output_dir):
        for f in os.listdir(output_dir):
            os.remove(os.path.join(output_dir, f))
        os.rmdir(output_dir)
