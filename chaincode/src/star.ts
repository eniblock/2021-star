/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { Context, Contract } from 'fabric-contract-api';
import { ActivationDocumentController } from './controller/ActivationDocumentController';
import { EnergyAccountController } from './controller/EnergyAccountController';
import { ProducerController } from './controller/ProducerController';
import { SiteController } from './controller/SiteController';
import { SystemOperatorController } from './controller/SystemOperatorController';
import { ViewMarketParticipantController } from './controller/ViewMarketParticipantController';
import { YellowPagesController } from './controller/YellowPagesController';

export class Star extends Contract {

    // public async initLedger(ctx: Context) {
    //     console.info('============= START : Initialize Ledger ===========');
    //     // console.debug('Nothing to do');
    //     console.info('============= END   : Initialize Ledger ===========');
    // }

    /*      SystemOperator      */

    public async CreateSystemOperator(ctx: Context, inputStr: string) {
        try {
            return (await SystemOperatorController.createSystemOperator(ctx, inputStr));
        } catch (error) {
            throw error;
        }
    }

    public async UpdateSystemOperator(ctx: Context, inputStr: string) {
        try {
            return (await SystemOperatorController.updateSystemOperator(ctx, inputStr));
        } catch (error) {
            throw error;
        }
    }

    public async QuerySystemOperator(
        ctx: Context,
        id: string) {
        try {
            return (await SystemOperatorController.querySystemOperator(ctx, id));
        } catch (error) {
            throw error;
        }
    }

    public async GetAllSystemOperator(
        ctx: Context) {
        try {
            return (await SystemOperatorController.getAllSystemOperator(ctx));
        } catch (error) {
            throw error;
        }
    }

    /*      Producer      */

    public async CreateProducer(ctx: Context, inputStr: string) {
        try {
            return (await ProducerController.createProducer(ctx, inputStr));
        } catch (error) {
            throw error;
        }
    }

    public async UpdateProducer(ctx: Context, inputStr: string) {
        try {
            return (await ProducerController.updateProducer(ctx, inputStr));
        } catch (error) {
            throw error;
        }
    }

    public async QueryProducer(
        ctx: Context,
        id: string) {
        try {
            return (await ProducerController.queryProducer(ctx, id));
        } catch (error) {
            throw error;
        }
    }

    public async GetAllProducer(
        ctx: Context) {
        try {
            return (await ProducerController.getAllProducer(ctx));
        } catch (error) {
            throw error;
        }
    }

    /*      Sites       */

    public async CreateSite(ctx: Context, inputStr: string) {
        try {
            return (await SiteController.createSite(ctx, inputStr));
        } catch (error) {
            throw error;
        }
    }

    public async QuerySite(
        ctx: Context,
        id: string) {
        try {
            return (await SiteController.querySite(ctx, id));
        } catch (error) {
            throw error;
        }
    }

    public async GetSitesBySystemOperator(
        ctx: Context,
        id: string) {
        try {
            return (await SiteController.getSitesBySystemOperator(ctx, id));
        } catch (error) {
            throw error;
        }
    }

    public async GetSitesByProducer(
        ctx: Context,
        id: string) {
        try {
            return (await SiteController.getSitesByProducer(ctx, id));
        } catch (error) {
            throw error;
        }
    }

/*      Restitution View System Operator Market Participant      */

    public async ViewSystemOperaterMarketParticipant(
        ctx: Context) {
        try {
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
            return (await ViewMarketParticipantController.viewProducerMarketParticipant(ctx, id));
        } catch (error) {
            throw error;
        }
    }

    /*      Activation Document       */

    public async CreateActivationDocument(ctx: Context, inputStr: string) {
        try {
            return (await ActivationDocumentController.createActivationDocument(ctx, inputStr));
        } catch (error) {
            throw error;
        }
    }

    public async GetActivationDocumentByProducer(
        ctx: Context,
        inputStr: string) {
        try {
            return (await ActivationDocumentController.getActivationDocumentByProducer(ctx, inputStr));
        } catch (error) {
            throw error;
        }
    }

    public async GetActivationDocumentBySystemOperator(
        ctx: Context,
        inputStr: string) {
        try {
            return (await ActivationDocumentController.getActivationDocumentBySystemOperator(ctx, inputStr));
        } catch (error) {
            throw error;
        }
    }

    /*      Yellow Pages       */

    public async CreateYellowPages(ctx: Context, inputStr: string) {
        try {
            return (await YellowPagesController.createYellowPages(ctx, inputStr));
        } catch (error) {
            throw error;
        }
    }

    public async GetAllYellowPages(
        ctx: Context) {
        try {
            return (await YellowPagesController.getAllYellowPages(ctx));
        } catch (error) {
            throw error;
        }
    }

    /*      Energy Account       */

    public async CreateEnergyAccount(ctx: Context, inputStr: string) {
        try {
            return (await EnergyAccountController.createEnergyAccount(ctx, inputStr));
        } catch (error) {
            throw error;
        }
    }

    public async GetEnergyAccount(
        ctx: Context,
        inputStr: string,
        dateStr: string) {
                try {
            return (await EnergyAccountController.getEnergyAccount(ctx, inputStr, dateStr));
        } catch (error) {
            throw error;
        }
    }

    // public async GetAllEnergyAccount(
    //     ctx: Context) {
    //     try {
    //         return (await EnergyAccountController.getAllEnergyAccount(ctx));
    //     } catch (error) {
    //         throw error;
    //     }
    // }
}
