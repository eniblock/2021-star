'use strict';
const sinon = require('sinon');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinonChai = require('sinon-chai');
const expect = chai.expect;

import { ChaincodeStub, ClientIdentity } from 'fabric-shim'

import { Star } from '../src/star'
import { ActivationDocument } from '../src/model/activationDocument';
import { Parameters } from '../src/model/parameters';

import { OrganizationTypeMsp } from '../src/enums/OrganizationMspType';

import { Values } from './Values';
import { ParametersController } from '../src/controller/ParametersController';
import { ParametersType } from '../src/enums/ParametersType';
import { Console } from 'console';

class TestContext {
    clientIdentity: any;
    stub: any;

    constructor() {
        this.clientIdentity = sinon.createStubInstance(ClientIdentity);
        this.clientIdentity.getMSPID.returns(Values.FakeMSP);
        this.stub = sinon.createStubInstance(ChaincodeStub);
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
        it('should return ERROR on CreateActivationDocument', async () => {
            transactionContext.stub.putPrivateData.rejects("enedis-producer", 'failed inserting key');

            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);
            try {
                const activationDocument:ActivationDocument = JSON.parse(JSON.stringify(Values.HTA_ActivationDocument_Valid));

                transactionContext.stub.getState.withArgs(Values.HTA_systemoperator.systemOperatorMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_systemoperator)));
                transactionContext.stub.getState.withArgs(Values.HTA_Producer.producerMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_Producer)));

                const params: Parameters = await ParametersController.getParameterValues(transactionContext);
            const collectionNames: string[] = params.values.get(ParametersType.SITE);
                transactionContext.stub.getPrivateData.withArgs(collectionNames[0], Values.HTA_site_valid.meteringPointMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_site_valid)));

                await star.CreateActivationDocument(transactionContext, JSON.stringify(activationDocument));
            } catch(err) {
                console.info(err.message)
                expect(err.message).to.equal('failed inserting key');
            }
        });

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

            const params: Parameters = await ParametersController.getParameterValues(transactionContext);
            const collectionNames: string[] = params.values.get(ParametersType.SITE);
            transactionContext.stub.getPrivateData.withArgs(collectionNames[0], Values.HTA_site_valid.meteringPointMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_site_valid)));

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
                expect(err.message).to.equal('Organisation, '
                    .concat(Values.FakeMSP)
                    .concat(' does not have write access for Activation Document'));
            }
        });

        /* no more test on unit measure 2022-06-02 */
        // it('should return ERROR CreateActivationDocument couple HTA wrong unit measure', async () => {
        //     transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);
        //     const activationDocument:ActivationDocument = JSON.parse(JSON.stringify(Values.HTB_ActivationDocument_Valid));

        //     try {
        //         await star.CreateActivationDocument(transactionContext, JSON.stringify(activationDocument));
        //     } catch(err) {
        //         console.info(err.message)
        //         expect(err.message).to.equal('Organisation, enedis does not have write access for MW orders');
        //     }
        // });

        it('should return ERROR CreateActivationDocument couple HTA missing systemoperator', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);
            const activationDocument:ActivationDocument = JSON.parse(JSON.stringify(Values.HTA_ActivationDocument_Valid));
            // transactionContext.stub.getState.withArgs(Values.HTA_systemoperator.systemOperatorMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_systemoperator)));
            transactionContext.stub.getState.withArgs(Values.HTA_Producer.producerMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_Producer)));

            const params: Parameters = await ParametersController.getParameterValues(transactionContext);
            const collectionNames: string[] = params.values.get(ParametersType.SITE);
            transactionContext.stub.getPrivateData.withArgs(collectionNames[0], Values.HTA_site_valid.meteringPointMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_site_valid)));

            try {
                await star.CreateActivationDocument(transactionContext, JSON.stringify(activationDocument));
            } catch(err) {
                console.info(err.message)
                expect(err.message).to.equal('System Operator : '
                    .concat(Values.HTA_systemoperator.systemOperatorMarketParticipantMrid)
                    .concat(' does not exist for Activation Document ')
                    .concat(activationDocument.activationDocumentMrid)
                    .concat(' creation.'));
            }
        });

        it('should return ERROR CreateActivationDocument couple HTA missing producer', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);
            const activationDocument:ActivationDocument = JSON.parse(JSON.stringify(Values.HTA_ActivationDocument_Valid));
            transactionContext.stub.getState.withArgs(Values.HTA_systemoperator.systemOperatorMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_systemoperator)));
            // transactionContext.stub.getState.withArgs(Values.HTA_Producer.producerMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_Producer)));

            const params: Parameters = await ParametersController.getParameterValues(transactionContext);
            const collectionNames: string[] = params.values.get(ParametersType.SITE);
            transactionContext.stub.getPrivateData.withArgs(collectionNames[0], Values.HTA_site_valid.meteringPointMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_site_valid)));

            try {
                await star.CreateActivationDocument(transactionContext, JSON.stringify(activationDocument));
            } catch(err) {
                // console.info(err.message)
                expect(err.message).to.equal('Producer : '
                    .concat(Values.HTA_Producer.producerMarketParticipantMrid)
                    .concat(' does not exist for Activation Document ')
                    .concat(activationDocument.activationDocumentMrid)
                    .concat(' creation.'));
            }
        });

        it('should return ERROR CreateActivationDocument couple HTA missing to much optional fields', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);
            const activationDocument:ActivationDocument = JSON.parse(JSON.stringify(Values.HTA_ActivationDocument_Valid));
            transactionContext.stub.getState.withArgs(Values.HTA_systemoperator.systemOperatorMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_systemoperator)));
            transactionContext.stub.getState.withArgs(Values.HTA_Producer.producerMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_Producer)));

            const params: Parameters = await ParametersController.getParameterValues(transactionContext);
            const collectionNames: string[] = params.values.get(ParametersType.SITE);
            transactionContext.stub.getPrivateData.withArgs(collectionNames[0], Values.HTA_site_valid.meteringPointMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_site_valid)));

            var input = JSON.stringify(activationDocument);
            input = await Values.deleteJSONField(input, "orderValue");
            input = await Values.deleteJSONField(input, "endCreatedDateTime");

            try {
                await star.CreateActivationDocument(transactionContext, input);
            } catch(err) {
                console.info(err.message)
                expect(err.message).to.equal('Order must have a limitation value');
            }
        });

        it('should return SUCCESS CreateActivationDocument couple HTA', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);
            const activationDocument:ActivationDocument = JSON.parse(JSON.stringify(Values.HTA_ActivationDocument_Valid));
            transactionContext.stub.getState.withArgs(Values.HTA_systemoperator.systemOperatorMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_systemoperator)));
            transactionContext.stub.getState.withArgs(Values.HTA_Producer.producerMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_Producer)));

            const params: Parameters = await ParametersController.getParameterValues(transactionContext);
            const collectionNames: string[] = params.values.get(ParametersType.SITE);
            transactionContext.stub.getPrivateData.withArgs(collectionNames[0], Values.HTA_site_valid.meteringPointMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_site_valid)));

            // const iterator = Values.getYellowPageQueryMock(Values.HTA_yellowPage, mockHandler);
            // const query = `{"selector": {"docType": "yellowPages", "originAutomationRegisteredResourceMrid": "${activationDocument.originAutomationRegisteredResourceMrid}"}}`;
            // transactionContext.stub.getQueryResult.withArgs(query).resolves(iterator);

            await star.CreateActivationDocument(transactionContext, JSON.stringify(activationDocument));

            const expected: ActivationDocument = activationDocument;
            expected.orderEnd = true;
            expected.potentialParent = false;
            expected.potentialChild = true;
            expected.docType = 'activationDocument';

            // console.info("-----------")
            // console.info(transactionContext.stub.putPrivateData.firstCall.args);
            // console.info("ooooooooo")
            // console.info(Buffer.from(transactionContext.stub.putPrivateData.firstCall.args[2].toString()).toString('utf8'));
            // console.info(JSON.stringify(expected))
            // console.info("-----------")


            transactionContext.stub.putPrivateData.should.have.been.calledOnceWithExactly(
                "enedis-producer",
                expected.activationDocumentMrid,
                Buffer.from(JSON.stringify(expected))
            );
        });
    });
