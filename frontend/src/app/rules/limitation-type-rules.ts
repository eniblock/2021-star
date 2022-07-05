import {TypeLimitation} from '../models/enum/TypeLimitation.enum';
import {Motif, motifIsEqualTo} from '../models/Motifs';
import {RechercheHistoriqueLimitationEntite} from "../models/RechercheHistoriqueLimitation";
import {isEnedis} from "./marketParticipantMrid-rules";

export const getLimitationType = (rhl: RechercheHistoriqueLimitationEntite): TypeLimitation => {
  const enedis = isEnedis(rhl.ordreLimitation.senderMarketParticipantMrid);
  if (
    enedis &&
    (motifIsEqualTo(rhl.ordreLimitation, 'D01', 'Z02', 'A70') ||
      motifIsEqualTo(rhl.ordreLimitation, 'D01', 'Z03', 'Y98') ||
      motifIsEqualTo(rhl.ordreLimitation, 'D01', 'Z04', 'Y99'))
  ) {
    return TypeLimitation.MANUELLE;
  }
  return TypeLimitation.AUTOMATIQUE;
};
