import { DocType } from "../enums/DocType";
import { ParametersType } from "../enums/ParametersType";
import { ActivationDocument } from "../model/activationDocument/activationDocument";
import { IdArgument } from "../model/arguments/idArgument";
import { BalancingDocument } from "../model/balancingDocument";
import { DataReference } from "../model/dataReference";
import { EnergyAmount } from "../model/energyAmount";
import { ReserveBidMarketDocument } from "../model/reserveBidMarketDocument";
import { STARParameters } from "../model/starParameters";
import { ActivationDocumentController } from "./activationDocument/ActivationDocumentController";
import { EnergyAmountController } from "./EnergyAmountController";
import { ReserveBidMarketDocumentController } from "./ReserveBidMarketDocumentController";
import { BalancingDocumentService } from "./service/BalancingDocumentService";
import { StarPrivateDataService } from "./service/StarPrivateDataService";

export class BalancingDocumentController {

    private static getBalancingDocumentMrid(params: STARParameters,activationDocumentMrid: string): string {
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

        const reserveBidObj = await this.getObjByIdArgument(params, {docType: DocType.BALANCING_DOCUMENT, id: balancingDocumentMrid});

        params.logger.debug('=============  END  : get Obj ById BalancingDocumentController ===========');
        return reserveBidObj;
    }




    private static async getObjByIdArgument(
        params: STARParameters,
        arg: IdArgument): Promise<BalancingDocument> {
        params.logger.debug('============= START : get BalancingDocument By Id Argument (%s) ===========', JSON.stringify(arg));

        let reserveBidObj: BalancingDocument;
        arg.docType = DocType.BALANCING_DOCUMENT;
        if (arg.collection && arg.collection.length > 0) {
            reserveBidObj = await StarPrivateDataService.getObj(params, arg);
        } else {
            const result:Map<string, DataReference> = await StarPrivateDataService.getObjRefbyId(params, arg);
            const dataReference = result.values().next().value;
            if (dataReference && dataReference.data) {
                reserveBidObj = dataReference.data;
            }
        }

        params.logger.debug('=============  END  : get BalancingDocument By Id Argument (%s) ===========', JSON.stringify(arg));

        return reserveBidObj;
    }





    public static async deleteByActivationDocumentMrId(
        params: STARParameters,
        activationDocumentMrid : string,
        target: string) {
        params.logger.debug('============= START : deleteByActivationDocumentMrId BalancingDocumentController ===========');

        const balancingDocumentMrid = this.getBalancingDocumentMrid(params, activationDocumentMrid);
        await BalancingDocumentService.delete(params, {id: balancingDocumentMrid, collection: target});

        params.logger.debug('=============  END  : deleteByActivationDocumentMrId BalancingDocumentController ===========');
    }

    public static async createOrUpdateById(
        params: STARParameters,
        activationDocumentMrid: string,
        reserveBid : ReserveBidMarketDocument,
        energyAmount : EnergyAmount,
        target: string = '') {
        params.logger.debug('============= START : createOrUpdateById BalancingDocumentController ===========');

        var activationDocument: ActivationDocument;

        if (activationDocumentMrid && activationDocumentMrid.length > 0) {
            activationDocument = await ActivationDocumentController.getActivationDocumentById(params, activationDocumentMrid, target);
        }

        this.consolidateAndCreateOrUpdate(params, activationDocument, reserveBid, energyAmount, target);

        params.logger.debug('=============  END  : createOrUpdateById BalancingDocumentController ===========');
    }

    public static async createOrUpdate(
        params: STARParameters,
        activationDocument: ActivationDocument,
        reserveBid : ReserveBidMarketDocument,
        energyAmount : EnergyAmount,
        target: string = '') {
        params.logger.debug('============= START : createOrUpdate BalancingDocumentController ===========');


        if (!activationDocument
            || !activationDocument.activationDocumentMrid
            || activationDocument.activationDocumentMrid.length == 0) {

            if (energyAmount
                && energyAmount.activationDocumentMrid
                && energyAmount.activationDocumentMrid.length > 0) {

                activationDocument = await ActivationDocumentController.getActivationDocumentById(params, energyAmount.activationDocumentMrid, target);
            }
        }

        this.consolidateAndCreateOrUpdate(params, activationDocument, reserveBid, energyAmount, target);

        params.logger.debug('=============  END  : createOrUpdate BalancingDocumentController ===========');
    }





