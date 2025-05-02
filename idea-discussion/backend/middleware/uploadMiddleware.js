import path from "path";
import multer from "multer";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads/temp"));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`
    );
  },
});

const fileFilter = (req, file, cb) => {
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
