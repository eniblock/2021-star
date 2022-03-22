import { TypeSite } from '../models/enum/TypeSite.enum';
import { Motif, motifIsEqualTo } from '../models/Motifs';

export const whichDateMustBeShown = (
  typeSite: TypeSite,
  motifEnedis: Motif | undefined
): { showRteDate: boolean; showEnedisDate: boolean } => {
  if (typeSite == TypeSite.HTB) {
    return {
      showRteDate: true,
      showEnedisDate: false,
    };
  } else if (
    motifEnedis != null &&
    motifIsEqualTo(motifEnedis, 'D01', 'Z01', 'A70')
  ) {
    return {
      showRteDate: true,
      showEnedisDate: true,
    };
  } else {
    return {
      showRteDate: false,
      showEnedisDate: true,
    };
  }
};
