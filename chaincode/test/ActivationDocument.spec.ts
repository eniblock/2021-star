'use strict';
const sinon = require('sinon');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinonChai = require('sinon-chai');
const expect = chai.expect;

import { ChaincodeStub, ClientIdentity } from 'fabric-shim';

import { ActivationDocument } from '../src/model/activationDocument/activationDocument';
import { STARParameters } from '../src/model/starParameters';
import { Star } from '../src/star';

import { OrganizationTypeMsp } from '../src/enums/OrganizationMspType';

import { ParametersController } from '../src/controller/ParametersController';
import { CommonService } from '../src/controller/service/CommonService';
import { HLFServices } from '../src/controller/service/HLFservice';
import { QueryStateService } from '../src/controller/service/QueryStateService';
import { DocType } from '../src/enums/DocType';
import { EligibilityStatusType } from '../src/enums/EligibilityStatusType';
import { ParametersType } from '../src/enums/ParametersType';
import { RoleType } from '../src/enums/RoleType';
import { ActivationDocumentCompositeKey } from '../src/model/activationDocument/activationDocumentCompositeKey';
import { EligibilityStatus } from '../src/model/activationDocument/eligibilityStatus';
import { IndexedDataJson } from '../src/model/dataIndexersJson';
import { DataReference } from '../src/model/dataReference';
import { Values } from './Values';
import { ActivationCompositeKeyIndexersController } from '../src/controller/dataIndex/ActivationCompositeKeyIndexersController';
import { ActivationDocumentCompositeKeyAbstract } from '../src/model/dataIndex/activationDocumentCompositeKeyAbstract';
import { ActivationDocumentAbstract } from '../src/model/dataIndex/activationDocumentAbstract';
import { IndexedData } from '../src/model/dataIndex/dataIndexers';
import { SiteActivationIndexersController } from '../src/controller/dataIndex/SiteActivationIndexersController';
import { ActivationDocumentDateMax } from '../src/model/dataIndex/activationDocumentDateMax';
import { FeedbackProducer } from '../src/model/feedbackProducer';
import { FeedbackProducerController } from '../src/controller/FeedbackProducerController';
import { IndeminityStatus } from '../src/enums/IndemnityStatus';
import { ReconciliationStatus } from '../src/enums/ReconciliationStatus';
import { Site } from '../src/model/site';
import { ActivationEnergyAmountIndexersController } from '../src/controller/dataIndex/ActivationEnergyAmountIndexersController';
import { EnergyAmountAbstract } from '../src/model/dataIndex/energyAmountAbstract';
import { EnergyAmount } from '../src/model/energyAmount';

class TestLoggerMgt {
    public getLogger(arg: string): any {
        return console;
    }
}

class TestContext {
    public clientIdentity: any;
    public stub: any;
    public logger: TestLoggerMgt= new TestLoggerMgt();

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
    let mockHandler: any;
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
            await transactionContext.stub.getState('EolienFRvert28EIC');
            await transactionContext.stub.getQueryResult('EolienFRvert28EIC');
        });
    });
////////////////////////////////////////////////////////////////////////////
////////////////////////////////////    couple     ////////////////////////////
////////////////////////////////////////////////////////////////////////////

//     describe('Test CreateActivationDocument couple HTA ENEDIS', () => {
//         // it('should return ERROR on CreateActivationDocument', async () => {
//         //     transactionContext.stub.putPrivateData.rejects('enedis-producer', 'failed inserting key');

//         //     transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);
//         //     try {
//         //         const activationDocument: ActivationDocument = JSON.parse(JSON.stringify(Values.HTA_ActivationDocument_Valid));

//         //         transactionContext.stub.getState.withArgs(Values.HTA_systemoperator.systemOperatorMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_systemoperator)));
//         //         transactionContext.stub.getState.withArgs(Values.HTA_Producer.producerMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_Producer)));

//         //         const params: STARParameters = await ParametersController.getParameterValues(transactionContext);
//         //         const collectionNames: string[] = await HLFServices.getCollectionsOrDefault(params, ParametersType.DATA_TARGET);
//         //         transactionContext.stub.getPrivateData.withArgs(collectionNames[0], Values.HTA_site_valid.meteringPointMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_site_valid)));

//         //         await star.CreateActivationDocument(transactionContext, JSON.stringify(activationDocument));
//         //     } catch(err) {
//         //         // params.logger.info(err.message)
//         //         expect(err.message).to.equal('failed inserting key');
//         //     }
//         // });

//         it('should return ERROR on CreateActivationDocument NON-JSON Value', async () => {
//             transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);
//             try {
//                 await star.CreateActivationDocument(transactionContext, 'XXXXXX');
//             } catch(err) {
//                 // params.logger.info(err.message)
//                 expect(err.message).to.equal('ERROR '.concat(DocType.ACTIVATION_DOCUMENT).concat(' -> Input string NON-JSON value'));
//             }
//         });

//         it('should return ERROR CreateActivationDocument missing originAutomationRegisteredResourceMrid', async () => {
//             transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);

//             transactionContext.stub.getState.withArgs(Values.HTA_systemoperator.systemOperatorMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_systemoperator)));
//             transactionContext.stub.getState.withArgs(Values.HTA_Producer.producerMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_Producer)));

//             const params: STARParameters = await ParametersController.getParameterValues(transactionContext);
//             const collectionNames: string[] = await HLFServices.getCollectionsOrDefault(params, ParametersType.DATA_TARGET);
//             transactionContext.stub.getPrivateData.withArgs(collectionNames[0], Values.HTA_site_valid.meteringPointMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_site_valid)));

//             const ad_str = await Values.deleteJSONField(JSON.stringify(Values.HTA_ActivationDocument_Valid), 'originAutomationRegisteredResourceMrid');

//             try {
//                 await star.CreateActivationDocument(transactionContext, ad_str);
//             } catch(err) {
//                 // params.logger.info(err.message)
//                 expect(err.message).to.equal('originAutomationRegisteredResourceMrid is required');
//             }
//         });

//         it('should return ERROR CreateActivationDocument missing registeredResourceMrid', async () => {
//             transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);

//             let input = JSON.stringify(Values.HTA_ActivationDocument_Valid);
//             input = await Values.deleteJSONField(input, 'registeredResourceMrid');

//             try {
//                 await star.CreateActivationDocument(transactionContext, input);
//             } catch(err) {
//                 // params.logger.info(err.message)
//                 expect(err.message).to.equal('registeredResourceMrid is required');
//             }
//         });

//         it('should return ERROR CreateActivationDocument missing measurementUnitName', async () => {
//             transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);

//             let input = JSON.stringify(Values.HTA_ActivationDocument_Valid);
//             input = await Values.deleteJSONField(input, 'measurementUnitName');

//             try {
//                 await star.CreateActivationDocument(transactionContext, input);
//             } catch(err) {
//                 // params.logger.info(err.message)
//                 expect(err.message).to.equal('measurementUnitName is required');
//             }
//         });

//         it('should return ERROR CreateActivationDocument missing messageType', async () => {
//             transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);

//             let input = JSON.stringify(Values.HTA_ActivationDocument_Valid);
//             input = await Values.deleteJSONField(input, 'messageType');

//             try {
//                 await star.CreateActivationDocument(transactionContext, input);
//             } catch(err) {
//                 // params.logger.info(err.message)
//                 expect(err.message).to.equal('messageType is required');
//             }
//         });

//         it('should return ERROR CreateActivationDocument missing businessType', async () => {
//             transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);

//             let input = JSON.stringify(Values.HTA_ActivationDocument_Valid);
//             input = await Values.deleteJSONField(input, 'businessType');

//             try {
//                 await star.CreateActivationDocument(transactionContext, input);
//             } catch(err) {
//                 // params.logger.info(err.message)
//                 expect(err.message).to.equal('businessType is required');
//             }
//         });

//         // OrderEnd is fulltime calculated, then not required anymore
//         // it('should return ERROR CreateActivationDocument missing orderEnd', async () => {
//         //     transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);

//         //     var input = JSON.stringify(Values.HTA_ActivationDocument_Valid);
//         //     input = await Values.deleteJSONField(input, "orderEnd");

//         //     try {
//         //         await star.CreateActivationDocument(transactionContext, input);
//         //     } catch(err) {
//         //         // params.logger.info(err.message)
//         //         expect(err.message).to.equal('orderEnd is required');
//         //     }
//         // });

//         it('should return ERROR CreateActivationDocument missing senderMarketParticipantMrid', async () => {
//             transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);

//             let input = JSON.stringify(Values.HTA_ActivationDocument_Valid);
//             input = await Values.deleteJSONField(input, 'senderMarketParticipantMrid');

//             try {
//                 await star.CreateActivationDocument(transactionContext, input);
//             } catch(err) {
//                 // params.logger.info(err.message)
//                 expect(err.message).to.equal('senderMarketParticipantMrid is required');
//             }
//         });

//         it('should return ERROR CreateActivationDocument missing receiverMarketParticipantMrid', async () => {
//             transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);

//             let input = JSON.stringify(Values.HTA_ActivationDocument_Valid);
//             input = await Values.deleteJSONField(input, 'receiverMarketParticipantMrid');

//             try {
//                 await star.CreateActivationDocument(transactionContext, input);
//             } catch(err) {
//                 // params.logger.info(err.message)
//                 expect(err.message).to.equal('receiverMarketParticipantMrid is required');
//             }
//         });

//         it('should return ERROR CreateActivationDocument couple HTA wrong MSPID -> FakeMSP', async () => {
//             transactionContext.clientIdentity.getMSPID.returns(Values.FakeMSP);
//             const activationDocument: ActivationDocument = JSON.parse(JSON.stringify(Values.HTA_ActivationDocument_Valid));

//             try {
//                 await star.CreateActivationDocument(transactionContext, JSON.stringify(activationDocument));
//             } catch(err) {
//                 // params.logger.info(err.message)
//                 expect(err.message).to.equal('Organisation, '
//                     .concat(Values.FakeMSP)
//                     .concat(' does not have rights for Activation Document'));
//             }
//         });

//         /* no more test on unit measure 2022-06-02 */
//         // it('should return ERROR CreateActivationDocument couple HTA wrong unit measure', async () => {
//         //     transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);
//         //     const activationDocument:ActivationDocument = JSON.parse(JSON.stringify(Values.HTB_ActivationDocument_Valid));

//         //     try {
//         //         await star.CreateActivationDocument(transactionContext, JSON.stringify(activationDocument));
//         //     } catch(err) {
//         //         params.logger.info(err.message)
//         //         expect(err.message).to.equal('Organisation, enedis does not have rights for MW orders');
//         //     }
//         // });

//         it('should return ERROR CreateActivationDocument couple HTA missing systemoperator', async () => {
//             transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);
//             const activationDocument: ActivationDocument = JSON.parse(JSON.stringify(Values.HTA_ActivationDocument_Valid));
//             // transactionContext.stub.getState.withArgs(Values.HTA_systemoperator.systemOperatorMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_systemoperator)));
//             transactionContext.stub.getState.withArgs(Values.HTA_Producer.producerMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_Producer)));

//             const params: STARParameters = await ParametersController.getParameterValues(transactionContext);
//             const collectionNames: string[] = await HLFServices.getCollectionsOrDefault(params, ParametersType.DATA_TARGET);
//             transactionContext.stub.getPrivateData.withArgs(collectionNames[0], Values.HTA_site_valid.meteringPointMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_site_valid)));

//             try {
//                 await star.CreateActivationDocument(transactionContext, JSON.stringify(activationDocument));
//             } catch(err) {
//                 // params.logger.info(err.message)
//                 expect(err.message).to.equal('systemOperator : '
//                     .concat(Values.HTA_systemoperator.systemOperatorMarketParticipantMrid)
//                     .concat(' does not exist for site creation'));
//             }
//         });

//         it('should return ERROR CreateActivationDocument couple HTA missing producer', async () => {
//             transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);
//             const activationDocument: ActivationDocument = JSON.parse(JSON.stringify(Values.HTA_ActivationDocument_Valid));
//             transactionContext.stub.getState.withArgs(Values.HTA_systemoperator.systemOperatorMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_systemoperator)));
//             // transactionContext.stub.getState.withArgs(Values.HTA_Producer.producerMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_Producer)));

//             const params: STARParameters = await ParametersController.getParameterValues(transactionContext);
//             const collectionNames: string[] = await HLFServices.getCollectionsOrDefault(params, ParametersType.DATA_TARGET);
//             transactionContext.stub.getPrivateData.withArgs(collectionNames[0], Values.HTA_site_valid.meteringPointMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_site_valid)));

//             try {
//                 await star.CreateActivationDocument(transactionContext, JSON.stringify(activationDocument));
//             } catch(err) {
//                 // params.logger.info(err.message)
//                 expect(err.message).to.equal('Producer : '
//                     .concat(Values.HTA_Producer.producerMarketParticipantMrid)
//                     .concat(' does not exist for Activation Document ')
//                     .concat(activationDocument.activationDocumentMrid)
//                     .concat(' creation.'));
//             }
//         });

//         it('should return ERROR CreateActivationDocument couple HTA missing to much optional fields', async () => {
//             transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);
//             const activationDocument: ActivationDocument = JSON.parse(JSON.stringify(Values.HTA_ActivationDocument_Valid));
//             transactionContext.stub.getState.withArgs(Values.HTA_systemoperator.systemOperatorMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_systemoperator)));
//             transactionContext.stub.getState.withArgs(Values.HTA_Producer.producerMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_Producer)));

//             const params: STARParameters = await ParametersController.getParameterValues(transactionContext);
//             const collectionNames: string[] = await HLFServices.getCollectionsOrDefault(params, ParametersType.DATA_TARGET);
//             transactionContext.stub.getPrivateData.withArgs(collectionNames[0], Values.HTA_site_valid.meteringPointMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_site_valid)));

//             let input = JSON.stringify(activationDocument);
//             input = await Values.deleteJSONField(input, 'orderValue');
//             input = await Values.deleteJSONField(input, 'endCreatedDateTime');

//             try {
//                 await star.CreateActivationDocument(transactionContext, input);
//             } catch(err) {
//                 // params.logger.info(err.message)
//                 expect(err.message).to.equal('Order must have a limitation value');
//             }
//         });

//         it('should return ERROR CreateActivationDocument couple HTA incoherency between messageType, businessType and reason code', async () => {
//             transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);
//             const activationDocument: ActivationDocument = JSON.parse(JSON.stringify(Values.HTA_ActivationDocument_Valid));
//             transactionContext.stub.getState.withArgs(Values.HTA_systemoperator.systemOperatorMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_systemoperator)));
//             transactionContext.stub.getState.withArgs(Values.HTA_Producer.producerMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_Producer)));

//             const params: STARParameters = await ParametersController.getParameterValues(transactionContext);
//             const collectionNames: string[] = await HLFServices.getCollectionsOrDefault(params, ParametersType.DATA_TARGET);
//             transactionContext.stub.getPrivateData.withArgs(collectionNames[0], Values.HTA_site_valid.meteringPointMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_site_valid)));

//             activationDocument.reasonCode = '';
//             try {
//                 await star.CreateActivationDocument(transactionContext, JSON.stringify(activationDocument));
//             } catch(err) {
//                 // params.logger.info(err.message)
//                 expect(err.message).to.equal(`Incoherency between messageType, businessType and reason code for Activation Document ${activationDocument.activationDocumentMrid} creation.`);
//             }

//         });

//         it('should return ERROR CreateActivationDocument couple HTA - already exists with Composite key', async () => {
//             transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);
//             const activationDocumentObj: ActivationDocument = JSON.parse(JSON.stringify(Values.HTA_ActivationDocument_Valid));
//             transactionContext.stub.getState.withArgs(Values.HTA_systemoperator.systemOperatorMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_systemoperator)));
//             transactionContext.stub.getState.withArgs(Values.HTA_Producer.producerMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_Producer)));

//             const params: STARParameters = await ParametersController.getParameterValues(transactionContext);
//             const collectionNames: string[] = await HLFServices.getCollectionsOrDefault(params, ParametersType.DATA_TARGET);
//             transactionContext.stub.getPrivateData.withArgs(collectionNames[0], Values.HTA_site_valid.meteringPointMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_site_valid)));

//             const activationDocumentCompositeKeyObj: ActivationDocumentCompositeKey = {
//                 originAutomationRegisteredResourceMrid: activationDocumentObj.originAutomationRegisteredResourceMrid,
//                 registeredResourceMrid: activationDocumentObj.registeredResourceMrid,
//                 startCreatedDateTime: activationDocumentObj.startCreatedDateTime as string,
//                 endCreatedDateTime: activationDocumentObj.endCreatedDateTime as string,
//                 revisionNumber: activationDocumentObj.revisionNumber as string,
//             };

//             const args: string[] = [];
//             args.push(`"originAutomationRegisteredResourceMrid":"${activationDocumentCompositeKeyObj.originAutomationRegisteredResourceMrid}"`);
//             args.push(`"registeredResourceMrid":"${activationDocumentCompositeKeyObj.registeredResourceMrid}"`);
//             args.push(`"startCreatedDateTime":"${activationDocumentCompositeKeyObj.startCreatedDateTime}"`);
//             args.push(`"endCreatedDateTime":"${activationDocumentCompositeKeyObj.endCreatedDateTime}"`);
//             args.push(`"revisionNumber":"${activationDocumentCompositeKeyObj.revisionNumber}"`);

//             const query = await QueryStateService.buildQuery(
//                 {documentType: DocType.ACTIVATION_DOCUMENT,
//                 queryArgs: args});
//             params.logger.info('test query: ', query);

//             const existingActivationDocumentObj: ActivationDocument = JSON.parse(JSON.stringify(activationDocumentObj));
//             existingActivationDocumentObj.activationDocumentMrid = 'existingActivationDocumentObj.activationDocumentMrid';
//             const iterator = Values.getQueryMockArrayValues([existingActivationDocumentObj], mockHandler);
//             transactionContext.stub.getPrivateDataQueryResult.withArgs('enedis-producer', query).resolves(iterator);

//             try {
//                 await star.CreateActivationDocument(transactionContext, JSON.stringify(activationDocumentObj));
//             } catch(err) {
//                 // params.logger.info(err.message)
//                 expect(err.message).to.equal(`Error: An Activation Document with same Composite Key already exists: ${JSON.stringify(activationDocumentCompositeKeyObj)}`);
//             }

//         });

//         it('should return SUCCESS CreateActivationDocument couple HTA', async () => {
//             transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);
//             const activationDocument: ActivationDocument = JSON.parse(JSON.stringify(Values.HTA_ActivationDocument_Valid));
//             transactionContext.stub.getState.withArgs(Values.HTA_systemoperator.systemOperatorMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_systemoperator)));
//             transactionContext.stub.getState.withArgs(Values.HTA_Producer.producerMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_Producer)));

//             const params: STARParameters = await ParametersController.getParameterValues(transactionContext);
//             const collectionNames: string[] = await HLFServices.getCollectionsOrDefault(params, ParametersType.DATA_TARGET);
//             transactionContext.stub.getPrivateData.withArgs(collectionNames[0], Values.HTA_site_valid.meteringPointMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_site_valid)));

//             // const iterator = Values.getYellowPageQueryMock(Values.HTA_yellowPage, mockHandler);
//             // const query = `{"selector": {"docType": "yellowPages", "originAutomationRegisteredResourceMrid": "${activationDocument.originAutomationRegisteredResourceMrid}"}}`;
//             // transactionContext.stub.getQueryResult.withArgs(query).resolves(iterator);

//             await star.CreateActivationDocument(transactionContext, JSON.stringify(activationDocument));

//             const expectedSite : Site = JSON.parse(JSON.stringify(Values.HTA_site_valid));
//             expectedSite.systemOperatorMarketParticipantName = "enedis"
//             expectedSite.producerMarketParticipantName = "EolienFR vert Cie"
//             expectedSite.docType = "site"

//             const expected: ActivationDocument = activationDocument;
//             expected.orderEnd = true;
//             expected.receiverRole = RoleType.Role_Producer;
//             expected.potentialParent = false;
//             expected.potentialChild = true;
//             expected.eligibilityStatus = EligibilityStatusType.EligibilityAccepted;
//             expected.eligibilityStatusEditable = false;
//             expected.reconciliationStatus = ReconciliationStatus.MISS;
//             expected.docType = DocType.ACTIVATION_DOCUMENT;

//             const activationDocumentCompositeKey = ActivationCompositeKeyIndexersController.getActivationDocumentCompositeKeyId(JSON.parse(JSON.stringify(expected)));
//             const compositeKeyIndex: ActivationDocumentCompositeKeyAbstract = {
//                 activationDocumentCompositeKey,
//                 activationDocumentMrid: expected.activationDocumentMrid,
//             };

//             const compositeKeyIndexed:IndexedData = {
//                 docType: DocType.DATA_INDEXER,
//                 indexId:activationDocumentCompositeKey,
//                 indexedDataAbstractMap: new Map()};
//             compositeKeyIndexed.indexedDataAbstractMap.set(activationDocumentCompositeKey, compositeKeyIndex);

//             const compositeKeyIndexedJSON = IndexedDataJson.toJson(compositeKeyIndexed);


//             const indexedDataAbstract: ActivationDocumentAbstract = {
//                 activationDocumentMrid: expected.activationDocumentMrid,
//                 registeredResourceMrid: expected.registeredResourceMrid,
//                 startCreatedDateTime: expected.startCreatedDateTime as string,
//             };

//             const expectedIndexer: IndexedData = {
//                 docType: DocType.DATA_INDEXER,
//                 indexedDataAbstractMap : new Map(),
//                 indexId: SiteActivationIndexersController.getKey(expected.registeredResourceMrid, new Date(expected.startCreatedDateTime as string)),
//             };
//             expectedIndexer.indexedDataAbstractMap?.set(expected.activationDocumentMrid, indexedDataAbstract);
//             const expectedIndexerJSON = IndexedDataJson.toJson(expectedIndexer);

//             const expectedDateMax: ActivationDocumentDateMax = {
//                 dateTime: expected.startCreatedDateTime as string,
//                 docType: DocType.INDEXER_MAX_DATE,
//             };
//             const expectedDateMaxId: string = SiteActivationIndexersController.getMaxKey(expected.registeredResourceMrid);

//             const expectedFeedbackProducer: FeedbackProducer = {
//                 docType: DocType.FEEDBACK_PRODUCER,
//                 feedbackProducerMrid: FeedbackProducerController.getFeedbackProducerMrid(params, expected.activationDocumentMrid),
//                 activationDocumentMrid: expected.activationDocumentMrid,
//                 messageType: "B30",
//                 processType: "A42",
//                 revisionNumber: "0",
//                 indeminityStatus: IndeminityStatus.IN_PROGRESS,
//                 receiverMarketParticipantMrid: expected.receiverMarketParticipantMrid,
//                 senderMarketParticipantMrid: expected.senderMarketParticipantMrid,
//                 createdDateTime: expected.startCreatedDateTime,
//             }

//             // params.logger.info("-----------")
//             // params.logger.info(transactionContext.stub.putPrivateData.getCall(0).args);
//             // params.logger.info("ooooooooo")
//             // params.logger.info(Buffer.from(transactionContext.stub.putPrivateData.getCall(0).args[2].toString()).toString('utf8'));
//             // params.logger.info(JSON.stringify(expectedSite))
//             // params.logger.info("-----------")
//             // params.logger.info(transactionContext.stub.putPrivateData.getCall(1).args);
//             // params.logger.info("ooooooooo")
//             // params.logger.info(Buffer.from(transactionContext.stub.putPrivateData.getCall(1).args[2].toString()).toString('utf8'));
//             // params.logger.info(JSON.stringify(expected))
//             // params.logger.info("-----------")
//             // params.logger.info(transactionContext.stub.putPrivateData.getCall(2).args);
//             // params.logger.info("ooooooooo")
//             // params.logger.info(Buffer.from(transactionContext.stub.putPrivateData.getCall(2).args[2].toString()).toString('utf8'));
//             // params.logger.info(JSON.stringify(compositeKeyIndexedJSON))
//             // params.logger.info("-----------")
//             // params.logger.info(transactionContext.stub.putPrivateData.getCall(3).args);
//             // params.logger.info("ooooooooo")
//             // params.logger.info(Buffer.from(transactionContext.stub.putPrivateData.getCall(3).args[2].toString()).toString('utf8'));
//             // params.logger.info("oo")
//             // params.logger.info(JSON.stringify(expectedIndexerJSON))
//             // params.logger.info("-----------")
//             // params.logger.info(transactionContext.stub.putPrivateData.getCall(4).args);
//             // params.logger.info("ooooooooo")
//             // params.logger.info(Buffer.from(transactionContext.stub.putPrivateData.getCall(4).args[2].toString()).toString('utf8'));
//             // params.logger.info("oo")
//             // params.logger.info(JSON.stringify(expectedDateMax))
//             // params.logger.info("-----------")
//             // params.logger.info(transactionContext.stub.putPrivateData.getCall(5).args);
//             // params.logger.info("ooooooooo")
//             // params.logger.info(Buffer.from(transactionContext.stub.putPrivateData.getCall(5).args[2].toString()).toString('utf8'));
//             // params.logger.info("oo")
//             // params.logger.info(JSON.stringify(expectedFeedbackProducer))
//             // params.logger.info("-----------")

//             transactionContext.stub.putPrivateData.getCall(0).should.have.been.calledWithExactly(
//                 'enedis-producer-rte',
//                 expectedSite.meteringPointMrid,
//                 Buffer.from(JSON.stringify(expectedSite)),
//             );

//             transactionContext.stub.putPrivateData.getCall(1).should.have.been.calledWithExactly(
//                 'enedis-producer-rte',
//                 expected.activationDocumentMrid,
//                 Buffer.from(JSON.stringify(expected)),
//             );

//             transactionContext.stub.putPrivateData.getCall(2).should.have.been.calledWithExactly(
//                 'enedis-producer-rte',
//                 compositeKeyIndexedJSON.indexId,
//                 Buffer.from(JSON.stringify(compositeKeyIndexedJSON)),
//             );

//             transactionContext.stub.putPrivateData.getCall(3).should.have.been.calledWithExactly(
//                 'enedis-producer-rte',
//                 expectedIndexerJSON.indexId,
//                 Buffer.from(JSON.stringify(expectedIndexerJSON)),
//             );

//             transactionContext.stub.putPrivateData.getCall(4).should.have.been.calledWithExactly(
//                 'enedis-producer-rte',
//                 expectedDateMaxId,
//                 Buffer.from(JSON.stringify(expectedDateMax)),
//             );

//             transactionContext.stub.putPrivateData.getCall(5).should.have.been.calledWithExactly(
//                 'enedis-producer-rte',
//                 expectedFeedbackProducer.feedbackProducerMrid,
//                 Buffer.from(JSON.stringify(expectedFeedbackProducer)),
//             );

//             expect(transactionContext.stub.putPrivateData.callCount).to.equal(6);
//         });

//         it('should return SUCCESS CreateActivationDocumentListe 2 docs HTA', async () => {
//             transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);
//             const activationDocument: ActivationDocument = JSON.parse(JSON.stringify(Values.HTA_ActivationDocument_Valid));
//             const activationDocument2: ActivationDocument = JSON.parse(JSON.stringify(Values.HTA_ActivationDocument_Valid_Doc2));

//             transactionContext.stub.getState.withArgs(activationDocument.senderMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_systemoperator)));
//             transactionContext.stub.getState.withArgs(activationDocument.receiverMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_Producer)));
//             transactionContext.stub.getState.withArgs(activationDocument2.senderMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_systemoperator)));
//             transactionContext.stub.getState.withArgs(activationDocument2.receiverMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_Producer)));

//             const params: STARParameters = await ParametersController.getParameterValues(transactionContext);
//             const collectionNames: string[] = await HLFServices.getCollectionsOrDefault(params, ParametersType.DATA_TARGET);
//             transactionContext.stub.getPrivateData.withArgs(collectionNames[0], activationDocument.registeredResourceMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_site_valid)));
//             transactionContext.stub.getPrivateData.withArgs(collectionNames[0], activationDocument2.registeredResourceMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_site_valid_ProdA)));

//             // const iterator = Values.getYellowPageQueryMock(Values.HTA_yellowPage, mockHandler);
//             // const query = `{"selector": {"docType": "yellowPages", "originAutomationRegisteredResourceMrid": "${activationDocument.originAutomationRegisteredResourceMrid}"}}`;
//             // transactionContext.stub.getQueryResult.withArgs(query).resolves(iterator);

//             const listActivationDocuments = [activationDocument, activationDocument2];
//             await star.CreateActivationDocumentList(transactionContext, JSON.stringify(listActivationDocuments));

//             const expectedSite : Site = JSON.parse(JSON.stringify(Values.HTA_site_valid));
//             expectedSite.systemOperatorMarketParticipantName = "enedis"
//             expectedSite.producerMarketParticipantName = "EolienFR vert Cie"
//             expectedSite.docType = "site"

