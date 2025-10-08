# Server Configuration

This directory contains centralized configuration for the Zip Sync application.

## Configuration File

### `server-config.js`

This file contains all server-related configuration constants that are used throughout the application.

#### Key Constants:

- `SERVER_IP`: The main server IP address (currently: `43.205.121.85`)
- `FRONTEND_PORT`: Frontend server port (default: `5173`)
- `BACKEND_PORT`: Backend server port (default: `5000`)
- `FRONTEND_URL`: Complete frontend URL
- `BACKEND_URL`: Complete backend URL
- `API_BASE_URL`: API base URL for frontend requests

## How to Change Server IP

To change the server IP address across the entire application:

1. **Edit the configuration file**: Open `config/server-config.js`
2. **Update the SERVER_IP constant**: Change the value to your new IP address
3. **Restart the application**: The changes will take effect after restart

### Example:

```javascript
// Change this line in config/server-config.js
const SERVER_IP = "your-new-ip-address";
```

## Files That Use This Configuration

The following files automatically use the centralized configuration:

### Frontend:

- `frontend/src/api/index.js` - API base URL

### Backend:

- `backend/src/server.js` - Server startup logs
- `backend/src/utils/headerUtils.js` - API base URL for injected headers
- `backend/src/routes/project.routes.js` - Build URLs
- `backend/src/routes/release.routes.js` - Build URLs

### Scripts:

- `start-pm2.sh` - Startup script URLs
- `test-setup.sh` - Test script URLs
- `PM2_SETUP.md` - Documentation URLs

## Benefits

- **Single source of truth**: Change IP in one place, updates everywhere
- **Consistency**: All parts of the application use the same IP
- **Maintainability**: Easy to update server configuration
- **Reduced errors**: No risk of missing hardcoded IPs in some files

## Usage in Code

### Backend (Node.js/ES6 modules):

```javascript
import {
  SERVER_IP,
  BACKEND_PORT,
  API_BASE_URL,
} from "../../config/server-config.js";
```

### Frontend (React):

```javascript
import { API_BASE_URL } from "../../../config/server-config.js";
```

## Environment Variables

The configuration also respects environment variables where applicable:

- `PORT` environment variable can override `BACKEND_PORT`
- Other environment-specific overrides can be added as needed
