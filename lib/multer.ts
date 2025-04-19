// lib/multer.ts
import multer from "multer";

// Use memory storage so files don't get written to disk
const storage = multer.memoryStorage();

// You can also set file size limits, types, etc.
export const upload = multer({
  storage,
});
