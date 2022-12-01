import {IndeminityStatus} from "../models/enum/IndeminityStatus.enum";
import {Instance} from "../models/enum/Instance.enum";

export const canChangeIndeminityStatus = (currentIndeminityStatus: IndeminityStatus | undefined, instance: Instance): boolean => {
  if (currentIndeminityStatus == undefined) {
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


