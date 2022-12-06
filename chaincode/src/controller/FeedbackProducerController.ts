import { DocType } from '../enums/DocType';
import { OrganizationTypeMsp } from '../enums/OrganizationMspType';
import { ParametersType } from '../enums/ParametersType';

import { ActivationDocument } from '../model/activationDocument/activationDocument';
import { FeedbackProducer } from '../model/feedbackProducer';
import { DataReference } from '../model/dataReference';
import { STARParameters } from '../model/starParameters';
import { SystemOperator } from '../model/systemOperator';

import { FeedbackProducerService } from './service/FeedbackProducerService';
import { StarDataService } from './service/StarDataService';
import { StarPrivateDataService } from './service/StarPrivateDataService';
import { CommonService } from './service/CommonService';
import { IdArgument } from '../model/arguments/idArgument';
import { EnergyAmount } from '../model/energyAmount';
import { DataActionType } from '../enums/DataActionType';
import { IndeminityStatus } from '../enums/IndemnityStatus';
import { RoleType } from '../enums/RoleType';
import { QueryStateService } from './service/QueryStateService';
import { BalancingDocument } from '../model/balancingDocument';
import { BalancingDocumentController } from './BalancingDocumentController';
import { BalancingDocumentService } from './service/BalancingDocumentService';



export class FeedbackProducerController {
    public static async executeOrder(
        params: STARParameters,
        updateOrder: DataReference) {
        params.logger.debug('============= START : executeOrder FeedbackProducerController ===========');

        if (updateOrder.data) {

            if (updateOrder.dataAction == DataActionType.UPDATE) {
                if (updateOrder.data.activationDocumentMrid
                    && updateOrder.data.activationDocumentMrid.length > 0) {

                    await FeedbackProducerController.updateIndeminityStatus(params, updateOrder.data.activationDocumentMrid);
                }
            } else {
                FeedbackProducer.schema.validateSync(
                    updateOrder.data,
                    {strict: true, abortEarly: false},
                );
                const feedbackProducer: FeedbackProducer = updateOrder.data;

                if (updateOrder.dataAction === DataActionType.COLLECTION_CHANGE) {
                    await FeedbackProducerService.delete(params, feedbackProducer.feedbackProducerMrid, updateOrder.previousCollection);
                    await FeedbackProducerService.write(params, feedbackProducer, updateOrder.collection);
                }
            }
        }

        params.logger.debug('============= END   : executeOrder FeedbackProducerController ===========');
    }


    // public static async createFeedbackProducer(
    //     params: STARParameters,
    //     inputStr: string): Promise<void> {
    //     params.logger.info('============= START : createFeedbackProducer FeedbackProducerController ===========');

    //     const feedbackProducerObj: FeedbackProducer = FeedbackProducer.formatString(inputStr);
    //     await this.createFeedbackProducerObj(params, feedbackProducerObj);

    //     params.logger.info('=============  END  : createFeedbackProducer FeedbackProducerController ===========');
    // }

    // public static async createFeedbackProducerByReference(
    //     params: STARParameters,
    //     dataReference: DataReference): Promise<void> {
    //     params.logger.debug('============= START : createFeedbackProducer By Reference FeedbackProducerController ===========');

    //     await this.createFeedbackProducerObj(params, dataReference.data, dataReference.collection);

    //     params.logger.debug('=============  END  : createFeedbackProducer By Reference FeedbackProducerController ===========');
    // }


    public static getFeedbackProducerMrid(params: STARParameters, activationDocumentMrid: string): string {
        const prefix: string = params.values.get(ParametersType.FEEDBACK_PRODUCER_PREFIX);

        return prefix.concat(activationDocumentMrid);
    }


