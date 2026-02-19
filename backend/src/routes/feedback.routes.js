import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";

const router = express.Router();

console.log("Feedback routes runing");

// All feedback screenshots stored in one folder (local)
const SCREENSHOTS_DIR = path.join(process.cwd(), "screenshots");

// Ensure directory exists
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, SCREENSHOTS_DIR);
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
router.post("/", upload.single("screenshot"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No screenshot file uploaded.",
      });
    }

    const description = req.body.description || "";
    const projectId = req.body.projectId || null;
    let metadata = null;
    if (req.body.metadata) {
      try {
        metadata = JSON.parse(req.body.metadata);
      } catch {
        metadata = { raw: req.body.metadata };
      }
    }

    const baseName = path.basename(req.file.filename, path.extname(req.file.filename));
    const jsonPath = path.join(SCREENSHOTS_DIR, `${baseName}.json`);
    const payload = {
      description,
      projectId,
      metadata,
      screenshotFile: req.file.filename,
      submittedAt: new Date().toISOString(),
    };
    fs.writeFileSync(jsonPath, JSON.stringify(payload, null, 2), "utf-8");

    return res.status(200).json({
      success: true,
      message: "Feedback saved.",
      screenshotFile: req.file.filename,
    });
  } catch (err) {
    console.error("Feedback save error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to save feedback.",
    });
  }
});

export default router;
