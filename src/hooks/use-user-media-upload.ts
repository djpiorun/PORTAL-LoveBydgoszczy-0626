import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { uploadMediaAsset } from "@/lib/media-upload";
import { toast } from "sonner";

export function useUserMediaUpload() {
  const mediaConfig = useQuery((api as any).settings.getMediaConfig);
  const createR2UploadUrl = useAction((api as any).media.createUploadUrl);
  const generateUploadUrl = useMutation(api.users.generateUploadUrl);
  const getFileUrl = useMutation(api.users.getFileUrl);

  return async (file: File) => {
    const result = await uploadMediaAsset({
      file,
      kind: "profile",
      mediaConfig,
      createR2Upload: createR2UploadUrl,
      fallbackGenerateUploadUrl: generateUploadUrl,
      fallbackGetFileUrl: getFileUrl,
    });

    if (result.storageProvider !== "r2") {
      toast.warning("R2 nie odpowiedzialo. Uzyto zapasowego storage Convex.");
    }

    return result.url;
  };
}
