/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { Context, Contract } from 'fabric-contract-api';

import { STARParameters } from './model/starParameters';

import { ParametersType } from './enums/ParametersType';

import { ActivationDocumentController } from './controller/activationDocument/ActivationDocumentController';
import { EligibilityController } from './controller/activationDocument/EligibilityController';
import {HistoryController} from './controller/activationDocument/HistoryController';
import { EnergyAccountController } from './controller/EnergyAccountController';
import { EnergyAmountController } from './controller/EnergyAmountController';
import { ParametersController } from './controller/ParametersController';
import { ProducerController } from './controller/ProducerController';
import { ReferenceEnergyAccountController } from './controller/ReferenceEnergyAccountController';
import { SiteController } from './controller/SiteController';
import { StarDataStateController } from './controller/StarDataStateController';
import { SystemOperatorController } from './controller/SystemOperatorController';
import { ViewMarketParticipantController } from './controller/ViewMarketParticipantController';
import { YellowPagesController } from './controller/YellowPagesController';

import { AttachmentFileController } from './controller/AttachmentFileController';
import { BalancingDocumentController } from './controller/BalancingDocumentController';
import { ReserveBidMarketDocumentController } from './controller/ReserveBidMarketDocumentController';
import { HLFServices } from './controller/service/HLFservice';
import { FeedbackProducerController } from './controller/FeedbackProducerController';

export class Star extends Contract {

    // public async initLedger(ctx: Context) {
    //     params.logger.debug('============= START : Initialize Ledger ===========');
    //     // params.logger.debug('Nothing to do');
    //     params.logger.debug('============= END   : Initialize Ledger ===========');
    // }

    public async ping(ctx: Context) {
        const params: STARParameters = await ParametersController.getParameterValues(ctx);
        const identity = params.values.get(ParametersType.IDENTITY);

        return identity;
    }

    public async setLogLevel(ctx: Context, inputStr: string) {
        const params: STARParameters = await ParametersController.getParameterValues(ctx);
        await HLFServices.setLogLevel(params, inputStr);

        return true;
    }

    public async testLog(ctx: Context) {
        const params: STARParameters = await ParametersController.getParameterValues(ctx);

        params.logger.debug('test log DEBUG');
        params.logger.info('test log INFO');
        params.logger.warn('test log WARNING');
        params.logger.error('test log ERROR');

        return true;
    }

    // /*      Parameters          */
    // public async changeAllParameters(ctx: Context, inputStr: string) {
    //     try {
    //         return (await ParametersController.changeAllParameters(inputStr));
    //     } catch (error) {
    //         throw error;
    //     }
    // }

    // public async getAllParameters(
    //     ctx: Context) {
    //     try {
    //         return (await ParametersController.getAllParameters(ctx));
    //     } catch (error) {
    //         throw error;
    //     }
    // }

    // public async getParameter(
    //     ctx: Context, paramname: string) {
    //     try {
    //         return (await ParametersController.getParameterValues(ctx,paramname));
    //     } catch (error) {
    //         throw error;
    //     }
    // }

    /*      SystemOperator      */

    public async CreateSystemOperator(ctx: Context, inputStr: string) {
        const params: STARParameters = await ParametersController.getParameterValues(ctx);
        return (await SystemOperatorController.createSystemOperator(params, inputStr));
    }

    public async UpdateSystemOperator(ctx: Context, inputStr: string) {
        const params: STARParameters = await ParametersController.getParameterValues(ctx);
        return (await SystemOperatorController.updateSystemOperator(params, inputStr));
    }

    public async QuerySystemOperator(
        ctx: Context,
        id: string) {

        const params: STARParameters = await ParametersController.getParameterValues(ctx);
        return (await SystemOperatorController.getSystemOperatorObjById(params, id));
    }

    public async GetAllSystemOperator(
        ctx: Context) {

        const params: STARParameters = await ParametersController.getParameterValues(ctx);
        return (await SystemOperatorController.getAllSystemOperator(params));
    }

