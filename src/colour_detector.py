"""
Author: Jacob Pitsenberger
Date: 1/7/2024
Modified: Firefly BPM tracking added

This module provides real-time color detection with firefly flash timing.
When the 'firefly' color mask is active, it tracks how long green (firefly)
flashes are detected and calculates an average BPM from the flash intervals.
"""
import cv2
import numpy as np
import time
from Cloudinary_edits import make_mp4

class ColorDetector:
    COLOR_RANGES = {
        'red':      ([150, 80, 60],    [200, 255, 255]),
        'green':    ([50, 40, 50],   [90, 255, 255]),
        'blue':     ([90, 50, 50],   [120, 255, 255]),
        'yellow':   ([20, 100, 100], [30, 255, 255]),
        'purple':   ([125, 50, 50],  [140, 255, 255]),
        'white':    ([0, 0, 240],    [20, 20, 255]),
        'strict':   ([0, 0, 254],    [255, 255, 255]),
        'firefly':  ([45, 50, 50],   [95, 255, 255])
    }

    # Minimum number of green pixels to count as a "flash detected"
    FLASH_PIXEL_THRESHOLD = 80

    def __init__(self, video_source):
        self.frame = None
        video_source = make_mp4(video_source)
        if isinstance(video_source, str):
            self.cap = cv2.VideoCapture(video_source)
            if not self.cap.isOpened():
                raise FileNotFoundError(f"Could not open video file: {video_source}")
            

        else:
            self.cap = cv2.VideoCapture(video_source)
        self.time_list = []

        # Firefly tracking state
        self.flash_active = False       # Is a flash currently happening?
        self.flash_start_time = None    # When did the current flash start?
        self.flash_intervals = []       # Time between consecutive flash starts
        self.last_flash_start = None    # Start time of the previous flash (for interval calc)
        self.current_bpm = 0.0
        self.run()

    def create_color_mask(self, color):
        try:
            hsv = cv2.cvtColor(self.frame, cv2.COLOR_BGR2HSV)

            if color in self.COLOR_RANGES:
                lower_color, upper_color = self.COLOR_RANGES[color]
            else:
                raise ValueError("Unsupported color. Choose from: " + ', '.join(self.COLOR_RANGES.keys()))

            color_mask = cv2.inRange(hsv, np.array(lower_color), np.array(upper_color))
            result = cv2.bitwise_and(self.frame, self.frame, mask=color_mask)

            return result, color_mask

        except Exception as e:
            print(f"Error creating color mask: {e}")
            return None, None

    def update_firefly_timing(self, color_mask):
        """
        Track flash start/end times and compute BPM from flash intervals.
        Called every frame when the firefly mask is active.
        """
        if color_mask is None:
            return

        green_pixel_count = cv2.countNonZero(color_mask)
        flash_detected = green_pixel_count >= self.FLASH_PIXEL_THRESHOLD

        if flash_detected and not self.flash_active:
            # --- Flash just started ---
            self.flash_active = True
            self.flash_start_time = time.time()

            # Record interval from last flash start to this one
            if self.last_flash_start is not None:
                interval = self.flash_start_time - self.last_flash_start
                self.flash_intervals.append(interval)
                # Keep a rolling window of the last 10 flashes for a stable average
                if len(self.flash_intervals) > 10:
                    self.flash_intervals.pop(0)
                avg_interval = sum(self.flash_intervals) / len(self.flash_intervals)
                self.current_bpm = 60.0 / avg_interval
                print(f"[Flash #{len(self.flash_intervals)}] Interval: {interval:.2f}s | BPM: {self.current_bpm:.1f}")

            self.last_flash_start = self.flash_start_time

        elif not flash_detected and self.flash_active:
            # --- Flash just ended ---
            self.flash_active = False
            flash_duration = time.time() - self.flash_start_time
            print(f"  Flash ended. Duration: {flash_duration:.3f}s | Pixels at peak: {green_pixel_count}")

    def draw_overlay(self, frame):
        """Draw BPM and flash status onto the display frame."""
        h, w = frame.shape[:2]

        # BPM display
        bpm_text = f"BPM: {self.current_bpm:.1f}" if self.current_bpm > 0 else "BPM: waiting for flashes..."
        cv2.putText(frame, bpm_text, (10, 35), cv2.FONT_HERSHEY_SIMPLEX, 1.0, (0, 255, 0), 2)

        # Flash count
        count_text = f"Flashes recorded: {len(self.flash_intervals)}"
        cv2.putText(frame, count_text, (10, 70), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (200, 200, 200), 1)

        # Live flash indicator
        if self.flash_active:
            cv2.circle(frame, (w - 30, 30), 15, (0, 255, 0), -1)  # green dot = flashing
            cv2.putText(frame, "FLASH", (w - 80, 70), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 1)
        else:
            cv2.circle(frame, (w - 30, 30), 15, (50, 50, 50), -1)  # dark dot = no flash

        return frame

    def run(self):
        try:
            print("Welcome!\nPlease enter the color you would like to set for detecting...\n")
            print(f'Color Choices: {list(self.COLOR_RANGES.keys())}')
            color = 'firefly'
            print(f'Applying {color} color mask to video feed.')
            if color == 'firefly':
                print(f'Firefly BPM tracking active (threshold: {self.FLASH_PIXEL_THRESHOLD} pixels).')
            print('Press "c" to change color, "r" to reset BPM data, "q" to quit.')

            while True:
                ret, self.frame = self.cap.read()
                if not ret:
                    print("Failed to read from video source.")
                    break

                masked_frame, raw_mask = self.create_color_mask(color)

                if masked_frame is None:
                    continue

                # Run firefly timing only when tracking fireflies
                if color == 'firefly':
                    self.update_firefly_timing(raw_mask)
                    display_frame = self.draw_overlay(masked_frame)
                else:
                    display_frame = masked_frame

                cv2.imshow('frame', display_frame)
                key = cv2.waitKey(1)

                if key == ord('q'):
                    break
                elif key == ord('c'):
                    print(f'Color Choices: {list(self.COLOR_RANGES.keys())}')
                    color = input("Specify Color Mask: ")
                    print(f'Applying {color} color mask to video feed...')
                    if color == 'firefly':
                        print(f'Firefly BPM tracking active.')
                elif key == ord('r') and color == 'firefly':
                    self.flash_intervals.clear()
                    self.flash_active = False
                    self.flash_start_time = None
                    self.last_flash_start = None
                    self.current_bpm = 0.0
                    print("BPM data reset.")

            if self.current_bpm > 0:
                print(f"\nFinal average BPM: {self.current_bpm:.1f} (from {len(self.flash_intervals)} intervals)")

            self.cap.release()
            cv2.destroyAllWindows()
            
        except Exception as e:
            print(f"Error running Color Detector application: {e}")


def detect():
    vid_sor = input("Input a link to a video or None:")

    if vid_sor == "":
        print('fuck you')
    else:
        color_detector = ColorDetector(vid_sor)
    color_detector.run()

"""
if __name__ == "__main__":
    vid_sor = input("Input a link to a video or None:")

    if vid_sor == "":
        color_detector = ColorDetector()
    else:
        color_detector = ColorDetector(vid_sor)
    color_detector.run()
"""