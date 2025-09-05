import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, Trash2, AlertCircle, CheckCircle, Clock } from 'lucide-react';
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

  // No longer needed with static serving approach
  // const stopProject = async () => {
  //   try {
  //     await axios.post(`${API_BASE}/preview/${id}/stop`);
  //     await fetchProject(); // Refresh to get updated status
  //   } catch (err) {
  //     console.error('Error stopping project:', err);
  //     alert('Failed to stop project');
  //   }
  // };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'ready':
        return <CheckCircle size={20} className="text-green-600" />;
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
                <p><strong>Build Directory:</strong> {project.buildDir || 'build'}</p>
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
              href={project.url || `${API_BASE}/apps/${project.id}/${project.buildDir || 'build'}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
            >
              <Eye size={16} />
              Preview Project
            </a>

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
              <p><strong>Preview URL:</strong> <code>/apps/{project.id}/{project.buildDir || 'build'}</code></p>
            </div>
          </div>

          {project.status === 'error' && (
            <div className="alert alert-warning">
              <AlertCircle size={16} style={{ marginRight: '0.5rem' }} />
              <div>
                <strong>Build Error</strong>
                <p>The project build failed. Please check the build logs and try uploading again.</p>
              </div>
            </div>
          )}

          <div className="card">
            <h3 style={{ marginBottom: '1rem' }}>Usage Instructions</h3>
            <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
              <ol style={{ marginLeft: '1rem' }}>
                <li>Click "Preview Project" to open your project in a new tab</li>
                <li>The project is served as static files from the build directory</li>
                <li>Each project gets a unique URL: <code>/apps/{project.id}/{project.buildDir || 'build'}</code></li>
                <li>You can share this URL with others to showcase your project</li>
                <li>No server management needed - projects are always available</li>
              </ol>
            </div>
          </div>

          <div className="card">
            <h3 style={{ marginBottom: '1rem' }}>Security Notes</h3>
            <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
              <ul style={{ marginLeft: '1rem' }}>
                <li>Projects are served as static files with no server-side execution</li>
                <li>Each project is isolated in its own directory</li>
                <li>File access is restricted to the project's build output</li>
                <li>No dynamic server processes or network access</li>
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
