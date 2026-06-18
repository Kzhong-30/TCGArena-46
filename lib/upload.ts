import path from "path";
import fs from "fs";
import { randomBytes } from "crypto";
import type { UploadConfig, UploadedFile, FileValidationError } from "@/types";

export const UPLOAD_CONFIG: UploadConfig = {
  maxFileSize: 5 * 1024 * 1024,
  maxFiles: 10,
  allowedTypes: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
  uploadDir: path.join(process.cwd(), "public", "uploads"),
};

export const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];

export function ensureUploadDir(): void {
  if (!fs.existsSync(UPLOAD_CONFIG.uploadDir)) {
    fs.mkdirSync(UPLOAD_CONFIG.uploadDir, { recursive: true });
  }
}

export function sanitizeFilename(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  const nameWithoutExt = path.basename(filename, ext)
    .replace(/[^a-zA-Z0-9\u4e00-\u9fa5_-]/g, "_")
    .substring(0, 50);
  const randomSuffix = randomBytes(8).toString("hex");
  const timestamp = Date.now();
  return `${timestamp}_${nameWithoutExt}_${randomSuffix}${ext}`;
}

export function getFileExtension(mimetype: string): string {
  const mimeToExt: Record<string, string> = {
    "image/jpeg": ".jpg",
    "image/jpg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
  };
  return mimeToExt[mimetype] || "";
}

export function validateFile(
  file: { size: number; mimetype: string; originalFilename?: string | null },
  index: number
): FileValidationError | null {
  if (!file.mimetype || !UPLOAD_CONFIG.allowedTypes.includes(file.mimetype)) {
    return {
      field: `files[${index}]`,
      message: `文件 ${file.originalFilename || `第${index + 1}个文件`} 格式不支持，仅支持 JPG、PNG、WebP 格式`,
    };
  }

  if (file.size > UPLOAD_CONFIG.maxFileSize) {
    const maxSizeMB = UPLOAD_CONFIG.maxFileSize / (1024 * 1024);
    return {
      field: `files[${index}]`,
      message: `文件 ${file.originalFilename || `第${index + 1}个文件`} 大小超过限制，最大支持 ${maxSizeMB}MB`,
    };
  }

  if (file.size === 0) {
    return {
      field: `files[${index}]`,
      message: `文件 ${file.originalFilename || `第${index + 1}个文件`} 为空文件`,
    };
  }

  return null;
}

export function validateFiles(
  files: Array<{ size: number; mimetype: string; originalFilename?: string | null }>
): FileValidationError[] {
  const errors: FileValidationError[] = [];

  if (files.length === 0) {
    errors.push({
      field: "files",
      message: "请选择要上传的文件",
    });
    return errors;
  }

  if (files.length > UPLOAD_CONFIG.maxFiles) {
    errors.push({
      field: "files",
      message: `最多只能上传 ${UPLOAD_CONFIG.maxFiles} 个文件`,
    });
    return errors;
  }

  files.forEach((file, index) => {
    const error = validateFile(file, index);
    if (error) {
      errors.push(error);
    }
  });

  return errors;
}

export function generateFileUrl(filename: string): string {
  return `/uploads/${filename}`;
}

export function generateUploadedFile(
  originalName: string,
  filename: string,
  size: number,
  mimetype: string
): UploadedFile {
  const filepath = path.join(UPLOAD_CONFIG.uploadDir, filename);
  return {
    filename,
    originalName,
    size,
    mimetype,
    url: generateFileUrl(filename),
    filepath,
  };
}

export function deleteUploadedFile(filepath: string): boolean {
  try {
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export function deleteUploadedFiles(filepaths: string[]): { success: number; failed: number } {
  let success = 0;
  let failed = 0;

  filepaths.forEach((filepath) => {
    if (deleteUploadedFile(filepath)) {
      success++;
    } else {
      failed++;
    }
  });

  return { success, failed };
}
