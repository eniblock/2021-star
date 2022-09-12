import {TypeLimitation} from '../models/enum/TypeLimitation.enum';
import {Motif, motifsAreEqual, toMotif} from '../models/Motifs';
import {RechercheHistoriqueLimitationEntite} from "../models/RechercheHistoriqueLimitation";
import {isEnedis, isRte} from "./marketParticipantMrid-rules";
import {marketParticipantMridToMapMotifName, MotifEnedisToName, MotifRteToName} from "./motif-rules";

const manualLimitationRte: Motif[] = [];

const manualLimitationEnedis: Motif[] = [
  toMotif('D01', 'Z02', 'A70'),
  toMotif('D01', 'Z03', 'Y98'),
  toMotif('D01', 'Z04', 'Y99'),
];

const marketParticipantMridToManualLimitationMotifs = (marketParticipantMrdi: string): Motif[] => {
  if (isRte(marketParticipantMrdi)) {
    return manualLimitationRte;
  } else if (isEnedis(marketParticipantMrdi)) {
    return manualLimitationEnedis;
  }
  throw 'Unknown marketParticipantMrdi';
}

export const getLimitationType = (rhl: RechercheHistoriqueLimitationEntite): TypeLimitation => {
  const manualLimitations = marketParticipantMridToManualLimitationMotifs(rhl.activationDocument.senderMarketParticipantMrid);
  return manualLimitations.find(elem => motifsAreEqual(rhl.activationDocument, elem)) !== undefined
    ? TypeLimitation.MANUELLE
    : TypeLimitation.AUTOMATIQUE;
};

export const typeLimitationToMotifs = (typeLimitation: TypeLimitation, marketParticipantMrid: string): Motif[] => {
  if (typeLimitation == TypeLimitation.MANUELLE) {
    // Manual limitation
    return marketParticipantMridToManualLimitationMotifs(marketParticipantMrid);
  } else {
    // Automatic limitation
    const motifsToNames = marketParticipantMridToMapMotifName(marketParticipantMrid);
    const manualLimitations = marketParticipantMridToManualLimitationMotifs(marketParticipantMrid);
    let automaticMotifs: Motif[] = [];
    for (let key of motifsToNames.keys()) {
      if (manualLimitations.find(motif => motifsAreEqual(motif, key)) === undefined) {
        automaticMotifs.push(key);
      }
    }
    return automaticMotifs;
  }
}
