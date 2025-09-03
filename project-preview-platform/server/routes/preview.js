const express = require('express');
const path = require('path');
const fs = require('fs-extra');
const { spawn } = require('child_process');
const { createProxyMiddleware } = require('http-proxy-middleware');

const router = express.Router();

// Store running processes
const runningProcesses = new Map();

// Start development server for a project
const startDevServer = (projectPath, metadata, projectId) => {
      
   
        
  return new Promise((resolve, reject) => {
    let command, args, port;
    
    // Assign unique ports for each project (starting from 3001)
    port = 3001 + parseInt(projectId.slice(-4), 16) % 1000;
    
    const { type: projectType, commands } = metadata;
    const devCommand = commands?.dev;
    
    if (!devCommand) {
      return reject(new Error(`No dev command found for ${projectType} project`));
    }
    
    // Parse the dev command
    const commandParts = devCommand.split(' ');
    
    if (projectType === 'nextjs') {
      // For Next.js, we can add port parameter
      if (devCommand.includes('next dev')) {
        command = commandParts[0] === 'npm' ? 'npm' : 'npx';
        args = commandParts[0] === 'npm' ? 
          [...commandParts.slice(1), '--', '-p', port.toString()] :
          [...commandParts, '-p', port.toString()];
      } else {
        command = commandParts[0] === 'npm' ? 'npm' : 'npx';
        args = commandParts[0] === 'npm' ? commandParts.slice(1) : commandParts;
      }
    } else if (projectType === 'vite-react') {
      // For Vite, we can add port parameter
      console.log("🚀 ~ startDevServer ~ devCommand:", devCommand)
      if (devCommand.includes('vite')) {
        command = commandParts[0] === 'npm' ? 'npm' : 'npx';
        console.log("🚀 ~ startDevServer ~ commandParts:", commandParts)
        args = commandParts[0] === 'npm' ? 
          [...commandParts.slice(1), '--port', port.toString()] :
          [...commandParts, '--port', port.toString()];
      } else {
        command = commandParts[0] === 'npm' ? 'npm' : 'npx';
        args = commandParts[0] === 'npm' ? commandParts.slice(1) : commandParts;
      }
      console.log("🚀 ~ startDevServer ~ command:", command)
      console.log("🚀 ~ startDevServer ~ args:", args)
    } else if (projectType === 'react') {
      // For Create React App, use PORT environment variable
      command = commandParts[0] === 'npm' ? 'npm' : 'npx';
      args = commandParts[0] === 'npm' ? commandParts.slice(1) : commandParts;
      process.env.PORT = port.toString();
    } else {
      return reject(new Error(`Unsupported project type: ${projectType}`));
    }

    console.log(`Starting ${projectType} server for project ${projectId} on port ${port}`);
    console.log(`Using command: ${command} ${args.join(' ')}`);
    
    const devServer = spawn(command, args, {
      cwd: projectPath,
      stdio: 'pipe',
      env: { ...process.env, PORT: port.toString() }
    });

    let output = '';
    let isReady = false;

    const checkReady = (data) => {
      output += data.toString();
      
      // Check for server ready indicators
      const readyPatterns = [
        /Local:\s+http:\/\/localhost:\d+/,
        /ready - started server on/,
        /compiled successfully/,
        /webpack compiled/,
        /Local:\s+http:\/\/127\.0\.0\.1:\d+/,
        /dev server running at/,
        /ready in \d+ms/,
        /App running at:/
      ];
      
      if (!isReady && readyPatterns.some(pattern => pattern.test(output))) {
        isReady = true;
        resolve({ process: devServer, port, output });
      }
    };

    devServer.stdout.on('data', checkReady);
    devServer.stderr.on('data', checkReady);

    devServer.on('error', (error) => {
      reject(error);
    });

    devServer.on('exit', (code) => {
      console.log(`Dev server for project ${projectId} exited with code ${code}`);
      runningProcesses.delete(projectId);
    });

    // Timeout after 60 seconds
    setTimeout(() => {
      if (!isReady) {
        devServer.kill();
        reject(new Error('Server startup timeout'));
      }
    }, 60000);
  });
};

// Serve static build files
const serveStaticBuild = (projectPath, metadata) => {
  const buildDir = metadata.commands?.buildDir || 'build';
  const buildPath = path.join(projectPath, buildDir);
  
  return express.static(buildPath);
};

// Get running projects status
router.get('/status/running', (req, res) => {

  console.log("This is the status route")
  const running = Array.from(runningProcesses.entries()).map(([id, info]) => ({
    id,
    port: info.port,
    startTime: info.startTime,
    uptime: Date.now() - info.startTime.getTime()
  }));
  
  res.json({ running });
});

