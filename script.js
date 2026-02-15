const dropZone = document.getElementById("dropZone");
const fileInput = document.getElementById("fileInput");
const preview = document.getElementById("preview");
const extractBtn = document.getElementById("extractBtn");
const copyBtn = document.getElementById("copyBtn");
const clearBtn = document.getElementById("clearBtn");
const result = document.getElementById("result");
const statusText = document.getElementById("statusText");
const loader = document.getElementById("loader");

let selectedFile = null;

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
    setStatus("Extracting text... this can take a few seconds.");

    const {
      data: { text },
    } = await Tesseract.recognize(selectedFile, "eng", {
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
    setStatus(cleaned ? "Text extracted successfully." : "No readable text found.");
  } catch (error) {
    setStatus("Unable to extract text from this image. Try another image.");
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
