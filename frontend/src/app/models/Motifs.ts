export interface Motif {
  code: string;
  label: string;
  sousMotifCodes: string[];
}

export const messageTypes: Motif[] = [
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
  //A97: 'Ordre TVC de modulation',
  //B23: "Offres à activer (Mécanisme d'ajustement)",
];

export const businessTypes: Motif[] = [
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

export const reasonCodes: Motif[] = [
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

export const getMessageTypeByCode = (code: string): Motif => {
  const t = messageTypes.filter((mt) => mt.code == code);
  return t[0];
};

export const getBusinessTypeByCode = (code: string): Motif => {
  const t = businessTypes.filter((mt) => mt.code == code);
  return t[0];
};

export const getreasonCodeByCode = (code: string): Motif => {
  const t = reasonCodes.filter((mt) => mt.code == code);
  return t[0];
};

export const getAllBusinessTypesByMessageTypeCode = (
  messageTypeCode: string
): Motif[] => {
  const messageType = getMessageTypeByCode(messageTypeCode);
  return businessTypes.filter((bt) =>
    messageType.sousMotifCodes.includes(bt.code)
  );
};

export const getAllReasonCodeByBusinessTypeCode = (
  businessTypeCode: string
): Motif[] => {
  const businessType = getBusinessTypeByCode(businessTypeCode);
  return reasonCodes.filter((rc) =>
    businessType.sousMotifCodes.includes(rc.code)
  );
};
