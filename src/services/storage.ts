import { createSupabaseAdminClient } from "@/config/supabase";
import { logger } from "@/lib/logger";
import { NotFoundError } from "./errors";

const BUCKET_NAME = "syllabi";
const DOWNLOAD_TIMEOUT_MS = 30000;

function buildPath(userId: string, syllabusId: string): string {
  return `users/${userId}/syllabi/${syllabusId}/original.pdf`;
}

function getClient() {
  return createSupabaseAdminClient();
}

export const storageService = {
  async upload(
    syllabusId: string,
    userId: string,
    file: File,
  ): Promise<string> {
    const filePath = buildPath(userId, syllabusId);
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error } = await getClient().storage
      .from(BUCKET_NAME)
      .upload(filePath, buffer, {
        contentType: file.type || "application/pdf",
        upsert: false,
      });

    if (error) {
      logger.error("Storage upload failed", {
        userId,
        syllabusId,
        error: error.message,
      });
      throw new Error(`Failed to upload file: ${error.message}`);
    }

    logger.info("File uploaded to storage", { userId, syllabusId, filePath });
    return filePath;
  },

  async replace(
    syllabusId: string,
    userId: string,
    file: File,
  ): Promise<string> {
    const filePath = buildPath(userId, syllabusId);
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error } = await getClient().storage
      .from(BUCKET_NAME)
      .update(filePath, buffer, {
        contentType: file.type || "application/pdf",
      });

    if (error) {
      logger.error("Storage replace failed", {
        userId,
        syllabusId,
        error: error.message,
      });
      throw new Error(`Failed to replace file: ${error.message}`);
    }

    logger.info("File replaced in storage", { userId, syllabusId, filePath });
    return filePath;
  },

  async getDownloadUrl(filePath: string, expiresIn: number = 3600): Promise<string> {
    const { data, error } = await getClient().storage
      .from(BUCKET_NAME)
      .createSignedUrl(filePath, expiresIn);

    if (error || !data) {
      logger.error("Failed to create signed URL", { filePath, error: error?.message });
      throw new NotFoundError("File", filePath);
    }

    return data.signedUrl;
  },

  async download(filePath: string): Promise<Buffer> {
    const start = performance.now();
    logger.info("[Storage] START download", { filePath, timeoutMs: DOWNLOAD_TIMEOUT_MS });

    try {
      const downloadPromise = getClient().storage
        .from(BUCKET_NAME)
        .download(filePath);

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`Storage download timed out after ${DOWNLOAD_TIMEOUT_MS}ms`)), DOWNLOAD_TIMEOUT_MS),
      );

      const { data, error } = await Promise.race([
        downloadPromise,
        timeoutPromise,
      ]);

      if (error || !data) {
        logger.error("[Storage] Download failed", { filePath, error: error?.message });
        throw new NotFoundError("File", filePath);
      }

      const arrayBuffer = await data.arrayBuffer();
      const duration = performance.now() - start;
      logger.info("[Storage] END download", { durationMs: Math.round(duration), sizeBytes: arrayBuffer.byteLength });
      return Buffer.from(arrayBuffer);
    } catch (error) {
      const duration = performance.now() - start;
      logger.error("[Storage] Download FAILED", { durationMs: Math.round(duration), error: error instanceof Error ? error.message : String(error) });
      throw error;
    }
  },

  async delete(filePath: string): Promise<void> {
    const { error } = await getClient().storage
      .from(BUCKET_NAME)
      .remove([filePath]);

    if (error) {
      logger.error("Storage delete failed", {
        filePath,
        error: error.message,
      });
      throw new Error(`Failed to delete file: ${error.message}`);
    }

    logger.info("File deleted from storage", { filePath });
  },
};
