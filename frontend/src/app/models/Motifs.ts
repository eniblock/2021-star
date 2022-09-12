import {OrdreLimitation} from "./OrdreLimitation";

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
  motif1: Motif | OrdreLimitation,
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

export const motifsAreEqual = (
  motif1: Motif | OrdreLimitation,
  motif2: Motif | OrdreLimitation,
): boolean => {
  return (
    motif1.messageType == motif2.messageType &&
    motif1.businessType == motif2.businessType &&
    motif1.reasonCode == motif2.reasonCode
  );
};
