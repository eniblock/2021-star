
'use strict';
const sinon = require('sinon');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinonChai = require('sinon-chai');
const expect = chai.expect;

import { ChaincodeStub, ClientIdentity } from 'fabric-shim'

import { Star } from '../src/star'

import { Values } from './Values';

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

describe('Star Tests RESTITUTIONS', () => {
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

    describe('Test ViewSystemOperaterMarketParticipant', () => {
        it('should return SUCCESS empty Participants', async () => {
            let ret = await star.ViewSystemOperaterMarketParticipant(transactionContext);
            ret = JSON.parse(ret);
            // console.log('ret=', ret)

            const expected = { producers: [], systemOperators: [] };

            expect(ret).to.eql(expected);
        });

        it('should return SUCCESS on System Operater view', async () => {
            const query_SystemOperator = `{"selector": {"docType": "systemOperator"}}`;
            const iterator_SystemOperator = Values.getSystemOperatorQueryMock2Values(Values.HTA_systemoperator, Values.HTB_systemoperator,mockHandler);
            transactionContext.stub.getQueryResult.withArgs(query_SystemOperator).resolves(iterator_SystemOperator);

            const query_Producer = `{"selector": {"docType": "producer"}}`;
            const iterator_Producer = Values.getProducerQueryMock2Values(Values.HTA_Producer, Values.HTB_Producer,mockHandler);
            transactionContext.stub.getQueryResult.withArgs(query_Producer).resolves(iterator_Producer);

            let ret = await star.ViewSystemOperaterMarketParticipant(transactionContext);
            ret = JSON.parse(ret);
            // console.log('ret=', ret)
            // expect(ret.length).to.equal(3);

            const expected = {
                producers: [Values.HTA_Producer, Values.HTB_Producer],
                systemOperators: [Values.HTA_systemoperator, Values.HTB_systemoperator]
              };

            expect(ret).to.eql(expected);
        });
    });

    describe('Test ViewProducerMarketParticipant', () => {
        it('should return SUCCESS on Producer view', async () => {
            const query_SystemOperator = `{"selector": {"docType": "systemOperator"}}`;
            const iterator_SystemOperator = Values.getSystemOperatorQueryMock2Values(Values.HTA_systemoperator, Values.HTB_systemoperator,mockHandler);
            transactionContext.stub.getQueryResult.withArgs(query_SystemOperator).resolves(iterator_SystemOperator);

            transactionContext.stub.getState.withArgs(Values.HTA_Producer.producerMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_Producer)));
            transactionContext.stub.getState.withArgs(Values.HTB_Producer.producerMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTB_Producer)));

            let ret = await star.ViewProducerMarketParticipant(transactionContext, Values.HTA_Producer.producerMarketParticipantMrid);
            ret = JSON.parse(ret);
            // console.log('ret=', ret)
            // expect(ret.length).to.equal(3);

            const expected = {
                producers: Values.HTA_Producer,
                systemOperators: [Values.HTA_systemoperator, Values.HTB_systemoperator]
              };

            expect(ret).to.eql(expected);
        });
    });
});
