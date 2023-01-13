import { DocType } from '../enums/DocType';
import { ParametersType } from '../enums/ParametersType';
import { ReserveBidStatus } from '../enums/ReserveBidStatus';
import { ActivationDocument } from '../model/activationDocument/activationDocument';
import { BalancingDocument } from '../model/balancingDocument';
import { BalancingDocumentSearchCriteria } from '../model/balancingDocumentSearchCriteria';
import { DataReference } from '../model/dataReference';
import { EnergyAmount } from '../model/energyAmount';
import { ReserveBidMarketDocument } from '../model/reserveBidMarketDocument';
import { STARParameters } from '../model/starParameters';
import { ActivationDocumentController } from './activationDocument/ActivationDocumentController';
import { EnergyAmountController } from './EnergyAmountController';
import { ReserveBidMarketDocumentController } from './ReserveBidMarketDocumentController';
import { BalancingDocumentService } from './service/BalancingDocumentService';
import { QueryStateService } from './service/QueryStateService';

export class BalancingDocumentController {

    public static getBalancingDocumentMrid(params: STARParameters, activationDocumentMrid: string): string {
        const prefix: string = params.values.get(ParametersType.BALANCING_DOCUMENT_PREFIX);

        return prefix.concat(activationDocumentMrid);
    }


    public static async searchByCriteria(params: STARParameters, criteria: string): Promise<string> {
        params.logger.debug('============= START : search by criteria BalancingDocumentController ===========');

        const criteriaObj = BalancingDocumentSearchCriteria.formatString(criteria);
        const allResults = await this.searchObjByCriteria(params, criteriaObj);

        params.logger.debug('=============  END  : search by criteria BalancingDocumentController ===========');
        return JSON.stringify(allResults);
    }


    private static async searchObjByCriteria(
        params: STARParameters,
        criteriaObj: BalancingDocumentSearchCriteria): Promise<BalancingDocument[]> {

        params.logger.debug('============= START : search obj by criteria BalancingDocumentController ===========');

        const args: string[] = [];
        if (criteriaObj.meteringPointMrid && criteriaObj.meteringPointMrid.length > 0) {
            args.push(`"meteringPointMrid":"${criteriaObj.meteringPointMrid}"`);
        }
        if (criteriaObj.activationDocumentMrid && criteriaObj.activationDocumentMrid.length > 0) {
            args.push(`"activationDocumentMrid":"${criteriaObj.activationDocumentMrid}"`);
        }
        if (criteriaObj.startCreatedDateTime && criteriaObj.startCreatedDateTime.length > 0) {
            args.push(`"createdDateTime":{"$gte": ${JSON.stringify(criteriaObj.startCreatedDateTime)}}`);
        }
        if (criteriaObj.endCreatedDateTime && criteriaObj.endCreatedDateTime.length > 0) {
            args.push(`"createdDateTime":{"$lte": ${JSON.stringify(criteriaObj.endCreatedDateTime)}}`);
        }

        if (args.length === 0) {
            throw new Error(`Balancing Document Search criteria needs, at least, 1 criteria`);
        }

        const query = await QueryStateService.buildQuery({documentType: DocType.BALANCING_DOCUMENT, queryArgs: args});

        params.logger.debug('=============  END  : search obj by criteria BalancingDocumentController ===========');
        return await BalancingDocumentService.getQueryArrayResult(params, query);
    }



