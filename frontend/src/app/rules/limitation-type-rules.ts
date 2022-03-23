import { TypeLimitation } from '../models/enum/TypeLimitation.enum';
import { Motif, motifIsEqualTo } from '../models/Motifs';

export const getLimitationType = (
  motifRte: Motif | undefined,
  motifEnedis: Motif | undefined
): TypeLimitation => {
  if (
    motifEnedis != null &&
    (motifIsEqualTo(motifEnedis, 'D01', 'Z02', 'A70') ||
      motifIsEqualTo(motifEnedis, 'D01', 'Z03', 'Y98') ||
      motifIsEqualTo(motifEnedis, 'D01', 'Z04', 'Y99'))
  ) {
    return TypeLimitation.MANUELLE;
  }
  return TypeLimitation.AUTOMATIQUE;
};
