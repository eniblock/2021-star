import * as Yup from 'yup';

export class BalancingDocumentSearchCriteria {
    public static formatString(inputString: string) : BalancingDocumentSearchCriteria {
        let energyAccountObj: BalancingDocumentSearchCriteria;
        try {
            energyAccountObj = JSON.parse(inputString);
        } catch (error) {
            throw new Error(`ERROR -> Input string NON-JSON value`);
        }

        try {
            BalancingDocumentSearchCriteria.schema.validateSync(
                energyAccountObj,
                {strict: true, abortEarly: false},
            );
        } catch (error) {
            throw error;
        }
        return energyAccountObj;
    }

    public static readonly schema = Yup.object().shape({
        meteringPointMrid: Yup.string().notRequired(),
        activationDocumentMrid: Yup.string().notRequired(),

        startCreatedDateTime: Yup.string().notRequired(),
        endCreatedDateTime: Yup.string().notRequired(),
    });

    /*
    * USED
    */
    public meteringPointMrid?:string;
    public activationDocumentMrid?:string;

    public startCreatedDateTime?:string;
    public endCreatedDateTime?:string;

    /*
    * NON-DIRECTLY USED
    */
    public createdDateTime?:string; //Used by start and end CreatedDateTime


    /*
    * UNUSED
    */
    public balancingDocumentMrid?:string;
    public energyAmountMarketDocumentMrid?:string;
    public reserveBidMrid?:string;
    public revisionNumber?:string;
    public messageType?:string;
    public processsType?:string;
    public senderMarketParticipantMrid?:string;
    public receiverMarketParticipantMrid?:string;
    public period?:string;
    public businessType?:string;
    public quantityMeasureUnitName?:string;
    public priceMeasureUnitName?:string;
    public currencyUnitName?:string;
    public direction?:string;
    public quantity?: number;
    public activationPriceAmount?: number;
    public financialPriceAmount?: number;

}
