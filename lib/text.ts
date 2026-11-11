const COMBINING_MARKS = /[̀-ͯ]/g;

/**
 * Folds a string for forgiving search: case-, accent- and Turkish
 * dotless-ı-insensitive, so "turkiye" matches "Türkiye".
 */
export const normalizeForSearch = (value: string): string =>
  value
    .toLocaleLowerCase('en')
    .normalize('NFD')
    .replace(COMBINING_MARKS, '')
    .replaceAll('ı', 'i');
