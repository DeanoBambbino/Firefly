import cloudinary
import cloudinary.uploader
from cloudinary import CloudinaryVideo

cloudinary.config(cloud_name = "dtpxju1dm", api_key = "854658849534371", api_secret = "kkVktYIWLTdC5ri3UNJ9UHGzu9A",secure = True)
def make_mp4(video_path):
    result = cloudinary.uploader.upload(
        video_path,
        resource_type="video",
        format="mp4"  # Ensures MP4 output
    )

    mp4_url = result['secure_url']
    return mp4_url