    public static async createFeedbackProducerObj(
        params: STARParameters,
        activationDocumentObj: ActivationDocument,
        target: string): Promise<void> {
        params.logger.debug('============= START : createFeedbackProducerObj FeedbackProducerController ===========');

        if (!activationDocumentObj
            || !activationDocumentObj.activationDocumentMrid
            || activationDocumentObj.activationDocumentMrid.length === 0) {

            throw new Error(`Error : Activation Document incorrect to create Feedback structure.`);
        }

        if (!target || target.length === 0) {
            throw new Error(`Error : Feedback storage target unknown, impossible to create.`);
        }

        var feedbackProducerObj:FeedbackProducer = {
            docType: DocType.FEEDBACK_PRODUCER,

            feedbackProducerMrid: this.getFeedbackProducerMrid(params, activationDocumentObj.activationDocumentMrid),
            activationDocumentMrid: activationDocumentObj.activationDocumentMrid,

            messageType: 'B30',
            processType: 'A42',
            revisionNumber: '0',

            indeminityStatus: IndeminityStatus.IN_PROGRESS,

            receiverMarketParticipantMrid: activationDocumentObj.receiverMarketParticipantMrid,
            senderMarketParticipantMrid: activationDocumentObj.senderMarketParticipantMrid,

            createdDateTime: activationDocumentObj.startCreatedDateTime,
        }

        await FeedbackProducerService.write(params, feedbackProducerObj, target);

        params.logger.debug('============= END   : createFeedbackProducerObj %s FeedbackProducerController ===========',
            feedbackProducerObj.feedbackProducerMrid);
    }


    public static async delete(
        params: STARParameters,
        activationDocumentMrid: string,
        target: string): Promise<void> {
        params.logger.debug
            ('============= START : Delete %s FeedbackProducerController ===========',
                activationDocumentMrid);

        const feedbackProducerMrid = this.getFeedbackProducerMrid(params, activationDocumentMrid);

        await FeedbackProducerService.delete(params, feedbackProducerMrid, target);

        params.logger.debug
            ('=============  END  : Delete %s FeedbackProducerController ===========',
                activationDocumentMrid);
    }




    public static async fixFeedbackProducerValidityPeriod(
        params: STARParameters,
        energyObj: EnergyAmount,
        target: string): Promise<void> {
        params.logger.info('============= START : fixFeedbackProducerValidityPeriod FeedbackProducerController ===========');

        const identity = params.values.get(ParametersType.IDENTITY);

        if (identity.toLowerCase() !== OrganizationTypeMsp.ENEDIS.toLowerCase()
            && identity.toLowerCase() !== OrganizationTypeMsp.RTE.toLowerCase()) {
            throw new Error(`Organisation, ${identity} does not have rights to fix validity Period for FeedbackProducer`);
        }

        let validityPeriodStartDateTime = CommonService.setHoursStartDayStr(energyObj.createdDateTime);
        const nbDaysValidityComment: number = params.values.get(ParametersType.FEEDBACK_PRODUCER_VALIDITY_PERIOD);
        let validityPeriodEndDateTime = CommonService.increaseDateDaysStr(validityPeriodStartDateTime, nbDaysValidityComment);
        validityPeriodEndDateTime = CommonService.setHoursEndDayStr(validityPeriodEndDateTime);


        const feedbackProducerMrid = this.getFeedbackProducerMrid(params, energyObj.activationDocumentMrid);

        let feedbackProducerObj: FeedbackProducer;
        try {
            feedbackProducerObj =  await this.getObjById(params, feedbackProducerMrid, target);
        } catch(err) {
            feedbackProducerObj= {
                docType: DocType.FEEDBACK_PRODUCER,

                feedbackProducerMrid: feedbackProducerMrid,
                activationDocumentMrid: energyObj.activationDocumentMrid,

                messageType: 'B30',
                processType: 'A42',
                revisionNumber: '0',

                indeminityStatus: IndeminityStatus.IN_PROGRESS,

                receiverMarketParticipantMrid: energyObj.receiverMarketParticipantMrid,
                senderMarketParticipantMrid: energyObj.senderMarketParticipantMrid,

                createdDateTime: energyObj.createdDateTime,
            }
        }

        if (feedbackProducerObj
            && feedbackProducerObj.feedbackProducerMrid
            && feedbackProducerObj.feedbackProducerMrid === feedbackProducerMrid) {


            let systemOperatorObj: SystemOperator;
            try {
                systemOperatorObj =
                    await StarDataService.getObj(
                        params, {id: feedbackProducerObj.senderMarketParticipantMrid, docType: DocType.SYSTEM_OPERATOR});
            } catch (error) {
                throw new Error('ERROR updateFeedbackProducerAnswer : '.concat(error.message).concat(` for Feedback ${feedbackProducerObj.feedbackProducerMrid} update.`));
            }

            if (systemOperatorObj.systemOperatorMarketParticipantName.toLowerCase() !== identity.toLowerCase() ) {
                throw new Error(`Organisation, ${identity} cannot send elements for Feedback manager by ${systemOperatorObj.systemOperatorMarketParticipantName}`);
            }

            feedbackProducerObj.validityPeriodStartDateTime = validityPeriodStartDateTime;
            feedbackProducerObj.validityPeriodEndDateTime = validityPeriodEndDateTime;
            feedbackProducerObj.revisionNumber= '1';

            await FeedbackProducerService.write(params, feedbackProducerObj, target);
        } else {
            throw new Error(`ERROR updateFeedbackProducerAnswer : technical error to update ${feedbackProducerMrid} validity Period.`);
        }

        params.logger.info('=============  END  : fix ValidityPeriod %s FeedbackProducerController ===========',
            feedbackProducerObj.feedbackProducerMrid,
        );
    }



