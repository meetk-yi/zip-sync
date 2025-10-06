import app from "./app.js";

const PORT = process.env.PORT || 5000;
console.log("Starting server...")
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://13.203.192.57:${PORT}`);
  console.log(`🌐 Server accessible from: http://0.0.0.0:${PORT}`);
});