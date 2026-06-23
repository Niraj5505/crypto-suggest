from PIL import Image
import numpy as np

def remove_white_background(input_path, output_path, threshold=240):
    img = Image.open(input_path).convert("RGBA")
    data = np.array(img)

    r, g, b, a = data[:, :, 0], data[:, :, 1], data[:, :, 2], data[:, :, 3]

    # Pixels that are near-white: all channels > threshold
    white_mask = (r > threshold) & (g > threshold) & (b > threshold)

    # Set those pixels to fully transparent
    data[white_mask] = [255, 255, 255, 0]

    result = Image.fromarray(data)
    result.save(output_path, "PNG")
    print(f"Saved transparent logo to: {output_path}")

remove_white_background(
    r"C:\Users\thank\Desktop\cryptosuggest\public\logo.png",
    r"C:\Users\thank\Desktop\cryptosuggest\public\logo.png"
)
