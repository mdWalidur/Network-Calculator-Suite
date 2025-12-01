#!/usr/bin/env python3
"""Generate PNG favicons from SVG favicon"""

from PIL import Image, ImageDraw, ImageFont
import os

def create_favicon_png(size, filename):
    """Create a PNG favicon with network hub design"""
    # Create image with transparent background
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Colors
    dark_bg = (26, 31, 46, 255)
    gold = (212, 175, 55, 255)
    blue = (74, 158, 255, 255)
    
    # Scale factors
    scale = size / 200
    
    # Background rounded rectangle
    corner_radius = int(45 * scale)
    draw.rounded_rectangle([(0, 0), (size, size)], corner_radius, fill=dark_bg)
    
    # Center point
    cx, cy = size // 2, size // 2
    
    # Hub sizes
    hub_outer = int(22 * scale)
    hub_inner = int(16 * scale)
    node_size = int(10 * scale)
    
    # Draw connection lines (diamond pattern)
    line_width = max(1, int(4 * scale))
    
    # Top connection
    draw.line([(cx, cy), (cx, cy - int(45 * scale))], fill=blue, width=line_width)
    # Right connection
    draw.line([(cx, cy), (cx + int(45 * scale), cy)], fill=gold, width=line_width)
    # Bottom connection
    draw.line([(cx, cy), (cx, cy + int(45 * scale))], fill=blue, width=line_width)
    # Left connection
    draw.line([(cx, cy), (cx - int(45 * scale), cy)], fill=gold, width=line_width)
    
    # Draw central hub (outer glow)
    glow_color = (212, 175, 55, 80)
    draw.ellipse([(cx - hub_outer, cy - hub_outer), 
                  (cx + hub_outer, cy + hub_outer)], 
                 fill=glow_color)
    
    # Draw central hub (inner solid)
    draw.ellipse([(cx - hub_inner, cy - hub_inner), 
                  (cx + hub_inner, cy + hub_inner)], 
                 fill=gold)
    
    # Draw network nodes (diamond pattern)
    # Top node
    draw.ellipse([(cx - node_size, cy - int(45 * scale) - node_size),
                  (cx + node_size, cy - int(45 * scale) + node_size)],
                 fill=blue)
    # Right node
    draw.ellipse([(cx + int(45 * scale) - node_size, cy - node_size),
                  (cx + int(45 * scale) + node_size, cy + node_size)],
                 fill=gold)
    # Bottom node
    draw.ellipse([(cx - node_size, cy + int(45 * scale) - node_size),
                  (cx + node_size, cy + int(45 * scale) + node_size)],
                 fill=blue)
    # Left node
    draw.ellipse([(cx - int(45 * scale) - node_size, cy - node_size),
                  (cx - int(45 * scale) + node_size, cy + node_size)],
                 fill=gold)
    
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
