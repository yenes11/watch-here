const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

export type ImageSize = 'w92' | 'w342' | 'w500' | 'w780' | 'w1280' | 'original';

export const tmdbImage = (path: string, size: ImageSize): string =>
  `${IMAGE_BASE_URL}/${size}${path}`;
