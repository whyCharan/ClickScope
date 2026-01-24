from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import analyzer
import os
import shutil

app = FastAPI()

# Allow CORS for React Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class VideoRequest(BaseModel):
    url: str

@app.get("/")
def home():
    return {"status": "Backend is running!", "docs": "/docs"}

@app.post("/analyze")
async def analyze_video(request: VideoRequest):
    try:
        
        
        print(f"Processing URL: {request.url}")
        
        output_dir = "temp_data"
        if os.path.exists(output_dir):
            shutil.rmtree(output_dir)
            
        audio_path, thumbnail_path, title, metadata = analyzer.download_video_data(request.url, output_dir)
        
        print("Transcribing Code...")
        transcript = analyzer.analyze_audio(audio_path)
        
        print("Analyzing Thumbnail...")
        thumbnail_text, objects = analyzer.analyze_thumbnail(thumbnail_path)
        
        print("Calculating Score...")
        score, missing, reasoning, stats = analyzer.calculate_clickbait_score(title, thumbnail_text, transcript, objects)
        
        
        return {
            "title": title,
            "clickbait_score": score,
            "thumbnail_text": thumbnail_text,
            "detected_objects": objects,
            "transcript_preview": transcript[:500] + "...",
            "missing_keywords": missing,
            "reasoning": reasoning,
            "metadata": metadata,
            "keyword_stats": stats
        }
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
