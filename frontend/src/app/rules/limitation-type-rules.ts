import {TypeLimitation} from '../models/enum/TypeLimitation.enum';
import {Motif, motifIsEqualTo, motifsAreEqual} from '../models/Motifs';
import {RechercheHistoriqueLimitationEntite} from "../models/RechercheHistoriqueLimitation";
import {isEnedis} from "./marketParticipantMrid-rules";

const manualLimitationRte: Motif[] = [];

const manualLimitationEnedis: Motif[] = [
  {messageType: 'D01', businessType: 'Z02', reasonCode: 'A70'},
  {messageType: 'D01', businessType: 'Z03', reasonCode: 'Y98'},
  {messageType: 'D01', businessType: 'Z04', reasonCode: 'Y99'},
];

export const getLimitationType = (rhl: RechercheHistoriqueLimitationEntite): TypeLimitation => {
  const enedis = isEnedis(rhl.activationDocument.senderMarketParticipantMrid);
  const manualLimitations = enedis ? manualLimitationEnedis : manualLimitationRte;
  return manualLimitations.find(elem => motifsAreEqual(rhl.activationDocument, elem)) !== undefined
    ? TypeLimitation.MANUELLE
    : TypeLimitation.AUTOMATIQUE;
};

export const typeLimitationToMotifs = (typeLimitation: TypeLimitation, marketParticipantMrid: string): Motif[] => {
  const enedis = isEnedis(marketParticipantMrid);
  const manualLimitations = enedis ? manualLimitationEnedis : manualLimitationRte;
  switch (typeLimitation) {
    case TypeLimitation.MANUELLE:
      return manualLimitations;
    case TypeLimitation.AUTOMATIQUE:
      return []; // TODO !!!!!!!!!!!!!!!!
  }
}
