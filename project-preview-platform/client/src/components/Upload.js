import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Upload as UploadIcon, ArrowLeft, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import axios from 'axios';
import { API_BASE } from '..';

const Upload = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleFileSelect = (selectedFile) => {
    if (selectedFile && selectedFile.type === 'application/zip') {
      setFile(selectedFile);
      setError(null);
      setResult(null);
    } else {
      setError('Please select a valid ZIP file');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    handleFileSelect(droppedFile);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleFileInputChange = (e) => {
    const selectedFile = e.target.files[0];
    handleFileSelect(selectedFile);
  };

  const uploadProject = async () => {
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append('project', file);

    try {
      const response = await axios.post(`${API_BASE}/api/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(progress);
        },
      });

      setResult(response.data);
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      console.error('Upload error:', err);
      
      let errorMessage = 'Failed to upload project';
      
      if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
        errorMessage = 'Cannot connect to server. Please ensure the backend is running on port 5000.';
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
        if (err.response.data.details) {
          errorMessage += ` (${err.response.data.details})`;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const resetUpload = () => {
    setFile(null);
    setResult(null);
    setError(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="App">
      <Header />
      <div className="container">
        <div className="card">
          <div className="card-header">
            <h1 className="card-title">Upload Project</h1>
            <p className="card-description">
              Upload a ZIP file containing your React or Next.js project. 
              The platform will automatically detect the project type, install dependencies, 
              and make it available for preview.
            </p>
          </div>

          {!result && (
            <>
              <div
                className={`upload-area ${dragOver ? 'dragover' : ''}`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
              >
                <UploadIcon size={48} className="upload-icon" />
                <div className="upload-text">
                  {file ? file.name : 'Drop your ZIP file here or click to browse'}
                </div>
                <div className="upload-subtext">
                  Supports React and Next.js projects (ZIP files only, max 100MB)
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".zip"
                  onChange={handleFileInputChange}
                  style={{ display: 'none' }}
                />
              </div>

              {file && (
                <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                  <p>Selected: <strong>{file.name}</strong> ({(file.size / 1024 / 1024).toFixed(2)} MB)</p>
                </div>
              )}

              {uploading && (
                <div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
                    <Loader className="spinner" style={{ display: 'inline-block', marginRight: '0.5rem' }} />
                    Uploading and processing... {uploadProgress}%
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button
                  onClick={uploadProject}
                  disabled={!file || uploading}
                  className="btn btn-primary"
                  style={{ opacity: (!file || uploading) ? 0.6 : 1 }}
                >
                  <UploadIcon size={16} />
                  {uploading ? 'Processing...' : 'Upload Project'}
                </button>
                
                {file && !uploading && (
                  <button onClick={resetUpload} className="btn btn-secondary">
                    Clear
                  </button>
                )}
              </div>
            </>
          )}

          {error && (
            <div className="alert alert-error">
              <AlertCircle size={16} style={{ marginRight: '0.5rem' }} />
              {error}
            </div>
          )}

          {result && (
            <div className="alert alert-success">
              <CheckCircle size={16} style={{ marginRight: '0.5rem' }} />
              <div>
                <strong>Project uploaded successfully!</strong>
                <div style={{ marginTop: '0.5rem' }}>
                  <p><strong>Project:</strong> {result.project.name}</p>
                  <p><strong>Type:</strong> {result.project.type}</p>
                  <p><strong>Status:</strong> {result.project.status}</p>
                  {result.project.buildSuccess === false && (
                    <p style={{ color: '#f59e0b' }}>
                      <strong>Note:</strong> Build failed, but project is still available for preview
                    </p>
                  )}
                </div>
                <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                  <a
                    href={result.previewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary"
                  >
                    Preview Project
                  </a>
                  <button
                    onClick={() => navigate(`/project/${result.project.id}`)}
                    className="btn btn-secondary"
                  >
                    View Details
                  </button>
                  <button onClick={resetUpload} className="btn btn-secondary">
                    Upload Another
                  </button>
                </div>
              </div>
            </div>
          )}

          <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '0.5rem' }}>
            <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Supported Project Types:</h3>
            <ul style={{ marginLeft: '1rem', color: '#64748b' }}>
              <li><strong>React:</strong> Projects created with Create React App or custom React setups</li>
              <li><strong>Next.js:</strong> Next.js applications with standard project structure</li>
            </ul>
            <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#64748b' }}>
              Make sure your project has a valid <code>package.json</code> file in the root directory.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const Header = () => (
  <header className="header">
    <div className="header-content">
      <Link to="/" className="logo">
        Project Preview Platform
      </Link>
      <nav className="nav">
        <Link to="/" className="nav-link">
          <ArrowLeft size={16} />
          Back to Dashboard
        </Link>
      </nav>
    </div>
  </header>
);

export default Upload;