    public static async updateFeedbackProducer(
        params: STARParameters,
        activationDocumentMrid: string,
        feedbackStr: string,
        feedbackElements: string = ''): Promise<void> {
        params.logger.info('============= START : updateFeedbackProducer FeedbackProducerController ===========');

        const identity = params.values.get(ParametersType.IDENTITY);

        if (identity !== OrganizationTypeMsp.PRODUCER) {
            throw new Error(`Organisation, ${identity} does not have rights to comment Activation Document`);
        }

        if (!feedbackStr || feedbackStr.length === 0 ) {
            throw new Error('ERROR updateFeedbackProducer : no feedback to update.');
        }

        const feedbackProducerMrid = this.getFeedbackProducerMrid(params, activationDocumentMrid);
        // Get existing Feedback Producer
        let existingFeedbackProducersRef: Map<string, DataReference>;
        try {
            existingFeedbackProducersRef = await StarPrivateDataService.getObjRefbyId(
                params, {docType: DocType.FEEDBACK_PRODUCER, id: feedbackProducerMrid});
        } catch (error) {
            throw new Error('ERROR updateFeedbackProducer : '.concat(error.message));
        }

        const feedbackProducerRef: DataReference = existingFeedbackProducersRef.values().next().value;
        const feedbackProducerObj: FeedbackProducer = feedbackProducerRef.data;

        const endDate: Date = new Date(feedbackProducerObj.validityPeriodEndDateTime);
        const today: Date = new Date();
        if (endDate.getTime() < today.getTime()) {
            throw new Error(`ERROR updateFeedbackProducer : comment could only be sent before ${feedbackProducerObj.validityPeriodEndDateTime}`);
        }

        if (feedbackProducerObj
            && feedbackProducerObj.feedbackProducerMrid
            && feedbackProducerObj.feedbackProducerMrid === feedbackProducerMrid) {

            if (feedbackProducerObj.feedback && feedbackProducerObj.feedback.length > 0) {
                throw new Error(`ERROR updateFeedbackProducer : comment ${feedbackProducerObj.feedbackProducerMrid} is already filled and cannot be changed`);
            }

            feedbackProducerObj.feedback = feedbackStr;

            if (feedbackElements && feedbackElements.length > 0) {
                feedbackProducerObj.feedbackElements = feedbackElements;
            }

            feedbackProducerObj.revisionNumber= '2';

            for (const [key ] of existingFeedbackProducersRef) {
                await FeedbackProducerService.write(params, feedbackProducerObj, key);
            }

        }

        params.logger.info('=============  END  : Update Feedback %s FeedbackProducerController ===========',
            feedbackProducerObj.feedbackProducerMrid,
        );
    }