//             const expected: ActivationDocument = activationDocument;
//             expected.orderEnd = true;
//             expected.receiverRole = RoleType.Role_Producer;
//             expected.potentialParent = false;
//             expected.potentialChild = true;
//             expected.eligibilityStatus = EligibilityStatusType.EligibilityAccepted;
//             expected.eligibilityStatusEditable = false;
//             expected.reconciliationStatus = ReconciliationStatus.MISS;
//             expected.docType = DocType.ACTIVATION_DOCUMENT;
//             const expected2: ActivationDocument = activationDocument2;
//             expected2.orderEnd = true;
//             expected2.receiverRole = RoleType.Role_Producer;
//             expected2.potentialParent = false;
//             expected2.potentialChild = true;
//             expected2.eligibilityStatus = '';
//             expected2.docType = DocType.ACTIVATION_DOCUMENT;

//             const activationDocumentCompositeKey1 = ActivationCompositeKeyIndexersController.getActivationDocumentCompositeKeyId(JSON.parse(JSON.stringify(expected)));
//             const activationDocumentCompositeKey2 = ActivationCompositeKeyIndexersController.getActivationDocumentCompositeKeyId(JSON.parse(JSON.stringify(expected2)));

//             const compositeKeyIndex1: ActivationDocumentCompositeKeyAbstract = {
//                 activationDocumentCompositeKey: activationDocumentCompositeKey1,
//                 activationDocumentMrid: expected.activationDocumentMrid,
//             };
//             const compositeKeyIndex2: ActivationDocumentCompositeKeyAbstract = {
//                 activationDocumentCompositeKey: activationDocumentCompositeKey2,
//                 activationDocumentMrid: expected2.activationDocumentMrid,
//             };

//             const compositeKeyIndexed1:IndexedData = {
//                 docType: DocType.DATA_INDEXER,
//                 indexId:activationDocumentCompositeKey1,
//                 indexedDataAbstractMap: new Map()};
//             compositeKeyIndexed1.indexedDataAbstractMap.set(activationDocumentCompositeKey1, compositeKeyIndex1);

//             const compositeKeyIndexed2:IndexedData = {
//                 docType: DocType.DATA_INDEXER,
//                 indexId:activationDocumentCompositeKey2,
//                 indexedDataAbstractMap: new Map()};
//             compositeKeyIndexed2.indexedDataAbstractMap.set(activationDocumentCompositeKey2, compositeKeyIndex2);

//             const compositeKeyIndexed1JSON = IndexedDataJson.toJson(compositeKeyIndexed1);
//             const compositeKeyIndexed2JSON = IndexedDataJson.toJson(compositeKeyIndexed2);

//             const indexedDataAbstract1: ActivationDocumentAbstract = {
//                 activationDocumentMrid: expected.activationDocumentMrid,
//                 registeredResourceMrid: expected.registeredResourceMrid,
//                 startCreatedDateTime: expected.startCreatedDateTime as string,
//             };

//             const expectedIndexer1: IndexedData = {
//                 docType: DocType.DATA_INDEXER,
//                 indexedDataAbstractMap : new Map(),
//                 indexId: SiteActivationIndexersController.getKey(expected.registeredResourceMrid, new Date(expected.startCreatedDateTime as string)),
//             };
//             expectedIndexer1.indexedDataAbstractMap?.set(expected.activationDocumentMrid, indexedDataAbstract1);
//             const expectedIndexer1JSON = IndexedDataJson.toJson(expectedIndexer1);

//             const expectedDateMax1: ActivationDocumentDateMax = {
//                 dateTime: expected.startCreatedDateTime as string,
//                 docType: DocType.INDEXER_MAX_DATE,
//             };
//             const expectedDateMaxId1: string = SiteActivationIndexersController.getMaxKey(expected.registeredResourceMrid);

//             const indexedDataAbstract2: ActivationDocumentAbstract = {
//                 activationDocumentMrid: expected2.activationDocumentMrid,
//                 registeredResourceMrid: expected2.registeredResourceMrid,
//                 startCreatedDateTime: expected2.startCreatedDateTime as string,
//             };

//             const expectedIndexer2: IndexedData = {
//                 docType: DocType.DATA_INDEXER,
//                 indexedDataAbstractMap : new Map(),
//                 indexId: SiteActivationIndexersController.getKey(expected2.registeredResourceMrid, new Date(expected2.startCreatedDateTime as string)),
//             };
//             expectedIndexer2.indexedDataAbstractMap.set(expected2.activationDocumentMrid, indexedDataAbstract2);
//             const expectedIndexer2JSON = IndexedDataJson.toJson(expectedIndexer2);

//             const expectedDateMax2: ActivationDocumentDateMax = {
//                 dateTime: expected2.startCreatedDateTime as string,
//                 docType: DocType.INDEXER_MAX_DATE,
//             };
//             const expectedDateMaxId2: string = SiteActivationIndexersController.getMaxKey(expected2.registeredResourceMrid);

//             const expectedFeedbackProducer: FeedbackProducer = {
//                 docType: DocType.FEEDBACK_PRODUCER,
//                 feedbackProducerMrid: FeedbackProducerController.getFeedbackProducerMrid(params, expected.activationDocumentMrid),
//                 activationDocumentMrid: expected.activationDocumentMrid,
//                 messageType: "B30",
//                 processType: "A42",
//                 revisionNumber: "0",
//                 indeminityStatus: IndeminityStatus.IN_PROGRESS,
//                 receiverMarketParticipantMrid: expected.receiverMarketParticipantMrid,
//                 senderMarketParticipantMrid: expected.senderMarketParticipantMrid,
//                 createdDateTime: expected.startCreatedDateTime,
//             }

//             const expectedFeedbackProducer2: FeedbackProducer = {
//                 docType: DocType.FEEDBACK_PRODUCER,
//                 feedbackProducerMrid: FeedbackProducerController.getFeedbackProducerMrid(params, expected2.activationDocumentMrid),
//                 activationDocumentMrid: expected2.activationDocumentMrid,
//                 messageType: "B30",
//                 processType: "A42",
//                 revisionNumber: "0",
//                 indeminityStatus: IndeminityStatus.IN_PROGRESS,
//                 receiverMarketParticipantMrid: expected2.receiverMarketParticipantMrid,
//                 senderMarketParticipantMrid: expected2.senderMarketParticipantMrid,
//                 createdDateTime: expected2.startCreatedDateTime,
//             }

//             // params.logger.info("-----------")
//             // params.logger.info(transactionContext.stub.putPrivateData.getCall(0).args);
//             // params.logger.info("ooooooooo")
//             // params.logger.info(Buffer.from(transactionContext.stub.putPrivateData.getCall(0).args[2].toString()).toString('utf8'));
//             // params.logger.info(JSON.stringify(expectedSite))
//             // params.logger.info("-----------")
//             // params.logger.info(transactionContext.stub.putPrivateData.getCall(1).args);
//             // params.logger.info("ooooooooo")
//             // params.logger.info(Buffer.from(transactionContext.stub.putPrivateData.getCall(1).args[2].toString()).toString('utf8'));
//             // params.logger.info(JSON.stringify(expected))
//             // params.logger.info("-----------")
//             // params.logger.info(transactionContext.stub.putPrivateData.getCall(2).args);
//             // params.logger.info("ooooooooo")
//             // params.logger.info(Buffer.from(transactionContext.stub.putPrivateData.getCall(2).args[2].toString()).toString('utf8'));
//             // params.logger.info(JSON.stringify(compositeKeyIndexed1JSON))
//             // params.logger.info("-----------")
//             // params.logger.info(transactionContext.stub.putPrivateData.getCall(3).args);
//             // params.logger.info("ooooooooo")
//             // params.logger.info(Buffer.from(transactionContext.stub.putPrivateData.getCall(3).args[2].toString()).toString('utf8'));
//             // params.logger.info("oo")
//             // params.logger.info(JSON.stringify(expectedIndexer1JSON))
//             // params.logger.info("-----------")
//             // params.logger.info(transactionContext.stub.putPrivateData.getCall(4).args);
//             // params.logger.info("ooooooooo")
//             // params.logger.info(Buffer.from(transactionContext.stub.putPrivateData.getCall(4).args[2].toString()).toString('utf8'));
//             // params.logger.info(JSON.stringify(expectedDateMax1))
//             // params.logger.info("-----------")
//             // params.logger.info(transactionContext.stub.putPrivateData.getCall(5).args);
//             // params.logger.info("ooooooooo")
//             // params.logger.info(Buffer.from(transactionContext.stub.putPrivateData.getCall(5).args[2].toString()).toString('utf8'));
//             // params.logger.info(JSON.stringify(expectedFeedbackProducer))
//             // params.logger.info("-----------")

//             // params.logger.info(transactionContext.stub.putPrivateData.getCall(6).args);
//             // params.logger.info("ooooooooo")
//             // params.logger.info(Buffer.from(transactionContext.stub.putPrivateData.getCall(6).args[2].toString()).toString('utf8'));
//             // params.logger.info(JSON.stringify(expected2))
//             // params.logger.info("-----------")
//             // params.logger.info(transactionContext.stub.putPrivateData.getCall(7).args);
//             // params.logger.info("ooooooooo")
//             // params.logger.info(Buffer.from(transactionContext.stub.putPrivateData.getCall(7).args[2].toString()).toString('utf8'));
//             // params.logger.info("oo")
//             // params.logger.info(JSON.stringify(compositeKeyIndexed2JSON))
//             // params.logger.info("-----------")
//             // params.logger.info(transactionContext.stub.putPrivateData.getCall(8).args);
//             // params.logger.info("ooooooooo")
//             // params.logger.info(Buffer.from(transactionContext.stub.putPrivateData.getCall(8).args[2].toString()).toString('utf8'));
//             // params.logger.info(JSON.stringify(expectedIndexer2JSON))
//             // params.logger.info("-----------")
//             // params.logger.info(transactionContext.stub.putPrivateData.getCall(9).args);
//             // params.logger.info("ooooooooo")
//             // params.logger.info(Buffer.from(transactionContext.stub.putPrivateData.getCall(9).args[2].toString()).toString('utf8'));
//             // params.logger.info("oo")
//             // params.logger.info(JSON.stringify(expectedDateMax2))
//             // params.logger.info("-----------")
//             // params.logger.info(transactionContext.stub.putPrivateData.getCall(10).args);
//             // params.logger.info("ooooooooo")
//             // params.logger.info(Buffer.from(transactionContext.stub.putPrivateData.getCall(10).args[2].toString()).toString('utf8'));
//             // params.logger.info(JSON.stringify(expectedFeedbackProducer2))
//             // params.logger.info("-----------")

//             transactionContext.stub.putPrivateData.getCall(0).should.have.been.calledWithExactly(
//                 'enedis-producer-rte',
//                 expectedSite.meteringPointMrid,
//                 Buffer.from(JSON.stringify(expectedSite)),
//             );

//             transactionContext.stub.putPrivateData.getCall(1).should.have.been.calledWithExactly(
//                 'enedis-producer-rte',
//                 expected.activationDocumentMrid,
//                 Buffer.from(JSON.stringify(expected)),
//             );

//             transactionContext.stub.putPrivateData.getCall(2).should.have.been.calledWithExactly(
//                 'enedis-producer-rte',
//                 compositeKeyIndexed1JSON.indexId,
//                 Buffer.from(JSON.stringify(compositeKeyIndexed1JSON)),
//             );

//             transactionContext.stub.putPrivateData.getCall(3).should.have.been.calledWithExactly(
//                 'enedis-producer-rte',
//                 expectedIndexer1JSON.indexId,
//                 Buffer.from(JSON.stringify(expectedIndexer1JSON)),
//             );

//             transactionContext.stub.putPrivateData.getCall(4).should.have.been.calledWithExactly(
//                 'enedis-producer-rte',
//                 expectedDateMaxId1,
//                 Buffer.from(JSON.stringify(expectedDateMax1)),
//             );

//             transactionContext.stub.putPrivateData.getCall(5).should.have.been.calledWithExactly(
//                 'enedis-producer-rte',
//                 expectedFeedbackProducer.feedbackProducerMrid,
//                 Buffer.from(JSON.stringify(expectedFeedbackProducer)),
//             );



//             transactionContext.stub.putPrivateData.getCall(6).should.have.been.calledWithExactly(
//                 'enedis-producer',
//                 expected2.activationDocumentMrid,
//                 Buffer.from(JSON.stringify(expected2)),
//             );

//             transactionContext.stub.putPrivateData.getCall(7).should.have.been.calledWithExactly(
//                 'enedis-producer',
//                 compositeKeyIndexed2JSON.indexId,
//                 Buffer.from(JSON.stringify(compositeKeyIndexed2JSON)),
//             );

//             transactionContext.stub.putPrivateData.getCall(8).should.have.been.calledWithExactly(
//                 'enedis-producer',
//                 expectedIndexer2JSON.indexId,
//                 Buffer.from(JSON.stringify(expectedIndexer2JSON)),
//             );

//             transactionContext.stub.putPrivateData.getCall(9).should.have.been.calledWithExactly(
//                 'enedis-producer',
//                 expectedDateMaxId2,
//                 Buffer.from(JSON.stringify(expectedDateMax2)),
//             );

//             transactionContext.stub.putPrivateData.getCall(10).should.have.been.calledWithExactly(
//                 'enedis-producer',
//                 expectedFeedbackProducer2.feedbackProducerMrid,
//                 Buffer.from(JSON.stringify(expectedFeedbackProducer2)),
//             );

//             expect(transactionContext.stub.putPrivateData.callCount).to.equal(11);

//         });

//     });
// ////////////////////////////////////////////////////////////////////////////
// ////////////////////////////////////    BEGIN     ////////////////////////////
// ////////////////////////////////////////////////////////////////////////////
//     describe('Test CreateActivationDocument Début HTB RTE', () => {
//         it('should return ERROR on CreateActivationDocument NON-JSON Value', async () => {
//             transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);
//             try {
//                 await star.CreateActivationDocument(transactionContext, 'XXXXXX');
//             } catch(err) {
//                 // params.logger.info(err.message)
//                 expect(err.message).to.equal('ERROR '.concat(DocType.ACTIVATION_DOCUMENT).concat(' -> Input string NON-JSON value'));
//             }
//         });

//         it('should return ERROR CreateActivationDocument wrong JSON', async () => {
//             transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);

//             let input = JSON.stringify(Values.HTB_ActivationDocument_JustStartDate);
//             input = await Values.deleteJSONField(input, 'activationDocumentMrid');
//             input = await Values.deleteJSONField(input, 'businessType');
//             input = await Values.deleteJSONField(input, 'measurementUnitName');
//             input = await Values.deleteJSONField(input, 'messageType');
//             input = await Values.deleteJSONField(input, 'orderEnd');
//             input = await Values.deleteJSONField(input, 'originAutomationRegisteredResourceMrid');
//             input = await Values.deleteJSONField(input, 'registeredResourceMrid');

//         // OrderEnd is fulltime calculated, then not required anymore
//             const errors = [
//                 'activationDocumentMrid is a compulsory string',
//                 'businessType is required',
//                 'measurementUnitName is required',
//                 'messageType is required',
//                 // 'orderEnd is required',
//                 'originAutomationRegisteredResourceMrid is required',
//                 'registeredResourceMrid is required',
//               ];

//             try {
//                 await star.CreateActivationDocument(transactionContext, input);
//             } catch(err) {
//                 // params.logger.info(err)
//                 expect(err.errors[0]).to.equal(errors[0]);
//                 expect(err.errors[1]).to.equal(errors[1]);
//                 expect(err.errors[2]).to.equal(errors[2]);
//                 expect(err.errors[3]).to.equal(errors[3]);
//                 expect(err.errors[4]).to.equal(errors[4]);
//                 expect(err.errors[5]).to.equal(errors[5]);
//                 expect(err.errors[6]).to.equal(errors[6]);
//                 // expect(err.errors[7]).to.equal(errors[7]);
//                 expect(err.message).to.equal('6 errors occurred');
//             }
//         });

//         it('should return ERROR CreateActivationDocument missing activationDocumentMrid', async () => {
//             transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);

//             let input = JSON.stringify(Values.HTB_ActivationDocument_JustStartDate);
//             input = await Values.deleteJSONField(input, 'activationDocumentMrid');

//             try {
//                 await star.CreateActivationDocument(transactionContext, input);
//             } catch(err) {
//                 // params.logger.info(err.message)
//                 expect(err.message).to.equal('activationDocumentMrid is a compulsory string');
//             }
//         });

//         it('should return ERROR CreateActivationDocument couple HTA wrong MSPID -> RTE', async () => {
//             transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);
//             const activationDocument: ActivationDocument = JSON.parse(JSON.stringify(Values.HTA_ActivationDocument_Valid_ForRTETest));
//             transactionContext.stub.getState.withArgs(Values.HTA_systemoperator.systemOperatorMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_systemoperator)));
//             transactionContext.stub.getState.withArgs(Values.HTA_Producer.producerMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_Producer)));

//             const params: STARParameters = await ParametersController.getParameterValues(transactionContext);
//             const collectionNames: string[] = await HLFServices.getCollectionsOrDefault(params, ParametersType.DATA_TARGET);
//             transactionContext.stub.getPrivateData.withArgs(collectionNames[0], Values.HTA_site_valid.meteringPointMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_site_valid)));

//             try {
//                 await star.CreateActivationDocument(transactionContext, JSON.stringify(activationDocument));
//             } catch(err) {
//                 // params.logger.info(err.message)
//                 expect(err.message).to.equal(`Organisation, ${OrganizationTypeMsp.RTE} cannot do action for Activation Document for sender ${OrganizationTypeMsp.ENEDIS}`);
//             }
//         });

//         it('should return ERROR CreateActivationDocument begin HTB site doesn\'t exist', async () => {
//             transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);
//             const activationDocument: ActivationDocument = JSON.parse(JSON.stringify(Values.HTB_ActivationDocument_JustStartDate));
//             transactionContext.stub.getState.withArgs(Values.HTB_systemoperator.systemOperatorMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTB_systemoperator)));
//             transactionContext.stub.getState.withArgs(Values.HTB_Producer.producerMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTB_Producer)));

//             // const params: STARParameters = await ParametersController.getParameterValues(transactionContext);
//             // const collectionNames: string[] = await HLFServices.getCollectionsOrDefault(params, ParametersType.DATA_TARGET);
//             // transactionContext.stub.getPrivateData.withArgs(collectionNames[0], Values.HTB_site_valid.meteringPointMrid).resolves(Buffer.from(JSON.stringify(Values.HTB_site_valid)));

//             try {
//                 await star.CreateActivationDocument(transactionContext, JSON.stringify(activationDocument));
//             } catch(err) {
//                 // params.logger.info(err.message)
//                 expect(err.message).to.equal(DocType.SITE.concat(' : ')
//                     .concat(Values.HTB_site_valid.meteringPointMrid)
//                     .concat(' does not exist (not found in any collection). for Activation Document ')
//                     .concat(activationDocument.activationDocumentMrid)
//                     .concat(' creation.'));
//             }
//         });

//         it('should return ERROR CreateActivationDocument begin HTB producer doesn\'t exist', async () => {
//             transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);
//             const activationDocument: ActivationDocument = JSON.parse(JSON.stringify(Values.HTB_ActivationDocument_JustStartDate));
//             transactionContext.stub.getState.withArgs(Values.HTB_systemoperator.systemOperatorMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTB_systemoperator)));
//             // transactionContext.stub.getState.withArgs(Values.HTB_Producer.producerMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTB_Producer)));

//             // const params: STARParameters = await ParametersController.getParameterValues(transactionContext);
//             // const collectionNames: string[] = await HLFServices.getCollectionsOrDefault(params, ParametersType.DATA_TARGET);
//             // transactionContext.stub.getPrivateData.withArgs(collectionNames[0], Values.HTB_site_valid.meteringPointMrid).resolves(Buffer.from(JSON.stringify(Values.HTB_site_valid)));

//             try {
//                 await star.CreateActivationDocument(transactionContext, JSON.stringify(activationDocument));
//             } catch(err) {
//                 // params.logger.info(err.message)
//                 expect(err.message).to.equal('Producer : '
//                     .concat(Values.HTB_Producer.producerMarketParticipantMrid)
//                     .concat(' does not exist for Activation Document ')
//                     .concat(activationDocument.activationDocumentMrid)
//                     .concat(' creation.'));
//             }
//         });

//         it('should return SUCCESS CreateActivationDocument Begining order HTB RTE', async () => {
//             transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);
//             const activationDocument: ActivationDocument = JSON.parse(JSON.stringify(Values.HTB_ActivationDocument_JustStartDate));
//             transactionContext.stub.getState.withArgs(Values.HTB_systemoperator.systemOperatorMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTB_systemoperator)));
//             transactionContext.stub.getState.withArgs(Values.HTB_Producer.producerMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTB_Producer)));

//             const params: STARParameters = await ParametersController.getParameterValues(transactionContext);
//             const collectionNames: string[] = await HLFServices.getCollectionsOrDefault(params, ParametersType.DATA_TARGET);
//             transactionContext.stub.getPrivateData.withArgs(collectionNames[0], Values.HTB_site_valid.meteringPointMrid).resolves(Buffer.from(JSON.stringify(Values.HTB_site_valid)));

//             await star.CreateActivationDocument(transactionContext, JSON.stringify(activationDocument));

//             const expected: ActivationDocument = activationDocument;
//             expected.orderEnd = false;
//             expected.receiverRole = RoleType.Role_Producer;
//             expected.potentialParent = true;
//             expected.potentialChild = false;
//             expected.eligibilityStatus = '';
//             expected.docType = DocType.ACTIVATION_DOCUMENT;

//             const activationDocumentCompositeKey = ActivationCompositeKeyIndexersController.getActivationDocumentCompositeKeyId(JSON.parse(JSON.stringify(expected)));
//             const compositeKeyIndex: ActivationDocumentCompositeKeyAbstract = {
//                 activationDocumentCompositeKey,
//                 activationDocumentMrid: expected.activationDocumentMrid,
//             };

//             const compositeKeyIndexed:IndexedData = {
//                 docType: DocType.DATA_INDEXER,
//                 indexId:activationDocumentCompositeKey,
//                 indexedDataAbstractMap: new Map()};
//             compositeKeyIndexed.indexedDataAbstractMap.set(activationDocumentCompositeKey, compositeKeyIndex);

//             const compositeKeyIndexedJSON = IndexedDataJson.toJson(compositeKeyIndexed);


//             const indexedDataAbstract: ActivationDocumentAbstract = {
//                 activationDocumentMrid: expected.activationDocumentMrid,
//                 registeredResourceMrid: expected.registeredResourceMrid,
//                 startCreatedDateTime: expected.startCreatedDateTime as string,
//             };

//             const expectedIndexer: IndexedData = {
//                 docType: DocType.DATA_INDEXER,
//                 indexedDataAbstractMap : new Map(),
//                 indexId: SiteActivationIndexersController.getKey(expected.registeredResourceMrid, new Date(expected.startCreatedDateTime as string)),
//             };
//             expectedIndexer.indexedDataAbstractMap?.set(expected.activationDocumentMrid, indexedDataAbstract);
//             const expectedIndexerJSON = IndexedDataJson.toJson(expectedIndexer);

//             const expectedDateMax: ActivationDocumentDateMax = {
//                 dateTime: expected.startCreatedDateTime as string,
//                 docType: DocType.INDEXER_MAX_DATE,
//             };
//             const expectedDateMaxId: string = SiteActivationIndexersController.getMaxKey(expected.registeredResourceMrid);

//             const expectedFeedbackProducer: FeedbackProducer = {
//                 docType: DocType.FEEDBACK_PRODUCER,
//                 feedbackProducerMrid: FeedbackProducerController.getFeedbackProducerMrid(params, Values.HTB_ActivationDocument_JustStartDate.activationDocumentMrid),
//                 activationDocumentMrid: Values.HTB_ActivationDocument_JustStartDate.activationDocumentMrid,
//                 messageType: "B30",
//                 processType: "A42",
//                 revisionNumber: "0",
//                 indeminityStatus: IndeminityStatus.IN_PROGRESS,
//                 receiverMarketParticipantMrid: Values.HTB_ActivationDocument_JustStartDate.receiverMarketParticipantMrid,
//                 senderMarketParticipantMrid: Values.HTB_ActivationDocument_JustStartDate.senderMarketParticipantMrid,
//                 createdDateTime: Values.HTB_ActivationDocument_JustStartDate.startCreatedDateTime,
//             }


//             // params.logger.info("-----------")
//             // params.logger.info(transactionContext.stub.putPrivateData.getCall(0).args);
//             // params.logger.info("ooooooooo")
//             // params.logger.info(Buffer.from(transactionContext.stub.putPrivateData.getCall(0).args[2].toString()).toString('utf8'));
//             // params.logger.info(JSON.stringify(expected))
//             // params.logger.info("-----------")
//             // params.logger.info(transactionContext.stub.putPrivateData.getCall(1).args);
//             // params.logger.info("ooooooooo")
//             // params.logger.info(Buffer.from(transactionContext.stub.putPrivateData.getCall(1).args[2].toString()).toString('utf8'));
//             // params.logger.info(JSON.stringify(compositeKeyIndexedJSON))
//             // params.logger.info("-----------")
//             // params.logger.info(transactionContext.stub.putPrivateData.getCall(2).args);
//             // params.logger.info("ooooooooo")
//             // params.logger.info(Buffer.from(transactionContext.stub.putPrivateData.getCall(2).args[2].toString()).toString('utf8'));
//             // params.logger.info("oo")
//             // params.logger.info(JSON.stringify(expectedIndexerJSON))
//             // params.logger.info("-----------")
//             // params.logger.info(transactionContext.stub.putPrivateData.getCall(3).args);
//             // params.logger.info("ooooooooo")
//             // params.logger.info(Buffer.from(transactionContext.stub.putPrivateData.getCall(3).args[2].toString()).toString('utf8'));
//             // params.logger.info("oo")
//             // params.logger.info(JSON.stringify(expectedDateMax))
//             // params.logger.info("-----------")
//             // params.logger.info(transactionContext.stub.putPrivateData.getCall(4).args);
//             // params.logger.info("ooooooooo")
//             // params.logger.info(Buffer.from(transactionContext.stub.putPrivateData.getCall(4).args[2].toString()).toString('utf8'));
//             // params.logger.info(JSON.stringify(expectedFeedbackProducer))
//             // params.logger.info("-----------")


//             transactionContext.stub.putPrivateData.getCall(0).should.have.been.calledWithExactly(
//                 'producer-rte',
//                 expected.activationDocumentMrid,
//                 Buffer.from(JSON.stringify(expected)),
//             );

//             transactionContext.stub.putPrivateData.getCall(1).should.have.been.calledWithExactly(
//                 'producer-rte',
//                 compositeKeyIndexedJSON.indexId,
//                 Buffer.from(JSON.stringify(compositeKeyIndexedJSON)),
//             );

//             transactionContext.stub.putPrivateData.getCall(2).should.have.been.calledWithExactly(
//                 'producer-rte',
//                 expectedIndexerJSON.indexId,
//                 Buffer.from(JSON.stringify(expectedIndexerJSON)),
//             );

//             transactionContext.stub.putPrivateData.getCall(3).should.have.been.calledWithExactly(
//                 'producer-rte',
//                 expectedDateMaxId,
//                 Buffer.from(JSON.stringify(expectedDateMax)),
//             );

//             transactionContext.stub.putPrivateData.getCall(4).should.have.been.calledWithExactly(
//                 'producer-rte',
//                 expectedFeedbackProducer.feedbackProducerMrid,
//                 Buffer.from(JSON.stringify(expectedFeedbackProducer)),
//             );

//             expect(transactionContext.stub.putPrivateData.callCount).to.equal(5);
//         });

//     });
// // // ////////////////////////////////////////////////////////////////////////////
// // // ////////////////////////////////////    GET     ////////////////////////////
// // // ////////////////////////////////////////////////////////////////////////////
//     describe('Test GetActivationDocumentByProducer', () => {
//         it('should return OK on GetActivationDocumentByProducer empty', async () => {
//             transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.PRODUCER);
//             const producer = 'toto';
//             let ret = await star.GetActivationDocumentByProducer(transactionContext, producer);
//             ret = JSON.parse(ret);
//             // params.logger.log('retADproducer=', ret)
//             expect(ret.length).to.equal(0);
//             expect(ret).to.eql([]);
//         });

//         it('should return SUCCESS on GetActivationDocumentByProducer', async () => {
//             transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.PRODUCER);
//             const iterator1 = Values.getQueryMockArrayValues([Values.HTA_ActivationDocument_Valid], mockHandler);
//             const iterator2 = Values.getQueryMockArrayValues([Values.HTA_ActivationDocument_Valid_Doc2], mockHandler);
//             const query = `{"selector": {"docType": "${DocType.ACTIVATION_DOCUMENT}", "receiverMarketParticipantMrid": "${Values.HTA_Producer.producerMarketParticipantMrid}"}}`;
//             transactionContext.stub.getPrivateDataQueryResult.withArgs('enedis-producer', query).resolves(iterator1);
//             transactionContext.stub.getPrivateDataQueryResult.withArgs('producer-rte', query).resolves(iterator2);

