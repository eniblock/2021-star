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
                await star.UpdateFeedbackProducer(transactionContext, feedbackProducer.activationDocumentMrid, feedbackProducerComment);
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
                await star.UpdateFeedbackProducer(transactionContext, feedbackProducer.activationDocumentMrid, feedbackProducerComment);
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
                await star.UpdateFeedbackProducer(transactionContext, feedbackProducer.activationDocumentMrid, feedbackProducerComment);
            } catch(err) {
                // params.logger.info(err.message)
                expect(err.message).to.equal(`ERROR updateFeedbackProducer : no feedback to update.`);
            }
        });



        it('should return ERROR UpdateFeedbackProducer - feedbackProducer does not exist', async () => {
            const feedbackProducer:FeedbackProducer = JSON.parse(JSON.stringify(Values.HTA_FeedbackProducer));

            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.PRODUCER);

            const feedbackProducerComment: string = 'feedbackProducerComment';

            try {
                await star.UpdateFeedbackProducer(transactionContext, feedbackProducer.activationDocumentMrid, feedbackProducerComment);
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

            try {
                await star.UpdateFeedbackProducer(transactionContext, feedbackProducer.activationDocumentMrid, feedbackProducerComment);
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

            await star.UpdateFeedbackProducer(transactionContext, feedbackProducer.activationDocumentMrid, feedbackProducerComment);

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

            await star.UpdateFeedbackProducer(transactionContext, feedbackProducer.activationDocumentMrid, feedbackProducerComment);

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
});
