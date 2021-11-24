/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { Context, Contract } from 'fabric-contract-api';

import { OrganizationTypeMsp } from './enums/OrganizationTypeMsp';
import { SystemOperator } from './systemOperator';

export class Star extends Contract {

    public async initLedger(ctx: Context) {
        console.info('============= START : Initialize Ledger ===========');
        // console.debug('Nothing to do');
        console.info('============= END   : Initialize Ledger ===========');
    }

    public async querySystemOperatorMarketParticipant(ctx: Context, sompId: string): Promise<string> {
        console.info('============= START : Query %s System Operator Market Participant ===========', sompId);
        const sompAsBytes = await ctx.stub.getState(sompId);
        if (!sompAsBytes || sompAsBytes.length === 0) {
            throw new Error(`${sompId} does not exist`);
        }
        console.info('============= END   : Query %s System Operator Market Participant ===========');
        console.info(sompId, sompAsBytes.toString());
        return sompAsBytes.toString();
    }

    public async createSystemOperatorMarketParticipant(
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
            docType: 'systemOperatorMarketParticipant',
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

    public async updateSystemOperatorMarketParticipant(
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
            docType: 'systemOperatorMarketParticipant',
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
}