    public async GetSystemOperatorByQuery(
        ctx: Context, query: string) {

        const params: STARParameters = await ParametersController.getParameterValues(ctx);
        return (await SystemOperatorController.getSystemOperatorByQuery(params, query));
    }

    /*      Producer      */

    public async CreateProducer(ctx: Context, inputStr: string) {
        const params: STARParameters = await ParametersController.getParameterValues(ctx);
        return (await ProducerController.createProducer(params, inputStr));
    }

    public async UpdateProducer(ctx: Context, inputStr: string) {
        const params: STARParameters = await ParametersController.getParameterValues(ctx);
        return (await ProducerController.updateProducer(params, inputStr));
    }

    public async CreateProducerList(ctx: Context, inputStr: string) {
        const params: STARParameters = await ParametersController.getParameterValues(ctx);
        return (await ProducerController.createProducerList(params, inputStr));
    }

    public async UpdateProducerList(ctx: Context, inputStr: string) {
        const params: STARParameters = await ParametersController.getParameterValues(ctx);
        return (await ProducerController.updateProducerList(params, inputStr));
    }

    public async QueryProducer(
        ctx: Context,
        id: string) {

        const params: STARParameters = await ParametersController.getParameterValues(ctx);
        return (await ProducerController.getProducerById(params, id));
    }

    public async GetAllProducer(
        ctx: Context) {

        const params: STARParameters = await ParametersController.getParameterValues(ctx);
        return (await ProducerController.getAllProducer(params));
    }

    /*      Sites       */

    public async CreateSite(ctx: Context, inputStr: string) {
        const params: STARParameters = await ParametersController.getParameterValues(ctx);
        return (await SiteController.createSite(params, inputStr));
    }

    public async UpdateSite(ctx: Context, inputStr: string) {

        const params: STARParameters = await ParametersController.getParameterValues(ctx);
        return (await SiteController.updateSite(params, inputStr));
    }

    public async QuerySite(
        ctx: Context,
        id: string) {

        const params: STARParameters = await ParametersController.getParameterValues(ctx);
        return (await SiteController.querySite(params, id));
    }

    public async SiteExists(
        ctx: Context,
        id: string) {

        const params: STARParameters = await ParametersController.getParameterValues(ctx);
        return (await SiteController.siteExists(params, id));
    }

    public async GetSitesByQuery(
        ctx: Context,
        query: string) {

        const params: STARParameters = await ParametersController.getParameterValues(ctx);
        return (await SiteController.getSitesByQuery(params, query));
    }

    public async GetSitesBySystemOperator(
        ctx: Context,
        id: string) {

        const params: STARParameters = await ParametersController.getParameterValues(ctx);
        return (await SiteController.getSitesBySystemOperator(params, id));
    }

    public async GetSitesByProducer(
        ctx: Context,
        id: string) {

        const params: STARParameters = await ParametersController.getParameterValues(ctx);
        return (await SiteController.getSitesByProducer(params, id));
    }

/*      Restitution View System Operator Market Participant      */

    public async ViewSystemOperaterMarketParticipant(
        ctx: Context) {

        const params: STARParameters = await ParametersController.getParameterValues(ctx);
        return (await ViewMarketParticipantController.viewSystemOperaterMarketParticipant(params));
    }

    /*      Restitution View Producer Market Participant       */

    public async ViewProducerMarketParticipant(
        ctx: Context,
        id: string) {

        const params: STARParameters = await ParametersController.getParameterValues(ctx);
        return (await ViewMarketParticipantController.viewProducerMarketParticipant(params, id));
    }

    /*      Activation Document       */

    public async CreateActivationDocument(ctx: Context, inputStr: string) {

        const params: STARParameters = await ParametersController.getParameterValues(ctx);
        return (await ActivationDocumentController.createActivationDocument(params, inputStr));
    }

    public async CreateActivationDocumentList(ctx: Context, inputStr: string) {

        const params: STARParameters = await ParametersController.getParameterValues(ctx);
        return (await ActivationDocumentController.createActivationDocumentList(params, inputStr));
    }