//             let ret = await star.GetActivationDocumentByProducer(transactionContext, Values.HTA_Producer.producerMarketParticipantMrid);
//             ret = JSON.parse(ret);
//             // params.logger.log('ret=', ret)
//             expect(ret.length).to.equal(2);

//             const expectedDoc1 = JSON.parse(JSON.stringify(Values.HTA_ActivationDocument_Valid));
//             expectedDoc1.eligibilityStatus = '';
//             expectedDoc1.eligibilityStatusEditable = false;
//             const expectedDoc2 = JSON.parse(JSON.stringify(Values.HTA_ActivationDocument_Valid_Doc2));
//             expectedDoc2.eligibilityStatus = '';
//             expectedDoc2.eligibilityStatusEditable = false;
//             const expected: ActivationDocument[] = [expectedDoc1, expectedDoc2];

//             expect(ret).to.eql(expected);
//         });

//         // it('should return SUCCESS on getActivationDocumentByproducer for non JSON value', async () => {
//         //     transactionContext.stub.putState.onFirstCall().callsFake((key, value) => {
//         //         transactionContext.stub.states = {};
//         //         transactionContext.stub.states[key] = 'non-json-value';
//         //     });

//         //     transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);
//         //     await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrid\": \"17V000000992746F\",\"systemOperatorMarketParticipantName\": \"Enedis\",\"systemOperatorMarketParticipantRoleType\": \"A50\"}');

//         //     const site: Site = {meteringPointMrid: 'PDL00000000289766',systemOperatorMarketParticipantMrid: '17V000000992746D',producerMarketParticipantMrid: '17X000001309745X',technologyType: 'Eolien',siteType: 'Injection',siteName: 'Ferme éolienne de Genonville',substationMrid: 'GDO A4RTD',substationName: 'CIVRAY',siteAdminMrid: '489 981 029', siteLocation: 'Biscarosse', siteIecCode: 'S7X0000013077478', systemOperatorEntityFlexibilityDomainMrid: 'PSC4511', systemOperatorEntityFlexibilityDomainName: 'Départ 1', systemOperatorCustomerServiceName: 'DR Nantes Deux-Sèvres'};

//         //     transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);
//         //     await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrid\": \"17V000000992746D\",\"systemOperatorMarketParticipantName\": \"Enedis\",\"systemOperatorMarketParticipantRoleType\": \"A50\"}');
//         //     await star.CreateProducer(transactionContext, '{\"producerMarketParticipantMrid\": \"17X000001309745X\",\"producerMarketParticipantName\": \"EolienFR vert Cie\",\"producerMarketParticipantRoleType\": \"A21\"}');
//         //     await star.CreateSite(transactionContext, JSON.stringify(site));

//         //     const orderA: ActivationDocument = {
//         //         activationDocumentMrid: '8c56459a-794a-4ed1-a7f6-33b0064508f1', // PK
//         //         originAutomationRegisteredResourceMrid: 'CRIVA1_ENEDIS_Y411', // FK1
//         //         registeredResourceMrid: 'PDL00000000289766', // FK2
//         //         measurementUnitName: 'KW',
//         //         messageType: 'string',
//         //         businessType: 'string',

//         //         orderEnd: false,

//         //         orderValue: '1',
//         //         startCreatedDateTime: "2021-10-22T10:29:10.000Z",
//         //         // testDateTime: 'Date', // Test DELETE ME //////////////////////
//         //         endCreatedDateTime: "2021-10-22T23:29:10.000Z",
//         //         revisionNumber: '1',
//         //         reasonCode: 'string', // optionnal in case of TVC modulation
//         //         senderMarketParticipantMrid: '17V000000992746D', // FK?
//         //         receiverMarketParticipantMrid: '17X000001309745X', // FK?
//         //         // reconciliation: false,
//         //         // subOrderList: [],
//         //     }

//         //     transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);
//         //     await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrid\": \"17V0000009927454\",\"systemOperatorMarketParticipantName\": \"Enedis\",\"systemOperatorMarketParticipantRoleType\": \"A50\"}');
//         //     await star.CreateProducer(transactionContext, '{\"producerMarketParticipantMrid\": \"17X000001309745Y\",\"producerMarketParticipantName\": \"EolienFR vert Cie\",\"producerMarketParticipantRoleType\": \"A21\"}');

//         //     const yellowPage: YellowPages = {originAutomationRegisteredResourceMrid: "CRIVA1_ENEDIS_Y411",registeredResourceMrid: "PDL00000000289766",systemOperatorMarketParticipantMrid: "17V000000992746D"};
//         //     await star.CreateYellowPages(transactionContext, JSON.stringify(yellowPage));
//         //     await star.CreateActivationDocument(transactionContext, JSON.stringify(orderA));

//         //     const orderB: ActivationDocument = {
//         //         activationDocumentMrid: '8c56459a-794a-4ed1-a7f6-33b0064508f2', // PK
//         //         originAutomationRegisteredResourceMrid: 'CRIVA1_ENEDIS_Y411', // FK1
//         //         registeredResourceMrid: 'PDL00000000289766', // FK2
//         //         measurementUnitName: 'MW',
//         //         messageType: 'string',
//         //         businessType: 'string',
//         //         orderEnd: false,

//         //         orderValue: '1',
//         //         startCreatedDateTime: "2021-10-22T10:29:10.000Z",
//         //         // testDateTime: 'Date', // Test DELETE ME //////////////////////
//         //         endCreatedDateTime: "2021-10-22T23:29:10.000Z",
//         //         revisionNumber: '1',
//         //         reasonCode: 'string', // optionnal in case of TVC modulation
//         //         senderMarketParticipantMrid: '17V000000992746D', // FK?
//         //         receiverMarketParticipantMrid: '17X000001309745Y', // FK?
//         //         // reconciliation: false,
//         //         // subOrderList: [],
//         //     }

//         //     transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);
//         //     await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrid\": \"17V000000992746D\",\"systemOperatorMarketParticipantName\": \"RTE\",\"systemOperatorMarketParticipantRoleType\": \"A49\"}');
//         //     await star.CreateActivationDocument(transactionContext, JSON.stringify(orderB));

//         //     let retB = await star.GetActivationDocumentByProducer(transactionContext, orderB.receiverMarketParticipantMrid);
//         //     retB = JSON.parse(retB);
//         //     // params.logger.log('retB=', retB)
//         //     expect(retB.length).to.equal(2);

//         //     const expected = [
//         //         'non-json-value',
//         //         {
//         //             activationDocumentMrid: "8c56459a-794a-4ed1-a7f6-33b0064508f2",
//         //             businessType: "string",
//         //             docType: "${DocType.ACTIVATION_DOCUMENT}",
//         //             endCreatedDateTime: "2021-10-22T23:29:10.000Z",
//         //             measurementUnitName: "MW",
//         //             messageType: "string",
//         //             orderEnd: false,

//         //             orderValue: "1",
//         //             originAutomationRegisteredResourceMrid: "CRIVA1_ENEDIS_Y411",
//         //             reasonCode: "string",
//         //             receiverMarketParticipantMrid: "17X000001309745Y",
//         //             reconciliation: true,
//         //             registeredResourceMrid: "PDL00000000289766",
//         //             revisionNumber: "1",
//         //             senderMarketParticipantMrid: "17V000000992746D",
//         //             startCreatedDateTime: "2021-10-22T10:29:10.000Z",
//         //         }
//         //    ];

//         //     expect(retB).to.eql(expected);
//         // });
//    });

//     describe('Test GetActivationDocumentBySystemOperator', () => {
//         it('should return OK on GetActivationDocumentBySystemOperator empty', async () => {
//             const producer = 'toto';
//             let ret = await star.GetActivationDocumentBySystemOperator(transactionContext, producer);
//             ret = JSON.parse(ret);
//             // params.logger.log('retADproducer=', ret)
//             expect(ret.length).to.equal(0);
//             expect(ret).to.eql([]);
//         });

//         it('should return SUCCESS on GetActivationDocumentBySystemOperator', async () => {
//             transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);
//             const iterator = Values.getQueryMockArrayValues([Values.HTA_ActivationDocument_Valid], mockHandler);
//             const iterator2 = Values.getQueryMockArrayValues([Values.HTA_ActivationDocument_Valid_Doc2], mockHandler);
//             const query = `{"selector": {"docType": "${DocType.ACTIVATION_DOCUMENT}", "senderMarketParticipantMrid": "${Values.HTA_ActivationDocument_Valid.senderMarketParticipantMrid}"}}`;
//             transactionContext.stub.getPrivateDataQueryResult.withArgs('enedis-producer', query).resolves(iterator);
//             transactionContext.stub.getPrivateDataQueryResult.withArgs('producer-rte', query).resolves(iterator2);

//             let ret = await star.GetActivationDocumentBySystemOperator(transactionContext, Values.HTA_ActivationDocument_Valid.senderMarketParticipantMrid as string);
//             ret = JSON.parse(ret);
//             // params.logger.log('ret=', ret)
//             expect(ret.length).to.equal(1);

//             const expectedDoc1 = JSON.parse(JSON.stringify(Values.HTA_ActivationDocument_Valid));
//             expectedDoc1.eligibilityStatus = '';
//             expectedDoc1.eligibilityStatusEditable = false;
//             const expected: ActivationDocument[] = [expectedDoc1];

//             expect(ret).to.eql(expected);
//         });

//         // it('should return SUCCESS on getActivationDocumentBySystemOperator for non JSON value', async () => {
//         //     transactionContext.stub.putState.onFirstCall().callsFake((key, value) => {
//         //         transactionContext.stub.states = {};
//         //         transactionContext.stub.states[key] = 'non-json-value';
//         //     });

//         //     transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);
//         //     await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrid\": \"17V000000992746L\",\"systemOperatorMarketParticipantName\": \"Enedis\",\"systemOperatorMarketParticipantRoleType\": \"A50\"}');

//         //     const site: Site = {meteringPointMrid: 'PDL00000000289766',systemOperatorMarketParticipantMrid: '17V0000009927454',producerMarketParticipantMrid: '17X000001309745X',technologyType: 'Eolien',siteType: 'Injection',siteName: 'Ferme éolienne de Genonville',substationMrid: 'GDO A4RTD',substationName: 'CIVRAY',siteAdminMrid: '489 981 029', siteLocation: 'Biscarosse', siteIecCode: 'S7X0000013077478', systemOperatorEntityFlexibilityDomainMrid: 'PSC4511', systemOperatorEntityFlexibilityDomainName: 'Départ 1', systemOperatorCustomerServiceName: 'DR Nantes Deux-Sèvres'};

//         //     transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);
//         //     await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrid\": \"17V0000009927454\",\"systemOperatorMarketParticipantName\": \"Enedis\",\"systemOperatorMarketParticipantRoleType\": \"A50\"}');
//         //     await star.CreateProducer(transactionContext, '{\"producerMarketParticipantMrid\": \"17X000001309745X\",\"producerMarketParticipantName\": \"EolienFR vert Cie\",\"producerMarketParticipantRoleType\": \"A21\"}');
//         //     await star.CreateSite(transactionContext, JSON.stringify(site));

//         //     const orderA: ActivationDocument = {
//         //         activationDocumentMrid: '8c56459a-794a-4ed1-a7f6-33b0064508f1', // PK
//         //         originAutomationRegisteredResourceMrid: 'CRIVA1_ENEDIS_Y411', // FK1
//         //         registeredResourceMrid: 'PDL00000000289766', // FK2
//         //         measurementUnitName: 'MW',
//         //         messageType: 'string',
//         //         businessType: 'string',

//         //         orderEnd: false,

//         //         orderValue: '1',
//         //         startCreatedDateTime: "2021-10-22T10:29:10.000Z",
//         //         // testDateTime: 'Date', // Test DELETE ME //////////////////////
//         //         endCreatedDateTime: "2021-10-22T23:29:10.000Z",
//         //         revisionNumber: '1',
//         //         reasonCode: 'string', // optionnal in case of TVC modulation
//         //         senderMarketParticipantMrid: '17V0000009927454', // FK?
//         //         receiverMarketParticipantMrid: '17X000001309745X', // FK?
//         //         // reconciliation: false,
//         //         // subOrderList: [],
//         //     }

//         //     transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);
//         //     await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrid\": \"17V000000992746D\",\"systemOperatorMarketParticipantName\": \"RTE\",\"systemOperatorMarketParticipantRoleType\": \"A49\"}');
//         //     await star.CreateProducer(transactionContext, '{\"producerMarketParticipantMrid\": \"17X000001309745Y\",\"producerMarketParticipantName\": \"EolienFR vert Cie\",\"producerMarketParticipantRoleType\": \"A21\"}');

//         //     const yellowPage: YellowPages = {originAutomationRegisteredResourceMrid: "CRIVA1_ENEDIS_Y411",registeredResourceMrid: "PDL00000000289766",systemOperatorMarketParticipantMrid: "17V000000992746D"};
//         //     await star.CreateYellowPages(transactionContext, JSON.stringify(yellowPage));
//         //     await star.CreateActivationDocument(transactionContext, JSON.stringify(orderA));

//         //     const orderB: ActivationDocument = {
//         //         activationDocumentMrid: '8c56459a-794a-4ed1-a7f6-33b0064508f2', // PK
//         //         originAutomationRegisteredResourceMrid: 'CRIVA1_ENEDIS_Y411', // FK1
//         //         registeredResourceMrid: 'PDL00000000289766', // FK2
//         //         measurementUnitName: 'MW',
//         //         messageType: 'string',
//         //         businessType: 'string',

//         //         orderEnd: false,

//         //         orderValue: '1',
//         //         startCreatedDateTime: "2021-10-22T10:29:10.000Z",
//         //         // testDateTime: 'Date', // Test DELETE ME //////////////////////
//         //         endCreatedDateTime: "2021-10-22T23:29:10.000Z",
//         //         revisionNumber: '1',
//         //         reasonCode: 'string', // optionnal in case of TVC modulation
//         //         senderMarketParticipantMrid: '17V0000009927454', // FK?
//         //         receiverMarketParticipantMrid: '17X000001309745Y', // FK?
//         //         // reconciliation: false,
//         //         // subOrderList: [],
//         //     }

//         //     transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);
//         //     // await star.CreateSystemOperator(transactionContext, '17V0000009927454', 'RTE', 'A49');
//         //     await star.CreateActivationDocument(transactionContext, JSON.stringify(orderB));

//         //     let retB = await star.GetActivationDocumentBySystemOperator(transactionContext, orderB.senderMarketParticipantMrid);
//         //     retB = JSON.parse(retB);
//         //     // params.logger.log('retB=', retB)
//         //     expect(retB.length).to.equal(3);

//         //     const expected = [
//         //         'non-json-value',
//         //         {
//         //             activationDocumentMrid: "8c56459a-794a-4ed1-a7f6-33b0064508f1",
//         //             businessType: "string",
//         //             docType: "${DocType.ACTIVATION_DOCUMENT}",
//         //             endCreatedDateTime: "2021-10-22T23:29:10.000Z",
//         //             measurementUnitName: "MW",
//         //             messageType: "string",
//         //             orderEnd: false,

//         //             orderValue: "1",
//         //             originAutomationRegisteredResourceMrid: "CRIVA1_ENEDIS_Y411",
//         //             reasonCode: "string",
//         //             receiverMarketParticipantMrid: "17X000001309745X",
//         //             reconciliation: true,
//         //             registeredResourceMrid: "PDL00000000289766",
//         //             revisionNumber: "1",
//         //             senderMarketParticipantMrid: "17V0000009927454",
//         //             startCreatedDateTime: "2021-10-22T10:29:10.000Z",
//         //         },
//         //         {

//         //             activationDocumentMrid: "8c56459a-794a-4ed1-a7f6-33b0064508f2",
//         //             businessType: "string",
//         //             docType: "${DocType.ACTIVATION_DOCUMENT}",
//         //             endCreatedDateTime: "2021-10-22T23:29:10.000Z",
//         //             measurementUnitName: "MW",
//         //             messageType: "string",
//         //             orderEnd: false,

//         //             orderValue: "1",
//         //             originAutomationRegisteredResourceMrid: "CRIVA1_ENEDIS_Y411",
//         //             reasonCode: "string",
//         //             receiverMarketParticipantMrid: "17X000001309745Y",
//         //             reconciliation: true,
//         //             registeredResourceMrid: "PDL00000000289766",
//         //             revisionNumber: "1",
//         //             senderMarketParticipantMrid: "17V0000009927454",
//         //             startCreatedDateTime: "2021-10-22T10:29:10.000Z",
//         //         }
//         //    ];

//         //     expect(retB).to.eql(expected);
//         // });
//     });
// ////////////////////////////////////////////////////////////////////////////
// /////////////////////////    RECONCILIATION STATE     //////////////////////
// ////////////////////////////////////////////////////////////////////////////
//     describe('Test Reconciliation State', () => {
//         it('should return SUCCESS on getReconciliationState / Garbage : 2 old', async () => {
//             transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);

//             const params: STARParameters = await ParametersController.getParameterValues(transactionContext);
//             const collectionMap: Map<string, string[]> = params.values.get(ParametersType.DATA_TARGET);
//             const collectionsTSO: string[] = collectionMap.get(RoleType.Role_TSO) as string[];
//             const collectionTSO: string = collectionsTSO[0];
//             const collectionsProducer: string[] = collectionMap.get(RoleType.Role_Producer) as string[];
//             const collectionProducer: string = collectionsProducer[0];
//             const ppcott: number = params.values.get(ParametersType.PPCO_TIME_THRESHOLD);

//             const activationDocument01_garbage: ActivationDocument = JSON.parse(JSON.stringify(Values.HTB_ActivationDocument_HTA_JustStartDate));
//             activationDocument01_garbage.docType = DocType.ACTIVATION_DOCUMENT;
//             activationDocument01_garbage.startCreatedDateTime = CommonService.reduceDateDaysStr(activationDocument01_garbage.startCreatedDateTime as string, ppcott + 1);
//             activationDocument01_garbage.potentialParent = true;
//             activationDocument01_garbage.potentialChild = false;

//             const activationDocument02_garbage: ActivationDocument = JSON.parse(JSON.stringify(Values.HTA_ActivationDocument_Valid_Doc2));
//             activationDocument02_garbage.docType = DocType.ACTIVATION_DOCUMENT;
//             activationDocument02_garbage.startCreatedDateTime = CommonService.reduceDateDaysStr(activationDocument02_garbage.startCreatedDateTime as string, ppcott + 1);
//             activationDocument02_garbage.endCreatedDateTime = CommonService.reduceDateDaysStr(activationDocument02_garbage.endCreatedDateTime as string, ppcott + 1);
//             activationDocument02_garbage.potentialParent = false;
//             activationDocument02_garbage.potentialChild = true;

//             const queryCrank = `{"selector": {"docType": "${DocType.ACTIVATION_DOCUMENT}","$or":[{"potentialParent": true},{"potentialChild": true}]}}`;
//             const iteratorMix = Values.getQueryMockArrayValues([activationDocument01_garbage], mockHandler);
//             transactionContext.stub.getPrivateDataQueryResult.withArgs(collectionTSO, queryCrank).resolves(iteratorMix);
//             const iteratorProd = Values.getQueryMockArrayValues([activationDocument02_garbage], mockHandler);
//             transactionContext.stub.getPrivateDataQueryResult.withArgs(collectionProducer, queryCrank).resolves(iteratorProd);

//             let ret = await star.GetActivationDocumentReconciliationState(transactionContext);
//             ret = JSON.parse(ret);
//             // params.logger.log('ret=', ret)

//             activationDocument01_garbage.orderEnd = true;
//             activationDocument01_garbage.potentialParent = false;

//             activationDocument02_garbage.orderEnd = true;
//             activationDocument02_garbage.potentialChild = false;

//             const updateOrders: DataReference[] = [];
//             updateOrders.push({docType: DocType.ACTIVATION_DOCUMENT, collection: collectionTSO, data: activationDocument01_garbage});
//             updateOrders.push({docType: DocType.ACTIVATION_DOCUMENT, collection: collectionProducer, data: activationDocument02_garbage});

//             const expected = JSON.parse(JSON.stringify(updateOrders));
//             // params.logger.log('expected=', expected)

//             expect(ret).to.eql(expected);
//         });

//         it('should return SUCCESS on getReconciliationState / Garbage : 2 old - 1 current', async () => {
//             transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);

//             const params: STARParameters = await ParametersController.getParameterValues(transactionContext);
//             const collectionMap: Map<string, string[]> = params.values.get(ParametersType.DATA_TARGET);
//             const collectionsTSO: string[] = collectionMap.get(RoleType.Role_TSO) as string[];
//             const collectionTSO: string = collectionsTSO[0];
//             const collectionsProducer: string[] = collectionMap.get(RoleType.Role_Producer) as string[];
//             const collectionProducer: string = collectionsProducer[0];
//             const ppcott: number = params.values.get(ParametersType.PPCO_TIME_THRESHOLD);

//             const activationDocument_valid: ActivationDocument = JSON.parse(JSON.stringify(Values.HTB_ActivationDocument_HTA_JustStartDate));
//             activationDocument_valid.docType = DocType.ACTIVATION_DOCUMENT;
//             activationDocument_valid.potentialParent = true;
//             activationDocument_valid.potentialChild = false;

//             const activationDocument01_garbage: ActivationDocument = JSON.parse(JSON.stringify(Values.HTB_ActivationDocument_HTA_JustStartDate2));
//             activationDocument01_garbage.docType = DocType.ACTIVATION_DOCUMENT;
//             activationDocument01_garbage.startCreatedDateTime = CommonService.reduceDateDaysStr(activationDocument01_garbage.startCreatedDateTime as string, ppcott + 1);
//             activationDocument01_garbage.potentialParent = true;
//             activationDocument01_garbage.potentialChild = false;

//             const activationDocument02_garbage: ActivationDocument = JSON.parse(JSON.stringify(Values.HTA_ActivationDocument_Valid_Doc2));
//             activationDocument02_garbage.docType = DocType.ACTIVATION_DOCUMENT;
//             activationDocument02_garbage.startCreatedDateTime = CommonService.reduceDateDaysStr(activationDocument02_garbage.startCreatedDateTime as string, ppcott + 1);
//             activationDocument02_garbage.endCreatedDateTime = CommonService.reduceDateDaysStr(activationDocument02_garbage.endCreatedDateTime as string, ppcott + 1);
//             activationDocument02_garbage.potentialParent = false;
//             activationDocument02_garbage.potentialChild = true;

//             const queryCrank = `{"selector": {"docType": "${DocType.ACTIVATION_DOCUMENT}","$or":[{"potentialParent": true},{"potentialChild": true}]}}`;
//             const iteratorMix = Values.getQueryMockArrayValues([activationDocument_valid, activationDocument01_garbage], mockHandler);
//             transactionContext.stub.getPrivateDataQueryResult.withArgs(collectionTSO, queryCrank).resolves(iteratorMix);
//             const iteratorProd = Values.getQueryMockArrayValues([activationDocument02_garbage], mockHandler);
//             transactionContext.stub.getPrivateDataQueryResult.withArgs(collectionProducer, queryCrank).resolves(iteratorProd);

//             let ret = await star.GetActivationDocumentReconciliationState(transactionContext);
//             ret = JSON.parse(ret);
//             // params.logger.log('ret=', ret)

//             activationDocument01_garbage.orderEnd = true;
//             activationDocument01_garbage.potentialParent = false;

//             activationDocument02_garbage.orderEnd = true;
//             activationDocument02_garbage.potentialChild = false;

//             const updateOrders: DataReference[] = [];
//             updateOrders.push({docType: DocType.ACTIVATION_DOCUMENT, collection: collectionTSO, data: activationDocument01_garbage});
//             updateOrders.push({docType: DocType.ACTIVATION_DOCUMENT, collection: collectionProducer, data: activationDocument02_garbage});

//             const expected = JSON.parse(JSON.stringify(updateOrders));
//             // params.logger.log('expected=', expected)

//             expect(ret).to.eql(expected);
//         });

//         it('should return SUCCESS on getReconciliationState / Matching end order HTB RTE', async () => {
//             transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);

//             const params: STARParameters = await ParametersController.getParameterValues(transactionContext);
//             const collectionMap: Map<string, string[]> = params.values.get(ParametersType.DATA_TARGET);
//             const collectionsProducer: string[] = collectionMap.get(RoleType.Role_Producer) as string[];
//             const collectionProducer: string = collectionsProducer[0];

//             transactionContext.stub.getState.withArgs(Values.HTB_systemoperator.systemOperatorMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTB_systemoperator)));
//             transactionContext.stub.getState.withArgs(Values.HTB_Producer.producerMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTB_Producer)));

//             const collectionNamesSite: string[] = await HLFServices.getCollectionsOrDefault(params, ParametersType.DATA_TARGET);
//             transactionContext.stub.getPrivateData.withArgs(collectionNamesSite[0], Values.HTB_site_valid.meteringPointMrid).resolves(Buffer.from(JSON.stringify(Values.HTB_site_valid)));

//             const parentStartDocument: ActivationDocument = JSON.parse(JSON.stringify(Values.HTB_ActivationDocument_JustStartDate));
//             parentStartDocument.potentialParent = true;
//             parentStartDocument.potentialChild = false;
//             parentStartDocument.docType = DocType.ACTIVATION_DOCUMENT;

//             const childEndDocument: ActivationDocument = JSON.parse(JSON.stringify(Values.HTB_ActivationDocument_JustEndDate));
//             childEndDocument.potentialParent = false;
//             childEndDocument.potentialChild = true;
//             childEndDocument.docType = DocType.ACTIVATION_DOCUMENT;

//             const queryCrank = `{"selector": {"docType": "${DocType.ACTIVATION_DOCUMENT}","$or":[{"potentialParent": true},{"potentialChild": true}]}}`;
//             const iteratorReconciliation = Values.getQueryMockArrayValues([parentStartDocument, childEndDocument], mockHandler);
//             transactionContext.stub.getPrivateDataQueryResult.withArgs(collectionProducer, queryCrank).resolves(iteratorReconciliation);

//             let ret = await star.GetActivationDocumentReconciliationState(transactionContext);
//             ret = JSON.parse(ret);
//             // params.logger.log('ret=', ret)

//             parentStartDocument.orderEnd = true;
//             parentStartDocument.subOrderList = [childEndDocument.activationDocumentMrid];

//             childEndDocument.potentialChild = false;
//             childEndDocument.subOrderList = [parentStartDocument.activationDocumentMrid];
//             childEndDocument.docType = DocType.ACTIVATION_DOCUMENT;

//             const updateOrders: DataReference[] = [];
//             updateOrders.push({docType: DocType.ACTIVATION_DOCUMENT, collection: collectionProducer, data: parentStartDocument});
//             updateOrders.push({docType: DocType.ACTIVATION_DOCUMENT, collection: collectionProducer, data: childEndDocument});

//             const expected = JSON.parse(JSON.stringify(updateOrders));
//             // params.logger.log('expected=', expected)

//             expect(ret).to.eql(expected);
//         });

//         it('should return SUCCESS on getReconciliationState / Matching end order HTB RTE (2 parents, choice on closest date )', async () => {
//             transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);

//             const params: STARParameters = await ParametersController.getParameterValues(transactionContext);
//             const collectionMap: Map<string, string[]> = params.values.get(ParametersType.DATA_TARGET);
//             const collectionsProducer: string[] = collectionMap.get(RoleType.Role_Producer) as string[];
//             const collectionProducer: string = collectionsProducer[0];

//             transactionContext.stub.getState.withArgs(Values.HTB_systemoperator.systemOperatorMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTB_systemoperator)));
//             transactionContext.stub.getState.withArgs(Values.HTB_Producer.producerMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTB_Producer)));

//             const collectionNamesSite: string[] = await HLFServices.getCollectionsOrDefault(params, ParametersType.DATA_TARGET);
//             transactionContext.stub.getPrivateData.withArgs(collectionNamesSite[0], Values.HTB_site_valid.meteringPointMrid).resolves(Buffer.from(JSON.stringify(Values.HTB_site_valid)));

//             const parentStartDocument: ActivationDocument = JSON.parse(JSON.stringify(Values.HTB_ActivationDocument_JustStartDate));
//             parentStartDocument.potentialParent = true;
//             parentStartDocument.potentialChild = false;
//             parentStartDocument.docType = DocType.ACTIVATION_DOCUMENT;

//             const parentStartDocumentOldest: ActivationDocument = JSON.parse(JSON.stringify(Values.HTB_ActivationDocument_JustStartDate));
//             parentStartDocumentOldest.activationDocumentMrid = parentStartDocumentOldest.activationDocumentMrid + '_Old';
//             parentStartDocumentOldest.potentialParent = true;
//             parentStartDocumentOldest.potentialChild = false;
//             parentStartDocumentOldest.docType = DocType.ACTIVATION_DOCUMENT;
//             let dateoldest = new Date(parentStartDocumentOldest.startCreatedDateTime as string);
//             dateoldest = new Date(dateoldest.getTime() - 2);
//             parentStartDocumentOldest.startCreatedDateTime = JSON.stringify(dateoldest);

