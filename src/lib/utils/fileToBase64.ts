// utils/fileToBase64.ts
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const base64String = result.split(',')[1]; // Get only the base64 string part
      resolve(base64String);
    };
    reader.onerror = (error) => reject(error);
  });
}
