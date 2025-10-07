import app from "./app.js";

const PORT = process.env.PORT || 5000;

// Middleware to log all requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

console.log("Starting server...")
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://13.203.192.57:${PORT}`);
  console.log(`🚀 Server also accessible on http://0.0.0.0:${PORT}`);
});
