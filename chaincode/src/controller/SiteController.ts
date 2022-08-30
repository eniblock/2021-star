import { OrganizationTypeMsp } from '../enums/OrganizationMspType';
import { ParametersType } from '../enums/ParametersType';

import { STARParameters } from '../model/starParameters';
import { Site } from '../model/site';
import { Producer } from '../model/producer';
import { DataReference } from '../model/dataReference';

import { SiteService } from './service/SiteService';
import { SystemOperatorService } from './service/SystemOperatorService';
import { ProducerService } from './service/ProducerService';
import { StarDataService } from './service/StarDataService';
import { DocType } from '../enums/DocType';
import { StarPrivateDataService } from './service/StarPrivateDataService';
import { IdArgument } from '../model/arguments/idArgument';

export class SiteController {
    public static async createSite(
        params: STARParameters,
        inputStr: string): Promise<void> {

        const siteObj: Site = Site.formatString(inputStr);
        await this.createSiteObj(params, siteObj);
    }

    public static async createSiteByReference(
        params: STARParameters,
        dataReference: DataReference): Promise<void> {

        await this.createSiteObj(params, dataReference.data, dataReference.collection);
    }



    public static async createSiteObj(
        params: STARParameters,
        siteObj: any,
        target: string = ''): Promise<void> {
        console.debug('============= START : createSiteObj Site ===========');

        Site.schema.validateSync(
            siteObj,
            {strict: true, abortEarly: false},
        );

        const identity = params.values.get(ParametersType.IDENTITY);
        if (siteObj.marketEvaluationPointMrid && siteObj.schedulingEntityRegisteredResourceMrid) {
            if (identity !== OrganizationTypeMsp.RTE) {
                throw new Error(`Organisation, ${identity} does not have write access for HTB(HV) sites`);
            }
        } else if (!siteObj.marketEvaluationPointMrid && !siteObj.schedulingEntityRegisteredResourceMrid) {
            if (identity !== OrganizationTypeMsp.ENEDIS) {
                throw new Error(`Organisation, ${identity} does not have write access for HTA(MV) sites`);
            }
        } else {
            throw new Error(`marketEvaluationPointMrid and schedulingEntityRegisteredResourceMrid must be both present for HTB site or absent for HTA site.`);
        }
        try {
            await StarDataService.getObj(params, {id:siteObj.systemOperatorMarketParticipantMrid, docType: DocType.SYSTEM_OPERATOR});
        } catch(error) {
            throw new Error(error.message.concat(' for site creation'));
        }

        let producerObj : Producer;
        try {
            producerObj = await StarDataService.getObj(params, {id: siteObj.producerMarketParticipantMrid, docType: DocType.PRODUCER});
        } catch(error) {
            throw new Error(error.message.concat(' for site creation'));
        }

        siteObj.producerMarketParticipantName = producerObj.producerMarketParticipantName;

        await SiteService.write(params, siteObj, target);
        console.debug('============= END   : createSiteObj %s Site ===========',
            siteObj.meteringPointMrid,
        );
    }





