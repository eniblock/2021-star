import { Context } from 'fabric-contract-api';
import { OrganizationTypeMsp } from '../enums/OrganizationMspType';
import { ActivationDocument } from '../model/activationDocument';
import { EnergyAmount } from '../model/energyAmount';
import { Site } from '../model/site';
import { SystemOperator } from '../model/systemOperator';

export class EnergyAmountController {

    public static async createTSOEnergyAmount(
        ctx: Context,
        inputStr: string) {
        console.info('============= START : Create EnergyAmount ===========');

        const identity = await ctx.stub.getMspID();
        if (identity !== OrganizationTypeMsp.RTE) {
            throw new Error(`Organisation, ${identity} does not have write access for Energy Amount.`);
        }

        let energyObj: EnergyAmount;
        try {
            energyObj = JSON.parse(inputStr);
        } catch (error) {
            throw new Error(`ERROR createTSOEnergyAmount-> Input string NON-JSON value`);
        }

        const energyAmountInput = EnergyAmount.schema.validateSync(
            energyObj,
            {strict: true, abortEarly: false},
        );

        const orderAsBytes = await ctx.stub.getState(energyAmountInput.activationDocumentMrid);
        if (!orderAsBytes || orderAsBytes.length === 0) {
            throw new Error(`ActivationDocument : ${energyAmountInput.activationDocumentMrid} does not exist for Energy Amount ${energyAmountInput.energyAmountMarketDocumentMrid} creation.`);
        }

        let orderObj: ActivationDocument;
        try {
            orderObj = JSON.parse(orderAsBytes.toString());
        } catch (error) {
            throw new Error(`ERROR createTSOEnergyAmount getActivationDocument-> Input string NON-JSON value`);
        }

        const siteAsBytes = await ctx.stub.getState(orderObj.registeredResourceMrid);
        if (!siteAsBytes || siteAsBytes.length === 0) {
            throw new Error(`Site : ${orderObj.registeredResourceMrid} does not exist in Activation Document : ${energyAmountInput.activationDocumentMrid} for Energy Amount : ${energyAmountInput.energyAmountMarketDocumentMrid} creation.`);
        }

        let siteObj: Site;
        try {
            siteObj = JSON.parse(siteAsBytes.toString());
        } catch (error) {
            throw new Error(`ERROR createTSOEnergyAmount getSite-> Input string NON-JSON value`);
        }

        if (orderObj.registeredResourceMrid !== energyAmountInput.registeredResourceMrid) {
            throw new Error(`ERROR createTSOEnergyAmount mismatch beetween registeredResourceMrid in Activation Document : ${orderObj.registeredResourceMrid} and Energy Amount : ${energyAmountInput.registeredResourceMrid}.`);
        }
        // console.log('energyAmountInput.timeInterval=', energyAmountInput.timeInterval);
        const strSplitted = energyAmountInput.timeInterval.split('/', 2);
        const begin = strSplitted[0];
        const end = strSplitted[1];
        // console.log('strSplitted=', strSplitted);

        const dateBegin = new Date(begin.trim());
        // console.log('dateBegin=', dateBegin);
        dateBegin.setUTCMilliseconds(0);
        dateBegin.setUTCSeconds(0);
        dateBegin.setUTCMinutes(0);
        dateBegin.setUTCHours(0);

        // console.log('dateBegin=', dateBegin);

        const dateEnd = new Date(end.trim());
        // console.log('dateEnd=', dateEnd);
        dateEnd.setUTCMilliseconds(0);
        dateEnd.setUTCSeconds(0);
        dateEnd.setUTCMinutes(0);
        dateEnd.setUTCHours(0);

        // console.log('dateEnd=', dateEnd);

        const orderDateStart = new Date(orderObj.startCreatedDateTime);
        orderDateStart.setUTCMilliseconds(0);
        orderDateStart.setUTCSeconds(0);
        orderDateStart.setUTCMinutes(0);
        orderDateStart.setUTCHours(0);
        // console.log('orderDateStart=', orderDateStart);

        // console.log(JSON.stringify(dateBegin));
        // console.log(JSON.stringify(dateEnd));
        if (JSON.stringify(dateBegin) !== JSON.stringify(dateEnd)) {
            throw new Error(`ERROR createTSOEnergyAmount mismatch in timeInterval both date must be the same day.(${JSON.stringify(dateBegin)} vs ${JSON.stringify(dateEnd)})`);
        } else if (JSON.stringify(dateBegin) !== JSON.stringify(orderDateStart)) {
            throw new Error(`ERROR createTSOEnergyAmount mismatch between ENE : ${JSON.stringify(dateBegin)} and Activation Document : ${JSON.stringify(orderDateStart)} dates.`);
        }

        energyAmountInput.docType = 'energyAmount';

        await ctx.stub.putState(
            energyAmountInput.energyAmountMarketDocumentMrid,
            Buffer.from(JSON.stringify(energyAmountInput)),
        );
        console.info(
            '============= END   : Create %s EnergyAmount ===========',
            energyAmountInput.energyAmountMarketDocumentMrid,
        );
    }

