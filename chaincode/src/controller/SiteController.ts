import { Context } from 'fabric-contract-api';

import { OrganizationTypeMsp } from '../enums/OrganizationMspType';
import { ParametersType } from '../enums/ParametersType';

import { STARParameters } from '../model/starParameters';
import { Site } from '../model/site';

import { SiteService } from './service/SiteService';
import { SystemOperatorService } from './service/SystemOperatorService';
import { ProducerService } from './service/ProducerService';
import { Producer } from '../model/producer';
import { DataReference } from '../model/dataReference';
import { ActivationDocumentService } from './service/ActivationDocumentService';
import { HLFServices } from './service/HLFservice';

export class SiteController {
    public static async createSite(
        ctx: Context,
        params: STARParameters,
        inputStr: string): Promise<void> {

        const siteObj: Site = Site.formatString(inputStr);
        await this.createSiteObj(ctx, params, siteObj);
    }

    public static async createSiteByReference(
        ctx: Context,
        params: STARParameters,
        dataReference: DataReference): Promise<void> {

        await this.createSiteObj(ctx, params, dataReference.data, dataReference.collection);
    }



    public static async createSiteObj(
        ctx: Context,
        params: STARParameters,
        siteObj: any,
        target: string = ''): Promise<void> {
        console.info('============= START : createSiteObj Site ===========');

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
            await SystemOperatorService.getRaw(ctx, siteObj.systemOperatorMarketParticipantMrid);
        } catch(error) {
            throw new Error(error.message.concat(' for site creation'));
        }

        let producerObj : Producer;
        try {
            producerObj = await ProducerService.getObj(ctx, siteObj.producerMarketParticipantMrid);
        } catch(error) {
            throw new Error(error.message.concat(' for site creation'));
        }

        siteObj.producerMarketParticipantName = producerObj.producerMarketParticipantName;

