/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { Context, Contract } from 'fabric-contract-api';
import { ActivationDocumentController } from './controller/ActivationDocumentController';
import { EnergyAccountController } from './controller/EnergyAccountController';
import { EnergyAmountController } from './controller/EnergyAmountController';
import { ParametersController } from './controller/ParametersController';
import { STARParameters } from './model/starParameters';
import { ProducerController } from './controller/ProducerController';
import { ReferenceEnergyAccountController } from './controller/ReferenceEnergyAccountController';
import { SiteController } from './controller/SiteController';
import { SystemOperatorController } from './controller/SystemOperatorController';
import { ViewMarketParticipantController } from './controller/ViewMarketParticipantController';
import { YellowPagesController } from './controller/YellowPagesController';
import {HistoriqueActivationController} from "./controller/HistoriqueActivationController";
import { HLFServices } from './controller/service/HLFservice';

export class Star extends Contract {

    // public async initLedger(ctx: Context) {
    //     console.info('============= START : Initialize Ledger ===========');
    //     // console.debug('Nothing to do');
    //     console.info('============= END   : Initialize Ledger ===========');
    // }

    public async ping(ctx: Context) {
        console.debug('============= Ping Call ===========');
        const identity = await HLFServices.getMspID(ctx);
        return identity;
    }

    // /*      Parameters          */
    // public async changeAllParameters(ctx: Context, inputStr: string) {
    //     try {
    //         return (await ParametersController.changeAllParameters(ctx, inputStr));
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
            // const params: Parameters = await ParametersController.getParameterValues(ctx);
            return (await SystemOperatorController.createSystemOperator(ctx, inputStr));
        } catch (error) {
            throw error;
        }
    }

    public async UpdateSystemOperator(ctx: Context, inputStr: string) {
        try {
            // const params: Parameters = await ParametersController.getParameterValues(ctx);
            return (await SystemOperatorController.updateSystemOperator(ctx, inputStr));
        } catch (error) {
            throw error;
        }
    }

    public async QuerySystemOperator(
        ctx: Context,
        id: string) {
        try {
            // const params: Parameters = await ParametersController.getParameterValues(ctx);
            return (await SystemOperatorController.querySystemOperator(ctx, id));
        } catch (error) {
            throw error;
        }
    }

    public async GetAllSystemOperator(
        ctx: Context) {
        try {
            // const params: Parameters = await ParametersController.getParameterValues(ctx);
            return (await SystemOperatorController.getAllSystemOperator(ctx));
        } catch (error) {
            throw error;
        }
    }

    public async GetSystemOperatorByQuery(
        ctx: Context, query: string) {
        try {
            // const params: Parameters = await ParametersController.getParameterValues(ctx);
            return (await SystemOperatorController.getSystemOperatorByQuery(ctx, query));
        } catch (error) {
            throw error;
        }
    }

    /*      Producer      */

    public async CreateProducer(ctx: Context, inputStr: string) {
        try {
            // const params: Parameters = await ParametersController.getParameterValues(ctx);
            return (await ProducerController.createProducer(ctx, inputStr));
        } catch (error) {
            throw error;
        }
    }

    public async UpdateProducer(ctx: Context, inputStr: string) {
        try {
            // const params: Parameters = await ParametersController.getParameterValues(ctx);
            return (await ProducerController.updateProducer(ctx, inputStr));
        } catch (error) {
            throw error;
        }
    }

    public async QueryProducer(
        ctx: Context,
        id: string) {
        try {
            // const params: Parameters = await ParametersController.getParameterValues(ctx);
            return (await ProducerController.queryProducer(ctx, id));
        } catch (error) {
            throw error;
        }
    }

    public async GetAllProducer(
        ctx: Context) {
        try {
            // const params: Parameters = await ParametersController.getParameterValues(ctx);
            return (await ProducerController.getAllProducer(ctx));
        } catch (error) {
            throw error;
        }
    }

    /*      Sites       */

    public async CreateSite(ctx: Context, inputStr: string) {
        try {
            const params: STARParameters = await ParametersController.getParameterValues(ctx);
            return (await SiteController.createSite(ctx, params, inputStr));
        } catch (error) {
            throw error;
        }
    }

    public async UpdateSite(ctx: Context, inputStr: string) {
        try {
            const params: STARParameters = await ParametersController.getParameterValues(ctx);
            return (await SiteController.updateSite(ctx, params, inputStr));
        } catch (error) {
            throw error;
        }
    }

    public async QuerySite(
        ctx: Context,
        id: string) {
        try {
            const params: STARParameters = await ParametersController.getParameterValues(ctx);
            return (await SiteController.querySite(ctx, params, id));
        } catch (error) {
            throw error;
        }
    }

    public async SiteExists(
        ctx: Context,
        id: string) {
        try {
            const params: STARParameters = await ParametersController.getParameterValues(ctx);
            return (await SiteController.siteExists(ctx, params, id));
        } catch (error) {
            throw error;
        }
    }

    public async GetSiteWithPagination(
        ctx: Context,
        query: string, pageSize: number, bookmark: string) {
        try {
            const params: STARParameters = await ParametersController.getParameterValues(ctx);
            return (await SiteController.getSitesByQuery(ctx, params, query, pageSize, bookmark));
        } catch (error) {
            throw error;
        }
    }

    public async GetSitesBySystemOperator(
        ctx: Context,
        id: string) {
        try {
            const params: STARParameters = await ParametersController.getParameterValues(ctx);
            return (await SiteController.getSitesBySystemOperator(ctx, params, id));
        } catch (error) {
            throw error;
        }
    }

    public async GetSitesByProducer(
        ctx: Context,
        id: string) {
        try {
            const params: STARParameters = await ParametersController.getParameterValues(ctx);
            return (await SiteController.getSitesByProducer(ctx, params, id));
        } catch (error) {
            throw error;
        }
    }

