'use strict';
const sinon = require('sinon');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinonChai = require('sinon-chai');
const expect = chai.expect;

import { ChaincodeStub, ClientIdentity } from 'fabric-shim'

import { Star } from '../src/star'
import { ActivationDocument } from '../src/model/activationDocument';

import { OrganizationTypeMsp } from '../src/enums/OrganizationMspType';

import { Values } from './Values';
import { ParametersController } from '../src/controller/ParametersController';
import { ParametersType } from '../src/enums/ParametersType';

class TestContext {
    clientIdentity: any;
    stub: any;

    constructor() {
        this.clientIdentity = sinon.createStubInstance(ClientIdentity);
        this.clientIdentity.getMSPID.returns('FakeMspID');
        this.stub = sinon.createStubInstance(ChaincodeStub);

        this.stub.putState.callsFake((key, value) => {
            if (!this.stub.states) {
                this.stub.states = {};
            }
            this.stub.states[key] = value;
        });

        this.stub.getState.callsFake(async (key) => {
            let ret;
            if (this.stub.states) {
                ret = this.stub.states[key];
            }
            return Promise.resolve(ret);
        });
    }

}
function ChaincodeMessageHandler(ChaincodeMessageHandler: any): any {
    throw new Error('Function not implemented.');
}


describe('Star Tests ActivationDocument', () => {
    let transactionContext: any;
    let mockHandler:any;
    let star: Star;
    let values: Values;
    beforeEach(() => {
        transactionContext = new TestContext();
        star = new Star();
        values = new Values();
        mockHandler = sinon.createStubInstance(ChaincodeMessageHandler);

        chai.should();
        chai.use(chaiAsPromised);
        chai.use(sinonChai);
    });


    describe('Test false statement', () => {
        it('should avoid else flag missing', async () => {
            await transactionContext.stub.getState("EolienFRvert28EIC");
            await transactionContext.stub.getQueryResult("EolienFRvert28EIC");
        });
    });
////////////////////////////////////////////////////////////////////////////
////////////////////////////////////    couple     ////////////////////////////
////////////////////////////////////////////////////////////////////////////

    describe('Test CreateActivationDocument couple HTA ENEDIS', () => {
        // it('should return ERROR on CreateActivationDocument', async () => {
        //     transactionContext.stub.putState.rejects('failed inserting key');

        //     let star = new Star();
        //     transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);
        //     try {
        //         await star.CreateSystemOperator(transactionContext, '17V000000992746D', 'RTE', 'A49');
        //         // await star.createProducer(transactionContext, '17X000001309745X', 'EolienFR vert Cie', 'A21');
        //         await star.CreateActivationDocument(transactionContext, '{\"meteringPointMrid\":\"PDL00000000289766\",\"systemOperatorMarketParticipantMrid\":\"17V000000992746D\",\"producerMarketParticipantMrid\":\"17X000001309745X\",\"technologyType\": \"Eolien\",\"siteType\":\"Injection\",\"siteName\":\"Ferme éolienne de Genonville\",\"substationMrid\":\"GDO A4RTD\",\"substationName\":\"CIVRAY\",\"marketEvaluationPointMrid\":\"string\",\"schedulingEntityRegisteredResourceMrid\":\"string\",\"siteAdminMrid\":\"489 981 029\",\"siteLocation\":\"Biscarosse\",\"siteIecCode\":\"S7X0000013077478\",\"systemOperatorEntityFlexibilityDomainMrid\":\"PSC4511\",\"systemOperatorEntityFlexibilityDomainName\":\"Départ 1\",\"systemOperatorCustomerServiceName\":\"DR Nantes Deux-Sèvres\"}');
        //     } catch(err) {
        //         console.info(err.message)
        //         expect(err.message).to.equal('failed inserting key');
        //     }
        // });

        it('should return ERROR on CreateActivationDocument NON-JSON Value', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);
            try {
                await star.CreateActivationDocument(transactionContext, 'XXXXXX');
            } catch(err) {
                console.info(err.message)
                expect(err.message).to.equal('ERROR createActivationDocument-> Input string NON-JSON value');
            }
        });



        it('should return ERROR CreateActivationDocument missing originAutomationRegisteredResourceMrid', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);
            transactionContext.stub.getState.withArgs(Values.HTA_systemoperator.systemOperatorMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_systemoperator)));
            transactionContext.stub.getState.withArgs(Values.HTA_Producer.producerMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_Producer)));
            const collectionName=await ParametersController.getParameter(transactionContext, ParametersType.SITE);
            transactionContext.stub.getPrivateData.withArgs(collectionName, Values.HTA_site_valid.meteringPointMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_site_valid)));
            transactionContext.stub.getState.withArgs(Values.HTA_yellowPage.originAutomationRegisteredResourceMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_yellowPage)));

            const ad_str = await Values.deleteJSONField(JSON.stringify(Values.HTA_ActivationDocument_Valid), 'originAutomationRegisteredResourceMrid');

            try {
                await star.CreateActivationDocument(transactionContext, ad_str);
            } catch(err) {
                // console.info(err.message)
                expect(err.message).to.equal('originAutomationRegisteredResourceMrid is required');
            }
        });

        it('should return ERROR CreateActivationDocument missing registeredResourceMrid', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);

            var input = JSON.stringify(Values.HTA_ActivationDocument_Valid);
            input = await Values.deleteJSONField(input, "registeredResourceMrid");

            try {
                await star.CreateActivationDocument(transactionContext, input);
            } catch(err) {
                console.info(err.message)
                expect(err.message).to.equal('registeredResourceMrid is required');
            }
        });

        it('should return ERROR CreateActivationDocument missing measurementUnitName', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);

            var input = JSON.stringify(Values.HTA_ActivationDocument_Valid);
            input = await Values.deleteJSONField(input, "measurementUnitName");

            try {
                await star.CreateActivationDocument(transactionContext, input);
            } catch(err) {
                console.info(err.message)
                expect(err.message).to.equal('measurementUnitName is required');
            }
        });

        it('should return ERROR CreateActivationDocument missing messageType', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);

            var input = JSON.stringify(Values.HTA_ActivationDocument_Valid);
            input = await Values.deleteJSONField(input, "messageType");

            try {
                await star.CreateActivationDocument(transactionContext, input);
            } catch(err) {
                console.info(err.message)
                expect(err.message).to.equal('messageType is required');
            }
        });

        it('should return ERROR CreateActivationDocument missing businessType', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);

            var input = JSON.stringify(Values.HTA_ActivationDocument_Valid);
            input = await Values.deleteJSONField(input, "businessType");

            try {
                await star.CreateActivationDocument(transactionContext, input);
            } catch(err) {
                console.info(err.message)
                expect(err.message).to.equal('businessType is required');
            }
        });

        it('should return ERROR CreateActivationDocument missing orderEnd', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);

            var input = JSON.stringify(Values.HTA_ActivationDocument_Valid);
            input = await Values.deleteJSONField(input, "orderEnd");

            try {
                await star.CreateActivationDocument(transactionContext, input);
            } catch(err) {
                console.info(err.message)
                expect(err.message).to.equal('orderEnd is required');
            }
        });

        it('should return ERROR CreateActivationDocument couple HTA wrong MSPID -> FakeMSP', async () => {
            transactionContext.clientIdentity.getMSPID.returns(Values.FakeMSP);
            const activationDocument:ActivationDocument = JSON.parse(JSON.stringify(Values.HTA_ActivationDocument_Valid));

            try {
                await star.CreateActivationDocument(transactionContext, JSON.stringify(activationDocument));
            } catch(err) {
                console.info(err.message)
                expect(err.message).to.equal('Organisation, FakeMSP does not have write access for Activation Document');
            }
        });

        it('should return ERROR CreateActivationDocument couple HTA wrong unit measure', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);
            const activationDocument:ActivationDocument = JSON.parse(JSON.stringify(Values.HTB_ActivationDocument_Valid));

            try {
                await star.CreateActivationDocument(transactionContext, JSON.stringify(activationDocument));
            } catch(err) {
                console.info(err.message)
                expect(err.message).to.equal('Organisation, enedis does not have write access for MW orders');
            }
        });

        it('should return ERROR CreateActivationDocument couple HTA missing systemoperator', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);
            const activationDocument:ActivationDocument = JSON.parse(JSON.stringify(Values.HTA_ActivationDocument_Valid));
            // transactionContext.stub.getState.withArgs(Values.HTA_systemoperator.systemOperatorMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_systemoperator)));
            transactionContext.stub.getState.withArgs(Values.HTA_Producer.producerMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_Producer)));

            const collectionName=await ParametersController.getParameter(transactionContext, ParametersType.SITE);
            transactionContext.stub.getPrivateData.withArgs(collectionName, Values.HTA_site_valid.meteringPointMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_site_valid)));

            transactionContext.stub.getState.withArgs(Values.HTA_yellowPage.originAutomationRegisteredResourceMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_yellowPage)));

            try {
                await star.CreateActivationDocument(transactionContext, JSON.stringify(activationDocument));
            } catch(err) {
                console.info(err.message)
                expect(err.message).to.equal('System Operator : '
                    .concat(Values.HTA_systemoperator.systemOperatorMarketParticipantMrid)
                    .concat(' does not exist for Activation Document 8c56459a-794a-4ed1-a7f6-33b0064508f1 creation.'));
            }
        });

        it('should return ERROR CreateActivationDocument couple HTA missing producer', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);
            const activationDocument:ActivationDocument = JSON.parse(JSON.stringify(Values.HTA_ActivationDocument_Valid));
            transactionContext.stub.getState.withArgs(Values.HTA_systemoperator.systemOperatorMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_systemoperator)));
            // transactionContext.stub.getState.withArgs(Values.HTA_Producer.producerMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_Producer)));

            const collectionName=await ParametersController.getParameter(transactionContext, ParametersType.SITE);
            transactionContext.stub.getPrivateData.withArgs(collectionName, Values.HTA_site_valid.meteringPointMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_site_valid)));

            transactionContext.stub.getState.withArgs(Values.HTA_yellowPage.originAutomationRegisteredResourceMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_yellowPage)));

            try {
                await star.CreateActivationDocument(transactionContext, JSON.stringify(activationDocument));
            } catch(err) {
                // console.info(err.message)
                expect(err.message).to.equal('Producer : '
                    .concat(Values.HTA_Producer.producerMarketParticipantMrid)
                    .concat(' does not exist for Activation Document 8c56459a-794a-4ed1-a7f6-33b0064508f1 creation.'));
            }
        });

        it('should return ERROR CreateActivationDocument couple HTA missing yellow Page', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);
            const activationDocument:ActivationDocument = JSON.parse(JSON.stringify(Values.HTA_ActivationDocument_Valid));
            transactionContext.stub.getState.withArgs(Values.HTA_systemoperator.systemOperatorMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_systemoperator)));
            transactionContext.stub.getState.withArgs(Values.HTA_Producer.producerMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_Producer)));

            const collectionName=await ParametersController.getParameter(transactionContext, ParametersType.SITE);
            transactionContext.stub.getPrivateData.withArgs(collectionName, Values.HTA_site_valid.meteringPointMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_site_valid)));

            // transactionContext.stub.getState.withArgs(Values.HTA_yellowPage.originAutomationRegisteredResourceMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_yellowPage)));

            try {
                await star.CreateActivationDocument(transactionContext, JSON.stringify(activationDocument));
            } catch(err) {
                // console.info(err.message)
                expect(err.message).to.equal('Yellow Page : '
                    .concat(Values.HTA_yellowPage.originAutomationRegisteredResourceMrid)
                    .concat(' does not exist for Activation Document 8c56459a-794a-4ed1-a7f6-33b0064508f1 creation.'));
            }
        });

        it('should return SUCCESS CreateActivationDocument couple HTA', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);
            const activationDocument:ActivationDocument = JSON.parse(JSON.stringify(Values.HTA_ActivationDocument_Valid));
            transactionContext.stub.getState.withArgs(Values.HTA_systemoperator.systemOperatorMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_systemoperator)));
            transactionContext.stub.getState.withArgs(Values.HTA_Producer.producerMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_Producer)));

            const collectionName=await ParametersController.getParameter(transactionContext, ParametersType.SITE);
            transactionContext.stub.getPrivateData.withArgs(collectionName, Values.HTA_site_valid.meteringPointMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_site_valid)));

            transactionContext.stub.getState.withArgs(Values.HTA_yellowPage.originAutomationRegisteredResourceMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_yellowPage)));

            await star.CreateActivationDocument(transactionContext, JSON.stringify(activationDocument));

            let ret = await transactionContext.stub.getState(activationDocument.activationDocumentMrid);
            ret = JSON.parse(ret);
            const expected: ActivationDocument = activationDocument;
            expected.docType="activationDocument"
            expected.reconciliation=true

            expect(ret).to.eql(expected);
        });

        it('should return ERROR CreateActivationDocument couple HTA missing to much optional fields', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);
            const activationDocument:ActivationDocument = JSON.parse(JSON.stringify(Values.HTA_ActivationDocument_Valid));
            transactionContext.stub.getState.withArgs(Values.HTA_systemoperator.systemOperatorMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_systemoperator)));
            transactionContext.stub.getState.withArgs(Values.HTA_Producer.producerMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_Producer)));

            const collectionName=await ParametersController.getParameter(transactionContext, ParametersType.SITE);
            transactionContext.stub.getPrivateData.withArgs(collectionName, Values.HTA_site_valid.meteringPointMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_site_valid)));

            transactionContext.stub.getState.withArgs(Values.HTA_yellowPage.originAutomationRegisteredResourceMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_yellowPage)));

            var input = JSON.stringify(activationDocument);
            input = await Values.deleteJSONField(input, "orderValue");
            input = await Values.deleteJSONField(input, "endCreatedDateTime");
            input = await Values.deleteJSONField(input, "senderMarketParticipantMrid");
            input = await Values.deleteJSONField(input, "receiverMarketParticipantMrid");

            try {
                await star.CreateActivationDocument(transactionContext, input);
            } catch(err) {
                console.info(err.message)
                expect(err.message).to.equal('Order must have a limitation value');
            }
        });
    });
