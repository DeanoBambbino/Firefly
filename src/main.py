from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from beatfinder import detect, Search_BPM
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], # your React dev server
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/analyze")
def get_song(cloudinary_url: str):
    bpm = detect(cloudinary_url)
    if bpm is None:
        return { "bpm": None, "songs": [] }
    songs = Search_BPM(bpm)
    return { "bpm": bpm, "songs": songs }

