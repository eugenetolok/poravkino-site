import { getImageUrl } from "./apiClient";

export const getBackdropUrl = (
  posterPath: string | undefined,
  backdropPath: string | undefined,
): string => {
  // 1. Если есть backdrop от API, используем его
  if (backdropPath) {
    return getImageUrl(backdropPath);
  }

  // 2. Если нет, пытаемся сделать blured версию постера
  if (posterPath) {
    // Пример: /uploads/image.jpg -> /uploads/blured_image.jpg
    const parts = posterPath.split("/");
    const filename = parts.pop();

    if (filename) {
      const bluredPath = [...parts, `blured_${filename}`].join("/");

      return getImageUrl(bluredPath);
    }
  }

  // 3. Фолбек (можно поставить заглушку)
  return "";
};
