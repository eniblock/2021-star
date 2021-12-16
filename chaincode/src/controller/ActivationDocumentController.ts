import { strict } from 'assert';
import { Context, Contract } from 'fabric-contract-api';
import { MeasurementUnitType } from '../enums/MesurementUnitType';
import { OrganizationTypeMsp } from '../enums/OrganizationMspType';
import { ActivationDocument } from '../model/activationDocument';
import { SystemOperator } from '../systemOperator';

export class ActivationDocumentController {

    public static async createActivationDocument(
        ctx: Context,
        inputStr: string) {
        console.info('============= START : Create ActivationDocument ===========');

        const identity = await ctx.stub.getMspID();
        if (identity !== OrganizationTypeMsp.RTE && identity !== OrganizationTypeMsp.ENEDIS) {
            throw new Error(`Organisation, ${identity} does not have write access for Activation Document`);
        }

        let order: ActivationDocument;
        try {
            order = JSON.parse(inputStr);
          } catch (error) {
            // console.error('error=', error);
            throw new Error(`ERROR createActivationDocument-> Input string NON-JSON value`);
          }

        const activationDocumentInput = ActivationDocument.schema.validateSync(
            order,
            {strict: true, abortEarly: false},
        );

        if (identity === OrganizationTypeMsp.RTE &&
            activationDocumentInput.measurementUnitName !== MeasurementUnitType.MW) {
            throw new Error(`Organisation, ${identity} does not have write access for KW orders`);
        }
        if (identity === OrganizationTypeMsp.ENEDIS &&
            activationDocumentInput.measurementUnitName !== MeasurementUnitType.KW) {
            throw new Error(`Organisation, ${identity} does not have write access for MW orders`);
        }

        const siteAsBytes = await ctx.stub.getState(activationDocumentInput.registeredResourceMrid);
        if (!siteAsBytes || siteAsBytes.length === 0) {
            throw new Error(`Site : ${activationDocumentInput.registeredResourceMrid} does not exist for Activation Document ${activationDocumentInput.activationDocumentMrid} creation.`);
        }

        if (activationDocumentInput.senderMarketParticipantMrid) {
            const systemOperatorAsBytes = await ctx.stub.getState(activationDocumentInput.senderMarketParticipantMrid);
            if (!systemOperatorAsBytes || systemOperatorAsBytes.length === 0) {
                throw new Error(`System Operator : ${activationDocumentInput.senderMarketParticipantMrid} does not exist for Activation Document ${activationDocumentInput.activationDocumentMrid} creation.`);
            }
        }
        if (activationDocumentInput.receiverMarketParticipantMrid) {
            const producerAsBytes = await ctx.stub.getState(activationDocumentInput.receiverMarketParticipantMrid);
            if (!producerAsBytes || producerAsBytes.length === 0) {
                throw new Error(`Producer : ${activationDocumentInput.receiverMarketParticipantMrid} does not exist for Activation Document ${activationDocumentInput.activationDocumentMrid} creation.`);
            }
        }

        activationDocumentInput.docType = 'activationDocument';
        activationDocumentInput.reconciliation = false;

        if (identity === OrganizationTypeMsp.ENEDIS &&
            activationDocumentInput.startCreatedDateTime &&
            activationDocumentInput.endCreatedDateTime
        ) {
            const yellowAsBytes = await ctx.stub.getState(activationDocumentInput.originAutomataRegisteredResourceMrid);
            if (!yellowAsBytes || yellowAsBytes.length === 0) {
                throw new Error(`Yellow Page : ${activationDocumentInput.originAutomataRegisteredResourceMrid} does not exist for Activation Document ${activationDocumentInput.activationDocumentMrid} creation.`);
            }

            activationDocumentInput.reconciliation = true;
            // await ActivationDocumentController.checkForOrderReconciliation(
            //     ctx,
            //     activationDocumentInput.senderMarketParticipantMrid,
            //     activationDocumentInput.startCreatedDateTime,
            // );
        }
        if (!activationDocumentInput.endCreatedDatetime && !activationDocumentInput.orderValue) {
            throw new Error(`Order must have a limitation value`);
        }
        if (activationDocumentInput.orderEnd) {
            const ret = await ActivationDocumentController.checkForReconciliationBE(
                ctx,
                activationDocumentInput.activationDocumentMrid,
                activationDocumentInput.registeredResourceMrid,
                activationDocumentInput.startCreatedDateTime,
            );
            if (ret) {
                activationDocumentInput.reconciliation = true;
                if (!activationDocumentInput.subOrderList) {
                    activationDocumentInput.subOrderList = [];
                    activationDocumentInput.subOrderList.push(ret);
                } else {
                    activationDocumentInput.subOrderList.push(ret);
                }
            }
        }
        await ctx.stub.putState(
            activationDocumentInput.activationDocumentMrid,
            Buffer.from(JSON.stringify(activationDocumentInput)),
        );
        console.info(
            '============= END   : Create %s ActivationDocument ===========',
            activationDocumentInput.activationDocumentMrid,
        );
    }