    public static async createDSOEnergyAmount(
        ctx: Context,
        inputStr: string) {
        console.info('============= START : Create EnergyAmount ===========');

        const identity = await ctx.stub.getMspID();
        if (identity !== OrganizationTypeMsp.ENEDIS) {
            throw new Error(`Organisation, ${identity} does not have write access for Energy Amount.`);
        }

        let energyObj: EnergyAmount;
        try {
            energyObj = JSON.parse(inputStr);
        } catch (error) {
            throw new Error(`ERROR createDSOEnergyAmount-> Input string NON-JSON value`);
        }

        const energyAmountInput = EnergyAmount.schema.validateSync(
            energyObj,
            {strict: true, abortEarly: false},
        );

        const keySplitted = energyAmountInput.activationDocumentMrid.split('/', 4);
        console.log(keySplitted);

        const query = `{
            "selector":
            {
                "docType": "activationDocument",
                "originAutomationRegisteredResourceMrid": "${keySplitted[0]}",
                "registeredResourceMrid": "${keySplitted[1]}",
                "startCreatedDateTime": "${keySplitted[2]}",
                "endCreatedDateTime": "${keySplitted[3]}"
            }
        }`;
        console.log(query);
        const iterator = await ctx.stub.getQueryResult(query);
        // if (Object.keys(iterator).length === 0) {
        //     throw new Error(`ERROR createDSOEnergyAmount : no results for get activationDocument`);
        // }
        const allResults = [];
        let result = await iterator.next();
        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            let record;
            // try {
            record = JSON.parse(strValue);
            // } catch (err) {
            //     // record = strValue;
            //     continue;
            // }
            allResults.push(record);
            result = await iterator.next();
        }
        if (allResults.length === 0) {
            throw new Error(`ERROR createDSOEnergyAmount : no results for get activationDocument`);
        }
        console.log(allResults);

        let orderObj: ActivationDocument;
        orderObj = allResults[0];
/*
        // const orderAsBytes = await ctx.stub.getState(energyAmountInput.activationDocumentMrid);
        // if (!orderAsBytes || orderAsBytes.length === 0) {
        //     throw new Error(`
        // ActivationDocument :
        ${energyAmountInput.activationDocumentMrid} does not exist for Energy Amount
        ${energyAmountInput.energyAmountMarketDocumentMrid} creation.`);
        // }

        // let orderObj: ActivationDocument;
        // try {
        //     orderObj = JSON.parse(orderAsBytes.toString());
        // } catch (error) {
        //     throw new Error(`ERROR createDSOEnergyAmount getActivationDocument-> Input string NON-JSON value`);
        // }

        // const siteAsBytes = await ctx.stub.getState(orderObj.registeredResourceMrid);
        // if (!siteAsBytes || siteAsBytes.length === 0) {
        //     throw new Error(`
        // Site : ${orderObj.registeredResourceMrid}
        does not exist in Activation Document :
        ${energyAmountInput.activationDocumentMrid}
        for Energy Amount : ${energyAmountInput.energyAmountMarketDocumentMrid} creation.`);
        // }

        // let siteObj: Site;
        // try {
        //     siteObj = JSON.parse(siteAsBytes.toString());
        // } catch (error) {
        //     throw new Error(`ERROR createDSOEnergyAmount getSite-> Input string NON-JSON value`);
        // }

        // if (orderObj.registeredResourceMrid !== energyAmountInput.registeredResourceMrid) {
        //     throw new Error(
            // `ERROR createDSOEnergyAmount mismatch beetween
            registeredResourceMrid in Activation Document :
            ${orderObj.registeredResourceMrid} and Energy Amount :
            ${energyAmountInput.registeredResourceMrid}.`);
        // }
  */
        // console.log('energyAmountInput.timeInterval=', energyAmountInput.timeInterval);
        const strSplitted = energyAmountInput.timeInterval.split('/', 2);
        const begin = strSplitted[0];
        const end = strSplitted[1];
        // console.log('strSplitted=', strSplitted);

        const dateBegin = new Date(begin.trim());
        // console.log('dateBegin=', dateBegin);
        dateBegin.setUTCMilliseconds(0);
        dateBegin.setUTCSeconds(0);
        dateBegin.setUTCMinutes(0);
        dateBegin.setUTCHours(0);

        // console.log('dateBegin=', dateBegin);

        const dateEnd = new Date(end.trim());
        // console.log('dateEnd=', dateEnd);
        dateEnd.setUTCMilliseconds(0);
        dateEnd.setUTCSeconds(0);
        dateEnd.setUTCMinutes(0);
        dateEnd.setUTCHours(0);

        // console.log('dateEnd=', dateEnd);

        const orderDateStart = new Date(orderObj.startCreatedDateTime);
        orderDateStart.setUTCMilliseconds(0);
        orderDateStart.setUTCSeconds(0);
        orderDateStart.setUTCMinutes(0);
        orderDateStart.setUTCHours(0);
        console.log('orderDateStart=', orderDateStart);

