# Neon Background Setup Instructions

## 📸 Required Image

To activate the neon blur background across all website pages, you need to save your Hong Kong cityscape image.

### Steps:

1. **Save the image** you provided (Hong Kong skyline with neon lights) to:
   ```
   c:\Users\a5509\Github\WeBond\assets\neon-city.jpg
   ```

2. **That's it!** The background will automatically appear on all pages:
   - `app.html` - Main dashboard ✅
   - `index.html` - Landing page ✅
   - `chat-ui.html` - Chat interface ✅

## 🎨 Features Applied

- ✅ Neon blur background with slow panning animation
- ✅ Purple/pink gradient overlay for cohesive brand colors
- ✅ All text colors updated for maximum visibility
- ✅ White buttons now have dark text for readability
- ✅ Text shadows added for better contrast
- ✅ Cards made semi-transparent with glass effect

## 🛠️ Customization

If you want to adjust the blur or colors, edit:
- **Blur intensity**: Change `blur(8px)` in `.neon-background`
- **Overlay colors**: Modify the gradient in `.neon-overlay`
- **Animation speed**: Adjust `30s` in the animation property

All these settings are in `app.css` and inline styles in each HTML file.