/*      Restitution View System Operator Market Participant      */

    public async ViewSystemOperaterMarketParticipant(
        ctx: Context) {
        try {
            // const params: Parameters = await ParametersController.getParameterValues(ctx);
            return (await ViewMarketParticipantController.viewSystemOperaterMarketParticipant(ctx));
        } catch (error) {
            throw error;
        }
    }

    /*      Restitution View Producer Market Participant       */

    public async ViewProducerMarketParticipant(
        ctx: Context,
        id: string) {
        try {
            // const params: Parameters = await ParametersController.getParameterValues(ctx);
            return (await ViewMarketParticipantController.viewProducerMarketParticipant(ctx, id));
        } catch (error) {
            throw error;
        }
    }

    /*      Activation Document       */

    public async CreateActivationDocument(ctx: Context, inputStr: string) {
        try {
            const params: STARParameters = await ParametersController.getParameterValues(ctx);
            return (await ActivationDocumentController.createActivationDocument(ctx, params, inputStr));
        } catch (error) {
            throw error;
        }
    }

    public async GetActivationDocumentReconciliationState(ctx: Context) {
        try {
            const params: STARParameters = await ParametersController.getParameterValues(ctx);
            return (await ActivationDocumentController.getReconciliationState(ctx, params));
        } catch (error) {
            throw error;
        }
    }

    public async UpdateActivationDocumentByOrders(ctx: Context, inputStr: string) {
        try {
            const params: STARParameters = await ParametersController.getParameterValues(ctx);
            return (await ActivationDocumentController.updateActivationDocumentByOrders(ctx, params, inputStr));
        } catch (error) {
            throw error;
        }
    }

    public async GetActivationDocumentByProducer(
        ctx: Context,
        inputStr: string) {
        try {
            const params: STARParameters = await ParametersController.getParameterValues(ctx);
            return (await ActivationDocumentController.getActivationDocumentByProducer(ctx, params, inputStr));
        } catch (error) {
            throw error;
        }
    }

    public async GetActivationDocumentBySystemOperator(
        ctx: Context,
        inputStr: string) {
        try {
            const params: STARParameters = await ParametersController.getParameterValues(ctx);
            return (await ActivationDocumentController.getActivationDocumentBySystemOperator(ctx, params, inputStr));
        } catch (error) {
            throw error;
        }
    }

    public async GetActivationDocumentByQuery(
        ctx: Context,
        query: string) {
        try {
            const params: STARParameters = await ParametersController.getParameterValues(ctx);
            return (await ActivationDocumentController.getActivationDocumentByQuery(ctx, params, query));
        } catch (error) {
            throw error;
        }
    }

    /*      Historique limitation       */
    public async GetHistoriqueWithPagination(
        ctx: Context,
        query: string, pageSize: number, bookmark: string) {
        try {
            //const params: STARParameters = await ParametersController.getParameterValues(ctx);
            return (await HistoriqueActivationController.getHistoriqueByQuery(ctx, query, 0, ''));
        } catch (error) {
            throw error;
        }
    }



    /*      Yellow Pages       */

    public async CreateYellowPages(ctx: Context, inputStr: string) {
        try {
            // const params: Parameters = await ParametersController.getParameterValues(ctx);
            return (await YellowPagesController.createYellowPages(ctx, inputStr));
        } catch (error) {
            throw error;
        }
    }

    public async GetAllYellowPages(
        ctx: Context) {
        try {
            // const params: Parameters = await ParametersController.getParameterValues(ctx);
            return (await YellowPagesController.getAllYellowPages(ctx));
        } catch (error) {
            throw error;
        }
    }

    /*      Energy Account       */

    public async CreateEnergyAccount(ctx: Context, inputStr: string) {
        try {
            const params: STARParameters = await ParametersController.getParameterValues(ctx);
            return (await EnergyAccountController.createEnergyAccount(ctx, params, inputStr));
        } catch (error) {
            throw error;
        }
    }

    public async UpdateEnergyAccount(ctx: Context, inputStr: string) {
        try {
            const params: STARParameters = await ParametersController.getParameterValues(ctx);
            return (await EnergyAccountController.updateEnergyAccount(ctx, params, inputStr));
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
            // const params: Parameters = await ParametersController.getParameterValues(ctx);
            return (await EnergyAccountController.getEnergyAccountForSystemOperator
                (
                    ctx,
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
            // const params: Parameters = await ParametersController.getParameterValues(ctx);
            return (await EnergyAccountController.getEnergyAccountByProducer
                (
                    ctx,
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
        query: string, pageSize: number, bookmark: string) {
        try {
            // const params: Parameters = await ParametersController.getParameterValues(ctx);
            return (await EnergyAccountController.getEnergyAccountByQuery(ctx, query, pageSize, bookmark));
        } catch (error) {
            throw error;
        }
    }

    /*      Reference Energy Account       */

    public async CreateReferenceEnergyAccount(ctx: Context, inputStr: string) {
        try {
            const params: STARParameters = await ParametersController.getParameterValues(ctx);
            return (await ReferenceEnergyAccountController.createReferenceEnergyAccount(ctx, params, inputStr));
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
            // const params: Parameters = await ParametersController.getParameterValues(ctx);
            return (await ReferenceEnergyAccountController.getReferenceEnergyAccountForSystemOperator
                (
                    ctx,
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
            // const params: Parameters = await ParametersController.getParameterValues(ctx);
            return (await ReferenceEnergyAccountController.getReferenceEnergyAccountByProducer
                (
                    ctx,
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
            return (await EnergyAmountController.createTSOEnergyAmount(ctx, params, inputStr));
        } catch (error) {
            throw error;
        }
    }

    public async UpdateTSOEnergyAmount(ctx: Context, inputStr: string) {
        try {
            const params: STARParameters = await ParametersController.getParameterValues(ctx);
            return (await EnergyAmountController.updateTSOEnergyAmount(ctx, params, inputStr));
        } catch (error) {
            throw error;
        }
    }

    public async CreateDSOEnergyAmount(ctx: Context, inputStr: string) {
        try {
            const params: STARParameters = await ParametersController.getParameterValues(ctx);
            return (await EnergyAmountController.createDSOEnergyAmount(ctx, params, inputStr));
        } catch (error) {
            throw error;
        }
    }

    public async UpdateDSOEnergyAmount(ctx: Context, inputStr: string) {
        try {
            const params: STARParameters = await ParametersController.getParameterValues(ctx);
            return (await EnergyAmountController.updateDSOEnergyAmount(ctx, params, inputStr));
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
            // const params: Parameters = await ParametersController.getParameterValues(ctx);
            return (await EnergyAmountController.getEnergyAmountForSystemOperator
                (
                    ctx,
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
            // const params: Parameters = await ParametersController.getParameterValues(ctx);
            return (await EnergyAmountController.getEnergyAmountByProducer
                (
                    ctx,
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
        ctx: Context,
        query: string, pageSize: number, bookmark: string) {
        try {
            // const params: Parameters = await ParametersController.getParameterValues(ctx);
            return (await EnergyAmountController.getEnergyAmountByQuery(ctx, query, pageSize, bookmark));
        } catch (error) {
            throw error;
        }
    }
}
