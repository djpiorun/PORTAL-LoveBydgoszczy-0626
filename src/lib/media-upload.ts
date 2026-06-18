export type MediaKind = "article" | "story" | "event" | "profile";

type MediaConfig = {
  r2Enabled?: boolean;
  mediaMaxWidth?: number;
  mediaQuality?: number;
  mediaConvertToWebp?: boolean;
};

type UploadParams = {
  file: File;
  kind: MediaKind;
  mediaConfig?: MediaConfig | null;
  createR2Upload: (args: { fileName: string; contentType: string; folder: string }) => Promise<{
    uploadUrl: string;
    fileUrl: string;
  }>;
  fallbackGenerateUploadUrl: () => Promise<string>;
  fallbackGetFileUrl: (args: any) => Promise<string | null>;
};

type UploadResult = {
  url: string;
  file: File;
  storageProvider: "r2" | "convex";
  width?: number;
  height?: number;
};

const DEFAULT_WIDTHS: Record<MediaKind, number> = {
  article: 1600,
  story: 1080,
  event: 1600,
  profile: 1400,
};

function renameFile(fileName: string, extension: string) {
  const base = fileName.replace(/\.[^.]+$/, "");
  return `${base}.${extension}`;
}

async function loadImage(file: File) {
  const objectUrl = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = objectUrl;
    });
    return image;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

async function optimizeImage(file: File, kind: MediaKind, mediaConfig?: MediaConfig | null) {
  if (!file.type.startsWith("image/") || file.type === "image/gif" || file.type === "image/svg+xml") {
    return file;
  }

  const image = await loadImage(file);
  const maxWidth = Math.min(mediaConfig?.mediaMaxWidth ?? DEFAULT_WIDTHS[kind], DEFAULT_WIDTHS[kind]);
  const targetWidth = image.width > maxWidth ? maxWidth : image.width;
  const targetHeight = Math.round((image.height / image.width) * targetWidth);

  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const context = canvas.getContext("2d");
  if (!context) return file;

  context.drawImage(image, 0, 0, targetWidth, targetHeight);

  const quality = Math.max(0.4, Math.min(0.95, (mediaConfig?.mediaQuality ?? 82) / 100));
  const convertToWebp = mediaConfig?.mediaConvertToWebp !== false;
  const outputType = convertToWebp ? "image/webp" : file.type === "image/png" ? "image/png" : "image/jpeg";

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, outputType, quality);
  });

  if (!blob) return file;

  const extension = outputType === "image/webp" ? "webp" : outputType === "image/png" ? "png" : "jpg";
  return new File([blob], renameFile(file.name, extension), {
    type: outputType,
    lastModified: Date.now(),
  });
}

async function getImageDimensions(file: File) {
  if (!file.type.startsWith("image/")) return {};
  const image = await loadImage(file);
  return {
    width: image.width,
    height: image.height,
  };
}

export async function uploadMediaAsset({
  file,
  kind,
  mediaConfig,
  createR2Upload,
  fallbackGenerateUploadUrl,
  fallbackGetFileUrl,
}: UploadParams): Promise<UploadResult> {
  if (mediaConfig === undefined) {
    throw new Error("Ustawienia mediow wciaz sie laduja. Sprobuj ponownie za chwile.");
  }

  const processedFile = await optimizeImage(file, kind, mediaConfig);
  const dimensions = await getImageDimensions(processedFile);

  if (mediaConfig?.r2Enabled) {
    try {
      const upload = await createR2Upload({
        fileName: processedFile.name,
        contentType: processedFile.type,
        folder: kind,
      });

      const response = await fetch(upload.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": processedFile.type },
        body: processedFile,
      });

      if (!response.ok) {
        throw new Error(`R2 upload failed (${response.status})`);
      }

      return {
        url: upload.fileUrl,
        file: processedFile,
        storageProvider: "r2",
        ...dimensions,
      };
    } catch (error) {
      console.error("R2 upload failed, falling back to default storage", error);
    }
  }

  const uploadUrl = await fallbackGenerateUploadUrl();
  const response = await fetch(uploadUrl, {
    method: "POST",
    headers: { "Content-Type": processedFile.type },
    body: processedFile,
  });
  if (!response.ok) {
    throw new Error(`Upload failed (${response.status})`);
  }
  const { storageId } = await response.json();
  const fileUrl = await fallbackGetFileUrl({ storageId });
  if (!fileUrl) {
    throw new Error("Upload completed, but file URL could not be resolved");
  }
  return {
    url: fileUrl,
    file: processedFile,
    storageProvider: "convex",
    ...dimensions,
  };
}
