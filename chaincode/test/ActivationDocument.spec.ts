'use strict';
const sinon = require('sinon');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinonChai = require('sinon-chai');
const expect = chai.expect;

import { ChaincodeStub, ClientIdentity } from 'fabric-shim'

import { Star } from '../src/star'
import { ActivationDocument } from '../src/model/activationDocument/activationDocument';
import { STARParameters } from '../src/model/starParameters';

import { OrganizationTypeMsp } from '../src/enums/OrganizationMspType';

import { Values } from './Values';
import { ParametersController } from '../src/controller/ParametersController';
import { ParametersType } from '../src/enums/ParametersType';
import { DocType } from '../src/enums/DocType';
import { RoleType } from '../src/enums/RoleType';
import { DataReference } from '../src/model/dataReference';
import { QueryStateService } from '../src/controller/service/QueryStateService';
import { EligibilityStatus } from '../src/model/activationDocument/eligibilityStatus';
import { EligibilityStatusType } from '../src/enums/EligibilityStatusType';
import { HLFServices } from '../src/controller/service/HLFservice';

class TestLoggerMgt {
    public getLogger(arg: string): any {
        return console;
    }
}

class TestContext {
    clientIdentity: any;
    stub: any;
    logger: TestLoggerMgt= new TestLoggerMgt();

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
    beforeEach(() => {
        transactionContext = new TestContext();
        star = new Star();
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

                const params: STARParameters = await ParametersController.getParameterValues(transactionContext);
                const collectionNames: string[] = await HLFServices.getCollectionsOrDefault(params, ParametersType.DATA_TARGET);
                transactionContext.stub.getPrivateData.withArgs(collectionNames[0], Values.HTA_site_valid.meteringPointMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_site_valid)));

