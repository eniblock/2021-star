export const tailleFichierToStr = (tailleByte: number): string => {
  if (tailleByte < 1000) {
    return tailleByte + ' octets';
  } else if (tailleByte < 1000000) {
    return Math.round(tailleByte / 100) / 10 + ' Ko';
  } else if (tailleByte < 1000000000) {
    return Math.round(tailleByte / 100000) / 10 + ' Mo';
  } else {
    return Math.round(tailleByte / 100000000) / 10 + ' Go';
  }
};