    public static async getActivationDocumentByProducer(ctx: Context, producerMrid: string): Promise<string> {
        const allResults = [];
        const query = `{"selector": {"docType": "activationDocument", "receiverMarketParticipantMrid": "${producerMrid}"}}`;
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

    public static async getActivationDocumentBySystemOperator(
            ctx: Context, systemOperatorMrid: string): Promise<string> {
        const allResults = [];
        const query = `{"selector": {"docType": "activationDocument", "senderMarketParticipantMrid": "${systemOperatorMrid}"}}`;
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

    // private static async checkForOrderReconciliation(
    //     ctx: Context,
    //     senderMarketParticipantMrid: string,
    //     registeredResourceMrid: string,
    //     queryDate: string) {
    //     console.info('============= START : checkForOrderReconciliation ActivationDocument ===========');
    //     const datetmp = new Date(queryDate);
    //     console.log(new Date());
    //     console.log ('queryDate=', queryDate);
    //     console.log ('datetmp=', datetmp);
    //     console.log ('dateday=', datetmp.getDate());
    //     console.log ('datemonth=', datetmp.getMonth());
    //     console.log ('dateyear=', datetmp.getFullYear());
    //     console.log ('datetime=', datetmp.getTime());

    //     console.log ('datesetmili=', datetmp.setUTCMilliseconds(0));
    //     console.log ('datesetsec=', datetmp.setUTCSeconds(0));
    //     console.log ('datesetmin=', datetmp.setUTCMinutes(0));
    //     console.log ('datesethour=', datetmp.setUTCHours(0));
    //     console.log ('datetmptime=', datetmp.getTime());
    //     console.log ('datetmp=', datetmp);
    //     const dateYesterday = new Date(datetmp.getTime() - 86400000);
    //     console.log ('dateYesterday=', dateYesterday);

    //     const allResults = [];
    //     const query = `{
    //         "selector": {
    //             "docType": "activationDocument",
    //             "senderMarketParticipantMrid": "${senderMarketParticipantMrid}",
    //             "registeredResourceMrid": "${registeredResourceMrid}",
    //             "reconciliation": false
    //             "startCreatedDateTime": {
    //                 "$gte": "${dateYesterday}",
    //                 "$lte": "${queryDate}"
    //             },
    //             "sort": [{
    //                 "startCreatedDateTime" : "desc"
    //             }],
    //         }
    //     }`;
    //     const iterator = await ctx.stub.getQueryResult(query);
    //     // let result = await iterator.next();
    //     // console.log('result=', result);
    //     // while (!result.done) {
    //     //     const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
    //     //     console.log('strValue=', strValue);
    //         // let record;
    //         // try {
    //         //     record = JSON.parse(strValue);
    //         // } catch (err) {
    //         //     record = strValue;
    //     //     }
    //     //     allResults.push(record);
    //     //     result = await iterator.next();
    //     // }
    //     // console.log(JSON.stringify(allResults));

    // }

    private static async checkForReconciliationBE(
        ctx: Context,
        activationDocumentMrid: string,
        registeredResourceMrid: string,
        queryDate: string): Promise<string> {
        console.info('============= START : checkForOrderReconciliation ActivationDocument ===========');
        const datetmp = new Date(queryDate);
        console.log(new Date());
        console.log ('queryDate=', queryDate);
        console.log ('datetmp=', datetmp);
        console.log ('dateday=', datetmp.getDate());
        console.log ('datemonth=', datetmp.getMonth());
        console.log ('dateyear=', datetmp.getFullYear());
        console.log ('datetime=', datetmp.getTime());

        console.log ('datesetmili=', datetmp.setUTCMilliseconds(0));
        console.log ('datesetsec=', datetmp.setUTCSeconds(0));
        console.log ('datesetmin=', datetmp.setUTCMinutes(0));
        console.log ('datesethour=', datetmp.setUTCHours(0));
        console.log ('datetmptime=', datetmp.getTime());
        console.log ('datetmp=', datetmp);
        console.log ('datetmp=', datetmp.toUTCString());
        const dateYesterday = new Date(datetmp.getTime() - 86400000);
        console.log ('dateYesterday=', dateYesterday);
        console.log ('dateYesterday=', dateYesterday.toUTCString());

        const allResults = [];
        // const query = `{
        //     "selector": {
        //         "docType": "activationDocument",
        //         "registeredResourceMrid": "${registeredResourceMrid}",
        //         "reconciliation": false
        //         "startCreatedDateTime": {
        //             "$gte": "${dateYesterday}",
        //             "$lte": "${queryDate}"
        //         },
        //         "sort": [{
        //             "startCreatedDateTime" : "desc"
        //         }],
        //     }
        // }`;
        const query = `{
            "selector": {
                "docType": "activationDocument",
                "registeredResourceMrid": "${registeredResourceMrid}",
                "reconciliation": false
            }
        }`;
        const iterator = await ctx.stub.getQueryResult(query);
        let result = await iterator.next();
        console.log('result=', result);
        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            console.log('strValue=', strValue);
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                record = strValue;
            }
            console.log(typeof(record));
            allResults.push(record);
            result = await iterator.next();
        }

        const order: ActivationDocument = allResults[0];
        order.reconciliation = true;
        if (!order.subOrderList) {
            order.subOrderList = [];
            order.subOrderList.push(activationDocumentMrid);
        } else {
            order.subOrderList.push(activationDocumentMrid);
        }
        await ctx.stub.putState(
            order.activationDocumentMrid,
            Buffer.from(JSON.stringify(order)),
        );

        console.log('order=', order);
        console.log('allResults=', allResults);
        console.log(typeof(allResults));
        if (order.activationDocumentMrid) {
            return order.activationDocumentMrid;
        } else {
            return;
        }
    }
}
