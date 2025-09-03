# Project Preview Platform

A full-stack React-Node.js application that allows you to upload React and Next.js projects as ZIP files, automatically extract and build them, and serve them on unique preview routes with containerized isolation.

## 🚀 Features

- **ZIP Upload**: Upload React/Next.js projects as ZIP files
- **Automatic Detection**: Automatically detects project type (React vs Next.js)
- **Dynamic Building**: Installs dependencies and builds projects automatically
- **Unique Routes**: Each project gets a unique preview URL (`/preview/:projectId`)
- **Live Preview**: Projects run on isolated development servers
- **Project Management**: View, manage, and delete uploaded projects
- **Security**: Containerized isolation and sandboxing for uploaded code
- **Modern UI**: Beautiful, responsive React frontend

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Docker (optional, for containerization)
- Git

## 🛠️ Installation & Setup

### Method 1: Local Development

1. **Clone and Install Dependencies**
   ```bash
   git clone <repository-url>
   cd project-preview-platform
   npm run install-all
   ```

2. **Start Development Servers**
   ```bash
   npm run dev
   ```
   This starts both the backend (port 5000) and frontend (port 3000) concurrently.

3. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

### Method 2: Docker Deployment

1. **Build and Run with Docker Compose**
   ```bash
   docker-compose up --build
   ```

2. **Access the Application**
   - Application: http://localhost:5000

## 📁 Project Structure

```
project-preview-platform/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── Dashboard.js
│   │   │   ├── Upload.js
│   │   │   └── ProjectDetails.js
│   │   ├── App.js
│   │   └── App.css
│   └── package.json
├── server/                 # Node.js backend
│   ├── routes/            # API routes
│   │   ├── upload.js      # File upload handling
│   │   ├── projects.js    # Project management
│   │   └── preview.js     # Preview routing
│   └── index.js           # Server entry point
├── uploads/               # Temporary ZIP storage
├── projects/              # Extracted projects
├── builds/                # Built project assets
├── Dockerfile
├── docker-compose.yml
└── package.json
```

## 🔧 API Endpoints

### Upload Routes
- `POST /api/upload` - Upload and process ZIP file

### Project Management
- `GET /api/projects` - List all projects
- `GET /api/projects/:id` - Get project details
- `DELETE /api/projects/:id` - Delete project
- `PATCH /api/projects/:id/status` - Update project status

### Preview Routes
- `GET /preview/:id/*` - Serve project preview
- `POST /preview/:id/stop` - Stop running project
- `GET /preview/status/running` - Get running projects status

## 💡 How It Works

### 1. Upload Process
1. User uploads a ZIP file containing React/Next.js project
2. Server extracts ZIP to `/projects/:projectId/`
3. System detects project type by analyzing `package.json`
4. Dependencies are installed with `npm install`
5. Project is built with `npm run build`
6. Metadata is stored for project management

### 2. Preview System
1. When preview URL is accessed (`/preview/:projectId`)
2. System checks if dev server is already running
3. If not, starts new dev server on unique port (3001+)
4. Proxies requests to the running dev server
5. Fallback to static build if dev server fails

### 3. Security Features
- **Containerization**: Projects run in isolated Docker containers
- **Port Isolation**: Each project uses unique ports
- **File System Restrictions**: Limited to project directories
- **Rate Limiting**: API endpoints are rate-limited
- **Input Validation**: ZIP files and project types are validated
- **Non-root Execution**: Containers run as non-privileged users

## 🔒 Security Considerations

### Current Security Measures
- Helmet.js for security headers
- CORS protection
- Rate limiting (100 requests per 15 minutes)
- File type validation (ZIP only)
- Size limits (100MB max)
- Non-root Docker containers
- Read-only file systems where possible

### Additional Recommendations
- **Network Isolation**: Use Docker networks to isolate project containers
- **Resource Limits**: Set CPU/memory limits for project containers
- **Timeout Controls**: Implement build and runtime timeouts
- **Code Scanning**: Add static analysis for uploaded code
- **Audit Logging**: Log all upload and execution activities

## 🐳 Docker Configuration

### Development
```bash
# Build development image
docker build -t project-preview-platform .

# Run with development settings
docker run -p 5000:5000 -v $(pwd)/uploads:/app/uploads project-preview-platform
```

### Production
```bash
# Use docker-compose for production
docker-compose -f docker-compose.yml up -d
```

### Environment Variables
- `NODE_ENV`: Set to 'production' for production builds
- `PORT`: Server port (default: 5000)

## 📊 Monitoring & Logs

### Health Checks
- Docker health check endpoint available
- Monitor at: `GET /api/projects` (returns 200 if healthy)

### Logging
- Server logs include upload processing
- Build logs are captured and stored
- Error tracking for failed uploads/builds

## 🚨 Troubleshooting

### Common Issues

1. **Upload Fails**
   - Check file size (max 100MB)
   - Ensure ZIP contains valid React/Next.js project
   - Verify `package.json` exists in project root

2. **Build Fails**
   - Check build logs in project details
   - Ensure all dependencies are listed in `package.json`
   - Verify Node.js version compatibility

3. **Preview Not Loading**
   - Check if project is running (status indicator)
   - Try stopping and restarting project
   - Check browser console for errors

4. **Port Conflicts**
   - Each project uses unique ports (3001+)
   - Restart server if port allocation issues occur

### Debug Commands
```bash
# Check running processes
npm run server

# View logs
docker-compose logs -f

# Check project status
curl http://localhost:5000/api/projects
```

## 🔄 Development Workflow

### Adding New Features
1. Backend changes: Edit files in `/server`
2. Frontend changes: Edit files in `/client/src`
3. API changes: Update routes in `/server/routes`
4. UI changes: Update components in `/client/src/components`

### Testing Uploads
1. Create a simple React project
2. ZIP the project folder
3. Upload through the web interface
4. Monitor logs for processing status

## 📈 Scalability Considerations

### Current Limitations
- Single server instance
- Local file storage
- In-memory process tracking

### Scaling Solutions
- **Load Balancing**: Use multiple server instances
- **Shared Storage**: Implement shared file storage (AWS S3, etc.)
- **Queue System**: Add job queue for build processing
- **Database**: Store metadata in persistent database
- **Container Orchestration**: Use Kubernetes for project isolation

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- React team for the amazing framework
- Next.js team for the powerful framework
- Express.js for the robust backend framework
- Docker for containerization technology

---

**Note**: This platform runs arbitrary uploaded code. Always use appropriate security measures and consider running in isolated environments for production use.
