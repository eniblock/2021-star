import {TypeLimitation} from '../models/enum/TypeLimitation.enum';
import {Motif, motifsAreEqual, toMotif} from '../models/Motifs';
import {RechercheHistoriqueLimitationEntite} from "../models/RechercheHistoriqueLimitation";
import {isEnedis} from "./marketParticipantMrid-rules";
import {MotifEnedisToName, MotifRteToName} from "./motif-rules";

const manualLimitationRte: Motif[] = [];

const manualLimitationEnedis: Motif[] = [
  toMotif('D01', 'Z02', 'A70'),
  toMotif('D01', 'Z03', 'Y98'),
  toMotif('D01', 'Z04', 'Y99'),
];

export const getLimitationType = (rhl: RechercheHistoriqueLimitationEntite): TypeLimitation => {
  const enedis = isEnedis(rhl.activationDocument.senderMarketParticipantMrid);
  const manualLimitations = enedis ? manualLimitationEnedis : manualLimitationRte;
  return manualLimitations.find(elem => motifsAreEqual(rhl.activationDocument, elem)) !== undefined
    ? TypeLimitation.MANUELLE
    : TypeLimitation.AUTOMATIQUE;
};

export const typeLimitationToMotifs = (typeLimitation: TypeLimitation, marketParticipantMrid: string): Motif[] => {
  if (typeLimitation == TypeLimitation.MANUELLE) {
    // Manual limitation
    return isEnedis(marketParticipantMrid) ? manualLimitationEnedis : manualLimitationRte;
  } else {
    // Automatic limitation
    const motifsToNames = isEnedis(marketParticipantMrid) ? MotifEnedisToName : MotifRteToName;
    const manualLimitations = isEnedis(marketParticipantMrid) ? manualLimitationEnedis : manualLimitationRte;
    let automaticMotifs: Motif[] = [];
    for (let key of motifsToNames.keys()) {
      if (manualLimitations.find(motif => motifsAreEqual(motif, key)) === undefined) {
        automaticMotifs.push(key);
      }
    }
    return automaticMotifs;
  }
}
