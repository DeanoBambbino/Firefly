import subprocess
import sys
import math
from colour_detector import ColorDetector
try:
    import requests
except ImportError:
    subprocess.check_call([sys.executable, "-m", "pip", "install", "requests"])
    import requests
BPM = 100

def Search_BPM (BPM):
    song_count = 0
    # Define your variables
    api_key = "-"
    base_url = "https://api.getsong.co/tempo/"

    # Build the URL using an f-string
    url = f"{base_url}?api_key={api_key}&bpm={BPM}"

    # Make the GET request
    response = requests.get(url)
    if response.status_code == 200:
        BPM_song_list = response.json()
        # Check if the data is a dictionary containing a list, or just a list
        if isinstance(BPM_song_list, dict):
            # Many APIs put the list inside a key called 'tempo' or 'data'
            # Based on GetSong's structure, it's usually inside 'tempo'
            BPM_song_list = BPM_song_list.get('tempo', [])
        else:
            BPM_song_list = BPM_song_list
            
        for song in BPM_song_list:
            if isinstance(song, dict):
                title = song.get('song_title', 'Unknown')
                
                # Pull the artist dictionary
                artist_data = song.get('artist', {})
                # Use 'name' to get the actual string
                artist = artist_data.get('name', 'Unknown Artist')
                album_data = song.get('album', {})
                album = album_data.get('title', 'Unknown Album')
                tempo = song.get('bpm', BPM) 
                
            #TEST
                #print(f"Song: {title} | Artist: {artist} | BPM: {tempo}|Album: {album}")
            else:
                # If it's still a string, just print the string to see what it is
                print(f"Found something that isn't a song: {song}")
        print("|Number of song's:",(song_count))
        song_count = len(BPM_song_list)
        return BPM_song_list
    else:
        print(f"Error: Received status code {response.status_code}")
        return []
    
c = ColorDetector("https://cdn.discordapp.com/attachments/239526221543768064/1417967638415671429/crisp.mp4?ex=69add945&is=69ac87c5&hm=7a3bfd8a16adb6561d46939c879212eb6aad533f2e299110b53e11ad4230219b&")
bpm = math.ceil(c.current_bpm)
too_fast = False 
too_slow = False 
if 30 <= bpm <40:
    bpm = 40
elif 220 < bpm <= 230:
    bpm = 220 
elif bpm > 220:
    too_fast = True
elif bpm <40:
    too_slow = True

if too_slow == False and too_fast == False:
    Search_BPM(bpm)
elif too_fast == True:
    print("too many bpm")
else:
    print("Too slow bpm")

    