        console.log(JSON.stringify(dateBegin));
        console.log(JSON.stringify(dateEnd));
        if (JSON.stringify(dateBegin) !== JSON.stringify(dateEnd)) {
            throw new Error(`ERROR createDSOEnergyAmount mismatch in timeInterval both date must be the same day.(${JSON.stringify(dateBegin)} vs ${JSON.stringify(dateEnd)})`);
        } else if (JSON.stringify(dateBegin) !== JSON.stringify(orderDateStart)) {
            throw new Error(`ERROR createDSOEnergyAmount mismatch between ENI : ${JSON.stringify(dateBegin)} and Activation Document : ${JSON.stringify(orderDateStart)} dates.`);
        }

        energyAmountInput.docType = 'energyAmount';

        await ctx.stub.putState(
            energyAmountInput.energyAmountMarketDocumentMrid,
            Buffer.from(JSON.stringify(energyAmountInput)),
        );
        console.info(
            '============= END   : Create %s EnergyAmount ===========',
            energyAmountInput.energyAmountMarketDocumentMrid,
        );
    }

    public static async getEnergyAmountForSystemOperator(
            ctx: Context,
            registeredResourceMrid: string,
            systemOperatorEicCode: string,
            startCreatedDateTime: string): Promise<string> {
        const allResults = [];
        const identity = await ctx.stub.getMspID();
        if (identity !== OrganizationTypeMsp.RTE && identity !== OrganizationTypeMsp.ENEDIS) {
            throw new Error(`Organisation, ${identity} does not have read access for Energy Amount.`);
        }

        const dateUp = new Date(startCreatedDateTime);

        dateUp.setUTCMilliseconds(0);
        dateUp.setUTCSeconds(0);
        dateUp.setUTCMinutes(0);
        dateUp.setUTCHours(0);
        const dateDown = new Date(dateUp.getTime() + 86399999);

        const systemOperatorAsBytes = await ctx.stub.getState(systemOperatorEicCode);
        if (!systemOperatorAsBytes || systemOperatorAsBytes.length === 0) {
            throw new Error(
                `System Operator : ${systemOperatorEicCode} does not exist for Energy Amount read.`,
            );
        }

        let systemOperatorObj: SystemOperator;
        try {
            systemOperatorObj = JSON.parse(systemOperatorAsBytes.toString());
        } catch (error) {
            throw new Error(`ERROR createTSOEnergyAmount getSystemOperator-> Input string NON-JSON value`);
        }
        if (!identity.toLowerCase().includes(systemOperatorObj.systemOperatorMarketParticipantName.toLowerCase())) {
            throw new Error(
                `Energy Amount, sender: ${identity} does not provide his own systemOperatorEicCode therefore he does not have read access.`,
            );
        }
        const query = `{
            "selector":
            {
                "docType": "energyAmount",
                "registeredResourceMrid": "${registeredResourceMrid}",
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

    public static async getEnergyAmountByProducer(
        ctx: Context,
        registeredResourceMrid: string,
        producerEicCode: string,
        startCreatedDateTime: string): Promise<string> {
        const allResults = [];
        const identity = await ctx.stub.getMspID();
        if (identity !== OrganizationTypeMsp.PRODUCER) {
            throw new Error(`Organisation, ${identity} does not have read access for producer's Energy Amount.`);
        }
        const dateUp = new Date(startCreatedDateTime);
        dateUp.setUTCMilliseconds(0);
        dateUp.setUTCSeconds(0);
        dateUp.setUTCMinutes(0);
        dateUp.setUTCHours(0);

        const dateDown = new Date(dateUp.getTime() + 86399999);

        const query = `{
                "selector":
                {
                    "docType": "energyAmount",
                    "registeredResourceMrid": "${registeredResourceMrid}",
                    "receiverMarketParticipantMrid": "${producerEicCode}",
                    "createdDateTime": {
                        "$gte": ${JSON.stringify(dateUp)},
                        "$lte": ${JSON.stringify(dateDown)}
                    },
                    "sort": [{
                        "createdDateTime" : "desc"
                    }]
                }
            }`;

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

    public static async getEnergyAmountByQuery(
        ctx: Context,
        query: string, pageSize: number, bookmark: string): Promise<any> {
        const identity = await ctx.stub.getMspID();
        if (identity !== OrganizationTypeMsp.RTE && identity !== OrganizationTypeMsp.ENEDIS) {
            throw new Error(`Organisation, ${identity} does not have read access for Energy Amount.`);
        }
        let response = await ctx.stub.getQueryResultWithPagination(query, pageSize, bookmark);
        const {iterator, metadata} = response;
        let results = await this.getAllResults(iterator);
        const res = {
            records:             results,
            fetchedRecordsCount: metadata.fetchedRecordsCount,
            bookmark:            metadata.bookmark
        }
        return res;
    }

    static async getAllResults(iterator) {
        const allResults = [];
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
        return allResults;
    }
}
