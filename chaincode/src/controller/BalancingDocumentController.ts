import { DataActionType } from '../enums/DataActionType';
import { DocType } from '../enums/DocType';
import { ParametersType } from '../enums/ParametersType';
import { ActivationDocument } from '../model/activationDocument/activationDocument';
import { IdArgument } from '../model/arguments/idArgument';
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
import { StarPrivateDataService } from './service/StarPrivateDataService';

export class BalancingDocumentController {

    public static async searchByCriteria(params: STARParameters, criteria: string): Promise<string> {
        params.logger.debug('============= START : search by criteria BalancingDocumentController ===========');

        const criteriaObj = BalancingDocumentSearchCriteria.formatString(criteria);
        const allResults = await this.searchObjByCriteria(params, criteriaObj);

        params.logger.debug('=============  END  : search by criteria BalancingDocumentController ===========');
        return JSON.stringify(allResults);
    }

    public static getBalancingDocumentMrid(params: STARParameters, activationDocumentMrid: string): string {
        const prefix: string = params.values.get(ParametersType.BALANCING_DOCUMENT_PREFIX);

        return prefix.concat(activationDocumentMrid);
    }

    public static async getByActivationDocumentMrId(
        params: STARParameters,
        activationDocumentMrid: string): Promise<BalancingDocument> {

        const balancingDocumentMrid = this.getBalancingDocumentMrid(params, activationDocumentMrid);

        return await this.getObjById(params, balancingDocumentMrid);
    }

    public static async getObjById(params: STARParameters, balancingDocumentMrid: string): Promise<BalancingDocument> {
        params.logger.debug('============= START : get Obj ById BalancingDocumentController ===========');

        const balancingObj =
            await this.getObjByIdArgument(params, {docType: DocType.BALANCING_DOCUMENT, id: balancingDocumentMrid});

        params.logger.debug('=============  END  : get Obj ById BalancingDocumentController ===========');
        return balancingObj;
    }




    public static async deleteByActivationDocumentMrId(
        params: STARParameters,
        activationDocumentMrid: string,
        target: string) {
        params.logger.debug('============= START : deleteByActivationDocumentMrId BalancingDocumentController ===========');

        const balancingDocumentMrid = this.getBalancingDocumentMrid(params, activationDocumentMrid);
        await BalancingDocumentService.delete(params, {id: balancingDocumentMrid, collection: target});

        params.logger.debug('=============  END  : deleteByActivationDocumentMrId BalancingDocumentController ===========');
    }



    public static async updateBalancingDocumentByOrders(
        params: STARParameters,
        orderListStr: string) {
        params.logger.info('============= START : updateBalancingDocumentByOrders BalancingDocumentController ===========');

        let updateOrders: DataReference[];
        try {
            updateOrders = JSON.parse(orderListStr);
        } catch (error) {
        // params.logger.error('error=', error);
            throw new Error(`ERROR executeStarDataOrders -> Input string NON-JSON value`);
        }

        if (updateOrders && updateOrders.length > 0 ) {
            // VALIDATION AND INITIALIZATION STEP
            for (const updateOrder of updateOrders) {
                params.logger.info("updateOrder: ", JSON.stringify(updateOrder))
                DataReference.schema.validateSync(
                    updateOrder,
                    {strict: true, abortEarly: false},
                );
                if (updateOrder.docType === DocType.BALANCING_DOCUMENT
                    && updateOrder.dataAction === DataActionType.UPDATE) {

                    if (updateOrder.data && updateOrder.data.activationDocument) {
                        const activationDocumentObj: ActivationDocument = updateOrder.data.activationDocument;
                        params.logger.info("activationDocumentObj: ", JSON.stringify(activationDocumentObj))
                        ActivationDocument.schema.validateSync(
                            activationDocumentObj,
                            {strict: true, abortEarly: false},
                        );

                        const balancingDocument: BalancingDocument = await this.createOrUpdate(params, activationDocumentObj, null, null, updateOrder.collection);

                        if (!balancingDocument
                            || !balancingDocument.balancingDocumentMrid
                            || balancingDocument.balancingDocumentMrid.length === 0) {

                            params.logger.info("Balancing deletion for : ", JSON.stringify(activationDocumentObj.activationDocumentMrid))

                            try {
                                await this.deleteByActivationDocumentMrId(params, activationDocumentObj.activationDocumentMrid, updateOrder.collection);
                            } catch (err) {
                                //Do Nothing
                            }
                        } else {
                            params.logger.info("generated balancingDocument : ", JSON.stringify(balancingDocument))
                        }
                    }
                }

            }
        }

        params.logger.info('=============  END  : updateBalancingDocumentByOrders BalancingDocumentController ===========');
    }





    public static async createOrUpdateById(
        params: STARParameters,
        activationDocumentMrid: string,
        reserveBid: ReserveBidMarketDocument,
        energyAmount: EnergyAmount,
        target: string = '') {
        params.logger.debug('============= START : createOrUpdateById BalancingDocumentController ===========');

        let activationDocument: ActivationDocument;

        if (activationDocumentMrid && activationDocumentMrid.length > 0) {
            try {
                activationDocument =
                    await ActivationDocumentController.getActivationDocumentById(
                        params, activationDocumentMrid, target);

            } catch (err) {
                // Document not found
                err = null;
            }
        }

        await this.consolidateAndCreateOrUpdate(params, activationDocument, reserveBid, energyAmount, target);

        params.logger.debug('=============  END  : createOrUpdateById BalancingDocumentController ===========');
    }

