import { del, put } from "@vercel/blob";

export const UploadToStorage = async (file: ArrayBuffer, name: string) => {
  try {
    const blob = await put(name, file, { access: "public" });
    return blob;
  } catch (error) {
    console.log("Upload to storage", error);
    return null;
  }
};

export const DeleteFromStorage = async (fileurl: string) => {
  try {
    await del(fileurl);
  } catch (error) {
    console.log("Delete from storage", error);
    throw error;
  }
};
