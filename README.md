# Firefly# 
Project Firefly
Powered by Cloudinary and getsongbpm.com
Brought to you by Tyler, Tuan, Dean, Ryan

**Analyzing firefly light patterns and matching them to music with similar BPM**

## Overview

Firefly is a computer vision project that detects the flashing patterns of fireflies and converts those flashes into a **beats-per-minute (BPM)** value. The system then searches for **popular songs with a similar BPM**, allowing users to create music playlists that match the rhythm of firefly light patterns.

The project combines **real-time video processing**, **color detection**, and **music tempo APIs** to bridge nature and music through rhythm.

---

## Features

*  **Real-time Firefly Detection**
  Uses computer vision to detect green firefly flashes from a video stream.

*  **Flash Timing Analysis**
  Tracks the timing between flashes to estimate an average BPM.

*  **Song Matching**
  Searches a music database API to find songs with similar BPM values.

*  **HSV Color Filtering**
  Uses HSV color masks to isolate firefly-colored light from the environment.

*  **Modular Backend Structure**
  Code is organized into modules for detection, BPM calculation, and playlist generation.

---

## How It Works

### 1. Firefly Detection

The system processes frames from a camera feed using **OpenCV**.
A color mask is applied to isolate firefly flashes using HSV color ranges.

### 2. Flash Timing

Each time a flash is detected:

* The timestamp is recorded.
* The time difference between flashes is calculated.

The BPM is then estimated using:

```
BPM = 60 / average_flash_interval
```

### 3. Song Search

Once a BPM value is calculated, the system queries a **song tempo API** to find songs with matching BPM values.

### 4. Playlist Generation

The returned songs are formatted into a list that can be used to build a playlist.

---

## Project Structure

Firefly/
│
├── index.html
├── README.md
├── LICENSE
│
└── Folder_Backend/
    ├── beatfinder.py
    ├── colour_detector.py
    ├── get_pixel_hsv_value.py
    └── Playlist_Structure.py

### Key Files

**`colour_detector.py`**

* Handles color detection and flash tracking
* Calculates the average BPM from detected flashes

**`beatfinder.py`**

* Sends BPM values to the music tempo API
* Retrieves songs with similar tempos

**`get_pixel_hsv_value.py`**

* Utility script used to determine HSV color values for tuning detection

**`Playlist_Structure.py`**

* Organizes songs returned from the API into playlist format

---

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/firefly.git
cd firefly
```

### 2. Install Dependencies

```bash
pip install opencv-python numpy requests
```

---

## Usage

Run the firefly detection system:

```bash
python colour_detector.py
```

When flashes are detected:

1. BPM is calculated
2. `beatfinder.py` searches for songs with a similar BPM
3. A list of songs is returned

---

## Example Workflow

```
Firefly flashes detected
        ↓
Flash intervals measured
        ↓
Average BPM calculated
        ↓
Song API queried
        ↓
Songs with matching BPM returned
```

Example:

```
Detected BPM: 102

Matching Songs:
- Song A – Artist
- Song B – Artist
- Song C – Artist
```

---

## Technologies Used

* **Python**
* **OpenCV**
* **NumPy**
* **Requests**
* **Song Tempo API (getsongbpm.com)**

---

## Future Improvements

*  Spotify or Apple Music playlist integration
*  Mobile interface for real-time viewing
*  Machine learning for improved firefly detection
*  Support for multiple flashing species
*  Visualization of flash patterns

---

## Inspiration

Fireflies communicate using rhythmic flashes.
This project explores the idea that **nature already has its own music**, and translates those rhythms into songs we can listen to.

---

## Contributors

* Firefly's – Firefly Rhythm Analysis

---

## License

This project is licensed under the MIT License. See `LICENSE` for details.