    public async GetActivationDocumentReconciliationState(ctx: Context) {

        const params: STARParameters = await ParametersController.getParameterValues(ctx);
        return (await StarDataStateController.getStarDataState(params));
    }

    public async UpdateActivationDocumentEligibilityStatus(ctx: Context, inputStr: string) {

        const params: STARParameters = await ParametersController.getParameterValues(ctx);
        return (await EligibilityController.updateEligibilityStatus(params, inputStr));
    }

    public async UpdateActivationDocumentByOrders(ctx: Context, inputStr: string) {

        const params: STARParameters = await ParametersController.getParameterValues(ctx);
        return (await StarDataStateController.executeStarDataOrders(params, inputStr));
    }

    public async GetActivationDocumentByProducer(
        ctx: Context,
        inputStr: string) {

        const params: STARParameters = await ParametersController.getParameterValues(ctx);
        return (await ActivationDocumentController.getActivationDocumentByProducer(params, inputStr));
    }




    public async GetActivationDocumentBySystemOperator(
        ctx: Context,
        inputStr: string) {

        const params: STARParameters = await ParametersController.getParameterValues(ctx);
        return (await ActivationDocumentController.getActivationDocumentBySystemOperator(params, inputStr));
    }

    public async GetActivationDocumentByQuery(
        ctx: Context,
        query: string) {

        const params: STARParameters = await ParametersController.getParameterValues(ctx);
        return (await ActivationDocumentController.getActivationDocumentByQuery(params, query));
    }

    /*      Limitation History       */
    public async GetActivationDocumentHistory(
        ctx: Context,
        inputStr: string) {

        const params: STARParameters = await ParametersController.getParameterValues(ctx);
        return (await HistoryController.getHistoryByQuery(params, inputStr));
    }

    /*      Yellow Pages       */

    public async CreateYellowPages(ctx: Context, inputStr: string) {

        const params: STARParameters = await ParametersController.getParameterValues(ctx);
        return (await YellowPagesController.createYellowPages(params, inputStr));
    }

    public async GetAllYellowPages(
        ctx: Context) {

        const params: STARParameters = await ParametersController.getParameterValues(ctx);
        return (await YellowPagesController.getAllYellowPages(params));
    }

    /*      Energy Account       */

    public async CreateEnergyAccount(ctx: Context, inputStr: string) {

        const params: STARParameters = await ParametersController.getParameterValues(ctx);
        return (await EnergyAccountController.createEnergyAccount(params, inputStr));
    }

    public async CreateEnergyAccountList(ctx: Context, inputStr: string) {

        const params: STARParameters = await ParametersController.getParameterValues(ctx);
        return (await EnergyAccountController.createEnergyAccountList(params, inputStr));
    }

    public async UpdateEnergyAccount(ctx: Context, inputStr: string) {

        const params: STARParameters = await ParametersController.getParameterValues(ctx);
        return (await EnergyAccountController.updateEnergyAccount(params, inputStr));
    }

    public async UpdateEnergyAccountList(ctx: Context, inputStr: string) {

        const params: STARParameters = await ParametersController.getParameterValues(ctx);
        return (await EnergyAccountController.updateEnergyAccountList(params, inputStr));
    }

    public async GetEnergyAccountForSystemOperator(
        ctx: Context,
        meteringPointMrid: string,
        systemOperatorEicCode: string,
        startCreatedDateTime: string = '') {

        const params: STARParameters = await ParametersController.getParameterValues(ctx);
        return (await EnergyAccountController.getEnergyAccountForSystemOperator
                (
                    params,
                    meteringPointMrid,
                    systemOperatorEicCode,
                )
            );
    }

    public async GetEnergyAccountByProducer(
        ctx: Context,
        meteringPointMrid: string,
        producerEicCode: string,
        startCreatedDateTime: string) {

        const params: STARParameters = await ParametersController.getParameterValues(ctx);
        return (await EnergyAccountController.getEnergyAccountByProducer
                (
                    params,
                    meteringPointMrid,
                    producerEicCode,
                    startCreatedDateTime,
                )
            );
    }