                await star.CreateActivationDocument(transactionContext, JSON.stringify(activationDocument));
            } catch(err) {
                // params.logger.info(err.message)
                expect(err.message).to.equal('failed inserting key');
            }
        });

        it('should return ERROR on CreateActivationDocument NON-JSON Value', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);
            try {
                await star.CreateActivationDocument(transactionContext, 'XXXXXX');
            } catch(err) {
                // params.logger.info(err.message)
                expect(err.message).to.equal('ERROR '.concat(DocType.ACTIVATION_DOCUMENT).concat(' -> Input string NON-JSON value'));
            }
        });



        it('should return ERROR CreateActivationDocument missing originAutomationRegisteredResourceMrid', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);

            transactionContext.stub.getState.withArgs(Values.HTA_systemoperator.systemOperatorMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_systemoperator)));
            transactionContext.stub.getState.withArgs(Values.HTA_Producer.producerMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_Producer)));

            const params: STARParameters = await ParametersController.getParameterValues(transactionContext);
            const collectionNames: string[] = await HLFServices.getCollectionsOrDefault(params, ParametersType.DATA_TARGET);
            transactionContext.stub.getPrivateData.withArgs(collectionNames[0], Values.HTA_site_valid.meteringPointMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_site_valid)));

            const ad_str = await Values.deleteJSONField(JSON.stringify(Values.HTA_ActivationDocument_Valid), 'originAutomationRegisteredResourceMrid');

            try {
                await star.CreateActivationDocument(transactionContext, ad_str);
            } catch(err) {
                // params.logger.info(err.message)
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
                // params.logger.info(err.message)
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
                // params.logger.info(err.message)
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
                // params.logger.info(err.message)
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
                // params.logger.info(err.message)
                expect(err.message).to.equal('businessType is required');
            }
        });

        // OrderEnd is fulltime calculated, then not required anymore
        // it('should return ERROR CreateActivationDocument missing orderEnd', async () => {
        //     transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);

        //     var input = JSON.stringify(Values.HTA_ActivationDocument_Valid);
        //     input = await Values.deleteJSONField(input, "orderEnd");

        //     try {
        //         await star.CreateActivationDocument(transactionContext, input);
        //     } catch(err) {
        //         // params.logger.info(err.message)
        //         expect(err.message).to.equal('orderEnd is required');
        //     }
        // });

        it('should return ERROR CreateActivationDocument missing senderMarketParticipantMrid', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);

            var input = JSON.stringify(Values.HTA_ActivationDocument_Valid);
            input = await Values.deleteJSONField(input, "senderMarketParticipantMrid");

            try {
                await star.CreateActivationDocument(transactionContext, input);
            } catch(err) {
                // params.logger.info(err.message)
                expect(err.message).to.equal('senderMarketParticipantMrid is required');
            }
        });

        it('should return ERROR CreateActivationDocument missing receiverMarketParticipantMrid', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);

            var input = JSON.stringify(Values.HTA_ActivationDocument_Valid);
            input = await Values.deleteJSONField(input, "receiverMarketParticipantMrid");

            try {
                await star.CreateActivationDocument(transactionContext, input);
            } catch(err) {
                // params.logger.info(err.message)
                expect(err.message).to.equal('receiverMarketParticipantMrid is required');
            }
        });

        it('should return ERROR CreateActivationDocument couple HTA wrong MSPID -> FakeMSP', async () => {
            transactionContext.clientIdentity.getMSPID.returns(Values.FakeMSP);
            const activationDocument:ActivationDocument = JSON.parse(JSON.stringify(Values.HTA_ActivationDocument_Valid));

            try {
                await star.CreateActivationDocument(transactionContext, JSON.stringify(activationDocument));
            } catch(err) {
                // params.logger.info(err.message)
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
        //         params.logger.info(err.message)
        //         expect(err.message).to.equal('Organisation, enedis does not have write access for MW orders');
        //     }
        // });

        it('should return ERROR CreateActivationDocument couple HTA missing systemoperator', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);
            const activationDocument:ActivationDocument = JSON.parse(JSON.stringify(Values.HTA_ActivationDocument_Valid));
            // transactionContext.stub.getState.withArgs(Values.HTA_systemoperator.systemOperatorMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_systemoperator)));
            transactionContext.stub.getState.withArgs(Values.HTA_Producer.producerMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_Producer)));

            const params: STARParameters = await ParametersController.getParameterValues(transactionContext);
            const collectionNames: string[] = await HLFServices.getCollectionsOrDefault(params, ParametersType.DATA_TARGET);
            transactionContext.stub.getPrivateData.withArgs(collectionNames[0], Values.HTA_site_valid.meteringPointMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_site_valid)));

            try {
                await star.CreateActivationDocument(transactionContext, JSON.stringify(activationDocument));
            } catch(err) {
                // params.logger.info(err.message)
                expect(err.message).to.equal('ERROR createActivationDocument : '.concat(DocType.SYSTEM_OPERATOR).concat(' : ')
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

            const params: STARParameters = await ParametersController.getParameterValues(transactionContext);
            const collectionNames: string[] = await HLFServices.getCollectionsOrDefault(params, ParametersType.DATA_TARGET);
            transactionContext.stub.getPrivateData.withArgs(collectionNames[0], Values.HTA_site_valid.meteringPointMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_site_valid)));

            try {
                await star.CreateActivationDocument(transactionContext, JSON.stringify(activationDocument));
            } catch(err) {
                // params.logger.info(err.message)
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

            const params: STARParameters = await ParametersController.getParameterValues(transactionContext);
            const collectionNames: string[] = await HLFServices.getCollectionsOrDefault(params, ParametersType.DATA_TARGET);
            transactionContext.stub.getPrivateData.withArgs(collectionNames[0], Values.HTA_site_valid.meteringPointMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_site_valid)));

            var input = JSON.stringify(activationDocument);
            input = await Values.deleteJSONField(input, "orderValue");
            input = await Values.deleteJSONField(input, "endCreatedDateTime");

            try {
                await star.CreateActivationDocument(transactionContext, input);
            } catch(err) {
                // params.logger.info(err.message)
                expect(err.message).to.equal('Order must have a limitation value');
            }
        });

        it('should return ERROR CreateActivationDocument couple HTA incoherency between messageType, businessType and reason code', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);
            const activationDocument:ActivationDocument = JSON.parse(JSON.stringify(Values.HTA_ActivationDocument_Valid));
            transactionContext.stub.getState.withArgs(Values.HTA_systemoperator.systemOperatorMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_systemoperator)));
            transactionContext.stub.getState.withArgs(Values.HTA_Producer.producerMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_Producer)));

            const params: STARParameters = await ParametersController.getParameterValues(transactionContext);
            const collectionNames: string[] = await HLFServices.getCollectionsOrDefault(params, ParametersType.DATA_TARGET);
            transactionContext.stub.getPrivateData.withArgs(collectionNames[0], Values.HTA_site_valid.meteringPointMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_site_valid)));

            activationDocument.reasonCode = '';
            try {
                await star.CreateActivationDocument(transactionContext, JSON.stringify(activationDocument));
            } catch(err) {
                // params.logger.info(err.message)
                expect(err.message).to.equal(`Incoherency between messageType, businessType and reason code for Activation Document ${activationDocument.activationDocumentMrid} creation.`);
            }

        });

        it('should return SUCCESS CreateActivationDocument couple HTA', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);
            const activationDocument:ActivationDocument = JSON.parse(JSON.stringify(Values.HTA_ActivationDocument_Valid));
            transactionContext.stub.getState.withArgs(Values.HTA_systemoperator.systemOperatorMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_systemoperator)));
            transactionContext.stub.getState.withArgs(Values.HTA_Producer.producerMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_Producer)));

            const params: STARParameters = await ParametersController.getParameterValues(transactionContext);
            const collectionNames: string[] = await HLFServices.getCollectionsOrDefault(params, ParametersType.DATA_TARGET);
            transactionContext.stub.getPrivateData.withArgs(collectionNames[0], Values.HTA_site_valid.meteringPointMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_site_valid)));

            // const iterator = Values.getYellowPageQueryMock(Values.HTA_yellowPage, mockHandler);
            // const query = `{"selector": {"docType": "yellowPages", "originAutomationRegisteredResourceMrid": "${activationDocument.originAutomationRegisteredResourceMrid}"}}`;
            // transactionContext.stub.getQueryResult.withArgs(query).resolves(iterator);

            await star.CreateActivationDocument(transactionContext, JSON.stringify(activationDocument));

            const expected: ActivationDocument = activationDocument;
            expected.orderEnd = true;
            expected.receiverRole = RoleType.Role_Producer;
            expected.potentialParent = false;
            expected.potentialChild = true;
            expected.eligibilityStatus = EligibilityStatusType.EligibilityAccepted;
            expected.eligibilityStatusEditable = false;
            expected.docType = DocType.ACTIVATION_DOCUMENT;

            // params.logger.info("-----------")
            // params.logger.info(transactionContext.stub.putPrivateData.firstCall.args);
            // params.logger.info("ooooooooo")
            // params.logger.info(Buffer.from(transactionContext.stub.putPrivateData.firstCall.args[2].toString()).toString('utf8'));
            // params.logger.info(JSON.stringify(expected))
            // params.logger.info("-----------")


            transactionContext.stub.putPrivateData.should.have.been.calledOnceWithExactly(
                "enedis-producer",
                expected.activationDocumentMrid,
                Buffer.from(JSON.stringify(expected))
            );

            expect(transactionContext.stub.putPrivateData.callCount).to.equal(1);
        });

        it('should return SUCCESS CreateActivationDocumentListe 2 docs HTA', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);
            const activationDocument:ActivationDocument = JSON.parse(JSON.stringify(Values.HTA_ActivationDocument_Valid));
            const activationDocument2:ActivationDocument = JSON.parse(JSON.stringify(Values.HTA_ActivationDocument_Valid_Doc2));

            transactionContext.stub.getState.withArgs(activationDocument.senderMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_systemoperator)));
            transactionContext.stub.getState.withArgs(activationDocument.receiverMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_Producer)));
            transactionContext.stub.getState.withArgs(activationDocument2.senderMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_systemoperator)));
            transactionContext.stub.getState.withArgs(activationDocument2.receiverMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_Producer)));

            const params: STARParameters = await ParametersController.getParameterValues(transactionContext);
            const collectionNames: string[] = await HLFServices.getCollectionsOrDefault(params, ParametersType.DATA_TARGET);
            transactionContext.stub.getPrivateData.withArgs(collectionNames[0], activationDocument.registeredResourceMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_site_valid)));
            transactionContext.stub.getPrivateData.withArgs(collectionNames[0], activationDocument2.registeredResourceMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_site_valid)));

            // const iterator = Values.getYellowPageQueryMock(Values.HTA_yellowPage, mockHandler);
            // const query = `{"selector": {"docType": "yellowPages", "originAutomationRegisteredResourceMrid": "${activationDocument.originAutomationRegisteredResourceMrid}"}}`;
            // transactionContext.stub.getQueryResult.withArgs(query).resolves(iterator);


            const listActivationDocuments = [activationDocument, activationDocument2];
            await star.CreateActivationDocumentList(transactionContext, JSON.stringify(listActivationDocuments));

            const expected: ActivationDocument = activationDocument;
            expected.orderEnd = true;
            expected.receiverRole = RoleType.Role_Producer;
            expected.potentialParent = false;
            expected.potentialChild = true;
            expected.eligibilityStatus = EligibilityStatusType.EligibilityAccepted;
            expected.eligibilityStatusEditable = false;
            expected.docType = DocType.ACTIVATION_DOCUMENT;
            const expected2: ActivationDocument = activationDocument2;
            expected2.orderEnd = true;
            expected2.receiverRole = RoleType.Role_Producer;
            expected2.potentialParent = false;
            expected2.potentialChild = true;
            expected2.eligibilityStatus = '';
            expected2.docType = DocType.ACTIVATION_DOCUMENT;

            // params.logger.info("-----------")
            // params.logger.info(transactionContext.stub.putPrivateData.firstCall.args);
            // params.logger.info("ooooooooo")
            // params.logger.info(Buffer.from(transactionContext.stub.putPrivateData.firstCall.args[2].toString()).toString('utf8'));
            // params.logger.info(JSON.stringify(expected))
            // params.logger.info("-----------")
            // params.logger.info(transactionContext.stub.putPrivateData.secondCall.args);
            // params.logger.info("ooooooooo")
            // params.logger.info(Buffer.from(transactionContext.stub.putPrivateData.secondCall.args[2].toString()).toString('utf8'));
            // params.logger.info(JSON.stringify(expected2))
            // params.logger.info("-----------")

            transactionContext.stub.putPrivateData.firstCall.should.have.been.calledWithExactly(
                "enedis-producer",
                expected.activationDocumentMrid,
                Buffer.from(JSON.stringify(expected))
            );

            transactionContext.stub.putPrivateData.secondCall.should.have.been.calledWithExactly(
                "enedis-producer",
                expected2.activationDocumentMrid,
                Buffer.from(JSON.stringify(expected2))
            );

            expect(transactionContext.stub.putPrivateData.callCount).to.equal(2);
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
                // params.logger.info(err.message)
                expect(err.message).to.equal('ERROR '.concat(DocType.ACTIVATION_DOCUMENT).concat(' -> Input string NON-JSON value'));
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

        // OrderEnd is fulltime calculated, then not required anymore
        const errors = [
                'activationDocumentMrid is a compulsory string',
                'businessType is required',
                'measurementUnitName is required',
                'messageType is required',
                // 'orderEnd is required',
                'originAutomationRegisteredResourceMrid is required',
                'registeredResourceMrid is required'
              ];

            try {
                await star.CreateActivationDocument(transactionContext, input);
            } catch(err) {
                // params.logger.info(err)
                expect(err.errors[0]).to.equal(errors[0]);
                expect(err.errors[1]).to.equal(errors[1]);
                expect(err.errors[2]).to.equal(errors[2]);
                expect(err.errors[3]).to.equal(errors[3]);
                expect(err.errors[4]).to.equal(errors[4]);
                expect(err.errors[5]).to.equal(errors[5]);
                expect(err.errors[6]).to.equal(errors[6]);
                // expect(err.errors[7]).to.equal(errors[7]);
                expect(err.message).to.equal('6 errors occurred');
            }
        });

        it('should return ERROR CreateActivationDocument missing activationDocumentMrid', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);

            var input = JSON.stringify(Values.HTB_ActivationDocument_JustStartDate);
            input = await Values.deleteJSONField(input, "activationDocumentMrid")

            try {
                await star.CreateActivationDocument(transactionContext, input);
            } catch(err) {
                // params.logger.info(err.message)
                expect(err.message).to.equal('activationDocumentMrid is a compulsory string');
            }
        });

        it('should return ERROR CreateActivationDocument couple HTA wrong MSPID -> RTE', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);
            const activationDocument:ActivationDocument = JSON.parse(JSON.stringify(Values.HTA_ActivationDocument_Valid_ForRTETest));
            transactionContext.stub.getState.withArgs(Values.HTA_systemoperator.systemOperatorMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_systemoperator)));
            transactionContext.stub.getState.withArgs(Values.HTA_Producer.producerMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_Producer)));

            const params: STARParameters = await ParametersController.getParameterValues(transactionContext);
            const collectionNames: string[] = await HLFServices.getCollectionsOrDefault(params, ParametersType.DATA_TARGET);
            transactionContext.stub.getPrivateData.withArgs(collectionNames[0], Values.HTA_site_valid.meteringPointMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_site_valid)));

            try {
                await star.CreateActivationDocument(transactionContext, JSON.stringify(activationDocument));
            } catch(err) {
                // params.logger.info(err.message)
                expect(err.message).to.equal(`Organisation, ${OrganizationTypeMsp.RTE} cannot send Activation Document for sender ${OrganizationTypeMsp.ENEDIS}`);
            }
        });

        it('should return ERROR CreateActivationDocument begin HTB site doesn\'t exist', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);
            const activationDocument:ActivationDocument = JSON.parse(JSON.stringify(Values.HTB_ActivationDocument_JustStartDate));
            transactionContext.stub.getState.withArgs(Values.HTB_systemoperator.systemOperatorMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTB_systemoperator)));
            transactionContext.stub.getState.withArgs(Values.HTB_Producer.producerMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTB_Producer)));

            // const params: STARParameters = await ParametersController.getParameterValues(transactionContext);
            // const collectionNames: string[] = await HLFServices.getCollectionsOrDefault(params, ParametersType.DATA_TARGET);
            // transactionContext.stub.getPrivateData.withArgs(collectionNames[0], Values.HTB_site_valid.meteringPointMrid).resolves(Buffer.from(JSON.stringify(Values.HTB_site_valid)));

            try {
                await star.CreateActivationDocument(transactionContext, JSON.stringify(activationDocument));
            } catch(err) {
                // params.logger.info(err.message)
                expect(err.message).to.equal(DocType.SITE.concat(' : ')
                    .concat(Values.HTB_site_valid.meteringPointMrid)
                    .concat(' does not exist (not found in any collection). for Activation Document ')
                    .concat(activationDocument.activationDocumentMrid)
                    .concat(' creation.'));
            }
        });

        it('should return ERROR CreateActivationDocument begin HTB producer doesn\'t exist', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);
            const activationDocument:ActivationDocument = JSON.parse(JSON.stringify(Values.HTB_ActivationDocument_JustStartDate));
            transactionContext.stub.getState.withArgs(Values.HTB_systemoperator.systemOperatorMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTB_systemoperator)));
            // transactionContext.stub.getState.withArgs(Values.HTB_Producer.producerMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTB_Producer)));

            // const params: STARParameters = await ParametersController.getParameterValues(transactionContext);
            // const collectionNames: string[] = await HLFServices.getCollectionsOrDefault(params, ParametersType.DATA_TARGET);
            // transactionContext.stub.getPrivateData.withArgs(collectionNames[0], Values.HTB_site_valid.meteringPointMrid).resolves(Buffer.from(JSON.stringify(Values.HTB_site_valid)));

            try {
                await star.CreateActivationDocument(transactionContext, JSON.stringify(activationDocument));
            } catch(err) {
                // params.logger.info(err.message)
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

            const params: STARParameters = await ParametersController.getParameterValues(transactionContext);
            const collectionNames: string[] = await HLFServices.getCollectionsOrDefault(params, ParametersType.DATA_TARGET);
            transactionContext.stub.getPrivateData.withArgs(collectionNames[0], Values.HTB_site_valid.meteringPointMrid).resolves(Buffer.from(JSON.stringify(Values.HTB_site_valid)));

            await star.CreateActivationDocument(transactionContext, JSON.stringify(activationDocument));

            const expected: ActivationDocument = activationDocument;
            expected.orderEnd = false;
            expected.receiverRole = RoleType.Role_Producer;
            expected.potentialParent = true;
            expected.potentialChild = false;
            expected.eligibilityStatus = '';
            expected.docType = DocType.ACTIVATION_DOCUMENT;

            // params.logger.info("-----------")
            // params.logger.info(transactionContext.stub.putPrivateData.firstCall.args);
            // params.logger.info("ooooooooo")
            // params.logger.info(Buffer.from(transactionContext.stub.putPrivateData.firstCall.args[2].toString()).toString('utf8'));
            // params.logger.info(JSON.stringify(expected))
            // params.logger.info("-----------")


            transactionContext.stub.putPrivateData.should.have.been.calledOnceWithExactly(
                "producer-rte",
                expected.activationDocumentMrid,
                Buffer.from(JSON.stringify(expected))
            );

            expect(transactionContext.stub.putPrivateData.callCount).to.equal(1);
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
            // params.logger.log('retADproducer=', ret)
            expect(ret.length).to.equal(0);
            expect(ret).to.eql([]);
        });

        it('should return SUCCESS on GetActivationDocumentByProducer', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.PRODUCER);
            const iterator1 = Values.getActivationDocumentQueryMock(Values.HTA_ActivationDocument_Valid, mockHandler);
            const iterator2 = Values.getActivationDocumentQueryMock(Values.HTA_ActivationDocument_Valid_Doc2,mockHandler);
            const query = `{"selector": {"docType": "${DocType.ACTIVATION_DOCUMENT}", "receiverMarketParticipantMrid": "${Values.HTA_Producer.producerMarketParticipantMrid}"}}`;
            transactionContext.stub.getPrivateDataQueryResult.withArgs("enedis-producer", query).resolves(iterator1);
            transactionContext.stub.getPrivateDataQueryResult.withArgs("producer-rte", query).resolves(iterator2);

            let ret = await star.GetActivationDocumentByProducer(transactionContext, Values.HTA_Producer.producerMarketParticipantMrid);
            ret = JSON.parse(ret);
            // params.logger.log('ret=', ret)
            expect(ret.length).to.equal(2);

            const expectedDoc1 = JSON.parse(JSON.stringify(Values.HTA_ActivationDocument_Valid));
            expectedDoc1.eligibilityStatus = '';
            expectedDoc1.eligibilityStatusEditable = false;
            const expectedDoc2 = JSON.parse(JSON.stringify(Values.HTA_ActivationDocument_Valid_Doc2));
            expectedDoc2.eligibilityStatus = '';
            expectedDoc2.eligibilityStatusEditable = false;
            const expected: ActivationDocument[] = [expectedDoc1, expectedDoc2];

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
        //     // params.logger.log('retB=', retB)
        //     expect(retB.length).to.equal(2);

        //     const expected = [
        //         'non-json-value',
        //         {
        //             activationDocumentMrid: "8c56459a-794a-4ed1-a7f6-33b0064508f2",
        //             businessType: "string",
        //             docType: "${DocType.ACTIVATION_DOCUMENT}",
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
            // params.logger.log('retADproducer=', ret)
            expect(ret.length).to.equal(0);
            expect(ret).to.eql([]);
        });



        it('should return SUCCESS on GetActivationDocumentBySystemOperator', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);
            const iterator = Values.getActivationDocumentQueryMock(Values.HTA_ActivationDocument_Valid,mockHandler);
            const iterator2 = Values.getActivationDocumentQueryMock(Values.HTA_ActivationDocument_Valid_Doc2,mockHandler);
            const query = `{"selector": {"docType": "${DocType.ACTIVATION_DOCUMENT}", "senderMarketParticipantMrid": "${Values.HTA_ActivationDocument_Valid.senderMarketParticipantMrid}"}}`;
            transactionContext.stub.getPrivateDataQueryResult.withArgs("enedis-producer", query).resolves(iterator);
            transactionContext.stub.getPrivateDataQueryResult.withArgs("producer-rte", query).resolves(iterator);

            let ret = await star.GetActivationDocumentBySystemOperator(transactionContext, Values.HTA_ActivationDocument_Valid.senderMarketParticipantMrid as string);
            ret = JSON.parse(ret);
            // params.logger.log('ret=', ret)
            expect(ret.length).to.equal(1);

            const expectedDoc1 = JSON.parse(JSON.stringify(Values.HTA_ActivationDocument_Valid));
            expectedDoc1.eligibilityStatus = '';
            expectedDoc1.eligibilityStatusEditable = false;
            const expected: ActivationDocument[] = [expectedDoc1];

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
        //     // params.logger.log('retB=', retB)
        //     expect(retB.length).to.equal(3);

        //     const expected = [
        //         'non-json-value',
        //         {
        //             activationDocumentMrid: "8c56459a-794a-4ed1-a7f6-33b0064508f1",
        //             businessType: "string",
        //             docType: "${DocType.ACTIVATION_DOCUMENT}",
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
        //             docType: "${DocType.ACTIVATION_DOCUMENT}",
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
/////////////////////////    RECONCILIATION STATE     //////////////////////
////////////////////////////////////////////////////////////////////////////
    describe('Test Reconciliation State', () => {
        it('should return SUCCESS on getReconciliationState / Garbage : 2 old', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);

            const params: STARParameters = await ParametersController.getParameterValues(transactionContext);
            const collectionMap: Map<string, string[]> = params.values.get(ParametersType.DATA_TARGET);
            const collectionsTSO: string[] = collectionMap.get(RoleType.Role_TSO) as string[];
            const collectionTSO: string = collectionsTSO[0];
            const collectionsProducer: string[] = collectionMap.get(RoleType.Role_Producer) as string[];
            const collectionProducer: string = collectionsProducer[0];
            const ppcott:number = params.values.get(ParametersType.PPCO_TIME_THRESHOLD);

            const activationDocument01_garbage: ActivationDocument = JSON.parse(JSON.stringify(Values.HTB_ActivationDocument_HTA_JustStartDate));
            activationDocument01_garbage.docType=DocType.ACTIVATION_DOCUMENT;
            activationDocument01_garbage.startCreatedDateTime = Values.reduceDateTimeStr(activationDocument01_garbage.startCreatedDateTime as string, ppcott+1);
            activationDocument01_garbage.potentialParent= true;
            activationDocument01_garbage.potentialChild= false;

            const activationDocument02_garbage: ActivationDocument = JSON.parse(JSON.stringify(Values.HTA_ActivationDocument_Valid_Doc2));
            activationDocument02_garbage.docType=DocType.ACTIVATION_DOCUMENT;
            activationDocument02_garbage.startCreatedDateTime = Values.reduceDateTimeStr(activationDocument02_garbage.startCreatedDateTime as string, ppcott+1);
            activationDocument02_garbage.endCreatedDateTime = Values.reduceDateTimeStr(activationDocument02_garbage.endCreatedDateTime as string, ppcott+1);
            activationDocument02_garbage.potentialParent= false;
            activationDocument02_garbage.potentialChild= true;

            const queryCrank = `{"selector": {"docType": "${DocType.ACTIVATION_DOCUMENT}","$or":[{"potentialParent": true},{"potentialChild": true}]}}`;
            const iteratorMix = Values.getActivationDocumentQueryMock(activationDocument01_garbage,mockHandler);
            transactionContext.stub.getPrivateDataQueryResult.withArgs(collectionTSO, queryCrank).resolves(iteratorMix);
            const iteratorProd = Values.getActivationDocumentQueryMock(activationDocument02_garbage,mockHandler);
            transactionContext.stub.getPrivateDataQueryResult.withArgs(collectionProducer, queryCrank).resolves(iteratorProd);

            let ret = await star.GetActivationDocumentReconciliationState(transactionContext);
            ret = JSON.parse(ret);
            // params.logger.log('ret=', ret)

            activationDocument01_garbage.orderEnd = true;
            activationDocument01_garbage.potentialParent = false;

            activationDocument02_garbage.orderEnd = true;
            activationDocument02_garbage.potentialChild = false;

            const updateOrders: DataReference[] = [];
            updateOrders.push({docType:DocType.ACTIVATION_DOCUMENT, collection: collectionTSO, data: activationDocument01_garbage});
            updateOrders.push({docType:DocType.ACTIVATION_DOCUMENT, collection: collectionProducer, data: activationDocument02_garbage});

            const expected = JSON.parse(JSON.stringify(updateOrders));
            // params.logger.log('expected=', expected)

            expect(ret).to.eql(expected);
        });

        it('should return SUCCESS on getReconciliationState / Garbage : 2 old - 1 current', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);

            const params: STARParameters = await ParametersController.getParameterValues(transactionContext);
            const collectionMap: Map<string, string[]> = params.values.get(ParametersType.DATA_TARGET);
            const collectionsTSO: string[] = collectionMap.get(RoleType.Role_TSO) as string[];
            const collectionTSO: string = collectionsTSO[0];
            const collectionsProducer: string[] = collectionMap.get(RoleType.Role_Producer) as string[];
            const collectionProducer: string = collectionsProducer[0];
            const ppcott:number = params.values.get(ParametersType.PPCO_TIME_THRESHOLD);

            const activationDocument_valid: ActivationDocument = JSON.parse(JSON.stringify(Values.HTB_ActivationDocument_HTA_JustStartDate));
            activationDocument_valid.docType=DocType.ACTIVATION_DOCUMENT;
            activationDocument_valid.potentialParent= true;
            activationDocument_valid.potentialChild= false;

            const activationDocument01_garbage: ActivationDocument = JSON.parse(JSON.stringify(Values.HTB_ActivationDocument_HTA_JustStartDate));
            activationDocument01_garbage.docType=DocType.ACTIVATION_DOCUMENT;
            activationDocument01_garbage.startCreatedDateTime = Values.reduceDateTimeStr(activationDocument01_garbage.startCreatedDateTime as string, ppcott+1);
            activationDocument01_garbage.potentialParent= true;
            activationDocument01_garbage.potentialChild= false;

            const activationDocument02_garbage: ActivationDocument = JSON.parse(JSON.stringify(Values.HTA_ActivationDocument_Valid_Doc2));
            activationDocument02_garbage.docType=DocType.ACTIVATION_DOCUMENT;
            activationDocument02_garbage.startCreatedDateTime = Values.reduceDateTimeStr(activationDocument02_garbage.startCreatedDateTime as string, ppcott+1);
            activationDocument02_garbage.endCreatedDateTime = Values.reduceDateTimeStr(activationDocument02_garbage.endCreatedDateTime as string, ppcott+1);
            activationDocument02_garbage.potentialParent= false;
            activationDocument02_garbage.potentialChild= true;

            const queryCrank = `{"selector": {"docType": "${DocType.ACTIVATION_DOCUMENT}","$or":[{"potentialParent": true},{"potentialChild": true}]}}`;
            const iteratorMix = Values.getActivationDocumentQueryMock2Values(activationDocument_valid, activationDocument01_garbage,mockHandler);
            transactionContext.stub.getPrivateDataQueryResult.withArgs(collectionTSO, queryCrank).resolves(iteratorMix);
            const iteratorProd = Values.getActivationDocumentQueryMock(activationDocument02_garbage,mockHandler);
            transactionContext.stub.getPrivateDataQueryResult.withArgs(collectionProducer, queryCrank).resolves(iteratorProd);

            let ret = await star.GetActivationDocumentReconciliationState(transactionContext);
            ret = JSON.parse(ret);
            // params.logger.log('ret=', ret)

            activationDocument01_garbage.orderEnd = true;
            activationDocument01_garbage.potentialParent = false;

            activationDocument02_garbage.orderEnd = true;
            activationDocument02_garbage.potentialChild = false;

            const updateOrders: DataReference[] = [];
            updateOrders.push({docType:DocType.ACTIVATION_DOCUMENT, collection: collectionTSO, data: activationDocument01_garbage});
            updateOrders.push({docType:DocType.ACTIVATION_DOCUMENT, collection: collectionProducer, data: activationDocument02_garbage});

            const expected = JSON.parse(JSON.stringify(updateOrders));
            // params.logger.log('expected=', expected)

            expect(ret).to.eql(expected);
        });



        it('should return SUCCESS on getReconciliationState / Matching end order HTB RTE', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);

            const params: STARParameters = await ParametersController.getParameterValues(transactionContext);
            const collectionMap: Map<string, string[]> = params.values.get(ParametersType.DATA_TARGET);
            const collectionsProducer: string[] = collectionMap.get(RoleType.Role_Producer) as string[];
            const collectionProducer: string = collectionsProducer[0];


            transactionContext.stub.getState.withArgs(Values.HTB_systemoperator.systemOperatorMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTB_systemoperator)));
            transactionContext.stub.getState.withArgs(Values.HTB_Producer.producerMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTB_Producer)));

            const collectionNamesSite: string[] = await HLFServices.getCollectionsOrDefault(params, ParametersType.DATA_TARGET);
            transactionContext.stub.getPrivateData.withArgs(collectionNamesSite[0], Values.HTB_site_valid.meteringPointMrid).resolves(Buffer.from(JSON.stringify(Values.HTB_site_valid)));


            const parentStartDocument:ActivationDocument = JSON.parse(JSON.stringify(Values.HTB_ActivationDocument_JustStartDate));
            parentStartDocument.potentialParent = true;
            parentStartDocument.potentialChild = false;
            parentStartDocument.docType = DocType.ACTIVATION_DOCUMENT;

            const childEndDocument: ActivationDocument = JSON.parse(JSON.stringify(Values.HTB_ActivationDocument_JustEndDate));
            childEndDocument.potentialParent = false;
            childEndDocument.potentialChild = true;
            childEndDocument.docType=DocType.ACTIVATION_DOCUMENT;

            const senderMarketParticipantMrid: string = childEndDocument.senderMarketParticipantMrid as string;
            const registeredResourceMrid: string = childEndDocument.registeredResourceMrid;

            const queryDate: string = childEndDocument.endCreatedDateTime as string;

            const pcuetmt:number = params.values.get(ParametersType.PC_TIME_UPDATEEND_MATCH_THRESHOLD);

            const datetmp = new Date(queryDate);
            datetmp.setUTCHours(0,0,0,0);
            const dateYesterday = new Date(datetmp.getTime() - pcuetmt);

            var args: string[] = [];
            args.push(`"orderEnd":false`);
            args.push(`"senderMarketParticipantMrid":"${senderMarketParticipantMrid}"`);
            args.push(`"registeredResourceMrid":"${registeredResourceMrid}"`);
            args.push(`"messageType":{"$in":["A54","A98"]}`);
            args.push(`"startCreatedDateTime":{"$gte":${JSON.stringify(dateYesterday)},"$lte":${JSON.stringify(queryDate)}}`);

            const query = await QueryStateService.buildQuery({documentType: DocType.ACTIVATION_DOCUMENT, queryArgs: args});

            const iterator = Values.getActivationDocumentQueryMock(parentStartDocument, mockHandler);
            transactionContext.stub.getPrivateDataQueryResult.withArgs(collectionProducer, query).resolves(iterator);

            const queryCrank = `{"selector": {"docType": "${DocType.ACTIVATION_DOCUMENT}","$or":[{"potentialParent": true},{"potentialChild": true}]}}`;
            const iteratorReconciliation = Values.getActivationDocumentQueryMock2Values(parentStartDocument, childEndDocument, mockHandler);
            transactionContext.stub.getPrivateDataQueryResult.withArgs(collectionProducer, queryCrank).resolves(iteratorReconciliation);

            let ret = await star.GetActivationDocumentReconciliationState(transactionContext);
            ret = JSON.parse(ret);
            // params.logger.log('ret=', ret)


            parentStartDocument.orderEnd = true;
            parentStartDocument.subOrderList = [childEndDocument.activationDocumentMrid];

            childEndDocument.potentialChild = false;
            childEndDocument.subOrderList = [parentStartDocument.activationDocumentMrid];
            childEndDocument.docType=DocType.ACTIVATION_DOCUMENT;

            const updateOrders: DataReference[] = [];
            updateOrders.push({docType:DocType.ACTIVATION_DOCUMENT, collection: collectionProducer, data: parentStartDocument});
            updateOrders.push({docType:DocType.ACTIVATION_DOCUMENT, collection: collectionProducer, data: childEndDocument});

            const expected = JSON.parse(JSON.stringify(updateOrders));
            // params.logger.log('expected=', expected)

            expect(ret).to.eql(expected);
        });



        it('should return SUCCESS on getReconciliationState / Matching end order HTB RTE (2 parents, choice on closest date )', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);

            const params: STARParameters = await ParametersController.getParameterValues(transactionContext);
            const collectionMap: Map<string, string[]> = params.values.get(ParametersType.DATA_TARGET);
            const collectionsProducer: string[] = collectionMap.get(RoleType.Role_Producer) as string[];
            const collectionProducer: string = collectionsProducer[0];


            transactionContext.stub.getState.withArgs(Values.HTB_systemoperator.systemOperatorMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTB_systemoperator)));
            transactionContext.stub.getState.withArgs(Values.HTB_Producer.producerMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTB_Producer)));

            const collectionNamesSite: string[] = await HLFServices.getCollectionsOrDefault(params, ParametersType.DATA_TARGET);
            transactionContext.stub.getPrivateData.withArgs(collectionNamesSite[0], Values.HTB_site_valid.meteringPointMrid).resolves(Buffer.from(JSON.stringify(Values.HTB_site_valid)));


            const parentStartDocument:ActivationDocument = JSON.parse(JSON.stringify(Values.HTB_ActivationDocument_JustStartDate));
            parentStartDocument.potentialParent = true;
            parentStartDocument.potentialChild = false;
            parentStartDocument.docType = DocType.ACTIVATION_DOCUMENT;

            const parentStartDocumentOldest: ActivationDocument = JSON.parse(JSON.stringify(Values.HTB_ActivationDocument_JustStartDate));
            parentStartDocumentOldest.activationDocumentMrid = parentStartDocumentOldest.activationDocumentMrid + "_Old";
            parentStartDocumentOldest.potentialParent= true;
            parentStartDocumentOldest.potentialChild= false;
            parentStartDocumentOldest.docType=DocType.ACTIVATION_DOCUMENT;
            var dateoldest = new Date(parentStartDocumentOldest.startCreatedDateTime as string);
            dateoldest = new Date(dateoldest.getTime() - 2);
            parentStartDocumentOldest.startCreatedDateTime = JSON.stringify(dateoldest);


            const childEndDocument: ActivationDocument = JSON.parse(JSON.stringify(Values.HTB_ActivationDocument_JustEndDate));
            childEndDocument.potentialParent = false;
            childEndDocument.potentialChild = true;
            childEndDocument.docType=DocType.ACTIVATION_DOCUMENT;

            const senderMarketParticipantMrid: string = childEndDocument.senderMarketParticipantMrid as string;
            const registeredResourceMrid: string = childEndDocument.registeredResourceMrid;

            const queryDate: string = childEndDocument.endCreatedDateTime as string;

            const pcuetmt:number = params.values.get(ParametersType.PC_TIME_UPDATEEND_MATCH_THRESHOLD);

            const datetmp = new Date(queryDate);
            datetmp.setUTCHours(0,0,0,0);
            const dateYesterday = new Date(datetmp.getTime() - pcuetmt);

            var args: string[] = [];
            args.push(`"orderEnd":false`);
            args.push(`"senderMarketParticipantMrid":"${senderMarketParticipantMrid}"`);
            args.push(`"registeredResourceMrid":"${registeredResourceMrid}"`);
            args.push(`"messageType":{"$in":["A54","A98"]}`);
            args.push(`"startCreatedDateTime":{"$gte":${JSON.stringify(dateYesterday)},"$lte":${JSON.stringify(queryDate)}}`);

            // params.logger.info("** Query TEST **");
            const query = await QueryStateService.buildQuery({documentType: DocType.ACTIVATION_DOCUMENT, queryArgs: args});
            // params.logger.info("** Query TEST - END **");

            const iterator = Values.getActivationDocumentQueryMock2Values(parentStartDocumentOldest, parentStartDocument, mockHandler);
            transactionContext.stub.getPrivateDataQueryResult.withArgs(collectionProducer, query).resolves(iterator);

            const queryCrank = `{"selector": {"docType": "${DocType.ACTIVATION_DOCUMENT}","$or":[{"potentialParent": true},{"potentialChild": true}]}}`;
            const iteratorReconciliation = Values.getActivationDocumentQueryMock2Values(parentStartDocument, childEndDocument, mockHandler);
            transactionContext.stub.getPrivateDataQueryResult.withArgs(collectionProducer, queryCrank).resolves(iteratorReconciliation);

            let ret = await star.GetActivationDocumentReconciliationState(transactionContext);
            ret = JSON.parse(ret);
            // params.logger.log('ret=', ret)


            parentStartDocument.orderEnd = true;
            parentStartDocument.subOrderList = [childEndDocument.activationDocumentMrid];

            childEndDocument.potentialChild = false;
            childEndDocument.subOrderList = [parentStartDocument.activationDocumentMrid];
            childEndDocument.docType=DocType.ACTIVATION_DOCUMENT;


            const updateOrders: DataReference[] = [];
            updateOrders.push({docType:DocType.ACTIVATION_DOCUMENT, collection: collectionProducer, data: parentStartDocument});
            updateOrders.push({docType:DocType.ACTIVATION_DOCUMENT, collection: collectionProducer, data: childEndDocument});

            const expected = JSON.parse(JSON.stringify(updateOrders));
            // params.logger.log('expected=', expected)

            expect(ret).to.eql(expected);
        });



        it('should return SUCCESS CreateActivationDocument couple HTA after HTB with MPWC reconciliation', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);

            const params: STARParameters = await ParametersController.getParameterValues(transactionContext);
            const collectionMap: Map<string, string[]> = params.values.get(ParametersType.DATA_TARGET);
            const collectionsTSO: string[] = collectionMap.get(RoleType.Role_TSO) as string[];
            const collectionTSO: string = collectionsTSO[0];
            const collectionsProducer: string[] = collectionMap.get(RoleType.Role_Producer) as string[];
            const collectionProducer: string = collectionsProducer[0];

            transactionContext.stub.getState.withArgs(Values.HTA_systemoperator2.systemOperatorMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_systemoperator2)));
            transactionContext.stub.getState.withArgs(Values.HTA_Producer.producerMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_Producer)));

            const parentDocument: ActivationDocument = JSON.parse(JSON.stringify(Values.HTB_ActivationDocument_HTA_JustStartDate));
            parentDocument.docType=DocType.ACTIVATION_DOCUMENT;
            parentDocument.receiverRole = RoleType.Role_DSO;
            parentDocument.potentialParent= true;
            parentDocument.potentialChild= false;
            parentDocument.orderEnd = true;

            const childDocument_Reconciliation: ActivationDocument = JSON.parse(JSON.stringify(Values.HTA_ActivationDocument_Valid_Doc2));
            childDocument_Reconciliation.docType=DocType.ACTIVATION_DOCUMENT;
            childDocument_Reconciliation.potentialParent= false;
            childDocument_Reconciliation.potentialChild= true;
            childDocument_Reconciliation.orderEnd = false;

            const collectionNamesSite: string[] = await HLFServices.getCollectionsOrDefault(params, ParametersType.DATA_TARGET);
            transactionContext.stub.getPrivateData.withArgs(collectionNamesSite[0],
                childDocument_Reconciliation.registeredResourceMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_site_valid)));


            const queryYellowPage = `{"selector": {"docType": "yellowPages", "originAutomationRegisteredResourceMrid": "${childDocument_Reconciliation.originAutomationRegisteredResourceMrid}"}}`;
            const iteratorYellowPage = Values.getYellowPageQueryMock(Values.HTA_yellowPage,mockHandler);
            transactionContext.stub.getQueryResult.withArgs(queryYellowPage).resolves(iteratorYellowPage);

            const queryCrank = `{"selector": {"docType": "${DocType.ACTIVATION_DOCUMENT}","$or":[{"potentialParent": true},{"potentialChild": true}]}}`;
            const iteratorReconciliationParent = Values.getActivationDocumentQueryMock(parentDocument, mockHandler);
            transactionContext.stub.getPrivateDataQueryResult.withArgs(collectionTSO, queryCrank).resolves(iteratorReconciliationParent);
            const iteratorReconciliationChild = Values.getActivationDocumentQueryMock(childDocument_Reconciliation, mockHandler);
            transactionContext.stub.getPrivateDataQueryResult.withArgs(collectionProducer, queryCrank).resolves(iteratorReconciliationChild);

            let ret = await star.GetActivationDocumentReconciliationState(transactionContext);
            ret = JSON.parse(ret);
            // params.logger.log('ret=', ret)


            parentDocument.orderEnd = true;
            parentDocument.subOrderList = [childDocument_Reconciliation.activationDocumentMrid];

            childDocument_Reconciliation.potentialChild = false;
            childDocument_Reconciliation.subOrderList = [parentDocument.activationDocumentMrid];


            const updateOrders: DataReference[] = [];
            updateOrders.push({docType:DocType.ACTIVATION_DOCUMENT, collection: collectionTSO, data: parentDocument});
            updateOrders.push({docType:DocType.ACTIVATION_DOCUMENT, collection: collectionProducer, data: childDocument_Reconciliation});

            const expected = JSON.parse(JSON.stringify(updateOrders));
            // params.logger.log('expected=', expected)

            expect(ret).to.eql(expected);
        });



        it('should return SUCCESS CreateActivationDocument couple HTA after HTB (2 parents, choice on closest date ) with MPWC reconciliation', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);

            const params: STARParameters = await ParametersController.getParameterValues(transactionContext);
            const collectionMap: Map<string, string[]> = params.values.get(ParametersType.DATA_TARGET);
            const collectionsTSO: string[] = collectionMap.get(RoleType.Role_TSO) as string[];
            const collectionTSO: string = collectionsTSO[0];
            const collectionsProducer: string[] = collectionMap.get(RoleType.Role_Producer) as string[];
            const collectionProducer: string = collectionsProducer[0];

            transactionContext.stub.getState.withArgs(Values.HTA_systemoperator2.systemOperatorMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_systemoperator2)));
            transactionContext.stub.getState.withArgs(Values.HTA_Producer.producerMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_Producer)));

            const parentDocumentOldest: ActivationDocument = JSON.parse(JSON.stringify(Values.HTB_ActivationDocument_HTA_JustStartDate));
            parentDocumentOldest.docType=DocType.ACTIVATION_DOCUMENT;
            parentDocumentOldest.receiverRole=RoleType.Role_DSO;
            parentDocumentOldest.potentialParent= true;
            parentDocumentOldest.potentialChild= false;
            parentDocumentOldest.orderEnd = true;
            var dateoldest = new Date(parentDocumentOldest.startCreatedDateTime as string);
            dateoldest = new Date(dateoldest.getTime() - 2);
            parentDocumentOldest.startCreatedDateTime = dateoldest.toISOString();

            const parentDocument: ActivationDocument = JSON.parse(JSON.stringify(Values.HTB_ActivationDocument_HTA_JustStartDate));
            parentDocument.docType=DocType.ACTIVATION_DOCUMENT;
            parentDocument.receiverRole=RoleType.Role_DSO;
            parentDocument.potentialParent= true;
            parentDocument.potentialChild= false;
            parentDocument.orderEnd = true;

            const childDocument_Reconciliation: ActivationDocument = JSON.parse(JSON.stringify(Values.HTA_ActivationDocument_Valid_Doc2));
            childDocument_Reconciliation.docType=DocType.ACTIVATION_DOCUMENT;
            childDocument_Reconciliation.potentialParent= false;
            childDocument_Reconciliation.potentialChild= true;
            childDocument_Reconciliation.orderEnd = false;

            const collectionNamesSite: string[] = await HLFServices.getCollectionsOrDefault(params, ParametersType.DATA_TARGET);
            transactionContext.stub.getPrivateData.withArgs(collectionNamesSite[0],
                childDocument_Reconciliation.registeredResourceMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_site_valid)));


            const queryYellowPage = `{"selector": {"docType": "yellowPages", "originAutomationRegisteredResourceMrid": "${childDocument_Reconciliation.originAutomationRegisteredResourceMrid}"}}`;
            const iteratorYellowPage = Values.getYellowPageQueryMock(Values.HTA_yellowPage,mockHandler);
            transactionContext.stub.getQueryResult.withArgs(queryYellowPage).resolves(iteratorYellowPage);

            const queryCrank = `{"selector": {"docType": "${DocType.ACTIVATION_DOCUMENT}","$or":[{"potentialParent": true},{"potentialChild": true}]}}`;
            const iteratorReconciliationParents = Values.getActivationDocumentQueryMockArrayValues([parentDocument, parentDocumentOldest], mockHandler);
            transactionContext.stub.getPrivateDataQueryResult.withArgs(collectionTSO, queryCrank).resolves(iteratorReconciliationParents);
            const iteratorReconciliationChilds = Values.getActivationDocumentQueryMockArrayValues([ childDocument_Reconciliation], mockHandler);
            transactionContext.stub.getPrivateDataQueryResult.withArgs(collectionProducer, queryCrank).resolves(iteratorReconciliationChilds);

            let ret = await star.GetActivationDocumentReconciliationState(transactionContext);
            ret = JSON.parse(ret);
            // params.logger.log('ret=', ret)


            parentDocument.orderEnd = true;
            parentDocument.subOrderList = [childDocument_Reconciliation.activationDocumentMrid];

            childDocument_Reconciliation.potentialChild = false;
            childDocument_Reconciliation.subOrderList = [parentDocument.activationDocumentMrid];

            const updateOrders: DataReference[] = [];
            updateOrders.push({docType:DocType.ACTIVATION_DOCUMENT, collection: collectionTSO, data: parentDocument});
            updateOrders.push({docType:DocType.ACTIVATION_DOCUMENT, collection: collectionProducer, data: childDocument_Reconciliation});

            const expected = JSON.parse(JSON.stringify(updateOrders));
            // params.logger.log('expected=', expected)

            expect(ret).to.eql(expected);
        });


    });