////////////////////////////////////////////////////////////////////////////
////////////////////////////////////    BEGIN     ////////////////////////////
////////////////////////////////////////////////////////////////////////////
    describe('Test CreateActivationDocument Début HTB RTE', () => {
        it('should return ERROR on CreateActivationDocument NON-JSON Value', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);
            try {
                await star.CreateActivationDocument(transactionContext, 'RTE01EIC');
            } catch(err) {
                // console.info(err.message)
                expect(err.message).to.equal('ERROR createActivationDocument-> Input string NON-JSON value');
            }
        });

        it('should return ERROR CreateActivationDocument wrong JSON', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);

            var input = JSON.stringify(Values.HTB_ActivationDocument_Valid);
            input = await Values.deleteJSONField(input, "activationDocumentMrid");
            input = await Values.deleteJSONField(input, "businessType");
            input = await Values.deleteJSONField(input, "measurementUnitName");
            input = await Values.deleteJSONField(input, "messageType");
            input = await Values.deleteJSONField(input, "orderEnd");
            input = await Values.deleteJSONField(input, "originAutomationRegisteredResourceMrid");
            input = await Values.deleteJSONField(input, "registeredResourceMrid");

            const errors = [
                'activationDocumentMrid is a compulsory string',
                'businessType is required',
                'measurementUnitName is required',
                'messageType is required',
                'orderEnd is required',
                'originAutomationRegisteredResourceMrid is required',
                'registeredResourceMrid is required'
              ];

            try {
                await star.CreateActivationDocument(transactionContext, input);
            } catch(err) {
                // console.info(err)
                expect(err.errors[0]).to.equal(errors[0]);
                expect(err.errors[1]).to.equal(errors[1]);
                expect(err.errors[2]).to.equal(errors[2]);
                expect(err.errors[3]).to.equal(errors[3]);
                expect(err.errors[4]).to.equal(errors[4]);
                expect(err.errors[5]).to.equal(errors[5]);
                expect(err.errors[6]).to.equal(errors[6]);
                expect(err.errors[7]).to.equal(errors[7]);
                expect(err.message).to.equal('7 errors occurred');
            }
        });

        it('should return ERROR CreateActivationDocument missing activationDocumentMrid', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);

            var input = JSON.stringify(Values.HTB_ActivationDocument_Valid);
            input = await Values.deleteJSONField(input, "activationDocumentMrid")

            try {
                await star.CreateActivationDocument(transactionContext, input);
            } catch(err) {
                console.info(err.message)
                expect(err.message).to.equal('activationDocumentMrid is a compulsory string');
            }
        });

        it('should return ERROR CreateActivationDocument couple HTA wrong MSPID -> RTE', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);
            const activationDocument:ActivationDocument = JSON.parse(JSON.stringify(Values.HTA_ActivationDocument_Valid));
            transactionContext.stub.getState.withArgs(Values.HTA_systemoperator.systemOperatorMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_systemoperator)));
            transactionContext.stub.getState.withArgs(Values.HTA_Producer.producerMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_Producer)));

            const collectionName=await ParametersController.getParameter(transactionContext, ParametersType.SITE);
            transactionContext.stub.getPrivateData.withArgs(collectionName, Values.HTA_site_valid.meteringPointMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_site_valid)));

            transactionContext.stub.getState.withArgs(Values.HTA_yellowPage.originAutomationRegisteredResourceMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_yellowPage)));

            try {
                await star.CreateActivationDocument(transactionContext, JSON.stringify(activationDocument));
            } catch(err) {
                console.info(err.message)
                expect(err.message).to.equal('Organisation, rte does not have write access for KW orders');
            }
        });

        it('should return ERROR CreateActivationDocument begin HTB site doesn\'t exist', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);
            const activationDocument:ActivationDocument = JSON.parse(JSON.stringify(Values.HTB_ActivationDocument_Valid));
            transactionContext.stub.getState.withArgs(Values.HTB_systemoperator.systemOperatorMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTB_systemoperator)));
            transactionContext.stub.getState.withArgs(Values.HTB_Producer.producerMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTB_Producer)));

            // const collectionName=await ParametersController.getParameter(transactionContext, ParametersType.SITE);
            // transactionContext.stub.getPrivateData.withArgs(collectionName, Values.HTB_site_valid.meteringPointMrid).resolves(Buffer.from(JSON.stringify(Values.HTB_site_valid)));

            transactionContext.stub.getState.withArgs(Values.HTB_yellowPage.originAutomationRegisteredResourceMrid).resolves(Buffer.from(JSON.stringify(Values.HTB_yellowPage)));

            try {
                await star.CreateActivationDocument(transactionContext, JSON.stringify(activationDocument));
            } catch(err) {
                console.info(err.message)
                expect(err.message).to.equal('Site : '.concat(Values.HTB_site_valid.meteringPointMrid).concat(' does not exist for Activation Document 8c56459a-794a-4ed1-a7f6-33b0064508f1 creation.'));
            }
        });

        it('should return ERROR CreateActivationDocument begin HTB producer doesn\'t exist', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);
            const activationDocument:ActivationDocument = JSON.parse(JSON.stringify(Values.HTB_ActivationDocument_Valid));
            transactionContext.stub.getState.withArgs(Values.HTB_systemoperator.systemOperatorMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTB_systemoperator)));
            // transactionContext.stub.getState.withArgs(Values.HTB_Producer.producerMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTB_Producer)));

            const collectionName=await ParametersController.getParameter(transactionContext, ParametersType.SITE);
            transactionContext.stub.getPrivateData.withArgs(collectionName, Values.HTB_site_valid.meteringPointMrid).resolves(Buffer.from(JSON.stringify(Values.HTB_site_valid)));

            transactionContext.stub.getState.withArgs(Values.HTB_yellowPage.originAutomationRegisteredResourceMrid).resolves(Buffer.from(JSON.stringify(Values.HTB_yellowPage)));

            try {
                await star.CreateActivationDocument(transactionContext, JSON.stringify(activationDocument));
            } catch(err) {
                console.info(err.message)
                expect(err.message).to.equal('Producer : '.concat(Values.HTB_Producer.producerMarketParticipantMrid).concat(' does not exist for Activation Document 8c56459a-794a-4ed1-a7f6-33b0064508f1 creation.'));
            }
        });

        it('should return SUCCESS CreateActivationDocument Begining order HTB RTE', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);
            const activationDocument:ActivationDocument = JSON.parse(JSON.stringify(Values.HTB_ActivationDocument_Valid));
            transactionContext.stub.getState.withArgs(Values.HTB_systemoperator.systemOperatorMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTB_systemoperator)));
            transactionContext.stub.getState.withArgs(Values.HTB_Producer.producerMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTB_Producer)));

            const collectionName=await ParametersController.getParameter(transactionContext, ParametersType.SITE);
            transactionContext.stub.getPrivateData.withArgs(collectionName, Values.HTB_site_valid.meteringPointMrid).resolves(Buffer.from(JSON.stringify(Values.HTB_site_valid)));

            transactionContext.stub.getState.withArgs(Values.HTB_yellowPage.originAutomationRegisteredResourceMrid).resolves(Buffer.from(JSON.stringify(Values.HTB_yellowPage)));

            await star.CreateActivationDocument(transactionContext, JSON.stringify(activationDocument));

            let ret = await transactionContext.stub.getState(activationDocument.activationDocumentMrid);
            ret = JSON.parse(ret);
            const expected: ActivationDocument = activationDocument;
            expected.docType="activationDocument"
            expected.reconciliation=false

            expect(ret).to.eql(expected);
        });

    });
