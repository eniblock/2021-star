
'use strict';
const sinon = require('sinon');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinonChai = require('sinon-chai');
const expect = chai.expect;

import { ChaincodeStub, ClientIdentity } from 'fabric-shim'

import { Star } from '../src/star'
import { Producer } from '../src/model/producer';

import { OrganizationTypeMsp } from '../src/enums/OrganizationMspType';

import { Values } from './Values';
import { DocType } from '../src/enums/DocType';


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

describe('Star Tests PRODUCERS', () => {
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

    describe('Test createProducer', () => {
        // it('should return ERROR on createProducer', async () => {
        //     transactionContext.stub.putState.rejects('failed inserting key');

        //     let star = new Star();
        //     transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);
        //     try {
        //         await star.CreateProducer(transactionContext, '{\"producerMarketParticipantName\": \"EolienFRvert28EIC\",\"producerMarketParticipantRoleType\": \"EolienFR vert Cie\",\"systemOperatorMarketParticipantRoleType\": \"A21\"}');
        //     } catch(err) {
        //         params.logger.info(err.message)
        //         expect(err.name).to.equal('failed inserting key');
        //     }
        // });

        it('should return ERROR wrong MSPID', async () => {
            transactionContext.clientIdentity.getMSPID.returns(Values.FakeMSP);
            try {
                await star.CreateProducer(transactionContext, JSON.stringify(Values.HTB_Producer));
            } catch(err) {
                // params.logger.info(err.message)
                expect(err.message).to.equal('Organisation, FakeMspID does not have write access to create a producer');
            }
        });

        it('should return ERROR NON-JSON value', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);
            try {
                await star.CreateProducer(transactionContext, 'toto');
            } catch(err) {
                // params.logger.info(err.message)
                expect(err.message).to.equal('ERROR '.concat(DocType.PRODUCER).concat(' -> Input string NON-JSON value'));
            }
        });

        it('should return SUCCESS wit RTE on createProducer', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);
            await star.CreateProducer(transactionContext, JSON.stringify(Values.HTB_Producer));

            const expected = JSON.parse(JSON.stringify(Values.HTB_Producer))
            expected.docType = DocType.PRODUCER;
            transactionContext.stub.putState.should.have.been.calledOnceWithExactly(
                Values.HTB_Producer.producerMarketParticipantMrid,
                Buffer.from(JSON.stringify(expected))
            );

            expect(transactionContext.stub.putState.callCount).to.equal(1);
        });

        it('should return SUCCESS with Enedis on createProducer', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);
            await star.CreateProducer(transactionContext, JSON.stringify(Values.HTA_Producer));

            const expected = JSON.parse(JSON.stringify(Values.HTA_Producer))
            expected.docType = DocType.PRODUCER;
            transactionContext.stub.putState.should.have.been.calledOnceWithExactly(
                Values.HTA_Producer.producerMarketParticipantMrid,
                Buffer.from(JSON.stringify(expected))
            );

            expect(transactionContext.stub.putState.callCount).to.equal(1);
        });

        it('should return SUCCESS wit RTE on createProducerList', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);
            const producerList = [Values.HTB_Producer, Values.HTB_Producer_2, Values.HTB_Producer_3];

            await star.CreateProducerList(transactionContext, JSON.stringify(producerList));

            const expected = JSON.parse(JSON.stringify(Values.HTB_Producer))
            expected.docType = DocType.PRODUCER;
            const expected2 = JSON.parse(JSON.stringify(Values.HTB_Producer_2))
            expected2.docType = DocType.PRODUCER;
            const expected3 = JSON.parse(JSON.stringify(Values.HTB_Producer_3))
            expected3.docType = DocType.PRODUCER;

            // params.logger.info("-----------")
            // params.logger.info(transactionContext.stub.putState.firstCall.args);
            // params.logger.info("ooooooooo")
            // params.logger.info(Buffer.from(transactionContext.stub.putState.firstCall.args[1].toString()).toString('utf8'));
            // params.logger.info(JSON.stringify(expected))
            // params.logger.info("-----------")
            // params.logger.info(transactionContext.stub.putState.secondCall.args);
            // params.logger.info("ooooooooo")
            // params.logger.info(Buffer.from(transactionContext.stub.putState.secondCall.args[1].toString()).toString('utf8'));
            // params.logger.info(JSON.stringify(Values.HTB_Producer_2))
            // params.logger.info("-----------")
            // params.logger.info(transactionContext.stub.putState.thirdCall.args);
            // params.logger.info("ooooooooo")
            // params.logger.info(Buffer.from(transactionContext.stub.putState.thirdCall.args[1].toString()).toString('utf8'));
            // params.logger.info(JSON.stringify(Values.HTB_Producer_2))
            // params.logger.info("-----------")

            transactionContext.stub.putState.firstCall.should.have.been.calledWithExactly(
                expected.producerMarketParticipantMrid,
                Buffer.from(JSON.stringify(expected))
            );
            transactionContext.stub.putState.secondCall.should.have.been.calledWithExactly(
                expected2.producerMarketParticipantMrid,
                Buffer.from(JSON.stringify(expected2))
            );
            transactionContext.stub.putState.thirdCall.should.have.been.calledWithExactly(
                expected3.producerMarketParticipantMrid,
                Buffer.from(JSON.stringify(expected3))
            );

            expect(transactionContext.stub.putState.callCount).to.equal(3);
        });
    });

    describe('Test queryProducer', () => {
        it('should return ERROR on queryProducer', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);
            transactionContext.stub.getState.withArgs(Values.HTB_Producer.producerMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTB_Producer)));
            try {
                await star.QueryProducer(transactionContext, 'toto');
            } catch (err) {
                // params.logger.info(err.message)
                expect(err.message).to.equal(DocType.PRODUCER.concat(' : toto does not exist'));
            }
        });

        it('should return SUCCESS on queryProducer', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);
            transactionContext.stub.getState.withArgs(Values.HTB_Producer.producerMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTB_Producer)));

            const producer = await star.QueryProducer(transactionContext, Values.HTB_Producer.producerMarketParticipantMrid);
            let test = JSON.parse(producer);
            expect(test).to.eql(Values.HTB_Producer);
        });
    });

    describe('Test updateProducer', () => {
        it('should return ERROR wrong MSPID', async () => {
            transactionContext.stub.getState.withArgs(Values.HTB_Producer.producerMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTB_Producer)));

            try {
                transactionContext.clientIdentity.getMSPID.returns(Values.FakeMSP);
                await star.UpdateProducer(transactionContext, JSON.stringify(Values.HTB_Producer));
            } catch(err) {
                // params.logger.info(err.message)
                expect(err.message).to.equal('Organisation, FakeMSP does not have write access to update a producer');
            }
        });

        it('should return ERROR NON-JSON value', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);
            try {
                await star.UpdateProducer(transactionContext, 'toto');
            } catch(err) {
                // params.logger.info(err.message)
                expect(err.message).to.equal('ERROR '.concat(DocType.PRODUCER).concat(' -> Input string NON-JSON value'));
            }
        });

        it('should return ERROR on updateProducer producer doesn\'t exist', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);
            transactionContext.stub.getState.withArgs(Values.HTB_Producer.producerMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTB_Producer)));
            const producer = JSON.parse(JSON.stringify(Values.HTB_Producer));
            producer.producerMarketParticipantMrid = 'XXX'

            try {
                await star.UpdateProducer(transactionContext, JSON.stringify(producer));
            } catch (err) {
                expect(err.message).to.equal(DocType.PRODUCER.concat(' : XXX does not exist'));
            }
        });

        it('should return SUCCESS on updateProducer', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);

            transactionContext.stub.getState.withArgs(Values.HTB_Producer.producerMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTB_Producer)));
            const producer : Producer = JSON.parse(JSON.stringify(Values.HTB_Producer));
            producer.producerMarketParticipantRoleType = 'XXX'

            await star.UpdateProducer(transactionContext, JSON.stringify(producer));

            producer.docType = 'producer';

            transactionContext.stub.putState.should.have.been.calledOnceWithExactly(producer.producerMarketParticipantMrid, Buffer.from(JSON.stringify(producer)));
        });
    });

    describe('Test getAllProducer', () => {
        it('should return error on getAllProducer', async () => {

            let ret = await star.GetAllProducer(transactionContext);
            ret = JSON.parse(ret);
            // params.logger.log('ret=', ret)
            expect(ret.length).to.equal(0);
            expect(ret).to.eql([]);
        });

        it('should return success on getAllProducer', async () => {
            const iterator = Values.getQueryMockArrayValues([Values.HTA_Producer, Values.HTB_Producer],mockHandler);
            const query = `{"selector": {"docType": "producer"}}`;
            transactionContext.stub.getQueryResult.withArgs(query).resolves(iterator);

            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);

            let ret = await star.GetAllProducer(transactionContext);
            // params.logger.log('ret=', ret)
            ret = JSON.parse(ret);
            // params.logger.log('ret=', ret)
            expect(ret.length).to.equal(2);

            const expected: Producer[] = [
                Values.HTA_Producer,
                Values.HTB_Producer
            ];

            expect(ret).to.eql(expected);
        });

        // it('should return success on GetAllAssets for non JSON value', async () => {
        //     transactionContext.stub.putState.onFirstCall().callsFake((key, value) => {
        //         transactionContext.stub.states = {};
        //         transactionContext.stub.states[key] = 'non-json-value';
        //     });

        //     transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);
        //     await star.CreateProducer(transactionContext, '{\"producerMarketParticipantMrid\": \"EolienFRvert22EIC\",\"producerMarketParticipantName\": \"EolienFR vert Cie\",\"producerMarketParticipantRoleType\": \"A21\"}');
        //     transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);
        //     await star.CreateProducer(transactionContext, '{\"producerMarketParticipantMrid\": \"EolienFRvert28EIC\",\"producerMarketParticipantName\": \"EolienFR vert Cie\",\"producerMarketParticipantRoleType\": \"A21\"}');
        //     transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);
        //     await star.CreateProducer(transactionContext, '{\"producerMarketParticipantMrid\": \"EolienFRvert29EIC\",\"producerMarketParticipantName\": \"EolienFR vert Cie\",\"producerMarketParticipantRoleType\": \"A22\"}');

        //     let ret = await star.GetAllProducer(transactionContext);
        //     ret = JSON.parse(ret);
        //     // params.logger.log('ret=', ret)
        //     expect(ret.length).to.equal(3);

        //     const expected = [
        //         'non-json-value',
        //         { docType: 'producer', producerMarketParticipantName: 'EolienFR vert Cie', producerMarketParticipantRoleType: 'A21', producerMarketParticipantMrid: 'EolienFRvert28EIC'},
        //         { docType: 'producer', producerMarketParticipantName: 'EolienFR vert Cie', producerMarketParticipantRoleType: 'A22', producerMarketParticipantMrid: 'EolienFRvert29EIC'}
        //     ];

        //     expect(ret).to.eql(expected);
        // });
    });
});
function ChaincodeMessageHandler(ChaincodeMessageHandler: any): any {
    throw new Error('Function not implemented.');
}
