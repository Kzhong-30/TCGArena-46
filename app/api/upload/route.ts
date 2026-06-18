import { NextResponse } from "next/server";
import { IncomingMessage } from "http";
import formidable, { File } from "formidable";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { getCurrentUser } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".gif", ".webp"];

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

interface UploadSuccessResponse {
  success: true;
  data: {
    urls: string[];
  };
}

interface UploadErrorResponse {
  success: false;
  error: string;
}

type UploadApiResponse = UploadSuccessResponse | UploadErrorResponse;

function ensureUploadDir(): void {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
}

function getSafeExtension(originalFilename: string | undefined, mimetype: string | undefined): string | null {
  if (originalFilename) {
    const ext = path.extname(originalFilename).toLowerCase();
    if (ALLOWED_EXTENSIONS.includes(ext)) {
      return ext;
    }
  }

  if (mimetype) {
    const mimeToExt: Record<string, string> = {
      "image/jpeg": ".jpg",
      "image/jpg": ".jpg",
      "image/png": ".png",
      "image/gif": ".gif",
      "image/webp": ".webp",
    };
    const extFromMime = mimeToExt[mimetype];
    if (extFromMime) {
      return extFromMime;
    }
  }

  return null;
}

function validateFile(file: File, index: number): string | null {
  if (!file.mimetype || !ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return `文件 ${file.originalFilename || `第${index + 1}个文件`} 格式不支持，仅支持 JPG、JPEG、PNG、GIF、WebP 格式`;
  }

  const ext = getSafeExtension(file.originalFilename ?? undefined, file.mimetype ?? undefined);
  if (!ext) {
    return `文件 ${file.originalFilename || `第${index + 1}个文件`} 扩展名不合法`;
  }

  if (file.size > MAX_FILE_SIZE) {
    return `文件 ${file.originalFilename || `第${index + 1}个文件`} 大小超过限制，最大支持 10MB`;
  }

  if (file.size === 0) {
    return `文件 ${file.originalFilename || `第${index + 1}个文件`} 为空文件`;
  }

  return null;
}

async function parseFormData(req: Request): Promise<{
  files: File[];
}> {
  const incomingMessage = req as unknown as IncomingMessage;
  const form = formidable({
    maxFiles: 20,
    maxFileSize: MAX_FILE_SIZE,
    allowEmptyFiles: false,
    keepExtensions: true,
  });

  return new Promise((resolve, reject) => {
    form.parse(incomingMessage, (err, _fields, files) => {
      if (err) {
        reject(err);
        return;
      }

      const fileArray: File[] = [];
      const fileFields = Object.values(files);
      for (const field of fileFields) {
        if (Array.isArray(field)) {
          fileArray.push(...field);
        } else if (field) {
          fileArray.push(field);
        }
      }

      resolve({ files: fileArray });
    });
  });
}

export async function POST(req: Request): Promise<NextResponse<UploadApiResponse>> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "请先登录后再上传文件" },
        { status: 401 }
      );
    }

    ensureUploadDir();

    const { files } = await parseFormData(req);

    if (files.length === 0) {
      return NextResponse.json(
        { success: false, error: "请选择要上传的文件" },
        { status: 400 }
      );
    }

    const validationErrors: string[] = [];
    files.forEach((file, index) => {
      const error = validateFile(file, index);
      if (error) {
        validationErrors.push(error);
      }
    });

    if (validationErrors.length > 0) {
      return NextResponse.json(
        { success: false, error: validationErrors.join("; ") },
        { status: 400 }
      );
    }

    const urls: string[] = [];
    const savedPaths: string[] = [];

    try {
      for (const file of files) {
        const ext = getSafeExtension(file.originalFilename ?? undefined, file.mimetype ?? undefined) as string;
        const safeFilename = `${crypto.randomUUID()}${ext}`;
        const targetPath = path.join(UPLOAD_DIR, safeFilename);

        await fs.promises.copyFile(file.filepath, targetPath);
        await fs.promises.unlink(file.filepath).catch(() => {});

        savedPaths.push(targetPath);
        urls.push(`/uploads/${safeFilename}`);
      }

      return NextResponse.json({
        success: true,
        data: { urls },
      });
    } catch (processError) {
      for (const savedPath of savedPaths) {
        try {
          if (fs.existsSync(savedPath)) {
            fs.unlinkSync(savedPath);
          }
        } catch {
        }
      }
      throw processError;
    }
  } catch (error) {
    console.error("Error uploading files:", error);

    let errorMessage = "上传失败，请稍后重试";
    if (error instanceof Error) {
      if (error.message.includes("maxFileSize") || error.message.includes("exceeded")) {
        errorMessage = "文件大小超过限制，最大支持 10MB";
      } else if (error.message.includes("maxFiles")) {
        errorMessage = "单次上传文件数量过多";
      } else {
        errorMessage = error.message;
      }
    }

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