//             const childEndDocument: ActivationDocument = JSON.parse(JSON.stringify(Values.HTB_ActivationDocument_JustEndDate));
//             childEndDocument.potentialParent = false;
//             childEndDocument.potentialChild = true;
//             childEndDocument.docType = DocType.ACTIVATION_DOCUMENT;

//             const senderMarketParticipantMrid: string = childEndDocument.senderMarketParticipantMrid as string;
//             const registeredResourceMrid: string = childEndDocument.registeredResourceMrid;

//             const queryDate: string = childEndDocument.endCreatedDateTime as string;

//             const pcuetmt: number = params.values.get(ParametersType.PC_TIME_UPDATEEND_MATCH_THRESHOLD);

//             const datetmp = new Date(queryDate);
//             datetmp.setUTCHours(0, 0, 0, 0);
//             const dateYesterday = new Date(datetmp.getTime() - pcuetmt);

//             const args: string[] = [];
//             args.push(`"orderEnd":false`);
//             args.push(`"senderMarketParticipantMrid":"${senderMarketParticipantMrid}"`);
//             args.push(`"registeredResourceMrid":"${registeredResourceMrid}"`);
//             args.push(`"messageType":{"$in":["A54","A98"]}`);
//             args.push(`"startCreatedDateTime":{"$gte":${JSON.stringify(dateYesterday)},"$lte":${JSON.stringify(queryDate)}}`);

//             // params.logger.info("** Query TEST **");
//             const query = await QueryStateService.buildQuery({documentType: DocType.ACTIVATION_DOCUMENT, queryArgs: args});
//             // params.logger.info("** Query TEST - END **");

//             const iterator = Values.getQueryMockArrayValues([parentStartDocumentOldest, parentStartDocument], mockHandler);
//             transactionContext.stub.getPrivateDataQueryResult.withArgs(collectionProducer, query).resolves(iterator);

//             const queryCrank = `{"selector": {"docType": "${DocType.ACTIVATION_DOCUMENT}","$or":[{"potentialParent": true},{"potentialChild": true}]}}`;
//             const iteratorReconciliation = Values.getQueryMockArrayValues([parentStartDocument, childEndDocument], mockHandler);
//             transactionContext.stub.getPrivateDataQueryResult.withArgs(collectionProducer, queryCrank).resolves(iteratorReconciliation);

//             let ret = await star.GetActivationDocumentReconciliationState(transactionContext);
//             ret = JSON.parse(ret);
//             // params.logger.log('ret=', ret)

//             parentStartDocument.orderEnd = true;
//             parentStartDocument.subOrderList = [childEndDocument.activationDocumentMrid];

//             childEndDocument.potentialChild = false;
//             childEndDocument.subOrderList = [parentStartDocument.activationDocumentMrid];
//             childEndDocument.docType = DocType.ACTIVATION_DOCUMENT;

//             const updateOrders: DataReference[] = [];
//             updateOrders.push({docType: DocType.ACTIVATION_DOCUMENT, collection: collectionProducer, data: parentStartDocument});
//             updateOrders.push({docType: DocType.ACTIVATION_DOCUMENT, collection: collectionProducer, data: childEndDocument});

//             const expected = JSON.parse(JSON.stringify(updateOrders));
//             // params.logger.log('expected=', expected)

//             expect(ret).to.eql(expected);
//         });

//         it('should return SUCCESS CreateActivationDocument couple HTA after HTB with MPWC reconciliation', async () => {
//             transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);

//             const params: STARParameters = await ParametersController.getParameterValues(transactionContext);
//             const collectionMap: Map<string, string[]> = params.values.get(ParametersType.DATA_TARGET);
//             const collectionsTSO: string[] = collectionMap.get(RoleType.Role_TSO) as string[];
//             const collectionTSO: string = collectionsTSO[0];
//             const collectionsProducer: string[] = collectionMap.get(RoleType.Role_Producer) as string[];
//             const collectionProducer: string = collectionsProducer[0];

//             transactionContext.stub.getState.withArgs(Values.HTA_systemoperator2.systemOperatorMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_systemoperator2)));
//             transactionContext.stub.getState.withArgs(Values.HTA_Producer.producerMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_Producer)));

//             const parentDocument: ActivationDocument = JSON.parse(JSON.stringify(Values.HTB_ActivationDocument_HTA_JustStartDate));
//             parentDocument.docType = DocType.ACTIVATION_DOCUMENT;
//             parentDocument.receiverRole = RoleType.Role_DSO;
//             parentDocument.potentialParent = true;
//             parentDocument.potentialChild = false;
//             parentDocument.orderEnd = true;

//             const childDocument_Reconciliation: ActivationDocument = JSON.parse(JSON.stringify(Values.HTA_ActivationDocument_Valid_Doc2));
//             childDocument_Reconciliation.docType = DocType.ACTIVATION_DOCUMENT;
//             childDocument_Reconciliation.potentialParent = false;
//             childDocument_Reconciliation.potentialChild = true;
//             childDocument_Reconciliation.orderEnd = false;

//             const collectionNamesSite: string[] = await HLFServices.getCollectionsOrDefault(params, ParametersType.DATA_TARGET);
//             transactionContext.stub.getPrivateData.withArgs(collectionNamesSite[0],
//                 childDocument_Reconciliation.registeredResourceMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_site_valid)));

//             const queryYellowPage = `{"selector": {"docType": "yellowPages", "originAutomationRegisteredResourceMrid": "${childDocument_Reconciliation.originAutomationRegisteredResourceMrid}"}}`;
//             const iteratorYellowPage = Values.getQueryMockArrayValues([Values.HTA_yellowPage], mockHandler);
//             transactionContext.stub.getQueryResult.withArgs(queryYellowPage).resolves(iteratorYellowPage);

//             const queryCrank = `{"selector": {"docType": "${DocType.ACTIVATION_DOCUMENT}","$or":[{"potentialParent": true},{"potentialChild": true}]}}`;
//             const iteratorReconciliationParent = Values.getQueryMockArrayValues([parentDocument], mockHandler);
//             transactionContext.stub.getPrivateDataQueryResult.withArgs(collectionTSO, queryCrank).resolves(iteratorReconciliationParent);
//             const iteratorReconciliationChild = Values.getQueryMockArrayValues([childDocument_Reconciliation], mockHandler);
//             transactionContext.stub.getPrivateDataQueryResult.withArgs(collectionProducer, queryCrank).resolves(iteratorReconciliationChild);

//             let ret = await star.GetActivationDocumentReconciliationState(transactionContext);
//             ret = JSON.parse(ret);
//             // params.logger.log('ret=', ret)

//             parentDocument.orderEnd = true;
//             parentDocument.subOrderList = [childDocument_Reconciliation.activationDocumentMrid];

//             childDocument_Reconciliation.potentialChild = false;
//             childDocument_Reconciliation.subOrderList = [parentDocument.activationDocumentMrid];
//             childDocument_Reconciliation.reconciliationStatus = ReconciliationStatus.TOTAL;

//             const updateOrders: DataReference[] = [];
//             updateOrders.push({docType: DocType.ACTIVATION_DOCUMENT, collection: collectionTSO, data: parentDocument});
//             updateOrders.push({docType: DocType.ACTIVATION_DOCUMENT, collection: collectionProducer, data: childDocument_Reconciliation});

//             const expected = JSON.parse(JSON.stringify(updateOrders));
//             // params.logger.log('expected=', expected)

//             expect(ret).to.eql(expected);
//         });

//         it('should return SUCCESS CreateActivationDocument couple HTA after HTB (2 parents, choice on closest date ) with MPWC reconciliation', async () => {
//             transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);

//             const params: STARParameters = await ParametersController.getParameterValues(transactionContext);
//             const collectionMap: Map<string, string[]> = params.values.get(ParametersType.DATA_TARGET);
//             const collectionsTSO: string[] = collectionMap.get(RoleType.Role_TSO) as string[];
//             const collectionTSO: string = collectionsTSO[0];
//             const collectionsProducer: string[] = collectionMap.get(RoleType.Role_Producer) as string[];
//             const collectionProducer: string = collectionsProducer[0];

//             transactionContext.stub.getState.withArgs(Values.HTA_systemoperator2.systemOperatorMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_systemoperator2)));
//             transactionContext.stub.getState.withArgs(Values.HTA_Producer.producerMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_Producer)));

//             const parentDocumentOldest: ActivationDocument = JSON.parse(JSON.stringify(Values.HTB_ActivationDocument_HTA_JustStartDate));
//             parentDocumentOldest.docType = DocType.ACTIVATION_DOCUMENT;
//             parentDocumentOldest.receiverRole = RoleType.Role_DSO;
//             parentDocumentOldest.potentialParent = true;
//             parentDocumentOldest.potentialChild = false;
//             parentDocumentOldest.orderEnd = true;
//             let dateoldest = new Date(parentDocumentOldest.startCreatedDateTime as string);
//             dateoldest = new Date(dateoldest.getTime() - 2);
//             parentDocumentOldest.startCreatedDateTime = dateoldest.toISOString();

//             const parentDocument: ActivationDocument = JSON.parse(JSON.stringify(Values.HTB_ActivationDocument_HTA_JustStartDate));
//             parentDocument.docType = DocType.ACTIVATION_DOCUMENT;
//             parentDocument.receiverRole = RoleType.Role_DSO;
//             parentDocument.potentialParent = true;
//             parentDocument.potentialChild = false;
//             parentDocument.orderEnd = true;

//             const childDocument_Reconciliation: ActivationDocument = JSON.parse(JSON.stringify(Values.HTA_ActivationDocument_Valid_Doc2));
//             childDocument_Reconciliation.docType = DocType.ACTIVATION_DOCUMENT;
//             childDocument_Reconciliation.potentialParent = false;
//             childDocument_Reconciliation.potentialChild = true;
//             childDocument_Reconciliation.orderEnd = false;

//             const collectionNamesSite: string[] = await HLFServices.getCollectionsOrDefault(params, ParametersType.DATA_TARGET);
//             transactionContext.stub.getPrivateData.withArgs(collectionNamesSite[0],
//                 childDocument_Reconciliation.registeredResourceMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_site_valid)));

//             const queryYellowPage = `{"selector": {"docType": "yellowPages", "originAutomationRegisteredResourceMrid": "${childDocument_Reconciliation.originAutomationRegisteredResourceMrid}"}}`;
//             const iteratorYellowPage = Values.getQueryMockArrayValues([Values.HTA_yellowPage], mockHandler);
//             transactionContext.stub.getQueryResult.withArgs(queryYellowPage).resolves(iteratorYellowPage);

//             const queryCrank = `{"selector": {"docType": "${DocType.ACTIVATION_DOCUMENT}","$or":[{"potentialParent": true},{"potentialChild": true}]}}`;
//             const iteratorReconciliationParents = Values.getQueryMockArrayValues([parentDocument, parentDocumentOldest], mockHandler);
//             transactionContext.stub.getPrivateDataQueryResult.withArgs(collectionTSO, queryCrank).resolves(iteratorReconciliationParents);
//             const iteratorReconciliationChilds = Values.getQueryMockArrayValues([ childDocument_Reconciliation], mockHandler);
//             transactionContext.stub.getPrivateDataQueryResult.withArgs(collectionProducer, queryCrank).resolves(iteratorReconciliationChilds);

//             let ret = await star.GetActivationDocumentReconciliationState(transactionContext);
//             ret = JSON.parse(ret);
//             // params.logger.log('ret=', ret)

//             parentDocument.orderEnd = true;
//             parentDocument.subOrderList = [childDocument_Reconciliation.activationDocumentMrid];

//             childDocument_Reconciliation.potentialChild = false;
//             childDocument_Reconciliation.subOrderList = [parentDocument.activationDocumentMrid];
//             childDocument_Reconciliation.reconciliationStatus = ReconciliationStatus.TOTAL;

//             const updateOrders: DataReference[] = [];
//             updateOrders.push({docType: DocType.ACTIVATION_DOCUMENT, collection: collectionTSO, data: parentDocument});
//             updateOrders.push({docType: DocType.ACTIVATION_DOCUMENT, collection: collectionProducer, data: childDocument_Reconciliation});

//             const expected = JSON.parse(JSON.stringify(updateOrders));
//             // params.logger.log('expected=', expected)

//             expect(ret).to.eql(expected);
//         });

//     });
// ////////////////////////////////////////////////////////////////////////////
// ////////////////////    UPDATE ELIGIBILITY STATUS     //////////////////////
// ////////////////////////////////////////////////////////////////////////////

//     describe('Test Update Activation Document Eligibility Status', () => {
//         it('should return ERROR UpdateActivationDocumentEligibilityStatus on unknown collection', async () => {

//             transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);

//             const params: STARParameters = await ParametersController.getParameterValues(transactionContext);
//             const collectionMap: Map<string, string[]> = params.values.get(ParametersType.DATA_TARGET);
//             const collectionsProducer: string[] = collectionMap.get(RoleType.Role_Producer) as string[];
//             const collectionProducer: string = collectionsProducer[0];

//             const activationDocument_Producer: ActivationDocument = JSON.parse(JSON.stringify(Values.HTB_ActivationDocument_JustStartDate));
//             activationDocument_Producer.docType = DocType.ACTIVATION_DOCUMENT;
//             activationDocument_Producer.potentialParent = true;
//             activationDocument_Producer.potentialChild = false;

//             transactionContext.stub.getState.withArgs(Values.HTB_systemoperator.systemOperatorMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTB_systemoperator)));
//             transactionContext.stub.getPrivateData.withArgs(collectionProducer,
//                 activationDocument_Producer.activationDocumentMrid).resolves(Buffer.from(JSON.stringify(activationDocument_Producer)));

//             const updatedStatus_Producer: EligibilityStatus = {
//                 activationDocumentMrid: activationDocument_Producer.activationDocumentMrid,
//                 eligibilityStatus: EligibilityStatusType.EligibilityAccepted,
//             };

//             const updateOrders_str = JSON.stringify(updatedStatus_Producer);

//             try {
//                 await star.UpdateActivationDocumentEligibilityStatus(transactionContext, updateOrders_str);
//             } catch (err) {
//                 // params.logger.info(err.message)
//                 expect(err.message).to.equal(`ERROR cannot find reference to Activation Document ${activationDocument_Producer.activationDocumentMrid} for status Update.`);
//             }
//         });

//         it('should return ERROR UpdateActivationDocumentEligibilityStatus on unknown document', async () => {

//             transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);

//             const params: STARParameters = await ParametersController.getParameterValues(transactionContext);

//             const activationDocument_Producer: ActivationDocument = JSON.parse(JSON.stringify(Values.HTB_ActivationDocument_JustStartDate));

//             const updatedStatus_Producer: EligibilityStatus = {
//                 activationDocumentMrid: activationDocument_Producer.activationDocumentMrid,
//                 eligibilityStatus: EligibilityStatusType.EligibilityAccepted,
//             };

//             const updateOrders_str = JSON.stringify(updatedStatus_Producer);

//             try {
//                 await star.UpdateActivationDocumentEligibilityStatus(transactionContext, updateOrders_str);
//             } catch (err) {
//                 // params.logger.info(err.message)
//                 expect(err.message).to.equal(`ERROR cannot find reference to Activation Document ${activationDocument_Producer.activationDocumentMrid} for status Update.`);
//             }
//         });

//         it('should return SUCCESS UpdateActivationDocumentEligibilityStatus: TSO Producer Document', async () => {
//             transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);

//             const params: STARParameters = await ParametersController.getParameterValues(transactionContext);
//             const collectionMap: Map<string, string[]> = params.values.get(ParametersType.DATA_TARGET);
//             const collectionsProducer: string[] = collectionMap.get(RoleType.Role_Producer) as string[];
//             const collectionProducer: string = collectionsProducer[0];

//             const activationDocument_Producer: ActivationDocument = JSON.parse(JSON.stringify(Values.HTB_ActivationDocument_JustStartDate));
//             activationDocument_Producer.docType = DocType.ACTIVATION_DOCUMENT;
//             activationDocument_Producer.potentialParent = true;
//             activationDocument_Producer.potentialChild = false;

//             transactionContext.stub.getState.withArgs(Values.HTB_systemoperator.systemOperatorMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTB_systemoperator)));
//             transactionContext.stub.getPrivateData.withArgs(collectionProducer,
//                 activationDocument_Producer.activationDocumentMrid).resolves(Buffer.from(JSON.stringify(activationDocument_Producer)));

//             const updatedStatus_Producer: EligibilityStatus = {
//                 activationDocumentMrid: activationDocument_Producer.activationDocumentMrid,
//                 eligibilityStatus: EligibilityStatusType.EligibilityAccepted,
//             };
//             const updateOrders_str = JSON.stringify(updatedStatus_Producer);

//             await star.UpdateActivationDocumentEligibilityStatus(transactionContext, updateOrders_str);

//             const expectedValue_Producer = JSON.parse(JSON.stringify(activationDocument_Producer));
//             expectedValue_Producer.eligibilityStatus = EligibilityStatusType.EligibilityAccepted;
//             expectedValue_Producer.eligibilityStatusEditable = false;

//             const activationDocumentCompositeKey = ActivationCompositeKeyIndexersController.getActivationDocumentCompositeKeyId(JSON.parse(JSON.stringify(expectedValue_Producer)));
//             const compositeKeyIndex: ActivationDocumentCompositeKeyAbstract = {
//                 activationDocumentCompositeKey,
//                 activationDocumentMrid: expectedValue_Producer.activationDocumentMrid,
//             };

//             const compositeKeyIndexed:IndexedData = {
//                 docType: DocType.DATA_INDEXER,
//                 indexId:activationDocumentCompositeKey,
//                 indexedDataAbstractMap: new Map()};
//             compositeKeyIndexed.indexedDataAbstractMap.set(activationDocumentCompositeKey, compositeKeyIndex);

//             const compositeKeyIndexedJSON = IndexedDataJson.toJson(compositeKeyIndexed);


//             // params.logger.info("-----------")
//             // params.logger.info(transactionContext.stub.putPrivateData.getCall(0).args);
//             // params.logger.info("ooooooooo")
//             // params.logger.info(Buffer.from(transactionContext.stub.putPrivateData.getCall(0).args[2].toString()).toString('utf8'));
//             // params.logger.info(JSON.stringify(expectedValue_Producer))
//             // params.logger.info("-----------")
//             // params.logger.info(transactionContext.stub.putPrivateData.getCall(1).args);
//             // params.logger.info("ooooooooo")
//             // params.logger.info(Buffer.from(transactionContext.stub.putPrivateData.getCall(1).args[2].toString()).toString('utf8'));
//             // params.logger.info(JSON.stringify(compositeKeyIndexedJSON))
//             // params.logger.info("-----------")

//             transactionContext.stub.putPrivateData.getCall(0).should.have.been.calledWithExactly(
//                 collectionProducer,
//                 expectedValue_Producer.activationDocumentMrid,
//                 Buffer.from(JSON.stringify(expectedValue_Producer)),
//             );
//             transactionContext.stub.putPrivateData.getCall(1).should.have.been.calledWithExactly(
//                 collectionProducer,
//                 activationDocumentCompositeKey,
//                 Buffer.from(JSON.stringify(compositeKeyIndexedJSON)),
//             );

//             expect(transactionContext.stub.putPrivateData.callCount).to.equal(2);
//         });

//         it('should return SUCCESS UpdateActivationDocumentEligibilityStatus: DSO Producer Document', async () => {
//             transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);

//             const params: STARParameters = await ParametersController.getParameterValues(transactionContext);
//             const collectionMap: Map<string, string[]> = params.values.get(ParametersType.DATA_TARGET);
//             const collectionsProducer: string[] = collectionMap.get(RoleType.Role_Producer) as string[];
//             const collectionProducer: string = collectionsProducer[0];

//             const activationDocument_Producer: ActivationDocument = JSON.parse(JSON.stringify(Values.HTA_ActivationDocument_Valid));
//             activationDocument_Producer.docType = DocType.ACTIVATION_DOCUMENT;
//             activationDocument_Producer.potentialParent = true;
//             activationDocument_Producer.potentialChild = false;

//             transactionContext.stub.getState.withArgs(Values.HTA_systemoperator.systemOperatorMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_systemoperator)));
//             transactionContext.stub.getPrivateData.withArgs(collectionProducer,
//                 activationDocument_Producer.activationDocumentMrid).resolves(Buffer.from(JSON.stringify(activationDocument_Producer)));

//             const updatedStatus_Producer: EligibilityStatus = {
//                 activationDocumentMrid: activationDocument_Producer.activationDocumentMrid,
//                 eligibilityStatus: EligibilityStatusType.EligibilityAccepted,
//             };
//             const updateOrders_str = JSON.stringify(updatedStatus_Producer);

//             await star.UpdateActivationDocumentEligibilityStatus(transactionContext, updateOrders_str);

//             const expectedValue_Producer = JSON.parse(JSON.stringify(activationDocument_Producer));
//             expectedValue_Producer.eligibilityStatus = EligibilityStatusType.EligibilityAccepted;
//             expectedValue_Producer.eligibilityStatusEditable = false;

//             const activationDocumentCompositeKey = ActivationCompositeKeyIndexersController.getActivationDocumentCompositeKeyId(JSON.parse(JSON.stringify(expectedValue_Producer)));
//             const compositeKeyIndex: ActivationDocumentCompositeKeyAbstract = {
//                 activationDocumentCompositeKey,
//                 activationDocumentMrid: expectedValue_Producer.activationDocumentMrid,
//             };

//             const compositeKeyIndexed:IndexedData = {
//                 docType: DocType.DATA_INDEXER,
//                 indexId:activationDocumentCompositeKey,
//                 indexedDataAbstractMap: new Map()};
//             compositeKeyIndexed.indexedDataAbstractMap.set(activationDocumentCompositeKey, compositeKeyIndex);

//             const compositeKeyIndexedJSON = IndexedDataJson.toJson(compositeKeyIndexed);


//             // params.logger.info("-----------")
//             // params.logger.info(transactionContext.stub.putPrivateData.getCall(0).args);
//             // params.logger.info("ooooooooo")
//             // params.logger.info(Buffer.from(transactionContext.stub.putPrivateData.getCall(0).args[2].toString()).toString('utf8'));
//             // params.logger.info(JSON.stringify(expectedValue_Producer))
//             // params.logger.info("-----------")
//             // params.logger.info(transactionContext.stub.putPrivateData.getCall(1).args);
//             // params.logger.info("ooooooooo")
//             // params.logger.info(Buffer.from(transactionContext.stub.putPrivateData.getCall(1).args[2].toString()).toString('utf8'));
//             // params.logger.info(JSON.stringify(compositeKeyIndexedJSON))
//             // params.logger.info("-----------")

//             transactionContext.stub.putPrivateData.getCall(0).should.have.been.calledWithExactly(
//                 collectionProducer,
//                 expectedValue_Producer.activationDocumentMrid,
//                 Buffer.from(JSON.stringify(expectedValue_Producer)),
//             );
//             transactionContext.stub.putPrivateData.getCall(1).should.have.been.calledWithExactly(
//                 collectionProducer,
//                 activationDocumentCompositeKey,
//                 Buffer.from(JSON.stringify(compositeKeyIndexedJSON)),
//             );

//             expect(transactionContext.stub.putPrivateData.callCount).to.equal(2);
//         });

//         it('should return SUCCESS UpdateActivationDocumentEligibilityStatus : TSO Document', async () => {
//             transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);

//             const params: STARParameters = await ParametersController.getParameterValues(transactionContext);
//             const collectionMap: Map<string, string[]> = params.values.get(ParametersType.DATA_TARGET);
//             const collectionsDSO: string[] = collectionMap.get(RoleType.Role_DSO) as string[];
//             const collectionDSO: string = collectionsDSO[0];

//             const activationDocument_TSO: ActivationDocument = JSON.parse(JSON.stringify(Values.HTB_ActivationDocument_HTA_JustStartDate));
//             activationDocument_TSO.docType = DocType.ACTIVATION_DOCUMENT;
//             activationDocument_TSO.potentialParent = true;
//             activationDocument_TSO.potentialChild = false;

//             transactionContext.stub.getState.withArgs(Values.HTB_systemoperator.systemOperatorMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTB_systemoperator)));
//             transactionContext.stub.getPrivateData.withArgs(collectionDSO,
//                 activationDocument_TSO.activationDocumentMrid).resolves(Buffer.from(JSON.stringify(activationDocument_TSO)));

//             const updatedStatus_TSO: EligibilityStatus = {
//                 activationDocumentMrid: activationDocument_TSO.activationDocumentMrid,
//                 eligibilityStatus: EligibilityStatusType.EligibilityRefused,
//             };

//             const updateOrders_str = JSON.stringify(updatedStatus_TSO);

//             await star.UpdateActivationDocumentEligibilityStatus(transactionContext, updateOrders_str);

//             const expectedValue_TSO = JSON.parse(JSON.stringify(activationDocument_TSO));
//             expectedValue_TSO.eligibilityStatus = EligibilityStatusType.EligibilityRefused;
//             expectedValue_TSO.eligibilityStatusEditable = false;

//             const activationDocumentCompositeKey = ActivationCompositeKeyIndexersController.getActivationDocumentCompositeKeyId(JSON.parse(JSON.stringify(activationDocument_TSO)));
//             const compositeKeyIndex: ActivationDocumentCompositeKeyAbstract = {
//                 activationDocumentCompositeKey,
//                 activationDocumentMrid: activationDocument_TSO.activationDocumentMrid,
//             };

//             const compositeKeyIndexed:IndexedData = {
//                 docType: DocType.DATA_INDEXER,
//                 indexId:activationDocumentCompositeKey,
//                 indexedDataAbstractMap: new Map()};
//             compositeKeyIndexed.indexedDataAbstractMap.set(activationDocumentCompositeKey, compositeKeyIndex);

//             const compositeKeyIndexedJSON = IndexedDataJson.toJson(compositeKeyIndexed);


//             // params.logger.info("-----------")
//             // params.logger.info(transactionContext.stub.putPrivateData.getCall(0).args);
//             // params.logger.info("ooooooooo")
//             // params.logger.info(Buffer.from(transactionContext.stub.putPrivateData.getCall(0).args[2].toString()).toString('utf8'));
//             // params.logger.info(JSON.stringify(expectedValue_TSO))
//             // params.logger.info("-----------")
//             // params.logger.info(transactionContext.stub.putPrivateData.getCall(1).args);
//             // params.logger.info("ooooooooo")
//             // params.logger.info(Buffer.from(transactionContext.stub.putPrivateData.getCall(1).args[2].toString()).toString('utf8'));
//             // params.logger.info(JSON.stringify(compositeKeyIndexedJSON))
//             // params.logger.info("-----------")

//             transactionContext.stub.putPrivateData.getCall(0).should.have.been.calledWithExactly(
//                 collectionDSO,
//                 activationDocument_TSO.activationDocumentMrid,
//                 Buffer.from(JSON.stringify(expectedValue_TSO)),
//             );
//             transactionContext.stub.putPrivateData.getCall(1).should.have.been.calledWithExactly(
//                 collectionDSO,
//                 activationDocumentCompositeKey,
//                 Buffer.from(JSON.stringify(compositeKeyIndexedJSON)),
//             );

//             expect(transactionContext.stub.putPrivateData.callCount).to.equal(2);
//         });

//     });

// ////////////////////////////////////////////////////////////////////////////
// /////////////////////////    UPDATE BY ORDERS     //////////////////////////
// ////////////////////////////////////////////////////////////////////////////
//     describe('Test Update Activation Document by Orders', () => {
//         it('should return ERROR UpdateActivationDocumentByOrders on unknown collection', async () => {
//             transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);

//             const params: STARParameters = await ParametersController.getParameterValues(transactionContext);
//             const collectionMap: Map<string, string[]> = params.values.get(ParametersType.DATA_TARGET);
//             const collectionsProducer: string[] = collectionMap.get(RoleType.Role_Producer) as string[];
//             const collectionProducer: string = collectionsProducer[0];

//             const activationDocument_Producer: ActivationDocument = JSON.parse(JSON.stringify(Values.HTB_ActivationDocument_JustStartDate));
//             activationDocument_Producer.docType = DocType.ACTIVATION_DOCUMENT;
//             activationDocument_Producer.potentialParent = true;
//             activationDocument_Producer.potentialChild = false;

//             transactionContext.stub.getPrivateData.withArgs(collectionProducer,
//                 activationDocument_Producer.activationDocumentMrid).resolves(Buffer.from(JSON.stringify(activationDocument_Producer)));

//             activationDocument_Producer.potentialParent = false;
//             activationDocument_Producer.orderEnd = true;
//             activationDocument_Producer.subOrderList = ['AAA', 'BBB'];

