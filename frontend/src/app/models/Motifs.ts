export const getMessagesTypes = (): CodeLabel[] => {
  return Object.entries(messageTypes).map(([type, value]) =>
    toCodeLabel(type, value)
  );
};

export const getBusinessTypes = (messageTypeCode: string): CodeLabel[] => {
  if (messageTypeCode == 'A98' || messageTypeCode == 'A54') {
    return Object.entries(businessTypes).map(([type, value]) =>
      toCodeLabel(type, value)
    );
  } else {
    return [];
  }
};

export const getReasonCodes = (businessTypeCode: string): CodeLabel[] => {
  if (businessTypeCode == 'C55') {
    return Object.entries(reasonCodes_grp1).map(([type, value]) =>
      toCodeLabel(type, value)
    );
  } else if (businessTypeCode == 'A53') {
    return Object.entries(reasonCodes_grp2).map(([type, value]) =>
      toCodeLabel(type, value)
    );
  } else {
    return [];
  }
};

export const messageTypes = {
  A98: 'Aléa - ordre TVC simple',
  A54: 'Ordre Tor',
  A97: 'Ordre TVC de modulation',
  B23: "Offres à activer (Mécanisme d'ajustement)",
};

export const businessTypes = {
  C55: 'Ordres TC ou TVC',
  A53: 'Travaux Programmés',
};

export const reasonCodes_grp1 = {
  A70: 'Réseau complet',
  A98: 'Aléa - ordre TVC simple',
  Z71: 'Réseau complet IST min',
  Z72: 'Réseau complet ORA',
  Z73: 'Réseau complet DIM Optimal',
  Z74: 'Réseau complet Contrat Amont',
  Z91: 'Aléa Réseau Evacuation',
  Z92: 'Aléa Réseau Amont',
};

export const reasonCodes_grp2 = {
  ZB1: 'Travaux Programmés CART',
  ZB2: 'Travaux Programmés CART-RU',
  ZB3: 'Travaux Programmés CART-RII',
  ZB4: 'Travaux Programmés CART-RVU',
  ZB5: 'Travaux Programmés CART Contrat Amont',
  ZB6: 'Travaux Programmés CART GP',
};

export interface CodeLabel {
  code: string;
  label: string;
  subEntities?: CodeLabel[];
}

const toCodeLabel = (key: any, value: any): CodeLabel => ({
  code: key,
  label: value,
});