////////////////////////////////////////////////////////////////////////////
////////////////////    UPDATE ELIGIBILITY STATUS     //////////////////////
////////////////////////////////////////////////////////////////////////////

    describe('Test Update Activation Document Eligibility Status', () => {
        it('should return ERROR UpdateActivationDocumentEligibilityStatus on unknown collection', async () => {

            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);

            const params: STARParameters = await ParametersController.getParameterValues(transactionContext);
            const collectionMap: Map<string, string[]> = params.values.get(ParametersType.DATA_TARGET);
            const collectionsProducer: string[] = collectionMap.get(RoleType.Role_Producer) as string[];
            const collectionProducer: string = collectionsProducer[0];

            const activationDocument_Producer: ActivationDocument = JSON.parse(JSON.stringify(Values.HTB_ActivationDocument_JustStartDate));
            activationDocument_Producer.docType=DocType.ACTIVATION_DOCUMENT;
            activationDocument_Producer.potentialParent= true;
            activationDocument_Producer.potentialChild= false;


            transactionContext.stub.getState.withArgs(Values.HTB_systemoperator.systemOperatorMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTB_systemoperator)));
            transactionContext.stub.getPrivateData.withArgs(collectionProducer,
                activationDocument_Producer.activationDocumentMrid).resolves(Buffer.from(JSON.stringify(activationDocument_Producer)));

            const updatedStatus_Producer : EligibilityStatus = {
                activationDocumentMrid:activationDocument_Producer.activationDocumentMrid,
                eligibilityStatus:EligibilityStatusType.EligibilityAccepted
            };

            const updateOrders_str = JSON.stringify(updatedStatus_Producer);

            try {
                await star.UpdateActivationDocumentEligibilityStatus(transactionContext, updateOrders_str);
            } catch(err) {
                // params.logger.info(err.message)
                expect(err.message).to.equal(`ERROR cannot find reference to Activation Document ${activationDocument_Producer.activationDocumentMrid} for status Update.`);
            }
        });

        it('should return ERROR UpdateActivationDocumentEligibilityStatus on unknown document', async () => {

            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);

            const params: STARParameters = await ParametersController.getParameterValues(transactionContext);

            const activationDocument_Producer: ActivationDocument = JSON.parse(JSON.stringify(Values.HTB_ActivationDocument_JustStartDate));

            const updatedStatus_Producer : EligibilityStatus = {
                activationDocumentMrid:activationDocument_Producer.activationDocumentMrid,
                eligibilityStatus:EligibilityStatusType.EligibilityAccepted
            };

            const updateOrders_str = JSON.stringify(updatedStatus_Producer);

            try {
                await star.UpdateActivationDocumentEligibilityStatus(transactionContext, updateOrders_str);
            } catch(err) {
                // params.logger.info(err.message)
                expect(err.message).to.equal(`ERROR cannot find reference to Activation Document ${activationDocument_Producer.activationDocumentMrid} for status Update.`);
            }
        });

        it('should return SUCCESS UpdateActivationDocumentEligibilityStatus: TSO Producer Document', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);

            const params: STARParameters = await ParametersController.getParameterValues(transactionContext);
            const collectionMap: Map<string, string[]> = params.values.get(ParametersType.DATA_TARGET);
            const collectionsProducer: string[] = collectionMap.get(RoleType.Role_Producer) as string[];
            const collectionProducer: string = collectionsProducer[0];

            const activationDocument_Producer: ActivationDocument = JSON.parse(JSON.stringify(Values.HTB_ActivationDocument_JustStartDate));
            activationDocument_Producer.docType=DocType.ACTIVATION_DOCUMENT;
            activationDocument_Producer.potentialParent= true;
            activationDocument_Producer.potentialChild= false;


            transactionContext.stub.getState.withArgs(Values.HTB_systemoperator.systemOperatorMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTB_systemoperator)));
            transactionContext.stub.getPrivateData.withArgs(collectionProducer,
                activationDocument_Producer.activationDocumentMrid).resolves(Buffer.from(JSON.stringify(activationDocument_Producer)));

            const updatedStatus_Producer : EligibilityStatus = {
                activationDocumentMrid:activationDocument_Producer.activationDocumentMrid,
                eligibilityStatus:EligibilityStatusType.EligibilityAccepted
            };
            const updateOrders_str = JSON.stringify(updatedStatus_Producer);

            await star.UpdateActivationDocumentEligibilityStatus(transactionContext, updateOrders_str);

            // params.logger.info("-----------")
            // params.logger.info(transactionContext.stub.putPrivateData.firstCall.args);
            // params.logger.info("ooooooooo")
            // params.logger.info(Buffer.from(transactionContext.stub.putPrivateData.firstCall.args[2].toString()).toString('utf8'));
            // params.logger.info(JSON.stringify(activationDocument_garbageProducer))
            // params.logger.info("-----------")

            const expectedValue_Producer = JSON.parse(JSON.stringify(activationDocument_Producer));
            expectedValue_Producer.eligibilityStatus = EligibilityStatusType.EligibilityAccepted;
            expectedValue_Producer.eligibilityStatusEditable = false;

            transactionContext.stub.putPrivateData.firstCall.should.have.been.calledWithExactly(
                collectionProducer,
                activationDocument_Producer.activationDocumentMrid,
                Buffer.from(JSON.stringify(expectedValue_Producer))
            );

            expect(transactionContext.stub.putPrivateData.callCount).to.equal(1);
        });

        it('should return SUCCESS UpdateActivationDocumentEligibilityStatus: DSO Producer Document', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);

            const params: STARParameters = await ParametersController.getParameterValues(transactionContext);
            const collectionMap: Map<string, string[]> = params.values.get(ParametersType.DATA_TARGET);
            const collectionsProducer: string[] = collectionMap.get(RoleType.Role_Producer) as string[];
            const collectionProducer: string = collectionsProducer[0];

            const activationDocument_Producer: ActivationDocument = JSON.parse(JSON.stringify(Values.HTA_ActivationDocument_Valid));
            activationDocument_Producer.docType=DocType.ACTIVATION_DOCUMENT;
            activationDocument_Producer.potentialParent= true;
            activationDocument_Producer.potentialChild= false;


            transactionContext.stub.getState.withArgs(Values.HTA_systemoperator.systemOperatorMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_systemoperator)));
            transactionContext.stub.getPrivateData.withArgs(collectionProducer,
                activationDocument_Producer.activationDocumentMrid).resolves(Buffer.from(JSON.stringify(activationDocument_Producer)));

            const updatedStatus_Producer : EligibilityStatus = {
                activationDocumentMrid:activationDocument_Producer.activationDocumentMrid,
                eligibilityStatus:EligibilityStatusType.EligibilityAccepted
            };
            const updateOrders_str = JSON.stringify(updatedStatus_Producer);

            await star.UpdateActivationDocumentEligibilityStatus(transactionContext, updateOrders_str);

            // params.logger.info("-----------")
            // params.logger.info(transactionContext.stub.putPrivateData.firstCall.args);
            // params.logger.info("ooooooooo")
            // params.logger.info(Buffer.from(transactionContext.stub.putPrivateData.firstCall.args[2].toString()).toString('utf8'));
            // params.logger.info(JSON.stringify(activationDocument_garbageProducer))
            // params.logger.info("-----------")

            const expectedValue_Producer = JSON.parse(JSON.stringify(activationDocument_Producer));
            expectedValue_Producer.eligibilityStatus = EligibilityStatusType.EligibilityAccepted;
            expectedValue_Producer.eligibilityStatusEditable = false;

            transactionContext.stub.putPrivateData.firstCall.should.have.been.calledWithExactly(
                collectionProducer,
                activationDocument_Producer.activationDocumentMrid,
                Buffer.from(JSON.stringify(expectedValue_Producer))
            );

            expect(transactionContext.stub.putPrivateData.callCount).to.equal(1);
        });

        it('should return SUCCESS UpdateActivationDocumentEligibilityStatus : TSO Document', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);

            const params: STARParameters = await ParametersController.getParameterValues(transactionContext);
            const collectionMap: Map<string, string[]> = params.values.get(ParametersType.DATA_TARGET);
            const collectionsDSO: string[] = collectionMap.get(RoleType.Role_DSO) as string[];
            const collectionDSO: string = collectionsDSO[0];


            const activationDocument_TSO: ActivationDocument = JSON.parse(JSON.stringify(Values.HTB_ActivationDocument_HTA_JustStartDate));
            activationDocument_TSO.docType=DocType.ACTIVATION_DOCUMENT;
            activationDocument_TSO.potentialParent= true;
            activationDocument_TSO.potentialChild= false;

            transactionContext.stub.getState.withArgs(Values.HTB_systemoperator.systemOperatorMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTB_systemoperator)));
            transactionContext.stub.getPrivateData.withArgs(collectionDSO,
                activationDocument_TSO.activationDocumentMrid).resolves(Buffer.from(JSON.stringify(activationDocument_TSO)));

            const updatedStatus_TSO : EligibilityStatus = {
                activationDocumentMrid:activationDocument_TSO.activationDocumentMrid,
                eligibilityStatus:EligibilityStatusType.EligibilityRefused
            };

            const updateOrders_str = JSON.stringify(updatedStatus_TSO);

            await star.UpdateActivationDocumentEligibilityStatus(transactionContext, updateOrders_str);

            // params.logger.info("-----------")
            // params.logger.info(transactionContext.stub.putPrivateData.firstCall.args);
            // params.logger.info("ooooooooo")
            // params.logger.info(Buffer.from(transactionContext.stub.putPrivateData.secondCall.args[2].toString()).toString('utf8'));
            // params.logger.info(JSON.stringify(activationDocument_garbageTSO))
            // params.logger.info("-----------")

            const expectedValue_TSO = JSON.parse(JSON.stringify(activationDocument_TSO));
            expectedValue_TSO.eligibilityStatus = EligibilityStatusType.EligibilityRefused;
            expectedValue_TSO.eligibilityStatusEditable = false;

            transactionContext.stub.putPrivateData.firstCall.should.have.been.calledWithExactly(
                collectionDSO,
                activationDocument_TSO.activationDocumentMrid,
                Buffer.from(JSON.stringify(expectedValue_TSO))
            );

            expect(transactionContext.stub.putPrivateData.callCount).to.equal(1);
        });

    });


