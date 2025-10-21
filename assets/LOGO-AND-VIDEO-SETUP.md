# Logo and Video Setup Instructions

## 📸 Step 1: Add Your Logo

### Save the Logo Image
1. **Save the first image** (WeBond logo with colorful people circle) as:
   ```
   c:\Users\a5509\Github\WeBond\assets\webond-logo.png
   ```

### What's Updated
- ✅ Navigation logo on **index.html** (landing page)
- ✅ Navigation logo on **app.html** (dashboard)
- ✅ Logo displays at 50px height (responsive down to 40px on mobile)
- ✅ Logo includes "TOGETHER, WEBOND HONG KONG" branding

## 🎥 Step 2: Add Your Video

### Video Frame Location
A beautiful video player frame has been added to the **hero section** on the right side of the landing page (index.html), exactly where you marked in the second image.

### How to Add Your Video

#### Option 1: YouTube Video
```html
<iframe 
    src="https://www.youtube.com/embed/YOUR_VIDEO_ID" 
    title="WeBond Demo Video" 
    frameborder="0" 
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
    allowfullscreen>
</iframe>
```

#### Option 2: Vimeo Video
```html
<iframe 
    src="https://player.vimeo.com/video/YOUR_VIDEO_ID" 
    title="WeBond Demo Video" 
    frameborder="0" 
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
    allowfullscreen>
</iframe>
```

#### Option 3: Direct Video File
```html
<video controls autoplay muted loop>
    <source src="assets/demo-video.mp4" type="video/mp4">
    Your browser does not support the video tag.
</video>
```

### Where to Update
**File:** `index.html`  
**Line:** Around line 646-651  
**Current code:**
```html
<iframe 
    src="" 
    title="WeBond Demo Video" 
    ...
</iframe>
```

**Replace the empty `src=""` with your video URL!**

## 🎨 Video Frame Features

- **16:9 aspect ratio** - Professional widescreen format
- **Rounded corners** (20px border radius) for modern look
- **Shadow effect** - Adds depth and prominence
- **White border** - Elegant 3px semi-transparent border
- **Placeholder** - Shows a play icon until you add your video
- **Fully responsive** - Adapts to mobile screens

## 📱 Responsive Design

### Desktop (>768px)
- Logo: 50px height
- Hero layout: 2 columns (content left, video right)
- Video: Full size in right column

### Mobile (<768px)
- Logo: 40px height
- Hero layout: Single column (stacked)
- Video: Full width below content

## ✨ New Slogan

The slogan has been updated to:
**"TOGETHER, WEBOND HONG KONG"**

This appears prominently in the hero section with:
- Large font size (1.3rem)
- Bold weight (600)
- Letter spacing for emphasis
- Purple gradient background

## 🎯 Quick Checklist

- [ ] Save logo as `assets/webond-logo.png`
- [ ] Add video URL to iframe src in `index.html`
- [ ] Test on desktop and mobile
- [ ] Verify logo displays correctly
- [ ] Ensure video plays/loads properly

## 💡 Tips

- **Logo format**: PNG with transparent background works best
- **Logo size**: At least 200x200px for crisp display
- **Video**: Keep under 30 seconds for best engagement
- **Video quality**: 1080p recommended for professional look
- **Autoplay**: Consider muting if using autoplay

All set! Your WeBond branding is ready to shine! 🚀
