const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
const yauzl = require('yauzl');
const { v4: uuidv4 } = require('uuid');
const { spawn } = require('child_process');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
    files: 1 // Only allow 1 file
  },
  fileFilter: (req, file, cb) => {
    console.log('File upload attempt:', {
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size
    });
    
    if (file.mimetype === 'application/zip' || 
        file.mimetype === 'application/x-zip-compressed' ||
        file.originalname.toLowerCase().endsWith('.zip')) {
      cb(null, true);
    } else {
      cb(new Error('Only ZIP files are allowed'), false);
    }
  }
});

// Extract ZIP file
const extractZip = (zipPath, extractPath) => {
  return new Promise((resolve, reject) => {
    yauzl.open(zipPath, { lazyEntries: true }, (err, zipfile) => {
      if (err) return reject(err);

      zipfile.readEntry();
      zipfile.on('entry', (entry) => {
        if (/\/$/.test(entry.fileName)) {
          // Directory entry
          const dirPath = path.join(extractPath, entry.fileName);
          fs.ensureDir(dirPath, (err) => {
            if (err) return reject(err);
            zipfile.readEntry();
          });
        } else {
          // File entry
          zipfile.openReadStream(entry, (err, readStream) => {
            if (err) return reject(err);

            const filePath = path.join(extractPath, entry.fileName);
            fs.ensureDir(path.dirname(filePath), (err) => {
              if (err) return reject(err);

              const writeStream = fs.createWriteStream(filePath);
              readStream.pipe(writeStream);
              writeStream.on('close', () => {
                zipfile.readEntry();
              });
            });
          });
        }
      });

      zipfile.on('end', () => {
        resolve();
      });

      zipfile.on('error', reject);
    });
  });
};

// Get project commands from package.json scripts
const getProjectCommands = async (projectPath) => {
  const packageJsonPath = path.join(projectPath, 'package.json');
  
  if (!(await fs.pathExists(packageJsonPath))) {
    return null;
  }
  
  const packageJson = await fs.readJson(packageJsonPath);
  const scripts = packageJson.scripts || {};
  const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  return {
    scripts,
    dependencies,
    packageJson
  };
};

// Add missing start script for Vite projects
const ensureViteStartScript = async (projectPath, packageJson) => {
  if (!packageJson.scripts.start && packageJson.scripts.build?.includes('vite')) {
    console.log('Adding missing start script for Vite project');
    packageJson.scripts.start = 'vite preview';
    
    const packageJsonPath = path.join(projectPath, 'package.json');
    await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
    
    return true;
  }
  return false;
};

// Detect project type and get commands
const detectProjectType = async (projectPath) => {
  const commandInfo = await getProjectCommands(projectPath);
  
  if (!commandInfo) {
    return { type: 'unknown', commands: null };
  }
  
  let { scripts, dependencies, packageJson } = commandInfo;
  
  let type = 'unknown';
  let devCommand = null;
  let buildCommand = null;
  let buildDir = 'build';
  let startCommand = null;
  let scriptsModified = false;
  
  // Detect Next.js
  if (dependencies.next || packageJson.name?.includes('next')) {
    type = 'nextjs';
    devCommand = scripts.dev || 'next dev';
    buildCommand = scripts.build || 'next build';
    startCommand = scripts.start || 'next start';
    buildDir = '.next';
  }
  // Detect Vite React
  else if (dependencies.vite || scripts.dev?.includes('vite') || scripts.build?.includes('vite')) {
    type = 'vite-react';
    devCommand = scripts.dev || scripts.serve || 'vite';
    buildCommand = scripts.build || 'vite build';
    buildDir = 'dist';
    
    // Ensure Vite projects have a start script
    scriptsModified = await ensureViteStartScript(projectPath, packageJson);
    if (scriptsModified) {
      // Re-read the updated package.json
      const updatedCommandInfo = await getProjectCommands(projectPath);
      scripts = updatedCommandInfo.scripts;
      packageJson = updatedCommandInfo.packageJson;
    }
    
    startCommand = scripts.start || 'vite preview';
  }
  // Detect Create React App
  else if (dependencies['react-scripts']) {
    type = 'react';
    devCommand = scripts.start || 'react-scripts start';
    buildCommand = scripts.build || 'react-scripts build';
    startCommand = scripts.start || 'react-scripts start';
    buildDir = 'build';
  }
  // Detect regular React project
  else if (dependencies.react) {
    type = 'react';
    devCommand = scripts.start || scripts.dev || 'npm start';
    buildCommand = scripts.build || 'npm run build';
    startCommand = scripts.start || scripts.dev || 'npm start';
    buildDir = scripts.build?.includes('vite') ? 'dist' : 'build';
  }
  
  return {
    type,
    commands: {
      dev: devCommand,
      build: buildCommand,
      start: startCommand,
      buildDir
    },
    scripts,
    dependencies,
    scriptsModified
  };
};

// Find the actual project directory (handle nested structures)
const findProjectRoot = async (extractPath) => {
  const items = await fs.readdir(extractPath);
  
  // Check if package.json exists in root
  if (await fs.pathExists(path.join(extractPath, 'package.json'))) {
    return extractPath;
  }
  
  // Look for package.json in subdirectories
  for (const item of items) {
    const itemPath = path.join(extractPath, item);
    const stat = await fs.stat(itemPath);
    
    if (stat.isDirectory()) {
      const packageJsonPath = path.join(itemPath, 'package.json');
      if (await fs.pathExists(packageJsonPath)) {
        return itemPath;
      }
    }
  }
  
  return extractPath;
};

