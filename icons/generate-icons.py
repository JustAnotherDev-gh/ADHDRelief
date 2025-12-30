#!/usr/bin/env python3
"""
Simple script to generate placeholder icons for ADHDRelief extension.
Requires PIL/Pillow: pip install pillow
"""

try:
    from PIL import Image, ImageDraw
except ImportError:
    print("Error: Pillow is not installed.")
    print("Install it with: pip install pillow")
    exit(1)

def create_icon(size, filename):
    """Create a simple icon with a circle design."""
    # Create image with background color
    img = Image.new('RGB', (size, size), color='#1a1a1a')
    draw = ImageDraw.Draw(img)

    # Draw concentric circles (representing sound waves)
    center = size // 2
    color = '#3d6a7c'

    # Calculate circle sizes based on icon size
    max_radius = int(size * 0.4)
    num_circles = 3

    for i in range(num_circles):
        radius = max_radius - (i * max_radius // num_circles)
        if radius > 0:
            draw.ellipse(
                [(center - radius, center - radius),
                 (center + radius, center + radius)],
                outline=color,
                width=max(1, size // 32)
            )

    # Save
    img.save(filename, 'PNG')
    print(f"Created {filename} ({size}x{size})")

# Generate icons
sizes = [16, 48, 128]
for size in sizes:
    create_icon(size, f'icon{size}.png')

print("\nIcons created successfully!")
print("You can now load the extension in Chrome.")
