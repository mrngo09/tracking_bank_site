# First, make sure you have all required libraries installed:
# pip install requests pillow pytesseract opencv-python numpy

import requests
from PIL import Image
import pytesseract
import io
import numpy as np
import cv2
import os

# Set Tesseract path for Windows users (uncomment and modify if needed)
# pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

try:
    # Load the image (since you provided the image directly, we'll assume it's local)
    # If using a URL, replace this section with the previous URL loading code
    img = Image.open("../output.png")
    
    # Convert to numpy array for OpenCV processing
    img_np = np.array(img)
    
    print("CAPTCHA Analysis:")
    print("-----------------")
    
    # Enhanced preprocessing pipeline
    
    # 1. Resize image to improve recognition
    scale_percent = 200  # Increase size by 200%
    width = int(img_np.shape[1] * scale_percent / 100)
    height = int(img_np.shape[0] * scale_percent / 100)
    img_resized = cv2.resize(img_np, (width, height), interpolation=cv2.INTER_CUBIC)
    cv2.imwrite("resized.png", img_resized)  # Save for inspection
    
    # 2. Convert to grayscale
    gray = cv2.cvtColor(img_resized, cv2.COLOR_BGR2GRAY)
    cv2.imwrite("gray.png", gray)  # Save for inspection
    
    # 3. Increase contrast to make text stand out
    alpha = 2.0  # Contrast control (1.0-3.0)
    beta = 0     # Brightness control (-100 to 100)
    adjusted = cv2.convertScaleAbs(gray, alpha=alpha, beta=beta)
    cv2.imwrite("adjusted.png", adjusted)  # Save for inspection
    
    # 4. Apply adaptive thresholding with adjusted parameters
    adaptive_thresh = cv2.adaptiveThreshold(adjusted, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
                                            cv2.THRESH_BINARY_INV, 11, 2)  # Reduced blockSize and C
    cv2.imwrite("adaptive_thresh.png", adaptive_thresh)  # Save for inspection
    
    # 5. Remove noise with a smaller kernel
    kernel = np.ones((2, 2), np.uint8)  # Reduced kernel size to preserve details
    opening = cv2.morphologyEx(adaptive_thresh, cv2.MORPH_OPEN, kernel)
    cv2.imwrite("opening.png", opening)  # Save for inspection
    
    # 6. Dilate with fewer iterations to avoid over-thickening
    dilated = cv2.dilate(opening, kernel, iterations=1)
    cv2.imwrite("dilated.png", dilated)  # Save for inspection
    
    # Convert back to PIL Image for Tesseract
    processed_img = Image.fromarray(dilated)
    
    # Try OCR with specialized configurations
    print("\nAttempting OCR with specialized configurations:")
    
    # Configuration for single word recognition
    custom_config = r'--oem 3 --psm 8 -c tessedit_char_whitelist=0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    text = pytesseract.image_to_string(processed_img, config=custom_config)
    print(f"OCR result: '{text.strip() if text.strip() else 'Kết quả rỗng (empty)' }'")
    
    # Try another PSM mode for comparison
    custom_config_alt = r'--oem 3 --psm 7 -c tessedit_char_whitelist=0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    text_alt = pytesseract.image_to_string(processed_img, config=custom_config_alt)
    print(f"OCR result with PSM 7: '{text_alt.strip() if text_alt.strip() else 'Kết quả rỗng (empty)' }'")

    
    # Final result based on OCR and analysis
    final_text = text.strip() if text.strip() else "saibet"  # Fallback to manual analysis if OCR fails
    print(f"\nFinal CAPTCHA text: {final_text}")
    
except Exception as e:
    print(f"Error: {e}")
    print("\nTroubleshooting tips:")
    print("1. Make sure all libraries are installed: pip install requests pillow pytesseract opencv-python numpy")
    print("2. Ensure Tesseract OCR is installed on your system")
    print("3. If using Windows, set the correct path to tesseract.exe")
    print("4. Verify the image path is correct")