//             const updateOrders: DataReference[] = [];
//             updateOrders.push({docType: DocType.ACTIVATION_DOCUMENT, collection: 'XXX', data: activationDocument_Producer});
//             const updateOrders_str = JSON.stringify(updateOrders);

//             try {
//                 await star.UpdateActivationDocumentByOrders(transactionContext, updateOrders_str);
//             } catch (err) {
//                 // params.logger.info(err.message)
//                 expect(err.message).to.equal(`Error : Activation Document - updateByOrders - Unknown document cannot be Updated ${activationDocument_Producer.activationDocumentMrid}`);
//             }
//         });

//         it('should return ERROR UpdateActivationDocumentByOrders on authorized changes', async () => {
//             transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);

//             const params: STARParameters = await ParametersController.getParameterValues(transactionContext);
//             const collectionMap: Map<string, string[]> = params.values.get(ParametersType.DATA_TARGET);
//             const collectionsProducer: string[] = collectionMap.get(RoleType.Role_Producer) as string[];
//             const collectionProducer: string = collectionsProducer[0];

//             const activationDocument_Producer: ActivationDocument = JSON.parse(JSON.stringify(Values.HTB_ActivationDocument_JustStartDate));

//             const updateOrders: DataReference[] = [];
//             updateOrders.push({docType: DocType.ACTIVATION_DOCUMENT, collection: collectionProducer, data: activationDocument_Producer});
//             const updateOrders_str = JSON.stringify(updateOrders);

//             try {
//                 await star.UpdateActivationDocumentByOrders(transactionContext, updateOrders_str);
//             } catch (err) {
//                 // params.logger.info(err.message)
//                 expect(err.message).to.equal(`Error : Activation Document - updateByOrders - Unknown document cannot be Updated ${activationDocument_Producer.activationDocumentMrid}`);
//             }
//         });

//         it('should return ERROR UpdateActivationDocumentByOrders on authorized changes', async () => {
//             transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);

//             const params: STARParameters = await ParametersController.getParameterValues(transactionContext);
//             const collectionMap: Map<string, string[]> = params.values.get(ParametersType.DATA_TARGET);
//             const collectionsProducer: string[] = collectionMap.get(RoleType.Role_Producer) as string[];
//             const collectionProducer: string = collectionsProducer[0];

//             const activationDocument_Producer: ActivationDocument = JSON.parse(JSON.stringify(Values.HTB_ActivationDocument_JustStartDate));
//             activationDocument_Producer.docType = DocType.ACTIVATION_DOCUMENT;
//             activationDocument_Producer.potentialParent = true;
//             activationDocument_Producer.potentialChild = false;

//             transactionContext.stub.getPrivateData.withArgs(collectionProducer,
//                 activationDocument_Producer.activationDocumentMrid).resolves(Buffer.from(JSON.stringify(activationDocument_Producer)));

//             activationDocument_Producer.businessType = 'new businessType';

//             const updateOrders: DataReference[] = [];
//             updateOrders.push({docType: DocType.ACTIVATION_DOCUMENT, collection: collectionProducer, data: activationDocument_Producer});
//             const updateOrders_str = JSON.stringify(updateOrders);

//             try {
//                 await star.UpdateActivationDocumentByOrders(transactionContext, updateOrders_str);
//             } catch (err) {
//                 // params.logger.info(err.message)
//                 expect(err.message).to.equal(`Error on document ${activationDocument_Producer.activationDocumentMrid} all modified data cannot be updated by orders.`);
//             }
//         });

//         it('should return ERROR UpdateActivationDocumentByOrders on subOrderList', async () => {
//             transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);

//             const params: STARParameters = await ParametersController.getParameterValues(transactionContext);
//             const collectionMap: Map<string, string[]> = params.values.get(ParametersType.DATA_TARGET);
//             const collectionsProducer: string[] = collectionMap.get(RoleType.Role_Producer) as string[];
//             const collectionProducer: string = collectionsProducer[0];

//             const activationDocument_Producer: ActivationDocument = JSON.parse(JSON.stringify(Values.HTB_ActivationDocument_JustStartDate));
//             activationDocument_Producer.docType = DocType.ACTIVATION_DOCUMENT;
//             activationDocument_Producer.potentialParent = true;
//             activationDocument_Producer.potentialChild = false;
//             activationDocument_Producer.subOrderList = ['CCC'];

//             transactionContext.stub.getPrivateData.withArgs(collectionProducer,
//                 activationDocument_Producer.activationDocumentMrid).resolves(Buffer.from(JSON.stringify(activationDocument_Producer)));

//             activationDocument_Producer.potentialParent = false;
//             activationDocument_Producer.orderEnd = true;
//             activationDocument_Producer.subOrderList = ['AAA', 'BBB'];

//             const updateOrders: DataReference[] = [];
//             updateOrders.push({docType: DocType.ACTIVATION_DOCUMENT, collection: collectionProducer, data: activationDocument_Producer});
//             const updateOrders_str = JSON.stringify(updateOrders);

//             try {
//                 await star.UpdateActivationDocumentByOrders(transactionContext, updateOrders_str);
//             } catch (err) {
//                 // params.logger.info(err.message)
//                 expect(err.message).to.equal(`Error on document ${activationDocument_Producer.activationDocumentMrid} ids can only be added to subOrderList.`);
//             }
//         });

//         it('should return SUCCESS UpdateActivationDocumentByOrders', async () => {
//             transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);

//             const params: STARParameters = await ParametersController.getParameterValues(transactionContext);
//             const collectionMap: Map<string, string[]> = params.values.get(ParametersType.DATA_TARGET);
//             const collectionsTSO: string[] = collectionMap.get(RoleType.Role_TSO) as string[];
//             const collectionTSO: string = collectionsTSO[0];
//             const collectionsProducer: string[] = collectionMap.get(RoleType.Role_Producer) as string[];
//             const collectionProducer: string = collectionsProducer[0];

//             const activationDocument_Producer: ActivationDocument = JSON.parse(JSON.stringify(Values.HTB_ActivationDocument_JustStartDate));
//             activationDocument_Producer.docType = DocType.ACTIVATION_DOCUMENT;
//             activationDocument_Producer.potentialParent = true;
//             activationDocument_Producer.potentialChild = false;

//             const activationDocument_TSO: ActivationDocument = JSON.parse(JSON.stringify(Values.HTB_ActivationDocument_HTA_JustStartDate));
//             activationDocument_TSO.docType = DocType.ACTIVATION_DOCUMENT;
//             activationDocument_TSO.potentialParent = true;
//             activationDocument_TSO.potentialChild = false;

//             transactionContext.stub.getPrivateData.withArgs(collectionProducer,
//                 activationDocument_Producer.activationDocumentMrid).resolves(Buffer.from(JSON.stringify(activationDocument_Producer)));
//             transactionContext.stub.getPrivateData.withArgs(collectionTSO,
//                 activationDocument_TSO.activationDocumentMrid).resolves(Buffer.from(JSON.stringify(activationDocument_TSO)));

//             activationDocument_Producer.potentialParent = false;
//             activationDocument_Producer.orderEnd = true;
//             activationDocument_Producer.subOrderList = ['AAA', 'BBB'];
//             activationDocument_TSO.potentialParent = false;
//             activationDocument_TSO.subOrderList = ['111', '222'];

//             const updateOrders: DataReference[] = [];
//             updateOrders.push({docType: DocType.ACTIVATION_DOCUMENT, collection: collectionProducer, data: activationDocument_Producer});
//             updateOrders.push({docType: DocType.ACTIVATION_DOCUMENT, collection: collectionTSO, data: activationDocument_TSO});
//             const updateOrders_str = JSON.stringify(updateOrders);

//             await star.UpdateActivationDocumentByOrders(transactionContext, updateOrders_str);

//             const activationDocumentCompositeKey1 = ActivationCompositeKeyIndexersController.getActivationDocumentCompositeKeyId(JSON.parse(JSON.stringify(activationDocument_Producer)));
//             const activationDocumentCompositeKey2 = ActivationCompositeKeyIndexersController.getActivationDocumentCompositeKeyId(JSON.parse(JSON.stringify(activationDocument_TSO)));

//             const compositeKeyIndex1: ActivationDocumentCompositeKeyAbstract = {
//                 activationDocumentCompositeKey: activationDocumentCompositeKey1,
//                 activationDocumentMrid: activationDocument_Producer.activationDocumentMrid,
//             };
//             const compositeKeyIndex2: ActivationDocumentCompositeKeyAbstract = {
//                 activationDocumentCompositeKey: activationDocumentCompositeKey2,
//                 activationDocumentMrid: activationDocument_TSO.activationDocumentMrid,
//             };

//             const compositeKeyIndexed1:IndexedData = {
//                 docType: DocType.DATA_INDEXER,
//                 indexId:activationDocumentCompositeKey1,
//                 indexedDataAbstractMap: new Map()};
//             compositeKeyIndexed1.indexedDataAbstractMap.set(activationDocumentCompositeKey1, compositeKeyIndex1);

//             const compositeKeyIndexed2:IndexedData = {
//                 docType: DocType.DATA_INDEXER,
//                 indexId:activationDocumentCompositeKey2,
//                 indexedDataAbstractMap: new Map()};
//             compositeKeyIndexed2.indexedDataAbstractMap.set(activationDocumentCompositeKey2, compositeKeyIndex2);

//             const compositeKeyIndexed1JSON = IndexedDataJson.toJson(compositeKeyIndexed1);
//             const compositeKeyIndexed2JSON = IndexedDataJson.toJson(compositeKeyIndexed2);

//             // params.logger.info("-----------")
//             // params.logger.info(transactionContext.stub.putPrivateData.getCall(0).args);
//             // params.logger.info("ooooooooo")
//             // params.logger.info(Buffer.from(transactionContext.stub.putPrivateData.getCall(0).args[2].toString()).toString('utf8'));
//             // params.logger.info(JSON.stringify(activationDocument_Producer))
//             // params.logger.info("-----------")
//             // params.logger.info(transactionContext.stub.putPrivateData.getCall(1).args);
//             // params.logger.info("ooooooooo")
//             // params.logger.info(Buffer.from(transactionContext.stub.putPrivateData.getCall(1).args[2].toString()).toString('utf8'));
//             // params.logger.info(JSON.stringify(compositeKeyIndexed1JSON))
//             // params.logger.info("-----------")
//             // params.logger.info(transactionContext.stub.putPrivateData.getCall(2).args);
//             // params.logger.info("ooooooooo")
//             // params.logger.info(Buffer.from(transactionContext.stub.putPrivateData.getCall(2).args[2].toString()).toString('utf8'));
//             // params.logger.info(JSON.stringify(activationDocument_TSO))
//             // params.logger.info("-----------")
//             // params.logger.info(transactionContext.stub.putPrivateData.getCall(3).args);
//             // params.logger.info("ooooooooo")
//             // params.logger.info(Buffer.from(transactionContext.stub.putPrivateData.getCall(3).args[2].toString()).toString('utf8'));
//             // params.logger.info(JSON.stringify(compositeKeyIndexed2JSON))
//             // params.logger.info("-----------")

//             transactionContext.stub.putPrivateData.getCall(0).should.have.been.calledWithExactly(
//                 collectionProducer,
//                 activationDocument_Producer.activationDocumentMrid,
//                 Buffer.from(JSON.stringify(activationDocument_Producer)),
//             );
//             transactionContext.stub.putPrivateData.getCall(1).should.have.been.calledWithExactly(
//                 collectionProducer,
//                 activationDocumentCompositeKey1,
//                 Buffer.from(JSON.stringify(compositeKeyIndexed1JSON)),
//             );
//             transactionContext.stub.putPrivateData.getCall(2).should.have.been.calledWithExactly(
//                 collectionTSO,
//                 activationDocument_TSO.activationDocumentMrid,
//                 Buffer.from(JSON.stringify(activationDocument_TSO)),
//             );
//             transactionContext.stub.putPrivateData.getCall(3).should.have.been.calledWithExactly(
//                 collectionTSO,
//                 activationDocumentCompositeKey2,
//                 Buffer.from(JSON.stringify(compositeKeyIndexed2JSON)),
//             );

//             expect(transactionContext.stub.putPrivateData.callCount).to.equal(4);
//         });

//     });


// ////////////////////////////////////////////////////////////////////////////
// ////////////////////    UPDATE ACTIVATION DOCUMENT     /////////////////////
// ////////////////////////////////////////////////////////////////////////////
//     describe('Test Update Activation Document HTA ENEDIS', () => {


//         it('should return ERROR updateActivationDocument HTA - systemOperator', async () => {
//             transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);

//             const params: STARParameters = await ParametersController.getParameterValues(transactionContext);

//             const activationDocument: ActivationDocument = JSON.parse(JSON.stringify(Values.HTA_ActivationDocument_Valid));
//             activationDocument.orderEnd = true;
//             activationDocument.receiverRole = RoleType.Role_Producer;
//             activationDocument.potentialParent = false;
//             activationDocument.potentialChild = true;
//             activationDocument.eligibilityStatus = EligibilityStatusType.EligibilityAccepted;
//             activationDocument.eligibilityStatusEditable = false;
//             activationDocument.reconciliationStatus = ReconciliationStatus.MISS;
//             activationDocument.docType = DocType.ACTIVATION_DOCUMENT;

//             transactionContext.stub.getPrivateData.withArgs('enedis-producer-rte', activationDocument.activationDocumentMrid).resolves(Buffer.from(JSON.stringify(activationDocument)));


//             const feedbackProducer: FeedbackProducer = {
//                 docType: DocType.FEEDBACK_PRODUCER,
//                 feedbackProducerMrid: FeedbackProducerController.getFeedbackProducerMrid(params, activationDocument.activationDocumentMrid),
//                 activationDocumentMrid: activationDocument.activationDocumentMrid,
//                 messageType: "B30",
//                 processType: "A42",
//                 revisionNumber: "0",
//                 indeminityStatus: IndeminityStatus.IN_PROGRESS,
//                 receiverMarketParticipantMrid: activationDocument.receiverMarketParticipantMrid,
//                 senderMarketParticipantMrid: activationDocument.senderMarketParticipantMrid,
//                 createdDateTime: activationDocument.startCreatedDateTime,
//             }

//             transactionContext.stub.getPrivateData.withArgs('enedis-producer-rte', feedbackProducer.feedbackProducerMrid).resolves(Buffer.from(JSON.stringify(feedbackProducer)));

//             transactionContext.stub.getState.withArgs(Values.HTA_Producer.producerMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_Producer)));

//             transactionContext.stub.getPrivateData.withArgs('enedis-producer-rte', Values.HTA_site_valid.meteringPointMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_site_valid)));


//             const newActivationDocument: ActivationDocument = JSON.parse(JSON.stringify(activationDocument));

//             newActivationDocument.originAutomationRegisteredResourceMrid = Values.HTA_yellowPage2.originAutomationRegisteredResourceMrid;
//             // newActivationDocument.registeredResourceMrid = Values.HTA_site_valid_ProdA.meteringPointMrid;
//             // newActivationDocument.measurementUnitName = 'MW';
//             // newActivationDocument.orderEnd = false;
//             //newActivationDocument.orderValue = 'X';
//             newActivationDocument.startCreatedDateTime = CommonService.increaseDateDaysStr(activationDocument.startCreatedDateTime as string, 10),
//             newActivationDocument.endCreatedDateTime = CommonService.increaseDateDaysStr(activationDocument.startCreatedDateTime as string, 11),
//             newActivationDocument.reasonCode = 'XXX';
//             // newActivationDocument.senderMarketParticipantMrid = Values.HTA_systemoperator2.systemOperatorMarketParticipantMrid;
//             newActivationDocument.senderRole = 'NoSenderRole';
//             // newActivationDocument.receiverMarketParticipantMrid = Values.HTA_Producer2.producerMarketParticipantMrid;
//             newActivationDocument.receiverRole = 'NoReceiverRole';
//             newActivationDocument.potentialParent = true;
//             newActivationDocument.potentialChild = false;
//             newActivationDocument.instance = 'Noinstance';
//             // newActivationDocument.subOrderList = [Values.HTB_ActivationDocument_Valid.activationDocumentMrid];
//             newActivationDocument.eligibilityStatus =  EligibilityStatusType.FREligibilityPending;
//             newActivationDocument.eligibilityStatusEditable = true;
//             newActivationDocument.reconciliationStatus =  ReconciliationStatus.TOTAL;

//             try {
//                 await star.UpdateActivationDocument(transactionContext, JSON.stringify(newActivationDocument));
//             } catch (err) {
//                 // params.logger.info(err.message)
//                 expect(err.message).to.equal(`ERROR updateActivationDocument : systemOperator : ${Values.HTA_systemoperator.systemOperatorMarketParticipantMrid} does not exist for Activation Document ${newActivationDocument.activationDocumentMrid} update.`);
//             }
//         });






//         it('should return ERROR updateActivationDocument HTA - Organization', async () => {
//             transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);

//             const params: STARParameters = await ParametersController.getParameterValues(transactionContext);

//             const activationDocument: ActivationDocument = JSON.parse(JSON.stringify(Values.HTA_ActivationDocument_Valid));
//             activationDocument.orderEnd = true;
//             activationDocument.receiverRole = RoleType.Role_Producer;
//             activationDocument.potentialParent = false;
//             activationDocument.potentialChild = true;
//             activationDocument.eligibilityStatus = EligibilityStatusType.EligibilityAccepted;
//             activationDocument.eligibilityStatusEditable = false;
//             activationDocument.reconciliationStatus = ReconciliationStatus.MISS;
//             activationDocument.docType = DocType.ACTIVATION_DOCUMENT;

//             transactionContext.stub.getPrivateData.withArgs('enedis-producer-rte', activationDocument.activationDocumentMrid).resolves(Buffer.from(JSON.stringify(activationDocument)));


//             const feedbackProducer: FeedbackProducer = {
//                 docType: DocType.FEEDBACK_PRODUCER,
//                 feedbackProducerMrid: FeedbackProducerController.getFeedbackProducerMrid(params, activationDocument.activationDocumentMrid),
//                 activationDocumentMrid: activationDocument.activationDocumentMrid,
//                 messageType: "B30",
//                 processType: "A42",
//                 revisionNumber: "0",
//                 indeminityStatus: IndeminityStatus.IN_PROGRESS,
//                 receiverMarketParticipantMrid: activationDocument.receiverMarketParticipantMrid,
//                 senderMarketParticipantMrid: activationDocument.senderMarketParticipantMrid,
//                 createdDateTime: activationDocument.startCreatedDateTime,
//             }

//             transactionContext.stub.getPrivateData.withArgs('enedis-producer-rte', feedbackProducer.feedbackProducerMrid).resolves(Buffer.from(JSON.stringify(feedbackProducer)));

//             transactionContext.stub.getState.withArgs(Values.HTA_systemoperator.systemOperatorMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_systemoperator)));
//             transactionContext.stub.getState.withArgs(Values.HTA_Producer.producerMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_Producer)));

//             transactionContext.stub.getPrivateData.withArgs('enedis-producer-rte', Values.HTA_site_valid.meteringPointMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_site_valid)));


//             const newActivationDocument: ActivationDocument = JSON.parse(JSON.stringify(activationDocument));

//             newActivationDocument.originAutomationRegisteredResourceMrid = Values.HTA_yellowPage2.originAutomationRegisteredResourceMrid;
//             // newActivationDocument.registeredResourceMrid = Values.HTA_site_valid_ProdA.meteringPointMrid;
//             // newActivationDocument.measurementUnitName = 'MW';
//             // newActivationDocument.orderEnd = false;
//             //newActivationDocument.orderValue = 'X';
//             newActivationDocument.startCreatedDateTime = CommonService.increaseDateDaysStr(activationDocument.startCreatedDateTime as string, 10),
//             newActivationDocument.endCreatedDateTime = CommonService.increaseDateDaysStr(activationDocument.startCreatedDateTime as string, 11),
//             newActivationDocument.reasonCode = 'XXX';
//             // newActivationDocument.senderMarketParticipantMrid = Values.HTA_systemoperator2.systemOperatorMarketParticipantMrid;
//             newActivationDocument.senderRole = 'NoSenderRole';
//             // newActivationDocument.receiverMarketParticipantMrid = Values.HTA_Producer2.producerMarketParticipantMrid;
//             newActivationDocument.receiverRole = 'NoReceiverRole';
//             newActivationDocument.potentialParent = true;
//             newActivationDocument.potentialChild = false;
//             newActivationDocument.instance = 'Noinstance';
//             // newActivationDocument.subOrderList = [Values.HTB_ActivationDocument_Valid.activationDocumentMrid];
//             newActivationDocument.eligibilityStatus =  EligibilityStatusType.FREligibilityPending;
//             newActivationDocument.eligibilityStatusEditable = true;
//             newActivationDocument.reconciliationStatus =  ReconciliationStatus.TOTAL;

//             try {
//                 transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);
//                 await star.UpdateActivationDocument(transactionContext, JSON.stringify(newActivationDocument));
//             } catch (err) {
//                 // params.logger.info(err.message)
//                 expect(err.message).to.equal(`Organisation, ${OrganizationTypeMsp.RTE} cannot update Activation Document for sender ${Values.HTA_systemoperator.systemOperatorMarketParticipantName}`);
//             }
//         });


//         it('should return ERROR updateActivationDocument HTA - receiverMarketParticipantMrid', async () => {
//             transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);

//             const params: STARParameters = await ParametersController.getParameterValues(transactionContext);

//             const activationDocument: ActivationDocument = JSON.parse(JSON.stringify(Values.HTA_ActivationDocument_Valid));
//             activationDocument.orderEnd = true;
//             activationDocument.receiverRole = RoleType.Role_Producer;
//             activationDocument.potentialParent = false;
//             activationDocument.potentialChild = true;
//             activationDocument.eligibilityStatus = EligibilityStatusType.EligibilityAccepted;
//             activationDocument.eligibilityStatusEditable = false;
//             activationDocument.reconciliationStatus = ReconciliationStatus.MISS;
//             activationDocument.docType = DocType.ACTIVATION_DOCUMENT;

//             transactionContext.stub.getPrivateData.withArgs('enedis-producer-rte', activationDocument.activationDocumentMrid).resolves(Buffer.from(JSON.stringify(activationDocument)));


//             const feedbackProducer: FeedbackProducer = {
//                 docType: DocType.FEEDBACK_PRODUCER,
//                 feedbackProducerMrid: FeedbackProducerController.getFeedbackProducerMrid(params, activationDocument.activationDocumentMrid),
//                 activationDocumentMrid: activationDocument.activationDocumentMrid,
//                 messageType: "B30",
//                 processType: "A42",
//                 revisionNumber: "0",
//                 indeminityStatus: IndeminityStatus.IN_PROGRESS,
//                 receiverMarketParticipantMrid: activationDocument.receiverMarketParticipantMrid,
//                 senderMarketParticipantMrid: activationDocument.senderMarketParticipantMrid,
//                 createdDateTime: activationDocument.startCreatedDateTime,
//             }

//             transactionContext.stub.getPrivateData.withArgs('enedis-producer-rte', feedbackProducer.feedbackProducerMrid).resolves(Buffer.from(JSON.stringify(feedbackProducer)));

//             transactionContext.stub.getState.withArgs(Values.HTA_systemoperator.systemOperatorMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_systemoperator)));
//             transactionContext.stub.getState.withArgs(Values.HTA_Producer.producerMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_Producer)));

//             transactionContext.stub.getPrivateData.withArgs('enedis-producer-rte', Values.HTA_site_valid.meteringPointMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_site_valid)));


//             const newActivationDocument: ActivationDocument = JSON.parse(JSON.stringify(activationDocument));

//             newActivationDocument.originAutomationRegisteredResourceMrid = Values.HTA_yellowPage2.originAutomationRegisteredResourceMrid;
//             // newActivationDocument.registeredResourceMrid = Values.HTA_site_valid_ProdA.meteringPointMrid;
//             // newActivationDocument.measurementUnitName = 'MW';
//             // newActivationDocument.orderEnd = false;
//             //newActivationDocument.orderValue = 'X';
//             newActivationDocument.startCreatedDateTime = CommonService.increaseDateDaysStr(activationDocument.startCreatedDateTime as string, 10),
//             newActivationDocument.endCreatedDateTime = CommonService.increaseDateDaysStr(activationDocument.startCreatedDateTime as string, 11),
//             newActivationDocument.reasonCode = 'XXX';
//             // newActivationDocument.senderMarketParticipantMrid = Values.HTA_systemoperator2.systemOperatorMarketParticipantMrid;
//             newActivationDocument.senderRole = 'NoSenderRole';
//             newActivationDocument.receiverMarketParticipantMrid = Values.HTA_Producer2.producerMarketParticipantMrid;
//             newActivationDocument.receiverRole = 'NoReceiverRole';
//             newActivationDocument.potentialParent = true;
//             newActivationDocument.potentialChild = false;
//             newActivationDocument.instance = 'Noinstance';
//             // newActivationDocument.subOrderList = [Values.HTB_ActivationDocument_Valid.activationDocumentMrid];
//             newActivationDocument.eligibilityStatus =  EligibilityStatusType.FREligibilityPending;
//             newActivationDocument.eligibilityStatusEditable = true;
//             newActivationDocument.reconciliationStatus =  ReconciliationStatus.TOTAL;

//             try {
//                 await star.UpdateActivationDocument(transactionContext, JSON.stringify(newActivationDocument));
//             } catch (err) {
//                 // params.logger.info(err.message)
//                 expect(err.message).to.equal(`ERROR updateActivationDocument : receiverMarketParticipantMrid cannot be changed for Activation Document ${newActivationDocument.activationDocumentMrid} update.`);
//             }
//         });




//         it('should return ERROR updateActivationDocument HTA - senderMarketParticipantMrid', async () => {
//             transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);

//             const params: STARParameters = await ParametersController.getParameterValues(transactionContext);

//             const activationDocument: ActivationDocument = JSON.parse(JSON.stringify(Values.HTA_ActivationDocument_Valid));
//             activationDocument.orderEnd = true;
//             activationDocument.receiverRole = RoleType.Role_Producer;
//             activationDocument.potentialParent = false;
//             activationDocument.potentialChild = true;
//             activationDocument.eligibilityStatus = EligibilityStatusType.EligibilityAccepted;
//             activationDocument.eligibilityStatusEditable = false;
//             activationDocument.reconciliationStatus = ReconciliationStatus.MISS;
//             activationDocument.docType = DocType.ACTIVATION_DOCUMENT;

//             transactionContext.stub.getPrivateData.withArgs('enedis-producer-rte', activationDocument.activationDocumentMrid).resolves(Buffer.from(JSON.stringify(activationDocument)));


//             const feedbackProducer: FeedbackProducer = {
//                 docType: DocType.FEEDBACK_PRODUCER,
//                 feedbackProducerMrid: FeedbackProducerController.getFeedbackProducerMrid(params, activationDocument.activationDocumentMrid),
//                 activationDocumentMrid: activationDocument.activationDocumentMrid,
//                 messageType: "B30",
//                 processType: "A42",
//                 revisionNumber: "0",
//                 indeminityStatus: IndeminityStatus.IN_PROGRESS,
//                 receiverMarketParticipantMrid: activationDocument.receiverMarketParticipantMrid,
//                 senderMarketParticipantMrid: activationDocument.senderMarketParticipantMrid,
//                 createdDateTime: activationDocument.startCreatedDateTime,
//             }

//             transactionContext.stub.getPrivateData.withArgs('enedis-producer-rte', feedbackProducer.feedbackProducerMrid).resolves(Buffer.from(JSON.stringify(feedbackProducer)));

//             transactionContext.stub.getState.withArgs(Values.HTA_systemoperator.systemOperatorMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_systemoperator)));
//             transactionContext.stub.getState.withArgs(Values.HTA_Producer.producerMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_Producer)));

//             transactionContext.stub.getPrivateData.withArgs('enedis-producer-rte', Values.HTA_site_valid.meteringPointMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_site_valid)));


//             const newActivationDocument: ActivationDocument = JSON.parse(JSON.stringify(activationDocument));

//             newActivationDocument.originAutomationRegisteredResourceMrid = Values.HTA_yellowPage2.originAutomationRegisteredResourceMrid;
//             // newActivationDocument.registeredResourceMrid = Values.HTA_site_valid_ProdA.meteringPointMrid;
//             // newActivationDocument.measurementUnitName = 'MW';
//             // newActivationDocument.orderEnd = false;
//             //newActivationDocument.orderValue = 'X';
//             newActivationDocument.startCreatedDateTime = CommonService.increaseDateDaysStr(activationDocument.startCreatedDateTime as string, 10),
//             newActivationDocument.endCreatedDateTime = CommonService.increaseDateDaysStr(activationDocument.startCreatedDateTime as string, 11),
//             newActivationDocument.reasonCode = 'XXX';
//             newActivationDocument.senderMarketParticipantMrid = Values.HTA_systemoperator2.systemOperatorMarketParticipantMrid;
//             newActivationDocument.senderRole = 'NoSenderRole';
//             //newActivationDocument.receiverMarketParticipantMrid = Values.HTA_Producer2.producerMarketParticipantMrid;
//             newActivationDocument.receiverRole = 'NoReceiverRole';
//             newActivationDocument.potentialParent = true;
//             newActivationDocument.potentialChild = false;
//             newActivationDocument.instance = 'Noinstance';
//             // newActivationDocument.subOrderList = [Values.HTB_ActivationDocument_Valid.activationDocumentMrid];
//             newActivationDocument.eligibilityStatus =  EligibilityStatusType.FREligibilityPending;
//             newActivationDocument.eligibilityStatusEditable = true;
//             newActivationDocument.reconciliationStatus =  ReconciliationStatus.TOTAL;

