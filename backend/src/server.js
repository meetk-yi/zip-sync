import app from "./app.js";
import { SERVER_IP, BACKEND_PORT } from "../config/server-config.js";

const PORT = process.env.PORT || BACKEND_PORT;

// Middleware to log all requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

console.log("Starting server...")
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://${SERVER_IP}:${PORT}`);
  console.log(`🚀 Server also accessible on http://0.0.0.0:${PORT}`);
});
