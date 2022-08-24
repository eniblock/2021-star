import { Context } from "fabric-contract-api";
import { STARParameters } from '../../model/starParameters';
import { ParametersType } from "../../enums/ParametersType";
import { ActivationDocument } from "../../model/activationDocument/activationDocument";
import { EligibilityStatusType } from "../../enums/EligibilityStatusType";
import { OrganizationTypeMsp } from "../../enums/OrganizationMspType";
import { SystemOperator } from "../../model/systemOperator";
import { SystemOperatorService } from "./SystemOperatorService";

export class ActivationDocumentEligibilityService {
    public static checkEligibilityStatus(
        params: STARParameters,
        activationDocumentObj:ActivationDocument): string {

        let newStatus: string;
        if (activationDocumentObj.eligibilityStatus !== EligibilityStatusType.EligibilityERROR) {
            const eligibilityTable:string[] = params.values.get(ParametersType.ACTIVATION_DOCUMENT_ELIGIBILITY);

            const pattern = activationDocumentObj.messageType + "-" + activationDocumentObj.businessType + "-" + activationDocumentObj.reasonCode;
            if (eligibilityTable && eligibilityTable.includes(pattern)) {
                newStatus=EligibilityStatusType.EligibilityAccepted;
            }

        } else {
            newStatus=activationDocumentObj.eligibilityStatus;
        }
        return newStatus;
    }

    public static statusInternationalValue(statusValue: string): string {
        var newStatus = EligibilityStatusType.EligibilityERROR;

        if (!statusValue) {
            newStatus = EligibilityStatusType.EligibilityPending;
        } else {
            statusValue = statusValue.toLowerCase();
            if (statusValue === EligibilityStatusType.EligibilityAccepted || statusValue === EligibilityStatusType.FREligibilityAccepted) {
                newStatus = EligibilityStatusType.EligibilityAccepted;
            }
            if (statusValue === EligibilityStatusType.EligibilityRefused || statusValue === EligibilityStatusType.FREligibilityRefused) {
                newStatus = EligibilityStatusType.EligibilityRefused;
            }
            if (statusValue === EligibilityStatusType.EligibilityPending || statusValue === EligibilityStatusType.FREligibilityPending) {
                newStatus = EligibilityStatusType.EligibilityPending;
            }
        }
        if (newStatus === EligibilityStatusType.EligibilityERROR) {
            throw new Error(`Eligibility Status isn't referenced.`);
        }

        return newStatus;
    }

    public static statusFrenchValue(statusValue: string): string {
        var newStatus = EligibilityStatusType.EligibilityERROR;

        if (!statusValue) {
            newStatus = EligibilityStatusType.EligibilityPending;
        } else {
            statusValue = statusValue.toLowerCase();
            if (statusValue === EligibilityStatusType.EligibilityAccepted || statusValue === EligibilityStatusType.FREligibilityAccepted) {
                newStatus = EligibilityStatusType.FREligibilityAccepted;
            }
            if (statusValue === EligibilityStatusType.EligibilityRefused || statusValue === EligibilityStatusType.FREligibilityRefused) {
                newStatus = EligibilityStatusType.FREligibilityRefused;
            }
            if (statusValue === EligibilityStatusType.EligibilityPending || statusValue === EligibilityStatusType.FREligibilityPending) {
                newStatus = EligibilityStatusType.FREligibilityPending;
            }
        }
        if (newStatus === EligibilityStatusType.EligibilityERROR) {
            throw new Error(`Eligibility Status isn't referenced.`);
        }

        return newStatus;
    }

    public static async outputFormatFRActivationDocument(
        ctx: Context,
        params: STARParameters,
        activationDocument: ActivationDocument) : Promise<ActivationDocument> {

        const identity = params.values.get(ParametersType.IDENTITY);
        if (identity !== OrganizationTypeMsp.RTE && identity !== OrganizationTypeMsp.ENEDIS) {
            activationDocument.eligibilityStatusEditable = false;
        } else {
            let systemOperatorObj: SystemOperator;
            try {
                systemOperatorObj = await SystemOperatorService.getObj(ctx, activationDocument.senderMarketParticipantMrid);
            } catch (error) {
                activationDocument.eligibilityStatusEditable = false;
            }

            if (!systemOperatorObj || systemOperatorObj.systemOperatorMarketParticipantName.toLowerCase() !== identity.toLowerCase() ) {
                activationDocument.eligibilityStatusEditable = false;
            }
        }

        activationDocument.eligibilityStatus = ActivationDocumentEligibilityService.statusFrenchValue(activationDocument.eligibilityStatus);
        return activationDocument;
    }

    public static async formatActivationDocuments(
        ctx: Context,
        params: STARParameters,
        activationDocuments: ActivationDocument[]) : Promise<ActivationDocument[]> {

        let returnedList: ActivationDocument[] = [];
        for (const activationDocument of activationDocuments) {
            returnedList.push(await this.outputFormatFRActivationDocument(ctx, params, activationDocument));
        }
        return returnedList;
    }


}