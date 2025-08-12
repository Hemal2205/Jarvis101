from fastapi import APIRouter, UploadFile, File
from fastapi.responses import JSONResponse
import whisper
import tempfile
import os

router = APIRouter()

# Load Whisper model once at startup
model = whisper.load_model("base")

@router.post("/api/voice/transcribe")
async def transcribe(file: UploadFile = File(...)):
    # Save uploaded file to a temporary location
    with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
        tmp.write(await file.read())
        tmp_path = tmp.name

    # Transcribe using Whisper
    try:
        result = model.transcribe(tmp_path)
        text = result["text"]
    except Exception as e:
        os.remove(tmp_path)
        return JSONResponse({"error": str(e)}, status_code=500)

    os.remove(tmp_path)
    return JSONResponse({"text": text}) 