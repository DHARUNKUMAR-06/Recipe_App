import sys
from PIL import Image
import colorsys
import math

def process_image(input_path, output_path):
    img = Image.open(input_path).convert("RGBA")
    pixels = img.load()
    width, height = img.size

    # Target green: #10b981 (16, 185, 129)
    # But wait, we should just extract the white robot and make it have a transparent background!
    # Let's see the background color from a corner
    bg_r, bg_g, bg_b, _ = pixels[0, 0]
    
    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            
            # Simple assumption: image is a white/grey bot on a solid blue bg
            # Let's find how "white" the pixel is.
            # Convert to distance from background
            dist_bg = math.sqrt((r-bg_r)**2 + (g-bg_g)**2 + (b-bg_b)**2)
            
            # Distance from pure white
            dist_w = math.sqrt((r-255)**2 + (g-255)**2 + (b-255)**2)
            
            # If it's close to background, it should be fully transparent.
            # If it's close to white, it should be fully opaque white.
            # Let's calculate an alpha value based on this.
            
            total_dist = dist_bg + dist_w
            if total_dist == 0: total_dist = 1
            
            alpha_ratio = dist_bg / total_dist
            
            # If the pixel is very close to bg, make it fully transparent.
            # This enables using the widget's native green background!
            if dist_bg < 10:
                pixels[x, y] = (0, 0, 0, 0)
            elif dist_w < 10:
                pixels[x, y] = (r, g, b, a)
            else:
                # Edge pixel, retain it with some opacity, but strip the blue tint
                # Make it white/grey with appropriate alpha
                brightness = (r + g + b) // 3
                new_a = int(alpha_ratio * 255)
                pixels[x, y] = (brightness, brightness, brightness, new_a)
                
    img.save(output_path)
    print("Saved transparent image to", output_path)

if __name__ == "__main__":
    process_image(sys.argv[1], sys.argv[2])