////////////////////////////////////////////////////////////////////////////
////////////////////////////////////    BEGIN     ////////////////////////////
////////////////////////////////////////////////////////////////////////////
    describe('Test CreateActivationDocument Début HTB RTE', () => {
        it('should return ERROR on CreateActivationDocument NON-JSON Value', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);
            try {
                await star.CreateActivationDocument(transactionContext, 'XXXXXX');
            } catch(err) {
                // console.info(err.message)
                expect(err.message).to.equal('ERROR createActivationDocument-> Input string NON-JSON value');
            }
        });

        it('should return ERROR CreateActivationDocument wrong JSON', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);

            var input = JSON.stringify(Values.HTB_ActivationDocument_JustStartDate);
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

            var input = JSON.stringify(Values.HTB_ActivationDocument_JustStartDate);
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

            const params: Parameters = await ParametersController.getParameterValues(transactionContext);
            const collectionNames: string[] = params.values.get(ParametersType.SITE);
            transactionContext.stub.getPrivateData.withArgs(collectionNames[0], Values.HTA_site_valid.meteringPointMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_site_valid)));

            try {
                await star.CreateActivationDocument(transactionContext, JSON.stringify(activationDocument));
            } catch(err) {
                console.info(err.message)
                expect(err.message).to.equal('Organisation, rte does not have write access for KW orders');
            }
        });

        it('should return ERROR CreateActivationDocument begin HTB site doesn\'t exist', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);
            const activationDocument:ActivationDocument = JSON.parse(JSON.stringify(Values.HTB_ActivationDocument_JustStartDate));
            transactionContext.stub.getState.withArgs(Values.HTB_systemoperator.systemOperatorMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTB_systemoperator)));
            transactionContext.stub.getState.withArgs(Values.HTB_Producer.producerMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTB_Producer)));

            // const params: Parameters = await ParametersController.getParameterValues(transactionContext);
            // const collectionNames: string[] = params.values.get(ParametersType.SITE);
            // transactionContext.stub.getPrivateData.withArgs(collectionNames[0], Values.HTB_site_valid.meteringPointMrid).resolves(Buffer.from(JSON.stringify(Values.HTB_site_valid)));

            try {
                await star.CreateActivationDocument(transactionContext, JSON.stringify(activationDocument));
            } catch(err) {
                console.info(err.message)
                expect(err.message).to.equal('Site : '
                    .concat(Values.HTB_site_valid.meteringPointMrid)
                    .concat(' does not exist for Activation Document ')
                    .concat(activationDocument.activationDocumentMrid)
                    .concat(' creation.'));
            }
        });

        it('should return ERROR CreateActivationDocument begin HTB producer doesn\'t exist', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);
            const activationDocument:ActivationDocument = JSON.parse(JSON.stringify(Values.HTB_ActivationDocument_JustStartDate));
            transactionContext.stub.getState.withArgs(Values.HTB_systemoperator.systemOperatorMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTB_systemoperator)));
            // transactionContext.stub.getState.withArgs(Values.HTB_Producer.producerMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTB_Producer)));

            // const params: Parameters = await ParametersController.getParameterValues(transactionContext);
            // const collectionNames: string[] = params.values.get(ParametersType.SITE);
            // transactionContext.stub.getPrivateData.withArgs(collectionNames[0], Values.HTB_site_valid.meteringPointMrid).resolves(Buffer.from(JSON.stringify(Values.HTB_site_valid)));

            try {
                await star.CreateActivationDocument(transactionContext, JSON.stringify(activationDocument));
            } catch(err) {
                console.info(err.message)
                expect(err.message).to.equal('Producer : '
                    .concat(Values.HTB_Producer.producerMarketParticipantMrid)
                    .concat(' does not exist for Activation Document ')
                    .concat(activationDocument.activationDocumentMrid)
                    .concat(' creation.'));
            }
        });

        it('should return SUCCESS CreateActivationDocument Begining order HTB RTE', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);
            const activationDocument:ActivationDocument = JSON.parse(JSON.stringify(Values.HTB_ActivationDocument_JustStartDate));
            transactionContext.stub.getState.withArgs(Values.HTB_systemoperator.systemOperatorMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTB_systemoperator)));
            transactionContext.stub.getState.withArgs(Values.HTB_Producer.producerMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTB_Producer)));

            const params: Parameters = await ParametersController.getParameterValues(transactionContext);
            const collectionNames: string[] = params.values.get(ParametersType.SITE);
            transactionContext.stub.getPrivateData.withArgs(collectionNames[0], Values.HTB_site_valid.meteringPointMrid).resolves(Buffer.from(JSON.stringify(Values.HTB_site_valid)));

            await star.CreateActivationDocument(transactionContext, JSON.stringify(activationDocument));

            const expected: ActivationDocument = activationDocument;
            expected.orderEnd = false;
            expected.potentialParent = false;
            expected.potentialChild = false;
            expected.docType = 'activationDocument';

            // console.info("-----------")
            // console.info(transactionContext.stub.putPrivateData.firstCall.args);
            // console.info("ooooooooo")
            // console.info(Buffer.from(transactionContext.stub.putPrivateData.firstCall.args[2].toString()).toString('utf8'));
            // console.info(JSON.stringify(expected))
            // console.info("-----------")


            transactionContext.stub.putPrivateData.should.have.been.calledOnceWithExactly(
                "producer-rte",
                expected.activationDocumentMrid,
                Buffer.from(JSON.stringify(expected))
            );
        });

    });
