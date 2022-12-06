'use strict';
const sinon = require('sinon');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinonChai = require('sinon-chai');
const expect = chai.expect;

import { ChaincodeStub, ClientIdentity } from 'fabric-shim'

import { Star } from '../src/star'
import { STARParameters } from '../src/model/starParameters';

import { OrganizationTypeMsp } from '../src/enums/OrganizationMspType';

import { Values } from './Values';
import { ParametersType } from '../src/enums/ParametersType';
import { ParametersController } from '../src/controller/ParametersController';
import { DocType } from '../src/enums/DocType';
import { FeedbackProducer } from '../src/model/feedbackProducer';
import { HLFServices } from '../src/controller/service/HLFservice';
import { CommonService } from '../src/controller/service/CommonService';
import { IndeminityStatus } from '../src/enums/IndemnityStatus';
import { EnergyAmountAbstract } from '../src/model/dataIndex/energyAmountAbstract';
import { ActivationEnergyAmountIndexersController } from '../src/controller/dataIndex/ActivationEnergyAmountIndexersController';
import { IndexedDataJson } from '../src/model/dataIndexersJson';
import { SiteReserveBidIndexersController } from '../src/controller/dataIndex/SiteReserveBidIndexersController';
import { ReserveBidMarketDocumentAbstract } from '../src/model/dataIndex/reserveBidMarketDocumentAbstract';
import { ReserveBidStatus } from '../src/enums/ReserveBidStatus';
import { ReserveBidMarketDocument } from '../src/model/reserveBidMarketDocument';
import { ActivationDocument } from '../src/model/activationDocument/activationDocument';
import { EnergyAmount } from '../src/model/energyAmount';
import { BalancingDocument } from '../src/model/balancingDocument';
import { BalancingDocumentController } from '../src/controller/BalancingDocumentController';


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