//             try {
//                 await star.UpdateActivationDocument(transactionContext, JSON.stringify(newActivationDocument));
//             } catch (err) {
//                 // params.logger.info(err.message)
//                 expect(err.message).to.equal(`ERROR updateActivationDocument : senderMarketParticipantMrid cannot be changed for Activation Document ${newActivationDocument.activationDocumentMrid} update.`);
//             }
//         });






//         it('should return ERROR updateActivationDocument HTA - registeredResourceMrid', async () => {
//             transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);

//             const params: STARParameters = await ParametersController.getParameterValues(transactionContext);

//             const activationDocument: ActivationDocument = JSON.parse(JSON.stringify(Values.HTA_ActivationDocument_Valid));
//             activationDocument.orderEnd = true;
//             activationDocument.receiverRole = RoleType.Role_Producer;
//             activationDocument.potentialParent = false;
//             activationDocument.potentialChild = true;
//             activationDocument.eligibilityStatus = EligibilityStatusType.EligibilityAccepted;
//             activationDocument.eligibilityStatusEditable = false;
//             activationDocument.reconciliationStatus = ReconciliationStatus.MISS;
//             activationDocument.docType = DocType.ACTIVATION_DOCUMENT;

//             transactionContext.stub.getPrivateData.withArgs('enedis-producer-rte', activationDocument.activationDocumentMrid).resolves(Buffer.from(JSON.stringify(activationDocument)));


//             const feedbackProducer: FeedbackProducer = {
//                 docType: DocType.FEEDBACK_PRODUCER,
//                 feedbackProducerMrid: FeedbackProducerController.getFeedbackProducerMrid(params, activationDocument.activationDocumentMrid),
//                 activationDocumentMrid: activationDocument.activationDocumentMrid,
//                 messageType: "B30",
//                 processType: "A42",
//                 revisionNumber: "0",
//                 indeminityStatus: IndeminityStatus.IN_PROGRESS,
//                 receiverMarketParticipantMrid: activationDocument.receiverMarketParticipantMrid,
//                 senderMarketParticipantMrid: activationDocument.senderMarketParticipantMrid,
//                 createdDateTime: activationDocument.startCreatedDateTime,
//             }

//             transactionContext.stub.getPrivateData.withArgs('enedis-producer-rte', feedbackProducer.feedbackProducerMrid).resolves(Buffer.from(JSON.stringify(feedbackProducer)));

//             transactionContext.stub.getState.withArgs(Values.HTA_systemoperator.systemOperatorMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_systemoperator)));
//             transactionContext.stub.getState.withArgs(Values.HTA_Producer.producerMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_Producer)));

//             transactionContext.stub.getPrivateData.withArgs('enedis-producer-rte', Values.HTA_site_valid.meteringPointMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_site_valid)));


//             const newActivationDocument: ActivationDocument = JSON.parse(JSON.stringify(activationDocument));

//             newActivationDocument.originAutomationRegisteredResourceMrid = Values.HTA_yellowPage2.originAutomationRegisteredResourceMrid;
//             newActivationDocument.registeredResourceMrid = Values.HTA_site_valid_ProdA.meteringPointMrid;
//             // newActivationDocument.measurementUnitName = 'MW';
//             // newActivationDocument.orderEnd = false;
//             //newActivationDocument.orderValue = 'X';
//             newActivationDocument.startCreatedDateTime = CommonService.increaseDateDaysStr(activationDocument.startCreatedDateTime as string, 10),
//             newActivationDocument.endCreatedDateTime = CommonService.increaseDateDaysStr(activationDocument.startCreatedDateTime as string, 11),
//             newActivationDocument.reasonCode = 'XXX';
//             // newActivationDocument.senderMarketParticipantMrid = Values.HTA_systemoperator2.systemOperatorMarketParticipantMrid;
//             newActivationDocument.senderRole = 'NoSenderRole';
//             // newActivationDocument.receiverMarketParticipantMrid = Values.HTA_Producer2.producerMarketParticipantMrid;
//             newActivationDocument.receiverRole = 'NoReceiverRole';
//             newActivationDocument.potentialParent = true;
//             newActivationDocument.potentialChild = false;
//             newActivationDocument.instance = 'Noinstance';
//             // newActivationDocument.subOrderList = [Values.HTB_ActivationDocument_Valid.activationDocumentMrid];
//             newActivationDocument.eligibilityStatus =  EligibilityStatusType.FREligibilityPending;
//             newActivationDocument.eligibilityStatusEditable = true;
//             newActivationDocument.reconciliationStatus =  ReconciliationStatus.TOTAL;

//             try {
//                 await star.UpdateActivationDocument(transactionContext, JSON.stringify(newActivationDocument));
//             } catch (err) {
//                 // params.logger.info(err.message)
//                 expect(err.message).to.equal(`ERROR updateActivationDocument : registeredResourceMrid cannot be changed for Activation Document ${newActivationDocument.activationDocumentMrid} update.`);
//             }
//         });


//         it('should return ERROR updateActivationDocument HTA - orderValue', async () => {
//             transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);

//             const params: STARParameters = await ParametersController.getParameterValues(transactionContext);

//             const activationDocument: ActivationDocument = JSON.parse(JSON.stringify(Values.HTA_ActivationDocument_Valid));
//             activationDocument.orderEnd = true;
//             activationDocument.receiverRole = RoleType.Role_Producer;
//             activationDocument.potentialParent = false;
//             activationDocument.potentialChild = true;
//             activationDocument.eligibilityStatus = EligibilityStatusType.EligibilityAccepted;
//             activationDocument.eligibilityStatusEditable = false;
//             activationDocument.reconciliationStatus = ReconciliationStatus.MISS;
//             activationDocument.docType = DocType.ACTIVATION_DOCUMENT;

//             transactionContext.stub.getPrivateData.withArgs('enedis-producer-rte', activationDocument.activationDocumentMrid).resolves(Buffer.from(JSON.stringify(activationDocument)));


//             const feedbackProducer: FeedbackProducer = {
//                 docType: DocType.FEEDBACK_PRODUCER,
//                 feedbackProducerMrid: FeedbackProducerController.getFeedbackProducerMrid(params, activationDocument.activationDocumentMrid),
//                 activationDocumentMrid: activationDocument.activationDocumentMrid,
//                 messageType: "B30",
//                 processType: "A42",
//                 revisionNumber: "0",
//                 indeminityStatus: IndeminityStatus.IN_PROGRESS,
//                 receiverMarketParticipantMrid: activationDocument.receiverMarketParticipantMrid,
//                 senderMarketParticipantMrid: activationDocument.senderMarketParticipantMrid,
//                 createdDateTime: activationDocument.startCreatedDateTime,
//             }

//             transactionContext.stub.getPrivateData.withArgs('enedis-producer-rte', feedbackProducer.feedbackProducerMrid).resolves(Buffer.from(JSON.stringify(feedbackProducer)));

//             transactionContext.stub.getState.withArgs(Values.HTA_systemoperator.systemOperatorMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_systemoperator)));
//             transactionContext.stub.getState.withArgs(Values.HTA_Producer.producerMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_Producer)));

//             transactionContext.stub.getPrivateData.withArgs('enedis-producer-rte', Values.HTA_site_valid.meteringPointMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_site_valid)));


//             const newActivationDocument: ActivationDocument = JSON.parse(JSON.stringify(activationDocument));

//             newActivationDocument.originAutomationRegisteredResourceMrid = Values.HTA_yellowPage2.originAutomationRegisteredResourceMrid;
//             // newActivationDocument.registeredResourceMrid = Values.HTA_site_valid_ProdA.meteringPointMrid;
//             // newActivationDocument.measurementUnitName = 'MW';
//             // newActivationDocument.orderEnd = false;
//             newActivationDocument.orderValue = 'X';
//             newActivationDocument.startCreatedDateTime = CommonService.increaseDateDaysStr(activationDocument.startCreatedDateTime as string, 10),
//             newActivationDocument.endCreatedDateTime = CommonService.increaseDateDaysStr(activationDocument.startCreatedDateTime as string, 11),
//             newActivationDocument.reasonCode = 'XXX';
//             // newActivationDocument.senderMarketParticipantMrid = Values.HTA_systemoperator2.systemOperatorMarketParticipantMrid;
//             newActivationDocument.senderRole = 'NoSenderRole';
//             // newActivationDocument.receiverMarketParticipantMrid = Values.HTA_Producer2.producerMarketParticipantMrid;
//             newActivationDocument.receiverRole = 'NoReceiverRole';
//             newActivationDocument.potentialParent = true;
//             newActivationDocument.potentialChild = false;
//             newActivationDocument.instance = 'Noinstance';
//             // newActivationDocument.subOrderList = [Values.HTB_ActivationDocument_Valid.activationDocumentMrid];
//             newActivationDocument.eligibilityStatus =  EligibilityStatusType.FREligibilityPending;
//             newActivationDocument.eligibilityStatusEditable = true;
//             newActivationDocument.reconciliationStatus =  ReconciliationStatus.TOTAL;

//             try {
//                 await star.UpdateActivationDocument(transactionContext, JSON.stringify(newActivationDocument));
//             } catch (err) {
//                 // params.logger.info(err.message)
//                 expect(err.message).to.equal(`ERROR updateActivationDocument : orderValue cannot be changed for Activation Document ${newActivationDocument.activationDocumentMrid} update.`);
//             }
//         });



//         it('should return ERROR updateActivationDocument HTA - measurementUnitName', async () => {
//             transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);

//             const params: STARParameters = await ParametersController.getParameterValues(transactionContext);

//             const activationDocument: ActivationDocument = JSON.parse(JSON.stringify(Values.HTA_ActivationDocument_Valid));
//             activationDocument.orderEnd = true;
//             activationDocument.receiverRole = RoleType.Role_Producer;
//             activationDocument.potentialParent = false;
//             activationDocument.potentialChild = true;
//             activationDocument.eligibilityStatus = EligibilityStatusType.EligibilityAccepted;
//             activationDocument.eligibilityStatusEditable = false;
//             activationDocument.reconciliationStatus = ReconciliationStatus.MISS;
//             activationDocument.docType = DocType.ACTIVATION_DOCUMENT;

//             transactionContext.stub.getPrivateData.withArgs('enedis-producer-rte', activationDocument.activationDocumentMrid).resolves(Buffer.from(JSON.stringify(activationDocument)));


//             const feedbackProducer: FeedbackProducer = {
//                 docType: DocType.FEEDBACK_PRODUCER,
//                 feedbackProducerMrid: FeedbackProducerController.getFeedbackProducerMrid(params, activationDocument.activationDocumentMrid),
//                 activationDocumentMrid: activationDocument.activationDocumentMrid,
//                 messageType: "B30",
//                 processType: "A42",
//                 revisionNumber: "0",
//                 indeminityStatus: IndeminityStatus.IN_PROGRESS,
//                 receiverMarketParticipantMrid: activationDocument.receiverMarketParticipantMrid,
//                 senderMarketParticipantMrid: activationDocument.senderMarketParticipantMrid,
//                 createdDateTime: activationDocument.startCreatedDateTime,
//             }

//             transactionContext.stub.getPrivateData.withArgs('enedis-producer-rte', feedbackProducer.feedbackProducerMrid).resolves(Buffer.from(JSON.stringify(feedbackProducer)));

//             transactionContext.stub.getState.withArgs(Values.HTA_systemoperator.systemOperatorMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_systemoperator)));
//             transactionContext.stub.getState.withArgs(Values.HTA_Producer.producerMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_Producer)));

//             transactionContext.stub.getPrivateData.withArgs('enedis-producer-rte', Values.HTA_site_valid.meteringPointMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_site_valid)));


//             const newActivationDocument: ActivationDocument = JSON.parse(JSON.stringify(activationDocument));

//             newActivationDocument.originAutomationRegisteredResourceMrid = Values.HTA_yellowPage2.originAutomationRegisteredResourceMrid;
//             // newActivationDocument.registeredResourceMrid = Values.HTA_site_valid_ProdA.meteringPointMrid;
//             newActivationDocument.measurementUnitName = 'MW';
//             // newActivationDocument.orderEnd = false;
//             // newActivationDocument.orderValue = 'X';
//             newActivationDocument.startCreatedDateTime = CommonService.increaseDateDaysStr(activationDocument.startCreatedDateTime as string, 10),
//             newActivationDocument.endCreatedDateTime = CommonService.increaseDateDaysStr(activationDocument.startCreatedDateTime as string, 11),
//             newActivationDocument.reasonCode = 'XXX';
//             // newActivationDocument.senderMarketParticipantMrid = Values.HTA_systemoperator2.systemOperatorMarketParticipantMrid;
//             newActivationDocument.senderRole = 'NoSenderRole';
//             // newActivationDocument.receiverMarketParticipantMrid = Values.HTA_Producer2.producerMarketParticipantMrid;
//             newActivationDocument.receiverRole = 'NoReceiverRole';
//             newActivationDocument.potentialParent = true;
//             newActivationDocument.potentialChild = false;
//             newActivationDocument.instance = 'Noinstance';
//             // newActivationDocument.subOrderList = [Values.HTB_ActivationDocument_Valid.activationDocumentMrid];
//             newActivationDocument.eligibilityStatus =  EligibilityStatusType.FREligibilityPending;
//             newActivationDocument.eligibilityStatusEditable = true;
//             newActivationDocument.reconciliationStatus =  ReconciliationStatus.TOTAL;

//             try {
//                 await star.UpdateActivationDocument(transactionContext, JSON.stringify(newActivationDocument));
//             } catch (err) {
//                 // params.logger.info(err.message)
//                 expect(err.message).to.equal(`ERROR updateActivationDocument : measurementUnitName cannot be changed for Activation Document ${newActivationDocument.activationDocumentMrid} update.`);
//             }
//         });



//         it('should return ERROR updateActivationDocument HTA - already reconciliated', async () => {
//             transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);

//             const params: STARParameters = await ParametersController.getParameterValues(transactionContext);

//             const activationDocument: ActivationDocument = JSON.parse(JSON.stringify(Values.HTA_ActivationDocument_Valid));
//             activationDocument.orderEnd = true;
//             activationDocument.receiverRole = RoleType.Role_Producer;
//             activationDocument.potentialParent = false;
//             activationDocument.potentialChild = true;
//             activationDocument.eligibilityStatus = EligibilityStatusType.EligibilityAccepted;
//             activationDocument.eligibilityStatusEditable = false;
//             activationDocument.reconciliationStatus = ReconciliationStatus.MISS;
//             activationDocument.docType = DocType.ACTIVATION_DOCUMENT;
//             activationDocument.subOrderList = ["XXX"];

//             transactionContext.stub.getPrivateData.withArgs('enedis-producer-rte', activationDocument.activationDocumentMrid).resolves(Buffer.from(JSON.stringify(activationDocument)));


//             const feedbackProducer: FeedbackProducer = {
//                 docType: DocType.FEEDBACK_PRODUCER,
//                 feedbackProducerMrid: FeedbackProducerController.getFeedbackProducerMrid(params, activationDocument.activationDocumentMrid),
//                 activationDocumentMrid: activationDocument.activationDocumentMrid,
//                 messageType: "B30",
//                 processType: "A42",
//                 revisionNumber: "0",
//                 indeminityStatus: IndeminityStatus.IN_PROGRESS,
//                 receiverMarketParticipantMrid: activationDocument.receiverMarketParticipantMrid,
//                 senderMarketParticipantMrid: activationDocument.senderMarketParticipantMrid,
//                 createdDateTime: activationDocument.startCreatedDateTime,
//             }

//             transactionContext.stub.getPrivateData.withArgs('enedis-producer-rte', feedbackProducer.feedbackProducerMrid).resolves(Buffer.from(JSON.stringify(feedbackProducer)));

//             transactionContext.stub.getState.withArgs(Values.HTA_systemoperator.systemOperatorMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_systemoperator)));
//             transactionContext.stub.getState.withArgs(Values.HTA_Producer.producerMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_Producer)));

//             transactionContext.stub.getPrivateData.withArgs('enedis-producer-rte', Values.HTA_site_valid.meteringPointMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_site_valid)));


//             const newActivationDocument: ActivationDocument = JSON.parse(JSON.stringify(activationDocument));

//             newActivationDocument.originAutomationRegisteredResourceMrid = Values.HTA_yellowPage2.originAutomationRegisteredResourceMrid;
//             // newActivationDocument.registeredResourceMrid = Values.HTA_site_valid_ProdA.meteringPointMrid;
//             // newActivationDocument.measurementUnitName = 'MW'
//             // newActivationDocument.orderEnd = false;
//             // newActivationDocument.orderValue = 'X';
//             newActivationDocument.startCreatedDateTime = CommonService.increaseDateDaysStr(activationDocument.startCreatedDateTime as string, 10),
//             newActivationDocument.endCreatedDateTime = CommonService.increaseDateDaysStr(activationDocument.startCreatedDateTime as string, 11),
//             newActivationDocument.reasonCode = 'XXX';
//             // newActivationDocument.senderMarketParticipantMrid = Values.HTA_systemoperator2.systemOperatorMarketParticipantMrid;
//             newActivationDocument.senderRole = 'NoSenderRole';
//             // newActivationDocument.receiverMarketParticipantMrid = Values.HTA_Producer2.producerMarketParticipantMrid;
//             newActivationDocument.receiverRole = 'NoReceiverRole';
//             newActivationDocument.potentialParent = true;
//             newActivationDocument.potentialChild = false;
//             newActivationDocument.instance = 'Noinstance';
//             // newActivationDocument.subOrderList = [Values.HTB_ActivationDocument_Valid.activationDocumentMrid];
//             newActivationDocument.eligibilityStatus =  EligibilityStatusType.FREligibilityPending;
//             newActivationDocument.eligibilityStatusEditable = true;
//             newActivationDocument.reconciliationStatus =  ReconciliationStatus.TOTAL;

//             try {
//                 await star.UpdateActivationDocument(transactionContext, JSON.stringify(newActivationDocument));
//             } catch (err) {
//                 // params.logger.info(err.message)
//                 expect(err.message).to.equal(`ERROR updateActivationDocument : Activation Document ${newActivationDocument.activationDocumentMrid} is already reconciliate and cannot not be updated.`);
//             }
//         });



//         it('should return ERROR updateActivationDocument HTA - fill suborder', async () => {
//             transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);

//             const params: STARParameters = await ParametersController.getParameterValues(transactionContext);

//             const activationDocument: ActivationDocument = JSON.parse(JSON.stringify(Values.HTA_ActivationDocument_Valid));
//             activationDocument.orderEnd = true;
//             activationDocument.receiverRole = RoleType.Role_Producer;
//             activationDocument.potentialParent = false;
//             activationDocument.potentialChild = true;
//             activationDocument.eligibilityStatus = EligibilityStatusType.EligibilityAccepted;
//             activationDocument.eligibilityStatusEditable = false;
//             activationDocument.reconciliationStatus = ReconciliationStatus.MISS;
//             activationDocument.docType = DocType.ACTIVATION_DOCUMENT;

//             transactionContext.stub.getPrivateData.withArgs('enedis-producer-rte', activationDocument.activationDocumentMrid).resolves(Buffer.from(JSON.stringify(activationDocument)));


//             const feedbackProducer: FeedbackProducer = {
//                 docType: DocType.FEEDBACK_PRODUCER,
//                 feedbackProducerMrid: FeedbackProducerController.getFeedbackProducerMrid(params, activationDocument.activationDocumentMrid),
//                 activationDocumentMrid: activationDocument.activationDocumentMrid,
//                 messageType: "B30",
//                 processType: "A42",
//                 revisionNumber: "0",
//                 indeminityStatus: IndeminityStatus.IN_PROGRESS,
//                 receiverMarketParticipantMrid: activationDocument.receiverMarketParticipantMrid,
//                 senderMarketParticipantMrid: activationDocument.senderMarketParticipantMrid,
//                 createdDateTime: activationDocument.startCreatedDateTime,
//             }

//             transactionContext.stub.getPrivateData.withArgs('enedis-producer-rte', feedbackProducer.feedbackProducerMrid).resolves(Buffer.from(JSON.stringify(feedbackProducer)));

//             transactionContext.stub.getState.withArgs(Values.HTA_systemoperator.systemOperatorMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_systemoperator)));
//             transactionContext.stub.getState.withArgs(Values.HTA_Producer.producerMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_Producer)));

//             transactionContext.stub.getPrivateData.withArgs('enedis-producer-rte', Values.HTA_site_valid.meteringPointMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_site_valid)));


//             const newActivationDocument: ActivationDocument = JSON.parse(JSON.stringify(activationDocument));

//             newActivationDocument.originAutomationRegisteredResourceMrid = Values.HTA_yellowPage2.originAutomationRegisteredResourceMrid;
//             // newActivationDocument.registeredResourceMrid = Values.HTA_site_valid_ProdA.meteringPointMrid;
//             // newActivationDocument.measurementUnitName = 'MW'
//             // newActivationDocument.orderEnd = false;
//             // newActivationDocument.orderValue = 'X';
//             newActivationDocument.startCreatedDateTime = CommonService.increaseDateDaysStr(activationDocument.startCreatedDateTime as string, 10),
//             newActivationDocument.endCreatedDateTime = CommonService.increaseDateDaysStr(activationDocument.startCreatedDateTime as string, 11),
//             newActivationDocument.reasonCode = 'XXX';
//             // newActivationDocument.senderMarketParticipantMrid = Values.HTA_systemoperator2.systemOperatorMarketParticipantMrid;
//             newActivationDocument.senderRole = 'NoSenderRole';
//             // newActivationDocument.receiverMarketParticipantMrid = Values.HTA_Producer2.producerMarketParticipantMrid;
//             newActivationDocument.receiverRole = 'NoReceiverRole';
//             newActivationDocument.potentialParent = true;
//             newActivationDocument.potentialChild = false;
//             newActivationDocument.instance = 'Noinstance';
//             // newActivationDocument.subOrderList = [Values.HTB_ActivationDocument_Valid.activationDocumentMrid];
//             newActivationDocument.eligibilityStatus =  EligibilityStatusType.FREligibilityPending;
//             newActivationDocument.eligibilityStatusEditable = true;
//             newActivationDocument.reconciliationStatus =  ReconciliationStatus.TOTAL;
//             newActivationDocument.subOrderList = ["XXX"];

//             try {
//                 await star.UpdateActivationDocument(transactionContext, JSON.stringify(newActivationDocument));
//             } catch (err) {
//                 // params.logger.info(err.message)
//                 expect(err.message).to.equal(`ERROR updateActivationDocument : Activation Document ${newActivationDocument.activationDocumentMrid} reconciliation can not be filled by update.`);
//             }
//         });





//         it('should return ERROR updateActivationDocument HTA - pattern', async () => {
//             transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);

//             const params: STARParameters = await ParametersController.getParameterValues(transactionContext);

//             const activationDocument: ActivationDocument = JSON.parse(JSON.stringify(Values.HTA_ActivationDocument_Valid));
//             activationDocument.orderEnd = true;
//             activationDocument.receiverRole = RoleType.Role_Producer;
//             activationDocument.potentialParent = false;
//             activationDocument.potentialChild = true;
//             activationDocument.eligibilityStatus = EligibilityStatusType.EligibilityAccepted;
//             activationDocument.eligibilityStatusEditable = false;
//             activationDocument.reconciliationStatus = ReconciliationStatus.MISS;
//             activationDocument.docType = DocType.ACTIVATION_DOCUMENT;

//             transactionContext.stub.getPrivateData.withArgs('enedis-producer-rte', activationDocument.activationDocumentMrid).resolves(Buffer.from(JSON.stringify(activationDocument)));


//             const feedbackProducer: FeedbackProducer = {
//                 docType: DocType.FEEDBACK_PRODUCER,
//                 feedbackProducerMrid: FeedbackProducerController.getFeedbackProducerMrid(params, activationDocument.activationDocumentMrid),
//                 activationDocumentMrid: activationDocument.activationDocumentMrid,
//                 messageType: "B30",
//                 processType: "A42",
//                 revisionNumber: "0",
//                 indeminityStatus: IndeminityStatus.IN_PROGRESS,
//                 receiverMarketParticipantMrid: activationDocument.receiverMarketParticipantMrid,
//                 senderMarketParticipantMrid: activationDocument.senderMarketParticipantMrid,
//                 createdDateTime: activationDocument.startCreatedDateTime,
//             }

//             transactionContext.stub.getPrivateData.withArgs('enedis-producer-rte', feedbackProducer.feedbackProducerMrid).resolves(Buffer.from(JSON.stringify(feedbackProducer)));

//             transactionContext.stub.getState.withArgs(Values.HTA_systemoperator.systemOperatorMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_systemoperator)));
//             transactionContext.stub.getState.withArgs(Values.HTA_Producer.producerMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_Producer)));

//             transactionContext.stub.getPrivateData.withArgs('enedis-producer-rte', Values.HTA_site_valid.meteringPointMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_site_valid)));


//             const newActivationDocument: ActivationDocument = JSON.parse(JSON.stringify(activationDocument));

//             newActivationDocument.originAutomationRegisteredResourceMrid = Values.HTA_yellowPage2.originAutomationRegisteredResourceMrid;
//             // newActivationDocument.registeredResourceMrid = Values.HTA_site_valid_ProdA.meteringPointMrid;
//             // newActivationDocument.measurementUnitName = 'MW'
//             newActivationDocument.messageType = 'D01';
//             newActivationDocument.businessType = 'Z01';
//             // newActivationDocument.orderEnd = false;
//             // newActivationDocument.orderValue = 'X';
//             newActivationDocument.startCreatedDateTime = CommonService.increaseDateDaysStr(activationDocument.startCreatedDateTime as string, 10),
//             newActivationDocument.endCreatedDateTime = CommonService.increaseDateDaysStr(activationDocument.startCreatedDateTime as string, 11),
//             newActivationDocument.revisionNumber = '70';
//             newActivationDocument.reasonCode = 'XXX';
//             // newActivationDocument.senderMarketParticipantMrid = Values.HTA_systemoperator2.systemOperatorMarketParticipantMrid;
//             newActivationDocument.senderRole = 'NoSenderRole';
//             // newActivationDocument.receiverMarketParticipantMrid = Values.HTA_Producer2.producerMarketParticipantMrid;
//             newActivationDocument.receiverRole = 'NoReceiverRole';
//             newActivationDocument.potentialParent = true;
//             newActivationDocument.potentialChild = false;
//             newActivationDocument.instance = 'Noinstance';
//             // newActivationDocument.subOrderList = [Values.HTB_ActivationDocument_Valid.activationDocumentMrid];
//             newActivationDocument.eligibilityStatus =  EligibilityStatusType.FREligibilityPending;
//             newActivationDocument.eligibilityStatusEditable = true;
//             newActivationDocument.reconciliationStatus =  ReconciliationStatus.TOTAL;

//             try {
//                 await star.UpdateActivationDocument(transactionContext, JSON.stringify(newActivationDocument));
//             } catch (err) {
//                 // params.logger.info(err.message)
//                 expect(err.message).to.equal(`Incoherency between messageType, businessType and reason code for Activation Document ${newActivationDocument.activationDocumentMrid} creation.`);
//             }
//         });






//         it('should return SUCCESS updateActivationDocument HTA', async () => {
//             transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);

//             const params: STARParameters = await ParametersController.getParameterValues(transactionContext);

//             const activationDocument: ActivationDocument = JSON.parse(JSON.stringify(Values.HTA_ActivationDocument_Valid));
//             activationDocument.orderEnd = true;
//             activationDocument.receiverRole = RoleType.Role_Producer;
//             activationDocument.potentialParent = false;
//             activationDocument.potentialChild = true;
//             activationDocument.eligibilityStatus = EligibilityStatusType.EligibilityAccepted;
//             activationDocument.eligibilityStatusEditable = false;
//             activationDocument.reconciliationStatus = ReconciliationStatus.MISS;
//             activationDocument.docType = DocType.ACTIVATION_DOCUMENT;

//             transactionContext.stub.getPrivateData.withArgs('enedis-producer-rte', activationDocument.activationDocumentMrid).resolves(Buffer.from(JSON.stringify(activationDocument)));


