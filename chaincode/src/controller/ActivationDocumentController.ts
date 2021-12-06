import { strict } from 'assert';
import { Context, Contract } from 'fabric-contract-api';
import { ActivationDocument } from '..//activationDocument';
import { OrganizationTypeMsp } from '../enums/OrganizationTypeMsp';

export class ActivationDocumentController {

    public static async createActivationDocument(
        ctx: Context,
        inputStr: string) {
        // let activationDocument: ActivationDocument;
        // try {
        //     activationDocument = JSON.parse(inputStr);
        //   } catch (error) {
        //     // console.error('error=', error);
        //     throw new Error(`ERROR createActivationDocument-> Input string NON-JSON value`);
        //   }
        console.info('============= START : Create ActivationDocument ===========');

        const identity = await ctx.stub.getMspID();
        if (identity !== OrganizationTypeMsp.RTE && identity !== OrganizationTypeMsp.ENEDIS) {
            throw new Error(`Organisition, ${identity} does not have write access for Activation Document`);
        }

        const activationDocumentInput = ActivationDocument.schema.validateSync(
            JSON.parse(inputStr),
            {strict: true, abortEarly: false},
        );

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
        await ctx.stub.putState(
            activationDocumentInput.activationDocumentMrid,
            Buffer.from(JSON.stringify(activationDocumentInput)));
        console.info(
            '============= END   : Create %s ActivationDocument ===========',
            activationDocumentInput.activationDocumentMrid,
        );
    }
}