    public async GetEnergyAccountWithPagination(
        ctx: Context,
        query: string) {

        const params: STARParameters = await ParametersController.getParameterValues(ctx);
        return (await EnergyAccountController.getEnergyAccountByQuery(params, query));
    }

    /*      Reference Energy Account       */

    public async CreateReferenceEnergyAccount(ctx: Context, inputStr: string) {

        const params: STARParameters = await ParametersController.getParameterValues(ctx);
        return (await ReferenceEnergyAccountController.createReferenceEnergyAccount(params, inputStr));
    }

    public async GetReferenceEnergyAccountForSystemOperator(
        ctx: Context,
        meteringPointMrid: string,
        systemOperatorEicCode: string,
        startCreatedDateTime: string) {

        const params: STARParameters = await ParametersController.getParameterValues(ctx);
        return (await ReferenceEnergyAccountController.getReferenceEnergyAccountForSystemOperator
                (
                    params,
                    meteringPointMrid,
                    systemOperatorEicCode,
                    startCreatedDateTime,
                )
            );
    }

    public async GetReferenceEnergyAccountByProducer(
        ctx: Context,
        meteringPointMrid: string,
        producerEicCode: string,
        startCreatedDateTime: string) {

        const params: STARParameters = await ParametersController.getParameterValues(ctx);
        return (await ReferenceEnergyAccountController.getReferenceEnergyAccountByProducer
                (
                    params,
                    meteringPointMrid,
                    producerEicCode,
                    startCreatedDateTime,
                )
            );
    }

    /*      Energy Amount       */

    public async CreateTSOEnergyAmount(ctx: Context, inputStr: string) {

        const params: STARParameters = await ParametersController.getParameterValues(ctx);
        return (await EnergyAmountController.createTSOEnergyAmount(params, inputStr));
    }

    public async CreateTSOEnergyAmountList(ctx: Context, inputStr: string) {

        const params: STARParameters = await ParametersController.getParameterValues(ctx);
        return (await EnergyAmountController.createTSOEnergyAmountList(params, inputStr));
    }

    public async UpdateTSOEnergyAmount(ctx: Context, inputStr: string) {

        const params: STARParameters = await ParametersController.getParameterValues(ctx);
        return (await EnergyAmountController.updateTSOEnergyAmount(params, inputStr));
    }

    public async UpdateTSOEnergyAmountList(ctx: Context, inputStr: string) {

        const params: STARParameters = await ParametersController.getParameterValues(ctx);
        return (await EnergyAmountController.updateTSOEnergyAmountList(params, inputStr));
    }

    public async CreateDSOEnergyAmount(ctx: Context, inputStr: string) {

        const params: STARParameters = await ParametersController.getParameterValues(ctx);
        return (await EnergyAmountController.createDSOEnergyAmount(params, inputStr));
    }

    public async CreateDSOEnergyAmountList(ctx: Context, inputStr: string) {

        const params: STARParameters = await ParametersController.getParameterValues(ctx);
        return (await EnergyAmountController.createDSOEnergyAmountList(params, inputStr));
    }

    public async UpdateDSOEnergyAmount(ctx: Context, inputStr: string) {

        const params: STARParameters = await ParametersController.getParameterValues(ctx);
        return (await EnergyAmountController.updateDSOEnergyAmount(params, inputStr));
    }

    public async UpdateDSOEnergyAmountList(ctx: Context, inputStr: string) {

        const params: STARParameters = await ParametersController.getParameterValues(ctx);
        return (await EnergyAmountController.updateDSOEnergyAmountList(params, inputStr));
    }

    public async GetEnergyAmountForSystemOperator(
        ctx: Context,
        meteringPointMrid: string,
        systemOperatorEicCode: string,
        startCreatedDateTime: string) {

        const params: STARParameters = await ParametersController.getParameterValues(ctx);
        return (await EnergyAmountController.getEnergyAmountForSystemOperator
                (
                    params,
                    meteringPointMrid,
                    systemOperatorEicCode,
                    startCreatedDateTime,
                )
            );
    }

