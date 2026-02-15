const dropZone = document.getElementById("dropZone");
const fileInput = document.getElementById("fileInput");
const preview = document.getElementById("preview");
const extractBtn = document.getElementById("extractBtn");
const copyBtn = document.getElementById("copyBtn");
const clearBtn = document.getElementById("clearBtn");
const result = document.getElementById("result");
const statusText = document.getElementById("statusText");
const loader = document.getElementById("loader");
const sensitivityInput = document.getElementById("sensitivity");
const sensitivityValue = document.getElementById("sensitivityValue");
const enhanceToggle = document.getElementById("enhanceToggle");

let selectedFile = null;

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const setStatus = (message) => {
  statusText.textContent = message;
};

const setBusy = (busy) => {
  loader.classList.toggle("hidden", !busy);
  extractBtn.disabled = busy || !selectedFile;
  copyBtn.disabled = busy || !result.value.trim();
  clearBtn.disabled = busy || (!selectedFile && !result.value.trim());
};

const renderPreview = (file) => {
  if (!file) {
    preview.src = "";
    preview.classList.add("hidden");
    dropZone.querySelector(".drop-zone-content").classList.remove("hidden");
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    preview.src = String(reader.result || "");
    preview.classList.remove("hidden");
    dropZone.querySelector(".drop-zone-content").classList.add("hidden");
  };
  reader.onerror = () => {
    preview.src = "";
    preview.classList.add("hidden");
    dropZone.querySelector(".drop-zone-content").classList.remove("hidden");
    setStatus("Image preview failed to load. Please try another image.");
  };
  reader.readAsDataURL(file);
};

const readFileAsDataURL = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Unable to read image"));
    reader.readAsDataURL(file);
  });

const createImage = (src) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Unable to decode image"));
    image.src = src;
  });

const canvasToBlob = (canvas) =>
  new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Failed to process image"));
        return;
      }
      resolve(blob);
    }, "image/png");
  });

const buildOcrInput = async (file, sensitivity, shouldEnhance) => {
  if (!shouldEnhance) {
    return file;
  }

  const imageSrc = await readFileAsDataURL(file);
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) {
    throw new Error("Unable to create canvas context");
  }

  canvas.width = image.width;
  canvas.height = image.height;
  ctx.drawImage(image, 0, 0);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  const contrast = 1 + (sensitivity - 50) / 65;
  const threshold = clamp(168 - sensitivity * 0.85, 80, 190);

  for (let i = 0; i < data.length; i += 4) {
    const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
    const boosted = clamp((gray - 128) * contrast + 128, 0, 255);
    const binary = boosted >= threshold ? 255 : 0;
    data[i] = binary;
    data[i + 1] = binary;
    data[i + 2] = binary;
  }

  ctx.putImageData(imageData, 0, 0);
  return canvasToBlob(canvas);
};

const handleFile = (file) => {
  if (!file || !file.type.startsWith("image/")) {
    setStatus("Please select a valid image file.");
    return;
  }

  selectedFile = file;
  renderPreview(file);
  result.value = "";
  setStatus(`Ready to extract text from ${file.name}.`);
  setBusy(false);
};

sensitivityInput.addEventListener("input", () => {
  sensitivityValue.textContent = sensitivityInput.value;
});

dropZone.addEventListener("click", () => fileInput.click());
dropZone.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    fileInput.click();
  }
});

fileInput.addEventListener("change", (event) => {
  handleFile(event.target.files?.[0]);
});

["dragenter", "dragover"].forEach((eventName) => {
  dropZone.addEventListener(eventName, (event) => {
    event.preventDefault();
    event.stopPropagation();
    dropZone.classList.add("dragover");
  });
});

["dragleave", "drop"].forEach((eventName) => {
  dropZone.addEventListener(eventName, (event) => {
    event.preventDefault();
    event.stopPropagation();
    dropZone.classList.remove("dragover");
  });
});

dropZone.addEventListener("drop", (event) => {
  const [file] = event.dataTransfer.files;
  handleFile(file);
});

extractBtn.addEventListener("click", async () => {
  if (!selectedFile) {
    setStatus("Please upload an image first.");
    return;
  }

  try {
    setBusy(true);
    setStatus("Preparing image for OCR...");

    const sensitivity = Number(sensitivityInput.value);
    const ocrInput = await buildOcrInput(selectedFile, sensitivity, enhanceToggle.checked);

    const {
      data: { text },
    } = await Tesseract.recognize(ocrInput, "eng", {
      logger: (m) => {
        if (m.status === "recognizing text") {
          const pct = Math.round((m.progress || 0) * 100);
          setStatus(`Extracting text... ${pct}%`);
        }
      },
    });

    const cleaned = text.trim();
    result.value = cleaned;
    copyBtn.disabled = !cleaned;
    clearBtn.disabled = false;
    setStatus(cleaned ? "Text extracted successfully." : "No readable text found. Try increasing sensitivity.");
  } catch (error) {
    setStatus("Unable to extract text from this image. Adjust sensitivity and try again.");
    console.error(error);
  } finally {
    setBusy(false);
  }
});

copyBtn.addEventListener("click", async () => {
  if (!result.value.trim()) return;
  try {
    await navigator.clipboard.writeText(result.value);
    setStatus("Extracted text copied to clipboard.");
  } catch {
    setStatus("Copy failed. Please copy manually from the text box.");
  }
});

clearBtn.addEventListener("click", () => {
  selectedFile = null;
  fileInput.value = "";
  result.value = "";
  renderPreview(null);
  setStatus("Cleared. Upload another image.");
  setBusy(false);
});

setBusy(false);
