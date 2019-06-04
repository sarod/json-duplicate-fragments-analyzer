export const ellipsis = (string: string, maxLength: number = 100) => {
  if (string.length > maxLength) {
    return string.substr(0, maxLength - 1) + '…';
  }
  else {
    return string;
  }
};