    public static async updateFeedbackProducerAnswer(
        params: STARParameters,
        activationDocumentMrid: string,
        answerStr: string): Promise<void> {
        params.logger.info('============= START : updateFeedbackProducerAnswer FeedbackProducerController ===========');

        const identity = params.values.get(ParametersType.IDENTITY);

        if (identity.toLowerCase() !== OrganizationTypeMsp.ENEDIS.toLowerCase()
            && identity.toLowerCase() !== OrganizationTypeMsp.RTE.toLowerCase()) {
            throw new Error(`Organisation, ${identity} does not have rights to give elements to the comment of the Activation Document`);
        }

        if (!answerStr || answerStr.length === 0 ) {
            throw new Error('ERROR updateFeedbackProducerAnswer : no answer to update.');
        }

        const feedbackProducerMrid = this.getFeedbackProducerMrid(params, activationDocumentMrid);
        // Get existing Feedback Producer
        let existingFeedbackProducersRef: Map<string, DataReference>;
        try {
            existingFeedbackProducersRef = await StarPrivateDataService.getObjRefbyId(
                params, {docType: DocType.FEEDBACK_PRODUCER, id: feedbackProducerMrid});
        } catch (error) {
            throw new Error('ERROR updateFeedbackProducerAnswer : '.concat(error.message));
        }

        const feedbackProducerRef: DataReference = existingFeedbackProducersRef.values().next().value;
        const feedbackProducerObj: FeedbackProducer = feedbackProducerRef.data;

        if (feedbackProducerObj
            && feedbackProducerObj.feedbackProducerMrid
            && feedbackProducerObj.feedbackProducerMrid === feedbackProducerMrid) {

            if (!feedbackProducerObj.feedback
                || feedbackProducerObj.feedback.length === 0) {

                throw new Error('ERROR updateFeedbackProducerAnswer : no feedback to update answer to.');
            }

            let systemOperatorObj: SystemOperator;
            try {
                systemOperatorObj =
                    await StarDataService.getObj(
                        params, {id: feedbackProducerObj.senderMarketParticipantMrid, docType: DocType.SYSTEM_OPERATOR});
            } catch (error) {
                throw new Error('ERROR updateFeedbackProducerAnswer : '.concat(error.message).concat(` for Feedback ${feedbackProducerObj.feedbackProducerMrid} update.`));
            }

            if (systemOperatorObj.systemOperatorMarketParticipantName.toLowerCase() !== identity.toLowerCase() ) {
                throw new Error(`Organisation, ${identity} cannot send elements for Feedback manager by ${systemOperatorObj.systemOperatorMarketParticipantName}`);
            }

            if (feedbackProducerObj.feedbackAnswer && feedbackProducerObj.feedbackAnswer.length > 0) {
                throw new Error(`ERROR updateFeedbackProducer : comment answer ${feedbackProducerObj.feedbackProducerMrid} is already filled and cannot be changed`);
            }

            feedbackProducerObj.feedbackAnswer = answerStr;
            feedbackProducerObj.revisionNumber= '3';

            for (const [key ] of existingFeedbackProducersRef) {
                await FeedbackProducerService.write(params, feedbackProducerObj, key);
            }

        }

        params.logger.info('=============  END  : Update Answer %s FeedbackProducerController ===========',
            feedbackProducerObj.feedbackProducerMrid,
        );
    }



    public static async getIndemnityStatus(
        params: STARParameters,
        activationDocumentMrid: string) : Promise<string> {

        params.logger.debug('============= START : getIndemnityStatus FeedbackProducerController  ===========',
            activationDocumentMrid);

        var status: string = IndeminityStatus.IN_PROGRESS;

        var feedbackProducerObj: FeedbackProducer = null;
        try {
            var feedbackProducerObj = await this.getByActivationDocumentMrId(params, activationDocumentMrid);
        } catch (err) {
            //Do Nothing, no status
        }


        if (feedbackProducerObj
            && feedbackProducerObj.activationDocumentMrid
            && feedbackProducerObj.activationDocumentMrid === activationDocumentMrid
            && feedbackProducerObj.indeminityStatus
            && feedbackProducerObj.indeminityStatus.length > 0) {

            status = feedbackProducerObj.indeminityStatus;
        }


        params.logger.debug('=============  END  : getIndemnityStatus FeedbackProducerController  ===========',
            activationDocumentMrid);
        return status;
    }



