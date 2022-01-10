import { Context } from 'fabric-contract-api';
import { date } from 'yup/lib/locale';
import { OrganizationTypeMsp } from '../enums/OrganizationMspType';
import { EnergyAccount } from '../model/energyAccount';
import { Site } from '../model/site';
import { SystemOperator } from '../model/systemOperator';

export class EnergyAccountController {

    public static async createEnergyAccount(
        ctx: Context,
        inputStr: string) {
        console.info('============= START : Create EnergyAccount ===========');

        const identity = await ctx.stub.getMspID();
        if (identity !== OrganizationTypeMsp.RTE && identity !== OrganizationTypeMsp.ENEDIS) {
            throw new Error(`Organisation, ${identity} does not have write access for Energy Account.`);
        }

        let energyObj: EnergyAccount;
        try {
            energyObj = JSON.parse(inputStr);
        } catch (error) {
            throw new Error(`ERROR createEnergyAccount-> Input string NON-JSON value`);
        }

        const energyAccountInput = EnergyAccount.schema.validateSync(
            energyObj,
            {strict: true, abortEarly: false},
        );

        const siteAsBytes = await ctx.stub.getState(energyAccountInput.meteringPointMrid);
        if (!siteAsBytes || siteAsBytes.length === 0) {
            throw new Error(`Site : ${energyAccountInput.meteringPointMrid} does not exist for Energy Account ${energyAccountInput.energyAccountMarketDocumentMrid} creation.`);
        }

        let siteObj: Site;
        try {
            siteObj = JSON.parse(siteAsBytes.toString());
        } catch (error) {
            throw new Error(`ERROR createEnergyAccount getSite-> Input string NON-JSON value`);
        }

        const systemOperatorAsBytes = await ctx.stub.getState(energyAccountInput.senderMarketParticipantMrid);
        if (!systemOperatorAsBytes || systemOperatorAsBytes.length === 0) {
            throw new Error(
                `System Operator : ${energyAccountInput.senderMarketParticipantMrid} does not exist for Energy Account ${energyAccountInput.energyAccountMarketDocumentMrid} creation.`,
            );
        }

        let systemOperatorObj: SystemOperator;
        try {
            systemOperatorObj = JSON.parse(systemOperatorAsBytes.toString());
        } catch (error) {
            throw new Error(`ERROR createEnergyAccount getSystemOperator-> Input string NON-JSON value`);
        }
        if (!identity.toLowerCase().includes(systemOperatorObj.marketParticipantName.toLowerCase())) {
            throw new Error(
                `Energy Account, sender: ${identity} does not have write access for ${energyAccountInput.energyAccountMarketDocumentMrid} creation. (Wrong SystemOperator)`,
            );
        }

        if (siteObj.systemOperatorMarketParticipantMrid !== energyAccountInput.senderMarketParticipantMrid) {
            throw new Error(`Energy Account, sender: ${energyAccountInput.senderMarketParticipantMrid} does is not the same as site.systemOperator: ${siteObj.systemOperatorMarketParticipantMrid} in EnergyAccount creation.`);
        }

        energyAccountInput.docType = 'energyAccount';

        await ctx.stub.putState(
            energyAccountInput.energyAccountMarketDocumentMrid,
            Buffer.from(JSON.stringify(energyAccountInput)),
        );
        console.info(
            '============= END   : Create %s EnergyAccount ===========',
            energyAccountInput.energyAccountMarketDocumentMrid,
        );
    }

