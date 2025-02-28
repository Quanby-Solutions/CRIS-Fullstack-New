// lib/utils/file-helpers.ts

/**
 * Checks if a value is a File-like object in an isomorphic way
 * Works in both browser and server environments
 */
export function isFileLike(value: any): boolean {
  // Check if we're in a browser environment with File API
  if (
    typeof window !== 'undefined' &&
    typeof File !== 'undefined' &&
    value instanceof File
  ) {
    return true;
  }

  // Check if it's a file-like object (has size and type properties)
  if (
    value &&
    typeof value === 'object' &&
    'size' in value &&
    'type' in value
  ) {
    return true;
  }

  return false;
}

/**
 * Enhanced fileToBase64 function that works in isomorphic contexts
 */
export async function fileToBase64(file: any): Promise<string> {
  // If it's already a string, return it
  if (typeof file === 'string') {
    return file;
  }

  // Handle browser environment
  if (typeof window !== 'undefined') {
    // Use FileReader in browser
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  }
  // Handle server environment (if file is Buffer-like)
  else if (file && 'buffer' in file) {
    // Convert Buffer to base64
    return Buffer.from(file.buffer).toString('base64');
  }
  // Fallback for other cases
  else {
    throw new Error('Unable to convert file to base64');
  }
}
