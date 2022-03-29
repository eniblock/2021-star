import { Motif, MotifCode, motifIsEqualTo } from '../models/Motifs';

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

export const getMessageTypeByCode = (code: string): MotifCode => {
  const t = MessageTypes.filter((mt) => mt.code == code);
  return t[0];
};

export const getBusinessTypeByCode = (code: string): MotifCode => {
  const t = BusinessTypes.filter((mt) => mt.code == code);
  return t[0];
};

export const getreasonCodeByCode = (code: string): MotifCode => {
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

/////////////////////////////////////////
////////////// MOTIF NAMES //////////////
/////////////////////////////////////////

export const motifRteToString = (motif?: Motif): string => {
  if (
    motif == null ||
    motif.messageType == null ||
    motif.businessType == null ||
    motif.reasonCode == null
  ) {
    return '';
  } else if (motifIsEqualTo(motif, 'A98', 'C55', 'A70')) {
    return 'Réseau complet';
  } else if (motifIsEqualTo(motif, 'A98', 'C55', 'A98')) {
    return 'Aléa';
  } else if (motifIsEqualTo(motif, 'A54', 'C55', 'A70')) {
    return 'Réseau complet';
  } else if (motifIsEqualTo(motif, 'A54', 'C55', 'A98')) {
    return 'Aléa';
  } else if (motifIsEqualTo(motif, 'A98', 'C55', 'Z71')) {
    return 'Réseau complet - IST min';
  } else if (motifIsEqualTo(motif, 'A98', 'C55', 'Z72')) {
    return 'Réseau complet - ORA';
  } else if (motifIsEqualTo(motif, 'A98', 'C55', 'Z73')) {
    return 'Réseau complet - Dim Optimal';
  } else if (motifIsEqualTo(motif, 'A98', 'C55', 'Z74')) {
    return 'Réseau complet - Contrat Amont';
  } else if (motifIsEqualTo(motif, 'A98', 'C53', 'ZB1')) {
    return 'Travaux Programmés - CART';
  } else if (motifIsEqualTo(motif, 'A98', 'C53', 'ZB2')) {
    return 'Travaux Programmés - CART-RU';
  } else if (motifIsEqualTo(motif, 'A98', 'C53', 'ZB3')) {
    return 'Travaux Programmés - CART-RII';
  } else if (motifIsEqualTo(motif, 'A98', 'C53', 'ZB4')) {
    return 'Travaux Programmés - CART-RVU';
  } else if (motifIsEqualTo(motif, 'A98', 'C53', 'ZB5')) {
    return 'Travaux Programmés - Contrat Amont';
  } else if (motifIsEqualTo(motif, 'A98', 'C53', 'ZB6')) {
    return 'Travaux Programmés - Contrat GP';
  } else if (motifIsEqualTo(motif, 'A98', 'C55', 'Z91')) {
    return 'Aléa - Réseau Evacuation';
  } else if (motifIsEqualTo(motif, 'A98', 'C55', 'Z92')) {
    return 'Aléa - Réseau Amont';
  } else if (motifIsEqualTo(motif, 'A54', 'C55', 'Z71')) {
    return 'Réseau complet - IST min';
  } else if (motifIsEqualTo(motif, 'A54', 'C55', 'Z72')) {
    return 'Réseau complet - ORA';
  } else if (motifIsEqualTo(motif, 'A54', 'C55', 'Z73')) {
    return 'Réseau complet - Dim Optimal';
  } else if (motifIsEqualTo(motif, 'A54', 'C55', 'Z74')) {
    return 'Réseau complet - Contrat Amont';
  } else if (motifIsEqualTo(motif, 'A98', 'A53', 'ZB1')) {
    return 'Travaux Programmés - CART';
  } else if (motifIsEqualTo(motif, 'A98', 'A53', 'ZB2')) {
    return 'Travaux Programmés - CART-RU';
  } else if (motifIsEqualTo(motif, 'A98', 'A53', 'ZB3')) {
    return 'Travaux Programmés - CART-RII';
  } else if (motifIsEqualTo(motif, 'A98', 'A53', 'ZB4')) {
    return 'Travaux Programmés - CART-RVU';
  } else if (motifIsEqualTo(motif, 'A98', 'A53', 'ZB5')) {
    return 'Travaux Programmés - Contrat Amont';
  } else if (motifIsEqualTo(motif, 'A98', 'A53', 'ZB6')) {
    return 'Travaux Programmés - Contrat GP';
  } else if (motifIsEqualTo(motif, 'A54', 'C55', 'Z91')) {
    return 'Aléa - Réseau Evacuation';
  } else if (motifIsEqualTo(motif, 'A54', 'C55', 'Z92')) {
    return 'Aléa - Réseau Amont';
  }
  return `Inconnu (${motif.messageType},${motif.businessType},${motif.reasonCode})`;
};

export const motifEnedisToString = (motif?: Motif): string => {
  if (
    motif == null ||
    motif.messageType == null ||
    motif.businessType == null ||
    motif.reasonCode == null
  ) {
    return '';
  } else if (motifIsEqualTo(motif, 'D01', 'Z01', 'A70')) {
    return 'Contrainte RPT avec ASR';
  } else if (motifIsEqualTo(motif, 'D01', 'Z02', 'A70')) {
    return 'Contrainte RPT sans ASR';
  } else if (motifIsEqualTo(motif, 'D01', 'Z03', 'Y98')) {
    return 'Incident RTE';
  } else if (motifIsEqualTo(motif, 'D01', 'Z04', 'Y99')) {
    return 'Incident Enedis';
  }
  return `Inconnu (${motif.messageType},${motif.businessType},${motif.reasonCode})`;
};