    public async GetEnergyAmountByProducer(
        ctx: Context,
        meteringPointMrid: string,
        producerEicCode: string,
        startCreatedDateTime: string) {

        const params: STARParameters = await ParametersController.getParameterValues(ctx);
        return (await EnergyAmountController.getEnergyAmountByProducer
                (
                    params,
                    meteringPointMrid,
                    producerEicCode,
                    startCreatedDateTime,
                )
            );
    }

    public async GetEnergyAmountWithPagination(
        ctx: Context, query: string) {

        const params: STARParameters = await ParametersController.getParameterValues(ctx);
        return (await EnergyAmountController.getEnergyAmountByQuery(params, query));
    }

    /* FILES */

    // /*
    //     inputStr : file[]
    // */
    // public async CreateFiles(
    //     ctx: Context, inputStr: string) {
    //     try {
    //         const params: STARParameters = await ParametersController.getParameterValues(ctx);
    //         return (await AttachmentFileController.createByList(params, inputStr));
    //     } catch (error) {
    //         throw error;
    //     }
    // }

    /*
        inputStr : file id - string
        output : File
    */
    public async GetFileById(
        ctx: Context, inputStr: string) {

        const params: STARParameters = await ParametersController.getParameterValues(ctx);
        return (await AttachmentFileController.getById(params, inputStr));
    }

    /* RESERVE BID MARKET DOCUMENT */

    /*
        inputStr : reserveBidMarketDocumentCreation
    */
    public async CreateReserveBidMarketDocument(
        ctx: Context, inputStr: string) {

        const params: STARParameters = await ParametersController.getParameterValues(ctx);
        return (await ReserveBidMarketDocumentController.create(params, inputStr));
    }

    /*
        inputStr : ReserveBidMarketDocumentFileList
        output : reserveBidMarketDocument
    */
    public async AddFileToReserveBidMarketDocument(
        ctx: Context, inputStr: string) {

        const params: STARParameters = await ParametersController.getParameterValues(ctx);
        return (await ReserveBidMarketDocumentController.addFile(params, inputStr));
    }

    /*
        inputStr : ReserveBidMarketDocumentFileList
    */
    public async RemoveFileFromReserveBidMarketDocument(
        ctx: Context, inputStr: string) {

        const params: STARParameters = await ParametersController.getParameterValues(ctx);
        return (await ReserveBidMarketDocumentController.removeFile(params, inputStr));
    }

    /*
        inputStr : reserveBidMrid, newStatus
        output : ReserveBidMarketDocument
    */
    public async UpdateStatusReserveBidMarketDocument(
        ctx: Context,
        reserveBidMrid: string,
        newStatus: string) {

        const params: STARParameters = await ParametersController.getParameterValues(ctx);
        return (await ReserveBidMarketDocumentController.updateStatus(params, reserveBidMrid, newStatus));
    }

    /*
        inputStr : reserveBidMarketDocumentCreationList
    */
    public async CreateReserveBidMarketDocumentList(
        ctx: Context, inputStr: string) {

        const params: STARParameters = await ParametersController.getParameterValues(ctx);
        return (await ReserveBidMarketDocumentController.createList(params, inputStr));
    }

    /*
        inputStr : ReserveBidMrid - string
        output : ReserveBidMarketDocument
    */
    public async GetReserveBidMarketDocumentById(
        ctx: Context, inputStr: string) {

        const params: STARParameters = await ParametersController.getParameterValues(ctx);
        return (await ReserveBidMarketDocumentController.getById(params, inputStr));
    }

    /*
        inputStr : ReserveBidMrid[] - string[]
        output : ReserveBidMarketDocument[]
    */
    public async GetReserveBidMarketDocumentListById(
        ctx: Context, inputStr: string) {

        const params: STARParameters = await ParametersController.getParameterValues(ctx);
        return (await ReserveBidMarketDocumentController.getListById(params, inputStr));
    }

