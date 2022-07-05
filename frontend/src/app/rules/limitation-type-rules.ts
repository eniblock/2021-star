import {TypeLimitation} from '../models/enum/TypeLimitation.enum';
import {motifIsEqualTo} from '../models/Motifs';
import {RechercheHistoriqueLimitationEntite} from "../models/RechercheHistoriqueLimitation";
import {isEnedis} from "./marketParticipantMrid-rules";

export const getLimitationType = (rhl: RechercheHistoriqueLimitationEntite): TypeLimitation => {
  const enedis = isEnedis(rhl.activationDocument.senderMarketParticipantMrid);
  if (
    enedis &&
    (motifIsEqualTo(rhl.activationDocument, 'D01', 'Z02', 'A70') ||
      motifIsEqualTo(rhl.activationDocument, 'D01', 'Z03', 'Y98') ||
      motifIsEqualTo(rhl.activationDocument, 'D01', 'Z04', 'Y99'))
  ) {
    return TypeLimitation.MANUELLE;
  }
  return TypeLimitation.AUTOMATIQUE;
};
