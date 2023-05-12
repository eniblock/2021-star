import {IndeminityStatus} from "../models/enum/IndeminityStatus.enum";
import {Instance} from "../models/enum/Instance.enum";
import {RechercheHistoriqueLimitationEntite} from "../models/RechercheHistoriqueLimitation";
import {TypeSite} from "../models/enum/TypeSite.enum";

export const showAbandonButton = (historiqueLimitation: RechercheHistoriqueLimitationEntite | undefined, instance: Instance | undefined): boolean => {
  const indemnityStatus = historiqueLimitation?.feedbackProducer?.indeminityStatus;
  return ((indemnityStatus == IndeminityStatus.InProgress) || (indemnityStatus == IndeminityStatus.Agreement) || (indemnityStatus == IndeminityStatus.Abandoned))
    && ((instance == Instance.DSO && historiqueLimitation?.site?.typeSite == TypeSite.HTA) || (instance == Instance.TSO && historiqueLimitation?.site?.typeSite == TypeSite.HTB));
}

export const canChangeIndeminityStatus = (historiqueLimitation: RechercheHistoriqueLimitationEntite | undefined, instance: Instance | undefined): boolean => {
  if (historiqueLimitation == undefined || historiqueLimitation.feedbackProducer == undefined || instance == undefined) {
    return false;
  }
  switch (historiqueLimitation.feedbackProducer.indeminityStatus) {
    case IndeminityStatus.InProgress:
      return false;
    case IndeminityStatus.Agreement:
      return (instance == Instance.DSO && historiqueLimitation?.site?.typeSite == TypeSite.HTA) || (instance == Instance.TSO && historiqueLimitation?.site?.typeSite == TypeSite.HTB);
    case IndeminityStatus.Processed:
      return false;
    case IndeminityStatus.WaitingInvoice:
      return instance == Instance.PRODUCER;
    case IndeminityStatus.InvoiceSent:
      return instance == Instance.TSO;
    case IndeminityStatus.Abandoned:
      return false;
    default:
      return false;
  }
}

/**
 * https://expe-star.atlassian.net/wiki/spaces/STAR/pages/111575068/US+-+Traitement+d+une+limitation+par+le+Gestionnaire
 */
export const getNextIndeminityStatus = (currentIndeminityStatus: IndeminityStatus, instance: Instance): IndeminityStatus | null => {
  switch (currentIndeminityStatus) {
    case IndeminityStatus.Agreement:
      if (instance == Instance.DSO) {
        return IndeminityStatus.Processed;
      } else if (instance == Instance.TSO) {
        return IndeminityStatus.WaitingInvoice;
      } else {
        return null;
      }
    case IndeminityStatus.WaitingInvoice:
      if (instance == Instance.PRODUCER) {
        return IndeminityStatus.InvoiceSent;
      } else {
        return null;
      }
    case IndeminityStatus.InvoiceSent:
      if (instance == Instance.TSO) {
        return IndeminityStatus.Processed;
      } else {
        return null;
      }
  }
  return null;
}
