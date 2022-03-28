export interface MotifCode {
  code: string;
  label: string;
  sousMotifCodes: string[];
}

export interface Motif {
  messageType: string;
  businessType: string;
  reasonCode: string;
}

export const motifIsEqualTo = (
  motif1: Motif,
  messageType: string,
  businessType: string,
  reasonCode: string
): boolean => {
  return (
    motif1.messageType == messageType &&
    motif1.businessType == businessType &&
    motif1.reasonCode == reasonCode
  );
};