    public static async generateObj(
        params: STARParameters,
        activationDocument: ActivationDocument,
        reserveBid: ReserveBidMarketDocument,
        energyAmount: EnergyAmount) : Promise<BalancingDocument> {
        params.logger.debug('============= START : generateObj BalancingDocumentController ===========');

        var balancingDocument: BalancingDocument = null;
        if (activationDocument
            && activationDocument.activationDocumentMrid
            && activationDocument.activationDocumentMrid.length > 0
            && energyAmount
            && energyAmount.energyAmountMarketDocumentMrid
            && energyAmount.energyAmountMarketDocumentMrid.length > 0
            && reserveBid
            && reserveBid.reserveBidMrid
            && reserveBid.reserveBidMrid.length > 0
            && reserveBid.reserveBidStatus === ReserveBidStatus.VALIDATED) {

            balancingDocument = params.values.get(ParametersType.BALANCING_DOCUMENT);

            const balancingDocumentMrid = this.getBalancingDocumentMrid(
                params, activationDocument.activationDocumentMrid);

            balancingDocument.balancingDocumentMrid = balancingDocumentMrid;
            balancingDocument.activationDocumentMrid = activationDocument.activationDocumentMrid;
            balancingDocument.energyAmountMarketDocumentMrid = energyAmount.energyAmountMarketDocumentMrid;
            balancingDocument.reserveBidMrid = reserveBid.reserveBidMrid;
            balancingDocument.senderMarketParticipantMrid = activationDocument.senderMarketParticipantMrid;
            balancingDocument.receiverMarketParticipantMrid = activationDocument.receiverMarketParticipantMrid;
            balancingDocument.createdDateTime = reserveBid.createdDateTime;
            balancingDocument.period =
                activationDocument.startCreatedDateTime.concat('/').concat(activationDocument.endCreatedDateTime);
            balancingDocument.quantityMeasureUnitName = energyAmount.measurementUnitName;
            balancingDocument.priceMeasureUnitName = reserveBid.priceMeasureUnitName;
            balancingDocument.currencyUnitName = reserveBid.currencyUnitName;
            balancingDocument.meteringPointMrid = activationDocument.registeredResourceMrid;
            balancingDocument.quantity = Number(energyAmount.quantity);
            balancingDocument.activationPriceAmount = reserveBid.energyPriceAmount;

            var financialPriceAmount =
                balancingDocument.quantity * balancingDocument.activationPriceAmount;

            financialPriceAmount = Math.round(financialPriceAmount*1000)/1000;

            balancingDocument.financialPriceAmount = financialPriceAmount;

        }

        params.logger.debug('=============  END  : generateObj BalancingDocumentController ===========');
        return balancingDocument;
    }



    public static async getObjByActivationDocumentMrid(
        params: STARParameters,
        activationDocumentMrid: string,
        target: string = ''): Promise<BalancingDocument>{
        params.logger.debug('============= START : getObjByActivationDocumentMrid BalancingDocumentController ===========');

        let activationDocument: ActivationDocument = null;
        let reserveBid: ReserveBidMarketDocument = null;
        let energyAmount: EnergyAmount = null;


        if (activationDocumentMrid && activationDocumentMrid.length > 0) {
            try {
                let activationDocumentRef : DataReference =
                    await ActivationDocumentController.getActivationDocumentRefById(
                        params, activationDocumentMrid, target);

                activationDocument = activationDocumentRef.data;
                target = activationDocumentRef.collection;

                energyAmount = await EnergyAmountController.getByActivationDocument(
                    params, activationDocument.activationDocumentMrid, target);

                reserveBid = await ReserveBidMarketDocumentController.getByActivationDocument(
                    params, activationDocument);

            } catch (err) {
                // Data not found
                err = null;
            }
        }
        params.logger.debug('-------------------------------------------------------')
        params.logger.debug('-------------------------------------------------------')
        params.logger.debug('activationDocument: ', activationDocument)
        params.logger.debug('energyAmount: ', energyAmount)
        params.logger.debug('reserveBid: ', reserveBid)
        params.logger.debug('-------------------------------------------------------')
        params.logger.debug('-------------------------------------------------------')

        const balancingDocument: BalancingDocument = await this.generateObj(params, activationDocument, reserveBid, energyAmount);

        params.logger.debug('=============  END  : getObjByActivationDocumentMrid BalancingDocumentController ===========');
        return balancingDocument;
    }


}