    /*
        inputStr : meteringPointMrid - string
        output : ReserveBidMarketDocument[]
    */
    public async GetReserveBidMarketDocumentBySite(
        ctx: Context, inputStr: string) {

        const params: STARParameters = await ParametersController.getParameterValues(ctx);
        return (await ReserveBidMarketDocumentController.getByMeteringPointMrid(params, inputStr));
    }

    /*
        inputStr : meteringPointMrid - string
        output : ReserveBidMarketDocument[]
        //Only current and next reserve bid market document
    */
    public async GetValidReserveBidMarketDocumentBySite(
        ctx: Context, inputStr: string) {

        const params: STARParameters = await ParametersController.getParameterValues(ctx);
        return (await ReserveBidMarketDocumentController.getValidByMeteringPointMrid(params, inputStr));
    }

    /*
        inputStr : reserveBidMarketDocumentSiteDate
        output : ReserveBidMarketDocument[]
        //Only valid
    */
    public async GetAtDateReserveBidMarketDocumentBySite(
        ctx: Context, inputStr: string) {

        const params: STARParameters = await ParametersController.getParameterValues(ctx);
        return (await ReserveBidMarketDocumentController.getAtDateByMeteringPointMrid(params, inputStr));
    }

    /*
        inputStr : BalancingDocumentSearchCriteria
        output : BalancingDocument[]
    */
    public async SearchBalancingDocumentByCriteria(
        ctx: Context, inputStr: string) {

        const params: STARParameters = await ParametersController.getParameterValues(ctx);
        return (await BalancingDocumentController.searchByCriteria(params, inputStr));
    }



    /*
        inputStr : ReserveBidMrid - string
        output : "any[]"
    */
    public async GetBalancingDocumentState(ctx: Context, inputStr: string) {
        return "[]";
    }

    /*
        inputStr : "any[]" // GetBalancingDocumentState return
        output :
    */
    public async UpdateBalancingDocumentByOrders(ctx: Context, inputStr: string) {
        return "{}";
    }


    /*
    * inputStr : feedbackProducerMrid: string
    *
    * output : FeedbackProducer: FeedbackProducer
    */
    public async GetFeedbackProducer(
        ctx: Context,
        feedbackProducerMrid: string) {

        const params: STARParameters = await ParametersController.getParameterValues(ctx);
        return (await FeedbackProducerController.getObjById(params, feedbackProducerMrid));
    }


    /*
    * inputStr : activationDocumentMrid: string
    *
    * output : FeedbackProducer: FeedbackProducer
    */
    public async GetFeedbackProducerByActivationDocumentMrId(
        ctx: Context,
        activationDocumentMrid: string) {

        const params: STARParameters = await ParametersController.getParameterValues(ctx);
        return (await FeedbackProducerController.getByActivationDocumentMrId(params, activationDocumentMrid));
    }


    /*
        inputStr : activationDocumentMrid the id of the document
                    feedbackStr the comment sent by the producer
    */
    public async UpdateFeedbackProducer(
        ctx: Context,
        activationDocumentMrid: string,
        feedbackStr: string,
        feedbackElements: string) {

        const params: STARParameters = await ParametersController.getParameterValues(ctx);
        return (await FeedbackProducerController.updateFeedbackProducer(params, activationDocumentMrid, feedbackStr, feedbackElements));
    }

    /*
        inputStr : activationDocumentMrid the id of the document
                    answerStr the answer of DSO/TSO to the comment written by the producer
    */
    public async UpdateFeedbackProducerAnswer(
        ctx: Context,
        activationDocumentMrid: string,
        answerStr: string) {

        const params: STARParameters = await ParametersController.getParameterValues(ctx);
        return (await FeedbackProducerController.updateFeedbackProducerAnswer(params, activationDocumentMrid, answerStr));
    }


    /*
    * inputStr : activationDocumentMrid: string
    *
    * output : newStatus : string (IndemnityStatus)
    */
    public async UpdateActivationDocumentIndeminityStatus(ctx: Context, inputStr: string) {

        const params: STARParameters = await ParametersController.getParameterValues(ctx);
        return (await FeedbackProducerController.updateIndeminityStatus(params, inputStr));
    }

}