        await SiteService.write(ctx, params, siteObj, target);
        console.info('============= END   : createSiteObj %s Site ===========',
            siteObj.meteringPointMrid,
        );
    }





    public static async updateSite(
        ctx: Context,
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
            existingSitesRef = await SiteService.getObjRefbyId(ctx, params, siteObj.meteringPointMrid);
        } catch(error) {
            throw new Error(error.message.concat(' for site update'));
        }

        try {
            await SystemOperatorService.getRaw(ctx, siteObj.systemOperatorMarketParticipantMrid);
        } catch(error) {
            throw new Error(error.message.concat(' for site update'));
        }

        try {
            await ProducerService.getRaw(ctx, siteObj.producerMarketParticipantMrid);
        } catch(error) {
            throw new Error(error.message.concat(' for site update'));
        }

        for (var [key, ] of existingSitesRef) {
            await SiteService.write(ctx, params, siteObj, key);
        }

        console.info('============= END : Update %s Site ===========',
            siteObj.meteringPointMrid,
        );
    }




    public static async querySite(
        ctx: Context,
        params: STARParameters,
        siteId: string): Promise<string> {

        console.info('============= START : Query %s Site ===========', siteId);
        const result:Map<string, DataReference> = await SiteService.getObjRefbyId(ctx, params, siteId);
        const dataReference = result.values().next().value;

        console.debug(siteId, JSON.stringify(dataReference.data));
        console.info('============= END   : Query %s Site ===========', siteId);
        return JSON.stringify(dataReference.data);
    }




    public static async siteExists(
        ctx: Context,
        params: STARParameters,
        siteId: string): Promise<boolean> {

        console.info('============= START : Query %s Site ===========', siteId);
        const result:Map<string, DataReference> = await SiteService.getObjRefbyId(ctx, params, siteId);
        return result && result.values().next().value && result.values().next().value.data && result.values().next().value.collection.length !== 0;
    }



    public static async getSiteById(
        ctx: Context,
        params: STARParameters,
        id: string,
        target: string = ''): Promise<Site> {

        let siteObj: Site;
        if (target && target.length > 0) {
            siteObj = await SiteService.getObj(ctx, params, id, target);
        } else {
            const result:Map<string, DataReference> = await SiteService.getObjRefbyId(ctx, params, id);
            const dataReference = result.values().next().value;
            if (dataReference && dataReference.data) {
                siteObj = dataReference.data;
            }
        }

        return siteObj;
    }




    public static async getSitesBySystemOperator(
        ctx: Context,
        params: STARParameters,
        systemOperatorMarketParticipantMrid: string): Promise<string> {

        const query = `{"selector": {"docType": "site", "systemOperatorMarketParticipantMrid": "${systemOperatorMarketParticipantMrid}"}}`;
        const allResults = await SiteService.getQueryStringResult(ctx, params, query);

        return allResults;
    }




    public static async getSitesByProducer(
        ctx: Context,
        params: STARParameters,
        producerMarketParticipantMrid: string): Promise<string> {

        const query = `{"selector": {"docType": "site", "producerMarketParticipantMrid": "${producerMarketParticipantMrid}"}}`;
        const allResults = await SiteService.getQueryStringResult(ctx, params, query);

        return allResults;
    }




    public static async getSitesByQuery(
        ctx: Context,
        params: STARParameters,
        query: string): Promise<any> {

        //Implementaition calling QueryResult (without Pagination)
        // const iterator = await SiteService.getQueryResult(ctx, query);
        // let results = await this.getAllResults(iterator);

        const collections: string[] = await HLFServices.getCollectionsFromParameters(params, ParametersType.DATA_TARGET, ParametersType.ALL);

        console.info("############################################")
        for (var collection of collections) {
            console.info("--------------")
            console.info(collection)
            console.info("--------------")
            console.info("delete 0754217c-f0e5-4c23-823d-0533e391245b")
            await ActivationDocumentService.delete(ctx, params, "0754217c-f0e5-4c23-823d-0533e391245b", collection);
            console.info("END delete 0754217c-f0e5-4c23-823d-0533e391245b")
            await ActivationDocumentService.delete(ctx, params, "0d818433-6095-4acf-b032-e4b6b8550c93", collection);
            await ActivationDocumentService.delete(ctx, params, "16e6fb68-3c50-4ccc-8d97-2344eebcefe4", collection);
            await ActivationDocumentService.delete(ctx, params, "1d454690-4a51-4086-8314-d05a15aa544a", collection);
            await ActivationDocumentService.delete(ctx, params, "3b29a075-01e4-4786-88ab-5fd1c9830149", collection);
            await ActivationDocumentService.delete(ctx, params, "4c845adb-4ce7-4803-92e5-32d54535f5a8", collection);
            await ActivationDocumentService.delete(ctx, params, "5939d00e-9573-4323-80c9-880890c5212f", collection);
            await ActivationDocumentService.delete(ctx, params, "6162e519-4984-48fc-941e-00c3b617b84e", collection);
            await ActivationDocumentService.delete(ctx, params, "6835717f-87bd-41c9-9401-d259b61149a4", collection);
            await ActivationDocumentService.delete(ctx, params, "77478df5-13df-43be-bc12-53077b7c92da", collection);
            await ActivationDocumentService.delete(ctx, params, "9042c66c-b748-4e77-bf18-3a53fdf5a484", collection);
            await ActivationDocumentService.delete(ctx, params, "9175a598-2dfe-4079-b37c-84572bf27709", collection);
            await ActivationDocumentService.delete(ctx, params, "9ed75fb2-4430-488c-a772-ef036833cab0", collection);
            await ActivationDocumentService.delete(ctx, params, "a66eacd0-91fa-4b97-b5c3-d59fe1268a24", collection);
            await ActivationDocumentService.delete(ctx, params, "b50056fa-3ca3-4a36-8a3d-2380f4084316", collection);
            await ActivationDocumentService.delete(ctx, params, "c19b0bdf-39ce-4284-8965-c995aec00857", collection);
            await ActivationDocumentService.delete(ctx, params, "c7613779-70b5-43c7-ba6c-66c3f5b4a1a8", collection);
            await ActivationDocumentService.delete(ctx, params, "cdd32d1a-3ce4-4ce1-83f1-355eb674cca2", collection);
            await ActivationDocumentService.delete(ctx, params, "d0c4d05c-3e2c-4f7c-acc0-fa740f156822", collection);
            await ActivationDocumentService.delete(ctx, params, "d5af2077-5b75-423c-95bd-bd0795918aa6", collection);
            await ActivationDocumentService.delete(ctx, params, "d635223f-0a16-4645-a6a0-2b3da7863ff2", collection);
            await ActivationDocumentService.delete(ctx, params, "ea7edef5-cf12-4234-9972-45b1a18e4668", collection);
            await ActivationDocumentService.delete(ctx, params, "f11ec379-dc02-49b1-9c77-394b6eca1dc3", collection);
            await ActivationDocumentService.delete(ctx, params, "f1253bf4-bca8-43bc-9147-51bcc3c458a9", collection);
            await ActivationDocumentService.delete(ctx, params, "f1a14684-23e5-4529-93a5-35909a3e84fd", collection);
            await ActivationDocumentService.delete(ctx, params, "fdbfc324-1756-4165-a03d-2a9c421ee1c2", collection);
            await ActivationDocumentService.delete(ctx, params, "205033fe-0004-46e9-838e-d71fb54439fc", collection);
            await ActivationDocumentService.delete(ctx, params, "4958b8c2-857f-4ba2-949c-8e79f8533adc", collection);
            await ActivationDocumentService.delete(ctx, params, "c4dd6569-5e3b-4e3d-b47a-f6880d6d72d9", collection);
        }
        console.info("############################################")


        // let results = await SiteService.getQueryArrayResult(ctx, params, query);

        // return results;
        return "";
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
