class playlist:
    """Defines the amount of songs and organizes Song name, Artist, BPM and Album"""
    
    def __init__(self,name,artist,BPM,album):
        self.name = name
        self.artist = artist
        self.BPM = BPM
        self.album = album
        return None
    
    def __str__(self):
        # your code here
        string = (f"Song Name:{self.name} \n Artist:{self.artist}\n BPM: {self.BPM}\n Album{self.album}")
        return string