    public static async consolidateAndCreateOrUpdate(
        params: STARParameters,
        activationDocument: ActivationDocument,
        reserveBid : ReserveBidMarketDocument,
        energyAmount : EnergyAmount,
        target: string = '') {
        params.logger.debug('============= START : consolidateAndCreateOrUpdate BalancingDocumentController ===========');

        if (!energyAmount
            || !energyAmount.energyAmountMarketDocumentMrid
            || energyAmount.energyAmountMarketDocumentMrid.length == 0) {

            if (activationDocument
                && activationDocument.activationDocumentMrid
                && activationDocument.activationDocumentMrid.length > 0) {

                energyAmount = await EnergyAmountController.getByActivationDocument(params, activationDocument.activationDocumentMrid, target);
            }
        }


        if (!reserveBid
            || !reserveBid.reserveBidMrid
            || reserveBid.reserveBidMrid.length == 0) {

            if (activationDocument
                && activationDocument.activationDocumentMrid
                && activationDocument.activationDocumentMrid.length > 0) {

                reserveBid = await ReserveBidMarketDocumentController.getByActivationDocument(params, activationDocument, target);
            }
        }

        this.createOrUpdateObj(params, activationDocument, reserveBid, energyAmount, target);

        params.logger.debug('=============  END  : consolidateAndCreateOrUpdate BalancingDocumentController ===========');
    }


    private static async createOrUpdateObj(
        params: STARParameters,
        activationDocument: ActivationDocument,
        reserveBid : ReserveBidMarketDocument,
        energyAmount : EnergyAmount,
        target: string = '') {
        params.logger.debug('============= START : createOrUpdateObj BalancingDocumentController ===========');

        params.logger.info("oooooooooooooooooooo")
        params.logger.info("activationDocument: ", JSON.stringify(activationDocument))
        params.logger.info("reserveBid: ", JSON.stringify(reserveBid))
        params.logger.info("energyAmount: ", JSON.stringify(energyAmount))
        params.logger.info("target: ", JSON.stringify(target))
        params.logger.info("oooooooooooooooooooo")


        if (activationDocument
            && activationDocument.activationDocumentMrid
            && activationDocument.activationDocumentMrid.length > 0
            && energyAmount
            && energyAmount.energyAmountMarketDocumentMrid
            && energyAmount.energyAmountMarketDocumentMrid.length > 0
            && reserveBid
            && reserveBid.reserveBidMrid
            && reserveBid.reserveBidMrid.length > 0) {

            const balancingDocument: BalancingDocument = params.values.get(ParametersType.BALANCING_DOCUMENT);

            const balancingDocumentMrid = this.getBalancingDocumentMrid(params, activationDocument.activationDocumentMrid);
            balancingDocument.balancingDocumentMrid = balancingDocumentMrid;
            balancingDocument.activationDocumentMrid = activationDocument.activationDocumentMrid;
            balancingDocument.energyAmountMarketDocumentMrid = energyAmount.energyAmountMarketDocumentMrid;
            balancingDocument.reserveBidMrid = reserveBid.reserveBidMrid;
            balancingDocument.senderMarketParticipantMrid = activationDocument.senderMarketParticipantMrid;
            balancingDocument.receiverMarketParticipantMrid = activationDocument.receiverMarketParticipantMrid;
            balancingDocument.createdDateTime = reserveBid.createdDateTime;
            balancingDocument.period = activationDocument.startCreatedDateTime.concat("/").concat(activationDocument.endCreatedDateTime);
            balancingDocument.quantityMeasureUnitName = energyAmount.measurementUnitName;
            balancingDocument.priceMeasureUnitName = reserveBid.priceMeasureUnitName;
            balancingDocument.currencyUnitName = reserveBid.currencyUnitName;
            balancingDocument.meteringPointMrid = activationDocument.registeredResourceMrid;
            balancingDocument.quantity = Number(energyAmount.quantity);
            balancingDocument.activationPriceAmount = reserveBid.energyPriceAmount;
            balancingDocument.financialPriceAmount = balancingDocument.quantity * balancingDocument.activationPriceAmount;

            await BalancingDocumentService.write(params, balancingDocument, target);
        }

        params.logger.debug('=============  END  : createOrUpdateObj BalancingDocumentController ===========');
    }

}
