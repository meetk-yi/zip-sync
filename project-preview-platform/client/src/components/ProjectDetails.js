import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, Trash2, Play, Square, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import axios from 'axios';
import { API_BASE } from '..';

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProject();
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/api/projects/${id}`);
      setProject(response.data.project);
    } catch (err) {
      setError('Failed to fetch project details');
      console.error('Error fetching project:', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteProject = async () => {
    if (!window.confirm('Are you sure you want to delete this project?')) {
      return;
    }

    try {
      await axios.delete(`${API_BASE}/api/projects/${id}`);
      navigate('/');
    } catch (err) {
      console.error('Error deleting project:', err);
      alert('Failed to delete project');
    }
  };

  const stopProject = async () => {
    try {
      await axios.post(`${API_BASE}/preview/${id}/stop`);
      await fetchProject(); // Refresh to get updated status
    } catch (err) {
      console.error('Error stopping project:', err);
      alert('Failed to stop project');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'ready':
        return <CheckCircle size={20} className="text-green-600" />;
      case 'running':
        return <Play size={20} className="text-blue-600" />;
      case 'error':
        return <AlertCircle size={20} className="text-red-600" />;
      default:
        return <Clock size={20} className="text-gray-600" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="App">
        <Header />
        <div className="container">
          <div className="loading">
            <div className="spinner"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="App">
        <Header />
        <div className="container">
          <div className="alert alert-error">
            {error || 'Project not found'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <Header />
      <div className="container">
        <div className="card">
          <div className="card-header">
            <h1 className="card-title">{project.name}</h1>
            <p className="card-description">
              Project details and management options
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            <div className="card">
              <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {getStatusIcon(project.status)}
                Project Status
              </h3>
              <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                <p><strong>Status:</strong> <span className={`project-status ${project.status}`}>{project.status}</span></p>
                <p><strong>Type:</strong> <span className={`project-type ${project.type}`}>{project.type}</span></p>
                <p><strong>Build Success:</strong> {project.buildSuccess ? 'Yes' : 'No'}</p>
                {project.port && <p><strong>Port:</strong> {project.port}</p>}
              </div>
            </div>

            <div className="card">
              <h3 style={{ marginBottom: '1rem' }}>Timeline</h3>
              <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                <p><strong>Uploaded:</strong> {formatDate(project.uploadDate)}</p>
                {project.lastStarted && (
                  <p><strong>Last Started:</strong> {formatDate(project.lastStarted)}</p>
                )}
                {project.lastUpdated && (
                  <p><strong>Last Updated:</strong> {formatDate(project.lastUpdated)}</p>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
            <a
              href={`${API_BASE}/preview/${project.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
            >
              <Eye size={16} />
              Preview Project
            </a>

            {project.status === 'running' && (
              <button onClick={stopProject} className="btn btn-secondary">
                <Square size={16} />
                Stop Server
              </button>
            )}

            <button onClick={deleteProject} className="btn btn-danger">
              <Trash2 size={16} />
              Delete Project
            </button>
          </div>

          <div className="card">
            <h3 style={{ marginBottom: '1rem' }}>Project Information</h3>
            <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
              <p><strong>Project ID:</strong> <code>{project.id}</code></p>
              <p><strong>Project Path:</strong> <code>{project.projectPath}</code></p>
              <p><strong>Preview URL:</strong> <code>/preview/{project.id}</code></p>
            </div>
          </div>

          {!project.buildSuccess && (
            <div className="alert alert-warning">
              <AlertCircle size={16} style={{ marginRight: '0.5rem' }} />
              <div>
                <strong>Build Warning</strong>
                <p>The project build failed, but the project is still available for preview. 
                   This might be due to missing dependencies or build configuration issues.</p>
              </div>
            </div>
          )}

          <div className="card">
            <h3 style={{ marginBottom: '1rem' }}>Usage Instructions</h3>
            <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
              <ol style={{ marginLeft: '1rem' }}>
                <li>Click "Preview Project" to open your project in a new tab</li>
                <li>The project will automatically start a development server if needed</li>
                <li>Each project gets a unique URL: <code>/preview/{project.id}</code></li>
                <li>You can share this URL with others to showcase your project</li>
                <li>Use "Stop Server" to free up resources when done</li>
              </ol>
            </div>
          </div>

          <div className="card">
            <h3 style={{ marginBottom: '1rem' }}>Security Notes</h3>
            <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
              <ul style={{ marginLeft: '1rem' }}>
                <li>Projects run in isolated environments with limited permissions</li>
                <li>Each project uses a unique port to prevent conflicts</li>
                <li>File access is restricted to the project directory</li>
                <li>Network access is limited for security purposes</li>
              </ul>
            </div>
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

export default ProjectDetails;