// Preview route handler
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    console.log("🚀 ~ id: 135", id)
    const metadataPath = path.join(__dirname, '../../projects', `${id}.json`);
    
    if (!(await fs.pathExists(metadataPath))) {
      return res.status(404).send(`
        <html>
          <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
            <h1>Project Not Found</h1>
            <p>The project with ID "${id}" does not exist.</p>
            <a href="/">← Back to Dashboard</a>
          </body>
        </html>
      `);
    }
    
    const metadata = await fs.readJson(metadataPath);
    const { projectPath, type: projectType } = metadata;
    
    // Check if project files still exist
    if (!(await fs.pathExists(projectPath))) {
      return res.status(404).send(`
        <html>
          <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
            <h1>Project Files Missing</h1>
            <p>The project files for "${metadata.name}" are no longer available.</p>
            <a href="/">← Back to Dashboard</a>
          </body>
        </html>
      `);
    }

    // Check if we already have a running process for this project
    if (runningProcesses.has(id)) {
      const { port } = runningProcesses.get(id);
      // Proxy to the running dev server
      return createProxyMiddleware({
        target: `http://localhost:${port}`,
        changeOrigin: true,
        pathRewrite: {
          [`^/${id}`]: ''
        },
        onError: (err, req, res) => {
          console.error(`Proxy error for project ${id}:`, err);
          res.status(500).send(`
            <html>
              <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                <h1>Preview Error</h1>
                <p>Failed to load preview for "${metadata.name}"</p>
                <p>Error: ${err.message}</p>
                <a href="/">← Back to Dashboard</a>
              </body>
            </html>
          `);
        }
      })(req, res, next);
    }

    // Try to start dev server
    try {
      const { process: devProcess, port, output } = await startDevServer(projectPath, metadata, id);
      console.log("🚀 ~ output:", output)
      
      runningProcesses.set(id, { 
        process: devProcess, 
        port, 
        startTime: new Date(),
        output 
      });
      
      // Update project status
      metadata.status = 'running';
      metadata.port = port;
      metadata.lastStarted = new Date().toISOString();
      await fs.writeJson(metadataPath, metadata);
      
      console.log("Target url: ",`http://localhost:${port}`);
      
      // Proxy to the newly started dev server
      return createProxyMiddleware({
        target: `http://localhost:${port}`,
        changeOrigin: true,
        pathRewrite: {
          [`^/preview/${id}`]: ''
        },
        onError: (err, req, res) => {
          console.error(`Proxy error for project ${id}:`, err);
          res.status(500).send(`
            <html>
              <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                <h1>Preview Error</h1>
                <p>Failed to load preview for "${metadata.name}"</p>
                <p>Error: ${err.message}</p>
                <a href="/">← Back to Dashboard</a>
              </body>
            </html>
          `);
        }
      })(req, res, next);
      
    } catch (devError) {
      console.error(`Failed to start dev server for project ${id}:`, devError);
      
      // Fallback to serving static build if available
      const buildDir = metadata.commands?.buildDir || 'build';
      const buildPaths = [
        path.join(projectPath, buildDir),
        path.join(projectPath, 'build'),
        path.join(projectPath, '.next'),
        path.join(projectPath, 'dist')
      ];
      
      for (const buildPath of buildPaths) {
        if (await fs.pathExists(buildPath)) {
          console.log(`Serving static build for project ${id} from ${buildPath}`);
          return express.static(buildPath)(req, res, next);
        }
      }
      
      // No build available, show error
      return res.status(500).send(`
        <html>
          <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
            <h1>Preview Unavailable</h1>
            <p>Unable to start preview for "${metadata.name}"</p>
            <p>Error: ${devError.message}</p>
            <details style="margin: 20px; text-align: left;">
              <summary>Build Details</summary>
              <pre style="background: #f5f5f5; padding: 10px; overflow: auto;">${devError.stack}</pre>
            </details>
            <a href="/">← Back to Dashboard</a>
          </body>
        </html>
      `);
    }
    
  } catch (error) {
    console.error('Preview error:', error);
    res.status(500).send(`
      <html>
        <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
          <h1>Internal Error</h1>
          <p>An error occurred while loading the preview.</p>
          <p>Error: ${error.message}</p>
          <a href="/">← Back to Dashboard</a>
        </body>
      </html>
    `);
  }
});

// Stop a running project
router.post('/:id/stop', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (runningProcesses.has(id)) {
      const { process } = runningProcesses.get(id);
      process.kill();
      runningProcesses.delete(id);
      
      // Update project status
      const metadataPath = path.join(__dirname, '../../projects', `${id}.json`);
      if (await fs.pathExists(metadataPath)) {
        const metadata = await fs.readJson(metadataPath);
        metadata.status = 'stopped';
        delete metadata.port;
        await fs.writeJson(metadataPath, metadata);
      }
      
      res.json({ success: true, message: 'Project stopped' });
    } else {
      res.status(404).json({ error: 'Project not running' });
    }
  } catch (error) {
    console.error('Error stopping project:', error);
    res.status(500).json({ error: 'Failed to stop project' });
  }
});


module.exports = router;
