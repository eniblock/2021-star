import {Motif, MotifCode, motifIsEqualTo, motifsAreEqual, toMotif} from '../models/Motifs';
import {OrdreLimitation} from "../models/OrdreLimitation";
import {isEnedis, isRte} from "./marketParticipantMrid-rules";
import {SortHelper} from "../helpers/sort.helper";


/////////////////////////////////////////
////////////// MOTIF CODES //////////////
/////////////////////////////////////////

export const MessageTypes: MotifCode[] = [
  {
    code: 'A98',
    label: 'Aléa - ordre TVC simple',
    sousMotifCodes: ['C55', 'A53'],
  },
  {
    code: 'A54',
    label: 'Ordre Tor',
    sousMotifCodes: ['C55', 'A53'],
  },
];

export const BusinessTypes: MotifCode[] = [
  {
    code: 'C55',
    label: 'Ordres TC ou TVC',
    sousMotifCodes: ['A70', 'A98', 'Z71', 'Z72', 'Z73', 'Z74', 'Z91', 'Z92'],
  },
  {
    code: 'A53',
    label: 'Travaux Programmés',
    sousMotifCodes: ['ZB1', 'ZB2', 'ZB3', 'ZB4', 'ZB5', 'ZB6'],
  },
];

export const ReasonCodes: MotifCode[] = [
  {
    code: 'A70',
    label: 'Réseau complet',
    sousMotifCodes: [],
  },
  {
    code: 'A98',
    label: 'Aléa - ordre TVC simple',
    sousMotifCodes: [],
  },
  {
    code: 'Z71',
    label: 'Réseau complet IST min',
    sousMotifCodes: [],
  },
  {
    code: 'Z72',
    label: 'Réseau complet ORA',
    sousMotifCodes: [],
  },
  {
    code: 'Z73',
    label: 'Réseau complet DIM Optimal',
    sousMotifCodes: [],
  },
  {
    code: 'Z74',
    label: 'Réseau complet Contrat Amont',
    sousMotifCodes: [],
  },
  {
    code: 'Z91',
    label: 'Aléa Réseau Evacuation',
    sousMotifCodes: [],
  },
  {
    code: 'Z92',
    label: 'Aléa Réseau Amont',
    sousMotifCodes: [],
  },
  {
    code: 'ZB1',
    label: 'Travaux Programmés CART',
    sousMotifCodes: [],
  },
  {
    code: 'ZB2',
    label: 'Travaux Programmés CART-RU',
    sousMotifCodes: [],
  },
  {
    code: 'ZB3',
    label: 'Travaux Programmés CART-RII',
    sousMotifCodes: [],
  },
  {
    code: 'ZB4',
    label: 'Travaux Programmés CART-RVU',
    sousMotifCodes: [],
  },
  {
    code: 'ZB5',
    label: 'Travaux Programmés CART Contrat Amont',
    sousMotifCodes: [],
  },
  {
    code: 'ZB6',
    label: 'Travaux Programmés CART GP',
    sousMotifCodes: [],
  },
];


/////////////////////////////////////////
////////////// MOTIF NAMES //////////////
/////////////////////////////////////////

export const MotifRteToName = new Map<Motif, string>([
  [toMotif('A98', 'C55', 'A70'), 'Réseau complet'],
  [toMotif('A98', 'C55', 'A98'), 'Aléa'],
  [toMotif('A54', 'C55', 'A70'), 'Réseau complet'],
  [toMotif('A54', 'C55', 'A98'), 'Aléa'],
  [toMotif('A98', 'C55', 'Z71'), 'Réseau complet - IST min'],
  [toMotif('A98', 'C55', 'Z72'), 'Réseau complet - ORA'],
  [toMotif('A98', 'C55', 'Z73'), 'Réseau complet - Dim Optimal'],
  [toMotif('A98', 'C55', 'Z74'), 'Réseau complet - Contrat Amont'],
  [toMotif('A98', 'C53', 'ZB1'), 'Travaux Programmés - CART'],
  [toMotif('A98', 'C53', 'ZB2'), 'Travaux Programmés - CART-RU'],
  [toMotif('A98', 'C53', 'ZB3'), 'Travaux Programmés - CART-RII'],
  [toMotif('A98', 'C53', 'ZB4'), 'Travaux Programmés - CART-RVU'],
  [toMotif('A98', 'C53', 'ZB5'), 'Travaux Programmés - Contrat Amont'],
  [toMotif('A98', 'C53', 'ZB6'), 'Travaux Programmés - Contrat GP'],
  [toMotif('A98', 'C55', 'Z91'), 'Aléa - Réseau Evacuation'],
  [toMotif('A98', 'C55', 'Z92'), 'Aléa - Réseau Amont'],
  [toMotif('A54', 'C55', 'Z71'), 'Réseau complet - IST min'],
  [toMotif('A54', 'C55', 'Z72'), 'Réseau complet - ORA'],
  [toMotif('A54', 'C55', 'Z73'), 'Réseau complet - Dim Optimal'],
  [toMotif('A54', 'C55', 'Z74'), 'Réseau complet - Contrat Amont'],
  [toMotif('A98', 'A53', 'ZB1'), 'Travaux Programmés - CART'],
  [toMotif('A98', 'A53', 'ZB2'), 'Travaux Programmés - CART-RU'],
  [toMotif('A98', 'A53', 'ZB3'), 'Travaux Programmés - CART-RII'],
  [toMotif('A98', 'A53', 'ZB4'), 'Travaux Programmés - CART-RVU'],
  [toMotif('A98', 'A53', 'ZB5'), 'Travaux Programmés - Contrat Amont'],
  [toMotif('A98', 'A53', 'ZB6'), 'Travaux Programmés - Contrat GP'],
  [toMotif('A54', 'C55', 'Z91'), 'Aléa - Réseau Evacuation'],
  [toMotif('A54', 'C55', 'Z92'), 'Aléa - Réseau Amont'],
]);

