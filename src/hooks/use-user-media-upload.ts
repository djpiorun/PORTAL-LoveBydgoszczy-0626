import { toast } from "sonner";

import { uploadMediaAsset } from "@/lib/media-upload";

export function useUserMediaUpload() {
  return async (file: File) => {
    const result = await uploadMediaAsset({
      file,
      kind: "profile",
      folder: "profile",
      sourceKind: "profile",
    });

    if (result.storageProvider !== "local" && result.storageProvider !== "r2") {
      toast.warning("Uzyto innego storage niż lokalny.");
    }

    return result.url;
  };
}
