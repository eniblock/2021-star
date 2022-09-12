/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { Context, Contract } from 'fabric-contract-api';

import { STARParameters } from './model/starParameters';

import { ParametersType } from './enums/ParametersType';

import { ActivationDocumentController } from './controller/activationDocument/ActivationDocumentController';
import { EnergyAccountController } from './controller/EnergyAccountController';
import { EnergyAmountController } from './controller/EnergyAmountController';
import { ParametersController } from './controller/ParametersController';
import { ProducerController } from './controller/ProducerController';
import { ReferenceEnergyAccountController } from './controller/ReferenceEnergyAccountController';
import { SiteController } from './controller/SiteController';
import { SystemOperatorController } from './controller/SystemOperatorController';
import { ViewMarketParticipantController } from './controller/ViewMarketParticipantController';
import { YellowPagesController } from './controller/YellowPagesController';
import {HistoryController} from "./controller/activationDocument/HistoryController";
import { EligibilityController } from './controller/activationDocument/EligibilityController';
import { StarDataStateController } from './controller/StarDataStateController';

import { HLFServices } from './controller/service/HLFservice';
import { AttachmentFileController } from './controller/AttachmentFileController';

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

        params.logger.debug("test log DEBUG");
        params.logger.info("test log INFO");
        params.logger.warn("test log WARNING");
        params.logger.error("test log ERROR");

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
        try {
            const params: STARParameters = await ParametersController.getParameterValues(ctx);
            return (await SystemOperatorController.createSystemOperator(params, inputStr));
        } catch (error) {
            throw error;
        }
    }

    public async UpdateSystemOperator(ctx: Context, inputStr: string) {
        try {
            const params: STARParameters = await ParametersController.getParameterValues(ctx);
            return (await SystemOperatorController.updateSystemOperator(params, inputStr));
        } catch (error) {
            throw error;
        }
    }

    public async QuerySystemOperator(
        ctx: Context,
        id: string) {
        try {
            const params: STARParameters = await ParametersController.getParameterValues(ctx);
            return (await SystemOperatorController.getSystemOperatorObjById(params, id));
        } catch (error) {
            throw error;
        }
    }

    public async GetAllSystemOperator(
        ctx: Context) {
        try {
            const params: STARParameters = await ParametersController.getParameterValues(ctx);
            return (await SystemOperatorController.getAllSystemOperator(params));
        } catch (error) {
            throw error;
        }
    }

    public async GetSystemOperatorByQuery(
        ctx: Context, query: string) {
        try {
            const params: STARParameters = await ParametersController.getParameterValues(ctx);
            return (await SystemOperatorController.getSystemOperatorByQuery(params, query));
        } catch (error) {
            throw error;
        }
    }

    /*      Producer      */

    public async CreateProducer(ctx: Context, inputStr: string) {
        try {
            const params: STARParameters = await ParametersController.getParameterValues(ctx);
            return (await ProducerController.createProducer(params, inputStr));
        } catch (error) {
            throw error;
        }
    }

    public async UpdateProducer(ctx: Context, inputStr: string) {
        try {
            const params: STARParameters = await ParametersController.getParameterValues(ctx);
            return (await ProducerController.updateProducer(params, inputStr));
        } catch (error) {
            throw error;
        }
    }

    public async CreateProducerList(ctx: Context, inputStr: string) {
        try {
            const params: STARParameters = await ParametersController.getParameterValues(ctx);
            return (await ProducerController.createProducerList(params, inputStr));
        } catch (error) {
            throw error;
        }
    }

    public async UpdateProducerList(ctx: Context, inputStr: string) {
        try {
            const params: STARParameters = await ParametersController.getParameterValues(ctx);
            return (await ProducerController.updateProducerList(params, inputStr));
        } catch (error) {
            throw error;
        }
    }

    public async QueryProducer(
        ctx: Context,
        id: string) {
        try {
            const params: STARParameters = await ParametersController.getParameterValues(ctx);
            return (await ProducerController.getProducerById(params, id));
        } catch (error) {
            throw error;
        }
    }

    public async GetAllProducer(
        ctx: Context) {
        try {
            const params: STARParameters = await ParametersController.getParameterValues(ctx);
            return (await ProducerController.getAllProducer(params));
        } catch (error) {
            throw error;
        }
    }

    /*      Sites       */

    public async CreateSite(ctx: Context, inputStr: string) {
        try {
            const params: STARParameters = await ParametersController.getParameterValues(ctx);
            return (await SiteController.createSite(params, inputStr));
        } catch (error) {
            throw error;
        }
    }

    public async UpdateSite(ctx: Context, inputStr: string) {
        try {
            const params: STARParameters = await ParametersController.getParameterValues(ctx);
            return (await SiteController.updateSite(params, inputStr));
        } catch (error) {
            throw error;
        }
    }

    public async QuerySite(
        ctx: Context,
        id: string) {
        try {
            const params: STARParameters = await ParametersController.getParameterValues(ctx);
            return (await SiteController.querySite(params, id));
        } catch (error) {
            throw error;
        }
    }

    public async SiteExists(
        ctx: Context,
        id: string) {
        try {
            const params: STARParameters = await ParametersController.getParameterValues(ctx);
            return (await SiteController.siteExists(params, id));
        } catch (error) {
            throw error;
        }
    }

    public async GetSitesByQuery(
        ctx: Context,
        query: string) {
        try {
            const params: STARParameters = await ParametersController.getParameterValues(ctx);
            return (await SiteController.getSitesByQuery(params, query));
        } catch (error) {
            throw error;
        }
    }

    public async GetSitesBySystemOperator(
        ctx: Context,
        id: string) {
        try {
            const params: STARParameters = await ParametersController.getParameterValues(ctx);
            return (await SiteController.getSitesBySystemOperator(params, id));
        } catch (error) {
            throw error;
        }
    }

    public async GetSitesByProducer(
        ctx: Context,
        id: string) {
        try {
            const params: STARParameters = await ParametersController.getParameterValues(ctx);
            return (await SiteController.getSitesByProducer(params, id));
        } catch (error) {
            throw error;
        }
    }

