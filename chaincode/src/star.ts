/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { Context, Contract } from 'fabric-contract-api';
import { ActivationDocumentController } from './controller/ActivationDocumentController';
import { ProducerController } from './controller/ProducerController';
import { SystemOperatorController } from './controller/SystemOperatorController';
import { ViewMarketParticipantController } from './controller/ViewMarketParticipantController';
import { YellowPagesController } from './controller/YellowPagesController';
import { OrganizationTypeMsp } from './enums/OrganizationMspType';
import { Site } from './site';

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

    public async createSite(
        ctx: Context,
        inputStr: string) {
        let site: Site;
        try {
            site = JSON.parse(inputStr);
          } catch (error) {
            // console.error('error=', error);
            throw new Error(`ERROR createSite-> Input string NON-JSON value`);
          }
        console.info(
            '============= START : Create %s Site ===========',
            site.meteringPointMrid,
        );
        if (!site.meteringPointMrid ||
            !site.systemOperatorMarketParticipantMrid ||
            !site.producerMarketParticipantMrid ||
            !site.technologyType ||
            !site.siteType ||
            !site.siteName ||
            !site.substationMrid ||
            !site.substationName ) {
                throw new Error(`Missing compulsory field / Manque des données obligatoires`);
            }

        const identity = await ctx.stub.getMspID();
        if (site.marketEvaluationPointMrid && site.schedulingEntityRegisteredResourceMrid) {
            if (identity !== OrganizationTypeMsp.RTE) {
                throw new Error(`Organisation, ${identity} does not have write access for HTB(HV) sites`);
            }
        } else if (!site.marketEvaluationPointMrid && !site.schedulingEntityRegisteredResourceMrid) {
            if (identity !== OrganizationTypeMsp.ENEDIS) {
                throw new Error(`Organisation, ${identity} does not have write access for HTA(MV) sites`);
            }
        } else {
            throw new Error(`marketEvaluationPointMrid and schedulingEntityRegisteredResourceMrid must be both present for HTB site or absent for HTA site.`);
        }
        const systemOperatorAsBytes = await ctx.stub.getState(site.systemOperatorMarketParticipantMrid);
        if (!systemOperatorAsBytes || systemOperatorAsBytes.length === 0) {
            throw new Error(`System Operator : ${site.systemOperatorMarketParticipantMrid} does not exist for site creation`);
        }

        const producerAsBytes = await ctx.stub.getState(site.producerMarketParticipantMrid);
        if (!producerAsBytes || producerAsBytes.length === 0) {
            throw new Error(`Producer : ${site.producerMarketParticipantMrid} does not exist for site creation`);
        }
        site.docType = 'site';
        await ctx.stub.putState(site.meteringPointMrid, Buffer.from(JSON.stringify(site)));
        console.info(
            '============= END   : Create %s Site ===========',
            site.meteringPointMrid,
        );
    }

    public async querySite(ctx: Context, site: string): Promise<string> {
        console.info('============= START : Query %s Site ===========', site);
        const siteAsBytes = await ctx.stub.getState(site);
        if (!siteAsBytes || siteAsBytes.length === 0) {
            throw new Error(`${site} does not exist`);
        }
        console.info('============= END   : Query %s Site ===========');
        console.info(site, siteAsBytes.toString());
        return siteAsBytes.toString();
    }

    public async getSitesBySystemOperator(ctx: Context, systemOperatorMarketParticipantMrid: string): Promise<string> {
        const allResults = [];
        const query = `{"selector": {"docType": "site", "systemOperatorMarketParticipantMrid": "${systemOperatorMarketParticipantMrid}"}}`;
        const iterator = await ctx.stub.getQueryResult(query);
        let result = await iterator.next();
        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                record = strValue;
            }
            allResults.push(record);
            result = await iterator.next();
        }
        return JSON.stringify(allResults);
    }

    public async getSitesByProducer(ctx: Context, producerMarketParticipantMrid: string): Promise<string> {
        const allResults = [];
        const query = `{"selector": {"docType": "site", "producerMarketParticipantMrid": "${producerMarketParticipantMrid}"}}`;
        const iterator = await ctx.stub.getQueryResult(query);
        let result = await iterator.next();
        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                record = strValue;
            }
            allResults.push(record);
            result = await iterator.next();
        }
        return JSON.stringify(allResults);
    }

/*      Restitution View System Operator Market Participant      */

    // public async restitutionSystemOperaterMarketParticipant(ctx: Context): Promise<string> {
    //     const systemOperators = await SystemOperatorController.getAllSystemOperator(ctx);
    //     const producers = await ProducerController.getAllProducer(ctx);

    //     const restitutionView: ViewMarketParticipant = {
    //         producers : JSON.parse(producers),
    //         systemOperators : JSON.parse(systemOperators),
    //     };
    //     return JSON.stringify(restitutionView);
    // }
    public async ViewSystemOperaterMarketParticipant(
        ctx: Context) {
        try {
            return (await ViewMarketParticipantController.viewSystemOperaterMarketParticipant(ctx));
        } catch (error) {
            throw error;
        }
    }

    /*      Restitution View Producer Market Participant       */

    // public async restitutionProducerMarketParticipant(ctx: Context, prodId: string): Promise<string> {
    //     const systemOperators = await SystemOperatorController.getAllSystemOperator(ctx);
    //     const producers = await ProducerController.queryProducer(ctx, prodId);

    //     const restitutionView: ViewMarketParticipant = {
    //         producers : JSON.parse(producers),
    //         systemOperators : JSON.parse(systemOperators),
    //     };
    //     return JSON.stringify(restitutionView);
    // }
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
}
