import subprocess
import sys
try:
    import requests
except ImportError:
    subprocess.check_call([sys.executable, "-m", "pip", "install", "requests"])
    import requests
BPM = 100

def Search_BPM (BPM):
    song_count = 0
    # Define your variables
    api_key = "b07aebb582279c669b8d2f42834f61ef"
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
                song_count += 1
                
            #TEST
                #print(f"Song: {title} | Artist: {artist} | BPM: {tempo}|Album: {album}")
                for thing in playlist:
                    print(thing)
            else:
                # If it's still a string, just print the string to see what it is
                print(f"Found something that isn't a song: {song}")
        print("|Number of song's:",(song_count))
        return BPM_song_list
    else:
        print(f"Error: Received status code {response.status_code}")
        return []
    
Search_BPM(BPM)
