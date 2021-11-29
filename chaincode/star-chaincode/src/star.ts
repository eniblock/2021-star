/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { Context, Contract } from 'fabric-contract-api';

import { OrganizationTypeMsp } from './enums/OrganizationTypeMsp';
import { Producer } from './producer';
import { ViewMarketParticipant } from './restitutionMarketParticipant';
import { Site } from './site';
import { SystemOperator } from './systemOperator';

export class Star extends Contract {

    // public async initLedger(ctx: Context) {
    //     console.info('============= START : Initialize Ledger ===========');
    //     // console.debug('Nothing to do');
    //     console.info('============= END   : Initialize Ledger ===========');
    // }

    /*      SystemOperator      */

    public async createSystemOperator(
        ctx: Context,
        systemOperaterMarketParticipantMrId: string,
        marketParticipantName: string,
        marketParticipantRoleType: string) {
        console.info(
            '============= START : Create %s System Operator Market Participant ===========',
            systemOperaterMarketParticipantMrId,
        );

        const identity = await ctx.stub.getMspID();
        if (identity !== OrganizationTypeMsp.RTE && identity !== OrganizationTypeMsp.ENEDIS) {
            throw new Error(`Organisition, ${identity} does not have write access`);
        }
        if (!identity.includes(marketParticipantName)) {
            throw new Error(`Organisition, ${identity} does not have write access for ${marketParticipantName}`);
        }

        const somp: SystemOperator = {
            docType: 'systemOperator',
            marketParticipantName,
            marketParticipantRoleType,
            systemOperaterMarketParticipantMrId, // PK
        };

        await ctx.stub.putState(systemOperaterMarketParticipantMrId, Buffer.from(JSON.stringify(somp)));
        console.info(
            '============= END   : Create %s System Operator Market Participant ===========',
            systemOperaterMarketParticipantMrId,
        );
    }

    public async querySystemOperator(ctx: Context, sompId: string): Promise<string> {
        console.info('============= START : Query %s System Operator Market Participant ===========', sompId);
        const sompAsBytes = await ctx.stub.getState(sompId);
        if (!sompAsBytes || sompAsBytes.length === 0) {
            throw new Error(`${sompId} does not exist`);
        }
        console.info('============= END   : Query %s System Operator Market Participant ===========');
        console.info(sompId, sompAsBytes.toString());
        return sompAsBytes.toString();
    }

    public async updateSystemOperator(
        ctx: Context,
        systemOperaterMarketParticipantMrId: string,
        marketParticipantName: string,
        marketParticipantRoleType: string) {

        console.info(
            '============= START : Update %s System Operator Market Participant ===========',
            systemOperaterMarketParticipantMrId,
        );

        const identity = await ctx.stub.getMspID();
        if (identity !== OrganizationTypeMsp.RTE && identity !== OrganizationTypeMsp.ENEDIS) {
            throw new Error(`Organisition, ${identity} does not have write access`);
        }
        if (!identity.includes(marketParticipantName)) {
            throw new Error(`Organisition, ${identity} does not have write access for ${marketParticipantName}`);
        }

        const sompAsBytes = await ctx.stub.getState(systemOperaterMarketParticipantMrId);
        if (!sompAsBytes || sompAsBytes.length === 0) {
            throw new Error(`${systemOperaterMarketParticipantMrId} does not exist`);
        }
        const somp: SystemOperator = {
            docType: 'systemOperator',
            marketParticipantName,
            marketParticipantRoleType,
            systemOperaterMarketParticipantMrId,
        };

        await ctx.stub.putState(systemOperaterMarketParticipantMrId, Buffer.from(JSON.stringify(somp)));
        console.info(
            '============= END : Update %s System Operator Market Participant ===========',
            systemOperaterMarketParticipantMrId,
        );
    }