    public static async createOrUpdate(
        params: STARParameters,
        activationDocument: ActivationDocument,
        reserveBid: ReserveBidMarketDocument,
        energyAmount: EnergyAmount,
        target: string = ''): Promise<BalancingDocument> {
        params.logger.info('============= START : createOrUpdate BalancingDocumentController ===========');

        if (!activationDocument
            || !activationDocument.activationDocumentMrid
            || activationDocument.activationDocumentMrid.length === 0) {

            if (energyAmount
                && energyAmount.activationDocumentMrid
                && energyAmount.activationDocumentMrid.length > 0) {

                try {
                    activationDocument =
                        await ActivationDocumentController.getActivationDocumentById(
                            params, energyAmount.activationDocumentMrid, target);
                } catch (err) {
                    // Document not found
                    err = null;
                }
            }
        }

        const balancingDocument: BalancingDocument = await this.consolidateAndCreateOrUpdate(params, activationDocument, reserveBid, energyAmount, target);

        params.logger.info('=============  END  : createOrUpdate BalancingDocumentController ===========');

        return balancingDocument;
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

    private static async getObjByIdArgument(
        params: STARParameters,
        arg: IdArgument): Promise<BalancingDocument> {
        params.logger.debug
            ('============= START : get BalancingDocument By Id Argument (%s) ===========', JSON.stringify(arg));

        let balancingObj: BalancingDocument;
        arg.docType = DocType.BALANCING_DOCUMENT;
        if (arg.collection && arg.collection.length > 0) {
            balancingObj = await StarPrivateDataService.getObj(params, arg);
        } else {
            const result: Map<string, DataReference> = await StarPrivateDataService.getObjRefbyId(params, arg);
            const dataReference = result.values().next().value;
            if (dataReference && dataReference.data) {
                balancingObj = dataReference.data;
            }
        }

        params.logger.debug
            ('=============  END  : get BalancingDocument By Id Argument (%s) ===========', JSON.stringify(arg));

        return balancingObj;
    }

    private static async consolidateAndCreateOrUpdate(
        params: STARParameters,
        activationDocument: ActivationDocument,
        reserveBid: ReserveBidMarketDocument,
        energyAmount: EnergyAmount,
        target: string = '') : Promise<BalancingDocument> {
        params.logger.info
            ('============= START : consolidateAndCreateOrUpdate BalancingDocumentController ===========');

        if (!energyAmount
            || !energyAmount.energyAmountMarketDocumentMrid
            || energyAmount.energyAmountMarketDocumentMrid.length === 0) {

            if (activationDocument
                && activationDocument.activationDocumentMrid
                && activationDocument.activationDocumentMrid.length > 0) {

                try {
                    energyAmount = await EnergyAmountController.getByActivationDocument(
                        params, activationDocument.activationDocumentMrid, target);
                } catch (err) {
                    // Document not found
                    err = null;
                }
            }
        }

        if (!reserveBid
            || !reserveBid.reserveBidMrid
            || reserveBid.reserveBidMrid.length === 0) {

            if (activationDocument
                && activationDocument.activationDocumentMrid
                && activationDocument.activationDocumentMrid.length > 0) {

                try {
                    reserveBid = await ReserveBidMarketDocumentController.getByActivationDocument(
                        params, activationDocument, target);
                } catch (err) {
                    // Document not found
                    err = null;
                }
            }
        }

        const balancingDocument: BalancingDocument = await this.createOrUpdateObj(params, activationDocument, reserveBid, energyAmount, target);

        params.logger.info
            ('=============  END  : consolidateAndCreateOrUpdate BalancingDocumentController ===========');
        return balancingDocument;
    }

    private static async createOrUpdateObj(
        params: STARParameters,
        activationDocument: ActivationDocument,
        reserveBid: ReserveBidMarketDocument,
        energyAmount: EnergyAmount,
        target: string = '') : Promise<BalancingDocument> {
        params.logger.info('============= START : createOrUpdateObj BalancingDocumentController ===========');

        var balancingDocument: BalancingDocument = null;
        if (activationDocument
            && activationDocument.activationDocumentMrid
            && activationDocument.activationDocumentMrid.length > 0
            && energyAmount
            && energyAmount.energyAmountMarketDocumentMrid
            && energyAmount.energyAmountMarketDocumentMrid.length > 0
            && reserveBid
            && reserveBid.reserveBidMrid
            && reserveBid.reserveBidMrid.length > 0) {

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
            balancingDocument.financialPriceAmount =
                balancingDocument.quantity * balancingDocument.activationPriceAmount;

            await BalancingDocumentService.write(params, balancingDocument, target);
        }

        params.logger.info('=============  END  : createOrUpdateObj BalancingDocumentController ===========');
        return balancingDocument;
    }

}