////////////////////////////////////////////////////////////////////////////
////////////////////////////////////    GET     ////////////////////////////
////////////////////////////////////////////////////////////////////////////
    describe('Test GetActivationDocumentByProducer', () => {
        it('should return OK on GetActivationDocumentByProducer empty', async () => {
            const producer = 'toto';
            let ret = await star.GetActivationDocumentByProducer(transactionContext, producer);
            ret = JSON.parse(ret);
            // console.log('retADproducer=', ret)
            expect(ret.length).to.equal(0);
            expect(ret).to.eql([]);
        });

        it('should return SUCCESS on GetActivationDocumentByProducer', async () => {
            const iterator = Values.getActivationDocumentQueryMock2Values(Values.HTA_ActivationDocument_Valid, Values.HTA_ActivationDocument_Valid_Doc2,mockHandler);
            const query = `{"selector": {"docType": "activationDocument", "receiverMarketParticipantMrid": "${Values.HTA_Producer.producerMarketParticipantMrid}"}}`;
            transactionContext.stub.getQueryResult.withArgs(query).resolves(iterator);


            let ret = await star.GetActivationDocumentByProducer(transactionContext, Values.HTA_Producer.producerMarketParticipantMrid);
            ret = JSON.parse(ret);
            // console.log('ret=', ret)
            expect(ret.length).to.equal(2);

            const expected: ActivationDocument[] = [Values.HTA_ActivationDocument_Valid, Values.HTA_ActivationDocument_Valid_Doc2];

            expect(ret).to.eql(expected);
        });

        // it('should return SUCCESS on getActivationDocumentByproducer for non JSON value', async () => {
        //     transactionContext.stub.putState.onFirstCall().callsFake((key, value) => {
        //         transactionContext.stub.states = {};
        //         transactionContext.stub.states[key] = 'non-json-value';
        //     });

        //     transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);
        //     await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrid\": \"17V000000992746F\",\"systemOperatorMarketParticipantName\": \"Enedis\",\"systemOperatorMarketParticipantRoleType\": \"A50\"}');

        //     const site: Site = {meteringPointMrid: 'PDL00000000289766',systemOperatorMarketParticipantMrid: '17V000000992746D',producerMarketParticipantMrid: '17X000001309745X',technologyType: 'Eolien',siteType: 'Injection',siteName: 'Ferme éolienne de Genonville',substationMrid: 'GDO A4RTD',substationName: 'CIVRAY',siteAdminMrid: '489 981 029', siteLocation: 'Biscarosse', siteIecCode: 'S7X0000013077478', systemOperatorEntityFlexibilityDomainMrid: 'PSC4511', systemOperatorEntityFlexibilityDomainName: 'Départ 1', systemOperatorCustomerServiceName: 'DR Nantes Deux-Sèvres'};

        //     transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);
        //     await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrid\": \"17V000000992746D\",\"systemOperatorMarketParticipantName\": \"Enedis\",\"systemOperatorMarketParticipantRoleType\": \"A50\"}');
        //     await star.CreateProducer(transactionContext, '{\"producerMarketParticipantMrid\": \"17X000001309745X\",\"producerMarketParticipantName\": \"EolienFR vert Cie\",\"producerMarketParticipantRoleType\": \"A21\"}');
        //     await star.CreateSite(transactionContext, JSON.stringify(site));

        //     const orderA: ActivationDocument = {
        //         activationDocumentMrid: '8c56459a-794a-4ed1-a7f6-33b0064508f1', // PK
        //         originAutomationRegisteredResourceMrid: 'CRIVA1_ENEDIS_Y411', // FK1
        //         registeredResourceMrid: 'PDL00000000289766', // FK2
        //         measurementUnitName: 'KW',
        //         messageType: 'string',
        //         businessType: 'string',

        //         orderEnd: false,

        //         orderValue: '1',
        //         startCreatedDateTime: "2021-10-22T10:29:10.000Z",
        //         // testDateTime: 'Date', // Test DELETE ME //////////////////////
        //         endCreatedDateTime: "2021-10-22T23:29:10.000Z",
        //         revisionNumber: '1',
        //         reasonCode: 'string', // optionnal in case of TVC modulation
        //         senderMarketParticipantMrid: '17V000000992746D', // FK?
        //         receiverMarketParticipantMrid: '17X000001309745X', // FK?
        //         // reconciliation: false,
        //         // subOrderList: [],
        //     }

        //     transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);
        //     await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrid\": \"17V0000009927454\",\"systemOperatorMarketParticipantName\": \"Enedis\",\"systemOperatorMarketParticipantRoleType\": \"A50\"}');
        //     await star.CreateProducer(transactionContext, '{\"producerMarketParticipantMrid\": \"17X000001309745Y\",\"producerMarketParticipantName\": \"EolienFR vert Cie\",\"producerMarketParticipantRoleType\": \"A21\"}');

        //     const yellowPage: YellowPages = {originAutomationRegisteredResourceMrid: "CRIVA1_ENEDIS_Y411",registeredResourceMrid: "PDL00000000289766",systemOperatorMarketParticipantMrid: "17V000000992746D"};
        //     await star.CreateYellowPages(transactionContext, JSON.stringify(yellowPage));
        //     await star.CreateActivationDocument(transactionContext, JSON.stringify(orderA));

        //     const orderB: ActivationDocument = {
        //         activationDocumentMrid: '8c56459a-794a-4ed1-a7f6-33b0064508f2', // PK
        //         originAutomationRegisteredResourceMrid: 'CRIVA1_ENEDIS_Y411', // FK1
        //         registeredResourceMrid: 'PDL00000000289766', // FK2
        //         measurementUnitName: 'MW',
        //         messageType: 'string',
        //         businessType: 'string',
        //         orderEnd: false,

        //         orderValue: '1',
        //         startCreatedDateTime: "2021-10-22T10:29:10.000Z",
        //         // testDateTime: 'Date', // Test DELETE ME //////////////////////
        //         endCreatedDateTime: "2021-10-22T23:29:10.000Z",
        //         revisionNumber: '1',
        //         reasonCode: 'string', // optionnal in case of TVC modulation
        //         senderMarketParticipantMrid: '17V000000992746D', // FK?
        //         receiverMarketParticipantMrid: '17X000001309745Y', // FK?
        //         // reconciliation: false,
        //         // subOrderList: [],
        //     }

        //     transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);
        //     await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrid\": \"17V000000992746D\",\"systemOperatorMarketParticipantName\": \"RTE\",\"systemOperatorMarketParticipantRoleType\": \"A49\"}');
        //     await star.CreateActivationDocument(transactionContext, JSON.stringify(orderB));

        //     let retB = await star.GetActivationDocumentByProducer(transactionContext, orderB.receiverMarketParticipantMrid);
        //     retB = JSON.parse(retB);
        //     // console.log('retB=', retB)
        //     expect(retB.length).to.equal(2);

        //     const expected = [
        //         'non-json-value',
        //         {
        //             activationDocumentMrid: "8c56459a-794a-4ed1-a7f6-33b0064508f2",
        //             businessType: "string",
        //             docType: "activationDocument",
        //             endCreatedDateTime: "2021-10-22T23:29:10.000Z",
        //             measurementUnitName: "MW",
        //             messageType: "string",
        //             orderEnd: false,

        //             orderValue: "1",
        //             originAutomationRegisteredResourceMrid: "CRIVA1_ENEDIS_Y411",
        //             reasonCode: "string",
        //             receiverMarketParticipantMrid: "17X000001309745Y",
        //             reconciliation: true,
        //             registeredResourceMrid: "PDL00000000289766",
        //             revisionNumber: "1",
        //             senderMarketParticipantMrid: "17V000000992746D",
        //             startCreatedDateTime: "2021-10-22T10:29:10.000Z",
        //         }
        //    ];

        //     expect(retB).to.eql(expected);
        // });
   });

    describe('Test GetActivationDocumentBySystemOperator', () => {
        it('should return OK on GetActivationDocumentBySystemOperator empty', async () => {
            const producer = 'toto';
            let ret = await star.GetActivationDocumentBySystemOperator(transactionContext, producer);
            ret = JSON.parse(ret);
            // console.log('retADproducer=', ret)
            expect(ret.length).to.equal(0);
            expect(ret).to.eql([]);
        });



        it('should return SUCCESS on GetActivationDocumentBySystemOperator', async () => {
            const iterator = Values.getActivationDocumentQueryMock(Values.HTA_ActivationDocument_Valid,mockHandler);
            const query = `{"selector": {"docType": "activationDocument", "senderMarketParticipantMrid": "${Values.HTA_ActivationDocument_Valid.senderMarketParticipantMrid}"}}`;
            transactionContext.stub.getQueryResult.withArgs(query).resolves(iterator);

            let ret = await star.GetActivationDocumentBySystemOperator(transactionContext, Values.HTA_ActivationDocument_Valid.senderMarketParticipantMrid);
            ret = JSON.parse(ret);
            // console.log('ret=', ret)
            expect(ret.length).to.equal(1);

            const expected: ActivationDocument[] = [Values.HTA_ActivationDocument_Valid];

            expect(ret).to.eql(expected);
        });

        // it('should return SUCCESS on getActivationDocumentBySystemOperator for non JSON value', async () => {
        //     transactionContext.stub.putState.onFirstCall().callsFake((key, value) => {
        //         transactionContext.stub.states = {};
        //         transactionContext.stub.states[key] = 'non-json-value';
        //     });

        //     transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);
        //     await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrid\": \"17V000000992746L\",\"systemOperatorMarketParticipantName\": \"Enedis\",\"systemOperatorMarketParticipantRoleType\": \"A50\"}');

        //     const site: Site = {meteringPointMrid: 'PDL00000000289766',systemOperatorMarketParticipantMrid: '17V0000009927454',producerMarketParticipantMrid: '17X000001309745X',technologyType: 'Eolien',siteType: 'Injection',siteName: 'Ferme éolienne de Genonville',substationMrid: 'GDO A4RTD',substationName: 'CIVRAY',siteAdminMrid: '489 981 029', siteLocation: 'Biscarosse', siteIecCode: 'S7X0000013077478', systemOperatorEntityFlexibilityDomainMrid: 'PSC4511', systemOperatorEntityFlexibilityDomainName: 'Départ 1', systemOperatorCustomerServiceName: 'DR Nantes Deux-Sèvres'};

        //     transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);
        //     await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrid\": \"17V0000009927454\",\"systemOperatorMarketParticipantName\": \"Enedis\",\"systemOperatorMarketParticipantRoleType\": \"A50\"}');
        //     await star.CreateProducer(transactionContext, '{\"producerMarketParticipantMrid\": \"17X000001309745X\",\"producerMarketParticipantName\": \"EolienFR vert Cie\",\"producerMarketParticipantRoleType\": \"A21\"}');
        //     await star.CreateSite(transactionContext, JSON.stringify(site));

        //     const orderA: ActivationDocument = {
        //         activationDocumentMrid: '8c56459a-794a-4ed1-a7f6-33b0064508f1', // PK
        //         originAutomationRegisteredResourceMrid: 'CRIVA1_ENEDIS_Y411', // FK1
        //         registeredResourceMrid: 'PDL00000000289766', // FK2
        //         measurementUnitName: 'MW',
        //         messageType: 'string',
        //         businessType: 'string',

        //         orderEnd: false,

        //         orderValue: '1',
        //         startCreatedDateTime: "2021-10-22T10:29:10.000Z",
        //         // testDateTime: 'Date', // Test DELETE ME //////////////////////
        //         endCreatedDateTime: "2021-10-22T23:29:10.000Z",
        //         revisionNumber: '1',
        //         reasonCode: 'string', // optionnal in case of TVC modulation
        //         senderMarketParticipantMrid: '17V0000009927454', // FK?
        //         receiverMarketParticipantMrid: '17X000001309745X', // FK?
        //         // reconciliation: false,
        //         // subOrderList: [],
        //     }

        //     transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);
        //     await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrid\": \"17V000000992746D\",\"systemOperatorMarketParticipantName\": \"RTE\",\"systemOperatorMarketParticipantRoleType\": \"A49\"}');
        //     await star.CreateProducer(transactionContext, '{\"producerMarketParticipantMrid\": \"17X000001309745Y\",\"producerMarketParticipantName\": \"EolienFR vert Cie\",\"producerMarketParticipantRoleType\": \"A21\"}');

        //     const yellowPage: YellowPages = {originAutomationRegisteredResourceMrid: "CRIVA1_ENEDIS_Y411",registeredResourceMrid: "PDL00000000289766",systemOperatorMarketParticipantMrid: "17V000000992746D"};
        //     await star.CreateYellowPages(transactionContext, JSON.stringify(yellowPage));
        //     await star.CreateActivationDocument(transactionContext, JSON.stringify(orderA));

        //     const orderB: ActivationDocument = {
        //         activationDocumentMrid: '8c56459a-794a-4ed1-a7f6-33b0064508f2', // PK
        //         originAutomationRegisteredResourceMrid: 'CRIVA1_ENEDIS_Y411', // FK1
        //         registeredResourceMrid: 'PDL00000000289766', // FK2
        //         measurementUnitName: 'MW',
        //         messageType: 'string',
        //         businessType: 'string',

        //         orderEnd: false,

        //         orderValue: '1',
        //         startCreatedDateTime: "2021-10-22T10:29:10.000Z",
        //         // testDateTime: 'Date', // Test DELETE ME //////////////////////
        //         endCreatedDateTime: "2021-10-22T23:29:10.000Z",
        //         revisionNumber: '1',
        //         reasonCode: 'string', // optionnal in case of TVC modulation
        //         senderMarketParticipantMrid: '17V0000009927454', // FK?
        //         receiverMarketParticipantMrid: '17X000001309745Y', // FK?
        //         // reconciliation: false,
        //         // subOrderList: [],
        //     }

        //     transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);
        //     // await star.CreateSystemOperator(transactionContext, '17V0000009927454', 'RTE', 'A49');
        //     await star.CreateActivationDocument(transactionContext, JSON.stringify(orderB));

        //     let retB = await star.GetActivationDocumentBySystemOperator(transactionContext, orderB.senderMarketParticipantMrid);
        //     retB = JSON.parse(retB);
        //     // console.log('retB=', retB)
        //     expect(retB.length).to.equal(3);

        //     const expected = [
        //         'non-json-value',
        //         {
        //             activationDocumentMrid: "8c56459a-794a-4ed1-a7f6-33b0064508f1",
        //             businessType: "string",
        //             docType: "activationDocument",
        //             endCreatedDateTime: "2021-10-22T23:29:10.000Z",
        //             measurementUnitName: "MW",
        //             messageType: "string",
        //             orderEnd: false,

        //             orderValue: "1",
        //             originAutomationRegisteredResourceMrid: "CRIVA1_ENEDIS_Y411",
        //             reasonCode: "string",
        //             receiverMarketParticipantMrid: "17X000001309745X",
        //             reconciliation: true,
        //             registeredResourceMrid: "PDL00000000289766",
        //             revisionNumber: "1",
        //             senderMarketParticipantMrid: "17V0000009927454",
        //             startCreatedDateTime: "2021-10-22T10:29:10.000Z",
        //         },
        //         {

        //             activationDocumentMrid: "8c56459a-794a-4ed1-a7f6-33b0064508f2",
        //             businessType: "string",
        //             docType: "activationDocument",
        //             endCreatedDateTime: "2021-10-22T23:29:10.000Z",
        //             measurementUnitName: "MW",
        //             messageType: "string",
        //             orderEnd: false,

        //             orderValue: "1",
        //             originAutomationRegisteredResourceMrid: "CRIVA1_ENEDIS_Y411",
        //             reasonCode: "string",
        //             receiverMarketParticipantMrid: "17X000001309745Y",
        //             reconciliation: true,
        //             registeredResourceMrid: "PDL00000000289766",
        //             revisionNumber: "1",
        //             senderMarketParticipantMrid: "17V0000009927454",
        //             startCreatedDateTime: "2021-10-22T10:29:10.000Z",
        //         }
        //    ];

        //     expect(retB).to.eql(expected);
        // });
    });