//             const feedbackProducer: FeedbackProducer = {
//                 docType: DocType.FEEDBACK_PRODUCER,
//                 feedbackProducerMrid: FeedbackProducerController.getFeedbackProducerMrid(params, activationDocument.activationDocumentMrid),
//                 activationDocumentMrid: activationDocument.activationDocumentMrid,
//                 messageType: "B30",
//                 processType: "A42",
//                 revisionNumber: "0",
//                 indeminityStatus: IndeminityStatus.IN_PROGRESS,
//                 receiverMarketParticipantMrid: activationDocument.receiverMarketParticipantMrid,
//                 senderMarketParticipantMrid: activationDocument.senderMarketParticipantMrid,
//                 createdDateTime: activationDocument.startCreatedDateTime,
//             }

//             transactionContext.stub.getPrivateData.withArgs('enedis-producer-rte', feedbackProducer.feedbackProducerMrid).resolves(Buffer.from(JSON.stringify(feedbackProducer)));

//             transactionContext.stub.getState.withArgs(Values.HTA_systemoperator.systemOperatorMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_systemoperator)));
//             transactionContext.stub.getState.withArgs(Values.HTA_Producer.producerMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_Producer)));

//             transactionContext.stub.getPrivateData.withArgs('enedis-producer-rte', Values.HTA_site_valid.meteringPointMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_site_valid)));


//             const newActivationDocument: ActivationDocument = JSON.parse(JSON.stringify(activationDocument));

//             newActivationDocument.originAutomationRegisteredResourceMrid = Values.HTA_yellowPage2.originAutomationRegisteredResourceMrid;
//             // newActivationDocument.registeredResourceMrid = Values.HTA_site_valid_ProdA.meteringPointMrid;
//             // newActivationDocument.measurementUnitName = 'MW'
//             newActivationDocument.messageType = 'D01';
//             newActivationDocument.businessType = 'Z01';
//             // newActivationDocument.orderEnd = false;
//             // newActivationDocument.orderValue = 'X';
//             newActivationDocument.startCreatedDateTime = CommonService.increaseDateDaysStr(activationDocument.startCreatedDateTime as string, 10),
//             newActivationDocument.endCreatedDateTime = CommonService.increaseDateDaysStr(activationDocument.startCreatedDateTime as string, 11),
//             newActivationDocument.revisionNumber = '70';
//             newActivationDocument.reasonCode = 'A70';
//             // newActivationDocument.senderMarketParticipantMrid = Values.HTA_systemoperator2.systemOperatorMarketParticipantMrid;
//             newActivationDocument.senderRole = 'NoSenderRole';
//             // newActivationDocument.receiverMarketParticipantMrid = Values.HTA_Producer2.producerMarketParticipantMrid;
//             newActivationDocument.receiverRole = 'NoReceiverRole';
//             newActivationDocument.potentialParent = true;
//             newActivationDocument.potentialChild = false;
//             newActivationDocument.instance = 'Noinstance';
//             // newActivationDocument.subOrderList = [Values.HTB_ActivationDocument_Valid.activationDocumentMrid];
//             newActivationDocument.eligibilityStatus =  EligibilityStatusType.FREligibilityPending;
//             newActivationDocument.eligibilityStatusEditable = true;
//             newActivationDocument.reconciliationStatus =  ReconciliationStatus.TOTAL;

//             await star.UpdateActivationDocument(transactionContext, JSON.stringify(newActivationDocument));

//             const expectedSite: Site = JSON.parse(JSON.stringify(Values.HTA_site_valid));
//             expectedSite.systemOperatorMarketParticipantName = 'enedis';
//             expectedSite.producerMarketParticipantName = 'EolienFR vert Cie';
//             expectedSite.docType = 'site';

//             const expected: ActivationDocument = JSON.parse(JSON.stringify(newActivationDocument));
//             expected.revisionNumber = '2';
//             expected.eligibilityStatusEditable = false;
//             expected.reconciliationStatus = ReconciliationStatus.MISS;
//             expected.receiverRole = 'Producer';
//             expected.potentialParent = false;
//             expected.potentialChild = true;
//             expected.eligibilityStatus = EligibilityStatusType.EligibilityAccepted;

//             const activationDocumentCompositeKey = ActivationCompositeKeyIndexersController.getActivationDocumentCompositeKeyId(JSON.parse(JSON.stringify(expected)));
//             const compositeKeyIndex: ActivationDocumentCompositeKeyAbstract = {
//                 activationDocumentCompositeKey,
//                 activationDocumentMrid: expected.activationDocumentMrid,
//             };

//             const compositeKeyIndexed:IndexedData = {
//                 docType: DocType.DATA_INDEXER,
//                 indexId:activationDocumentCompositeKey,
//                 indexedDataAbstractMap: new Map()};
//             compositeKeyIndexed.indexedDataAbstractMap.set(activationDocumentCompositeKey, compositeKeyIndex);

//             const compositeKeyIndexedJSON = IndexedDataJson.toJson(compositeKeyIndexed);

//             const indexedDataAbstract: ActivationDocumentAbstract = {
//                 activationDocumentMrid: expected.activationDocumentMrid,
//                 registeredResourceMrid: expected.registeredResourceMrid,
//                 startCreatedDateTime: expected.startCreatedDateTime as string,
//             };

//             const expectedIndexer: IndexedData = {
//                 docType: DocType.DATA_INDEXER,
//                 indexedDataAbstractMap : new Map(),
//                 indexId: SiteActivationIndexersController.getKey(expected.registeredResourceMrid, new Date(expected.startCreatedDateTime as string)),
//             };
//             expectedIndexer.indexedDataAbstractMap?.set(expected.activationDocumentMrid, indexedDataAbstract);
//             const expectedIndexerJSON = IndexedDataJson.toJson(expectedIndexer);

//             const expectedDateMax: ActivationDocumentDateMax = {
//                 dateTime: expected.startCreatedDateTime as string,
//                 docType: DocType.INDEXER_MAX_DATE,
//             };
//             const expectedDateMaxId: string = SiteActivationIndexersController.getMaxKey(expected.registeredResourceMrid);

//             // params.logger.info("-----------")
//             // params.logger.info(transactionContext.stub.putPrivateData.getCall(0).args);
//             // params.logger.info("ooooooooo")
//             // params.logger.info(Buffer.from(transactionContext.stub.putPrivateData.getCall(0).args[2].toString()).toString('utf8'));
//             // params.logger.info(JSON.stringify(expected))
//             // params.logger.info("-----------")
//             // params.logger.info(transactionContext.stub.putPrivateData.getCall(1).args);
//             // params.logger.info("ooooooooo")
//             // params.logger.info(Buffer.from(transactionContext.stub.putPrivateData.getCall(1).args[2].toString()).toString('utf8'));
//             // params.logger.info(JSON.stringify(compositeKeyIndexedJSON))
//             // params.logger.info("-----------")
//             // params.logger.info(transactionContext.stub.putPrivateData.getCall(2).args);
//             // params.logger.info("ooooooooo")
//             // params.logger.info(Buffer.from(transactionContext.stub.putPrivateData.getCall(2).args[2].toString()).toString('utf8'));
//             // params.logger.info(JSON.stringify(expectedIndexerJSON))
//             // params.logger.info("-----------")
//             // params.logger.info(transactionContext.stub.putPrivateData.getCall(3).args);
//             // params.logger.info("ooooooooo")
//             // params.logger.info(Buffer.from(transactionContext.stub.putPrivateData.getCall(3).args[2].toString()).toString('utf8'));
//             // params.logger.info(JSON.stringify(expectedDateMax))
//             // params.logger.info("-----------")
//             // params.logger.info(transactionContext.stub.putPrivateData.getCall(4).args);
//             // params.logger.info("ooooooooo")
//             // params.logger.info(Buffer.from(transactionContext.stub.putPrivateData.getCall(4).args[2].toString()).toString('utf8'));
//             // params.logger.info(JSON.stringify(feedbackProducer))
//             // params.logger.info("-----------")

//             transactionContext.stub.putPrivateData.getCall(0).should.have.been.calledWithExactly(
//                 'enedis-producer-rte',
//                 expected.activationDocumentMrid,
//                 Buffer.from(JSON.stringify(expected)),
//             );

//             transactionContext.stub.putPrivateData.getCall(1).should.have.been.calledWithExactly(
//                 'enedis-producer-rte',
//                 compositeKeyIndexedJSON.indexId,
//                 Buffer.from(JSON.stringify(compositeKeyIndexedJSON)),
//             );

//             transactionContext.stub.putPrivateData.getCall(2).should.have.been.calledWithExactly(
//                 'enedis-producer-rte',
//                 expectedIndexerJSON.indexId,
//                 Buffer.from(JSON.stringify(expectedIndexerJSON)),
//             );

//             transactionContext.stub.putPrivateData.getCall(3).should.have.been.calledWithExactly(
//                 'enedis-producer-rte',
//                 expectedDateMaxId,
//                 Buffer.from(JSON.stringify(expectedDateMax)),
//             );

//             transactionContext.stub.putPrivateData.getCall(4).should.have.been.calledWithExactly(
//                 'enedis-producer-rte',
//                 feedbackProducer.feedbackProducerMrid,
//                 Buffer.from(JSON.stringify(feedbackProducer)),
//             );


// 			expect(transactionContext.stub.putPrivateData.callCount).to.equal(5);

//             ////////////////////////////////////////////////////////////////////////////
//             /////////// DELETION
//             ////////////////////////////////////////////////////////////////////////////

//             params.logger.info("********************************************")

//             const deletedActivationDocumentCompositeKey = ActivationCompositeKeyIndexersController.getActivationDocumentCompositeKeyId(JSON.parse(JSON.stringify(activationDocument)));

//             const indexIdNRJAmount = ActivationEnergyAmountIndexersController.getKey(activationDocument.activationDocumentMrid)

//             // params.logger.info("-----------")
//             // params.logger.info(transactionContext.stub.deletePrivateData.getCall(0).args);
//             // params.logger.info("ooooooooo")
//             // params.logger.info(Buffer.from(transactionContext.stub.deletePrivateData.getCall(0).args[1].toString()).toString('utf8'));
//             // params.logger.info(activationDocument.activationDocumentMrid)
//             // params.logger.info("-----------")
//             // params.logger.info(transactionContext.stub.deletePrivateData.getCall(1).args);
//             // params.logger.info("ooooooooo")
//             // params.logger.info(Buffer.from(transactionContext.stub.deletePrivateData.getCall(1).args[1].toString()).toString('utf8'));
//             // params.logger.info(deletedActivationDocumentCompositeKey)
//             // params.logger.info("-----------")
//             // params.logger.info(transactionContext.stub.deletePrivateData.getCall(2).args);
//             // params.logger.info("ooooooooo")
//             // params.logger.info(Buffer.from(transactionContext.stub.deletePrivateData.getCall(2).args[1].toString()).toString('utf8'));
//             // params.logger.info(feedbackProducer.feedbackProducerMrid)
//             // params.logger.info("-----------")
//             // params.logger.info(transactionContext.stub.deletePrivateData.getCall(3).args);
//             // params.logger.info("ooooooooo")
//             // params.logger.info(Buffer.from(transactionContext.stub.deletePrivateData.getCall(3).args[1].toString()).toString('utf8'));
//             // params.logger.info(indexIdNRJAmount)
//             // params.logger.info("-----------")
//             // params.logger.info(transactionContext.stub.deletePrivateData.getCall(4).args);
//             // params.logger.info("ooooooooo")
//             // params.logger.info(Buffer.from(transactionContext.stub.deletePrivateData.getCall(4).args[1].toString()).toString('utf8'));
//             // params.logger.info(feedbackProducer.feedbackProducerMrid)
//             // params.logger.info("-----------")

//             transactionContext.stub.deletePrivateData.getCall(0).should.have.been.calledWithExactly(
//                 'enedis-producer-rte',
//                 activationDocument.activationDocumentMrid
//             );

//             transactionContext.stub.deletePrivateData.getCall(1).should.have.been.calledWithExactly(
//                 'enedis-producer-rte',
//                 deletedActivationDocumentCompositeKey
//             );

//             transactionContext.stub.deletePrivateData.getCall(2).should.have.been.calledWithExactly(
//                 'enedis-producer-rte',
//                 feedbackProducer.feedbackProducerMrid
//             );

//             transactionContext.stub.deletePrivateData.getCall(3).should.have.been.calledWithExactly(
//                 'enedis-producer-rte',
//                 indexIdNRJAmount
//             );

//             transactionContext.stub.deletePrivateData.getCall(4).should.have.been.calledWithExactly(
//                 'enedis-producer-rte',
//                 feedbackProducer.feedbackProducerMrid
//             );

//             expect(transactionContext.stub.deletePrivateData.callCount).to.equal(5);
//         });




//         it('should return SUCCESS updateActivationDocument HTA with existing Energy Amount', async () => {
//             transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);

//             const params: STARParameters = await ParametersController.getParameterValues(transactionContext);

//             const activationDocument: ActivationDocument = JSON.parse(JSON.stringify(Values.HTA_ActivationDocument_Valid));
//             activationDocument.orderEnd = true;
//             activationDocument.receiverRole = RoleType.Role_Producer;
//             activationDocument.potentialParent = false;
//             activationDocument.potentialChild = true;
//             activationDocument.eligibilityStatus = EligibilityStatusType.EligibilityAccepted;
//             activationDocument.eligibilityStatusEditable = false;
//             activationDocument.reconciliationStatus = ReconciliationStatus.MISS;
//             activationDocument.docType = DocType.ACTIVATION_DOCUMENT;

//             transactionContext.stub.getPrivateData.withArgs('enedis-producer-rte', activationDocument.activationDocumentMrid).resolves(Buffer.from(JSON.stringify(activationDocument)));


//             const feedbackProducer: FeedbackProducer = {
//                 docType: DocType.FEEDBACK_PRODUCER,
//                 feedbackProducerMrid: FeedbackProducerController.getFeedbackProducerMrid(params, activationDocument.activationDocumentMrid),
//                 activationDocumentMrid: activationDocument.activationDocumentMrid,
//                 messageType: "B30",
//                 processType: "A42",
//                 revisionNumber: "0",
//                 indeminityStatus: IndeminityStatus.IN_PROGRESS,
//                 receiverMarketParticipantMrid: activationDocument.receiverMarketParticipantMrid,
//                 senderMarketParticipantMrid: activationDocument.senderMarketParticipantMrid,
//                 createdDateTime: activationDocument.startCreatedDateTime,
//             }

//             transactionContext.stub.getPrivateData.withArgs('enedis-producer-rte', feedbackProducer.feedbackProducerMrid).resolves(Buffer.from(JSON.stringify(feedbackProducer)));

//             const energyAmount: EnergyAmount = JSON.parse(JSON.stringify(Values.HTA_EnergyAmount))
//             energyAmount.docType = DocType.ENERGY_AMOUNT;

//             transactionContext.stub.getPrivateData.withArgs('enedis-producer-rte', energyAmount.energyAmountMarketDocumentMrid).resolves(Buffer.from(JSON.stringify(energyAmount)));

//             const energyAmountDataAbstract: EnergyAmountAbstract = {
//                 energyAmountMarketDocumentMrid: energyAmount.energyAmountMarketDocumentMrid
//             }

//             const energyAmountIndexer: IndexedData = {
//                 docType: DocType.DATA_INDEXER,
//                 indexedDataAbstractMap : new Map(),
//                 indexId: ActivationEnergyAmountIndexersController.getKey(activationDocument.activationDocumentMrid),
//             }
//             energyAmountIndexer.indexedDataAbstractMap.set(activationDocument.activationDocumentMrid, energyAmountDataAbstract);

//             const energyAmountIndexerJSON = IndexedDataJson.toJson(energyAmountIndexer);

//             transactionContext.stub.getPrivateData.withArgs('enedis-producer-rte', energyAmountIndexerJSON.indexId).resolves(Buffer.from(JSON.stringify(energyAmountIndexerJSON)));


//             transactionContext.stub.getState.withArgs(Values.HTA_systemoperator.systemOperatorMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_systemoperator)));
//             transactionContext.stub.getState.withArgs(Values.HTA_Producer.producerMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_Producer)));

//             transactionContext.stub.getPrivateData.withArgs('enedis-producer-rte', Values.HTA_site_valid.meteringPointMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_site_valid)));


//             const newActivationDocument: ActivationDocument = JSON.parse(JSON.stringify(activationDocument));

//             newActivationDocument.originAutomationRegisteredResourceMrid = Values.HTA_yellowPage2.originAutomationRegisteredResourceMrid;
//             // newActivationDocument.registeredResourceMrid = Values.HTA_site_valid_ProdA.meteringPointMrid;
//             // newActivationDocument.measurementUnitName = 'MW'
//             newActivationDocument.messageType = 'D01';
//             newActivationDocument.businessType = 'Z01';
//             // newActivationDocument.orderEnd = false;
//             // newActivationDocument.orderValue = 'X';
//             newActivationDocument.startCreatedDateTime = CommonService.increaseDateDaysStr(activationDocument.startCreatedDateTime as string, 10),
//             newActivationDocument.endCreatedDateTime = CommonService.increaseDateDaysStr(activationDocument.startCreatedDateTime as string, 11),
//             newActivationDocument.revisionNumber = '70';
//             newActivationDocument.reasonCode = 'A70';
//             // newActivationDocument.senderMarketParticipantMrid = Values.HTA_systemoperator2.systemOperatorMarketParticipantMrid;
//             newActivationDocument.senderRole = 'NoSenderRole';
//             // newActivationDocument.receiverMarketParticipantMrid = Values.HTA_Producer2.producerMarketParticipantMrid;
//             newActivationDocument.receiverRole = 'NoReceiverRole';
//             newActivationDocument.potentialParent = true;
//             newActivationDocument.potentialChild = false;
//             newActivationDocument.instance = 'Noinstance';
//             // newActivationDocument.subOrderList = [Values.HTB_ActivationDocument_Valid.activationDocumentMrid];
//             newActivationDocument.eligibilityStatus =  EligibilityStatusType.FREligibilityPending;
//             newActivationDocument.eligibilityStatusEditable = true;
//             newActivationDocument.reconciliationStatus =  ReconciliationStatus.TOTAL;

//             await star.UpdateActivationDocument(transactionContext, JSON.stringify(newActivationDocument));

//             const expectedSite: Site = JSON.parse(JSON.stringify(Values.HTA_site_valid));
//             expectedSite.systemOperatorMarketParticipantName = 'enedis';
//             expectedSite.producerMarketParticipantName = 'EolienFR vert Cie';
//             expectedSite.docType = 'site';

//             const expected: ActivationDocument = JSON.parse(JSON.stringify(newActivationDocument));
//             expected.revisionNumber = '2';
//             expected.eligibilityStatusEditable = false;
//             expected.reconciliationStatus = ReconciliationStatus.MISS;
//             expected.receiverRole = 'Producer';
//             expected.potentialParent = false;
//             expected.potentialChild = true;
//             expected.eligibilityStatus = EligibilityStatusType.EligibilityAccepted;

//             const activationDocumentCompositeKey = ActivationCompositeKeyIndexersController.getActivationDocumentCompositeKeyId(JSON.parse(JSON.stringify(expected)));
//             const compositeKeyIndex: ActivationDocumentCompositeKeyAbstract = {
//                 activationDocumentCompositeKey,
//                 activationDocumentMrid: expected.activationDocumentMrid,
//             };

//             const compositeKeyIndexed:IndexedData = {
//                 docType: DocType.DATA_INDEXER,
//                 indexId:activationDocumentCompositeKey,
//                 indexedDataAbstractMap: new Map()};
//             compositeKeyIndexed.indexedDataAbstractMap.set(activationDocumentCompositeKey, compositeKeyIndex);

//             const compositeKeyIndexedJSON = IndexedDataJson.toJson(compositeKeyIndexed);

//             const indexedDataAbstract: ActivationDocumentAbstract = {
//                 activationDocumentMrid: expected.activationDocumentMrid,
//                 registeredResourceMrid: expected.registeredResourceMrid,
//                 startCreatedDateTime: expected.startCreatedDateTime as string,
//             };

//             const expectedIndexer: IndexedData = {
//                 docType: DocType.DATA_INDEXER,
//                 indexedDataAbstractMap : new Map(),
//                 indexId: SiteActivationIndexersController.getKey(expected.registeredResourceMrid, new Date(expected.startCreatedDateTime as string)),
//             };
//             expectedIndexer.indexedDataAbstractMap?.set(expected.activationDocumentMrid, indexedDataAbstract);
//             const expectedIndexerJSON = IndexedDataJson.toJson(expectedIndexer);

//             const expectedDateMax: ActivationDocumentDateMax = {
//                 dateTime: expected.startCreatedDateTime as string,
//                 docType: DocType.INDEXER_MAX_DATE,
//             };
//             const expectedDateMaxId: string = SiteActivationIndexersController.getMaxKey(expected.registeredResourceMrid);

//             // params.logger.info("-----------")
//             // params.logger.info(transactionContext.stub.putPrivateData.getCall(0).args);
//             // params.logger.info("ooooooooo")
//             // params.logger.info(Buffer.from(transactionContext.stub.putPrivateData.getCall(0).args[2].toString()).toString('utf8'));
//             // params.logger.info(JSON.stringify(expected))
//             // params.logger.info("-----------")
//             // params.logger.info(transactionContext.stub.putPrivateData.getCall(1).args);
//             // params.logger.info("ooooooooo")
//             // params.logger.info(Buffer.from(transactionContext.stub.putPrivateData.getCall(1).args[2].toString()).toString('utf8'));
//             // params.logger.info(JSON.stringify(compositeKeyIndexedJSON))
//             // params.logger.info("-----------")
//             // params.logger.info(transactionContext.stub.putPrivateData.getCall(2).args);
//             // params.logger.info("ooooooooo")
//             // params.logger.info(Buffer.from(transactionContext.stub.putPrivateData.getCall(2).args[2].toString()).toString('utf8'));
//             // params.logger.info(JSON.stringify(expectedIndexerJSON))
//             // params.logger.info("-----------")
//             // params.logger.info(transactionContext.stub.putPrivateData.getCall(3).args);
//             // params.logger.info("ooooooooo")
//             // params.logger.info(Buffer.from(transactionContext.stub.putPrivateData.getCall(3).args[2].toString()).toString('utf8'));
//             // params.logger.info(JSON.stringify(expectedDateMax))
//             // params.logger.info("-----------")
//             // params.logger.info(transactionContext.stub.putPrivateData.getCall(4).args);
//             // params.logger.info("ooooooooo")
//             // params.logger.info(Buffer.from(transactionContext.stub.putPrivateData.getCall(4).args[2].toString()).toString('utf8'));
//             // params.logger.info(JSON.stringify(feedbackProducer))
//             // params.logger.info("-----------")

//             transactionContext.stub.putPrivateData.getCall(0).should.have.been.calledWithExactly(
//                 'enedis-producer-rte',
//                 expected.activationDocumentMrid,
//                 Buffer.from(JSON.stringify(expected)),
//             );

//             transactionContext.stub.putPrivateData.getCall(1).should.have.been.calledWithExactly(
//                 'enedis-producer-rte',
//                 compositeKeyIndexedJSON.indexId,
//                 Buffer.from(JSON.stringify(compositeKeyIndexedJSON)),
//             );

//             transactionContext.stub.putPrivateData.getCall(2).should.have.been.calledWithExactly(
//                 'enedis-producer-rte',
//                 expectedIndexerJSON.indexId,
//                 Buffer.from(JSON.stringify(expectedIndexerJSON)),
//             );

//             transactionContext.stub.putPrivateData.getCall(3).should.have.been.calledWithExactly(
//                 'enedis-producer-rte',
//                 expectedDateMaxId,
//                 Buffer.from(JSON.stringify(expectedDateMax)),
//             );

//             transactionContext.stub.putPrivateData.getCall(4).should.have.been.calledWithExactly(
//                 'enedis-producer-rte',
//                 feedbackProducer.feedbackProducerMrid,
//                 Buffer.from(JSON.stringify(feedbackProducer)),
//             );


// 			expect(transactionContext.stub.putPrivateData.callCount).to.equal(5);

//             ////////////////////////////////////////////////////////////////////////////
//             /////////// DELETION
//             ////////////////////////////////////////////////////////////////////////////

//             params.logger.info("********************************************")

//             const deletedActivationDocumentCompositeKey = ActivationCompositeKeyIndexersController.getActivationDocumentCompositeKeyId(JSON.parse(JSON.stringify(activationDocument)));

//             const indexIdNRJAmount = ActivationEnergyAmountIndexersController.getKey(activationDocument.activationDocumentMrid)

//             // params.logger.info("-----------")
//             // params.logger.info(transactionContext.stub.deletePrivateData.getCall(0).args);
//             // params.logger.info("ooooooooo")
//             // params.logger.info(Buffer.from(transactionContext.stub.deletePrivateData.getCall(0).args[1].toString()).toString('utf8'));
//             // params.logger.info(activationDocument.activationDocumentMrid)
//             // params.logger.info("-----------")
//             // params.logger.info(transactionContext.stub.deletePrivateData.getCall(1).args);
//             // params.logger.info("ooooooooo")
//             // params.logger.info(Buffer.from(transactionContext.stub.deletePrivateData.getCall(1).args[1].toString()).toString('utf8'));
//             // params.logger.info(deletedActivationDocumentCompositeKey)
//             // params.logger.info("-----------")
//             // params.logger.info(transactionContext.stub.deletePrivateData.getCall(2).args);
//             // params.logger.info("ooooooooo")
//             // params.logger.info(Buffer.from(transactionContext.stub.deletePrivateData.getCall(2).args[1].toString()).toString('utf8'));
//             // params.logger.info(feedbackProducer.feedbackProducerMrid)
//             // params.logger.info("-----------")
//             // params.logger.info(transactionContext.stub.deletePrivateData.getCall(3).args);
//             // params.logger.info("ooooooooo")
//             // params.logger.info(Buffer.from(transactionContext.stub.deletePrivateData.getCall(3).args[1].toString()).toString('utf8'));
//             // params.logger.info(indexIdNRJAmount)
//             // params.logger.info("-----------")
//             // params.logger.info(transactionContext.stub.deletePrivateData.getCall(4).args);
//             // params.logger.info("ooooooooo")
//             // params.logger.info(Buffer.from(transactionContext.stub.deletePrivateData.getCall(4).args[1].toString()).toString('utf8'));
//             // params.logger.info(energyAmount.energyAmountMarketDocumentMrid)
//             // params.logger.info("-----------")
//             // params.logger.info(transactionContext.stub.deletePrivateData.getCall(5).args);
//             // params.logger.info("ooooooooo")
//             // params.logger.info(Buffer.from(transactionContext.stub.deletePrivateData.getCall(5).args[1].toString()).toString('utf8'));
//             // params.logger.info(feedbackProducer.feedbackProducerMrid)
//             // params.logger.info("-----------")

//             transactionContext.stub.deletePrivateData.getCall(0).should.have.been.calledWithExactly(
//                 'enedis-producer-rte',
//                 activationDocument.activationDocumentMrid
//             );

//             transactionContext.stub.deletePrivateData.getCall(1).should.have.been.calledWithExactly(
//                 'enedis-producer-rte',
//                 deletedActivationDocumentCompositeKey
//             );

//             transactionContext.stub.deletePrivateData.getCall(2).should.have.been.calledWithExactly(
//                 'enedis-producer-rte',
//                 feedbackProducer.feedbackProducerMrid
//             );

//             transactionContext.stub.deletePrivateData.getCall(3).should.have.been.calledWithExactly(
//                 'enedis-producer-rte',
//                 indexIdNRJAmount
//             );

//             transactionContext.stub.deletePrivateData.getCall(4).should.have.been.calledWithExactly(
//                 'enedis-producer-rte',
//                 energyAmount.energyAmountMarketDocumentMrid
//             );

//             transactionContext.stub.deletePrivateData.getCall(5).should.have.been.calledWithExactly(
//                 'enedis-producer-rte',
//                 feedbackProducer.feedbackProducerMrid
//             );

//             expect(transactionContext.stub.deletePrivateData.callCount).to.equal(6);
//         });





//         it('should return SUCCESS updateActivationDocument HTA with collection change', async () => {
//             transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);

//             const params: STARParameters = await ParametersController.getParameterValues(transactionContext);

//             const activationDocument: ActivationDocument = JSON.parse(JSON.stringify(Values.HTA_ActivationDocument_Valid));
//             activationDocument.orderEnd = true;
//             activationDocument.receiverRole = RoleType.Role_Producer;
//             activationDocument.potentialParent = false;
//             activationDocument.potentialChild = true;
//             activationDocument.eligibilityStatus = EligibilityStatusType.EligibilityAccepted;
//             activationDocument.eligibilityStatusEditable = false;
//             activationDocument.reconciliationStatus = ReconciliationStatus.MISS;
//             activationDocument.docType = DocType.ACTIVATION_DOCUMENT;

//             transactionContext.stub.getPrivateData.withArgs('enedis-producer-rte', activationDocument.activationDocumentMrid).resolves(Buffer.from(JSON.stringify(activationDocument)));


