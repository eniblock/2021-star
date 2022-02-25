export interface CodeLabel {
  code: string;
  label: string;
  subEntities?: CodeLabel[];
}

export const messageTypes = {
  A98: 'Aléa - ordre TVC simple',
  A54: 'Travaux Programmés',
  A97: 'Ordre TVC de modulation',
  B23: "Offres à activer (Mécanisme d'ajustement)",
};

export const businessTypes = {
  C55: 'Ordres TC ou TVC',
  A53: 'Travaux Programmés',
};

export const reasonCodes = {
  A70: 'Réseau complet',
  A98: 'Aléa - ordre TVC simple',
  Z71: 'Réseau complet IST min',
  Z72: 'Réseau complet ORA',
  Z73: 'Réseau complet DIM Optimal',
  Z74: 'Réseau complet Contrat Amont',
  Z91: 'Aléa Réseau Evacuation',
  Z92: 'Aléa Réseau Amont',
  ZB1: 'Travaux Programmés CART',
  ZB2: 'Travaux Programmés CART-RU',
  ZB3: 'Travaux Programmés CART-RII',
  ZB4: 'Travaux Programmés CART-RVU',
  ZB5: 'Travaux Programmés CART Contrat Amont',
  ZB6: 'Travaux Programmés CART GP',
};
