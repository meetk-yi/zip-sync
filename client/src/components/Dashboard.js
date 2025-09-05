import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Upload, Eye, Trash2, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { API_BASE } from '..';

const Dashboard = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/api/projects`);
      setProjects(response.data.projects);
    } catch (err) {
      setError('Failed to fetch projects');
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteProject = async (projectId) => {
    if (!window.confirm('Are you sure you want to delete this project?')) {
      return;
    }

    try {
      await axios.delete(`${API_BASE}/api/projects/${projectId}`);
      setProjects(projects.filter(p => p.id !== projectId));
    } catch (err) {
      console.error('Error deleting project:', err);
      alert('Failed to delete project');
    }
  };

  // No longer needed with static serving approach
  // const stopProject = async (projectId) => {
  //   try {
  //     await axios.post(`${API_BASE}/preview/${projectId}/stop`);
  //     await fetchProjects(); // Refresh to get updated status
  //   } catch (err) {
  //     console.error('Error stopping project:', err);
  //     alert('Failed to stop project');
  //   }
  // };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'ready':
        return <CheckCircle size={16} />;
      case 'error':
        return <AlertCircle size={16} />;
      default:
        return <Clock size={16} />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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

  return (
    <div className="App">
      <Header />
      <div className="container">
        <div className="card">
          <div className="card-header">
            <h1 className="card-title">Project Preview Platform</h1>
            <p className="card-description">
              Upload React or Next.js projects and preview them instantly with unique routes.
            </p>
          </div>
          
          <Link to="/upload" className="btn btn-primary">
            <Upload size={20} />
            Upload New Project
          </Link>
        </div>

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        {projects.length === 0 ? (
          <div className="card">
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <Upload size={48} style={{ margin: '0 auto 1rem', color: '#6b7280' }} />
              <h3>No Projects Yet</h3>
              <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
                Upload your first React or Next.js project to get started.
              </p>
              <Link to="/upload" className="btn btn-primary">
                Upload Project
              </Link>
            </div>
          </div>
        ) : (
          <div className="projects-grid">
            {projects.map((project) => (
              <div key={project.id} className="project-card">
                <div className="project-card-header">
                  <h3 className="project-name">{project.name}</h3>
                  <span className={`project-type ${project.type}`}>
                    {project.type}
                  </span>
                  <div className="project-meta">
                    <span>Uploaded {formatDate(project.uploadDate)}</span>
                    <span className={`project-status ${project.status}`}>
                      {getStatusIcon(project.status)}
                      {project.status}
                    </span>
                  </div>
                </div>
                
                <div className="project-actions">
                  <a
                    href={project.url || `${API_BASE}/apps/${project.id}/${project.buildDir || 'build'}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary"
                  >
                    <Eye size={16} />
                    Preview
                  </a>
                  
                  <Link to={`/project/${project.id}`} className="btn btn-secondary">
                    Details
                  </Link>
                  
                  <button
                    onClick={() => deleteProject(project.id)}
                    className="btn btn-danger"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
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
        <Link to="/" className="nav-link">Dashboard</Link>
        <Link to="/upload" className="nav-link">Upload</Link>
      </nav>
    </div>
  </header>
);

export default Dashboard;
