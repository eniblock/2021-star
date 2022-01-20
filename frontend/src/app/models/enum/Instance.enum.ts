export enum Instance {
  DSO = 'DSO',
  TSO = 'TSO',
  PRODUCER = 'PRODUCER',
}

export const toTypeOrganisationFr = (instance: Instance): string => {
  switch (instance) {
    case Instance.DSO:
      return 'GRD';
    case Instance.TSO:
      return 'GRT';
    case Instance.PRODUCER:
      return 'PROD';
  }
};
