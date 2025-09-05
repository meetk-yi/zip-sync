const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
const extract = require('extract-zip');
const { v4: uuidv4 } = require('uuid');
const { exec } = require('child_process');

const router = express.Router();

// Configure multer for file uploads
const upload = multer({ 
  dest: path.join(__dirname, '../../uploads'),
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit
  }
});

// Find the actual project directory (where package.json exists)
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


// Upload and process project
router.post('/', upload.single('project'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const projectId = Date.now().toString();
    const projectPath = path.join(__dirname, '../../projects', projectId);

    // Ensure folder exists
    await fs.ensureDir(path.resolve(projectPath));

    // Extract ZIP into project folder using absolute paths
    await extract(path.resolve(req.file.path), { 
      dir: path.resolve(projectPath) 
    });

    // Find actual project folder (where package.json exists)
    const actualProjectPath = await findProjectRoot(path.resolve(projectPath));

    // Run install & build inside the right folder
    exec(`cd "${actualProjectPath}" && npm install && npm run build`, async (err, stdout, stderr) => {
      if (err) {
        console.error(stderr);
        return res.status(500).json({ error: "Build failed", details: stderr });
      }
      console.log(stdout);

      // Detect actual build output (CRA = build, Vite default = dist, custom possible)
      let outputDir = null;
      let sourceBuildPath = null;
      if (await fs.pathExists(path.join(actualProjectPath, "build"))) {
        outputDir = "build";
        sourceBuildPath = path.join(actualProjectPath, "build");
      } else if (await fs.pathExists(path.join(actualProjectPath, "dist"))) {
        outputDir = "dist";
        sourceBuildPath = path.join(actualProjectPath, "dist");
      }

      if (!outputDir || !sourceBuildPath) {
        return res.status(500).json({ error: "No build output found" });
      }

      // Copy build files directly to projectId/build folder for clean URL structure
      const targetBuildPath = path.join(projectPath, "build");
      await fs.copy(sourceBuildPath, targetBuildPath);

      // Fix index.html to use relative paths for all assets (CRA and Vite)
      const indexPath = path.join(targetBuildPath, "index.html");
      if (await fs.pathExists(indexPath)) {
        let html = await fs.readFile(indexPath, "utf-8");
        // Fix CRA absolute paths: /static/ -> ./static/
        html = html.replace(/"\/static\//g, '"./static/');
        // Fix Vite absolute paths: /assets/ -> ./assets/
        html = html.replace(/"\/assets\//g, '"./assets/');
        // Fix any other absolute paths that start with /
        html = html.replace(/href="\//g, 'href="./');
        html = html.replace(/src="\//g, 'src="./');
        await fs.writeFile(indexPath, html);
      }

      // Save project metadata
      const metadata = {
        id: projectId,
        name: req.file.originalname.replace('.zip', ''),
        uploadDate: new Date().toISOString(),
        projectPath: actualProjectPath,
        buildDir: outputDir, // Always use 'build' for consistent URLs
        status: 'ready'
      };
      
      const metadataPath = path.join(__dirname, '../../projects', `${projectId}.json`);
      await fs.writeJson(metadataPath, metadata);

      // Clean up uploaded ZIP
      await fs.remove(req.file.path);

      console.log("🚀 ~ projectId:", projectId)
      console.log("🚀 ~ outputDir:", outputDir)
      return res.json({
        success: true,
        project: metadata,
        url: `http://localhost:5000/apps/${projectId}/${outputDir}`
      });
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Upload failed", details: error.message });
  }
});


module.exports = router;
