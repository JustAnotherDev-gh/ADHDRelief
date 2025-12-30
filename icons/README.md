# Icons Placeholder

This directory should contain the extension icons in PNG format:
- `icon16.png` - 16x16 pixels
- `icon48.png` - 48x48 pixels
- `icon128.png` - 128x128 pixels

## Temporary Solution

For now, we've included simple colored square placeholders below. For a production version, you should create proper icons.

## Creating Icons

You can:
1. Use a tool like Figma, Sketch, or Canva to design icons
2. Use an online icon generator
3. Commission a designer
4. Use free icon resources (with proper licensing)

## Icon Design Guidelines

For ADHDRelief, consider:
- Simple, clear design (avoid clutter)
- Muted, calming colors (blues, grays)
- Recognizable at small sizes
- Represents focus/calm (wave pattern, concentric circles, etc.)

## Quick Placeholder Creation

If you have ImageMagick installed, you can create simple colored placeholders:

```bash
# Create simple colored squares
convert -size 16x16 xc:#3d6a7c icons/icon16.png
convert -size 48x48 xc:#3d6a7c icons/icon48.png
convert -size 128x128 xc:#3d6a7c icons/icon128.png
```

Or use an online PNG creator tool.
