export const MAX_IMAGE_FILE_BYTES = 5 * 1024 * 1024;
export const MAX_IMAGE_WIDTH = 4096;
export const MAX_IMAGE_HEIGHT = 4096;
export const MAX_IMAGE_PIXELS = 12_000_000;
export const MAX_FINAL_IMAGE_DATA_URL_BYTES = 1_500_000;
export const SUPPORTED_MENU_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;

type MenuImageType = (typeof SUPPORTED_MENU_IMAGE_TYPES)[number];

export class MenuImageValidationError extends Error {}

export const validateMenuImageFile = (file: Pick<File, 'type' | 'size'>): MenuImageType => {
  if (!SUPPORTED_MENU_IMAGE_TYPES.includes(file.type as MenuImageType)) throw new MenuImageValidationError('Choose a JPEG, PNG, or WebP image.');
  if (file.size > MAX_IMAGE_FILE_BYTES) throw new MenuImageValidationError('Image must be 5 MB or smaller.');
  return file.type as MenuImageType;
};

export const validateMenuImageDimensions = (width: number, height: number): void => {
  if (!Number.isInteger(width) || !Number.isInteger(height) || width <= 0 || height <= 0) throw new MenuImageValidationError('Image data is invalid.');
  if (width > MAX_IMAGE_WIDTH || height > MAX_IMAGE_HEIGHT || width * height > MAX_IMAGE_PIXELS) throw new MenuImageValidationError('Image dimensions are too large. Choose an image up to 12 megapixels.');
};

export const validateMenuImagePayload = (dataUrl: string): void => {
  if (!dataUrl.startsWith('data:image/jpeg;base64,') || new Blob([dataUrl]).size > MAX_FINAL_IMAGE_DATA_URL_BYTES) throw new MenuImageValidationError('Processed image is too large. Choose a smaller image.');
};

const readFileAsDataUrl = (file: File): Promise<string> => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => typeof reader.result === 'string' ? resolve(reader.result) : reject(new MenuImageValidationError('Image data is invalid.'));
  reader.onerror = () => reject(new MenuImageValidationError('Unable to read image.'));
  reader.readAsDataURL(file);
});

const loadImage = (dataUrl: string): Promise<HTMLImageElement> => new Promise((resolve, reject) => {
  const image = new Image();
  image.onload = () => resolve(image);
  image.onerror = () => reject(new MenuImageValidationError('Image data is invalid.'));
  image.src = dataUrl;
});

export const compressMenuImage = async (file: File, maxSize = 600, quality = 0.82): Promise<string> => {
  validateMenuImageFile(file);
  const image = await loadImage(await readFileAsDataUrl(file));
  validateMenuImageDimensions(image.naturalWidth || image.width, image.naturalHeight || image.height);
  const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) throw new MenuImageValidationError('Unable to process image.');
  context.drawImage(image, 0, 0, width, height);
  const dataUrl = canvas.toDataURL('image/jpeg', quality);
  validateMenuImagePayload(dataUrl);
  return dataUrl;
};
