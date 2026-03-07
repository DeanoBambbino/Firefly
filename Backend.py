import requests
BPM = 150
def Search_BPM (BPM):
    # Define your variables
    api_key = "YOUR_API_KEY_HERE"
    base_url = "https://api.getsong.co/tempo/"

    # Build the URL using an f-string
    url = f"{base_url}?api_key={api_key}&bpm={BPM}"

    # Make the GET request
    response = requests.get(url)
    if response.status_code == 200:
        BPM_song_list = response.json()
        for song in BPM_song_list:
            print(f"Song: {title} | Artist: {artist} | BPM: {tempo}")
        return BPM_song_list
    else:
        print(f"Error: Received status code {response.status_code}")
        return []