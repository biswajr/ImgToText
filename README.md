# ImgToText

A modern black-themed image-to-text extraction web tool.

## Features

- Drag & drop or browse image upload.
- OCR text extraction using `tesseract.js`.
- Live extraction status.
- Copy extracted text to clipboard.
- Clean, responsive dark UI.

## Run locally

Because this project uses browser JavaScript and CDN assets, serve it with any static server:

```bash
python3 -m http.server 8000
```

Then open: `http://localhost:8000`

## Deploy on GitHub Pages

This repository includes a GitHub Actions workflow at `.github/workflows/deploy-pages.yml` that deploys the site automatically.

1. Push this repo to GitHub.
2. In **Settings → Pages**, set **Source** to **GitHub Actions**.
3. Ensure your default branch is `main` (or update the workflow trigger branch).
4. Push a commit to `main`.
5. After the workflow completes, your site will be available at:
   - `https://<your-username>.github.io/<repo-name>/`
