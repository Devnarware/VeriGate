import { useRef, useState } from "react";
import {
  Upload,
  FileImage,
  FileText,
  X,
  CheckCircle2,
} from "lucide-react";

export default function DocumentUploader({ onFileSelect }) {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFile = (selectedFile) => {
    if (!selectedFile) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/pdf",
    ];

    if (!allowedTypes.includes(selectedFile.type)) {
      alert("Please upload a JPG, PNG, WEBP or PDF document.");
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      alert("File size must be less than 10 MB.");
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

    if (onFileSelect) {
      onFileSelect(null);
    }

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <div className="screening-upload-section">
      <div className="screening-section-header">
        <div>
          <h2>Document Upload</h2>
          <p>
            Upload an identity or travel document for automated screening.
          </p>
        </div>
      </div>

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
            accept=".jpg,.jpeg,.png,.webp,.pdf"
            onChange={handleInputChange}
            hidden
          />

          <div className="upload-icon">
            <Upload size={25} />
          </div>

          <h3>Upload document</h3>

          <p>
            Drag and drop your document here, or{" "}
            <span>browse files</span>
          </p>

          <small>
            Supported formats: JPG, PNG, WEBP, PDF · Maximum 10 MB
          </small>
        </div>
      ) : (
        <div className="selected-file">
          <div className="selected-file-icon">
            {file.type === "application/pdf" ? (
              <FileText size={23} />
            ) : (
              <FileImage size={23} />
            )}
          </div>

          <div className="selected-file-info">
            <strong>{file.name}</strong>
            <span>
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </span>
          </div>

          <div className="file-ready">
            <CheckCircle2 size={16} />
            Ready
          </div>

          <button
            type="button"
            className="remove-file"
            onClick={removeFile}
            title="Remove document"
          >
            <X size={17} />
          </button>
        </div>
      )}
    </div>
  );
}
