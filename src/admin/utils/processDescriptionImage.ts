// data:image/... -> compressed File
import imageCompression from "browser-image-compression";
const base64ToCompressedFile = async (
  base64: string,
  fileName: string
): Promise<File> => {
  const res = await fetch(base64);
  const blob = await res.blob();
  const file = new File([blob], fileName, { type: blob.type });

  const compressed = await imageCompression(file, {
    maxSizeMB: 0.5,
    maxWidthOrHeight: 1024,
    useWebWorker: true,
  });

  return compressed;
};

export const processDescriptionImages = async (
  html: string,
  formData: FormData
): Promise<string> => {
  // supports src="..." or src='...'
  const imgRegex = /<img[^>]+src=(?:"|')(data:image\/[^"']+)(?:"|')[^>]*>/g;

  let updated = html;
  let match: RegExpExecArray | null;
  let i = 0;

  while ((match = imgRegex.exec(html)) !== null) {
    const base64 = match[1];
    const fileName = `desc-${Date.now()}-${i}.jpg`;

    const file = await base64ToCompressedFile(base64, fileName);
    formData.append("descriptionImages", file, fileName);
    updated = updated.replace(base64, `/uploads/${fileName}`);
    i++;
  }
  return updated;
};

export const processDescriptionDesImages = async (
  html: string,
  formData: FormData
): Promise<string> => {
  let updated = html;
  let i = 0;

  // 1) HANDLE BASE64 IMAGES
  const base64Regex = /<img[^>]+src=(?:"|')(data:image\/[^"']+)(?:"|')[^>]*>/g;
  let m1: RegExpExecArray | null;
  while ((m1 = base64Regex.exec(html)) !== null) {
    const base64 = m1[1];
    const fileName = `desc-${Date.now()}-${i}.jpg`;

    const file = await base64ToCompressedFile(base64, fileName);
    formData.append("descriptionImages", file, fileName);

    updated = updated.replace(base64, `/uploads/${fileName}`);
    i++;
  }

  // 2) HANDLE LOCAL /UPLOADS/ PATH IMAGES
  const localRegex = /<img[^>]+src=(?:"|')\/uploads\/([^"']+)(?:"|')[^>]*>/g;
  let m2: RegExpExecArray | null;
  while ((m2 = localRegex.exec(html)) !== null) {
    const filePath = m2[1];

    const fullUrl = `${window.location.origin}/uploads/${filePath}`;
    const fileName = `desc-${Date.now()}-${i}.jpg`;
    const resp = await fetch(fullUrl);
    const blob = await resp.blob();
    const file = new File([blob], fileName, { type: blob.type });

    formData.append("descriptionImages", file, fileName);
    updated = updated.replace(`/uploads/${filePath}`, `/uploads/${fileName}`);
    i++;
  }

  return updated;
};