// // ////////////////////////////////////////////////////////////////////////////
// // ////////////////////////////////////    GET     ////////////////////////////
// // ////////////////////////////////////////////////////////////////////////////
    describe('Test GetActivationDocumentByProducer', () => {
        it('should return OK on GetActivationDocumentByProducer empty', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.PRODUCER);
            const producer = 'toto';
            let ret = await star.GetActivationDocumentByProducer(transactionContext, producer);
            ret = JSON.parse(ret);
            // console.log('retADproducer=', ret)
            expect(ret.length).to.equal(0);
            expect(ret).to.eql([]);
        });

        it('should return SUCCESS on GetActivationDocumentByProducer', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.PRODUCER);
            const iterator = Values.getActivationDocumentQueryMock2Values(Values.HTA_ActivationDocument_Valid, Values.HTA_ActivationDocument_Valid_Doc2,mockHandler);
            const query = `{"selector": {"docType": "activationDocument", "receiverMarketParticipantMrid": "${Values.HTA_Producer.producerMarketParticipantMrid}"}}`;
            transactionContext.stub.getPrivateDataQueryResult.withArgs("enedis-producer", query).resolves(iterator);


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
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);
            const iterator = Values.getActivationDocumentQueryMock(Values.HTA_ActivationDocument_Valid,mockHandler);
            const query = `{"selector": {"docType": "activationDocument", "senderMarketParticipantMrid": "${Values.HTA_ActivationDocument_Valid.senderMarketParticipantMrid}"}}`;
            transactionContext.stub.getPrivateDataQueryResult.withArgs("enedis-producer", query).resolves(iterator);

            let ret = await star.GetActivationDocumentBySystemOperator(transactionContext, Values.HTA_ActivationDocument_Valid.senderMarketParticipantMrid as string);
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
///////////////////////////////    RECONCILIATION     //////////////////////
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
            transactionContext.stub.getState.withArgs(Values.HTB_Producer.producerMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTB_Producer)));

            const params: Parameters = await ParametersController.getParameterValues(transactionContext);
            const collectionNamesSite: string[] = params.values.get(ParametersType.SITE);
            transactionContext.stub.getPrivateData.withArgs(collectionNamesSite[0], Values.HTB_site_valid.meteringPointMrid).resolves(Buffer.from(JSON.stringify(Values.HTB_site_valid)));


            const activationDocumentStart:ActivationDocument = JSON.parse(JSON.stringify(Values.HTB_ActivationDocument_JustStartDate));
            activationDocumentStart.orderEnd = false;
            activationDocumentStart.potentialParent = false;
            activationDocumentStart.potentialChild = false;
            activationDocumentStart.docType = 'activationDocument';

            const activationDocument_Reconciliation: ActivationDocument = JSON.parse(JSON.stringify(Values.HTB_ActivationDocument_JustEndDate));

            const senderMarketParticipantMrid: string = activationDocument_Reconciliation.senderMarketParticipantMrid as string;
            const registeredResourceMrid: string = activationDocument_Reconciliation.registeredResourceMrid;

            const queryDate: string = activationDocument_Reconciliation.endCreatedDateTime as string;

            const pcuetmt:number = params.values.get(ParametersType.PC_TIME_UPDATEEND_MATCH_THRESHOLD);

            const datetmp = new Date(queryDate);
            datetmp.setUTCMilliseconds(0);
            datetmp.setUTCSeconds(0);
            datetmp.setUTCMinutes(0);
            datetmp.setUTCHours(0);
            const dateYesterday = new Date(datetmp.getTime() - pcuetmt);

        const query = `{
            "selector": {
                "docType": "activationDocument",
                "orderEnd": false,
                "senderMarketParticipantMrid": "${senderMarketParticipantMrid}",
                "registeredResourceMrid": "${registeredResourceMrid}",
                "messageType": { "$in" : ["A54","A98"] },
                "startCreatedDateTime": {
                    "$gte": ${JSON.stringify(dateYesterday)},
                    "$lte": ${JSON.stringify(queryDate)}
                },
                "sort": [{
                    "startCreatedDateTime": "desc"
                }]
            }
        }`;

            const iterator = Values.getActivationDocumentQueryMock(activationDocumentStart, mockHandler);
            transactionContext.stub.getPrivateDataQueryResult.withArgs("producer-rte", query).resolves(iterator);

            await star.CreateActivationDocument(transactionContext, JSON.stringify(activationDocument_Reconciliation));

            activationDocumentStart.orderEnd = true;
            activationDocumentStart.subOrderList = [activationDocument_Reconciliation.activationDocumentMrid];

            const expectedEnd: ActivationDocument = activationDocument_Reconciliation;
            expectedEnd.orderEnd = true;
            expectedEnd.potentialParent = false;
            expectedEnd.potentialChild = false;
            expectedEnd.subOrderList = [activationDocumentStart.activationDocumentMrid];
            expectedEnd.docType="activationDocument";

            // console.info("-----------")
            // console.info(transactionContext.stub.putPrivateData.firstCall.args);
            // console.info("ooooooooo")
            // console.info(Buffer.from(transactionContext.stub.putPrivateData.firstCall.args[2].toString()).toString('utf8'));
            // console.info(JSON.stringify(activationDocumentStart))
            // console.info("-----------")
            // console.info(transactionContext.stub.putPrivateData.secondCall.args);
            // console.info("ooooooooo")
            // console.info(Buffer.from(transactionContext.stub.putPrivateData.secondCall.args[2].toString()).toString('utf8'));
            // console.info(JSON.stringify(expectedEnd))
            // console.info("-----------")

            transactionContext.stub.putPrivateData.firstCall.should.have.been.calledWithExactly(
                "producer-rte",
                activationDocumentStart.activationDocumentMrid,
                Buffer.from(JSON.stringify(activationDocumentStart))
            );

            transactionContext.stub.putPrivateData.secondCall.should.have.been.calledWithExactly(
                "producer-rte",
                expectedEnd.activationDocumentMrid,
                Buffer.from(JSON.stringify(expectedEnd))
            );
        });


        it('should return SUCCESS CreateActivationDocument end order HTB (2 parents, choice on closest date ) RTE', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);

            transactionContext.stub.getState.withArgs(Values.HTB_systemoperator.systemOperatorMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTB_systemoperator)));
            transactionContext.stub.getState.withArgs(Values.HTB_Producer.producerMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTB_Producer)));

            const params: Parameters = await ParametersController.getParameterValues(transactionContext);
            const collectionNamesSite: string[] = params.values.get(ParametersType.SITE);
            transactionContext.stub.getPrivateData.withArgs(collectionNamesSite[0], Values.HTB_site_valid.meteringPointMrid).resolves(Buffer.from(JSON.stringify(Values.HTB_site_valid)));


            const activationDocumentStart:ActivationDocument = JSON.parse(JSON.stringify(Values.HTB_ActivationDocument_JustStartDate));
            activationDocumentStart.orderEnd = false;
            activationDocumentStart.potentialParent = false;
            activationDocumentStart.potentialChild = false;
            activationDocumentStart.docType = 'activationDocument';

            const activationDocumentStartOldest: ActivationDocument = JSON.parse(JSON.stringify(Values.HTB_ActivationDocument_JustStartDate));
            activationDocumentStartOldest.activationDocumentMrid = activationDocumentStartOldest.activationDocumentMrid + "_Old";
            activationDocumentStartOldest.docType="activationDocument";
            activationDocumentStartOldest.potentialParent= true;
            activationDocumentStartOldest.potentialChild= false;
            var dateoldest = new Date(activationDocumentStartOldest.startCreatedDateTime as string);
            dateoldest = new Date(dateoldest.getTime() - 2);
            activationDocumentStartOldest.startCreatedDateTime = JSON.stringify(dateoldest);

            // console.info("##############")
            // console.info(activationDocumentStart)
            // console.info(activationDocumentStartOldest)
            // console.info("##############")

            const activationDocument_Reconciliation: ActivationDocument = JSON.parse(JSON.stringify(Values.HTB_ActivationDocument_JustEndDate));

            const senderMarketParticipantMrid: string = activationDocument_Reconciliation.senderMarketParticipantMrid as string;
            const registeredResourceMrid: string = activationDocument_Reconciliation.registeredResourceMrid;

            const queryDate: string = activationDocument_Reconciliation.endCreatedDateTime as string;

            const pcuetmt:number = params.values.get(ParametersType.PC_TIME_UPDATEEND_MATCH_THRESHOLD);

            const datetmp = new Date(queryDate);
            datetmp.setUTCMilliseconds(0);
            datetmp.setUTCSeconds(0);
            datetmp.setUTCMinutes(0);
            datetmp.setUTCHours(0);
            const dateYesterday = new Date(datetmp.getTime() - pcuetmt);

        const query = `{
            "selector": {
                "docType": "activationDocument",
                "orderEnd": false,
                "senderMarketParticipantMrid": "${senderMarketParticipantMrid}",
                "registeredResourceMrid": "${registeredResourceMrid}",
                "messageType": { "$in" : ["A54","A98"] },
                "startCreatedDateTime": {
                    "$gte": ${JSON.stringify(dateYesterday)},
                    "$lte": ${JSON.stringify(queryDate)}
                },
                "sort": [{
                    "startCreatedDateTime": "desc"
                }]
            }
        }`;

            const iterator = Values.getActivationDocumentQueryMock2Values(activationDocumentStart, activationDocumentStartOldest, mockHandler);
            transactionContext.stub.getPrivateDataQueryResult.withArgs("producer-rte", query).resolves(iterator);

            await star.CreateActivationDocument(transactionContext, JSON.stringify(activationDocument_Reconciliation));

            activationDocumentStart.orderEnd = true;
            activationDocumentStart.subOrderList = [activationDocument_Reconciliation.activationDocumentMrid];

            const expectedEnd: ActivationDocument = activationDocument_Reconciliation;
            expectedEnd.orderEnd = true;
            expectedEnd.potentialParent = false;
            expectedEnd.potentialChild = false;
            expectedEnd.subOrderList = [activationDocumentStart.activationDocumentMrid];
            expectedEnd.docType="activationDocument";

            // console.info("-----------")
            // console.info(transactionContext.stub.putPrivateData.firstCall.args);
            // console.info("ooooooooo")
            // console.info(Buffer.from(transactionContext.stub.putPrivateData.firstCall.args[2].toString()).toString('utf8'));
            // console.info(JSON.stringify(activationDocumentStart))
            // console.info("-----------")
            // console.info(transactionContext.stub.putPrivateData.secondCall.args);
            // console.info("ooooooooo")
            // console.info(Buffer.from(transactionContext.stub.putPrivateData.secondCall.args[2].toString()).toString('utf8'));
            // console.info(JSON.stringify(expectedEnd))
            // console.info("-----------")

            transactionContext.stub.putPrivateData.firstCall.should.have.been.calledWithExactly(
                "producer-rte",
                activationDocumentStart.activationDocumentMrid,
                Buffer.from(JSON.stringify(activationDocumentStart))
            );

            transactionContext.stub.putPrivateData.secondCall.should.have.been.calledWithExactly(
                "producer-rte",
                expectedEnd.activationDocumentMrid,
                Buffer.from(JSON.stringify(expectedEnd))
            );
        });


        it('should return SUCCESS CreateActivationDocument end order HTB RTE for coverage', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);

            transactionContext.stub.getState.withArgs(Values.HTB_systemoperator.systemOperatorMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTB_systemoperator)));
            transactionContext.stub.getState.withArgs(Values.HTB_Producer.producerMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTB_Producer)));

            const params: Parameters = await ParametersController.getParameterValues(transactionContext);
            const collectionNamesSite: string[] = params.values.get(ParametersType.SITE);
            transactionContext.stub.getPrivateData.withArgs(collectionNamesSite[0], Values.HTB_site_valid.meteringPointMrid).resolves(Buffer.from(JSON.stringify(Values.HTB_site_valid)));


            const activationDocumentStart:ActivationDocument = JSON.parse(JSON.stringify(Values.HTB_ActivationDocument_JustStartDate));
            activationDocumentStart.orderEnd = false;
            activationDocumentStart.potentialParent = false;
            activationDocumentStart.potentialChild = false;
            activationDocumentStart.docType = 'activationDocument';
            activationDocumentStart.subOrderList = [];

            const activationDocument_Reconciliation: ActivationDocument = JSON.parse(JSON.stringify(Values.HTB_ActivationDocument_JustEndDate));

            const senderMarketParticipantMrid: string = activationDocument_Reconciliation.senderMarketParticipantMrid as string;
            const registeredResourceMrid: string = activationDocument_Reconciliation.registeredResourceMrid;

            const queryDate: string = activationDocument_Reconciliation.endCreatedDateTime as string;

            const pcuetmt:number = params.values.get(ParametersType.PC_TIME_UPDATEEND_MATCH_THRESHOLD);

            const datetmp = new Date(queryDate);
            datetmp.setUTCMilliseconds(0);
            datetmp.setUTCSeconds(0);
            datetmp.setUTCMinutes(0);
            datetmp.setUTCHours(0);
            const dateYesterday = new Date(datetmp.getTime() - pcuetmt);

        const query = `{
            "selector": {
                "docType": "activationDocument",
                "orderEnd": false,
                "senderMarketParticipantMrid": "${senderMarketParticipantMrid}",
                "registeredResourceMrid": "${registeredResourceMrid}",
                "messageType": { "$in" : ["A54","A98"] },
                "startCreatedDateTime": {
                    "$gte": ${JSON.stringify(dateYesterday)},
                    "$lte": ${JSON.stringify(queryDate)}
                },
                "sort": [{
                    "startCreatedDateTime": "desc"
                }]
            }
        }`;

            const iterator = Values.getActivationDocumentQueryMock(activationDocumentStart, mockHandler);
            transactionContext.stub.getPrivateDataQueryResult.withArgs("producer-rte", query).resolves(iterator);

            activationDocument_Reconciliation.subOrderList = [];
            await star.CreateActivationDocument(transactionContext, JSON.stringify(activationDocument_Reconciliation));

            activationDocumentStart.orderEnd = true;
            activationDocumentStart.subOrderList = [activationDocument_Reconciliation.activationDocumentMrid];

            const expectedEnd: ActivationDocument = activationDocument_Reconciliation;
            expectedEnd.orderEnd = true;
            expectedEnd.potentialParent = false;
            expectedEnd.potentialChild = false;
            expectedEnd.subOrderList = [activationDocumentStart.activationDocumentMrid];
            expectedEnd.docType="activationDocument";

            // console.info("-----------")
            // console.info(transactionContext.stub.putPrivateData.firstCall.args);
            // console.info("ooooooooo")
            // console.info(Buffer.from(transactionContext.stub.putPrivateData.firstCall.args[2].toString()).toString('utf8'));
            // console.info(JSON.stringify(activationDocumentStart))
            // console.info("-----------")
            // console.info(transactionContext.stub.putPrivateData.secondCall.args);
            // console.info("ooooooooo")
            // console.info(Buffer.from(transactionContext.stub.putPrivateData.secondCall.args[2].toString()).toString('utf8'));
            // console.info(JSON.stringify(expectedEnd))
            // console.info("-----------")

            transactionContext.stub.putPrivateData.firstCall.should.have.been.calledWithExactly(
                "producer-rte",
                activationDocumentStart.activationDocumentMrid,
                Buffer.from(JSON.stringify(activationDocumentStart))
            );

            transactionContext.stub.putPrivateData.secondCall.should.have.been.calledWithExactly(
                "producer-rte",
                expectedEnd.activationDocumentMrid,
                Buffer.from(JSON.stringify(expectedEnd))
            );
        });
    });








    describe('Test Match Parent with Child (MPWC) reconciliations', () => {

        it('should return SUCCESS CreateActivationDocument couple HTA after HTB with MPWC reconciliation', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);

            transactionContext.stub.getState.withArgs(Values.HTA_systemoperator2.systemOperatorMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_systemoperator2)));
            transactionContext.stub.getState.withArgs(Values.HTA_Producer.producerMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_Producer)));

            const activationDocument: ActivationDocument = JSON.parse(JSON.stringify(Values.HTB_ActivationDocument_HTA_JustStartDate));
            const activationDocument_Reconciliation: ActivationDocument = JSON.parse(JSON.stringify(Values.HTA_ActivationDocument_Valid_Doc2));

            const params: Parameters = await ParametersController.getParameterValues(transactionContext);
            const collectionNamesSite: string[] = params.values.get(ParametersType.SITE);
            transactionContext.stub.getPrivateData.withArgs(collectionNamesSite[0],
                activationDocument_Reconciliation.registeredResourceMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_site_valid)));


            const orderType = activationDocument_Reconciliation.businessType;

            const pctmt:number = params.values.get(ParametersType.PC_TIME_MATCH_THRESHOLD);

            const queryDate: string = activationDocument_Reconciliation.endCreatedDateTime as string;
            const datetmp = new Date(queryDate);
            datetmp.setUTCMilliseconds(0);
            datetmp.setUTCSeconds(0);
            const dateMinusPCTMT = new Date(datetmp.getTime() - pctmt);
            const datePlusPCTMT = new Date(datetmp.getTime() - pctmt);

        const query = `{
            "selector": {
                "docType": "activationDocument",
                "potentialParent": true,
                "registeredResourceMrid": { "$in" : ["PDL00000000289766"] },
                "businessType": "${orderType}",
                "$or" : [
                    {
                        "endCreatedDateTime": {
                            "$gte": ${JSON.stringify(queryDate)},
                            "$lte": ${JSON.stringify(datePlusPCTMT)}
                        }
                    },{
                        "endCreatedDateTime": {
                            "$gte": ${JSON.stringify(dateMinusPCTMT)},
                            "$lte": ${JSON.stringify(queryDate)}
                        }
                    }
                ],
                "sort": [{
                    "startCreatedDateTime" : "desc"
                }]
            }
        }`;

            activationDocument.docType="activationDocument";
            activationDocument.potentialParent= true;
            activationDocument.potentialChild= false;
            const iterator = Values.getActivationDocumentQueryMock(activationDocument,mockHandler);
            transactionContext.stub.getPrivateDataQueryResult.withArgs("enedis-rte", query).resolves(iterator);

            const queryYellowPage = `{"selector": {"docType": "yellowPages", "originAutomationRegisteredResourceMrid": "${activationDocument_Reconciliation.originAutomationRegisteredResourceMrid}"}}`;
            const iteratorYellowPage = Values.getYellowPageQueryMock(Values.HTA_yellowPage,mockHandler);
            transactionContext.stub.getQueryResult.withArgs(queryYellowPage).resolves(iteratorYellowPage);


            await star.CreateActivationDocument(transactionContext, JSON.stringify(activationDocument_Reconciliation));

            activationDocument.orderEnd = true;
            activationDocument.subOrderList = [Values.HTA_ActivationDocument_Valid_Doc2.activationDocumentMrid];
            activationDocument.docType="activationDocument";

            const expectedEnd: ActivationDocument = activationDocument_Reconciliation;
            expectedEnd.orderEnd = true;
            expectedEnd.potentialParent = false;
            expectedEnd.potentialChild = false;
            expectedEnd.subOrderList = [activationDocument.activationDocumentMrid];
            expectedEnd.docType="activationDocument";

            // console.info("-----------");
            // console.info(transactionContext.stub.putPrivateData.firstCall.args);
            // console.info("ooooooooo");
            // console.info(Buffer.from(transactionContext.stub.putPrivateData.firstCall.args[2].toString()).toString('utf8'));
            // console.info(JSON.stringify(activationDocument));
            // console.info("-----------");
            // console.info(transactionContext.stub.putPrivateData.secondCall.args);
            // console.info("ooooooooo");
            // console.info(Buffer.from(transactionContext.stub.putPrivateData.secondCall.args[2].toString()).toString('utf8'));
            // console.info(JSON.stringify(expectedEnd));
            // console.info("-----------");

            transactionContext.stub.putPrivateData.firstCall.should.have.been.calledWithExactly(
                "enedis-rte",
                activationDocument.activationDocumentMrid,
                Buffer.from(JSON.stringify(activationDocument))
            );

            transactionContext.stub.putPrivateData.secondCall.should.have.been.calledWithExactly(
                "enedis-producer",
                expectedEnd.activationDocumentMrid,
                Buffer.from(JSON.stringify(expectedEnd))
            );
        });


        it('should return SUCCESS CreateActivationDocument couple HTA after 2 HTB (choice on closest date) with MPWC reconciliation', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);

            transactionContext.stub.getState.withArgs(Values.HTA_systemoperator2.systemOperatorMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_systemoperator2)));
            transactionContext.stub.getState.withArgs(Values.HTA_Producer.producerMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_Producer)));

            const activationDocument: ActivationDocument = JSON.parse(JSON.stringify(Values.HTB_ActivationDocument_HTA_JustStartDate));
            activationDocument.docType="activationDocument";
            activationDocument.potentialParent= true;
            activationDocument.potentialChild= false;

            const activationDocumentOldest: ActivationDocument = JSON.parse(JSON.stringify(Values.HTB_ActivationDocument_HTA_JustStartDate));
            activationDocumentOldest.activationDocumentMrid = activationDocumentOldest.activationDocumentMrid + "_Old";
            activationDocumentOldest.docType="activationDocument";
            activationDocumentOldest.potentialParent= true;
            activationDocumentOldest.potentialChild= false;
            var dateoldest = new Date(activationDocumentOldest.startCreatedDateTime as string);
            dateoldest = new Date(dateoldest.getTime() - 2);
            activationDocumentOldest.startCreatedDateTime = JSON.stringify(dateoldest);

            // console.info("##############")
            // console.info(activationDocument)
            // console.info(activationDocumentOldest)
            // console.info("##############")

            const activationDocument_Reconciliation: ActivationDocument = JSON.parse(JSON.stringify(Values.HTA_ActivationDocument_Valid_Doc2));

            const params: Parameters = await ParametersController.getParameterValues(transactionContext);
            const collectionNamesSite: string[] = params.values.get(ParametersType.SITE);
            transactionContext.stub.getPrivateData.withArgs(collectionNamesSite[0],
                activationDocument_Reconciliation.registeredResourceMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_site_valid)));


            const orderType = activationDocument_Reconciliation.businessType;

            const pctmt:number = params.values.get(ParametersType.PC_TIME_MATCH_THRESHOLD);

            const queryDate: string = activationDocument_Reconciliation.endCreatedDateTime as string;
            const datetmp = new Date(queryDate);
            datetmp.setUTCMilliseconds(0);
            datetmp.setUTCSeconds(0);
            const dateMinusPCTMT = new Date(datetmp.getTime() - pctmt);
            const datePlusPCTMT = new Date(datetmp.getTime() - pctmt);

        const query = `{
            "selector": {
                "docType": "activationDocument",
                "potentialParent": true,
                "registeredResourceMrid": { "$in" : ["PDL00000000289766"] },
                "businessType": "${orderType}",
                "$or" : [
                    {
                        "endCreatedDateTime": {
                            "$gte": ${JSON.stringify(queryDate)},
                            "$lte": ${JSON.stringify(datePlusPCTMT)}
                        }
                    },{
                        "endCreatedDateTime": {
                            "$gte": ${JSON.stringify(dateMinusPCTMT)},
                            "$lte": ${JSON.stringify(queryDate)}
                        }
                    }
                ],
                "sort": [{
                    "startCreatedDateTime" : "desc"
                }]
            }
        }`;

            const iterator = Values.getActivationDocumentQueryMock2Values(activationDocument,activationDocumentOldest,mockHandler);
            transactionContext.stub.getPrivateDataQueryResult.withArgs("enedis-rte", query).resolves(iterator);

            const queryYellowPage = `{"selector": {"docType": "yellowPages", "originAutomationRegisteredResourceMrid": "${activationDocument_Reconciliation.originAutomationRegisteredResourceMrid}"}}`;
            const iteratorYellowPage = Values.getYellowPageQueryMock(Values.HTA_yellowPage,mockHandler);
            transactionContext.stub.getQueryResult.withArgs(queryYellowPage).resolves(iteratorYellowPage);


            await star.CreateActivationDocument(transactionContext, JSON.stringify(activationDocument_Reconciliation));

            activationDocument.orderEnd = true;
            activationDocument.subOrderList = [Values.HTA_ActivationDocument_Valid_Doc2.activationDocumentMrid];
            activationDocument.docType="activationDocument";

            const expectedEnd: ActivationDocument = activationDocument_Reconciliation;
            expectedEnd.orderEnd = true;
            expectedEnd.potentialParent = false;
            expectedEnd.potentialChild = false;
            expectedEnd.subOrderList = [activationDocument.activationDocumentMrid];
            expectedEnd.docType="activationDocument";

            // console.info("-----------");
            // console.info(transactionContext.stub.putPrivateData.firstCall.args);
            // console.info("ooooooooo");
            // console.info(Buffer.from(transactionContext.stub.putPrivateData.firstCall.args[2].toString()).toString('utf8'));
            // console.info(JSON.stringify(activationDocument));
            // console.info("-----------");
            // console.info(transactionContext.stub.putPrivateData.secondCall.args);
            // console.info("ooooooooo");
            // console.info(Buffer.from(transactionContext.stub.putPrivateData.secondCall.args[2].toString()).toString('utf8'));
            // console.info(JSON.stringify(expectedEnd));
            // console.info("-----------");

            transactionContext.stub.putPrivateData.firstCall.should.have.been.calledWithExactly(
                "enedis-rte",
                activationDocument.activationDocumentMrid,
                Buffer.from(JSON.stringify(activationDocument))
            );

            transactionContext.stub.putPrivateData.secondCall.should.have.been.calledWithExactly(
                "enedis-producer",
                expectedEnd.activationDocumentMrid,
                Buffer.from(JSON.stringify(expectedEnd))
            );
        });




        it('should return SUCCESS CreateActivationDocument couple HTA after HTB with MPWC reconciliation for coverage', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);

            transactionContext.stub.getState.withArgs(Values.HTA_systemoperator2.systemOperatorMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_systemoperator2)));
            transactionContext.stub.getState.withArgs(Values.HTA_Producer.producerMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_Producer)));

            const activationDocument: ActivationDocument = JSON.parse(JSON.stringify(Values.HTB_ActivationDocument_HTA_JustStartDate));
            const activationDocument_Reconciliation: ActivationDocument = JSON.parse(JSON.stringify(Values.HTA_ActivationDocument_Valid_Doc2));

            const params: Parameters = await ParametersController.getParameterValues(transactionContext);
            const collectionNamesSite: string[] = params.values.get(ParametersType.SITE);
            transactionContext.stub.getPrivateData.withArgs(collectionNamesSite[0],
                activationDocument_Reconciliation.registeredResourceMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_site_valid)));


            const orderType = activationDocument_Reconciliation.businessType;

            const pctmt:number = params.values.get(ParametersType.PC_TIME_MATCH_THRESHOLD);

            const queryDate: string = activationDocument_Reconciliation.endCreatedDateTime as string;
            const datetmp = new Date(queryDate);
            datetmp.setUTCMilliseconds(0);
            datetmp.setUTCSeconds(0);
            const dateMinusPCTMT = new Date(datetmp.getTime() - pctmt);
            const datePlusPCTMT = new Date(datetmp.getTime() - pctmt);

        const query = `{
            "selector": {
                "docType": "activationDocument",
                "potentialParent": true,
                "registeredResourceMrid": { "$in" : ["PDL00000000289766"] },
                "businessType": "${orderType}",
                "$or" : [
                    {
                        "endCreatedDateTime": {
                            "$gte": ${JSON.stringify(queryDate)},
                            "$lte": ${JSON.stringify(datePlusPCTMT)}
                        }
                    },{
                        "endCreatedDateTime": {
                            "$gte": ${JSON.stringify(dateMinusPCTMT)},
                            "$lte": ${JSON.stringify(queryDate)}
                        }
                    }
                ],
                "sort": [{
                    "startCreatedDateTime" : "desc"
                }]
            }
        }`;

            activationDocument.docType="activationDocument";
            activationDocument.potentialParent= true;
            activationDocument.potentialChild= false;
            activationDocument.subOrderList = [];
            const iterator = Values.getActivationDocumentQueryMock(activationDocument,mockHandler);
            transactionContext.stub.getPrivateDataQueryResult.withArgs("enedis-rte", query).resolves(iterator);

            const queryYellowPage = `{"selector": {"docType": "yellowPages", "originAutomationRegisteredResourceMrid": "${activationDocument_Reconciliation.originAutomationRegisteredResourceMrid}"}}`;
            const iteratorYellowPage = Values.getYellowPageQueryMock(Values.HTA_yellowPage,mockHandler);
            transactionContext.stub.getQueryResult.withArgs(queryYellowPage).resolves(iteratorYellowPage);


            activationDocument_Reconciliation.subOrderList = [];
            await star.CreateActivationDocument(transactionContext, JSON.stringify(activationDocument_Reconciliation));

            activationDocument.orderEnd = true;
            activationDocument.subOrderList = [Values.HTA_ActivationDocument_Valid_Doc2.activationDocumentMrid];
            activationDocument.docType="activationDocument";

            const expectedEnd: ActivationDocument = activationDocument_Reconciliation;
            expectedEnd.orderEnd = true;
            expectedEnd.potentialParent = false;
            expectedEnd.potentialChild = false;
            expectedEnd.subOrderList = [activationDocument.activationDocumentMrid];
            expectedEnd.docType="activationDocument";

            // console.info("-----------");
            // console.info(transactionContext.stub.putPrivateData.firstCall.args);
            // console.info("ooooooooo");
            // console.info(Buffer.from(transactionContext.stub.putPrivateData.firstCall.args[2].toString()).toString('utf8'));
            // console.info(JSON.stringify(activationDocument));
            // console.info("-----------");
            // console.info(transactionContext.stub.putPrivateData.secondCall.args);
            // console.info("ooooooooo");
            // console.info(Buffer.from(transactionContext.stub.putPrivateData.secondCall.args[2].toString()).toString('utf8'));
            // console.info(JSON.stringify(expectedEnd));
            // console.info("-----------");

            transactionContext.stub.putPrivateData.firstCall.should.have.been.calledWithExactly(
                "enedis-rte",
                activationDocument.activationDocumentMrid,
                Buffer.from(JSON.stringify(activationDocument))
            );

            transactionContext.stub.putPrivateData.secondCall.should.have.been.calledWithExactly(
                "enedis-producer",
                expectedEnd.activationDocumentMrid,
                Buffer.from(JSON.stringify(expectedEnd))
            );
        });
    });




    describe('Test Conciliation Crank', () => {
        it('should return SUCCESS on GetActivationDocumentByProducer with MPWC reconciliation', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);

            transactionContext.stub.getState.withArgs(Values.HTA_systemoperator2.systemOperatorMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_systemoperator2)));
            transactionContext.stub.getState.withArgs(Values.HTA_Producer.producerMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_Producer)));

            const activationDocument: ActivationDocument = JSON.parse(JSON.stringify(Values.HTB_ActivationDocument_HTA_JustStartDate));
            activationDocument.docType="activationDocument";
            activationDocument.potentialParent= true;
            activationDocument.potentialChild= false;

            const activationDocument_Reconciliation: ActivationDocument = JSON.parse(JSON.stringify(Values.HTA_ActivationDocument_Valid_Doc2));
            activationDocument_Reconciliation.docType="activationDocument";
            activationDocument_Reconciliation.potentialParent= false;
            activationDocument_Reconciliation.potentialChild= true;

            const queryCrank = `{"selector": {"docType": "activationDocument", "potentialParent": true, "potentialChild": true}}`;
            const iteratorMix = Values.getActivationDocumentQueryMock(activationDocument,mockHandler);
            transactionContext.stub.getPrivateDataQueryResult.withArgs("enedis-rte", queryCrank).resolves(iteratorMix);
            const iteratorProd = Values.getActivationDocumentQueryMock(activationDocument_Reconciliation,mockHandler);
            transactionContext.stub.getPrivateDataQueryResult.withArgs("enedis-producer", queryCrank).resolves(iteratorProd);

            const params: Parameters = await ParametersController.getParameterValues(transactionContext);
            const collectionNamesSite: string[] = params.values.get(ParametersType.SITE);
            transactionContext.stub.getPrivateData.withArgs(collectionNamesSite[0],
                activationDocument_Reconciliation.registeredResourceMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_site_valid)));


            const orderType = activationDocument_Reconciliation.businessType;

            const pctmt:number = params.values.get(ParametersType.PC_TIME_MATCH_THRESHOLD);

            const queryDate: string = activationDocument_Reconciliation.endCreatedDateTime as string;
            const datetmp = new Date(queryDate);
            datetmp.setUTCMilliseconds(0);
            datetmp.setUTCSeconds(0);
            const dateMinusPCTMT = new Date(datetmp.getTime() - pctmt);
            const datePlusPCTMT = new Date(datetmp.getTime() - pctmt);

        const queryReconciliation = `{
            "selector": {
                "docType": "activationDocument",
                "potentialParent": true,
                "registeredResourceMrid": { "$in" : ["PDL00000000289766"] },
                "businessType": "${orderType}",
                "$or" : [
                    {
                        "endCreatedDateTime": {
                            "$gte": ${JSON.stringify(queryDate)},
                            "$lte": ${JSON.stringify(datePlusPCTMT)}
                        }
                    },{
                        "endCreatedDateTime": {
                            "$gte": ${JSON.stringify(dateMinusPCTMT)},
                            "$lte": ${JSON.stringify(queryDate)}
                        }
                    }
                ],
                "sort": [{
                    "startCreatedDateTime" : "desc"
                }]
            }
        }`;

            const iteratorReconciliation = Values.getActivationDocumentQueryMock(activationDocument,mockHandler);
            transactionContext.stub.getPrivateDataQueryResult.withArgs("enedis-rte", queryReconciliation).resolves(iteratorReconciliation);

            const queryYellowPage = `{"selector": {"docType": "yellowPages", "originAutomationRegisteredResourceMrid": "${activationDocument_Reconciliation.originAutomationRegisteredResourceMrid}"}}`;
            const iteratorYellowPage = Values.getYellowPageQueryMock(Values.HTA_yellowPage,mockHandler);
            transactionContext.stub.getQueryResult.withArgs(queryYellowPage).resolves(iteratorYellowPage);

            const iterator = Values.getActivationDocumentQueryMock2Values(Values.HTA_ActivationDocument_Valid, Values.HTA_ActivationDocument_Valid_Doc2,mockHandler);
            const query = `{"selector": {"docType": "activationDocument", "receiverMarketParticipantMrid": "${Values.HTA_Producer.producerMarketParticipantMrid}"}}`;
            transactionContext.stub.getPrivateDataQueryResult.withArgs("enedis-producer", query).resolves(iterator);


            let ret = await star.GetActivationDocumentByProducer(transactionContext, Values.HTA_Producer.producerMarketParticipantMrid);
            ret = JSON.parse(ret);
            // console.log('ret=', ret)
            expect(ret.length).to.equal(2);

            const expected: ActivationDocument[] = [Values.HTA_ActivationDocument_Valid, Values.HTA_ActivationDocument_Valid_Doc2];

            expect(ret).to.eql(expected);


            activationDocument.orderEnd = true;
            activationDocument.subOrderList = [Values.HTA_ActivationDocument_Valid_Doc2.activationDocumentMrid];
            activationDocument.docType="activationDocument";

            const expectedEnd: ActivationDocument = activationDocument_Reconciliation;
            expectedEnd.orderEnd = true;
            expectedEnd.potentialParent = false;
            expectedEnd.potentialChild = false;
            expectedEnd.subOrderList = [activationDocument.activationDocumentMrid];
            expectedEnd.docType="activationDocument";

            // console.info("-----------");
            // console.info(transactionContext.stub.putPrivateData.firstCall.args);
            // console.info("ooooooooo");
            // console.info(Buffer.from(transactionContext.stub.putPrivateData.firstCall.args[2].toString()).toString('utf8'));
            // console.info(JSON.stringify(activationDocument));
            // console.info("-----------");
            // console.info(transactionContext.stub.putPrivateData.secondCall.args);
            // console.info("ooooooooo");
            // console.info(Buffer.from(transactionContext.stub.putPrivateData.secondCall.args[2].toString()).toString('utf8'));
            // console.info(JSON.stringify(expectedEnd));
            // console.info("-----------");

            transactionContext.stub.putPrivateData.firstCall.should.have.been.calledWithExactly(
                "enedis-rte",
                activationDocument.activationDocumentMrid,
                Buffer.from(JSON.stringify(activationDocument))
            );

            transactionContext.stub.putPrivateData.secondCall.should.have.been.calledWithExactly(
                "enedis-producer",
                expectedEnd.activationDocumentMrid,
                Buffer.from(JSON.stringify(expectedEnd))
            );
        });



        it('should return SUCCESS on GetActivationDocumentBySystemOperator with MPWC reconciliation', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);

            transactionContext.stub.getState.withArgs(Values.HTA_systemoperator2.systemOperatorMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_systemoperator2)));
            transactionContext.stub.getState.withArgs(Values.HTA_Producer.producerMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_Producer)));

            const activationDocument: ActivationDocument = JSON.parse(JSON.stringify(Values.HTB_ActivationDocument_HTA_JustStartDate));
            activationDocument.docType="activationDocument";
            activationDocument.potentialParent= true;
            activationDocument.potentialChild= false;

            const activationDocument_Reconciliation: ActivationDocument = JSON.parse(JSON.stringify(Values.HTA_ActivationDocument_Valid_Doc2));
            activationDocument_Reconciliation.docType="activationDocument";
            activationDocument_Reconciliation.potentialParent= false;
            activationDocument_Reconciliation.potentialChild= true;

            const queryCrank = `{"selector": {"docType": "activationDocument", "potentialParent": true, "potentialChild": true}}`;
            const iteratorMix = Values.getActivationDocumentQueryMock(activationDocument,mockHandler);
            transactionContext.stub.getPrivateDataQueryResult.withArgs("enedis-rte", queryCrank).resolves(iteratorMix);
            const iteratorProd = Values.getActivationDocumentQueryMock(activationDocument_Reconciliation,mockHandler);
            transactionContext.stub.getPrivateDataQueryResult.withArgs("enedis-producer", queryCrank).resolves(iteratorProd);

            const params: Parameters = await ParametersController.getParameterValues(transactionContext);
            const collectionNamesSite: string[] = params.values.get(ParametersType.SITE);
            transactionContext.stub.getPrivateData.withArgs(collectionNamesSite[0],
                activationDocument_Reconciliation.registeredResourceMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_site_valid)));


            const orderType = activationDocument_Reconciliation.businessType;

            const pctmt:number = params.values.get(ParametersType.PC_TIME_MATCH_THRESHOLD);

            const queryDate: string = activationDocument_Reconciliation.endCreatedDateTime as string;
            const datetmp = new Date(queryDate);
            datetmp.setUTCMilliseconds(0);
            datetmp.setUTCSeconds(0);
            const dateMinusPCTMT = new Date(datetmp.getTime() - pctmt);
            const datePlusPCTMT = new Date(datetmp.getTime() - pctmt);

        const queryReconciliation = `{
            "selector": {
                "docType": "activationDocument",
                "potentialParent": true,
                "registeredResourceMrid": { "$in" : ["PDL00000000289766"] },
                "businessType": "${orderType}",
                "$or" : [
                    {
                        "endCreatedDateTime": {
                            "$gte": ${JSON.stringify(queryDate)},
                            "$lte": ${JSON.stringify(datePlusPCTMT)}
                        }
                    },{
                        "endCreatedDateTime": {
                            "$gte": ${JSON.stringify(dateMinusPCTMT)},
                            "$lte": ${JSON.stringify(queryDate)}
                        }
                    }
                ],
                "sort": [{
                    "startCreatedDateTime" : "desc"
                }]
            }
        }`;

            const iteratorReconciliation = Values.getActivationDocumentQueryMock(activationDocument,mockHandler);
            transactionContext.stub.getPrivateDataQueryResult.withArgs("enedis-rte", queryReconciliation).resolves(iteratorReconciliation);

            const queryYellowPage = `{"selector": {"docType": "yellowPages", "originAutomationRegisteredResourceMrid": "${activationDocument_Reconciliation.originAutomationRegisteredResourceMrid}"}}`;
            const iteratorYellowPage = Values.getYellowPageQueryMock(Values.HTA_yellowPage,mockHandler);
            transactionContext.stub.getQueryResult.withArgs(queryYellowPage).resolves(iteratorYellowPage);

            const iterator = Values.getActivationDocumentQueryMock(Values.HTA_ActivationDocument_Valid,mockHandler);
            const query = `{"selector": {"docType": "activationDocument", "senderMarketParticipantMrid": "${Values.HTA_ActivationDocument_Valid.senderMarketParticipantMrid}"}}`;
            transactionContext.stub.getPrivateDataQueryResult.withArgs("enedis-producer", query).resolves(iterator);

            let ret = await star.GetActivationDocumentBySystemOperator(transactionContext, Values.HTA_ActivationDocument_Valid.senderMarketParticipantMrid as string);
            ret = JSON.parse(ret);
            // console.log('ret=', ret)
            expect(ret.length).to.equal(1);

            const expected: ActivationDocument[] = [Values.HTA_ActivationDocument_Valid];

            expect(ret).to.eql(expected);


            activationDocument.orderEnd = true;
            activationDocument.subOrderList = [Values.HTA_ActivationDocument_Valid_Doc2.activationDocumentMrid];
            activationDocument.docType="activationDocument";

            const expectedEnd: ActivationDocument = activationDocument_Reconciliation;
            expectedEnd.orderEnd = true;
            expectedEnd.potentialParent = false;
            expectedEnd.potentialChild = false;
            expectedEnd.subOrderList = [activationDocument.activationDocumentMrid];
            expectedEnd.docType="activationDocument";

            // console.info("-----------");
            // console.info(transactionContext.stub.putPrivateData.firstCall.args);
            // console.info("ooooooooo");
            // console.info(Buffer.from(transactionContext.stub.putPrivateData.firstCall.args[2].toString()).toString('utf8'));
            // console.info(JSON.stringify(activationDocument));
            // console.info("-----------");
            // console.info(transactionContext.stub.putPrivateData.secondCall.args);
            // console.info("ooooooooo");
            // console.info(Buffer.from(transactionContext.stub.putPrivateData.secondCall.args[2].toString()).toString('utf8'));
            // console.info(JSON.stringify(expectedEnd));
            // console.info("-----------");

            transactionContext.stub.putPrivateData.firstCall.should.have.been.calledWithExactly(
                "enedis-rte",
                activationDocument.activationDocumentMrid,
                Buffer.from(JSON.stringify(activationDocument))
            );

            transactionContext.stub.putPrivateData.secondCall.should.have.been.calledWithExactly(
                "enedis-producer",
                expectedEnd.activationDocumentMrid,
                Buffer.from(JSON.stringify(expectedEnd))
            );
        });

        it('should return SUCCESS CreateActivationDocument couple HTA', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);

            transactionContext.stub.getState.withArgs(Values.HTA_systemoperator.systemOperatorMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_systemoperator)));
            transactionContext.stub.getState.withArgs(Values.HTA_Producer.producerMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_Producer)));

            const activationDocumentToCreate:ActivationDocument = JSON.parse(JSON.stringify(Values.HTA_ActivationDocument_Valid));

            const activationDocument_Parent: ActivationDocument = JSON.parse(JSON.stringify(Values.HTB_ActivationDocument_HTA_JustStartDate));
            activationDocument_Parent.docType="activationDocument";
            activationDocument_Parent.startCreatedDateTime = Values.reduceDateStr(activationDocument_Parent.startCreatedDateTime as string, 5*24*60*60*1000);
            activationDocument_Parent.potentialParent= true;
            activationDocument_Parent.potentialChild= false;

            const activationDocument_Child: ActivationDocument = JSON.parse(JSON.stringify(Values.HTA_ActivationDocument_Valid_Doc2));
            activationDocument_Child.docType="activationDocument";
            activationDocument_Child.startCreatedDateTime = Values.reduceDateStr(activationDocument_Child.startCreatedDateTime as string, 5*24*60*60*1000);
            activationDocument_Child.endCreatedDateTime = Values.reduceDateStr(activationDocument_Child.endCreatedDateTime as string, 5*24*60*60*1000);
            activationDocument_Child.potentialParent= false;
            activationDocument_Child.potentialChild= true;

            const queryCrank = `{"selector": {"docType": "activationDocument", "potentialParent": true, "potentialChild": true}}`;
            const iteratorMix = Values.getActivationDocumentQueryMock(activationDocument_Parent,mockHandler);
            transactionContext.stub.getPrivateDataQueryResult.withArgs("enedis-rte", queryCrank).resolves(iteratorMix);
            const iteratorProd = Values.getActivationDocumentQueryMock(activationDocument_Child,mockHandler);
            transactionContext.stub.getPrivateDataQueryResult.withArgs("enedis-producer", queryCrank).resolves(iteratorProd);

            const params: Parameters = await ParametersController.getParameterValues(transactionContext);
            const collectionNames: string[] = params.values.get(ParametersType.SITE);
            transactionContext.stub.getPrivateData.withArgs(collectionNames[0], Values.HTA_site_valid.meteringPointMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_site_valid)));

            const orderType = activationDocument_Child.businessType;

            const pctmt:number = params.values.get(ParametersType.PC_TIME_MATCH_THRESHOLD);

            const queryDate: string = activationDocument_Child.endCreatedDateTime;
            const datetmp = new Date(queryDate);
            datetmp.setUTCMilliseconds(0);
            datetmp.setUTCSeconds(0);
            const dateMinusPCTMT = new Date(datetmp.getTime() - pctmt);
            const datePlusPCTMT = new Date(datetmp.getTime() - pctmt);

        const queryReconciliation = `{
            "selector": {
                "docType": "activationDocument",
                "potentialParent": true,
                "registeredResourceMrid": { "$in" : ["PDL00000000289766"] },
                "businessType": "${orderType}",
                "$or" : [
                    {
                        "endCreatedDateTime": {
                            "$gte": ${JSON.stringify(queryDate)},
                            "$lte": ${JSON.stringify(datePlusPCTMT)}
                        }
                    },{
                        "endCreatedDateTime": {
                            "$gte": ${JSON.stringify(dateMinusPCTMT)},
                            "$lte": ${JSON.stringify(queryDate)}
                        }
                    }
                ],
                "sort": [{
                    "startCreatedDateTime" : "desc"
                }]
            }
        }`;

            const iteratorReconciliation = Values.getActivationDocumentQueryMock(activationDocument_Parent,mockHandler);
            transactionContext.stub.getPrivateDataQueryResult.withArgs("enedis-rte", queryReconciliation).resolves(iteratorReconciliation);

            const queryYellowPage = `{"selector": {"docType": "yellowPages", "originAutomationRegisteredResourceMrid": "${activationDocument_Child.originAutomationRegisteredResourceMrid}"}}`;
            const iteratorYellowPage = Values.getYellowPageQueryMock(Values.HTA_yellowPage,mockHandler);
            transactionContext.stub.getQueryResult.withArgs(queryYellowPage).resolves(iteratorYellowPage);

            const iterator = Values.getActivationDocumentQueryMock(Values.HTA_ActivationDocument_Valid,mockHandler);
            const query = `{"selector": {"docType": "activationDocument", "senderMarketParticipantMrid": "${Values.HTA_ActivationDocument_Valid.senderMarketParticipantMrid}"}}`;
            transactionContext.stub.getQueryResult.withArgs(query).resolves(iterator);


            await star.CreateActivationDocument(transactionContext, JSON.stringify(activationDocumentToCreate));

            activationDocument_Parent.orderEnd = true;
            activationDocument_Parent.subOrderList = [activationDocument_Child.activationDocumentMrid];

            activationDocument_Child.orderEnd = true;
            activationDocument_Child.potentialChild = false;
            activationDocument_Child.subOrderList = [activationDocument_Parent.activationDocumentMrid];


            const expectedCreation: ActivationDocument = activationDocumentToCreate;
            expectedCreation.orderEnd = true;
            expectedCreation.potentialParent = false;
            expectedCreation.potentialChild = true;
            expectedCreation.docType = 'activationDocument';

            // console.info("-----------");
            // console.info(transactionContext.stub.putPrivateData.firstCall.args);
            // console.info("ooooooooo");
            // console.info(Buffer.from(transactionContext.stub.putPrivateData.firstCall.args[2].toString()).toString('utf8'));
            // console.info(JSON.stringify(activationDocument_Parent));
            // console.info("-----------");
            // console.info(transactionContext.stub.putPrivateData.secondCall.args);
            // console.info("ooooooooo");
            // console.info(Buffer.from(transactionContext.stub.putPrivateData.secondCall.args[2].toString()).toString('utf8'));
            // console.info(JSON.stringify(activationDocument_Child));
            // console.info("-----------");
            // console.info(transactionContext.stub.putPrivateData.thirdCall.args);
            // console.info("ooooooooo");
            // console.info(Buffer.from(transactionContext.stub.putPrivateData.thirdCall.args[2].toString()).toString('utf8'));
            // console.info(JSON.stringify(expectedCreation));
            // console.info("-----------");

            transactionContext.stub.putPrivateData.firstCall.should.have.been.calledWithExactly(
                "enedis-rte",
                activationDocument_Parent.activationDocumentMrid,
                Buffer.from(JSON.stringify(activationDocument_Parent))
            );

            transactionContext.stub.putPrivateData.secondCall.should.have.been.calledWithExactly(
                "enedis-producer",
                activationDocument_Child.activationDocumentMrid,
                Buffer.from(JSON.stringify(activationDocument_Child))
            );

            transactionContext.stub.putPrivateData.thirdCall.should.have.been.calledWithExactly(
                "enedis-producer",
                expectedCreation.activationDocumentMrid,
                Buffer.from(JSON.stringify(expectedCreation))
            );
        });
    });





    describe('Test Garbage', () => {
        it('should return SUCCESS on GetActivationDocumentByProducer with MPWC reconciliation', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);

            transactionContext.stub.getState.withArgs(Values.HTA_systemoperator2.systemOperatorMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_systemoperator2)));
            transactionContext.stub.getState.withArgs(Values.HTA_Producer.producerMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_Producer)));

            const params: Parameters = await ParametersController.getParameterValues(transactionContext);
            const ppcott:number = params.values.get(ParametersType.PPCO_TIME_THRESHOLD);

            const activationDocument_Parent: ActivationDocument = JSON.parse(JSON.stringify(Values.HTB_ActivationDocument_HTA_JustStartDate));
            activationDocument_Parent.docType="activationDocument";
            activationDocument_Parent.startCreatedDateTime = Values.reduceDateStr(activationDocument_Parent.startCreatedDateTime as string, ppcott+1);
            activationDocument_Parent.potentialParent= true;
            activationDocument_Parent.potentialChild= false;

            const activationDocument_Child: ActivationDocument = JSON.parse(JSON.stringify(Values.HTA_ActivationDocument_Valid_Doc2));
            activationDocument_Child.docType="activationDocument";
            activationDocument_Child.startCreatedDateTime = Values.reduceDateStr(activationDocument_Child.startCreatedDateTime as string, ppcott+1);
            activationDocument_Child.endCreatedDateTime = Values.reduceDateStr(activationDocument_Child.endCreatedDateTime as string, ppcott+1);
            activationDocument_Child.potentialParent= false;
            activationDocument_Child.potentialChild= true;


            const queryCrank = `{"selector": {"docType": "activationDocument", "potentialParent": true, "potentialChild": true}}`;
            const iteratorMix = Values.getActivationDocumentQueryMock(activationDocument_Parent,mockHandler);
            transactionContext.stub.getPrivateDataQueryResult.withArgs("enedis-rte", queryCrank).resolves(iteratorMix);
            const iteratorProd = Values.getActivationDocumentQueryMock(activationDocument_Child,mockHandler);
            transactionContext.stub.getPrivateDataQueryResult.withArgs("enedis-producer", queryCrank).resolves(iteratorProd);

            /* Start : GetActivationDocumentByProducer Test */
            const iterator = Values.getActivationDocumentQueryMock2Values(Values.HTA_ActivationDocument_Valid, Values.HTA_ActivationDocument_Valid_Doc2,mockHandler);
            const query = `{"selector": {"docType": "activationDocument", "receiverMarketParticipantMrid": "${Values.HTA_Producer.producerMarketParticipantMrid}"}}`;
            transactionContext.stub.getPrivateDataQueryResult.withArgs("enedis-producer", query).resolves(iterator);

            let ret = await star.GetActivationDocumentByProducer(transactionContext, Values.HTA_Producer.producerMarketParticipantMrid);
            ret = JSON.parse(ret);
            // console.log('ret=', ret)
            expect(ret.length).to.equal(2);

            const expected: ActivationDocument[] = [Values.HTA_ActivationDocument_Valid, Values.HTA_ActivationDocument_Valid_Doc2];

            expect(ret).to.eql(expected);
            /* End : GetActivationDocumentByProducer Test */


            //Reconciliation opportunities are closed
            activationDocument_Parent.orderEnd = true;
            activationDocument_Parent.potentialParent = false;

            activationDocument_Child.orderEnd = true;
            activationDocument_Child.potentialChild = false;

            // console.info("-----------");
            // console.info(transactionContext.stub.putPrivateData.firstCall.args);
            // console.info("ooooooooo");
            // console.info(Buffer.from(transactionContext.stub.putPrivateData.firstCall.args[2].toString()).toString('utf8'));
            // console.info(JSON.stringify(activationDocument_Parent));
            // console.info("-----------");
            // console.info(transactionContext.stub.putPrivateData.secondCall.args);
            // console.info("ooooooooo");
            // console.info(Buffer.from(transactionContext.stub.putPrivateData.secondCall.args[2].toString()).toString('utf8'));
            // console.info(JSON.stringify(activationDocument_Child));
            // console.info("-----------");

            transactionContext.stub.putPrivateData.firstCall.should.have.been.calledWithExactly(
                "enedis-rte",
                activationDocument_Parent.activationDocumentMrid,
                Buffer.from(JSON.stringify(activationDocument_Parent))
            );

            transactionContext.stub.putPrivateData.secondCall.should.have.been.calledWithExactly(
                "enedis-producer",
                activationDocument_Child.activationDocumentMrid,
                Buffer.from(JSON.stringify(activationDocument_Child))
            );
        });


        it('should return SUCCESS on GetActivationDocumentBySystemOperator with MPWC reconciliation', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);

            transactionContext.stub.getState.withArgs(Values.HTA_systemoperator2.systemOperatorMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_systemoperator2)));
            transactionContext.stub.getState.withArgs(Values.HTA_Producer.producerMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_Producer)));

            const params: Parameters = await ParametersController.getParameterValues(transactionContext);
            const ppcott:number = params.values.get(ParametersType.PPCO_TIME_THRESHOLD);

            const activationDocument_Parent: ActivationDocument = JSON.parse(JSON.stringify(Values.HTB_ActivationDocument_HTA_JustStartDate));
            activationDocument_Parent.docType="activationDocument";
            activationDocument_Parent.startCreatedDateTime = Values.reduceDateStr(activationDocument_Parent.startCreatedDateTime as string, ppcott+1);
            activationDocument_Parent.potentialParent= true;
            activationDocument_Parent.potentialChild= false;

            const activationDocument_Child: ActivationDocument = JSON.parse(JSON.stringify(Values.HTA_ActivationDocument_Valid_Doc2));
            activationDocument_Child.docType="activationDocument";
            activationDocument_Child.startCreatedDateTime = Values.reduceDateStr(activationDocument_Child.startCreatedDateTime as string, ppcott+1);
            activationDocument_Child.endCreatedDateTime = Values.reduceDateStr(activationDocument_Child.endCreatedDateTime as string, ppcott+1);
            activationDocument_Child.potentialParent= false;
            activationDocument_Child.potentialChild= true;

            const queryCrank = `{"selector": {"docType": "activationDocument", "potentialParent": true, "potentialChild": true}}`;
            const iteratorMix = Values.getActivationDocumentQueryMock(activationDocument_Parent,mockHandler);
            transactionContext.stub.getPrivateDataQueryResult.withArgs("enedis-rte", queryCrank).resolves(iteratorMix);
            const iteratorProd = Values.getActivationDocumentQueryMock(activationDocument_Child,mockHandler);
            transactionContext.stub.getPrivateDataQueryResult.withArgs("enedis-producer", queryCrank).resolves(iteratorProd);

            /* Start : GetActivationDocumentBySystemOperator Test */
            const iterator = Values.getActivationDocumentQueryMock(Values.HTA_ActivationDocument_Valid,mockHandler);
            const query = `{"selector": {"docType": "activationDocument", "senderMarketParticipantMrid": "${Values.HTA_ActivationDocument_Valid.senderMarketParticipantMrid}"}}`;
            transactionContext.stub.getPrivateDataQueryResult.withArgs("enedis-producer", query).resolves(iterator);

            let ret = await star.GetActivationDocumentBySystemOperator(transactionContext, Values.HTA_ActivationDocument_Valid.senderMarketParticipantMrid as string);
            ret = JSON.parse(ret);
            // console.log('ret=', ret)
            expect(ret.length).to.equal(1);

            const expected: ActivationDocument[] = [Values.HTA_ActivationDocument_Valid];

            expect(ret).to.eql(expected);
            /* End : GetActivationDocumentByProducer Test */


            //Reconciliation opportunities are closed
            activationDocument_Parent.orderEnd = true;
            activationDocument_Parent.potentialParent = false;

            activationDocument_Child.orderEnd = true;
            activationDocument_Child.potentialChild = false;

            // console.info("-----------");
            // console.info(transactionContext.stub.putPrivateData.firstCall.args);
            // console.info("ooooooooo");
            // console.info(Buffer.from(transactionContext.stub.putPrivateData.firstCall.args[2].toString()).toString('utf8'));
            // console.info(JSON.stringify(activationDocument_Parent));
            // console.info("-----------");
            // console.info(transactionContext.stub.putPrivateData.secondCall.args);
            // console.info("ooooooooo");
            // console.info(Buffer.from(transactionContext.stub.putPrivateData.secondCall.args[2].toString()).toString('utf8'));
            // console.info(JSON.stringify(activationDocument_Child));
            // console.info("-----------");

            transactionContext.stub.putPrivateData.firstCall.should.have.been.calledWithExactly(
                "enedis-rte",
                activationDocument_Parent.activationDocumentMrid,
                Buffer.from(JSON.stringify(activationDocument_Parent))
            );

            transactionContext.stub.putPrivateData.secondCall.should.have.been.calledWithExactly(
                "enedis-producer",
                activationDocument_Child.activationDocumentMrid,
                Buffer.from(JSON.stringify(activationDocument_Child))
            );
        });


        it('should return SUCCESS CreateActivationDocument couple HTA', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);

            transactionContext.stub.getState.withArgs(Values.HTA_systemoperator.systemOperatorMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_systemoperator)));
            transactionContext.stub.getState.withArgs(Values.HTA_Producer.producerMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_Producer)));

            const params: Parameters = await ParametersController.getParameterValues(transactionContext);
            const ppcott:number = params.values.get(ParametersType.PPCO_TIME_THRESHOLD);

            const activationDocument_Parent: ActivationDocument = JSON.parse(JSON.stringify(Values.HTB_ActivationDocument_HTA_JustStartDate));
            activationDocument_Parent.docType="activationDocument";
            activationDocument_Parent.startCreatedDateTime = Values.reduceDateStr(activationDocument_Parent.startCreatedDateTime as string, ppcott+1);
            activationDocument_Parent.potentialParent= true;
            activationDocument_Parent.potentialChild= false;

            const activationDocument_Child: ActivationDocument = JSON.parse(JSON.stringify(Values.HTA_ActivationDocument_Valid_Doc2));
            activationDocument_Child.docType="activationDocument";
            activationDocument_Child.startCreatedDateTime = Values.reduceDateStr(activationDocument_Child.startCreatedDateTime as string, ppcott+1);
            activationDocument_Child.endCreatedDateTime = Values.reduceDateStr(activationDocument_Child.endCreatedDateTime as string, ppcott+1);
            activationDocument_Child.potentialParent= false;
            activationDocument_Child.potentialChild= true;

            const queryCrank = `{"selector": {"docType": "activationDocument", "potentialParent": true, "potentialChild": true}}`;
            const iteratorMix = Values.getActivationDocumentQueryMock(activationDocument_Parent,mockHandler);
            transactionContext.stub.getPrivateDataQueryResult.withArgs("enedis-rte", queryCrank).resolves(iteratorMix);
            const iteratorProd = Values.getActivationDocumentQueryMock(activationDocument_Child,mockHandler);
            transactionContext.stub.getPrivateDataQueryResult.withArgs("enedis-producer", queryCrank).resolves(iteratorProd);

            /* START : CreateActivationDocument Test */
            const activationDocument:ActivationDocument = JSON.parse(JSON.stringify(Values.HTA_ActivationDocument_Valid));
            transactionContext.stub.getState.withArgs(Values.HTA_systemoperator.systemOperatorMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_systemoperator)));
            transactionContext.stub.getState.withArgs(Values.HTA_Producer.producerMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_Producer)));

            const collectionNames: string[] = params.values.get(ParametersType.SITE);
            transactionContext.stub.getPrivateData.withArgs(collectionNames[0], Values.HTA_site_valid.meteringPointMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_site_valid)));

            await star.CreateActivationDocument(transactionContext, JSON.stringify(activationDocument));

            const expectedCreation: ActivationDocument = activationDocument;
            expectedCreation.orderEnd = true;
            expectedCreation.potentialParent = false;
            expectedCreation.potentialChild = true;
            expectedCreation.docType = 'activationDocument';

            /* End : CreateActivationDocument Test */


            //Reconciliation opportunities are closed
            activationDocument_Parent.orderEnd = true;
            activationDocument_Parent.potentialParent = false;

            activationDocument_Child.orderEnd = true;
            activationDocument_Child.potentialChild = false;

            // console.info("-----------");
            // console.info(transactionContext.stub.putPrivateData.firstCall.args);
            // console.info("ooooooooo");
            // console.info(Buffer.from(transactionContext.stub.putPrivateData.firstCall.args[2].toString()).toString('utf8'));
            // console.info(JSON.stringify(activationDocument_Parent));
            // console.info("-----------");
            // console.info(transactionContext.stub.putPrivateData.secondCall.args);
            // console.info("ooooooooo");
            // console.info(Buffer.from(transactionContext.stub.putPrivateData.secondCall.args[2].toString()).toString('utf8'));
            // console.info(JSON.stringify(activationDocument_Child));
            // console.info("-----------");
            // console.info(transactionContext.stub.putPrivateData.thirdCall.args);
            // console.info("ooooooooo");
            // console.info(Buffer.from(transactionContext.stub.putPrivateData.thirdCall.args[2].toString()).toString('utf8'));
            // console.info(JSON.stringify(expectedCreation));
            // console.info("-----------");

            transactionContext.stub.putPrivateData.firstCall.should.have.been.calledWithExactly(
                "enedis-rte",
                activationDocument_Parent.activationDocumentMrid,
                Buffer.from(JSON.stringify(activationDocument_Parent))
            );

            transactionContext.stub.putPrivateData.secondCall.should.have.been.calledWithExactly(
                "enedis-producer",
                activationDocument_Child.activationDocumentMrid,
                Buffer.from(JSON.stringify(activationDocument_Child))
            );

            transactionContext.stub.putPrivateData.thirdCall.should.have.been.calledWithExactly(
                "enedis-producer",
                expectedCreation.activationDocumentMrid,
                Buffer.from(JSON.stringify(expectedCreation))
            );

        });
    });
});