describe('Star Tests FeedbackProducer', () => {
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




    describe('Test UpdateFeedbackProducer', () => {
        it('should return ERROR UpdateFeedbackProducer - Organisation ENEDIS does not have rights to comment', async () => {
            const feedbackProducer:FeedbackProducer = JSON.parse(JSON.stringify(Values.HTB_FeedbackProducer));

            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);

            const feedbackProducerComment: string = '';

            try {
                await star.UpdateFeedbackProducer(transactionContext, feedbackProducer.activationDocumentMrid, feedbackProducerComment, '');
            } catch(err) {
                // params.logger.info(err.message)
                expect(err.message).to.equal(`Organisation, ${OrganizationTypeMsp.ENEDIS} does not have rights to comment Activation Document`);
            }
        });



        it('should return ERROR UpdateFeedbackProducer - Organisation RTE does not have rights to comment', async () => {
            const feedbackProducer:FeedbackProducer = JSON.parse(JSON.stringify(Values.HTB_FeedbackProducer));

            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);

            const feedbackProducerComment: string = '';

            try {
                await star.UpdateFeedbackProducer(transactionContext, feedbackProducer.activationDocumentMrid, feedbackProducerComment, '');
            } catch(err) {
                // params.logger.info(err.message)
                expect(err.message).to.equal(`Organisation, ${OrganizationTypeMsp.RTE} does not have rights to comment Activation Document`);
            }
        });



        it('should return ERROR UpdateFeedbackProducer - no feedback to update', async () => {
            const feedbackProducer:FeedbackProducer = JSON.parse(JSON.stringify(Values.HTA_FeedbackProducer));

            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.PRODUCER);

            const feedbackProducerComment: string = '';

            try {
                await star.UpdateFeedbackProducer(transactionContext, feedbackProducer.activationDocumentMrid, feedbackProducerComment, '');
            } catch(err) {
                // params.logger.info(err.message)
                expect(err.message).to.equal(`ERROR updateFeedbackProducer : no feedback to update.`);
            }
        });



        it('should return ERROR UpdateFeedbackProducer - feedbackProducer does not exist', async () => {
            const feedbackProducer:FeedbackProducer = JSON.parse(JSON.stringify(Values.HTA_FeedbackProducer));

            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.PRODUCER);

            const feedbackProducerComment: string = 'feedbackProducerComment';

            const activationDocumentObj: ActivationDocument = JSON.parse(JSON.stringify(Values.HTA_ActivationDocument_Valid));
            const energyAmountObj: EnergyAmount = JSON.parse(JSON.stringify(Values.HTA_EnergyAmount));

            const valueAbstract: EnergyAmountAbstract = {
                energyAmountMarketDocumentMrid: energyAmountObj.energyAmountMarketDocumentMrid};
            const indexEnergyAmountId = ActivationEnergyAmountIndexersController.getKey(energyAmountObj.activationDocumentMrid);

            const indexEnergyAmount = {
                docType: DocType.DATA_INDEXER,
                indexId: indexEnergyAmountId,
                indexedDataAbstractMap: new Map()
            }

            indexEnergyAmount.indexedDataAbstractMap.set(energyAmountObj.activationDocumentMrid, valueAbstract);

            const reserveBidObj:ReserveBidMarketDocument = JSON.parse(JSON.stringify(Values.HTA_ReserveBidMarketDocument_1_Full));;
            reserveBidObj.reserveBidStatus = ReserveBidStatus.VALIDATED;

            const reserveBidMarketDocumentAbstract: ReserveBidMarketDocumentAbstract = {
                createdDateTime: reserveBidObj.createdDateTime,
                reserveBidMrid: reserveBidObj.reserveBidMrid,
                reserveBidStatus: reserveBidObj.reserveBidStatus,
                validityPeriodStartDateTime: reserveBidObj.validityPeriodStartDateTime};
            const indexIdReserveBidId = SiteReserveBidIndexersController.getKey(reserveBidObj.meteringPointMrid);

            const indexIdReserveBid = {
                docType: DocType.DATA_INDEXER,
                indexId: indexIdReserveBidId,
                indexedDataAbstractMap: new Map()
            }

            indexIdReserveBid.indexedDataAbstractMap.set(reserveBidObj.reserveBidMrid, reserveBidMarketDocumentAbstract);


            transactionContext.stub.getPrivateData.withArgs('enedis-producer',
                activationDocumentObj.activationDocumentMrid).resolves(Buffer.from(JSON.stringify(activationDocumentObj)));

            transactionContext.stub.getPrivateData.withArgs('enedis-producer',
                energyAmountObj.energyAmountMarketDocumentMrid).resolves(Buffer.from(JSON.stringify(energyAmountObj)));

            const objEnergyAmountJSON = IndexedDataJson.toJson(indexEnergyAmount);
            objEnergyAmountJSON.docType = DocType.DATA_INDEXER;
            transactionContext.stub.getPrivateData.withArgs('enedis-producer',
                objEnergyAmountJSON.indexId).resolves(Buffer.from(JSON.stringify(objEnergyAmountJSON)));

            transactionContext.stub.getPrivateData.withArgs('enedis-producer',
                reserveBidObj.reserveBidMrid).resolves(Buffer.from(JSON.stringify(reserveBidObj)));

            const objReserveBidJSON = IndexedDataJson.toJson(indexIdReserveBid);
            objReserveBidJSON.docType = DocType.DATA_INDEXER;
            transactionContext.stub.getPrivateData.withArgs('enedis-producer',
                objReserveBidJSON.indexId).resolves(Buffer.from(JSON.stringify(objReserveBidJSON)));

            try {
                await star.UpdateFeedbackProducer(transactionContext, feedbackProducer.activationDocumentMrid, feedbackProducerComment, '');
            } catch(err) {
                // params.logger.info(err.message)
                expect(err.message).to.equal(
                    `ERROR updateFeedbackProducer : feedbackProducer : ${feedbackProducer.feedbackProducerMrid} does not exist (not found in any collection).`);
            }
        });



        it('should return ERROR UpdateFeedbackProducer - comment could only be sent before', async () => {
            const feedbackProducer:FeedbackProducer = JSON.parse(JSON.stringify(Values.HTA_FeedbackProducer));
            feedbackProducer.validityPeriodEndDateTime = CommonService.reduceDateDaysStr(JSON.parse(JSON.stringify(feedbackProducer.validityPeriodEndDateTime)), 10)

            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.PRODUCER);

            const feedbackProducerComment: string = 'feedbackProducerComment';

            transactionContext.stub.getPrivateData.withArgs('enedis-producer',
                feedbackProducer.feedbackProducerMrid).resolves(Buffer.from(JSON.stringify(feedbackProducer)));


            const activationDocumentObj: ActivationDocument = JSON.parse(JSON.stringify(Values.HTA_ActivationDocument_Valid));
            const energyAmountObj: EnergyAmount = JSON.parse(JSON.stringify(Values.HTA_EnergyAmount));

            const valueAbstract: EnergyAmountAbstract = {
                energyAmountMarketDocumentMrid: energyAmountObj.energyAmountMarketDocumentMrid};
            const indexEnergyAmountId = ActivationEnergyAmountIndexersController.getKey(energyAmountObj.activationDocumentMrid);

            const indexEnergyAmount = {
                docType: DocType.DATA_INDEXER,
                indexId: indexEnergyAmountId,
                indexedDataAbstractMap: new Map()
            }

            indexEnergyAmount.indexedDataAbstractMap.set(energyAmountObj.activationDocumentMrid, valueAbstract);

            const reserveBidObj:ReserveBidMarketDocument = JSON.parse(JSON.stringify(Values.HTA_ReserveBidMarketDocument_1_Full));;
            reserveBidObj.reserveBidStatus = ReserveBidStatus.VALIDATED;

            const reserveBidMarketDocumentAbstract: ReserveBidMarketDocumentAbstract = {
                createdDateTime: reserveBidObj.createdDateTime,
                reserveBidMrid: reserveBidObj.reserveBidMrid,
                reserveBidStatus: reserveBidObj.reserveBidStatus,
                validityPeriodStartDateTime: reserveBidObj.validityPeriodStartDateTime};
            const indexIdReserveBidId = SiteReserveBidIndexersController.getKey(reserveBidObj.meteringPointMrid);

            const indexIdReserveBid = {
                docType: DocType.DATA_INDEXER,
                indexId: indexIdReserveBidId,
                indexedDataAbstractMap: new Map()
            }

            indexIdReserveBid.indexedDataAbstractMap.set(reserveBidObj.reserveBidMrid, reserveBidMarketDocumentAbstract);


            transactionContext.stub.getPrivateData.withArgs('enedis-producer',
                activationDocumentObj.activationDocumentMrid).resolves(Buffer.from(JSON.stringify(activationDocumentObj)));

            transactionContext.stub.getPrivateData.withArgs('enedis-producer',
                energyAmountObj.energyAmountMarketDocumentMrid).resolves(Buffer.from(JSON.stringify(energyAmountObj)));

            const objEnergyAmountJSON = IndexedDataJson.toJson(indexEnergyAmount);
            objEnergyAmountJSON.docType = DocType.DATA_INDEXER;
            transactionContext.stub.getPrivateData.withArgs('enedis-producer',
                objEnergyAmountJSON.indexId).resolves(Buffer.from(JSON.stringify(objEnergyAmountJSON)));

            transactionContext.stub.getPrivateData.withArgs('enedis-producer',
                reserveBidObj.reserveBidMrid).resolves(Buffer.from(JSON.stringify(reserveBidObj)));

            const objReserveBidJSON = IndexedDataJson.toJson(indexIdReserveBid);
            objReserveBidJSON.docType = DocType.DATA_INDEXER;
            transactionContext.stub.getPrivateData.withArgs('enedis-producer',
                objReserveBidJSON.indexId).resolves(Buffer.from(JSON.stringify(objReserveBidJSON)));

            try {
                await star.UpdateFeedbackProducer(transactionContext, feedbackProducer.activationDocumentMrid, feedbackProducerComment, '');
            } catch(err) {
                // params.logger.info(err.message)
                expect(err.message).to.equal(`ERROR updateFeedbackProducer : comment could only be sent before ${feedbackProducer.validityPeriodEndDateTime}`);
            }
        });



        it('should return SUCCESS UpdateFeedbackProducer HTA by PRODUCER.', async () => {
            const feedbackProducer:FeedbackProducer = JSON.parse(JSON.stringify(Values.HTA_FeedbackProducer));
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.PRODUCER);

            const feedbackProducerComment: string = 'feedbackProducerComment';

            const params: STARParameters = await ParametersController.getParameterValues(transactionContext);

            transactionContext.stub.getPrivateData.withArgs('enedis-producer',
                feedbackProducer.feedbackProducerMrid).resolves(Buffer.from(JSON.stringify(feedbackProducer)));

            const activationDocumentObj: ActivationDocument = JSON.parse(JSON.stringify(Values.HTA_ActivationDocument_Valid));
            const energyAmountObj: EnergyAmount = JSON.parse(JSON.stringify(Values.HTA_EnergyAmount));

            const valueAbstract: EnergyAmountAbstract = {
                energyAmountMarketDocumentMrid: energyAmountObj.energyAmountMarketDocumentMrid};
            const indexEnergyAmountId = ActivationEnergyAmountIndexersController.getKey(energyAmountObj.activationDocumentMrid);

            const indexEnergyAmount = {
                docType: DocType.DATA_INDEXER,
                indexId: indexEnergyAmountId,
                indexedDataAbstractMap: new Map()
            }

            indexEnergyAmount.indexedDataAbstractMap.set(energyAmountObj.activationDocumentMrid, valueAbstract);

            const reserveBidObj:ReserveBidMarketDocument = JSON.parse(JSON.stringify(Values.HTA_ReserveBidMarketDocument_1_Full));;
            reserveBidObj.reserveBidStatus = ReserveBidStatus.VALIDATED;

            const reserveBidMarketDocumentAbstract: ReserveBidMarketDocumentAbstract = {
                createdDateTime: reserveBidObj.createdDateTime,
                reserveBidMrid: reserveBidObj.reserveBidMrid,
                reserveBidStatus: reserveBidObj.reserveBidStatus,
                validityPeriodStartDateTime: reserveBidObj.validityPeriodStartDateTime};
            const indexIdReserveBidId = SiteReserveBidIndexersController.getKey(reserveBidObj.meteringPointMrid);

            const indexIdReserveBid = {
                docType: DocType.DATA_INDEXER,
                indexId: indexIdReserveBidId,
                indexedDataAbstractMap: new Map()
            }

            indexIdReserveBid.indexedDataAbstractMap.set(reserveBidObj.reserveBidMrid, reserveBidMarketDocumentAbstract);


            transactionContext.stub.getPrivateData.withArgs('enedis-producer',
                activationDocumentObj.activationDocumentMrid).resolves(Buffer.from(JSON.stringify(activationDocumentObj)));

            transactionContext.stub.getPrivateData.withArgs('enedis-producer',
                energyAmountObj.energyAmountMarketDocumentMrid).resolves(Buffer.from(JSON.stringify(energyAmountObj)));

            const objEnergyAmountJSON = IndexedDataJson.toJson(indexEnergyAmount);
            objEnergyAmountJSON.docType = DocType.DATA_INDEXER;
            transactionContext.stub.getPrivateData.withArgs('enedis-producer',
                objEnergyAmountJSON.indexId).resolves(Buffer.from(JSON.stringify(objEnergyAmountJSON)));

            transactionContext.stub.getPrivateData.withArgs('enedis-producer',
                reserveBidObj.reserveBidMrid).resolves(Buffer.from(JSON.stringify(reserveBidObj)));

            const objReserveBidJSON = IndexedDataJson.toJson(indexIdReserveBid);
            objReserveBidJSON.docType = DocType.DATA_INDEXER;
            transactionContext.stub.getPrivateData.withArgs('enedis-producer',
                objReserveBidJSON.indexId).resolves(Buffer.from(JSON.stringify(objReserveBidJSON)));

            await star.UpdateFeedbackProducer(transactionContext, feedbackProducer.activationDocumentMrid, feedbackProducerComment, '');

            const expected: FeedbackProducer = JSON.parse(JSON.stringify(feedbackProducer))
            expected.feedback = feedbackProducerComment;
            expected.revisionNumber = '2';

            // params.logger.info("-----------")
            // params.logger.info(transactionContext.stub.putPrivateData.firstCall.args);
            // params.logger.info("ooooooooo")
            // params.logger.info(Buffer.from(transactionContext.stub.putPrivateData.firstCall.args[2].toString()).toString('utf8'));
            // params.logger.info(JSON.stringify(expected))
            // params.logger.info("-----------")

            transactionContext.stub.putPrivateData.firstCall.should.have.been.calledWithExactly(
                'enedis-producer',
                expected.feedbackProducerMrid,
                Buffer.from(JSON.stringify(expected))
            );

            expect(transactionContext.stub.putPrivateData.callCount).to.equal(1);
        });


        it('should return SUCCESS UpdateFeedbackProducer HTB by PRODUCER.', async () => {
            const feedbackProducer:FeedbackProducer = JSON.parse(JSON.stringify(Values.HTB_FeedbackProducer));
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.PRODUCER);

            const feedbackProducerComment: string = 'feedbackProducerComment';

            const params: STARParameters = await ParametersController.getParameterValues(transactionContext);

            transactionContext.stub.getPrivateData.withArgs('producer-rte',
                feedbackProducer.feedbackProducerMrid).resolves(Buffer.from(JSON.stringify(feedbackProducer)));

            const activationDocumentObj: ActivationDocument = JSON.parse(JSON.stringify(Values.HTB_ActivationDocument_Valid));
            const energyAmountObj: EnergyAmount = JSON.parse(JSON.stringify(Values.HTB_EnergyAmount));

            const valueAbstract: EnergyAmountAbstract = {
                energyAmountMarketDocumentMrid: energyAmountObj.energyAmountMarketDocumentMrid};
            const indexEnergyAmountId = ActivationEnergyAmountIndexersController.getKey(energyAmountObj.activationDocumentMrid);

            const indexEnergyAmount = {
                docType: DocType.DATA_INDEXER,
                indexId: indexEnergyAmountId,
                indexedDataAbstractMap: new Map()
            }

            indexEnergyAmount.indexedDataAbstractMap.set(energyAmountObj.activationDocumentMrid, valueAbstract);

            const reserveBidObj:ReserveBidMarketDocument = JSON.parse(JSON.stringify(Values.HTB_ReserveBidMarketDocument_1_Full));;
            reserveBidObj.reserveBidStatus = ReserveBidStatus.VALIDATED;

            const reserveBidMarketDocumentAbstract: ReserveBidMarketDocumentAbstract = {
                createdDateTime: reserveBidObj.createdDateTime,
                reserveBidMrid: reserveBidObj.reserveBidMrid,
                reserveBidStatus: reserveBidObj.reserveBidStatus,
                validityPeriodStartDateTime: reserveBidObj.validityPeriodStartDateTime};
            const indexIdReserveBidId = SiteReserveBidIndexersController.getKey(Values.HTB_ReserveBidMarketDocument_1_Full.meteringPointMrid);

            const indexIdReserveBid = {
                docType: DocType.DATA_INDEXER,
                indexId: indexIdReserveBidId,
                indexedDataAbstractMap: new Map()
            }

            indexIdReserveBid.indexedDataAbstractMap.set(reserveBidObj.reserveBidMrid, reserveBidMarketDocumentAbstract);


            transactionContext.stub.getPrivateData.withArgs('producer-rte',
                activationDocumentObj.activationDocumentMrid).resolves(Buffer.from(JSON.stringify(activationDocumentObj)));

            transactionContext.stub.getPrivateData.withArgs('producer-rte',
                energyAmountObj.energyAmountMarketDocumentMrid).resolves(Buffer.from(JSON.stringify(energyAmountObj)));

            const objEnergyAmountJSON = IndexedDataJson.toJson(indexEnergyAmount);
            objEnergyAmountJSON.docType = DocType.DATA_INDEXER;
            transactionContext.stub.getPrivateData.withArgs('producer-rte',
                objEnergyAmountJSON.indexId).resolves(Buffer.from(JSON.stringify(objEnergyAmountJSON)));

            transactionContext.stub.getPrivateData.withArgs('producer-rte',
                reserveBidObj.reserveBidMrid).resolves(Buffer.from(JSON.stringify(reserveBidObj)));

            const objReserveBidJSON = IndexedDataJson.toJson(indexIdReserveBid);
            objReserveBidJSON.docType = DocType.DATA_INDEXER;
            transactionContext.stub.getPrivateData.withArgs('producer-rte',
                objReserveBidJSON.indexId).resolves(Buffer.from(JSON.stringify(objReserveBidJSON)));

            await star.UpdateFeedbackProducer(transactionContext, feedbackProducer.activationDocumentMrid, feedbackProducerComment, '');

            const expected: FeedbackProducer = JSON.parse(JSON.stringify(feedbackProducer))
            expected.feedback = feedbackProducerComment;
            expected.revisionNumber = '2';

            // params.logger.info("-----------")
            // params.logger.info(transactionContext.stub.putPrivateData.firstCall.args);
            // params.logger.info("ooooooooo")
            // params.logger.info(Buffer.from(transactionContext.stub.putPrivateData.firstCall.args[2].toString()).toString('utf8'));
            // params.logger.info(JSON.stringify(expected))
            // params.logger.info("-----------")

            transactionContext.stub.putPrivateData.firstCall.should.have.been.calledWithExactly(
                'producer-rte',
                expected.feedbackProducerMrid,
                Buffer.from(JSON.stringify(expected))
            );

            expect(transactionContext.stub.putPrivateData.callCount).to.equal(1);
        });

    });



    describe('Test updateFeedbackProducerAnswer', () => {
        it('should return ERROR UpdateFeedbackProducer - Organisation does not have rights', async () => {
            const feedbackProducer:FeedbackProducer = JSON.parse(JSON.stringify(Values.HTB_FeedbackProducerWithComment));
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.PRODUCER);

            const feedbackProducerAnswer: string = '';

            try {
                await star.UpdateFeedbackProducerAnswer(transactionContext, feedbackProducer.activationDocumentMrid, feedbackProducerAnswer);
            } catch(err) {
                // params.logger.info(err.message)
                expect(err.message).to.equal(
                    `Organisation, ${OrganizationTypeMsp.PRODUCER} does not have rights to give elements to the comment of the Activation Document`);
            }

        });




        it('should return ERROR UpdateFeedbackProducer - no answer to update', async () => {
            const feedbackProducer:FeedbackProducer = JSON.parse(JSON.stringify(Values.HTB_FeedbackProducerWithComment));
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);

            const feedbackProducerAnswer: string = '';

            try {
                await star.UpdateFeedbackProducerAnswer(transactionContext, feedbackProducer.activationDocumentMrid, feedbackProducerAnswer);
            } catch(err) {
                // params.logger.info(err.message)
                expect(err.message).to.equal(
                    `ERROR updateFeedbackProducerAnswer : no answer to update.`);
            }

        });




        it('should return ERROR UpdateFeedbackProducer - feedbackProducer does not exist', async () => {
            const feedbackProducer:FeedbackProducer = JSON.parse(JSON.stringify(Values.HTB_FeedbackProducerWithComment));
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);

            const feedbackProducerAnswer: string = 'feedbackProducerAnswer';

            try {
                await star.UpdateFeedbackProducerAnswer(transactionContext, feedbackProducer.activationDocumentMrid, feedbackProducerAnswer);
            } catch(err) {
                // params.logger.info(err.message)
                expect(err.message).to.equal(
                    `ERROR updateFeedbackProducerAnswer : feedbackProducer : ${feedbackProducer.feedbackProducerMrid} does not exist (not found in any collection).`);
            }

        });




        it('should return ERROR UpdateFeedbackProducer - no feedback to update answer to', async () => {
            const feedbackProducer:FeedbackProducer = JSON.parse(JSON.stringify(Values.HTB_FeedbackProducerWithComment));
            feedbackProducer.feedback= '';

            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);

            const feedbackProducerAnswer: string = 'feedbackProducerAnswer';

            transactionContext.stub.getPrivateData.withArgs('enedis-producer-rte',
                feedbackProducer.feedbackProducerMrid).resolves(Buffer.from(JSON.stringify(feedbackProducer)));

            try {
                await star.UpdateFeedbackProducerAnswer(transactionContext, feedbackProducer.activationDocumentMrid, feedbackProducerAnswer);
            } catch(err) {
                // params.logger.info(err.message)
                expect(err.message).to.equal(
                    `ERROR updateFeedbackProducerAnswer : no feedback to update answer to.`);
            }

        });




        it('should return ERROR UpdateFeedbackProducer - systemOperator does not exist for Feedback', async () => {
            const feedbackProducer:FeedbackProducer = JSON.parse(JSON.stringify(Values.HTB_FeedbackProducerWithComment));
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);

            const feedbackProducerAnswer: string = 'feedbackProducerAnswer';

            transactionContext.stub.getPrivateData.withArgs('enedis-producer-rte',
                feedbackProducer.feedbackProducerMrid).resolves(Buffer.from(JSON.stringify(feedbackProducer)));

            try {
                await star.UpdateFeedbackProducerAnswer(transactionContext, feedbackProducer.activationDocumentMrid, feedbackProducerAnswer);
            } catch(err) {
                // params.logger.info(err.message)
                expect(err.message).to.equal(
                    `ERROR updateFeedbackProducerAnswer : systemOperator : ${feedbackProducer.senderMarketParticipantMrid} does not exist for Feedback ${feedbackProducer.feedbackProducerMrid} update.`);
            }

        });




        it('should return ERROR UpdateFeedbackProducer - ENEDIS cannot send elements for Feedback manager by RTE.', async () => {
            const feedbackProducer:FeedbackProducer = JSON.parse(JSON.stringify(Values.HTB_FeedbackProducerWithComment));
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);

            const feedbackProducerAnswer: string = 'feedbackProducerAnswer';

            transactionContext.stub.getPrivateData.withArgs('enedis-producer-rte',
                feedbackProducer.feedbackProducerMrid).resolves(Buffer.from(JSON.stringify(feedbackProducer)));

            transactionContext.stub.getState.withArgs(feedbackProducer.senderMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTB_systemoperator)));

            try {
                await star.UpdateFeedbackProducerAnswer(transactionContext, feedbackProducer.activationDocumentMrid, feedbackProducerAnswer);
            } catch(err) {
                // params.logger.info(err.message)
                expect(err.message).to.equal(
                    `Organisation, ${OrganizationTypeMsp.ENEDIS} cannot send elements for Feedback manager by ${Values.HTB_systemoperator.systemOperatorMarketParticipantName}`);
            }

        });




        it('should return ERROR UpdateFeedbackProducer - RTE cannot send elements for Feedback manager by Enedis.', async () => {
            const feedbackProducer:FeedbackProducer = JSON.parse(JSON.stringify(Values.HTA_FeedbackProducerWithComment));
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);

            const feedbackProducerAnswer: string = 'feedbackProducerAnswer';

            transactionContext.stub.getPrivateData.withArgs('enedis-producer-rte',
                feedbackProducer.feedbackProducerMrid).resolves(Buffer.from(JSON.stringify(feedbackProducer)));

            transactionContext.stub.getState.withArgs(feedbackProducer.senderMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_systemoperator)));

            try {
                await star.UpdateFeedbackProducerAnswer(transactionContext, feedbackProducer.activationDocumentMrid, feedbackProducerAnswer);
            } catch(err) {
                // params.logger.info(err.message)
                expect(err.message).to.equal(
                    `Organisation, ${OrganizationTypeMsp.RTE} cannot send elements for Feedback manager by ${Values.HTA_systemoperator.systemOperatorMarketParticipantName}`);
            }

        });



        it('should return SUCCESS UpdateFeedbackProducer HTA by Enedis.', async () => {
            const feedbackProducer:FeedbackProducer = JSON.parse(JSON.stringify(Values.HTA_FeedbackProducerWithComment));
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);

            const feedbackProducerAnswer: string = 'feedbackProducerAnswer';

            const params: STARParameters = await ParametersController.getParameterValues(transactionContext);

            transactionContext.stub.getPrivateData.withArgs('enedis-producer',
                feedbackProducer.feedbackProducerMrid).resolves(Buffer.from(JSON.stringify(feedbackProducer)));

            transactionContext.stub.getState.withArgs(feedbackProducer.senderMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_systemoperator)));


            await star.UpdateFeedbackProducerAnswer(transactionContext, feedbackProducer.activationDocumentMrid, feedbackProducerAnswer);

            const expected: FeedbackProducer = JSON.parse(JSON.stringify(feedbackProducer))
            expected.feedbackAnswer = feedbackProducerAnswer;
            expected.revisionNumber = '3';
            expected.indeminityStatus = IndeminityStatus.AGREEMENT;

            // params.logger.info("-----------")
            // params.logger.info(transactionContext.stub.putPrivateData.firstCall.args);
            // params.logger.info("ooooooooo")
            // params.logger.info(Buffer.from(transactionContext.stub.putPrivateData.firstCall.args[2].toString()).toString('utf8'));
            // params.logger.info(JSON.stringify(expected))
            // params.logger.info("-----------")

            transactionContext.stub.putPrivateData.firstCall.should.have.been.calledWithExactly(
                'enedis-producer',
                expected.feedbackProducerMrid,
                Buffer.from(JSON.stringify(expected))
            );

            expect(transactionContext.stub.putPrivateData.callCount).to.equal(1);
        });



        it('should return SUCCESS UpdateFeedbackProducer HTB by RTE.', async () => {
            const feedbackProducer:FeedbackProducer = JSON.parse(JSON.stringify(Values.HTB_FeedbackProducerWithComment));
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);

            const feedbackProducerAnswer: string = 'feedbackProducerAnswer';

            const params: STARParameters = await ParametersController.getParameterValues(transactionContext);

            transactionContext.stub.getPrivateData.withArgs('producer-rte',
                feedbackProducer.feedbackProducerMrid).resolves(Buffer.from(JSON.stringify(feedbackProducer)));

            transactionContext.stub.getState.withArgs(feedbackProducer.senderMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTB_systemoperator)));


            await star.UpdateFeedbackProducerAnswer(transactionContext, feedbackProducer.activationDocumentMrid, feedbackProducerAnswer);

            const expected: FeedbackProducer = JSON.parse(JSON.stringify(feedbackProducer))
            expected.feedbackAnswer = feedbackProducerAnswer;
            expected.revisionNumber = '3';
            expected.indeminityStatus = IndeminityStatus.AGREEMENT;

            // params.logger.info("-----------")
            // params.logger.info(transactionContext.stub.putPrivateData.firstCall.args);
            // params.logger.info("ooooooooo")
            // params.logger.info(Buffer.from(transactionContext.stub.putPrivateData.firstCall.args[2].toString()).toString('utf8'));
            // params.logger.info(JSON.stringify(expected))
            // params.logger.info("-----------")

            transactionContext.stub.putPrivateData.firstCall.should.have.been.calledWithExactly(
                'producer-rte',
                expected.feedbackProducerMrid,
                Buffer.from(JSON.stringify(expected))
            );

            expect(transactionContext.stub.putPrivateData.callCount).to.equal(1);
        });

    });








    describe('Test updateIndeminityStatus', () => {
        it('should return ERROR updateIndeminityStatus PRODUCER - no rights.', async () => {
            const feedbackProducer:FeedbackProducer = JSON.parse(JSON.stringify(Values.HTB_FeedbackProducer));
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.PRODUCER);

            try {
                await star.UpdateActivationDocumentIndeminityStatus(transactionContext, feedbackProducer.activationDocumentMrid);
            } catch (err) {
                expect(err.message).to.equal(
                    `ERROR: Indemnity Status for the Activation Document ${feedbackProducer.activationDocumentMrid} cannot be updated by ${OrganizationTypeMsp.PRODUCER.toLowerCase()}`);
            }

        });




        it('should return ERROR updateIndeminityStatus RTE - data not exists.', async () => {
            const feedbackProducer:FeedbackProducer = JSON.parse(JSON.stringify(Values.HTB_FeedbackProducer));
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);

            try {
                await star.UpdateActivationDocumentIndeminityStatus(transactionContext, feedbackProducer.activationDocumentMrid);
            } catch (err) {
                expect(err.message).to.equal(
                    `ERROR update Indeminity Status : feedbackProducer : ${feedbackProducer.feedbackProducerMrid} does not exist (not found in any collection).`);
            }

        });



        it('should return ERROR updateIndeminityStatus RTE - System Operator not exists.', async () => {
            const feedbackProducer:FeedbackProducer = JSON.parse(JSON.stringify(Values.HTB_FeedbackProducer));
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);

            transactionContext.stub.getPrivateData.withArgs('producer-rte',
                feedbackProducer.feedbackProducerMrid).resolves(Buffer.from(JSON.stringify(feedbackProducer)));

            const activationDocumentObj: ActivationDocument = JSON.parse(JSON.stringify(Values.HTB_ActivationDocument_Valid));
            const energyAmountObj: EnergyAmount = JSON.parse(JSON.stringify(Values.HTB_EnergyAmount));

            const valueAbstract: EnergyAmountAbstract = {
                energyAmountMarketDocumentMrid: energyAmountObj.energyAmountMarketDocumentMrid};
            const indexEnergyAmountId = ActivationEnergyAmountIndexersController.getKey(energyAmountObj.activationDocumentMrid);

            const indexEnergyAmount = {
                docType: DocType.DATA_INDEXER,
                indexId: indexEnergyAmountId,
                indexedDataAbstractMap: new Map()
            }

            indexEnergyAmount.indexedDataAbstractMap.set(energyAmountObj.activationDocumentMrid, valueAbstract);

            const reserveBidObj:ReserveBidMarketDocument = JSON.parse(JSON.stringify(Values.HTB_ReserveBidMarketDocument_1_Full));;
            reserveBidObj.reserveBidStatus = ReserveBidStatus.VALIDATED;

            const reserveBidMarketDocumentAbstract: ReserveBidMarketDocumentAbstract = {
                createdDateTime: reserveBidObj.createdDateTime,
                reserveBidMrid: reserveBidObj.reserveBidMrid,
                reserveBidStatus: reserveBidObj.reserveBidStatus,
                validityPeriodStartDateTime: reserveBidObj.validityPeriodStartDateTime};
            const indexIdReserveBidId = SiteReserveBidIndexersController.getKey(Values.HTB_ReserveBidMarketDocument_1_Full.meteringPointMrid);

            const indexIdReserveBid = {
                docType: DocType.DATA_INDEXER,
                indexId: indexIdReserveBidId,
                indexedDataAbstractMap: new Map()
            }

            indexIdReserveBid.indexedDataAbstractMap.set(reserveBidObj.reserveBidMrid, reserveBidMarketDocumentAbstract);


            transactionContext.stub.getPrivateData.withArgs('producer-rte',
                activationDocumentObj.activationDocumentMrid).resolves(Buffer.from(JSON.stringify(activationDocumentObj)));

            transactionContext.stub.getPrivateData.withArgs('producer-rte',
                energyAmountObj.energyAmountMarketDocumentMrid).resolves(Buffer.from(JSON.stringify(energyAmountObj)));

            const objEnergyAmountJSON = IndexedDataJson.toJson(indexEnergyAmount);
            objEnergyAmountJSON.docType = DocType.DATA_INDEXER;
            transactionContext.stub.getPrivateData.withArgs('producer-rte',
                objEnergyAmountJSON.indexId).resolves(Buffer.from(JSON.stringify(objEnergyAmountJSON)));

            transactionContext.stub.getPrivateData.withArgs('producer-rte',
                reserveBidObj.reserveBidMrid).resolves(Buffer.from(JSON.stringify(reserveBidObj)));

            const objReserveBidJSON = IndexedDataJson.toJson(indexIdReserveBid);
            objReserveBidJSON.docType = DocType.DATA_INDEXER;
            transactionContext.stub.getPrivateData.withArgs('producer-rte',
                objReserveBidJSON.indexId).resolves(Buffer.from(JSON.stringify(objReserveBidJSON)));


            try {
                await star.UpdateActivationDocumentIndeminityStatus(transactionContext, feedbackProducer.activationDocumentMrid);
            } catch (err) {
                expect(err.message).to.equal(
                    `ERROR update Indeminity Status : systemOperator : ${feedbackProducer.senderMarketParticipantMrid} does not exist for Activation Document ${feedbackProducer.activationDocumentMrid} update Indeminity Status.`);
            }

        });



        it('should return ERROR updateIndeminityStatus RTE - Organisation.', async () => {
            const feedbackProducer:FeedbackProducer = JSON.parse(JSON.stringify(Values.HTB_FeedbackProducer));
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);

            transactionContext.stub.getPrivateData.withArgs('producer-rte',
                feedbackProducer.feedbackProducerMrid).resolves(Buffer.from(JSON.stringify(feedbackProducer)));
            transactionContext.stub.getState.withArgs(feedbackProducer.senderMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_systemoperator)));

            const activationDocumentObj: ActivationDocument = JSON.parse(JSON.stringify(Values.HTB_ActivationDocument_Valid));
            const energyAmountObj: EnergyAmount = JSON.parse(JSON.stringify(Values.HTB_EnergyAmount));

            const valueAbstract: EnergyAmountAbstract = {
                energyAmountMarketDocumentMrid: energyAmountObj.energyAmountMarketDocumentMrid};
            const indexEnergyAmountId = ActivationEnergyAmountIndexersController.getKey(energyAmountObj.activationDocumentMrid);

            const indexEnergyAmount = {
                docType: DocType.DATA_INDEXER,
                indexId: indexEnergyAmountId,
                indexedDataAbstractMap: new Map()
            }

            indexEnergyAmount.indexedDataAbstractMap.set(energyAmountObj.activationDocumentMrid, valueAbstract);

            const reserveBidObj:ReserveBidMarketDocument = JSON.parse(JSON.stringify(Values.HTB_ReserveBidMarketDocument_1_Full));;
            reserveBidObj.reserveBidStatus = ReserveBidStatus.VALIDATED;

            const reserveBidMarketDocumentAbstract: ReserveBidMarketDocumentAbstract = {
                createdDateTime: reserveBidObj.createdDateTime,
                reserveBidMrid: reserveBidObj.reserveBidMrid,
                reserveBidStatus: reserveBidObj.reserveBidStatus,
                validityPeriodStartDateTime: reserveBidObj.validityPeriodStartDateTime};
            const indexIdReserveBidId = SiteReserveBidIndexersController.getKey(Values.HTB_ReserveBidMarketDocument_1_Full.meteringPointMrid);

            const indexIdReserveBid = {
                docType: DocType.DATA_INDEXER,
                indexId: indexIdReserveBidId,
                indexedDataAbstractMap: new Map()
            }

            indexIdReserveBid.indexedDataAbstractMap.set(reserveBidObj.reserveBidMrid, reserveBidMarketDocumentAbstract);


            transactionContext.stub.getPrivateData.withArgs('producer-rte',
                activationDocumentObj.activationDocumentMrid).resolves(Buffer.from(JSON.stringify(activationDocumentObj)));

            transactionContext.stub.getPrivateData.withArgs('producer-rte',
                energyAmountObj.energyAmountMarketDocumentMrid).resolves(Buffer.from(JSON.stringify(energyAmountObj)));

            const objEnergyAmountJSON = IndexedDataJson.toJson(indexEnergyAmount);
            objEnergyAmountJSON.docType = DocType.DATA_INDEXER;
            transactionContext.stub.getPrivateData.withArgs('producer-rte',
                objEnergyAmountJSON.indexId).resolves(Buffer.from(JSON.stringify(objEnergyAmountJSON)));

            transactionContext.stub.getPrivateData.withArgs('producer-rte',
                reserveBidObj.reserveBidMrid).resolves(Buffer.from(JSON.stringify(reserveBidObj)));

            const objReserveBidJSON = IndexedDataJson.toJson(indexIdReserveBid);
            objReserveBidJSON.docType = DocType.DATA_INDEXER;
            transactionContext.stub.getPrivateData.withArgs('producer-rte',
                objReserveBidJSON.indexId).resolves(Buffer.from(JSON.stringify(objReserveBidJSON)));

            try {
                await star.UpdateActivationDocumentIndeminityStatus(transactionContext, feedbackProducer.activationDocumentMrid);
            } catch (err) {
                expect(err.message).to.equal(
                    `Organisation, ${OrganizationTypeMsp.RTE} cannot update Indeminity Status for Feedback manager by ${Values.HTA_systemoperator.systemOperatorMarketParticipantName}`);
            }

        });


        it('should return ERROR updateIndeminityStatus ENEDIS - Organisation.', async () => {
            const feedbackProducer:FeedbackProducer = JSON.parse(JSON.stringify(Values.HTA_FeedbackProducer));
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);

            transactionContext.stub.getPrivateData.withArgs('enedis-producer',
                feedbackProducer.feedbackProducerMrid).resolves(Buffer.from(JSON.stringify(feedbackProducer)));
            transactionContext.stub.getState.withArgs(feedbackProducer.senderMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTB_systemoperator)));

            const activationDocumentObj: ActivationDocument = JSON.parse(JSON.stringify(Values.HTA_ActivationDocument_Valid));
            const energyAmountObj: EnergyAmount = JSON.parse(JSON.stringify(Values.HTA_EnergyAmount));

            const valueAbstract: EnergyAmountAbstract = {
                energyAmountMarketDocumentMrid: energyAmountObj.energyAmountMarketDocumentMrid};
            const indexEnergyAmountId = ActivationEnergyAmountIndexersController.getKey(energyAmountObj.activationDocumentMrid);

            const indexEnergyAmount = {
                docType: DocType.DATA_INDEXER,
                indexId: indexEnergyAmountId,
                indexedDataAbstractMap: new Map()
            }

            indexEnergyAmount.indexedDataAbstractMap.set(energyAmountObj.activationDocumentMrid, valueAbstract);

            const reserveBidObj:ReserveBidMarketDocument = JSON.parse(JSON.stringify(Values.HTA_ReserveBidMarketDocument_1_Full));;
            reserveBidObj.reserveBidStatus = ReserveBidStatus.VALIDATED;

            const reserveBidMarketDocumentAbstract: ReserveBidMarketDocumentAbstract = {
                createdDateTime: reserveBidObj.createdDateTime,
                reserveBidMrid: reserveBidObj.reserveBidMrid,
                reserveBidStatus: reserveBidObj.reserveBidStatus,
                validityPeriodStartDateTime: reserveBidObj.validityPeriodStartDateTime};
            const indexIdReserveBidId = SiteReserveBidIndexersController.getKey(reserveBidObj.meteringPointMrid);

            const indexIdReserveBid = {
                docType: DocType.DATA_INDEXER,
                indexId: indexIdReserveBidId,
                indexedDataAbstractMap: new Map()
            }

            indexIdReserveBid.indexedDataAbstractMap.set(reserveBidObj.reserveBidMrid, reserveBidMarketDocumentAbstract);


            transactionContext.stub.getPrivateData.withArgs('enedis-producer',
                activationDocumentObj.activationDocumentMrid).resolves(Buffer.from(JSON.stringify(activationDocumentObj)));

            transactionContext.stub.getPrivateData.withArgs('enedis-producer',
                energyAmountObj.energyAmountMarketDocumentMrid).resolves(Buffer.from(JSON.stringify(energyAmountObj)));

            const objEnergyAmountJSON = IndexedDataJson.toJson(indexEnergyAmount);
            objEnergyAmountJSON.docType = DocType.DATA_INDEXER;
            transactionContext.stub.getPrivateData.withArgs('enedis-producer',
                objEnergyAmountJSON.indexId).resolves(Buffer.from(JSON.stringify(objEnergyAmountJSON)));

            transactionContext.stub.getPrivateData.withArgs('enedis-producer',
                reserveBidObj.reserveBidMrid).resolves(Buffer.from(JSON.stringify(reserveBidObj)));

            const objReserveBidJSON = IndexedDataJson.toJson(indexIdReserveBid);
            objReserveBidJSON.docType = DocType.DATA_INDEXER;
            transactionContext.stub.getPrivateData.withArgs('enedis-producer',
                objReserveBidJSON.indexId).resolves(Buffer.from(JSON.stringify(objReserveBidJSON)));

            try {
                await star.UpdateActivationDocumentIndeminityStatus(transactionContext, feedbackProducer.activationDocumentMrid);
            } catch (err) {
                expect(err.message).to.equal(
                    `Organisation, ${OrganizationTypeMsp.ENEDIS} cannot update Indeminity Status for Feedback manager by ${Values.HTB_systemoperator.systemOperatorMarketParticipantName}`);
            }

        });


        it('should return SUCCESS updateIndeminityStatus AGREEMENT ENEDIS.', async () => {
            const feedbackProducer:FeedbackProducer = JSON.parse(JSON.stringify(Values.HTA_FeedbackProducer));
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);

            transactionContext.stub.getPrivateData.withArgs('enedis-producer',
                feedbackProducer.feedbackProducerMrid).resolves(Buffer.from(JSON.stringify(feedbackProducer)));
            transactionContext.stub.getState.withArgs(feedbackProducer.senderMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_systemoperator)));

            const activationDocumentObj: ActivationDocument = JSON.parse(JSON.stringify(Values.HTA_ActivationDocument_Valid));
            const energyAmountObj: EnergyAmount = JSON.parse(JSON.stringify(Values.HTA_EnergyAmount));

            const valueAbstract: EnergyAmountAbstract = {
                energyAmountMarketDocumentMrid: energyAmountObj.energyAmountMarketDocumentMrid};
            const indexEnergyAmountId = ActivationEnergyAmountIndexersController.getKey(energyAmountObj.activationDocumentMrid);

            const indexEnergyAmount = {
                docType: DocType.DATA_INDEXER,
                indexId: indexEnergyAmountId,
                indexedDataAbstractMap: new Map()
            }

            indexEnergyAmount.indexedDataAbstractMap.set(energyAmountObj.activationDocumentMrid, valueAbstract);

            const reserveBidObj:ReserveBidMarketDocument = JSON.parse(JSON.stringify(Values.HTA_ReserveBidMarketDocument_1_Full));;
            reserveBidObj.reserveBidStatus = ReserveBidStatus.VALIDATED;

            const reserveBidMarketDocumentAbstract: ReserveBidMarketDocumentAbstract = {
                createdDateTime: reserveBidObj.createdDateTime,
                reserveBidMrid: reserveBidObj.reserveBidMrid,
                reserveBidStatus: reserveBidObj.reserveBidStatus,
                validityPeriodStartDateTime: reserveBidObj.validityPeriodStartDateTime};
            const indexIdReserveBidId = SiteReserveBidIndexersController.getKey(reserveBidObj.meteringPointMrid);

            const indexIdReserveBid = {
                docType: DocType.DATA_INDEXER,
                indexId: indexIdReserveBidId,
                indexedDataAbstractMap: new Map()
            }

            indexIdReserveBid.indexedDataAbstractMap.set(reserveBidObj.reserveBidMrid, reserveBidMarketDocumentAbstract);


            transactionContext.stub.getPrivateData.withArgs('enedis-producer',
                activationDocumentObj.activationDocumentMrid).resolves(Buffer.from(JSON.stringify(activationDocumentObj)));

            transactionContext.stub.getPrivateData.withArgs('enedis-producer',
                energyAmountObj.energyAmountMarketDocumentMrid).resolves(Buffer.from(JSON.stringify(energyAmountObj)));

            const objEnergyAmountJSON = IndexedDataJson.toJson(indexEnergyAmount);
            objEnergyAmountJSON.docType = DocType.DATA_INDEXER;
            transactionContext.stub.getPrivateData.withArgs('enedis-producer',
                objEnergyAmountJSON.indexId).resolves(Buffer.from(JSON.stringify(objEnergyAmountJSON)));

            transactionContext.stub.getPrivateData.withArgs('enedis-producer',
                reserveBidObj.reserveBidMrid).resolves(Buffer.from(JSON.stringify(reserveBidObj)));

            const objReserveBidJSON = IndexedDataJson.toJson(indexIdReserveBid);
            objReserveBidJSON.docType = DocType.DATA_INDEXER;
            transactionContext.stub.getPrivateData.withArgs('enedis-producer',
                objReserveBidJSON.indexId).resolves(Buffer.from(JSON.stringify(objReserveBidJSON)));

            const ret = await star.UpdateActivationDocumentIndeminityStatus(transactionContext, feedbackProducer.activationDocumentMrid);

            // const params: STARParameters = await ParametersController.getParameterValues(transactionContext);
            // params.logger.info("xxxxx")
            // params.logger.info("ret: ", ret)
            // params.logger.info("xxxxx")

            expect(ret).to.equal(IndeminityStatus.AGREEMENT);

            const expected: FeedbackProducer = JSON.parse(JSON.stringify(feedbackProducer))
            expected.indeminityStatus = IndeminityStatus.AGREEMENT;

            // params.logger.info("-----------")
            // params.logger.info(transactionContext.stub.putPrivateData.firstCall.args);
            // params.logger.info("ooooooooo")
            // params.logger.info(Buffer.from(transactionContext.stub.putPrivateData.firstCall.args[2].toString()).toString('utf8'));
            // params.logger.info(JSON.stringify(expected))
            // params.logger.info("-----------")

            transactionContext.stub.putPrivateData.firstCall.should.have.been.calledWithExactly(
                'enedis-producer',
                expected.feedbackProducerMrid,
                Buffer.from(JSON.stringify(expected))
            );

            expect(transactionContext.stub.putPrivateData.callCount).to.equal(1);
        });


        it('should return SUCCESS updateIndeminityStatus PROCESSED ENEDIS.', async () => {
            const feedbackProducer:FeedbackProducer = JSON.parse(JSON.stringify(Values.HTA_FeedbackProducer));
            feedbackProducer.indeminityStatus = IndeminityStatus.AGREEMENT;
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);

            transactionContext.stub.getPrivateData.withArgs('enedis-producer',
                feedbackProducer.feedbackProducerMrid).resolves(Buffer.from(JSON.stringify(feedbackProducer)));
            transactionContext.stub.getState.withArgs(feedbackProducer.senderMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_systemoperator)));

            const activationDocumentObj: ActivationDocument = JSON.parse(JSON.stringify(Values.HTA_ActivationDocument_Valid));
            const energyAmountObj: EnergyAmount = JSON.parse(JSON.stringify(Values.HTA_EnergyAmount));

            const valueAbstract: EnergyAmountAbstract = {
                energyAmountMarketDocumentMrid: energyAmountObj.energyAmountMarketDocumentMrid};
            const indexEnergyAmountId = ActivationEnergyAmountIndexersController.getKey(energyAmountObj.activationDocumentMrid);

            const indexEnergyAmount = {
                docType: DocType.DATA_INDEXER,
                indexId: indexEnergyAmountId,
                indexedDataAbstractMap: new Map()
            }

            indexEnergyAmount.indexedDataAbstractMap.set(energyAmountObj.activationDocumentMrid, valueAbstract);

            const reserveBidObj:ReserveBidMarketDocument = JSON.parse(JSON.stringify(Values.HTA_ReserveBidMarketDocument_1_Full));;
            reserveBidObj.reserveBidStatus = ReserveBidStatus.VALIDATED;

            const reserveBidMarketDocumentAbstract: ReserveBidMarketDocumentAbstract = {
                createdDateTime: reserveBidObj.createdDateTime,
                reserveBidMrid: reserveBidObj.reserveBidMrid,
                reserveBidStatus: reserveBidObj.reserveBidStatus,
                validityPeriodStartDateTime: reserveBidObj.validityPeriodStartDateTime};
            const indexIdReserveBidId = SiteReserveBidIndexersController.getKey(reserveBidObj.meteringPointMrid);

            const indexIdReserveBid = {
                docType: DocType.DATA_INDEXER,
                indexId: indexIdReserveBidId,
                indexedDataAbstractMap: new Map()
            }

            indexIdReserveBid.indexedDataAbstractMap.set(reserveBidObj.reserveBidMrid, reserveBidMarketDocumentAbstract);


            transactionContext.stub.getPrivateData.withArgs('enedis-producer',
                activationDocumentObj.activationDocumentMrid).resolves(Buffer.from(JSON.stringify(activationDocumentObj)));

            transactionContext.stub.getPrivateData.withArgs('enedis-producer',
                energyAmountObj.energyAmountMarketDocumentMrid).resolves(Buffer.from(JSON.stringify(energyAmountObj)));

            const objEnergyAmountJSON = IndexedDataJson.toJson(indexEnergyAmount);
            objEnergyAmountJSON.docType = DocType.DATA_INDEXER;
            transactionContext.stub.getPrivateData.withArgs('enedis-producer',
                objEnergyAmountJSON.indexId).resolves(Buffer.from(JSON.stringify(objEnergyAmountJSON)));

            transactionContext.stub.getPrivateData.withArgs('enedis-producer',
                reserveBidObj.reserveBidMrid).resolves(Buffer.from(JSON.stringify(reserveBidObj)));

            const objReserveBidJSON = IndexedDataJson.toJson(indexIdReserveBid);
            objReserveBidJSON.docType = DocType.DATA_INDEXER;
            transactionContext.stub.getPrivateData.withArgs('enedis-producer',
                objReserveBidJSON.indexId).resolves(Buffer.from(JSON.stringify(objReserveBidJSON)));

            const ret = await star.UpdateActivationDocumentIndeminityStatus(transactionContext, feedbackProducer.activationDocumentMrid);

            const params: STARParameters = await ParametersController.getParameterValues(transactionContext);
            // params.logger.info("xxxxx")
            // params.logger.info("ret: ", ret)
            // params.logger.info("xxxxx")

            expect(ret).to.equal(IndeminityStatus.PROCESSED);

            const expected: FeedbackProducer = JSON.parse(JSON.stringify(feedbackProducer))
            expected.indeminityStatus = IndeminityStatus.PROCESSED;

            const expectedBalancingDocument: BalancingDocument =
                await BalancingDocumentController.generateObj(params, activationDocumentObj, reserveBidObj, energyAmountObj);
            const expectedBalancingDocumentId: string =
                BalancingDocumentController.getBalancingDocumentMrid(params, activationDocumentObj.activationDocumentMrid);


            // params.logger.info("-----------")
            // params.logger.info(transactionContext.stub.putPrivateData.firstCall.args);
            // params.logger.info("ooooooooo")
            // params.logger.info(Buffer.from(transactionContext.stub.putPrivateData.firstCall.args[2].toString()).toString('utf8'));
            // params.logger.info(JSON.stringify(expected))
            // params.logger.info("-----------")
			// params.logger.info(transactionContext.stub.putPrivateData.secondCall.args);
            // params.logger.info("ooooooooo")
            // params.logger.info(Buffer.from(transactionContext.stub.putPrivateData.secondCall.args[2].toString()).toString('utf8'));
            // params.logger.info(JSON.stringify(expectedBalancingDocument))
            // params.logger.info("-----------")

            transactionContext.stub.putPrivateData.firstCall.should.have.been.calledWithExactly(
                'enedis-producer',
                expected.feedbackProducerMrid,
                Buffer.from(JSON.stringify(expected))
            );

            transactionContext.stub.putPrivateData.secondCall.should.have.been.calledWithExactly(
                'enedis-producer',
                expectedBalancingDocumentId,
                Buffer.from(JSON.stringify(expectedBalancingDocument))
            );

            expect(transactionContext.stub.putPrivateData.callCount).to.equal(2);
        });



        it('should return SUCCESS updateIndeminityStatus OVER PROCESSED ENEDIS.', async () => {
            const feedbackProducer:FeedbackProducer = JSON.parse(JSON.stringify(Values.HTA_FeedbackProducer));
            feedbackProducer.indeminityStatus = IndeminityStatus.PROCESSED;
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);

            transactionContext.stub.getPrivateData.withArgs('enedis-producer',
                feedbackProducer.feedbackProducerMrid).resolves(Buffer.from(JSON.stringify(feedbackProducer)));
            transactionContext.stub.getState.withArgs(feedbackProducer.senderMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_systemoperator)));

            const activationDocumentObj: ActivationDocument = JSON.parse(JSON.stringify(Values.HTA_ActivationDocument_Valid));
            const energyAmountObj: EnergyAmount = JSON.parse(JSON.stringify(Values.HTA_EnergyAmount));

            const valueAbstract: EnergyAmountAbstract = {
                energyAmountMarketDocumentMrid: energyAmountObj.energyAmountMarketDocumentMrid};
            const indexEnergyAmountId = ActivationEnergyAmountIndexersController.getKey(energyAmountObj.activationDocumentMrid);

            const indexEnergyAmount = {
                docType: DocType.DATA_INDEXER,
                indexId: indexEnergyAmountId,
                indexedDataAbstractMap: new Map()
            }

            indexEnergyAmount.indexedDataAbstractMap.set(energyAmountObj.activationDocumentMrid, valueAbstract);

            const reserveBidObj:ReserveBidMarketDocument = JSON.parse(JSON.stringify(Values.HTA_ReserveBidMarketDocument_1_Full));;
            reserveBidObj.reserveBidStatus = ReserveBidStatus.VALIDATED;

            const reserveBidMarketDocumentAbstract: ReserveBidMarketDocumentAbstract = {
                createdDateTime: reserveBidObj.createdDateTime,
                reserveBidMrid: reserveBidObj.reserveBidMrid,
                reserveBidStatus: reserveBidObj.reserveBidStatus,
                validityPeriodStartDateTime: reserveBidObj.validityPeriodStartDateTime};
            const indexIdReserveBidId = SiteReserveBidIndexersController.getKey(reserveBidObj.meteringPointMrid);

            const indexIdReserveBid = {
                docType: DocType.DATA_INDEXER,
                indexId: indexIdReserveBidId,
                indexedDataAbstractMap: new Map()
            }

            indexIdReserveBid.indexedDataAbstractMap.set(reserveBidObj.reserveBidMrid, reserveBidMarketDocumentAbstract);


            transactionContext.stub.getPrivateData.withArgs('enedis-producer',
                activationDocumentObj.activationDocumentMrid).resolves(Buffer.from(JSON.stringify(activationDocumentObj)));

            transactionContext.stub.getPrivateData.withArgs('enedis-producer',
                energyAmountObj.energyAmountMarketDocumentMrid).resolves(Buffer.from(JSON.stringify(energyAmountObj)));

            const objEnergyAmountJSON = IndexedDataJson.toJson(indexEnergyAmount);
            objEnergyAmountJSON.docType = DocType.DATA_INDEXER;
            transactionContext.stub.getPrivateData.withArgs('enedis-producer',
                objEnergyAmountJSON.indexId).resolves(Buffer.from(JSON.stringify(objEnergyAmountJSON)));

            transactionContext.stub.getPrivateData.withArgs('enedis-producer',
                reserveBidObj.reserveBidMrid).resolves(Buffer.from(JSON.stringify(reserveBidObj)));

            const objReserveBidJSON = IndexedDataJson.toJson(indexIdReserveBid);
            objReserveBidJSON.docType = DocType.DATA_INDEXER;
            transactionContext.stub.getPrivateData.withArgs('enedis-producer',
                objReserveBidJSON.indexId).resolves(Buffer.from(JSON.stringify(objReserveBidJSON)));


            const ret = await star.UpdateActivationDocumentIndeminityStatus(transactionContext, feedbackProducer.activationDocumentMrid);

            // const params: STARParameters = await ParametersController.getParameterValues(transactionContext);
            // params.logger.info("xxxxx")
            // params.logger.info("ret: ", ret)
            // params.logger.info("xxxxx")

            expect(ret).to.equal('');

            expect(transactionContext.stub.putPrivateData.callCount).to.equal(0);
        });




        it('should return SUCCESS updateIndeminityStatus AGREEMENT RTE.', async () => {
            const feedbackProducer:FeedbackProducer = JSON.parse(JSON.stringify(Values.HTB_FeedbackProducer));
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);

            transactionContext.stub.getPrivateData.withArgs('producer-rte',
                feedbackProducer.feedbackProducerMrid).resolves(Buffer.from(JSON.stringify(feedbackProducer)));
            transactionContext.stub.getState.withArgs(feedbackProducer.senderMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTB_systemoperator)));

            const activationDocumentObj: ActivationDocument = JSON.parse(JSON.stringify(Values.HTB_ActivationDocument_Valid));
            const energyAmountObj: EnergyAmount = JSON.parse(JSON.stringify(Values.HTB_EnergyAmount));

            const valueAbstract: EnergyAmountAbstract = {
                energyAmountMarketDocumentMrid: energyAmountObj.energyAmountMarketDocumentMrid};
            const indexEnergyAmountId = ActivationEnergyAmountIndexersController.getKey(energyAmountObj.activationDocumentMrid);

            const indexEnergyAmount = {
                docType: DocType.DATA_INDEXER,
                indexId: indexEnergyAmountId,
                indexedDataAbstractMap: new Map()
            }

            indexEnergyAmount.indexedDataAbstractMap.set(energyAmountObj.activationDocumentMrid, valueAbstract);

            const reserveBidObj:ReserveBidMarketDocument = JSON.parse(JSON.stringify(Values.HTB_ReserveBidMarketDocument_1_Full));;
            reserveBidObj.reserveBidStatus = ReserveBidStatus.VALIDATED;

            const reserveBidMarketDocumentAbstract: ReserveBidMarketDocumentAbstract = {
                createdDateTime: reserveBidObj.createdDateTime,
                reserveBidMrid: reserveBidObj.reserveBidMrid,
                reserveBidStatus: reserveBidObj.reserveBidStatus,
                validityPeriodStartDateTime: reserveBidObj.validityPeriodStartDateTime};
            const indexIdReserveBidId = SiteReserveBidIndexersController.getKey(Values.HTB_ReserveBidMarketDocument_1_Full.meteringPointMrid);

            const indexIdReserveBid = {
                docType: DocType.DATA_INDEXER,
                indexId: indexIdReserveBidId,
                indexedDataAbstractMap: new Map()
            }

            indexIdReserveBid.indexedDataAbstractMap.set(reserveBidObj.reserveBidMrid, reserveBidMarketDocumentAbstract);


            transactionContext.stub.getPrivateData.withArgs('producer-rte',
                activationDocumentObj.activationDocumentMrid).resolves(Buffer.from(JSON.stringify(activationDocumentObj)));

            transactionContext.stub.getPrivateData.withArgs('producer-rte',
                energyAmountObj.energyAmountMarketDocumentMrid).resolves(Buffer.from(JSON.stringify(energyAmountObj)));

            const objEnergyAmountJSON = IndexedDataJson.toJson(indexEnergyAmount);
            objEnergyAmountJSON.docType = DocType.DATA_INDEXER;
            transactionContext.stub.getPrivateData.withArgs('producer-rte',
                objEnergyAmountJSON.indexId).resolves(Buffer.from(JSON.stringify(objEnergyAmountJSON)));

            transactionContext.stub.getPrivateData.withArgs('producer-rte',
                reserveBidObj.reserveBidMrid).resolves(Buffer.from(JSON.stringify(reserveBidObj)));

            const objReserveBidJSON = IndexedDataJson.toJson(indexIdReserveBid);
            objReserveBidJSON.docType = DocType.DATA_INDEXER;
            transactionContext.stub.getPrivateData.withArgs('producer-rte',
                objReserveBidJSON.indexId).resolves(Buffer.from(JSON.stringify(objReserveBidJSON)));


            const ret = await star.UpdateActivationDocumentIndeminityStatus(transactionContext, feedbackProducer.activationDocumentMrid);

            // const params: STARParameters = await ParametersController.getParameterValues(transactionContext);
            // params.logger.info("xxxxx")
            // params.logger.info("ret: ", ret)
            // params.logger.info("xxxxx")

            expect(ret).to.equal(IndeminityStatus.AGREEMENT);

            const expected: FeedbackProducer = JSON.parse(JSON.stringify(feedbackProducer))
            expected.indeminityStatus = IndeminityStatus.AGREEMENT;

            // params.logger.info("-----------")
            // params.logger.info(transactionContext.stub.putPrivateData.firstCall.args);
            // params.logger.info("ooooooooo")
            // params.logger.info(Buffer.from(transactionContext.stub.putPrivateData.firstCall.args[2].toString()).toString('utf8'));
            // params.logger.info(JSON.stringify(expected))
            // params.logger.info("-----------")

            transactionContext.stub.putPrivateData.firstCall.should.have.been.calledWithExactly(
                'producer-rte',
                expected.feedbackProducerMrid,
                Buffer.from(JSON.stringify(expected))
            );

            expect(transactionContext.stub.putPrivateData.callCount).to.equal(1);
        });


        it('should return SUCCESS updateIndeminityStatus WAITING_INVOICE RTE.', async () => {
            const feedbackProducer:FeedbackProducer = JSON.parse(JSON.stringify(Values.HTB_FeedbackProducer));
            feedbackProducer.indeminityStatus = IndeminityStatus.AGREEMENT;
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);

            transactionContext.stub.getPrivateData.withArgs('producer-rte',
                feedbackProducer.feedbackProducerMrid).resolves(Buffer.from(JSON.stringify(feedbackProducer)));
            transactionContext.stub.getState.withArgs(feedbackProducer.senderMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTB_systemoperator)));

            const activationDocumentObj: ActivationDocument = JSON.parse(JSON.stringify(Values.HTB_ActivationDocument_Valid));
            const energyAmountObj: EnergyAmount = JSON.parse(JSON.stringify(Values.HTB_EnergyAmount));

            const valueAbstract: EnergyAmountAbstract = {
                energyAmountMarketDocumentMrid: energyAmountObj.energyAmountMarketDocumentMrid};
            const indexEnergyAmountId = ActivationEnergyAmountIndexersController.getKey(energyAmountObj.activationDocumentMrid);

            const indexEnergyAmount = {
                docType: DocType.DATA_INDEXER,
                indexId: indexEnergyAmountId,
                indexedDataAbstractMap: new Map()
            }

            indexEnergyAmount.indexedDataAbstractMap.set(energyAmountObj.activationDocumentMrid, valueAbstract);

            const reserveBidObj:ReserveBidMarketDocument = JSON.parse(JSON.stringify(Values.HTB_ReserveBidMarketDocument_1_Full));;
            reserveBidObj.reserveBidStatus = ReserveBidStatus.VALIDATED;

            const reserveBidMarketDocumentAbstract: ReserveBidMarketDocumentAbstract = {
                createdDateTime: reserveBidObj.createdDateTime,
                reserveBidMrid: reserveBidObj.reserveBidMrid,
                reserveBidStatus: reserveBidObj.reserveBidStatus,
                validityPeriodStartDateTime: reserveBidObj.validityPeriodStartDateTime};
            const indexIdReserveBidId = SiteReserveBidIndexersController.getKey(Values.HTB_ReserveBidMarketDocument_1_Full.meteringPointMrid);

            const indexIdReserveBid = {
                docType: DocType.DATA_INDEXER,
                indexId: indexIdReserveBidId,
                indexedDataAbstractMap: new Map()
            }

            indexIdReserveBid.indexedDataAbstractMap.set(reserveBidObj.reserveBidMrid, reserveBidMarketDocumentAbstract);


            transactionContext.stub.getPrivateData.withArgs('producer-rte',
                activationDocumentObj.activationDocumentMrid).resolves(Buffer.from(JSON.stringify(activationDocumentObj)));

            transactionContext.stub.getPrivateData.withArgs('producer-rte',
                energyAmountObj.energyAmountMarketDocumentMrid).resolves(Buffer.from(JSON.stringify(energyAmountObj)));

            const objEnergyAmountJSON = IndexedDataJson.toJson(indexEnergyAmount);
            objEnergyAmountJSON.docType = DocType.DATA_INDEXER;
            transactionContext.stub.getPrivateData.withArgs('producer-rte',
                objEnergyAmountJSON.indexId).resolves(Buffer.from(JSON.stringify(objEnergyAmountJSON)));

            transactionContext.stub.getPrivateData.withArgs('producer-rte',
                reserveBidObj.reserveBidMrid).resolves(Buffer.from(JSON.stringify(reserveBidObj)));

            const objReserveBidJSON = IndexedDataJson.toJson(indexIdReserveBid);
            objReserveBidJSON.docType = DocType.DATA_INDEXER;
            transactionContext.stub.getPrivateData.withArgs('producer-rte',
                objReserveBidJSON.indexId).resolves(Buffer.from(JSON.stringify(objReserveBidJSON)));


            const ret = await star.UpdateActivationDocumentIndeminityStatus(transactionContext, feedbackProducer.activationDocumentMrid);

            // const params: STARParameters = await ParametersController.getParameterValues(transactionContext);
            // params.logger.info("xxxxx")
            // params.logger.info("ret: ", ret)
            // params.logger.info("xxxxx")

            expect(ret).to.equal(IndeminityStatus.WAITING_INVOICE);

            const expected: FeedbackProducer = JSON.parse(JSON.stringify(feedbackProducer))
            expected.indeminityStatus = IndeminityStatus.WAITING_INVOICE;

            // params.logger.info("-----------")
            // params.logger.info(transactionContext.stub.putPrivateData.firstCall.args);
            // params.logger.info("ooooooooo")
            // params.logger.info(Buffer.from(transactionContext.stub.putPrivateData.firstCall.args[2].toString()).toString('utf8'));
            // params.logger.info(JSON.stringify(expected))
            // params.logger.info("-----------")

            transactionContext.stub.putPrivateData.firstCall.should.have.been.calledWithExactly(
                'producer-rte',
                expected.feedbackProducerMrid,
                Buffer.from(JSON.stringify(expected))
            );

            expect(transactionContext.stub.putPrivateData.callCount).to.equal(1);
        });


        it('should return SUCCESS updateIndeminityStatus INVOICE_SENT RTE.', async () => {
            const feedbackProducer:FeedbackProducer = JSON.parse(JSON.stringify(Values.HTB_FeedbackProducer));
            feedbackProducer.indeminityStatus = IndeminityStatus.WAITING_INVOICE;
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);

            transactionContext.stub.getPrivateData.withArgs('producer-rte',
                feedbackProducer.feedbackProducerMrid).resolves(Buffer.from(JSON.stringify(feedbackProducer)));
            transactionContext.stub.getState.withArgs(feedbackProducer.senderMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTB_systemoperator)));

            const activationDocumentObj: ActivationDocument = JSON.parse(JSON.stringify(Values.HTB_ActivationDocument_Valid));
            const energyAmountObj: EnergyAmount = JSON.parse(JSON.stringify(Values.HTB_EnergyAmount));

            const valueAbstract: EnergyAmountAbstract = {
                energyAmountMarketDocumentMrid: energyAmountObj.energyAmountMarketDocumentMrid};
            const indexEnergyAmountId = ActivationEnergyAmountIndexersController.getKey(energyAmountObj.activationDocumentMrid);

            const indexEnergyAmount = {
                docType: DocType.DATA_INDEXER,
                indexId: indexEnergyAmountId,
                indexedDataAbstractMap: new Map()
            }

            indexEnergyAmount.indexedDataAbstractMap.set(energyAmountObj.activationDocumentMrid, valueAbstract);

            const reserveBidObj:ReserveBidMarketDocument = JSON.parse(JSON.stringify(Values.HTB_ReserveBidMarketDocument_1_Full));;
            reserveBidObj.reserveBidStatus = ReserveBidStatus.VALIDATED;

            const reserveBidMarketDocumentAbstract: ReserveBidMarketDocumentAbstract = {
                createdDateTime: reserveBidObj.createdDateTime,
                reserveBidMrid: reserveBidObj.reserveBidMrid,
                reserveBidStatus: reserveBidObj.reserveBidStatus,
                validityPeriodStartDateTime: reserveBidObj.validityPeriodStartDateTime};
            const indexIdReserveBidId = SiteReserveBidIndexersController.getKey(Values.HTB_ReserveBidMarketDocument_1_Full.meteringPointMrid);

            const indexIdReserveBid = {
                docType: DocType.DATA_INDEXER,
                indexId: indexIdReserveBidId,
                indexedDataAbstractMap: new Map()
            }

            indexIdReserveBid.indexedDataAbstractMap.set(reserveBidObj.reserveBidMrid, reserveBidMarketDocumentAbstract);


            transactionContext.stub.getPrivateData.withArgs('producer-rte',
                activationDocumentObj.activationDocumentMrid).resolves(Buffer.from(JSON.stringify(activationDocumentObj)));

            transactionContext.stub.getPrivateData.withArgs('producer-rte',
                energyAmountObj.energyAmountMarketDocumentMrid).resolves(Buffer.from(JSON.stringify(energyAmountObj)));

            const objEnergyAmountJSON = IndexedDataJson.toJson(indexEnergyAmount);
            objEnergyAmountJSON.docType = DocType.DATA_INDEXER;
            transactionContext.stub.getPrivateData.withArgs('producer-rte',
                objEnergyAmountJSON.indexId).resolves(Buffer.from(JSON.stringify(objEnergyAmountJSON)));

            transactionContext.stub.getPrivateData.withArgs('producer-rte',
                reserveBidObj.reserveBidMrid).resolves(Buffer.from(JSON.stringify(reserveBidObj)));

            const objReserveBidJSON = IndexedDataJson.toJson(indexIdReserveBid);
            objReserveBidJSON.docType = DocType.DATA_INDEXER;
            transactionContext.stub.getPrivateData.withArgs('producer-rte',
                objReserveBidJSON.indexId).resolves(Buffer.from(JSON.stringify(objReserveBidJSON)));

            const ret = await star.UpdateActivationDocumentIndeminityStatus(transactionContext, feedbackProducer.activationDocumentMrid);

            const params: STARParameters = await ParametersController.getParameterValues(transactionContext);
            // params.logger.info("xxxxx")
            // params.logger.info("ret: ", ret)
            // params.logger.info("xxxxx")

            expect(ret).to.equal(IndeminityStatus.INVOICE_SENT);

            const expected: FeedbackProducer = JSON.parse(JSON.stringify(feedbackProducer))
            expected.indeminityStatus = IndeminityStatus.INVOICE_SENT;

            const expectedBalancingDocument: BalancingDocument =
                await BalancingDocumentController.generateObj(params, activationDocumentObj, reserveBidObj, energyAmountObj);
            const expectedBalancingDocumentId: string =
                BalancingDocumentController.getBalancingDocumentMrid(params, activationDocumentObj.activationDocumentMrid);

            params.logger.info("-----------")
            params.logger.info(transactionContext.stub.putPrivateData.firstCall.args);
            params.logger.info("ooooooooo")
            params.logger.info(Buffer.from(transactionContext.stub.putPrivateData.firstCall.args[2].toString()).toString('utf8'));
            params.logger.info(JSON.stringify(expected))
            params.logger.info("-----------")
            params.logger.info(transactionContext.stub.putPrivateData.secondCall.args);
            params.logger.info("ooooooooo")
            params.logger.info(Buffer.from(transactionContext.stub.putPrivateData.secondCall.args[2].toString()).toString('utf8'));
            params.logger.info(JSON.stringify(expectedBalancingDocument))
            params.logger.info("-----------")

            transactionContext.stub.putPrivateData.firstCall.should.have.been.calledWithExactly(
                'producer-rte',
                expected.feedbackProducerMrid,
                Buffer.from(JSON.stringify(expected))
            );

            transactionContext.stub.putPrivateData.secondCall.should.have.been.calledWithExactly(
                'producer-rte',
                expectedBalancingDocumentId,
                Buffer.from(JSON.stringify(expectedBalancingDocument))
            );

            expect(transactionContext.stub.putPrivateData.callCount).to.equal(2);
        });


        it('should return SUCCESS updateIndeminityStatus OVER INVOICE_SENT RTE.', async () => {
            const feedbackProducer:FeedbackProducer = JSON.parse(JSON.stringify(Values.HTB_FeedbackProducer));
            feedbackProducer.indeminityStatus = IndeminityStatus.INVOICE_SENT;
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);

            transactionContext.stub.getPrivateData.withArgs('producer-rte',
                feedbackProducer.feedbackProducerMrid).resolves(Buffer.from(JSON.stringify(feedbackProducer)));
            transactionContext.stub.getState.withArgs(feedbackProducer.senderMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTB_systemoperator)));

            const activationDocument: ActivationDocument = JSON.parse(JSON.stringify(Values.HTB_ActivationDocument_Valid));
            const energyAmountObj: EnergyAmount = JSON.parse(JSON.stringify(Values.HTB_EnergyAmount));

            const valueAbstract: EnergyAmountAbstract = {
                energyAmountMarketDocumentMrid: energyAmountObj.energyAmountMarketDocumentMrid};
            const indexEnergyAmountId = ActivationEnergyAmountIndexersController.getKey(energyAmountObj.activationDocumentMrid);

            const indexEnergyAmount = {
                docType: DocType.DATA_INDEXER,
                indexId: indexEnergyAmountId,
                indexedDataAbstractMap: new Map()
            }

            indexEnergyAmount.indexedDataAbstractMap.set(energyAmountObj.activationDocumentMrid, valueAbstract);

            const reserveBid:ReserveBidMarketDocument = JSON.parse(JSON.stringify(Values.HTB_ReserveBidMarketDocument_1_Full));;
            reserveBid.reserveBidStatus = ReserveBidStatus.VALIDATED;

            const reserveBidMarketDocumentAbstract: ReserveBidMarketDocumentAbstract = {
                createdDateTime: reserveBid.createdDateTime,
                reserveBidMrid: reserveBid.reserveBidMrid,
                reserveBidStatus: reserveBid.reserveBidStatus,
                validityPeriodStartDateTime: reserveBid.validityPeriodStartDateTime};
            const indexIdReserveBidId = SiteReserveBidIndexersController.getKey(Values.HTB_ReserveBidMarketDocument_1_Full.meteringPointMrid);

            const indexIdReserveBid = {
                docType: DocType.DATA_INDEXER,
                indexId: indexIdReserveBidId,
                indexedDataAbstractMap: new Map()
            }

            indexIdReserveBid.indexedDataAbstractMap.set(reserveBid.reserveBidMrid, reserveBidMarketDocumentAbstract);


            transactionContext.stub.getPrivateData.withArgs('producer-rte',
                activationDocument.activationDocumentMrid).resolves(Buffer.from(JSON.stringify(activationDocument)));

            transactionContext.stub.getPrivateData.withArgs('producer-rte',
                energyAmountObj.energyAmountMarketDocumentMrid).resolves(Buffer.from(JSON.stringify(energyAmountObj)));

            const objEnergyAmountJSON = IndexedDataJson.toJson(indexEnergyAmount);
            objEnergyAmountJSON.docType = DocType.DATA_INDEXER;
            transactionContext.stub.getPrivateData.withArgs('producer-rte',
                objEnergyAmountJSON.indexId).resolves(Buffer.from(JSON.stringify(objEnergyAmountJSON)));

            transactionContext.stub.getPrivateData.withArgs('producer-rte',
                reserveBid.reserveBidMrid).resolves(Buffer.from(JSON.stringify(reserveBid)));

            const objReserveBidJSON = IndexedDataJson.toJson(indexIdReserveBid);
            objReserveBidJSON.docType = DocType.DATA_INDEXER;
            transactionContext.stub.getPrivateData.withArgs('producer-rte',
                objReserveBidJSON.indexId).resolves(Buffer.from(JSON.stringify(objReserveBidJSON)));

            const ret = await star.UpdateActivationDocumentIndeminityStatus(transactionContext, feedbackProducer.activationDocumentMrid);

            // const params: STARParameters = await ParametersController.getParameterValues(transactionContext);
            // params.logger.info("xxxxx")
            // params.logger.info("ret: ", ret)
            // params.logger.info("xxxxx")

            expect(ret).to.equal('');

            expect(transactionContext.stub.putPrivateData.callCount).to.equal(0);
        });

    });
});
