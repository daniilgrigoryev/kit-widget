export const checkImage = (imageSrc: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!imageSrc.trim()) {
      reject('');
      return;
    }

    const img = new Image();
    img.onload = () => resolve(imageSrc);
    img.onerror = () => reject(imageSrc);
    img.src = imageSrc;
  });
};
