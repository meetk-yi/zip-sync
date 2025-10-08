# PM2 Setup Guide for Zip Sync Application

This guide will help you set up PM2 to run your Zip Sync application on EC2, preventing the instance from closing.

## Prerequisites

- Node.js installed on your EC2 instance
- Your application files uploaded to the EC2 instance

## Quick Start

1. **Install PM2 globally** (if not already installed):

   ```bash
   npm install -g pm2
   ```

2. **Run the startup script**:
   ```bash
   ./start-pm2.sh
   ```

## Manual Setup

If you prefer to set up manually:

### 1. Install PM2

```bash
npm install -g pm2
```

### 2. Start Applications

```bash
# Start both frontend and backend
pm2 start ecosystem.config.js

# Or start individually
pm2 start backend/ecosystem.config.js
pm2 start frontend/ecosystem.config.js
```

### 3. Save PM2 Configuration

```bash
pm2 save
pm2 startup
```

## Application URLs

- **Frontend**: http://43.205.121.85:5173
- **Backend**: http://43.205.121.85:5000

## PM2 Management Commands

### Check Status

```bash
pm2 status
```

### View Logs

```bash
# All logs
pm2 logs

# Specific application logs
pm2 logs zip-sync-frontend
pm2 logs zip-sync-backend

# Follow logs in real-time
pm2 logs --follow
```

### Restart Applications

```bash
# Restart all
pm2 restart all

# Restart specific application
pm2 restart zip-sync-frontend
pm2 restart zip-sync-backend
```

### Stop Applications

```bash
# Stop all
pm2 stop all

# Stop specific application
pm2 stop zip-sync-frontend
pm2 stop zip-sync-backend
```

### Delete Applications

```bash
# Delete all
pm2 delete all

# Delete specific application
pm2 delete zip-sync-frontend
pm2 delete zip-sync-backend
```

## Monitoring

### Real-time Monitoring

```bash
pm2 monit
```

### Application Information

```bash
pm2 show zip-sync-frontend
pm2 show zip-sync-backend
```

## Auto-restart on System Reboot

PM2 will automatically restart your applications when the system reboots if you've run:

```bash
pm2 startup
pm2 save
```

## Troubleshooting

### Check if PM2 is running

```bash
pm2 status
```

### View error logs

```bash
pm2 logs --err
```

### Restart PM2 daemon

```bash
pm2 kill
pm2 start ecosystem.config.js
```

### Check system resources

```bash
pm2 monit
```

## Configuration Files

- `ecosystem.config.js` - Main configuration for both applications
- `backend/ecosystem.config.js` - Backend-specific configuration
- `frontend/ecosystem.config.js` - Frontend-specific configuration

## Log Files

Logs are stored in:

- Backend: `./backend/logs/`
- Frontend: `./frontend/logs/`

## Security Notes

- The frontend is configured to bind to `0.0.0.0:5173` for external access
- The backend is configured to bind to `0.0.0.0:5000` for external access
- Make sure your EC2 security groups allow traffic on ports 5173 and 5000

## Environment Variables

You can set environment variables in the ecosystem.config.js file or create a `.env` file in each directory.

## Performance Tuning

- Applications are configured with `max_memory_restart: '1G'`
- Auto-restart is enabled for stability
- Watch mode is disabled for production
- Single instance per application for simplicity

## Support

If you encounter issues:

1. Check PM2 status: `pm2 status`
2. View logs: `pm2 logs`
3. Restart applications: `pm2 restart all`
4. Check system resources: `pm2 monit`
