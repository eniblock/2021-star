import { Instance } from './Instance.enum';

export enum TypeDeRechercheSimple {
  producerMarketParticipantName = 'producerMarketParticipantName',
  siteName = 'siteName',
  substationName = 'substationName',
}

export const getTypesDeRechercheSimple = (
  instance: Instance
): TypeDeRechercheSimple[] => {
  switch (instance) {
    case Instance.DSO:
      return [
        TypeDeRechercheSimple.producerMarketParticipantName,
        TypeDeRechercheSimple.siteName,
        TypeDeRechercheSimple.substationName,
      ];
    case Instance.TSO:
      return [
        TypeDeRechercheSimple.producerMarketParticipantName,
        TypeDeRechercheSimple.siteName,
        TypeDeRechercheSimple.substationName,
      ];
    case Instance.PRODUCER:
      return [
        TypeDeRechercheSimple.siteName,
        TypeDeRechercheSimple.substationName,
      ];
  }
};