/*      Restitution View System Operator Market Participant      */

    public async ViewSystemOperaterMarketParticipant(
        ctx: Context) {
        try {
            const params: STARParameters = await ParametersController.getParameterValues(ctx);
            return (await ViewMarketParticipantController.viewSystemOperaterMarketParticipant(params));
        } catch (error) {
            throw error;
        }
    }

    /*      Restitution View Producer Market Participant       */

    public async ViewProducerMarketParticipant(
        ctx: Context,
        id: string) {
        try {
            const params: STARParameters = await ParametersController.getParameterValues(ctx);
            return (await ViewMarketParticipantController.viewProducerMarketParticipant(params, id));
        } catch (error) {
            throw error;
        }
    }

    /*      Activation Document       */

    public async CreateActivationDocument(ctx: Context, inputStr: string) {
        try {
            const params: STARParameters = await ParametersController.getParameterValues(ctx);
            return (await ActivationDocumentController.createActivationDocument(params, inputStr));
        } catch (error) {
            throw error;
        }
    }

    public async CreateActivationDocumentList(ctx: Context, inputStr: string) {
        try {
            const params: STARParameters = await ParametersController.getParameterValues(ctx);
            return (await ActivationDocumentController.createActivationDocumentList(params, inputStr));
        } catch (error) {
            throw error;
        }
    }

    public async GetActivationDocumentReconciliationState(ctx: Context) {
        try {
            const params: STARParameters = await ParametersController.getParameterValues(ctx);
            return (await StarDataStateController.getStarDataState(params));
        } catch (error) {
            throw error;
        }
    }

    public async UpdateActivationDocumentEligibilityStatus(ctx: Context, inputStr: string) {
        try {
            const params: STARParameters = await ParametersController.getParameterValues(ctx);
            return (await EligibilityController.updateEligibilityStatus(params, inputStr));
        } catch (error) {
            throw error;
        }
    }

    public async UpdateActivationDocumentByOrders(ctx: Context, inputStr: string) {
        try {
            const params: STARParameters = await ParametersController.getParameterValues(ctx);
            return (await StarDataStateController.executeStarDataOrders(params, inputStr));
        } catch (error) {
            throw error;
        }
    }

    public async GetActivationDocumentByProducer(
        ctx: Context,
        inputStr: string) {
        try {
            const params: STARParameters = await ParametersController.getParameterValues(ctx);
            return (await ActivationDocumentController.getActivationDocumentByProducer(params, inputStr));
        } catch (error) {
            throw error;
        }
    }

    public async GetActivationDocumentBySystemOperator(
        ctx: Context,
        inputStr: string) {
        try {
            const params: STARParameters = await ParametersController.getParameterValues(ctx);
            return (await ActivationDocumentController.getActivationDocumentBySystemOperator(params, inputStr));
        } catch (error) {
            throw error;
        }
    }

    public async GetActivationDocumentByQuery(
        ctx: Context,
        query: string) {
        try {
            const params: STARParameters = await ParametersController.getParameterValues(ctx);
            return (await ActivationDocumentController.getActivationDocumentByQuery(params, query));
        } catch (error) {
            throw error;
        }
    }

    /*      Limitation History       */
    public async GetActivationDocumentHistory(
        ctx: Context,
        inputStr: string) {
        try {
            const params: STARParameters = await ParametersController.getParameterValues(ctx);
            return (await HistoryController.getHistoryByQuery(params, inputStr));
        } catch (error) {
            throw error;
        }
    }



    /*      Yellow Pages       */

    public async CreateYellowPages(ctx: Context, inputStr: string) {
        try {
            const params: STARParameters = await ParametersController.getParameterValues(ctx);
            return (await YellowPagesController.createYellowPages(params, inputStr));
        } catch (error) {
            throw error;
        }
    }

    public async GetAllYellowPages(
        ctx: Context) {
        try {
            const params: STARParameters = await ParametersController.getParameterValues(ctx);
            return (await YellowPagesController.getAllYellowPages(params));
        } catch (error) {
            throw error;
        }
    }

    /*      Energy Account       */

    public async CreateEnergyAccount(ctx: Context, inputStr: string) {
        try {
            const params: STARParameters = await ParametersController.getParameterValues(ctx);
            return (await EnergyAccountController.createEnergyAccount(params, inputStr));
        } catch (error) {
            throw error;
        }
    }

    public async CreateEnergyAccountList(ctx: Context, inputStr: string) {
        try {
            const params: STARParameters = await ParametersController.getParameterValues(ctx);
            return (await EnergyAccountController.createEnergyAccountList(params, inputStr));
        } catch (error) {
            throw error;
        }
    }

    public async UpdateEnergyAccount(ctx: Context, inputStr: string) {
        try {
            const params: STARParameters = await ParametersController.getParameterValues(ctx);
            return (await EnergyAccountController.updateEnergyAccount(params, inputStr));
        } catch (error) {
            throw error;
        }
    }


    public async UpdateEnergyAccountList(ctx: Context, inputStr: string) {
        try {
            const params: STARParameters = await ParametersController.getParameterValues(ctx);
            return (await EnergyAccountController.updateEnergyAccountList(params, inputStr));
        } catch (error) {
            throw error;
        }
    }


    public async GetEnergyAccountForSystemOperator(
        ctx: Context,
        meteringPointMrid: string,
        systemOperatorEicCode: string,
        startCreatedDateTime: string) {
                try {
            const params: STARParameters = await ParametersController.getParameterValues(ctx);
            return (await EnergyAccountController.getEnergyAccountForSystemOperator
                (
                    params,
                    meteringPointMrid,
                    systemOperatorEicCode,
                    startCreatedDateTime,
                )
            );
        } catch (error) {
            throw error;
        }
    }

    public async GetEnergyAccountByProducer(
        ctx: Context,
        meteringPointMrid: string,
        producerEicCode: string,
        startCreatedDateTime: string) {
                try {
            const params: STARParameters = await ParametersController.getParameterValues(ctx);
            return (await EnergyAccountController.getEnergyAccountByProducer
                (
                    params,
                    meteringPointMrid,
                    producerEicCode,
                    startCreatedDateTime,
                )
            );
        } catch (error) {
            throw error;
        }
    }

    public async GetEnergyAccountWithPagination(
        ctx: Context,
        query: string) {
        try {
            const params: STARParameters = await ParametersController.getParameterValues(ctx);
            return (await EnergyAccountController.getEnergyAccountByQuery(params, query));
        } catch (error) {
            throw error;
        }
    }

    /*      Reference Energy Account       */

    public async CreateReferenceEnergyAccount(ctx: Context, inputStr: string) {
        try {
            const params: STARParameters = await ParametersController.getParameterValues(ctx);
            return (await ReferenceEnergyAccountController.createReferenceEnergyAccount(params, inputStr));
        } catch (error) {
            throw error;
        }
    }

    public async GetReferenceEnergyAccountForSystemOperator(
        ctx: Context,
        meteringPointMrid: string,
        systemOperatorEicCode: string,
        startCreatedDateTime: string) {
                try {
            const params: STARParameters = await ParametersController.getParameterValues(ctx);
            return (await ReferenceEnergyAccountController.getReferenceEnergyAccountForSystemOperator
                (
                    params,
                    meteringPointMrid,
                    systemOperatorEicCode,
                    startCreatedDateTime,
                )
            );
        } catch (error) {
            throw error;
        }
    }

    public async GetReferenceEnergyAccountByProducer(
        ctx: Context,
        meteringPointMrid: string,
        producerEicCode: string,
        startCreatedDateTime: string) {
                try {
            const params: STARParameters = await ParametersController.getParameterValues(ctx);
            return (await ReferenceEnergyAccountController.getReferenceEnergyAccountByProducer
                (
                    params,
                    meteringPointMrid,
                    producerEicCode,
                    startCreatedDateTime,
                )
            );
        } catch (error) {
            throw error;
        }
    }

    /*      Energy Amount       */

    public async CreateTSOEnergyAmount(ctx: Context, inputStr: string) {
        try {
            const params: STARParameters = await ParametersController.getParameterValues(ctx);
            return (await EnergyAmountController.createTSOEnergyAmount(params, inputStr));
        } catch (error) {
            throw error;
        }
    }

    public async CreateTSOEnergyAmountList(ctx: Context, inputStr: string) {
        try {
            const params: STARParameters = await ParametersController.getParameterValues(ctx);
            return (await EnergyAmountController.createTSOEnergyAmountList(params, inputStr));
        } catch (error) {
            throw error;
        }
    }

    public async UpdateTSOEnergyAmount(ctx: Context, inputStr: string) {
        try {
            const params: STARParameters = await ParametersController.getParameterValues(ctx);
            return (await EnergyAmountController.updateTSOEnergyAmount(params, inputStr));
        } catch (error) {
            throw error;
        }
    }

    public async UpdateTSOEnergyAmountList(ctx: Context, inputStr: string) {
        try {
            const params: STARParameters = await ParametersController.getParameterValues(ctx);
            return (await EnergyAmountController.updateTSOEnergyAmountList(params, inputStr));
        } catch (error) {
            throw error;
        }
    }

    public async CreateDSOEnergyAmount(ctx: Context, inputStr: string) {
        try {
            const params: STARParameters = await ParametersController.getParameterValues(ctx);
            return (await EnergyAmountController.createDSOEnergyAmount(params, inputStr));
        } catch (error) {
            throw error;
        }
    }

    public async CreateDSOEnergyAmountList(ctx: Context, inputStr: string) {
        try {
            const params: STARParameters = await ParametersController.getParameterValues(ctx);
            return (await EnergyAmountController.createDSOEnergyAmountList(params, inputStr));
        } catch (error) {
            throw error;
        }
    }

    public async UpdateDSOEnergyAmount(ctx: Context, inputStr: string) {
        try {
            const params: STARParameters = await ParametersController.getParameterValues(ctx);
            return (await EnergyAmountController.updateDSOEnergyAmount(params, inputStr));
        } catch (error) {
            throw error;
        }
    }

    public async UpdateDSOEnergyAmountList(ctx: Context, inputStr: string) {
        try {
            const params: STARParameters = await ParametersController.getParameterValues(ctx);
            return (await EnergyAmountController.updateDSOEnergyAmountList(params, inputStr));
        } catch (error) {
            throw error;
        }
    }

    public async GetEnergyAmountForSystemOperator(
        ctx: Context,
        meteringPointMrid: string,
        systemOperatorEicCode: string,
        startCreatedDateTime: string) {
                try {
            const params: STARParameters = await ParametersController.getParameterValues(ctx);
            return (await EnergyAmountController.getEnergyAmountForSystemOperator
                (
                    params,
                    meteringPointMrid,
                    systemOperatorEicCode,
                    startCreatedDateTime,
                )
            );
        } catch (error) {
            throw error;
        }
    }

    public async GetEnergyAmountByProducer(
        ctx: Context,
        meteringPointMrid: string,
        producerEicCode: string,
        startCreatedDateTime: string) {
                try {
            const params: STARParameters = await ParametersController.getParameterValues(ctx);
            return (await EnergyAmountController.getEnergyAmountByProducer
                (
                    params,
                    meteringPointMrid,
                    producerEicCode,
                    startCreatedDateTime,
                )
            );
        } catch (error) {
            throw error;
        }
    }

    public async GetEnergyAmountWithPagination(
        ctx: Context, query: string) {
        try {
            const params: STARParameters = await ParametersController.getParameterValues(ctx);
            return (await EnergyAmountController.getEnergyAmountByQuery(params, query));
        } catch (error) {
            throw error;
        }
    }

    /* FILES */

    /*
        inputStr : file[]
    */
    public async CreateFiles(
        ctx: Context, inputStr: string) {
        try {
            const params: STARParameters = await ParametersController.getParameterValues(ctx);
            return (await AttachmentFileController.CreateFiles(params, inputStr));
        } catch (error) {
            throw error;
        }
    }

    /*
        inputStr : file id - string
        output : File
    */
    public async GetFileById(
        ctx: Context, inputStr: string) {
        try {
            const params: STARParameters = await ParametersController.getParameterValues(ctx);
            return (await AttachmentFileController.GetFileById(params, inputStr));
        } catch (error) {
            throw error;
        }
    }

    /* RESERVE BID MARKET DOCUMENT */

    /*
        inputStr : reserveBidMarketDocument
    */
    public async CreateReserveBidMarketDocument(
        ctx: Context, inputStr: string) {
        try {
            /* TODO */
        } catch (error) {
            throw error;
        }
    }

    /*
        inputStr : ???
    */
    public async AddFileToReserveBidMarketDocument(
        ctx: Context, inputStr: string) {
        try {
            /* TODO */
        } catch (error) {
            throw error;
        }
    }

    /*
        inputStr : ???
    */
    public async RemoveFileFromReserveBidMarketDocument(
        ctx: Context, inputStr: string) {
        try {
            /* TODO */
        } catch (error) {
            throw error;
        }
    }

    /*
        inputStr : reserveBidMarketDocument[]
    */
    public async CreateReserveBidMarketDocumentList(
        ctx: Context, inputStr: string) {
        try {
            /* TODO */
        } catch (error) {
            throw error;
        }
    }

    /*
        inputStr : ReserveBidMrid
        output : ReserveBidMarketDocument
    */
        public async getReserveBidMarketDocumentById(
            ctx: Context, inputStr: string) {
            try {
                /* TODO */
            } catch (error) {
                throw error;
            }
        }

    /*
        inputStr : ReserveBidMrid[]
        output : ReserveBidMarketDocument[]
    */
        public async getReserveBidMarketDocumentListById(
            ctx: Context, inputStr: string) {
            try {
                /* TODO */
            } catch (error) {
                throw error;
            }
        }


    /*
        inputStr : meteringPointMrid
        output : ReserveBidMarketDocument[]
    */
        public async getReserveBidMarketDocumentBySite(
            ctx: Context, inputStr: string) {
            try {
                /* TODO */
            } catch (error) {
                throw error;
            }
        }


    /*
        inputStr : meteringPointMrid
        output : ReserveBidMarketDocument[]
        //Only current and next reserve bid market document
    */
        public async getValidReserveBidMarketDocumentBySite(
            ctx: Context, inputStr: string) {
            try {
                /* TODO */
            } catch (error) {
                throw error;
            }
        }

}
