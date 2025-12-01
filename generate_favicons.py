#!/usr/bin/env python3
"""Generate PNG favicons from SVG favicon"""

from PIL import Image, ImageDraw
import os

def create_favicon_png(size, filename):
    """Create a PNG favicon with hexagonal network design"""
    # Create image with transparent background
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Colors - vibrant gradient palette
    dark_bg = (26, 31, 58, 255)
    orange = (255, 107, 53, 255)
    gold = (253, 200, 48, 255)
    purple = (118, 75, 162, 255)
    blue = (102, 126, 234, 255)
    
    # Scale factors
    scale = size / 200
    
    # Background rounded rectangle
    corner_radius = int(48 * scale)
    draw.rounded_rectangle([(0, 0), (size, size)], corner_radius, fill=dark_bg)
    
    # Center point
    cx, cy = size // 2, size // 2
    
    # Hexagon dimensions
    hex_height = int(60 * scale)
    hex_width = int(30 * scale)
    node_size = max(2, int(7 * scale))
    line_width = max(1, int(3 * scale))
    
    # Top hexagon vertices
    top_top = (cx, cy - hex_height)
    top_right_upper = (cx + hex_width, cy - int(40 * scale))
    top_right_lower = (cx + hex_width, cy - int(20 * scale))
    top_left_upper = (cx - hex_width, cy - int(40 * scale))
    top_left_lower = (cx - hex_width, cy - int(20 * scale))
    
    # Bottom hexagon vertices
    bot_top_right = (cx + hex_width, cy + int(20 * scale))
    bot_top_left = (cx - hex_width, cy + int(20 * scale))
    bot_right_upper = (cx + hex_width, cy + int(40 * scale))
    bot_left_upper = (cx - hex_width, cy + int(40 * scale))
    bot_bottom = (cx, cy + hex_height)
    
    # Draw hexagon outlines
    # Top hexagon (orange gradient)
    draw.line([top_top, top_right_upper], fill=orange, width=line_width)
    draw.line([top_right_upper, top_right_lower], fill=gold, width=line_width)
    draw.line([top_right_lower, (cx, cy)], fill=gold, width=line_width)
    draw.line([(cx, cy), top_left_lower], fill=gold, width=line_width)
    draw.line([top_left_lower, top_left_upper], fill=orange, width=line_width)
    draw.line([top_left_upper, top_top], fill=orange, width=line_width)
    
    # Bottom hexagon (purple gradient)
    draw.line([(cx, cy), bot_top_right], fill=blue, width=line_width)
    draw.line([bot_top_right, bot_right_upper], fill=purple, width=line_width)
    draw.line([bot_right_upper, bot_bottom], fill=purple, width=line_width)
    draw.line([bot_bottom, bot_left_upper], fill=purple, width=line_width)
    draw.line([bot_left_upper, bot_top_left], fill=blue, width=line_width)
    draw.line([bot_top_left, (cx, cy)], fill=blue, width=line_width)
    
    # Draw nodes
    # Top hexagon nodes
    draw.ellipse([(top_top[0] - node_size, top_top[1] - node_size),
                  (top_top[0] + node_size, top_top[1] + node_size)], fill=orange)
    draw.ellipse([(top_right_upper[0] - node_size, top_right_upper[1] - node_size),
                  (top_right_upper[0] + node_size, top_right_upper[1] + node_size)], fill=gold)
    draw.ellipse([(top_right_lower[0] - node_size, top_right_lower[1] - node_size),
                  (top_right_lower[0] + node_size, top_right_lower[1] + node_size)], fill=gold)
    draw.ellipse([(top_left_upper[0] - node_size, top_left_upper[1] - node_size),
                  (top_left_upper[0] + node_size, top_left_upper[1] + node_size)], fill=orange)
    draw.ellipse([(top_left_lower[0] - node_size, top_left_lower[1] - node_size),
                  (top_left_lower[0] + node_size, top_left_lower[1] + node_size)], fill=gold)
    
    # Bottom hexagon nodes
    draw.ellipse([(bot_top_right[0] - node_size, bot_top_right[1] - node_size),
                  (bot_top_right[0] + node_size, bot_top_right[1] + node_size)], fill=blue)
    draw.ellipse([(bot_right_upper[0] - node_size, bot_right_upper[1] - node_size),
                  (bot_right_upper[0] + node_size, bot_right_upper[1] + node_size)], fill=purple)
    draw.ellipse([(bot_left_upper[0] - node_size, bot_left_upper[1] - node_size),
                  (bot_left_upper[0] + node_size, bot_left_upper[1] + node_size)], fill=purple)
    draw.ellipse([(bot_top_left[0] - node_size, bot_top_left[1] - node_size),
                  (bot_top_left[0] + node_size, bot_top_left[1] + node_size)], fill=blue)
    draw.ellipse([(bot_bottom[0] - node_size, bot_bottom[1] - node_size),
                  (bot_bottom[0] + node_size, bot_bottom[1] + node_size)], fill=purple)
    
    # Central hub - white with purple core
    hub_outer = max(3, int(10 * scale))
    hub_inner = max(2, int(6 * scale))
    draw.ellipse([(cx - hub_outer, cy - hub_outer), 
                  (cx + hub_outer, cy + hub_outer)], 
                 fill=(255, 255, 255, 255))
    draw.ellipse([(cx - hub_inner, cy - hub_inner), 
                  (cx + hub_inner, cy + hub_inner)], 
                 fill=purple)
    
    # Save
    img.save(filename, 'PNG')
    print(f"Created {filename}")

# Generate favicons
sizes = [16, 32, 48, 180]
script_dir = os.path.dirname(os.path.abspath(__file__))

for size in sizes:
    filename = os.path.join(script_dir, f'favicon-{size}.png')
    create_favicon_png(size, filename)

# Create ICO file (multi-size)
print("\nCreating favicon.ico...")
images = []
for size in [16, 32, 48]:
    filename = os.path.join(script_dir, f'favicon-{size}.png')
    images.append(Image.open(filename))

ico_path = os.path.join(script_dir, 'favicon.ico')
images[0].save(ico_path, format='ICO', sizes=[(16, 16), (32, 32), (48, 48)])
print(f"Created {ico_path}")

print("\n✅ All favicons generated successfully!")
