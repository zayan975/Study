import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const r2 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const BUCKET = process.env.R2_BUCKET_NAME!;

/**
 * Builds the R2 object key from the naming pattern:
 * {university-slug}/{program-slug}/semester-{n}/{subject-code}/{type}/{filename}
 */
export function buildFileKey(params: {
  universitySlug: string;
  programSlug: string;
  semesterNumber: number;
  subjectCode: string;
  type: string; // e.g. "lectures", "notes", "assignments", "past-papers"
  filename: string;
}) {
  const { universitySlug, programSlug, semesterNumber, subjectCode, type, filename } = params;
  return `${universitySlug}/${programSlug}/semester-${semesterNumber}/${subjectCode}/${type}/${filename}`;
}

/**
 * Generates a presigned PUT URL — used by admin to upload a file directly to R2.
 * Expires in 5 minutes.
 */
export async function generateUploadUrl(fileKey: string, contentType: string) {
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: fileKey,
    ContentType: contentType,
  });
  return getSignedUrl(r2, command, { expiresIn: 300 }); // 5 min
}

/**
 * Generates a presigned GET URL — used to view/download a file.
 * Expires in 10 minutes.
 */
export async function generateDownloadUrl(fileKey: string) {
  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: fileKey,
  });
  return getSignedUrl(r2, command, { expiresIn: 600 }); // 10 min
}