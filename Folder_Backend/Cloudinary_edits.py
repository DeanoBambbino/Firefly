import cloudinary
import cloudinary.uploader
from cloudinary import CloudinaryVideo

cloudinary.config(
  cloud_name = "doxmegevi",
  api_key = "554615741717644",
  api_secret = "k5JWnIJsNM6xzURScQUvQdKtrxM",
  secure = True
)

def make_mp4(video_path):
    result = cloudinary.uploader.upload(
        video_path,
        resource_type="video",
        format="mp4"
    )
    public_id = result['public_id']

    base_video = CloudinaryVideo(public_id)
    transformed_url = base_video.build_url(transformation=[
        {'effect': "saturation:80"},
        {'effect': "contrast:30"},
    ])

    return transformed_url

# Example usage
#print(make_mp4("https://cdn.discordapp.com/attachments/239526221543768064/1417967638415671429/crisp.mp4?ex=69add945&is=69ac87c5&hm=7a3bfd8a16adb6561d46939c879212eb6aad533f2e299110b53e11ad4230219b&"))