    public static async updateIndeminityStatus(
        params: STARParameters,
        activationDocumentMrid: string): Promise<string> {

        params.logger.info('============= START : UpdateIndeminityStatus FeedbackProducerController  ===========',
            activationDocumentMrid);

        var newStatus = '';

        const identity = params.values.get(ParametersType.IDENTITY);
        const roleTable: Map<string, string> = params.values.get(ParametersType.ROLE_TABLE);
        var userRole: string = '';

        if (roleTable.has(identity.toLowerCase())) {
            userRole = roleTable.get(identity.toLowerCase());
        }

        if ( userRole !== RoleType.Role_TSO
            && userRole !== RoleType.Role_DSO) {
            throw new Error(`ERROR: Indemnity Status for the Activation Document ${activationDocumentMrid} cannot be updated by ${identity}`);
        }

        const feedbackProducerMrid = this.getFeedbackProducerMrid(params, activationDocumentMrid);
        let existingFeedbackProducersRef: Map<string, DataReference>;
        try {
            existingFeedbackProducersRef = await StarPrivateDataService.getObjRefbyId(
                params, {docType: DocType.FEEDBACK_PRODUCER, id: feedbackProducerMrid});
        } catch (err) {
            throw new Error('ERROR update Indeminity Status : '.concat(err.message));
        }

        var feedbackProducerRef: DataReference = null;
        if (existingFeedbackProducersRef) {

            feedbackProducerRef = existingFeedbackProducersRef.values().next().value;
        }

        var feedbackProducerObj: FeedbackProducer = null;
        if (feedbackProducerRef
            && feedbackProducerRef.data) {

            feedbackProducerObj = feedbackProducerRef.data;
        }


        if (feedbackProducerObj
            && feedbackProducerObj.activationDocumentMrid === activationDocumentMrid) {

            //control if a Balancing exists for this activation Document
            var balancingDocument: BalancingDocument;
            try {
                balancingDocument =
                    await BalancingDocumentController.getObjByActivationDocumentMrid(params, activationDocumentMrid);
            } catch (err) {
                throw new Error('ERROR update Indeminity Status : '.concat(err.message).concat(` for Activation Document ${feedbackProducerObj.activationDocumentMrid} update Indeminity Status.`));
            }

            if (!balancingDocument
                || !balancingDocument.balancingDocumentMrid
                || balancingDocument.balancingDocumentMrid.length === 0) {

                throw new Error(`ERROR update Indeminity Status, no Indeminity found for Activation Document ${feedbackProducerObj.activationDocumentMrid} update Indeminity Status.`);
            }


            let systemOperatorObj: SystemOperator;
            try {
                systemOperatorObj =
                    await StarDataService.getObj(
                        params, {id: feedbackProducerObj.senderMarketParticipantMrid, docType: DocType.SYSTEM_OPERATOR});
            } catch (err) {
                throw new Error('ERROR update Indeminity Status : '.concat(err.message).concat(` for Activation Document ${feedbackProducerObj.activationDocumentMrid} update Indeminity Status.`));
            }

            if (systemOperatorObj.systemOperatorMarketParticipantName.toLowerCase() !== identity.toLowerCase() ) {
                throw new Error(`Organisation, ${identity} cannot update Indeminity Status for Feedback manager by ${systemOperatorObj.systemOperatorMarketParticipantName}`);
            }


            if (!feedbackProducerObj.indeminityStatus
                || feedbackProducerObj.indeminityStatus.length === 0) {

                feedbackProducerObj.indeminityStatus = IndeminityStatus.IN_PROGRESS;
            }

            var isFinalState: boolean = false;
            switch (feedbackProducerObj.indeminityStatus) {
                case IndeminityStatus.IN_PROGRESS:
                    newStatus = IndeminityStatus.AGREEMENT;
                    break;
                case IndeminityStatus.AGREEMENT:
                    if (userRole === RoleType.Role_TSO) {
                        newStatus = IndeminityStatus.WAITING_INVOICE;
                    } else if (userRole === RoleType.Role_DSO) {
                        newStatus = IndeminityStatus.PROCESSED;
                        isFinalState = true;
                    }
                    break;
                case IndeminityStatus.WAITING_INVOICE:
                    if (userRole === RoleType.Role_TSO) {
                        newStatus = IndeminityStatus.INVOICE_SENT;
                        isFinalState = true;
                    }
                    break;
                default:
                    newStatus = '';
            }


            if (newStatus && newStatus.length > 0) {
                feedbackProducerObj.indeminityStatus = newStatus;

                for (const [key ] of existingFeedbackProducersRef) {
                    await FeedbackProducerService.write(params, feedbackProducerObj, key);
                    if (isFinalState) {
                        await BalancingDocumentService.write(params, balancingDocument, key);
                    }
                }
            }

        }


        params.logger.info('=============  END  : UpdateIndeminityStatus FeedbackProducerController  ===========',
            activationDocumentMrid);

        return newStatus;
    }


