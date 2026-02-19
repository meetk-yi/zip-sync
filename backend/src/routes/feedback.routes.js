import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";

const router = express.Router();

// All feedback screenshots stored in one folder (local)
const SCREENSHOTS_DIR = path.join(process.cwd(), "screenshots");
const SCREENSHOTS_DIR_BACKEND = path.join(process.cwd(), "backend", "screenshots");

function getScreenshotsDir() {
  if (fs.existsSync(SCREENSHOTS_DIR)) return SCREENSHOTS_DIR;
  if (fs.existsSync(SCREENSHOTS_DIR_BACKEND)) return SCREENSHOTS_DIR_BACKEND;
  return SCREENSHOTS_DIR;
}

const screenshotsDir = getScreenshotsDir();
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, screenshotsDir);
  },
  filename: (req, file, cb) => {
    const base = `${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;
    cb(null, `${base}.png`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (req, file, cb) => {
    const allowed = ["image/png", "image/jpeg", "image/webp"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      console.warn("[feedback] Upload rejected: invalid file type", file.mimetype);
      cb(new Error("Invalid file type. Only PNG, JPEG, WebP allowed."));
    }
  },
});

/**
 * POST /api/feedback
 * Accepts: multipart/form-data
 *   - screenshot: image file (required)
 *   - description: string (required)
 *   - metadata: JSON string (optional)
 *   - projectId: string (optional)
 * Saves screenshot to local folder and a .json file with description + metadata.
 */
router.post("/", (req, res, next) => {
  console.log("[feedback] POST /api/feedback received | projectId:", req.body?.projectId ?? "(none)");
  next();
}, upload.single("screenshot"), (err, req, res, next) => {
  if (err) {
    console.error("[feedback] Upload middleware error:", err.message);
    return res.status(400).json({ success: false, message: err.message || "Upload failed." });
  }
  next();
}, (req, res) => {
  try {
    if (!req.file) {
      console.warn("[feedback] POST /api/feedback rejected: no screenshot file");
      return res.status(400).json({
        success: false,
        message: "No screenshot file uploaded.",
      });
    }

    const description = req.body.description || "";
    const projectId = req.body.projectId || null;
    console.log("[feedback] Saving feedback | projectId:", projectId, "| file:", req.file.filename);
    let metadata = null;
    if (req.body.metadata) {
      try {
        metadata = JSON.parse(req.body.metadata);
      } catch {
        metadata = { raw: req.body.metadata };
      }
    }

    const baseName = path.basename(req.file.filename, path.extname(req.file.filename));
    const jsonPath = path.join(screenshotsDir, `${baseName}.json`);
    const payload = {
      description,
      projectId,
      metadata,
      screenshotFile: req.file.filename,
      submittedAt: new Date().toISOString(),
    };
    fs.writeFileSync(jsonPath, JSON.stringify(payload, null, 2), "utf-8");
    console.log("[feedback] Saved | screenshot:", req.file.filename, "| json:", path.basename(jsonPath));

    return res.status(200).json({
      success: true,
      message: "Feedback saved.",
      screenshotFile: req.file.filename,
    });
  } catch (err) {
    console.error("[feedback] Save error:", err.message, err.stack);
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to save feedback.",
    });
  }
});

/**
 * GET /api/feedback/screenshot/:filename
 * Serve a screenshot image (for use in admin or list view).
 */
router.get("/screenshot/:filename", (req, res) => {
  try {
    const filename = path.basename(req.params.filename);
    if (!filename || filename.includes("..")) {
      console.warn("[feedback] GET screenshot rejected: invalid filename", req.params.filename);
      return res.status(400).json({ message: "Invalid filename" });
    }
    const dir = getScreenshotsDir();
    const filePath = path.join(dir, filename);
    if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
      console.warn("[feedback] GET screenshot not found:", filename);
      return res.status(404).json({ message: "Screenshot not found" });
    }
    res.sendFile(path.resolve(filePath));
  } catch (err) {
    console.error("[feedback] Screenshot serve error:", err.message);
    res.status(500).json({ message: err.message });
  }
});

export default router;