////////////////////////////////////////////////////////////////////////////
/////////////////////////    UPDATE BY ORDERS     //////////////////////////
////////////////////////////////////////////////////////////////////////////
    describe('Test Update Activation Document by Orders', () => {
        it('should return ERROR UpdateActivationDocumentByOrders on unknown collection', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);

            const params: STARParameters = await ParametersController.getParameterValues(transactionContext);
            const collectionMap: Map<string, string[]> = params.values.get(ParametersType.DATA_TARGET);
            const collectionsProducer: string[] = collectionMap.get(RoleType.Role_Producer) as string[];
            const collectionProducer: string = collectionsProducer[0];

            const activationDocument_Producer: ActivationDocument = JSON.parse(JSON.stringify(Values.HTB_ActivationDocument_JustStartDate));
            activationDocument_Producer.docType=DocType.ACTIVATION_DOCUMENT;
            activationDocument_Producer.potentialParent= true;
            activationDocument_Producer.potentialChild= false;


            transactionContext.stub.getPrivateData.withArgs(collectionProducer,
                activationDocument_Producer.activationDocumentMrid).resolves(Buffer.from(JSON.stringify(activationDocument_Producer)));

            activationDocument_Producer.potentialParent= false;
            activationDocument_Producer.orderEnd = true;
            activationDocument_Producer.subOrderList = ["AAA", "BBB"];

            const updateOrders: DataReference[] = [];
            updateOrders.push({docType:DocType.ACTIVATION_DOCUMENT, collection: "XXX", data: activationDocument_Producer});
            const updateOrders_str = JSON.stringify(updateOrders);

            try {
                await star.UpdateActivationDocumentByOrders(transactionContext, updateOrders_str);
            } catch(err) {
                // params.logger.info(err.message)
                expect(err.message).to.equal(`${DocType.ACTIVATION_DOCUMENT} : ${activationDocument_Producer.activationDocumentMrid} does not exist`);
            }
        });



        it('should return ERROR UpdateActivationDocumentByOrders on authorized changes', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);

            const params: STARParameters = await ParametersController.getParameterValues(transactionContext);
            const collectionMap: Map<string, string[]> = params.values.get(ParametersType.DATA_TARGET);
            const collectionsProducer: string[] = collectionMap.get(RoleType.Role_Producer) as string[];
            const collectionProducer: string = collectionsProducer[0];

            const activationDocument_Producer: ActivationDocument = JSON.parse(JSON.stringify(Values.HTB_ActivationDocument_JustStartDate));

            const updateOrders: DataReference[] = [];
            updateOrders.push({docType:DocType.ACTIVATION_DOCUMENT, collection: collectionProducer, data: activationDocument_Producer});
            const updateOrders_str = JSON.stringify(updateOrders);

            try {
                await star.UpdateActivationDocumentByOrders(transactionContext, updateOrders_str);
            } catch(err) {
                // params.logger.info(err.message)
                expect(err.message).to.equal(`${DocType.ACTIVATION_DOCUMENT} : ${activationDocument_Producer.activationDocumentMrid} does not exist`);
            }
        });



        it('should return ERROR UpdateActivationDocumentByOrders on authorized changes', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);

            const params: STARParameters = await ParametersController.getParameterValues(transactionContext);
            const collectionMap: Map<string, string[]> = params.values.get(ParametersType.DATA_TARGET);
            const collectionsProducer: string[] = collectionMap.get(RoleType.Role_Producer) as string[];
            const collectionProducer: string = collectionsProducer[0];

            const activationDocument_Producer: ActivationDocument = JSON.parse(JSON.stringify(Values.HTB_ActivationDocument_JustStartDate));
            activationDocument_Producer.docType=DocType.ACTIVATION_DOCUMENT;
            activationDocument_Producer.potentialParent= true;
            activationDocument_Producer.potentialChild= false;


            transactionContext.stub.getPrivateData.withArgs(collectionProducer,
                activationDocument_Producer.activationDocumentMrid).resolves(Buffer.from(JSON.stringify(activationDocument_Producer)));

            activationDocument_Producer.businessType = "new businessType";

            const updateOrders: DataReference[] = [];
            updateOrders.push({docType:DocType.ACTIVATION_DOCUMENT, collection: collectionProducer, data: activationDocument_Producer});
            const updateOrders_str = JSON.stringify(updateOrders);

            try {
                await star.UpdateActivationDocumentByOrders(transactionContext, updateOrders_str);
            } catch(err) {
                // params.logger.info(err.message)
                expect(err.message).to.equal(`Error on document ${activationDocument_Producer.activationDocumentMrid} all modified data cannot be updated by orders.`);
            }
        });



        it('should return ERROR UpdateActivationDocumentByOrders on subOrderList', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);

            const params: STARParameters = await ParametersController.getParameterValues(transactionContext);
            const collectionMap: Map<string, string[]> = params.values.get(ParametersType.DATA_TARGET);
            const collectionsProducer: string[] = collectionMap.get(RoleType.Role_Producer) as string[];
            const collectionProducer: string = collectionsProducer[0];

            const activationDocument_Producer: ActivationDocument = JSON.parse(JSON.stringify(Values.HTB_ActivationDocument_JustStartDate));
            activationDocument_Producer.docType=DocType.ACTIVATION_DOCUMENT;
            activationDocument_Producer.potentialParent= true;
            activationDocument_Producer.potentialChild= false;
            activationDocument_Producer.subOrderList = ["CCC"];


            transactionContext.stub.getPrivateData.withArgs(collectionProducer,
                activationDocument_Producer.activationDocumentMrid).resolves(Buffer.from(JSON.stringify(activationDocument_Producer)));

            activationDocument_Producer.potentialParent= false;
            activationDocument_Producer.orderEnd = true;
            activationDocument_Producer.subOrderList = ["AAA", "BBB"];

            const updateOrders: DataReference[] = [];
            updateOrders.push({docType:DocType.ACTIVATION_DOCUMENT, collection: collectionProducer, data: activationDocument_Producer});
            const updateOrders_str = JSON.stringify(updateOrders);

            try {
                await star.UpdateActivationDocumentByOrders(transactionContext, updateOrders_str);
            } catch(err) {
                // params.logger.info(err.message)
                expect(err.message).to.equal(`Error on document ${activationDocument_Producer.activationDocumentMrid} ids can only be added to subOrderList.`);
            }
        });



        it('should return SUCCESS UpdateActivationDocumentByOrders', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);

            const params: STARParameters = await ParametersController.getParameterValues(transactionContext);
            const collectionMap: Map<string, string[]> = params.values.get(ParametersType.DATA_TARGET);
            const collectionsTSO: string[] = collectionMap.get(RoleType.Role_TSO) as string[];
            const collectionTSO: string = collectionsTSO[0];
            const collectionsProducer: string[] = collectionMap.get(RoleType.Role_Producer) as string[];
            const collectionProducer: string = collectionsProducer[0];

            const activationDocument_Producer: ActivationDocument = JSON.parse(JSON.stringify(Values.HTB_ActivationDocument_JustStartDate));
            activationDocument_Producer.docType=DocType.ACTIVATION_DOCUMENT;
            activationDocument_Producer.potentialParent= true;
            activationDocument_Producer.potentialChild= false;

            const activationDocument_TSO: ActivationDocument = JSON.parse(JSON.stringify(Values.HTB_ActivationDocument_HTA_JustStartDate));
            activationDocument_TSO.docType=DocType.ACTIVATION_DOCUMENT;
            activationDocument_TSO.potentialParent= true;
            activationDocument_TSO.potentialChild= false;


            transactionContext.stub.getPrivateData.withArgs(collectionProducer,
                activationDocument_Producer.activationDocumentMrid).resolves(Buffer.from(JSON.stringify(activationDocument_Producer)));
            transactionContext.stub.getPrivateData.withArgs(collectionTSO,
                activationDocument_TSO.activationDocumentMrid).resolves(Buffer.from(JSON.stringify(activationDocument_TSO)));

            activationDocument_Producer.potentialParent= false;
            activationDocument_Producer.orderEnd = true;
            activationDocument_Producer.subOrderList = ["AAA", "BBB"];
            activationDocument_TSO.potentialParent= false;
            activationDocument_TSO.subOrderList = ["111", "222"];

            const updateOrders: DataReference[] = [];
            updateOrders.push({docType:DocType.ACTIVATION_DOCUMENT, collection: collectionProducer, data: activationDocument_Producer});
            updateOrders.push({docType:DocType.ACTIVATION_DOCUMENT, collection: collectionTSO, data: activationDocument_TSO});
            const updateOrders_str = JSON.stringify(updateOrders);

            await star.UpdateActivationDocumentByOrders(transactionContext, updateOrders_str);

            // params.logger.info("-----------")
            // params.logger.info(transactionContext.stub.putPrivateData.firstCall.args);
            // params.logger.info("ooooooooo")
            // params.logger.info(Buffer.from(transactionContext.stub.putPrivateData.firstCall.args[2].toString()).toString('utf8'));
            // params.logger.info(JSON.stringify(activationDocument_garbageProducer))
            // params.logger.info("-----------")
            // params.logger.info(transactionContext.stub.putPrivateData.secondCall.args);
            // params.logger.info("ooooooooo")
            // params.logger.info(Buffer.from(transactionContext.stub.putPrivateData.secondCall.args[2].toString()).toString('utf8'));
            // params.logger.info(JSON.stringify(activationDocument_garbageTSO))
            // params.logger.info("-----------")

            transactionContext.stub.putPrivateData.firstCall.should.have.been.calledWithExactly(
                collectionProducer,
                activationDocument_Producer.activationDocumentMrid,
                Buffer.from(JSON.stringify(activationDocument_Producer))
            );
            transactionContext.stub.putPrivateData.secondCall.should.have.been.calledWithExactly(
                collectionTSO,
                activationDocument_TSO.activationDocumentMrid,
                Buffer.from(JSON.stringify(activationDocument_TSO))
            );

            expect(transactionContext.stub.putPrivateData.callCount).to.equal(2);
        });

    });


});