    public static async getEnergyAccountForSystemOperator(
            ctx: Context,
            meteringPointMrid: string,
            systemOperatorEicCode: string,
            startCreatedDateTime: string): Promise<string> {
        const allResults = [];
        const identity = await ctx.stub.getMspID();
        if (identity !== OrganizationTypeMsp.RTE && identity !== OrganizationTypeMsp.ENEDIS) {
            throw new Error(`Organisation, ${identity} does not have read access for Energy Account.`);
        }

        const dateUp = new Date(startCreatedDateTime);
        // console.log(meteringPointMrid);
        // console.log(startCreatedDateTime);
        // console.log('new date=', new Date('2021-10-21T23:59:50.999Z'));
        // console.log ('datesetmili=', dateUp.setUTCMilliseconds(0));
        // console.log ('datesetsec=', dateUp.setUTCSeconds(0));
        // console.log ('datesetmin=', dateUp.setUTCMinutes(0));
        // console.log ('datesethour=', dateUp.setUTCHours(0));
        // console.log ('datetmptime=', dateUp.getTime());

        dateUp.setUTCMilliseconds(0);
        dateUp.setUTCSeconds(0);
        dateUp.setUTCMinutes(0);
        dateUp.setUTCHours(0);
        // console.log('dateUp=', dateUp);
        // console.log('dateUp=', JSON.stringify(dateUp));
        const dateDown = new Date(dateUp.getTime() + 86399999);
        // console.log('dateDown=', dateDown);
        // console.log('dateDown=', JSON.stringify(dateDown));

        const systemOperatorAsBytes = await ctx.stub.getState(systemOperatorEicCode);
        if (!systemOperatorAsBytes || systemOperatorAsBytes.length === 0) {
            throw new Error(
                `System Operator : ${systemOperatorEicCode} does not exist for Energy Account read.`,
            );
        }

        let systemOperatorObj: SystemOperator;
        try {
            systemOperatorObj = JSON.parse(systemOperatorAsBytes.toString());
        } catch (error) {
            throw new Error(`ERROR createEnergyAccount getSystemOperator-> Input string NON-JSON value`);
        }
        if (!identity.toLowerCase().includes(systemOperatorObj.marketParticipantName.toLowerCase())) {
            throw new Error(
                `Energy Account, sender: ${identity} does not provide his own systemOperatorEicCode therefore he does not have read access.`,
            );
        }
        let query;
        if (identity === OrganizationTypeMsp.RTE) {
            query = `{
                "selector":
                {
                    "docType": "energyAccount",
                    "meteringPointMrid": "${meteringPointMrid}",
                    "createdDateTime": {
                        "$gte": ${JSON.stringify(dateUp)},
                        "$lte": ${JSON.stringify(dateDown)}
                    },
                    "sort": [{
                        "createdDateTime" : "desc"
                    }]
                }
            }`;
        } else {
            query = `{
                "selector":
                {
                    "docType": "energyAccount",
                    "meteringPointMrid": "${meteringPointMrid}",
                    "senderMarketParticipantMrid": "${systemOperatorEicCode}",
                    "createdDateTime": {
                        "$gte": ${JSON.stringify(dateUp)},
                        "$lte": ${JSON.stringify(dateDown)}
                    },
                    "sort": [{
                        "createdDateTime" : "desc"
                    }]
                }
            }`;
        }

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

/*
    public static async getEnergyAccountForProducer(
        ctx: Context,
        meteringPointMrid: string,
        producerEicCode: string,
        startCreatedDateTime: string): Promise<string> {
        const allResults = [];
        const identity = await ctx.stub.getMspID();
        // if (identity !== OrganizationTypeMsp.RTE && identity !== OrganizationTypeMsp.ENEDIS) {
        //     throw new Error(`Organisation, ${identity} does not have read access for Energy Account.`);
        // }

        const dateUp = new Date(startCreatedDateTime);
        // console.log(meteringPointMrid);
        // console.log(startCreatedDateTime);
        // console.log('new date=', new Date('2021-10-21T23:59:50.999Z'));
        // console.log ('datesetmili=', dateUp.setUTCMilliseconds(0));
        // console.log ('datesetsec=', dateUp.setUTCSeconds(0));
        // console.log ('datesetmin=', dateUp.setUTCMinutes(0));
        // console.log ('datesethour=', dateUp.setUTCHours(0));
        // console.log ('datetmptime=', dateUp.getTime());

        dateUp.setUTCMilliseconds(0);
        dateUp.setUTCSeconds(0);
        dateUp.setUTCMinutes(0);
        dateUp.setUTCHours(0);
        // console.log('dateUp=', dateUp);
        // console.log('dateUp=', JSON.stringify(dateUp));
        const dateDown = new Date(dateUp.getTime() + 86399999);
        // console.log('dateDown=', dateDown);
        // console.log('dateDown=', JSON.stringify(dateDown));

        const systemOperatorAsBytes = await ctx.stub.getState(producerEicCode);
        if (!systemOperatorAsBytes || systemOperatorAsBytes.length === 0) {
            throw new Error(
                `System Operator : ${producerEicCode} does not exist for Energy Account read.`,
            );
        }

        let systemOperatorObj: SystemOperator;
        try {
            systemOperatorObj = JSON.parse(systemOperatorAsBytes.toString());
        } catch (error) {
            throw new Error(`ERROR createEnergyAccount getSystemOperator-> Input string NON-JSON value`);
        }
        if (!identity.toLowerCase().includes(systemOperatorObj.marketParticipantName.toLowerCase())) {
            throw new Error(
                `Energy Account, sender:
                //  ${identity} does not provide his own producerEicCode therefore he does not have read access.`,
            );
        }
        let query;
        if (identity === OrganizationTypeMsp.PRODUCER) {
            query = `{
                "selector":
                {
                    "docType": "energyAccount",
                    "meteringPointMrid": "${meteringPointMrid}",
                    "createdDateTime": {
                        "$gte": ${JSON.stringify(dateUp)},
                        "$lte": ${JSON.stringify(dateDown)}
                    },
                    "sort": [{
                        "createdDateTime" : "desc"
                    }]
                }
            }`;
        } else {
            throw new Error(`Organisation, ${identity} does not have read access for Energy Account.`);
        }

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
*/
    // public static async getAllEnergyAccount(ctx: Context): Promise<string> {
    //     const allResults = [];
    //     const query = `{"selector": {"docType": "energyAccount"}}`;
    //     const identity = await ctx.stub.getMspID();
    //     if (identity !== OrganizationTypeMsp.RTE && identity !== OrganizationTypeMsp.ENEDIS) {
    //         throw new Error(`Organisation, ${identity} does not have read access for Energy Account.`);
    //     }

    //     const iterator = await ctx.stub.getQueryResult(query);
    //     let result = await iterator.next();
    //     while (!result.done) {
    //         const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
    //         let record;
    //         try {
    //             record = JSON.parse(strValue);
    //         } catch (err) {
    //             record = strValue;
    //         }
    //         allResults.push(record);
    //         result = await iterator.next();
    //     }
    //     return JSON.stringify(allResults);
    // }
}
