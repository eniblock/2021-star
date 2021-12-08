import { strict } from 'assert';
import { Context, Contract } from 'fabric-contract-api';
import { MeasurementUnitType } from '../enums/MesurementUnitType';
import { OrganizationTypeMsp } from '../enums/OrganizationMspType';
import { ActivationDocument } from '../model/activationDocument';

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
        if (activationDocumentInput.senderMarketParticipantMrid) {
            const systemOperatorAsBytes = await ctx.stub.getState(activationDocumentInput.senderMarketParticipantMrid);
            if (!systemOperatorAsBytes || systemOperatorAsBytes.length === 0) {
                throw new Error(`System Operator : ${activationDocumentInput.senderMarketParticipantMrid} does not exist`);
            }
        }
        if (activationDocumentInput.receiverMarketParticipantMrid) {
            const producerAsBytes = await ctx.stub.getState(activationDocumentInput.receiverMarketParticipantMrid);
            if (!producerAsBytes || producerAsBytes.length === 0) {
                throw new Error(`Producer : ${activationDocumentInput.receiverMarketParticipantMrid} does not exist`);
            }
        }
        activationDocumentInput.docType = 'activationDocument';
        activationDocumentInput.reconciliation = false;

        if (activationDocumentInput.startCreatedDateTime && activationDocumentInput.endCreatedDateTime) {
            activationDocumentInput.reconciliation = true;
        }
        if (!activationDocumentInput.endCreatedDatetime && !activationDocumentInput.orderValue) {
            throw new Error(`Order must have a limitation value`);
        }

        await ctx.stub.putState(
            activationDocumentInput.activationDocumentMrid,
            Buffer.from(JSON.stringify(activationDocumentInput)));
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
        console.log('result=', result);
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

}