    public static async getIndemnityStatusState(
        params: STARParameters): Promise<DataReference[]> {
        params.logger.debug('============= START : getIndemnityStatusState - FeedbackProducerController ===========');
        const indemnityReferences: DataReference[] = [];

        let today = JSON.parse(JSON.stringify(new Date()))
        today = CommonService.setHoursEndDayStr(today);

        const args: string[] = [];

        const argOrIndemnityStatus: string[] = [];
        argOrIndemnityStatus.push(`"indeminityStatus":"${IndeminityStatus.IN_PROGRESS}"`);
        argOrIndemnityStatus.push(`"indeminityStatus":""`);
        argOrIndemnityStatus.push(`"indeminityStatus":{"$exists": false}`);
        args.push(await QueryStateService.buildORCriteria(argOrIndemnityStatus));

        args.push(`"validityPeriodEndDateTime":{"$exists": true}`);
        args.push(`"validityPeriodEndDateTime":{"$lte":${JSON.stringify(today)}}`);
        const query = await QueryStateService.buildQuery({documentType: DocType.FEEDBACK_PRODUCER, queryArgs: args});

        const allResults: FeedbackProducer[] = await FeedbackProducerService.getQueryArrayResult(params, query);

        if (allResults && allResults.length > 0) {
            for (let result of allResults) {
                const dataReference: DataReference = {
                    collection: DocType.FEEDBACK_PRODUCER,
                    data: {'activationDocumentMrid':result.activationDocumentMrid},
                    dataAction: DataActionType.UPDATE,
                    docType: DocType.FEEDBACK_PRODUCER,

                };
                indemnityReferences.push(dataReference);
            }
        }

        params.logger.debug('=============  END  : getIndemnityStatusState - FeedbackProducerController ===========');
        return indemnityReferences;
    }


    public static async getByActivationDocumentMrId(
        params: STARParameters,
        activationDocumentMrid: string,
        target: string = ''): Promise<FeedbackProducer> {

        const feedbackProducerMrid = this.getFeedbackProducerMrid(params, activationDocumentMrid);

        return await this.getObjById(params, feedbackProducerMrid, target);
    }



    public static async getObjById(
        params: STARParameters,
        feedbackProducerMrid: string,
        target: string = ''): Promise<FeedbackProducer> {

        params.logger.debug('============= START : get Obj ById FeedbackProducerController ===========');

        var arg: IdArgument = {docType: DocType.FEEDBACK_PRODUCER, id: feedbackProducerMrid};
        if (target && target.length > 0) {
            arg.collection = target;
        }

        const feedbackProducerObj =
            await this.getObjByIdArgument(params, arg);

        params.logger.debug('=============  END  : get Obj ById FeedbackProducerController ===========');
        return feedbackProducerObj;
    }




    private static async getObjByIdArgument(
        params: STARParameters,
        arg: IdArgument): Promise<FeedbackProducer> {
        params.logger.debug
            ('============= START : get FeedbackProducer By Id Argument (%s) ===========', JSON.stringify(arg));

        let feedbackProducerObj: FeedbackProducer;
        arg.docType = DocType.FEEDBACK_PRODUCER;
        if (arg.collection && arg.collection.length > 0) {
            feedbackProducerObj = await StarPrivateDataService.getObj(params, arg);
        } else {
            const result: Map<string, DataReference> = await StarPrivateDataService.getObjRefbyId(params, arg);
            const dataReference = result.values().next().value;
            if (dataReference && dataReference.data) {
                feedbackProducerObj = dataReference.data;
            }
        }

        params.logger.debug
            ('=============  END  : get FeedbackProducer By Id Argument (%s) ===========', JSON.stringify(arg));

        return feedbackProducerObj;
    }


}