    public static async updateSite(
        params: STARParameters,
        inputStr: string): Promise<void> {

        let siteObj: Site;
        try {
            siteObj = JSON.parse(inputStr);
        } catch (error) {
            throw new Error(`ERROR updateSite-> Input string NON-JSON value`);
        }
        Site.schema.validateSync(
            siteObj,
            {strict: true, abortEarly: false},
        );
        const identity = params.values.get(ParametersType.IDENTITY);
        if (siteObj.marketEvaluationPointMrid && siteObj.schedulingEntityRegisteredResourceMrid) {
            if (identity !== OrganizationTypeMsp.RTE) {
                throw new Error(`Organisation, ${identity} does not have write access for HTB(HV) sites`);
            }
        } else if (!siteObj.marketEvaluationPointMrid && !siteObj.schedulingEntityRegisteredResourceMrid) {
            if (identity !== OrganizationTypeMsp.ENEDIS) {
                throw new Error(`Organisation, ${identity} does not have write access for HTA(MV) sites`);
            }
        } else {
            throw new Error(`marketEvaluationPointMrid and schedulingEntityRegisteredResourceMrid must be both present for HTB site or absent for HTA site.`);
        }

        var existingSitesRef:Map<string, DataReference>;
        try {
            existingSitesRef = await StarPrivateDataService.getObjRefbyId(params, {docType: DocType.SITE, id: siteObj.meteringPointMrid});
        } catch(error) {
            throw new Error(error.message.concat(' for site update'));
        }

        try {
            await StarDataService.getObj(params, {id: siteObj.systemOperatorMarketParticipantMrid, docType: DocType.SYSTEM_OPERATOR});
        } catch(error) {
            throw new Error(error.message.concat(' for site update'));
        }

        try {
            await StarDataService.getObj(params, {id: siteObj.producerMarketParticipantMrid, docType: DocType.PRODUCER});
        } catch(error) {
            throw new Error(error.message.concat(' for site update'));
        }

        for (var [key, ] of existingSitesRef) {
            await SiteService.write(params, siteObj, key);
        }

        console.debug('============= END : Update %s Site ===========',
            siteObj.meteringPointMrid,
        );
    }




    public static async querySite(
        params: STARParameters,
        siteId: string): Promise<string> {

        console.debug('============= START : Query %s Site ===========', siteId);
        const result:Map<string, DataReference> = await StarPrivateDataService.getObjRefbyId(params, {docType: DocType.SITE, id: siteId});
        const dataReference = result.values().next().value;

        console.debug(siteId, JSON.stringify(dataReference.data));
        console.debug('============= END   : Query %s Site ===========', siteId);
        return JSON.stringify(dataReference.data);
    }




    public static async siteExists(
        params: STARParameters,
        siteId: string): Promise<boolean> {

        console.debug('============= START : Query %s Site ===========', siteId);
        const result:Map<string, DataReference> = await StarPrivateDataService.getObjRefbyId(params, {docType: DocType.SITE, id: siteId});
        return result && result.values().next().value && result.values().next().value.data && result.values().next().value.collection.length !== 0;
    }



    public static async getSiteById(
        params: STARParameters,
        arg: IdArgument): Promise<Site> {

        let siteObj: Site;
        arg.docType = DocType.SITE;
        if (arg.collection && arg.collection.length > 0) {
            siteObj = await StarPrivateDataService.getObj(params, arg);
        } else {
            const result:Map<string, DataReference> = await StarPrivateDataService.getObjRefbyId(params, arg);
            const dataReference = result.values().next().value;
            if (dataReference && dataReference.data) {
                siteObj = dataReference.data;
            }
        }

        return siteObj;
    }




    public static async getSitesBySystemOperator(
        params: STARParameters,
        systemOperatorMarketParticipantMrid: string): Promise<string> {

        const query = `{"selector": {"docType": "site", "systemOperatorMarketParticipantMrid": "${systemOperatorMarketParticipantMrid}"}}`;
        const allResults = await SiteService.getQueryStringResult(params, query);

        return allResults;
    }




    public static async getSitesByProducer(
        params: STARParameters,
        producerMarketParticipantMrid: string): Promise<string> {

        const query = `{"selector": {"docType": "site", "producerMarketParticipantMrid": "${producerMarketParticipantMrid}"}}`;
        const allResults = await SiteService.getQueryStringResult(params, query);

        return allResults;
    }




    public static async getSitesByQuery(
        params: STARParameters,
        query: string): Promise<any> {

        //Implementaition calling QueryResult (without Pagination)
        // const iterator = await SiteService.getQueryResult(query);
        // let results = await this.getAllResults(iterator);

        let results = await SiteService.getQueryArrayResult(params, query);

        return results;
    }


    // static async getAllResults(iterator: Iterators.StateQueryIterator): Promise<any[]> {
    //     const allResults = [];
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
    //     return allResults;
    // }
}
