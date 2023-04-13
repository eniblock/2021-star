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
import { ActivationDocumentController } from './activationDocument/ActivationDocumentController';
import { ActivationDocumentService } from './service/ActivationDocumentService';
import { SystemOperatorController } from './SystemOperatorController';



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

        let feedbackProducerObj:FeedbackProducer = {
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
        params.logger.debug('============= START : Delete %s FeedbackProducerController ===========',
                activationDocumentMrid);

        const feedbackProducerMrid = this.getFeedbackProducerMrid(params, activationDocumentMrid);

        await FeedbackProducerService.delete(params, feedbackProducerMrid, target);

        params.logger.debug('=============  END  : Delete %s FeedbackProducerController ===========',
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
        feedbackElements: string = ''): Promise<string> {
        params.logger.info('============= START : updateFeedbackProducer FeedbackProducerController ===========');

        const identity = params.values.get(ParametersType.IDENTITY);

        if (identity !== OrganizationTypeMsp.PRODUCER) {
            throw new Error(`Organisation, ${identity} does not have rights to comment Activation Document`);
        }

        if (!feedbackStr || feedbackStr.length === 0 ) {
            throw new Error('ERROR updateFeedbackProducer : no feedback to update.');
        }

        //control if a Balancing exists for this activation Document
        let balancingDocument: BalancingDocument = null;
        try {
            balancingDocument =
                await BalancingDocumentController.getObjByActivationDocumentMrid(params, activationDocumentMrid);
        } catch (err) {
            throw new Error('ERROR updateFeedbackProducer : '.concat(err.message).concat(` for Activation Document ${activationDocumentMrid}.`));
        }

        if (!balancingDocument
            || !balancingDocument.balancingDocumentMrid
            || balancingDocument.balancingDocumentMrid.length === 0) {

            params.logger.error('activationDocumentMrid: ', activationDocumentMrid);
            params.logger.error('balancing document: ', JSON.stringify(balancingDocument));

            throw new Error(`ERROR updateFeedbackProducer, no Indeminity found for Activation Document ${activationDocumentMrid}.`);
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

            if (!feedbackProducerObj.indeminityStatus
                || feedbackProducerObj.indeminityStatus.length === 0) {

                feedbackProducerObj.indeminityStatus = IndeminityStatus.IN_PROGRESS;
            }


            if (feedbackProducerObj.feedback && feedbackProducerObj.feedback.length > 0) {
                throw new Error(`ERROR updateFeedbackProducer : comment ${feedbackProducerObj.feedbackProducerMrid} is already filled and cannot be changed`);
            }

            if (feedbackProducerObj.indeminityStatus !== IndeminityStatus.IN_PROGRESS) {
                throw new Error(`ERROR updateFeedbackProducer : comment ${feedbackProducerObj.feedbackProducerMrid} cannot be changed with status ${feedbackProducerObj.indeminityStatus}`);
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
        return JSON.stringify(feedbackProducerObj);
    }




    public static async updateFeedbackProducerAnswer(
        params: STARParameters,
        activationDocumentMrid: string,
        answerStr: string): Promise<string> {
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
            feedbackProducerObj.indeminityStatus = IndeminityStatus.AGREEMENT

            for (const [key ] of existingFeedbackProducersRef) {
                await FeedbackProducerService.write(params, feedbackProducerObj, key);
            }

        }

        params.logger.info('=============  END  : Update Answer %s FeedbackProducerController ===========',
            feedbackProducerObj.feedbackProducerMrid,
        );
        return JSON.stringify(feedbackProducerObj);
    }



    public static async getIndemnityStatus(
        params: STARParameters,
        activationDocumentMrid: string) : Promise<string> {

        params.logger.debug('============= START : getIndemnityStatus FeedbackProducerController  ===========',
            activationDocumentMrid);

        let status: string = IndeminityStatus.IN_PROGRESS;

        let feedbackProducerObj: FeedbackProducer = null;
        try {
            feedbackProducerObj = await this.getByActivationDocumentMrId(params, activationDocumentMrid);
        } catch (err) {
            //Do Nothing, no status
        }


        if (feedbackProducerObj
            && feedbackProducerObj.activationDocumentMrid
            && feedbackProducerObj.activationDocumentMrid === activationDocumentMrid
            && feedbackProducerObj.indeminityStatus
            && feedbackProducerObj.indeminityStatus.length > 0) {

            status = feedbackProducerObj.indeminityStatus;

            const splitted = status.split(IndeminityStatus.SPLIT_STR);
            status = splitted[0];
        }

        params.logger.debug('=============  END  : getIndemnityStatus FeedbackProducerController  ===========',
            activationDocumentMrid);
        return status;
    }




    public static async manageActivationDocumentAbandon(
        params: STARParameters,
        activationDocumentMrid: string): Promise<string> {

        params.logger.info('============= START : abandonActivationDocument FeedbackProducerController  ===========',
            activationDocumentMrid);

        let newStatus = '';

        const feedbackProducerMrid = this.getFeedbackProducerMrid(params, activationDocumentMrid);
        let existingFeedbackProducersRef: Map<string, DataReference>;
        try {
            existingFeedbackProducersRef = await StarPrivateDataService.getObjRefbyId(
                params, {docType: DocType.FEEDBACK_PRODUCER, id: feedbackProducerMrid});
        } catch (err) {
            throw new Error(`ERROR manage Activation Document Abandon : ${err.message}`);
        }

        await this.checkIndeminityStatusOrganisation(params, activationDocumentMrid);

        let feedbackProducerRef: DataReference = null;
        // let keys: string[] = [];
        if (existingFeedbackProducersRef) {

            feedbackProducerRef = existingFeedbackProducersRef.values().next().value;

            // for (const [key ] of existingFeedbackProducersRef) {
            //     keys = keys.concat(key);
            // }
            // params.logger.debug('--------------------------00');
            // params.logger.debug(keys)
            // params.logger.debug('--------------------------00');
        }

        let feedbackProducerObj: FeedbackProducer = null;
        if (feedbackProducerRef
            && feedbackProducerRef.data) {

            feedbackProducerObj = feedbackProducerRef.data;
        }

        if (feedbackProducerObj
            && feedbackProducerObj.activationDocumentMrid === activationDocumentMrid) {

                if (feedbackProducerObj.indeminityStatus.includes(IndeminityStatus.SPLIT_STR)) {
                    const splitted = feedbackProducerObj.indeminityStatus.split(IndeminityStatus.SPLIT_STR);

                    if (splitted.length === 2 && splitted[0] === IndeminityStatus.ABANDONED) {
                        // Manage Abandoned -> Status
                        newStatus = await this.manageBackFomAbandoned(params, feedbackProducerObj, existingFeedbackProducersRef.keys())
                    }
                } else {
                    //Manage Status -> Abandoned
                    newStatus = await this.manageAbandoned(params, feedbackProducerObj, existingFeedbackProducersRef.keys());
                }

        }

        params.logger.info('=============  END  : abandonActivationDocument FeedbackProducerController  ===========',
            activationDocumentMrid);

        return newStatus;
    }


    public static async manageBackFomAbandoned(
        params: STARParameters,
        feedbackProducerObj: FeedbackProducer,
        keys: Iterable<string>): Promise<string> {

        params.logger.debug('============= START : manageBackFomAbandoned FeedbackProducerController  ===========', feedbackProducerObj.activationDocumentMrid);

        const splitted = feedbackProducerObj.indeminityStatus.split(IndeminityStatus.SPLIT_STR);
        feedbackProducerObj.indeminityStatus = splitted[1];

        for (const key of keys) {
            await FeedbackProducerService.write(params, feedbackProducerObj, key);
        }

        params.logger.debug('=============  END  : manageBackFomAbandoned FeedbackProducerController  ===========', feedbackProducerObj.activationDocumentMrid);
        return feedbackProducerObj.indeminityStatus;
    }



    public static async manageAbandoned(
        params: STARParameters,
        feedbackProducerObj: FeedbackProducer,
        keys: Iterable<string>): Promise<string> {

        params.logger.debug('============= START : manageAbandoned FeedbackProducerController  ===========', feedbackProducerObj.activationDocumentMrid);

        //Can only abandon data with status IN_PROGRESS
        if (feedbackProducerObj.indeminityStatus !== IndeminityStatus.IN_PROGRESS
            && feedbackProducerObj.indeminityStatus !== IndeminityStatus.AGREEMENT) {
            return feedbackProducerObj.indeminityStatus;
        }

        //Search if a reconciliation exists
        const activationDocumentRef: DataReference = await ActivationDocumentController.getActivationDocumentRefById(params, feedbackProducerObj.activationDocumentMrid)

        let activationDocumentObj: ActivationDocument = null;
        if (activationDocumentRef
            && activationDocumentRef.data) {

                activationDocumentObj = activationDocumentRef.data;
        }


        if (activationDocumentObj
            && activationDocumentObj.activationDocumentMrid === feedbackProducerObj.activationDocumentMrid
            && activationDocumentObj.subOrderList
            && activationDocumentObj.subOrderList.length > 0) {

            for (const id of activationDocumentObj.subOrderList) {
                const subActivationDocumentRef = await ActivationDocumentController.getActivationDocumentRefById(params, id);

                let subActivationDocumentObj: ActivationDocument = null;
                if (subActivationDocumentRef
                    && subActivationDocumentRef.data) {

                        subActivationDocumentObj = subActivationDocumentRef.data;
                }

                if (subActivationDocumentObj
                    && subActivationDocumentObj.activationDocumentMrid ===  id) {

                    let index = subActivationDocumentObj.subOrderList.indexOf(activationDocumentObj.activationDocumentMrid);
                    subActivationDocumentObj.subOrderList.splice(index, 1);

                    if (activationDocumentObj.potentialParent) {
                        subActivationDocumentObj.potentialChild = true;
                        subActivationDocumentObj.eligibilityStatusEditable = true;
                    }
                    await ActivationDocumentService.write(params, subActivationDocumentObj, subActivationDocumentRef.collection);
                }
            }

            activationDocumentObj.subOrderList = [];
            await ActivationDocumentService.write(params, activationDocumentObj, activationDocumentRef.collection);

        }

        feedbackProducerObj.indeminityStatus = IndeminityStatus.ABANDONED.concat(IndeminityStatus.SPLIT_STR).concat(feedbackProducerObj.indeminityStatus);
        for (const key of keys) {
            await FeedbackProducerService.write(params, feedbackProducerObj, key);
        }

        params.logger.debug('=============  END  : manageAbandoned FeedbackProducerController  ===========', feedbackProducerObj.activationDocumentMrid);
        return IndeminityStatus.ABANDONED;
    }


    public static async checkIndeminityStatusOrganisation(
        params: STARParameters,
        activationDocumentMrid: string): Promise<void> {

        params.logger.debug('============= START : checkIndeminityStatusOrganisation FeedbackProducerController  ===========',
            activationDocumentMrid);

        const identity: string = params.values.get(ParametersType.IDENTITY);

        const activationDocumentRef: DataReference = await ActivationDocumentController.getActivationDocumentRefById(params, activationDocumentMrid)

        let activationDocumentObj: ActivationDocument = null;
        if (activationDocumentRef
            && activationDocumentRef.data) {

                activationDocumentObj = activationDocumentRef.data;
        }

        let systemOperatorObj: SystemOperator;
        try {
            systemOperatorObj = await SystemOperatorController.getSystemOperatorObjById(params, activationDocumentObj.senderMarketParticipantMrid);
        } catch(err) {
            throw new Error(`ERROR check Indeminity Status : ${err.message} for Activation Document ${activationDocumentMrid}.`);
        }

        if (systemOperatorObj.systemOperatorMarketParticipantName.toLowerCase() !== identity.toLowerCase()
            && identity.toLowerCase() !== OrganizationTypeMsp.PRODUCER.toLowerCase()) {
            throw new Error(`Organisation, ${identity} cannot change Indeminity Status for Feedback manager by ${systemOperatorObj.systemOperatorMarketParticipantName}`);
        }

        params.logger.debug('=============  END  : checkIndeminityStatusOrganisation FeedbackProducerController  ===========',
            activationDocumentMrid);

    }

    public static async updateIndeminityStatus(
        params: STARParameters,
        activationDocumentMrid: string): Promise<string> {

        params.logger.info('============= START : UpdateIndeminityStatus FeedbackProducerController  ===========',
            activationDocumentMrid);

        let newStatus = '';

        const identity = params.values.get(ParametersType.IDENTITY);
        const roleTable: Map<string, string> = params.values.get(ParametersType.ROLE_TABLE);
        let userRole: string = '';

        if (roleTable.has(identity.toLowerCase())) {
            userRole = roleTable.get(identity.toLowerCase());
        }

        const feedbackProducerMrid = this.getFeedbackProducerMrid(params, activationDocumentMrid);
        let existingFeedbackProducersRef: Map<string, DataReference>;
        try {
            existingFeedbackProducersRef = await StarPrivateDataService.getObjRefbyId(
                params, {docType: DocType.FEEDBACK_PRODUCER, id: feedbackProducerMrid});
        } catch (err) {
            throw new Error(`ERROR update Indeminity Status : ${err.message}`);
        }

        await this.checkIndeminityStatusOrganisation(params, activationDocumentMrid);


        let feedbackProducerRef: DataReference = null;
        if (existingFeedbackProducersRef) {

            feedbackProducerRef = existingFeedbackProducersRef.values().next().value;
        }

        let feedbackProducerObj: FeedbackProducer = null;
        if (feedbackProducerRef
            && feedbackProducerRef.data) {

            feedbackProducerObj = feedbackProducerRef.data;
        }


        if (feedbackProducerObj
            && feedbackProducerObj.activationDocumentMrid === activationDocumentMrid) {

            if (feedbackProducerObj.indeminityStatus.includes(IndeminityStatus.SPLIT_STR)) {
                const splitted = feedbackProducerObj.indeminityStatus.split(IndeminityStatus.SPLIT_STR)

                if (splitted.length === 2 && splitted[0] === IndeminityStatus.ABANDONED) {
                    return IndeminityStatus.ABANDONED;
                }
            }

            //control if a Balancing exists for this activation Document
            let balancingDocument: BalancingDocument = null;
            try {
                balancingDocument =
                    await BalancingDocumentController.getObjByActivationDocumentMrid(params, activationDocumentMrid);
            } catch (err) {
                //Do Nothing
            }

            if (!feedbackProducerObj.indeminityStatus
                || feedbackProducerObj.indeminityStatus.length === 0) {

                feedbackProducerObj.indeminityStatus = IndeminityStatus.IN_PROGRESS;
            }

            let isFinalState: boolean = false;
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
                    if (userRole === RoleType.Role_Producer) {
                        newStatus = IndeminityStatus.INVOICE_SENT;
                    }
                    break;
                case IndeminityStatus.INVOICE_SENT:
                    if (userRole === RoleType.Role_TSO) {
                        newStatus = IndeminityStatus.PROCESSED;
                        isFinalState = true;
                    }
                    break;
                default:
                    newStatus = feedbackProducerObj.indeminityStatus;
            }


            if (newStatus
                && newStatus.length > 0
                && newStatus !== feedbackProducerObj.indeminityStatus) {

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


        const argOrFeedback: string[] = [];
        argOrFeedback.push(`"feedback":""`);
        argOrFeedback.push(`"feedback":{"$exists": false}`);
        args.push(await QueryStateService.buildORCriteria(argOrFeedback));

        args.push(`"validityPeriodEndDateTime":{"$exists": true}`);
        args.push(`"validityPeriodEndDateTime":{"$lte":${JSON.stringify(today)}}`);
        const query = await QueryStateService.buildQuery({documentType: DocType.FEEDBACK_PRODUCER, queryArgs: args});

        const allResults: FeedbackProducer[] = await FeedbackProducerService.getQueryArrayResult(params, query);

        if (allResults && allResults.length > 0) {
            for (let result of allResults) {

                let balancingDocument: BalancingDocument = null;
                try {
                    balancingDocument =
                        await BalancingDocumentController.getObjByActivationDocumentMrid(params, result.activationDocumentMrid);
                } catch (err) {
                    //Do Nothing
                }

                if (balancingDocument
                    && balancingDocument.balancingDocumentMrid
                    && balancingDocument.balancingDocumentMrid.length > 0) {

                    // Only update if a balancing exists

                    const dataReference: DataReference = {
                        collection: DocType.FEEDBACK_PRODUCER,
                        data: {'activationDocumentMrid':result.activationDocumentMrid},
                        dataAction: DataActionType.UPDATE,
                        docType: DocType.FEEDBACK_PRODUCER,

                    };
                    indemnityReferences.push(dataReference);
                }

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

        let arg: IdArgument = {docType: DocType.FEEDBACK_PRODUCER, id: feedbackProducerMrid};
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
        params.logger.debug('============= START : get FeedbackProducer By Id Argument (%s) ===========', JSON.stringify(arg));

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

        params.logger.debug('=============  END  : get FeedbackProducer By Id Argument (%s) ===========', JSON.stringify(arg));

        return feedbackProducerObj;
    }


}