    public async getAllSystemOperator(ctx: Context): Promise<string> {
        const allResults = [];
        // const iterator = await ctx.stub.getStateByRange('', '');
        const query = `{"selector": {"docType": "systemOperator"}}`;
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

    /*      SystemOperator      */

    public async createProducer(
        ctx: Context,
        producerMarketParticipantMrId: string,
        producerMarketParticipantName: string,
        producerMarketParticipantRoleType: string) {
        console.info(
            '============= START : Create %s Producer Market Participant ===========',
            producerMarketParticipantMrId,
        );

        const identity = await ctx.stub.getMspID();
        if (identity !== OrganizationTypeMsp.RTE && identity !== OrganizationTypeMsp.ENEDIS) {
            throw new Error(`Organisition, ${identity} does not have write access`);
        }

        const producer: Producer = {
            docType: 'producer',
            producerMarketParticipantMrId, // PK
            producerMarketParticipantName,
            producerMarketParticipantRoleType,
        };

        await ctx.stub.putState(producerMarketParticipantMrId, Buffer.from(JSON.stringify(producer)));
        console.info(
            '============= END   : Create %s Producer Market Participant ===========',
            producerMarketParticipantMrId,
        );
    }

    public async queryProducer(ctx: Context, prodId: string): Promise<string> {
        console.info('============= START : Query %s Producer Market Participant ===========', prodId);
        const prodAsBytes = await ctx.stub.getState(prodId);
        if (!prodAsBytes || prodAsBytes.length === 0) {
            throw new Error(`${prodId} does not exist`);
        }
        console.info('============= END   : Query %s Producer Market Participant ===========');
        console.info(prodId, prodAsBytes.toString());
        return prodAsBytes.toString();
    }

    public async updateProducer(
        ctx: Context,
        producerMarketParticipantMrId: string,
        producerMarketParticipantName: string,
        producerMarketParticipantRoleType: string) {

        console.info(
            '============= START : Update %s Producer Market Participant ===========',
            producerMarketParticipantMrId,
        );

        const identity = await ctx.stub.getMspID();
        if (identity !== OrganizationTypeMsp.RTE && identity !== OrganizationTypeMsp.ENEDIS) {
            throw new Error(`Organisition, ${identity} does not have write access`);
        }

        const prodAsBytes = await ctx.stub.getState(producerMarketParticipantMrId);
        if (!prodAsBytes || prodAsBytes.length === 0) {
            throw new Error(`${producerMarketParticipantMrId} does not exist`);
        }
        const prod: Producer = {
            docType: 'producer',
            producerMarketParticipantMrId, // PK
            producerMarketParticipantName,
            producerMarketParticipantRoleType,
        };

        await ctx.stub.putState(producerMarketParticipantMrId, Buffer.from(JSON.stringify(prod)));
        console.info(
            '============= END : Update %s Producer Market Participant ===========',
            producerMarketParticipantMrId,
        );
    }

    public async getAllProducer(ctx: Context): Promise<string> {
        const allResults = [];
        const query = `{"selector": {"docType": "producer"}}`;
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

    /*      Sites HTA/HTB       */

    public async createSite(
        ctx: Context,
        inputStr: string) {
        console.info(
            '============= START : Create %s Site ===========',
            inputStr,
        );
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

        const identity = await ctx.stub.getMspID();
        if (site.marketEvaluationPointMrid && site.schedulingEntityRegisteredResourceMrid) {
            if (identity !== OrganizationTypeMsp.RTE) {
                throw new Error(`Organisition, ${identity} does not have write access for HTB(HV) sites`);
            }
        } else {
            if (identity !== OrganizationTypeMsp.ENEDIS) {
                throw new Error(`Organisition, ${identity} does not have write access for HTA(MV) sites`);
            }
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

    public async getSites(ctx: Context, systemOperatorMarketParticipantMrid: string): Promise<string> {
        const allResults = [];
        const query = `{"selector": {"docType": "site", "systemOperatorMarketParticipantMrid": ${systemOperatorMarketParticipantMrid}}}`;
        console.log('query', query);
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

    public async restitutionSystemOperaterMarketParticipant(ctx: Context): Promise<string> {
        const systemOperators = await this.getAllSystemOperator(ctx);
        const producers = await this.getAllProducer(ctx);

        const restitutionView: ViewMarketParticipant = {
            producers : JSON.parse(producers),
            systemOperators : JSON.parse(systemOperators),
        };
        return JSON.stringify(restitutionView);
    }

    /*      Restitution View Producer Market Participant       */

    public async restitutionProducerMarketParticipant(ctx: Context, prodId: string): Promise<string> {
        const systemOperators = await this.getAllSystemOperator(ctx);
        const producers = await this.queryProducer(ctx, prodId);

        const restitutionView: ViewMarketParticipant = {
            producers : JSON.parse(producers),
            systemOperators : JSON.parse(systemOperators),
        };
        return JSON.stringify(restitutionView);
    }
}