////////////////////////////////////////////////////////////////////////////
////////////////////////////////////    BB/BE     ////////////////////////////
////////////////////////////////////////////////////////////////////////////
    describe('Test OrderEnd RTE', () => {
    //     it('should return SUCCESS CreateActivationDocument end order HTB RTE for NON-JSON value', async () => {

    //         transactionContext.stub.putState.onFirstCall().callsFake((key, value) => {
    //             transactionContext.stub.states = {};
    //             transactionContext.stub.states[key] = 'non-json-value';
    //         });

    //         transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);
    //         await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrid\": \"1\",\"systemOperatorMarketParticipantName\": \"Enedis\",\"systemOperatorMarketParticipantRoleType\": \"A50\"}');
    //         await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrid\": \"17V000000992746D\",\"systemOperatorMarketParticipantName\": \"Enedis\",\"systemOperatorMarketParticipantRoleType\": \"A50\"}');
    //         await star.CreateProducer(transactionContext, '{\"producerMarketParticipantMrid\": \"17X000001309745X\",\"producerMarketParticipantName\": \"EolienFR vert Cie\",\"producerMarketParticipantRoleType\": \"A21\"}');
    //         // await star.CreateSystemOperator(transactionContext, '17V000000992746D', 'RTE', 'A49');
    //         // await star.createProducer(transactionContext, '17X000001309745X', 'EolienFR vert Cie', 'A21');
    //         const site: Site = {meteringPointMrid: 'PDL00000000289766',systemOperatorMarketParticipantMrid: '17V000000992746D',producerMarketParticipantMrid: '17X000001309745X',technologyType: 'Eolien',siteType: 'Injection',siteName: 'Ferme éolienne de Genonville',substationMrid: 'GDO A4RTD',substationName: 'CIVRAY',siteAdminMrid: '489 981 029', siteLocation: 'Biscarosse', siteIecCode: 'S7X0000013077478', systemOperatorEntityFlexibilityDomainMrid: 'PSC4511', systemOperatorEntityFlexibilityDomainName: 'Départ 1', systemOperatorCustomerServiceName: 'DR Nantes Deux-Sèvres'};
    //         await star.CreateSite(transactionContext, JSON.stringify(site));
    //         transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);

    //         // await star.CreateActivationDocument(transactionContext, JSON.stringify(order));

    //         const orderEnd: ActivationDocument = {

    //             activationDocumentMrid: '8c56459a-794a-4ed1-a7f6-33b0064508f2', // PK
    //             originAutomationRegisteredResourceMrid: 'CRIVA1_ENEDIS_Y411', // FK1
    //             registeredResourceMrid: 'PDL00000000289766', // FK2
    //             measurementUnitName: 'MW',
    //             messageType: 'string',
    //             businessType: 'string',
    //             orderEnd: true,

    //             orderValue: '1',
    //             startCreatedDateTime: "2021-10-22T10:29:10.000Z",
    //             // testDateTime: 'Date', // Test DELETE ME //////////////////////
    //             // endCreatedDateTime: new Date().toString(),
    //             revisionNumber: '1',
    //             reasonCode: 'string', // optionnal in case of TVC modulation
    //             senderMarketParticipantMrid: '17V000000992746D', // FK?
    //             receiverMarketParticipantMrid: '17X000001309745X', // FK?
    //             // reconciliation: false,
    //             subOrderList: [''],
    //         }
    //         await star.CreateActivationDocument(transactionContext, JSON.stringify(orderEnd));


    //         // let ret = JSON.parse((await transactionContext.stub.getState("8c56459a-794a-4ed1-a7f6-33b0064508f1")).toString());
    //         // expect(ret).to.eql( Object.assign({docType: 'activationDocument', reconciliation: true, subOrderList: ['8c56459a-794a-4ed1-a7f6-33b0064508f2']}, order ));
    //         let retEnd = JSON.parse((await transactionContext.stub.getState("8c56459a-794a-4ed1-a7f6-33b0064508f2")).toString());
    //         expect(retEnd).to.eql( Object.assign({docType: 'activationDocument', reconciliation: false}, orderEnd ));
    //     });

        it('should return SUCCESS CreateActivationDocument end order HTB RTE', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);

            transactionContext.stub.getState.withArgs(Values.HTB_systemoperator.systemOperatorMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTB_systemoperator)));
            transactionContext.stub.getState.withArgs(Values.HTA_systemoperator2.systemOperatorMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_systemoperator2)));

            await star.CreateActivationDocument(transactionContext, JSON.stringify(Values.HTB_ActivationDocument_HTA));

            const queryDate = Values.HTB_ActivationDocument_HTA_EndTrue.startCreatedDateTime;
            const datetmp = new Date(queryDate);
            datetmp.setUTCMilliseconds(0);
            datetmp.setUTCSeconds(0);
            datetmp.setUTCMinutes(0);
            datetmp.setUTCHours(0);
            const dateYesterday = new Date(datetmp.getTime() - 86400000);
            const registeredResourceMrid = Values.HTB_ActivationDocument_HTA_EndTrue.registeredResourceMrid;
            const query = `{
            "selector": {
                "docType": "activationDocument",
                "registeredResourceMrid": "${registeredResourceMrid}",
                "reconciliation": false,
                "startCreatedDateTime": {
                    "$gte": ${JSON.stringify(dateYesterday)},
                    "$lte": ${JSON.stringify(queryDate)}
                },
                "sort": [{
                    "startCreatedDateTime": "desc"
                }]
            }
        }`;

            const activationDocument: ActivationDocument = JSON.parse(JSON.stringify(Values.HTB_ActivationDocument_HTA));
            activationDocument.docType="activationDocument";
            const iterator = Values.getActivationDocumentQueryMock(activationDocument,mockHandler);
            transactionContext.stub.getQueryResult.withArgs(query).resolves(iterator);

            await star.CreateActivationDocument(transactionContext, JSON.stringify(Values.HTB_ActivationDocument_HTA_EndTrue));


            let ret = await transactionContext.stub.getState(Values.HTB_ActivationDocument_HTA.activationDocumentMrid);
            ret = JSON.parse(ret);
            const expected: ActivationDocument = JSON.parse(JSON.stringify(Values.HTB_ActivationDocument_HTA));
            expected.docType="activationDocument"
            expected.reconciliation=true
            expected.subOrderList = [Values.HTB_ActivationDocument_HTA_EndTrue.activationDocumentMrid]

            expect(ret).to.eql(expected);

            let retEnd = await transactionContext.stub.getState(Values.HTB_ActivationDocument_HTA_EndTrue.activationDocumentMrid);
            retEnd = JSON.parse(retEnd);
            const expectedEnd: ActivationDocument = JSON.parse(JSON.stringify(Values.HTB_ActivationDocument_HTA_EndTrue));
            expectedEnd.docType="activationDocument"
            expectedEnd.reconciliation=true
            expectedEnd.subOrderList = [Values.HTB_ActivationDocument_HTA.activationDocumentMrid]

            expect(retEnd).to.eql(expectedEnd);
        });

        it('should return SUCCESS CreateActivationDocument end order HTB RTE for coverage', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);

            transactionContext.stub.getState.withArgs(Values.HTB_systemoperator.systemOperatorMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTB_systemoperator)));
            transactionContext.stub.getState.withArgs(Values.HTA_systemoperator2.systemOperatorMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_systemoperator2)));

            const activationDocument: ActivationDocument = JSON.parse(JSON.stringify(Values.HTB_ActivationDocument_HTA));
            activationDocument.subOrderList = [];
            await star.CreateActivationDocument(transactionContext, JSON.stringify(activationDocument));

            const queryDate = Values.HTB_ActivationDocument_HTA_EndTrue.startCreatedDateTime;
            const datetmp = new Date(queryDate);
            datetmp.setUTCMilliseconds(0);
            datetmp.setUTCSeconds(0);
            datetmp.setUTCMinutes(0);
            datetmp.setUTCHours(0);
            const dateYesterday = new Date(datetmp.getTime() - 86400000);
            const registeredResourceMrid = Values.HTB_ActivationDocument_HTA_EndTrue.registeredResourceMrid;
            const query = `{
            "selector": {
                "docType": "activationDocument",
                "registeredResourceMrid": "${registeredResourceMrid}",
                "reconciliation": false,
                "startCreatedDateTime": {
                    "$gte": ${JSON.stringify(dateYesterday)},
                    "$lte": ${JSON.stringify(queryDate)}
                },
                "sort": [{
                    "startCreatedDateTime": "desc"
                }]
            }
        }`;

            activationDocument.docType="activationDocument";
            const iterator = Values.getActivationDocumentQueryMock(activationDocument,mockHandler);
            transactionContext.stub.getQueryResult.withArgs(query).resolves(iterator);

            const activationDocument_EndTrue: ActivationDocument = JSON.parse(JSON.stringify(Values.HTB_ActivationDocument_HTA_EndTrue));
            activationDocument_EndTrue.subOrderList = [];
            await star.CreateActivationDocument(transactionContext, JSON.stringify(activationDocument_EndTrue));

            let ret = await transactionContext.stub.getState(Values.HTB_ActivationDocument_HTA.activationDocumentMrid);
            ret = JSON.parse(ret);
            const expected: ActivationDocument = JSON.parse(JSON.stringify(Values.HTB_ActivationDocument_HTA));
            expected.docType="activationDocument"
            expected.reconciliation=true
            expected.subOrderList = [Values.HTB_ActivationDocument_HTA_EndTrue.activationDocumentMrid]

            expect(ret).to.eql(expected);

            let retEnd = await transactionContext.stub.getState(Values.HTB_ActivationDocument_HTA_EndTrue.activationDocumentMrid);
            retEnd = JSON.parse(retEnd);
            const expectedEnd: ActivationDocument = JSON.parse(JSON.stringify(Values.HTB_ActivationDocument_HTA_EndTrue));
            expectedEnd.docType="activationDocument"
            expectedEnd.reconciliation=true
            expectedEnd.subOrderList = [Values.HTB_ActivationDocument_HTA.activationDocumentMrid]

            expect(retEnd).to.eql(expectedEnd);
        });
    });










    describe('Test BB/BE reconciliations', () => {

        it('should return SUCCESS CreateActivationDocument couple HTA with BB reconciliation', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);

            transactionContext.stub.getState.withArgs(Values.HTB_systemoperator.systemOperatorMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTB_systemoperator)));
            transactionContext.stub.getState.withArgs(Values.HTA_systemoperator.systemOperatorMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_systemoperator)));
            transactionContext.stub.getState.withArgs(Values.HTA_systemoperator2.systemOperatorMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_systemoperator2)));
            transactionContext.stub.getState.withArgs(Values.HTA_Producer.producerMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_Producer)));


            const activationDocument: ActivationDocument = JSON.parse(JSON.stringify(Values.HTB_ActivationDocument_HTA));
            await star.CreateActivationDocument(transactionContext, JSON.stringify(activationDocument));

            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);

            const activationDocument_EndDate: ActivationDocument = JSON.parse(JSON.stringify(Values.HTA_ActivationDocument_HTB));

            const queryDate = activationDocument_EndDate.startCreatedDateTime;
            const datetmp = new Date(queryDate);
            datetmp.setUTCMilliseconds(0);
            datetmp.setUTCSeconds(0);
            const dateMinus5min = new Date(datetmp.getTime() - 300000);
            const registeredResourceMrid = activationDocument_EndDate.registeredResourceMrid;
            const senderMarketParticipantMrid = activationDocument_EndDate.senderMarketParticipantMrid
            const query = `{
            "selector": {
                "docType": "activationDocument",
                "senderMarketParticipantMrid": "${senderMarketParticipantMrid}",
                "registeredResourceMrid": "${registeredResourceMrid}",
                "reconciliation": false,
                "startCreatedDateTime": {
                    "$gte": ${JSON.stringify(dateMinus5min)},
                    "$lte": ${JSON.stringify(queryDate)}
                },
                "sort": [{
                    "startCreatedDateTime" : "desc"
                }]
            }
        }`;

            activationDocument.docType="activationDocument";
            const iterator = Values.getActivationDocumentQueryMock(activationDocument,mockHandler);
            transactionContext.stub.getQueryResult.withArgs(query).resolves(iterator);

            transactionContext.stub.getState.withArgs(Values.HTA_yellowPage.originAutomationRegisteredResourceMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_yellowPage)));

            const collectionName=await ParametersController.getParameter(transactionContext, ParametersType.SITE);
            transactionContext.stub.getPrivateData.withArgs(collectionName, activationDocument_EndDate.registeredResourceMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_site_valid)));

            await star.CreateActivationDocument(transactionContext, JSON.stringify(activationDocument_EndDate));


            let ret = await transactionContext.stub.getState(Values.HTB_ActivationDocument_HTA.activationDocumentMrid);
            ret = JSON.parse(ret);
            const expected: ActivationDocument = JSON.parse(JSON.stringify(Values.HTB_ActivationDocument_HTA));
            expected.docType="activationDocument"
            expected.subOrderList = [Values.HTA_ActivationDocument_HTB.activationDocumentMrid]

            expect(ret).to.eql(expected);

            let retEnd = await transactionContext.stub.getState(Values.HTA_ActivationDocument_HTB.activationDocumentMrid);
            retEnd = JSON.parse(retEnd);
            const expectedEnd: ActivationDocument = JSON.parse(JSON.stringify(Values.HTA_ActivationDocument_HTB));
            expectedEnd.docType="activationDocument"
            expectedEnd.reconciliation=true
            expectedEnd.subOrderList = [Values.HTB_ActivationDocument_HTA.activationDocumentMrid]

            expect(retEnd).to.eql(expectedEnd);
        });




        it('should return SUCCESS CreateActivationDocument couple HTA with BB reconciliation for coverage', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);

            transactionContext.stub.getState.withArgs(Values.HTB_systemoperator.systemOperatorMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTB_systemoperator)));
            transactionContext.stub.getState.withArgs(Values.HTA_systemoperator.systemOperatorMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_systemoperator)));
            transactionContext.stub.getState.withArgs(Values.HTA_systemoperator2.systemOperatorMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_systemoperator2)));
            transactionContext.stub.getState.withArgs(Values.HTA_Producer.producerMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_Producer)));


            const activationDocument: ActivationDocument = JSON.parse(JSON.stringify(Values.HTB_ActivationDocument_HTA));
            activationDocument.subOrderList = []
            await star.CreateActivationDocument(transactionContext, JSON.stringify(activationDocument));

            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);

            const activationDocument_EndDate: ActivationDocument = JSON.parse(JSON.stringify(Values.HTA_ActivationDocument_HTB));

            const queryDate = activationDocument_EndDate.startCreatedDateTime;
            const datetmp = new Date(queryDate);
            datetmp.setUTCMilliseconds(0);
            datetmp.setUTCSeconds(0);
            const dateMinus5min = new Date(datetmp.getTime() - 300000);
            const registeredResourceMrid = activationDocument_EndDate.registeredResourceMrid;
            const senderMarketParticipantMrid = activationDocument_EndDate.senderMarketParticipantMrid
            const query = `{
            "selector": {
                "docType": "activationDocument",
                "senderMarketParticipantMrid": "${senderMarketParticipantMrid}",
                "registeredResourceMrid": "${registeredResourceMrid}",
                "reconciliation": false,
                "startCreatedDateTime": {
                    "$gte": ${JSON.stringify(dateMinus5min)},
                    "$lte": ${JSON.stringify(queryDate)}
                },
                "sort": [{
                    "startCreatedDateTime" : "desc"
                }]
            }
        }`;

            activationDocument.docType="activationDocument";
            const iterator = Values.getActivationDocumentQueryMock(activationDocument,mockHandler);
            transactionContext.stub.getQueryResult.withArgs(query).resolves(iterator);

            transactionContext.stub.getState.withArgs(Values.HTA_yellowPage.originAutomationRegisteredResourceMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_yellowPage)));

            const collectionName=await ParametersController.getParameter(transactionContext, ParametersType.SITE);
            transactionContext.stub.getPrivateData.withArgs(collectionName, activationDocument_EndDate.registeredResourceMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_site_valid)));

            activationDocument_EndDate.subOrderList = []

            await star.CreateActivationDocument(transactionContext, JSON.stringify(activationDocument_EndDate));


            let ret = await transactionContext.stub.getState(Values.HTB_ActivationDocument_HTA.activationDocumentMrid);
            ret = JSON.parse(ret);
            const expected: ActivationDocument = JSON.parse(JSON.stringify(Values.HTB_ActivationDocument_HTA));
            expected.docType="activationDocument"
            expected.subOrderList = [Values.HTA_ActivationDocument_HTB.activationDocumentMrid]

            expect(ret).to.eql(expected);

            let retEnd = await transactionContext.stub.getState(Values.HTA_ActivationDocument_HTB.activationDocumentMrid);
            retEnd = JSON.parse(retEnd);
            const expectedEnd: ActivationDocument = JSON.parse(JSON.stringify(Values.HTA_ActivationDocument_HTB));
            expectedEnd.docType="activationDocument"
            expectedEnd.reconciliation=true
            expectedEnd.subOrderList = [Values.HTB_ActivationDocument_HTA.activationDocumentMrid]

            expect(retEnd).to.eql(expectedEnd);
        });

        it('should return SUCCESS CreateActivationDocument couple HTA with BB and BE reconciliation', async () => {
            /* RTE */
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);

            transactionContext.stub.getState.withArgs(Values.HTA_Producer.producerMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_Producer)));
            transactionContext.stub.getState.withArgs(Values.HTA_systemoperator.systemOperatorMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_systemoperator2)));
            transactionContext.stub.getState.withArgs(Values.HTA_systemoperator2.systemOperatorMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_systemoperator2)));
            transactionContext.stub.getState.withArgs(Values.HTB_systemoperator.systemOperatorMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTB_systemoperator)));

            const activationDocument: ActivationDocument = JSON.parse(JSON.stringify(Values.HTB_ActivationDocument_HTA));

            await star.CreateActivationDocument(transactionContext, JSON.stringify(activationDocument));

            /* ENEDIS */
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);

            const collectionName=await ParametersController.getParameter(transactionContext, ParametersType.SITE);
            transactionContext.stub.getPrivateData.withArgs(collectionName, Values.HTA_ActivationDocument_Valid.registeredResourceMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_site_valid)));
            transactionContext.stub.getState.withArgs(Values.HTA_yellowPage.originAutomationRegisteredResourceMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_yellowPage)));

            const activationDocument_EndDate = JSON.parse(JSON.stringify(Values.HTA_ActivationDocument_Valid));

            const queryDateBB = activationDocument_EndDate.startCreatedDateTime;
            const dateBBtmp = new Date(queryDateBB);
            dateBBtmp.setUTCMilliseconds(0);
            dateBBtmp.setUTCSeconds(0);
            const dateBBMinus5min = new Date(dateBBtmp.getTime() - 300000);
            const registeredResourceMridBB = activationDocument_EndDate.registeredResourceMrid;
            const senderMarketParticipantMridBB = activationDocument_EndDate.senderMarketParticipantMrid
            const queryBB = `{
            "selector": {
                "docType": "activationDocument",
                "senderMarketParticipantMrid": "${senderMarketParticipantMridBB}",
                "registeredResourceMrid": "${registeredResourceMridBB}",
                "reconciliation": false,
                "startCreatedDateTime": {
                    "$gte": ${JSON.stringify(dateBBMinus5min)},
                    "$lte": ${JSON.stringify(queryDateBB)}
                },
                "sort": [{
                    "startCreatedDateTime" : "desc"
                }]
            }
        }`;

            activationDocument.docType="activationDocument";
            const iteratorBB = Values.getActivationDocumentQueryMock(activationDocument,mockHandler);
            transactionContext.stub.getQueryResult.withArgs(queryBB).resolves(iteratorBB);


            await star.CreateActivationDocument(transactionContext, JSON.stringify(activationDocument_EndDate));

            /* RTE */
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);

            const activationDocument_EndTrue = Values.HTB_ActivationDocument_HTA_EndTrue

            const queryDateBE = activationDocument_EndTrue.startCreatedDateTime;
            const dateBEtmp = new Date(queryDateBE);
            dateBEtmp.setUTCMilliseconds(0);
            dateBEtmp.setUTCSeconds(0);
            dateBEtmp.setUTCMinutes(0);
            dateBEtmp.setUTCHours(0);
            const dateBEYesterday = new Date(dateBEtmp.getTime() - 86400000);
            const registeredResourceMridBE = activationDocument_EndTrue.registeredResourceMrid;
            const queryBE = `{
            "selector": {
                "docType": "activationDocument",
                "registeredResourceMrid": "${registeredResourceMridBE}",
                "reconciliation": false,
                "startCreatedDateTime": {
                    "$gte": ${JSON.stringify(dateBEYesterday)},
                    "$lte": ${JSON.stringify(queryDateBE)}
                },
                "sort": [{
                    "startCreatedDateTime": "desc"
                }]
            }
        }`;

            activationDocument_EndDate.docType="activationDocument";
            const iteratorBE = Values.getActivationDocumentQueryMock2Values(activationDocument,activationDocument_EndDate,mockHandler);
            transactionContext.stub.getQueryResult.withArgs(queryBE).resolves(iteratorBE);


            await star.CreateActivationDocument(transactionContext, JSON.stringify(activationDocument_EndTrue));

            /* TESTS */

            let ret = await transactionContext.stub.getState(activationDocument.activationDocumentMrid);
            // console.info("ret=%s", ret)
            ret = JSON.parse(ret);
            const expected: ActivationDocument = JSON.parse(JSON.stringify(activationDocument));
            expected.docType="activationDocument"
            expected.reconciliation=true
            expected.subOrderList = [activationDocument_EndTrue.activationDocumentMrid]

            expect(ret).to.eql(expected);

            let retEndDate = await transactionContext.stub.getState(activationDocument_EndDate.activationDocumentMrid);
            // console.info("ret=%s", retEndDate)
            retEndDate = JSON.parse(retEndDate);
            const expectedEndDate: ActivationDocument = JSON.parse(JSON.stringify(activationDocument_EndDate));
            expectedEndDate.docType="activationDocument"
            expectedEndDate.reconciliation=true
            expectedEndDate.subOrderList = [activationDocument.activationDocumentMrid]

            expect(retEndDate).to.eql(expectedEndDate);

            let retEndTrue = await transactionContext.stub.getState(activationDocument_EndTrue.activationDocumentMrid);
            // console.info("ret=%s", retEndTrue)
            retEndTrue = JSON.parse(retEndTrue);
            const expectedEndTrue: ActivationDocument = JSON.parse(JSON.stringify(activationDocument_EndTrue));
            expectedEndTrue.docType="activationDocument"
            expectedEndTrue.reconciliation=true
            expectedEndTrue.subOrderList = [activationDocument.activationDocumentMrid]

            expect(retEndTrue).to.eql(expectedEndTrue);
        });

        it('should return SUCCESS CreateActivationDocument couple HTA with BB and BE reconciliation for coverage', async () => {
            /* RTE */
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);

            transactionContext.stub.getState.withArgs(Values.HTA_Producer.producerMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_Producer)));
            transactionContext.stub.getState.withArgs(Values.HTA_systemoperator.systemOperatorMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_systemoperator2)));
            transactionContext.stub.getState.withArgs(Values.HTA_systemoperator2.systemOperatorMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_systemoperator2)));
            transactionContext.stub.getState.withArgs(Values.HTB_systemoperator.systemOperatorMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTB_systemoperator)));

            const activationDocument: ActivationDocument = JSON.parse(JSON.stringify(Values.HTB_ActivationDocument_HTA));

            activationDocument.subOrderList = []
            await star.CreateActivationDocument(transactionContext, JSON.stringify(activationDocument));

            /* ENEDIS */
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);

            const collectionName=await ParametersController.getParameter(transactionContext, ParametersType.SITE);
            transactionContext.stub.getPrivateData.withArgs(collectionName, Values.HTA_ActivationDocument_Valid.registeredResourceMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_site_valid)));
            transactionContext.stub.getState.withArgs(Values.HTA_yellowPage.originAutomationRegisteredResourceMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_yellowPage)));

            const activationDocument_EndDate = JSON.parse(JSON.stringify(Values.HTA_ActivationDocument_Valid));

            const queryDateBB = activationDocument_EndDate.startCreatedDateTime;
            const dateBBtmp = new Date(queryDateBB);
            dateBBtmp.setUTCMilliseconds(0);
            dateBBtmp.setUTCSeconds(0);
            const dateBBMinus5min = new Date(dateBBtmp.getTime() - 300000);
            const registeredResourceMridBB = activationDocument_EndDate.registeredResourceMrid;
            const senderMarketParticipantMridBB = activationDocument_EndDate.senderMarketParticipantMrid
            const queryBB = `{
            "selector": {
                "docType": "activationDocument",
                "senderMarketParticipantMrid": "${senderMarketParticipantMridBB}",
                "registeredResourceMrid": "${registeredResourceMridBB}",
                "reconciliation": false,
                "startCreatedDateTime": {
                    "$gte": ${JSON.stringify(dateBBMinus5min)},
                    "$lte": ${JSON.stringify(queryDateBB)}
                },
                "sort": [{
                    "startCreatedDateTime" : "desc"
                }]
            }
        }`;

            activationDocument.docType="activationDocument";
            const iteratorBB = Values.getActivationDocumentQueryMock(activationDocument,mockHandler);
            transactionContext.stub.getQueryResult.withArgs(queryBB).resolves(iteratorBB);

            activationDocument_EndDate.subOrderList = []
            await star.CreateActivationDocument(transactionContext, JSON.stringify(activationDocument_EndDate));

            /* RTE */
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);

            const activationDocument_EndTrue = Values.HTB_ActivationDocument_HTA_EndTrue

            const queryDateBE = activationDocument_EndTrue.startCreatedDateTime;
            const dateBEtmp = new Date(queryDateBE);
            dateBEtmp.setUTCMilliseconds(0);
            dateBEtmp.setUTCSeconds(0);
            dateBEtmp.setUTCMinutes(0);
            dateBEtmp.setUTCHours(0);
            const dateBEYesterday = new Date(dateBEtmp.getTime() - 86400000);
            const registeredResourceMridBE = activationDocument_EndTrue.registeredResourceMrid;
            const queryBE = `{
            "selector": {
                "docType": "activationDocument",
                "registeredResourceMrid": "${registeredResourceMridBE}",
                "reconciliation": false,
                "startCreatedDateTime": {
                    "$gte": ${JSON.stringify(dateBEYesterday)},
                    "$lte": ${JSON.stringify(queryDateBE)}
                },
                "sort": [{
                    "startCreatedDateTime": "desc"
                }]
            }
        }`;

            activationDocument_EndDate.docType="activationDocument";
            const iteratorBE = Values.getActivationDocumentQueryMock2Values(activationDocument,activationDocument_EndDate,mockHandler);
            transactionContext.stub.getQueryResult.withArgs(queryBE).resolves(iteratorBE);

            activationDocument_EndTrue.subOrderList = []
            await star.CreateActivationDocument(transactionContext, JSON.stringify(activationDocument_EndTrue));

            /* TESTS */

            let ret = await transactionContext.stub.getState(activationDocument.activationDocumentMrid);
            // console.info("ret=%s", ret)
            ret = JSON.parse(ret);
            const expected: ActivationDocument = JSON.parse(JSON.stringify(activationDocument));
            expected.docType="activationDocument"
            expected.reconciliation=true
            expected.subOrderList = [activationDocument_EndTrue.activationDocumentMrid]

            expect(ret).to.eql(expected);

            let retEndDate = await transactionContext.stub.getState(activationDocument_EndDate.activationDocumentMrid);
            // console.info("ret=%s", retEndDate)
            retEndDate = JSON.parse(retEndDate);
            const expectedEndDate: ActivationDocument = JSON.parse(JSON.stringify(activationDocument_EndDate));
            expectedEndDate.docType="activationDocument"
            expectedEndDate.reconciliation=true
            expectedEndDate.subOrderList = [activationDocument.activationDocumentMrid]

            expect(retEndDate).to.eql(expectedEndDate);

            let retEndTrue = await transactionContext.stub.getState(activationDocument_EndTrue.activationDocumentMrid);
            // console.info("ret=%s", retEndTrue)
            retEndTrue = JSON.parse(retEndTrue);
            const expectedEndTrue: ActivationDocument = JSON.parse(JSON.stringify(activationDocument_EndTrue));
            expectedEndTrue.docType="activationDocument"
            expectedEndTrue.reconciliation=true
            expectedEndTrue.subOrderList = [activationDocument.activationDocumentMrid]

            expect(retEndTrue).to.eql(expectedEndTrue);
        });
    });
});