//             const feedbackProducer: FeedbackProducer = {
//                 docType: DocType.FEEDBACK_PRODUCER,
//                 feedbackProducerMrid: FeedbackProducerController.getFeedbackProducerMrid(params, activationDocument.activationDocumentMrid),
//                 activationDocumentMrid: activationDocument.activationDocumentMrid,
//                 messageType: "B30",
//                 processType: "A42",
//                 revisionNumber: "0",
//                 indeminityStatus: IndeminityStatus.IN_PROGRESS,
//                 receiverMarketParticipantMrid: activationDocument.receiverMarketParticipantMrid,
//                 senderMarketParticipantMrid: activationDocument.senderMarketParticipantMrid,
//                 createdDateTime: activationDocument.startCreatedDateTime,
//             }

//             transactionContext.stub.getPrivateData.withArgs('enedis-producer-rte', feedbackProducer.feedbackProducerMrid).resolves(Buffer.from(JSON.stringify(feedbackProducer)));

//             transactionContext.stub.getState.withArgs(Values.HTA_systemoperator.systemOperatorMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_systemoperator)));
//             transactionContext.stub.getState.withArgs(Values.HTA_Producer.producerMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_Producer)));

//             transactionContext.stub.getPrivateData.withArgs('enedis-producer-rte', Values.HTA_site_valid.meteringPointMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_site_valid)));


//             const newActivationDocument: ActivationDocument = JSON.parse(JSON.stringify(activationDocument));

//             newActivationDocument.originAutomationRegisteredResourceMrid = Values.HTA_yellowPage2.originAutomationRegisteredResourceMrid;
//             // newActivationDocument.registeredResourceMrid = Values.HTA_site_valid_ProdA.meteringPointMrid;
//             // newActivationDocument.measurementUnitName = 'MW'
//             newActivationDocument.messageType = 'D01';
//             newActivationDocument.businessType = 'Z04';
//             // newActivationDocument.orderEnd = false;
//             // newActivationDocument.orderValue = 'X';
//             newActivationDocument.startCreatedDateTime = CommonService.increaseDateDaysStr(activationDocument.startCreatedDateTime as string, 10),
//             newActivationDocument.endCreatedDateTime = CommonService.increaseDateDaysStr(activationDocument.startCreatedDateTime as string, 11),
//             newActivationDocument.revisionNumber = '70';
//             newActivationDocument.reasonCode = 'Y99';
//             // newActivationDocument.senderMarketParticipantMrid = Values.HTA_systemoperator2.systemOperatorMarketParticipantMrid;
//             newActivationDocument.senderRole = 'NoSenderRole';
//             // newActivationDocument.receiverMarketParticipantMrid = Values.HTA_Producer2.producerMarketParticipantMrid;
//             newActivationDocument.receiverRole = 'NoReceiverRole';
//             newActivationDocument.potentialParent = true;
//             newActivationDocument.potentialChild = false;
//             newActivationDocument.instance = 'Noinstance';
//             // newActivationDocument.subOrderList = [Values.HTB_ActivationDocument_Valid.activationDocumentMrid];
//             newActivationDocument.eligibilityStatus =  EligibilityStatusType.FREligibilityPending;
//             newActivationDocument.eligibilityStatusEditable = true;
//             newActivationDocument.reconciliationStatus =  ReconciliationStatus.TOTAL;

//             await star.UpdateActivationDocument(transactionContext, JSON.stringify(newActivationDocument));

//             const expectedSite: Site = JSON.parse(JSON.stringify(Values.HTA_site_valid));
//             expectedSite.systemOperatorMarketParticipantName = 'enedis';
//             expectedSite.producerMarketParticipantName = 'EolienFR vert Cie';
//             expectedSite.docType = 'site';

//             const expected: ActivationDocument = JSON.parse(JSON.stringify(newActivationDocument));
//             expected.revisionNumber = '2';
//             expected.reconciliationStatus = '';
//             expected.receiverRole = 'Producer';
//             expected.potentialParent = false;
//             expected.potentialChild = true;

//             const activationDocumentCompositeKey = ActivationCompositeKeyIndexersController.getActivationDocumentCompositeKeyId(JSON.parse(JSON.stringify(expected)));
//             const compositeKeyIndex: ActivationDocumentCompositeKeyAbstract = {
//                 activationDocumentCompositeKey,
//                 activationDocumentMrid: expected.activationDocumentMrid,
//             };

//             const compositeKeyIndexed:IndexedData = {
//                 docType: DocType.DATA_INDEXER,
//                 indexId:activationDocumentCompositeKey,
//                 indexedDataAbstractMap: new Map()};
//             compositeKeyIndexed.indexedDataAbstractMap.set(activationDocumentCompositeKey, compositeKeyIndex);

//             const compositeKeyIndexedJSON = IndexedDataJson.toJson(compositeKeyIndexed);

//             const indexedDataAbstract: ActivationDocumentAbstract = {
//                 activationDocumentMrid: expected.activationDocumentMrid,
//                 registeredResourceMrid: expected.registeredResourceMrid,
//                 startCreatedDateTime: expected.startCreatedDateTime as string,
//             };

//             const expectedIndexer: IndexedData = {
//                 docType: DocType.DATA_INDEXER,
//                 indexedDataAbstractMap : new Map(),
//                 indexId: SiteActivationIndexersController.getKey(expected.registeredResourceMrid, new Date(expected.startCreatedDateTime as string)),
//             };
//             expectedIndexer.indexedDataAbstractMap?.set(expected.activationDocumentMrid, indexedDataAbstract);
//             const expectedIndexerJSON = IndexedDataJson.toJson(expectedIndexer);

//             const expectedDateMax: ActivationDocumentDateMax = {
//                 dateTime: expected.startCreatedDateTime as string,
//                 docType: DocType.INDEXER_MAX_DATE,
//             };
//             const expectedDateMaxId: string = SiteActivationIndexersController.getMaxKey(expected.registeredResourceMrid);

//             // params.logger.info("-----------")
//             // params.logger.info(transactionContext.stub.putPrivateData.getCall(0).args);
//             // params.logger.info("ooooooooo")
//             // params.logger.info(Buffer.from(transactionContext.stub.putPrivateData.getCall(0).args[2].toString()).toString('utf8'));
//             // params.logger.info(JSON.stringify(expectedSite))
//             // params.logger.info("-----------")
//             // params.logger.info(transactionContext.stub.putPrivateData.getCall(1).args);
//             // params.logger.info("ooooooooo")
//             // params.logger.info(Buffer.from(transactionContext.stub.putPrivateData.getCall(1).args[2].toString()).toString('utf8'));
//             // params.logger.info(JSON.stringify(expected))
//             // params.logger.info("-----------")
//             // params.logger.info(transactionContext.stub.putPrivateData.getCall(2).args);
//             // params.logger.info("ooooooooo")
//             // params.logger.info(Buffer.from(transactionContext.stub.putPrivateData.getCall(2).args[2].toString()).toString('utf8'));
//             // params.logger.info(JSON.stringify(compositeKeyIndexedJSON))
//             // params.logger.info("-----------")
//             // params.logger.info(transactionContext.stub.putPrivateData.getCall(3).args);
//             // params.logger.info("ooooooooo")
//             // params.logger.info(Buffer.from(transactionContext.stub.putPrivateData.getCall(3).args[2].toString()).toString('utf8'));
//             // params.logger.info(JSON.stringify(expectedIndexerJSON))
//             // params.logger.info("-----------")
//             // params.logger.info(transactionContext.stub.putPrivateData.getCall(4).args);
//             // params.logger.info("ooooooooo")
//             // params.logger.info(Buffer.from(transactionContext.stub.putPrivateData.getCall(4).args[2].toString()).toString('utf8'));
//             // params.logger.info(JSON.stringify(expectedDateMax))
//             // params.logger.info("-----------")
//             // params.logger.info(transactionContext.stub.putPrivateData.getCall(5).args);
//             // params.logger.info("ooooooooo")
//             // params.logger.info(Buffer.from(transactionContext.stub.putPrivateData.getCall(5).args[2].toString()).toString('utf8'));
//             // params.logger.info(JSON.stringify(feedbackProducer))
//             // params.logger.info("-----------")

//             transactionContext.stub.putPrivateData.getCall(0).should.have.been.calledWithExactly(
//                 'enedis-producer',
//                 Values.HTA_site_valid.meteringPointMrid,
//                 Buffer.from(JSON.stringify(expectedSite)),
//             );

//             transactionContext.stub.putPrivateData.getCall(1).should.have.been.calledWithExactly(
//                 'enedis-producer',
//                 expected.activationDocumentMrid,
//                 Buffer.from(JSON.stringify(expected)),
//             );

//             transactionContext.stub.putPrivateData.getCall(2).should.have.been.calledWithExactly(
//                 'enedis-producer',
//                 compositeKeyIndexedJSON.indexId,
//                 Buffer.from(JSON.stringify(compositeKeyIndexedJSON)),
//             );

//             transactionContext.stub.putPrivateData.getCall(3).should.have.been.calledWithExactly(
//                 'enedis-producer',
//                 expectedIndexerJSON.indexId,
//                 Buffer.from(JSON.stringify(expectedIndexerJSON)),
//             );

//             transactionContext.stub.putPrivateData.getCall(4).should.have.been.calledWithExactly(
//                 'enedis-producer',
//                 expectedDateMaxId,
//                 Buffer.from(JSON.stringify(expectedDateMax)),
//             );

//             transactionContext.stub.putPrivateData.getCall(5).should.have.been.calledWithExactly(
//                 'enedis-producer',
//                 feedbackProducer.feedbackProducerMrid,
//                 Buffer.from(JSON.stringify(feedbackProducer)),
//             );


// 			expect(transactionContext.stub.putPrivateData.callCount).to.equal(6);

//             ////////////////////////////////////////////////////////////////////////////
//             /////////// DELETION
//             ////////////////////////////////////////////////////////////////////////////

//             params.logger.info("********************************************")

//             const deletedActivationDocumentCompositeKey = ActivationCompositeKeyIndexersController.getActivationDocumentCompositeKeyId(JSON.parse(JSON.stringify(activationDocument)));

//             const indexIdNRJAmount = ActivationEnergyAmountIndexersController.getKey(activationDocument.activationDocumentMrid)

//             // params.logger.info("-----------")
//             // params.logger.info(transactionContext.stub.deletePrivateData.getCall(0).args);
//             // params.logger.info("ooooooooo")
//             // params.logger.info(Buffer.from(transactionContext.stub.deletePrivateData.getCall(0).args[1].toString()).toString('utf8'));
//             // params.logger.info(activationDocument.activationDocumentMrid)
//             // params.logger.info("-----------")
//             // params.logger.info(transactionContext.stub.deletePrivateData.getCall(1).args);
//             // params.logger.info("ooooooooo")
//             // params.logger.info(Buffer.from(transactionContext.stub.deletePrivateData.getCall(1).args[1].toString()).toString('utf8'));
//             // params.logger.info(deletedActivationDocumentCompositeKey)
//             // params.logger.info("-----------")
//             // params.logger.info(transactionContext.stub.deletePrivateData.getCall(2).args);
//             // params.logger.info("ooooooooo")
//             // params.logger.info(Buffer.from(transactionContext.stub.deletePrivateData.getCall(2).args[1].toString()).toString('utf8'));
//             // params.logger.info(feedbackProducer.feedbackProducerMrid)
//             // params.logger.info("-----------")
//             // params.logger.info(transactionContext.stub.deletePrivateData.getCall(3).args);
//             // params.logger.info("ooooooooo")
//             // params.logger.info(Buffer.from(transactionContext.stub.deletePrivateData.getCall(3).args[1].toString()).toString('utf8'));
//             // params.logger.info(indexIdNRJAmount)
//             // params.logger.info("-----------")
//             // params.logger.info(transactionContext.stub.deletePrivateData.getCall(4).args);
//             // params.logger.info("ooooooooo")
//             // params.logger.info(Buffer.from(transactionContext.stub.deletePrivateData.getCall(4).args[1].toString()).toString('utf8'));
//             // params.logger.info(feedbackProducer.feedbackProducerMrid)
//             // params.logger.info("-----------")

//             transactionContext.stub.deletePrivateData.getCall(0).should.have.been.calledWithExactly(
//                 'enedis-producer-rte',
//                 activationDocument.activationDocumentMrid
//             );

//             transactionContext.stub.deletePrivateData.getCall(1).should.have.been.calledWithExactly(
//                 'enedis-producer-rte',
//                 deletedActivationDocumentCompositeKey
//             );

//             transactionContext.stub.deletePrivateData.getCall(2).should.have.been.calledWithExactly(
//                 'enedis-producer-rte',
//                 feedbackProducer.feedbackProducerMrid
//             );

//             transactionContext.stub.deletePrivateData.getCall(3).should.have.been.calledWithExactly(
//                 'enedis-producer-rte',
//                 indexIdNRJAmount
//             );

//             transactionContext.stub.deletePrivateData.getCall(4).should.have.been.calledWithExactly(
//                 'enedis-producer-rte',
//                 feedbackProducer.feedbackProducerMrid
//             );

//             expect(transactionContext.stub.deletePrivateData.callCount).to.equal(5);
//         });






//         it('should return SUCCESS updateActivationDocument HTA with collection change and existing Energy Amount', async () => {
//             transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);

//             const params: STARParameters = await ParametersController.getParameterValues(transactionContext);

//             const activationDocument: ActivationDocument = JSON.parse(JSON.stringify(Values.HTA_ActivationDocument_Valid));
//             activationDocument.orderEnd = true;
//             activationDocument.receiverRole = RoleType.Role_Producer;
//             activationDocument.potentialParent = false;
//             activationDocument.potentialChild = true;
//             activationDocument.eligibilityStatus = EligibilityStatusType.EligibilityAccepted;
//             activationDocument.eligibilityStatusEditable = false;
//             activationDocument.reconciliationStatus = ReconciliationStatus.MISS;
//             activationDocument.docType = DocType.ACTIVATION_DOCUMENT;

//             transactionContext.stub.getPrivateData.withArgs('enedis-producer-rte', activationDocument.activationDocumentMrid).resolves(Buffer.from(JSON.stringify(activationDocument)));


//             const feedbackProducer: FeedbackProducer = {
//                 docType: DocType.FEEDBACK_PRODUCER,
//                 feedbackProducerMrid: FeedbackProducerController.getFeedbackProducerMrid(params, activationDocument.activationDocumentMrid),
//                 activationDocumentMrid: activationDocument.activationDocumentMrid,
//                 messageType: "B30",
//                 processType: "A42",
//                 revisionNumber: "0",
//                 indeminityStatus: IndeminityStatus.IN_PROGRESS,
//                 receiverMarketParticipantMrid: activationDocument.receiverMarketParticipantMrid,
//                 senderMarketParticipantMrid: activationDocument.senderMarketParticipantMrid,
//                 createdDateTime: activationDocument.startCreatedDateTime,
//             }

//             transactionContext.stub.getPrivateData.withArgs('enedis-producer-rte', feedbackProducer.feedbackProducerMrid).resolves(Buffer.from(JSON.stringify(feedbackProducer)));

//             const energyAmount: EnergyAmount = JSON.parse(JSON.stringify(Values.HTA_EnergyAmount))
//             energyAmount.docType = DocType.ENERGY_AMOUNT;

//             transactionContext.stub.getPrivateData.withArgs('enedis-producer-rte', energyAmount.energyAmountMarketDocumentMrid).resolves(Buffer.from(JSON.stringify(energyAmount)));

//             const energyAmountDataAbstract: EnergyAmountAbstract = {
//                 energyAmountMarketDocumentMrid: energyAmount.energyAmountMarketDocumentMrid
//             }

//             const energyAmountIndexer: IndexedData = {
//                 docType: DocType.DATA_INDEXER,
//                 indexedDataAbstractMap : new Map(),
//                 indexId: ActivationEnergyAmountIndexersController.getKey(activationDocument.activationDocumentMrid),
//             }
//             energyAmountIndexer.indexedDataAbstractMap.set(activationDocument.activationDocumentMrid, energyAmountDataAbstract);

//             const energyAmountIndexerJSON = IndexedDataJson.toJson(energyAmountIndexer);

//             transactionContext.stub.getPrivateData.withArgs('enedis-producer-rte', energyAmountIndexerJSON.indexId).resolves(Buffer.from(JSON.stringify(energyAmountIndexerJSON)));


//             transactionContext.stub.getState.withArgs(Values.HTA_systemoperator.systemOperatorMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_systemoperator)));
//             transactionContext.stub.getState.withArgs(Values.HTA_Producer.producerMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_Producer)));

//             transactionContext.stub.getPrivateData.withArgs('enedis-producer-rte', Values.HTA_site_valid.meteringPointMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_site_valid)));


//             const newActivationDocument: ActivationDocument = JSON.parse(JSON.stringify(activationDocument));

//             newActivationDocument.originAutomationRegisteredResourceMrid = Values.HTA_yellowPage2.originAutomationRegisteredResourceMrid;
//             // newActivationDocument.registeredResourceMrid = Values.HTA_site_valid_ProdA.meteringPointMrid;
//             // newActivationDocument.measurementUnitName = 'MW'
//             newActivationDocument.messageType = 'D01';
//             newActivationDocument.businessType = 'Z04';
//             // newActivationDocument.orderEnd = false;
//             // newActivationDocument.orderValue = 'X';
//             newActivationDocument.startCreatedDateTime = CommonService.increaseDateDaysStr(activationDocument.startCreatedDateTime as string, 10),
//             newActivationDocument.endCreatedDateTime = CommonService.increaseDateDaysStr(activationDocument.startCreatedDateTime as string, 11),
//             newActivationDocument.revisionNumber = '70';
//             newActivationDocument.reasonCode = 'Y99';
//             // newActivationDocument.senderMarketParticipantMrid = Values.HTA_systemoperator2.systemOperatorMarketParticipantMrid;
//             newActivationDocument.senderRole = 'NoSenderRole';
//             // newActivationDocument.receiverMarketParticipantMrid = Values.HTA_Producer2.producerMarketParticipantMrid;
//             newActivationDocument.receiverRole = 'NoReceiverRole';
//             newActivationDocument.potentialParent = true;
//             newActivationDocument.potentialChild = false;
//             newActivationDocument.instance = 'Noinstance';
//             // newActivationDocument.subOrderList = [Values.HTB_ActivationDocument_Valid.activationDocumentMrid];
//             newActivationDocument.eligibilityStatus =  EligibilityStatusType.FREligibilityPending;
//             newActivationDocument.eligibilityStatusEditable = true;
//             newActivationDocument.reconciliationStatus =  ReconciliationStatus.TOTAL;

//             await star.UpdateActivationDocument(transactionContext, JSON.stringify(newActivationDocument));

//             const expectedSite: Site = JSON.parse(JSON.stringify(Values.HTA_site_valid));
//             expectedSite.systemOperatorMarketParticipantName = 'enedis';
//             expectedSite.producerMarketParticipantName = 'EolienFR vert Cie';
//             expectedSite.docType = 'site';

//             const expected: ActivationDocument = JSON.parse(JSON.stringify(newActivationDocument));
//             expected.revisionNumber = '2';
//             expected.reconciliationStatus = '';
//             expected.receiverRole = 'Producer';
//             expected.potentialParent = false;
//             expected.potentialChild = true;

//             const activationDocumentCompositeKey = ActivationCompositeKeyIndexersController.getActivationDocumentCompositeKeyId(JSON.parse(JSON.stringify(expected)));
//             const compositeKeyIndex: ActivationDocumentCompositeKeyAbstract = {
//                 activationDocumentCompositeKey,
//                 activationDocumentMrid: expected.activationDocumentMrid,
//             };

//             const compositeKeyIndexed:IndexedData = {
//                 docType: DocType.DATA_INDEXER,
//                 indexId:activationDocumentCompositeKey,
//                 indexedDataAbstractMap: new Map()};
//             compositeKeyIndexed.indexedDataAbstractMap.set(activationDocumentCompositeKey, compositeKeyIndex);

//             const compositeKeyIndexedJSON = IndexedDataJson.toJson(compositeKeyIndexed);

//             const indexedDataAbstract: ActivationDocumentAbstract = {
//                 activationDocumentMrid: expected.activationDocumentMrid,
//                 registeredResourceMrid: expected.registeredResourceMrid,
//                 startCreatedDateTime: expected.startCreatedDateTime as string,
//             };

//             const expectedIndexer: IndexedData = {
//                 docType: DocType.DATA_INDEXER,
//                 indexedDataAbstractMap : new Map(),
//                 indexId: SiteActivationIndexersController.getKey(expected.registeredResourceMrid, new Date(expected.startCreatedDateTime as string)),
//             };
//             expectedIndexer.indexedDataAbstractMap?.set(expected.activationDocumentMrid, indexedDataAbstract);
//             const expectedIndexerJSON = IndexedDataJson.toJson(expectedIndexer);

//             const expectedDateMax: ActivationDocumentDateMax = {
//                 dateTime: expected.startCreatedDateTime as string,
//                 docType: DocType.INDEXER_MAX_DATE,
//             };
//             const expectedDateMaxId: string = SiteActivationIndexersController.getMaxKey(expected.registeredResourceMrid);

//             // params.logger.info("-----------")
//             // params.logger.info(transactionContext.stub.putPrivateData.getCall(0).args);
//             // params.logger.info("ooooooooo")
//             // params.logger.info(Buffer.from(transactionContext.stub.putPrivateData.getCall(0).args[2].toString()).toString('utf8'));
//             // params.logger.info(JSON.stringify(expectedSite))
//             // params.logger.info("-----------")
//             // params.logger.info(transactionContext.stub.putPrivateData.getCall(1).args);
//             // params.logger.info("ooooooooo")
//             // params.logger.info(Buffer.from(transactionContext.stub.putPrivateData.getCall(1).args[2].toString()).toString('utf8'));
//             // params.logger.info(JSON.stringify(expected))
//             // params.logger.info("-----------")
//             // params.logger.info(transactionContext.stub.putPrivateData.getCall(2).args);
//             // params.logger.info("ooooooooo")
//             // params.logger.info(Buffer.from(transactionContext.stub.putPrivateData.getCall(2).args[2].toString()).toString('utf8'));
//             // params.logger.info(JSON.stringify(compositeKeyIndexedJSON))
//             // params.logger.info("-----------")
//             // params.logger.info(transactionContext.stub.putPrivateData.getCall(3).args);
//             // params.logger.info("ooooooooo")
//             // params.logger.info(Buffer.from(transactionContext.stub.putPrivateData.getCall(3).args[2].toString()).toString('utf8'));
//             // params.logger.info(JSON.stringify(expectedIndexerJSON))
//             // params.logger.info("-----------")
//             // params.logger.info(transactionContext.stub.putPrivateData.getCall(4).args);
//             // params.logger.info("ooooooooo")
//             // params.logger.info(Buffer.from(transactionContext.stub.putPrivateData.getCall(4).args[2].toString()).toString('utf8'));
//             // params.logger.info(JSON.stringify(expectedDateMax))
//             // params.logger.info("-----------")
//             // params.logger.info(transactionContext.stub.putPrivateData.getCall(5).args);
//             // params.logger.info("ooooooooo")
//             // params.logger.info(Buffer.from(transactionContext.stub.putPrivateData.getCall(5).args[2].toString()).toString('utf8'));
//             // params.logger.info(JSON.stringify(feedbackProducer))
//             // params.logger.info("-----------")

//             transactionContext.stub.putPrivateData.getCall(0).should.have.been.calledWithExactly(
//                 'enedis-producer',
//                 Values.HTA_site_valid.meteringPointMrid,
//                 Buffer.from(JSON.stringify(expectedSite)),
//             );

//             transactionContext.stub.putPrivateData.getCall(1).should.have.been.calledWithExactly(
//                 'enedis-producer',
//                 expected.activationDocumentMrid,
//                 Buffer.from(JSON.stringify(expected)),
//             );

//             transactionContext.stub.putPrivateData.getCall(2).should.have.been.calledWithExactly(
//                 'enedis-producer',
//                 compositeKeyIndexedJSON.indexId,
//                 Buffer.from(JSON.stringify(compositeKeyIndexedJSON)),
//             );

//             transactionContext.stub.putPrivateData.getCall(3).should.have.been.calledWithExactly(
//                 'enedis-producer',
//                 expectedIndexerJSON.indexId,
//                 Buffer.from(JSON.stringify(expectedIndexerJSON)),
//             );

//             transactionContext.stub.putPrivateData.getCall(4).should.have.been.calledWithExactly(
//                 'enedis-producer',
//                 expectedDateMaxId,
//                 Buffer.from(JSON.stringify(expectedDateMax)),
//             );

//             transactionContext.stub.putPrivateData.getCall(5).should.have.been.calledWithExactly(
//                 'enedis-producer',
//                 feedbackProducer.feedbackProducerMrid,
//                 Buffer.from(JSON.stringify(feedbackProducer)),
//             );


// 			expect(transactionContext.stub.putPrivateData.callCount).to.equal(6);

//             ////////////////////////////////////////////////////////////////////////////
//             /////////// DELETION
//             ////////////////////////////////////////////////////////////////////////////

//             params.logger.info("********************************************")

//             const deletedActivationDocumentCompositeKey = ActivationCompositeKeyIndexersController.getActivationDocumentCompositeKeyId(JSON.parse(JSON.stringify(activationDocument)));

//             const indexIdNRJAmount = ActivationEnergyAmountIndexersController.getKey(activationDocument.activationDocumentMrid)

//             // params.logger.info("-----------")
//             // params.logger.info(transactionContext.stub.deletePrivateData.getCall(0).args);
//             // params.logger.info("ooooooooo")
//             // params.logger.info(Buffer.from(transactionContext.stub.deletePrivateData.getCall(0).args[1].toString()).toString('utf8'));
//             // params.logger.info(activationDocument.activationDocumentMrid)
//             // params.logger.info("-----------")
//             // params.logger.info(transactionContext.stub.deletePrivateData.getCall(1).args);
//             // params.logger.info("ooooooooo")
//             // params.logger.info(Buffer.from(transactionContext.stub.deletePrivateData.getCall(1).args[1].toString()).toString('utf8'));
//             // params.logger.info(deletedActivationDocumentCompositeKey)
//             // params.logger.info("-----------")
//             // params.logger.info(transactionContext.stub.deletePrivateData.getCall(2).args);
//             // params.logger.info("ooooooooo")
//             // params.logger.info(Buffer.from(transactionContext.stub.deletePrivateData.getCall(2).args[1].toString()).toString('utf8'));
//             // params.logger.info(feedbackProducer.feedbackProducerMrid)
//             // params.logger.info("-----------")
//             // params.logger.info(transactionContext.stub.deletePrivateData.getCall(3).args);
//             // params.logger.info("ooooooooo")
//             // params.logger.info(Buffer.from(transactionContext.stub.deletePrivateData.getCall(3).args[1].toString()).toString('utf8'));
//             // params.logger.info(indexIdNRJAmount)
//             // params.logger.info("-----------")
//             // params.logger.info(transactionContext.stub.deletePrivateData.getCall(4).args);
//             // params.logger.info("ooooooooo")
//             // params.logger.info(Buffer.from(transactionContext.stub.deletePrivateData.getCall(4).args[1].toString()).toString('utf8'));
//             // params.logger.info(energyAmount.energyAmountMarketDocumentMrid)
//             // params.logger.info("-----------")
//             // params.logger.info(transactionContext.stub.deletePrivateData.getCall(5).args);
//             // params.logger.info("ooooooooo")
//             // params.logger.info(Buffer.from(transactionContext.stub.deletePrivateData.getCall(5).args[1].toString()).toString('utf8'));
//             // params.logger.info(feedbackProducer.feedbackProducerMrid)
//             // params.logger.info("-----------")

//             transactionContext.stub.deletePrivateData.getCall(0).should.have.been.calledWithExactly(
//                 'enedis-producer-rte',
//                 activationDocument.activationDocumentMrid
//             );

//             transactionContext.stub.deletePrivateData.getCall(1).should.have.been.calledWithExactly(
//                 'enedis-producer-rte',
//                 deletedActivationDocumentCompositeKey
//             );

//             transactionContext.stub.deletePrivateData.getCall(2).should.have.been.calledWithExactly(
//                 'enedis-producer-rte',
//                 feedbackProducer.feedbackProducerMrid
//             );

//             transactionContext.stub.deletePrivateData.getCall(3).should.have.been.calledWithExactly(
//                 'enedis-producer-rte',
//                 indexIdNRJAmount
//             );

//             transactionContext.stub.deletePrivateData.getCall(4).should.have.been.calledWithExactly(
//                 'enedis-producer-rte',
//                 energyAmount.energyAmountMarketDocumentMrid
//             );

//             transactionContext.stub.deletePrivateData.getCall(5).should.have.been.calledWithExactly(
//                 'enedis-producer-rte',
//                 feedbackProducer.feedbackProducerMrid
//             );

//             expect(transactionContext.stub.deletePrivateData.callCount).to.equal(6);
//         });
//     });
});