export const MotifEnedisToName = new Map<Motif, string>([
  [toMotif('D01', 'Z01', 'A70'), 'Contrainte RPT avec ASR'],
  [toMotif('D01', 'Z02', 'A70'), 'Contrainte RPT sans ASR'],
  [toMotif('D01', 'Z03', 'Y98'), 'Incident RTE'],
  [toMotif('D01', 'Z04', 'Y99'), 'Incident Enedis'],
]);


//////////////////////////////////////
////////////// METHODES //////////////
//////////////////////////////////////

export const marketParticipantMridToMapMotifName = (marketParticipantMrdi: string): Map<Motif, string> => {
  if (isRte(marketParticipantMrdi)) {
    return MotifRteToName;
  } else if (isEnedis(marketParticipantMrdi)) {
    return MotifEnedisToName;
  }
  throw 'Unknown marketParticipantMrdi';
}

export const getMessageTypeByCode = (code: string): MotifCode => {
  const t = MessageTypes.filter((mt) => mt.code == code);
  return t[0];
};

export const getBusinessTypeByCode = (code: string): MotifCode => {
  const t = BusinessTypes.filter((mt) => mt.code == code);
  return t[0];
};

export const getReasonCodeByCode = (code: string): MotifCode => {
  const t = ReasonCodes.filter((mt) => mt.code == code);
  return t[0];
};

export const getAllBusinessTypesByMessageTypeCode = (
  messageTypeCode: string
): MotifCode[] => {
  const messageType = getMessageTypeByCode(messageTypeCode);
  return BusinessTypes.filter((bt) =>
    messageType.sousMotifCodes.includes(bt.code)
  );
};

export const getAllReasonCodeByBusinessTypeCode = (
  businessTypeCode: string
): MotifCode[] => {
  const businessType = getBusinessTypeByCode(businessTypeCode);
  return ReasonCodes.filter((rc) =>
    businessType.sousMotifCodes.includes(rc.code)
  );
};

export const motifToString = (ordreLimitation: OrdreLimitation): string => {
  if (
    ordreLimitation == null ||
    ordreLimitation.messageType == null ||
    ordreLimitation.businessType == null ||
    ordreLimitation.reasonCode == null
  ) {
    return '';
  }
  const map = marketParticipantMridToMapMotifName(ordreLimitation.senderMarketParticipantMrid);
  for (let [key, value] of map.entries()) {
    if (motifsAreEqual(ordreLimitation, key)) {
      return value;
    }
  }
  return `Inconnu (${ordreLimitation.messageType},${ordreLimitation.businessType},${ordreLimitation.reasonCode})`;
}

// Use InstanceService.getParticipantMrid() to get the marketParticipantMrid
export const getAllMotifsNames = (marketParticipantMrid: string): string[] => {
  const motifsToNames = marketParticipantMridToMapMotifName(marketParticipantMrid);
  return Array.from(motifsToNames.values()).sort(SortHelper.caseInsensitive);
}

// Use InstanceService.getParticipantMrid() to get the marketParticipantMrid
export const nameToMotif = (name: string, marketParticipantMrid: string): Motif[] => {
  const motifsToNames = marketParticipantMridToMapMotifName(marketParticipantMrid);
  let result: Motif[] = [];
  for (let [key, value] of motifsToNames.entries()) {
    if (value == name) {
      result.push(key);
    }
  }
  return result;
}
