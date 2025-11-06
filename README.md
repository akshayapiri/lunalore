# LunaLore 🌙

A magical web app where kids can write down their dreams and watch them transform into beautiful, whimsical bedtime stories.

## Features

- ✨ Dream input with past tense conversion
- 📖 AI-powered story generation (mock generator)
- 💾 Save and view your favorite stories
- 🎨 Beautiful moonlit theme with animations
- 🌙 Parallax moon effect
- ☁️ Floating clouds background
- 📱 Responsive design

## Tech Stack

- Pure HTML, CSS, and JavaScript
- No dependencies or build process required
- LocalStorage for story persistence
- Custom fonts (Super Chunky)

## Deployment

This is a static site that can be deployed on:
- Render (Static Site)
- Netlify
- Vercel
- GitHub Pages
- Any static hosting service

### Deploy on Render

1. Connect your GitHub repository to Render
2. Select "Static Site" as the service type
3. Set the build command to empty (no build needed)
4. Set the publish directory to `.` (root)
5. Deploy!

## Local Development

Simply open `index.html` in your browser or use a local server:

```bash
# Using Python
python -m http.server 8000

# Using Node.js (http-server)
npx http-server

# Using PHP
php -S localhost:8000
```

Then open `http://localhost:8000` in your browser.

## File Structure

```
lunalore/
├── index.html          # Main HTML file
├── script.js           # Story generation logic
├── styles.css          # Styling and animations
├── fonts/              # Custom fonts
│   └── SuperChunky-e9waB.ttf
└── README.md           # This file
```

## License

MIT

