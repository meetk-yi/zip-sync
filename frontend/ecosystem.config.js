module.exports = {
  apps: [
    {
      name: 'zip-sync-frontend',
      script: 'npm',
      args: 'run dev',
      cwd: '/Users/suraj.a/Desktop/meet-zip/zip-sync/frontend',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production'
      },
      env_production: {
        NODE_ENV: 'production'
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true
    }
  ]
};
