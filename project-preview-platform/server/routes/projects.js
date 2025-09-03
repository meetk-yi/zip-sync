const express = require('express');
const path = require('path');
const fs = require('fs-extra');

const router = express.Router();

// Get all projects
router.get('/', async (req, res) => {
  try {
    const projectsDir = path.join(__dirname, '../../projects');
    const files = await fs.readdir(projectsDir);

    const projects = [];
    for (const file of files) {
      if (file.endsWith('.json')) {
        const metadataPath = path.join(projectsDir, file);
        const metadata = await fs.readJson(metadataPath);
        projects.push(metadata);
      }
    }
    
    // Sort by upload date (newest first)
    projects.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
    
    res.json({ projects });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// Get project by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const metadataPath = path.join(__dirname, '../../projects', `${id}.json`);
    
    if (!(await fs.pathExists(metadataPath))) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    const metadata = await fs.readJson(metadataPath);
    res.json({ project: metadata });
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

// Delete project
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const metadataPath = path.join(__dirname, '../../projects', `${id}.json`);
    const projectDir = path.join(__dirname, '../../projects', id);
    
    if (!(await fs.pathExists(metadataPath))) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    // Remove project directory and metadata
    await fs.remove(projectDir);
    await fs.remove(metadataPath);
    
    res.json({ success: true, message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

// Update project status
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const metadataPath = path.join(__dirname, '../../projects', `${id}.json`);
    
    if (!(await fs.pathExists(metadataPath))) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    const metadata = await fs.readJson(metadataPath);
    metadata.status = status;
    metadata.lastUpdated = new Date().toISOString();
    
    await fs.writeJson(metadataPath, metadata);
    
    res.json({ success: true, project: metadata });
  } catch (error) {
    console.error('Error updating project status:', error);
    res.status(500).json({ error: 'Failed to update project status' });
  }
});

module.exports = router;
