# ImgToText

ImgToText is a polished, browser-based OCR application for extracting text from images quickly and reliably.

## Overview

The app runs entirely on the client side and uses Tesseract.js for recognition. Users can upload an image, adjust OCR sensitivity for low-quality scans, and copy extracted text instantly.

## Key Features

- Modern black-themed interface optimized for readability.
- Drag-and-drop and click-to-upload support.
- Live image preview before extraction.
- OCR sensitivity slider to improve recognition on noisy/faded images.
- Optional contrast enhancement mode for difficult documents.
- Real-time extraction status updates.
- One-click copy to clipboard.

## Tech Stack

- HTML5
- CSS3
- Vanilla JavaScript (ES6+)
- [Tesseract.js](https://github.com/naptha/tesseract.js)

## Local Development

Serve the project as a static site:

```bash
python3 -m http.server 8000
```

Open:

```text
http://localhost:8000
```

## GitHub Pages Deployment

This repository includes a GitHub Actions workflow at `.github/workflows/deploy-pages.yml`.

1. Push the repository to GitHub.
2. Navigate to **Settings → Pages**.
3. Set **Build and deployment source** to **GitHub Actions**.
4. Ensure your deployment branch matches the workflow trigger (`main` by default).
5. Push to `main` or run the workflow manually from **Actions**.

Published URL format:

```text
https://<your-username>.github.io/<repo-name>/
```

## Project Structure

```text
.
├── index.html
├── styles.css
├── script.js
└── .github/workflows/deploy-pages.yml
```

## License

This project is released under the terms of the LICENSE file in this repository.
