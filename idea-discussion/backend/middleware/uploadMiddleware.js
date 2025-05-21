import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import multer from "multer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const tempDir = path.join(__dirname, "../uploads/temp");
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

export const logRequest = (req, res, next) => {
  console.log("Request headers:", req.headers);
  console.log("Request method:", req.method);
  console.log("Request URL:", req.url);
  console.log("Content-Type:", req.headers["content-type"]);
  next();
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log("Multer destination called with file:", file.originalname);
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    console.log("Multer filename called with file:", file.originalname);
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(
      null,
      `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`
    );
  },
});

const fileFilter = (req, file, cb) => {
  console.log("Multer fileFilter called with file:", file);
  const allowedTypes = ["image/jpeg", "image/png", "image/gif"];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "許可されていないファイル形式です。JPG、PNG、GIF画像のみ対応しています。"
      ),
      false
    );
  }
};

const limits = {
  fileSize: 5 * 1024 * 1024,
};

export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: limits,
});
