import {IndeminityStatus} from "../models/enum/IndeminityStatus.enum";
import {Instance} from "../models/enum/Instance.enum";

export const canChangeIndeminityStatus = (currentIndeminityStatus: IndeminityStatus | undefined, instance: Instance | undefined): boolean => {
  if (currentIndeminityStatus == undefined || instance == undefined) {
    return false;
  }
  switch (currentIndeminityStatus) {
    case IndeminityStatus.InProgress:
      return false;
      break;
    case IndeminityStatus.Agreement:
      return instance == Instance.DSO || instance == Instance.TSO;
    case IndeminityStatus.Processed:
      return false;
    case IndeminityStatus.WaitingInvoice:
      return instance == Instance.PRODUCER;
    case IndeminityStatus.InvoiceSent:
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
  }
  return null;
}
