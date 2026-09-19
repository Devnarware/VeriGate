import { useRef, useState } from "react";
import {
  Upload,
  FileImage,
  X,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export default function DocumentUploader({ onFileSelect, label = "Document", acceptText = "JPG, PNG, WEBP · Max 5 MB" }) {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

  const handleFile = (selectedFile) => {
    setErrorMsg("");
    if (!selectedFile) return;

    if (!allowedTypes.includes(selectedFile.type)) {
      setErrorMsg("Please upload a JPG, PNG, or WEBP image file (PDFs are not accepted).");
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setErrorMsg("File size exceeds 5 MB limit.");
      return;
    }

    setFile(selectedFile);
    if (onFileSelect) {
      onFileSelect(selectedFile);
    }
  };

  const handleInputChange = (event) => {
    handleFile(event.target.files?.[0]);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragActive(false);
    handleFile(event.dataTransfer.files?.[0]);
  };

  const removeFile = (event) => {
    event.stopPropagation();
    setFile(null);
    setErrorMsg("");
    if (onFileSelect) {
      onFileSelect(null);
    }
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <div className="screening-upload-section">
      {errorMsg && (
        <div className="upload-error-banner">
          <AlertCircle size={16} />
          <span>{errorMsg}</span>
        </div>
      )}

      {!file ? (
        <div
          className={`upload-zone ${dragActive ? "drag-active" : ""}`}
          onDragOver={(event) => {
            event.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
            onChange={handleInputChange}
            hidden
          />

          <div className="upload-icon">
            <Upload size={24} />
          </div>

          <h3>Upload {label}</h3>
          <p>
            Drag and drop image here, or <span>browse files</span>
          </p>
          <small>{acceptText}</small>
        </div>
      ) : (
        <div className="selected-file">
          <div className="selected-file-icon">
            <FileImage size={24} />
          </div>

          <div className="selected-file-info">
            <strong>{file.name}</strong>
            <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
          </div>

          <div className="file-ready">
            <CheckCircle2 size={16} />
            Ready for Analysis
          </div>

          <button
            type="button"
            className="remove-file"
            onClick={removeFile}
            title="Remove file"
          >
            <X size={17} />
          </button>
        </div>
      )}
    </div>
  );
}