// Install dependencies and build project
const buildProject = (projectPath, projectInfo) => {
  return new Promise((resolve, reject) => {
    console.log(`Building ${projectInfo.type} project at ${projectPath}`);
    
    // Install dependencies first
    const npmInstall = spawn('npm', ['install'], {
      cwd: projectPath,
      stdio: 'pipe'
    });

    let installOutput = '';
    npmInstall.stdout.on('data', (data) => {
      installOutput += data.toString();
    });

    npmInstall.stderr.on('data', (data) => {
      installOutput += data.toString();
    });

    npmInstall.on('close', (code) => {
      if (code !== 0) {
        return reject(new Error(`npm install failed: ${installOutput}`));
      }

      // Build the project using dynamic command
      const buildCommand = projectInfo.commands?.build;
      if (!buildCommand) {
        console.warn('No build command found, skipping build step');
        return resolve({
          installOutput,
          buildOutput: 'No build command available',
          buildSuccess: true
        });
      }

      // Parse the build command
      const [cmd, ...args] = buildCommand.split(' ');
      const npmBuild = spawn(cmd === 'npm' ? 'npm' : 'npx', 
        cmd === 'npm' ? args : [cmd, ...args], {
        cwd: projectPath,
        stdio: 'pipe'
      });

      let buildOutput = '';
      npmBuild.stdout.on('data', (data) => {
        buildOutput += data.toString();
      });

      npmBuild.stderr.on('data', (data) => {
        buildOutput += data.toString();
      });

      npmBuild.on('close', (buildCode) => {
        if (buildCode !== 0) {
          console.warn(`Build failed, but continuing: ${buildOutput}`);
        }
        
        resolve({
          installOutput,
          buildOutput,
          buildSuccess: buildCode === 0
        });
      });
    });
  });
};

// Upload and process project
router.post('/', (req, res) => {
  console.log('Upload endpoint hit:', req.method, req.url);
  
  upload.single('project')(req, res, async (err) => {
    if (err) {
      console.error('Multer error:', err);
      return res.status(400).json({ 
        error: 'Upload failed', 
        details: err.message 
      });
    }

    try {
      if (!req.file) {
        console.log('No file in request');
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const projectId = uuidv4();
      const zipPath = req.file.path;
      const extractPath = path.join(__dirname, '../../projects', projectId);
      
      console.log(`Processing upload: ${req.file.originalname}`);
      console.log(`Project ID: ${projectId}`);
      
      // Extract ZIP file
      await fs.ensureDir(extractPath);
      await extractZip(zipPath, extractPath);
      
      // Find actual project root
      const projectRoot = await findProjectRoot(extractPath);
      
      // Detect project type and commands
      const projectInfo = await detectProjectType(projectRoot);
      
      if (projectInfo.type === 'unknown') {
        await fs.remove(extractPath);
        await fs.remove(zipPath);
        return res.status(400).json({ 
          error: 'Invalid project type. Only React, Vite React, and Next.js projects are supported.' 
        });
      }

      // Build project
      const buildResult = await buildProject(projectRoot, projectInfo);
      
      // Save project metadata
      const metadata = {
        id: projectId,
        name: req.file.originalname.replace('.zip', ''),
        type: projectInfo.type,
        commands: projectInfo.commands,
        scripts: projectInfo.scripts,
        uploadDate: new Date().toISOString(),
        projectPath: projectRoot,
        buildSuccess: buildResult.buildSuccess,
        status: 'ready',
        scriptsModified: projectInfo.scriptsModified || false
      };
      
      const metadataPath = path.join(__dirname, '../../projects', `${projectId}.json`);
      await fs.writeJson(metadataPath, metadata);
      
      // Clean up uploaded ZIP
      await fs.remove(zipPath);
      
      console.log(`Project ${projectId} processed successfully`);
      
      res.json({
        success: true,
        project: metadata,
        previewUrl: `/preview/${projectId}`,
        buildLog: {
          install: buildResult.installOutput,
          build: buildResult.buildOutput
        }
      });

    } catch (error) {
      console.error('Upload error:', error);
      
      // Cleanup on error
      if (req.file) {
        await fs.remove(req.file.path).catch(() => {});
      }
      
      res.status(500).json({ 
        error: 'Failed to process uploaded project',
        details: error.message 
      });
    }
  });
});

// Utility endpoint to fix existing Vite projects missing start script
router.post('/fix-vite-scripts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const metadataPath = path.join(__dirname, '../../projects', `${id}.json`);
    
    if (!(await fs.pathExists(metadataPath))) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    const metadata = await fs.readJson(metadataPath);
    
    if (metadata.type !== 'vite-react') {
      return res.status(400).json({ error: 'This endpoint is only for Vite React projects' });
    }
    
    const packageJsonPath = path.join(metadata.projectPath, 'package.json');
    
    if (!(await fs.pathExists(packageJsonPath))) {
      return res.status(404).json({ error: 'package.json not found' });
    }
    
    const packageJson = await fs.readJson(packageJsonPath);
    
    if (!packageJson.scripts.start) {
      packageJson.scripts.start = 'vite preview';
      await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
      
      // Update metadata
      metadata.scripts = packageJson.scripts;
      metadata.commands.start = 'vite preview';
      metadata.scriptsModified = true;
      await fs.writeJson(metadataPath, metadata);
      
      console.log(`Added start script to Vite project ${id}`);
      
      res.json({ 
        success: true, 
        message: 'Start script added successfully',
        updatedScripts: packageJson.scripts
      });
    } else {
      res.json({ 
        success: true, 
        message: 'Start script already exists',
        currentScripts: packageJson.scripts
      });
    }
    
  } catch (error) {
    console.error('Error fixing Vite scripts:', error);
    res.status(500).json({ 
      error: 'Failed to fix Vite scripts',
      details: error.message 
    });
  }
});

module.exports = router;
