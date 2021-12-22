
'use strict';
const sinon = require('sinon');
const chai = require('chai');
const sinonChai = require('sinon-chai');
const expect = chai.expect;

import { Context } from 'fabric-contract-api'
import { ChaincodeServer, ChaincodeStub } from 'fabric-shim'

import { Star } from '../src/star'

let assert = sinon.assert;
chai.use(sinonChai);

describe('Star Tests RESTITUTIONS', () => {
    let transactionContext, chaincodeStub;
    beforeEach(() => {
        transactionContext = new Context();

        chaincodeStub = sinon.createStubInstance(ChaincodeStub);
        transactionContext.setChaincodeStub(chaincodeStub);
        chaincodeStub.MspiID = 'FakeMspID'

        chaincodeStub.putState.callsFake((key, value) => {
            if (!chaincodeStub.states) {
                chaincodeStub.states = {};
            }
            chaincodeStub.states[key] = value;
        });

        chaincodeStub.getState.callsFake(async (key) => {
            let ret;
            if (chaincodeStub.states) {
                ret = chaincodeStub.states[key];
            }
            return Promise.resolve(ret);
        });

        chaincodeStub.getQueryResult.callsFake(async (query) => {
            function* internalGetQueryResult() {
                if (chaincodeStub.states) {
                    const copied = Object.assign({}, chaincodeStub.states);
                    for (let key in copied) {
                        const obJson = JSON.parse(copied[key].toString('utf8'));
                        const objStr: string = obJson.docType;
                        const queryJson = JSON.parse(query);
                        const queryStr = queryJson.selector.docType
                        if (queryStr == objStr) {
                            yield {value: copied[key]};
                        }
                    }
                }
            }
            return Promise.resolve(internalGetQueryResult());
        });


        chaincodeStub.getMspID.callsFake(async () => {
            return Promise.resolve(chaincodeStub.MspiID);
        });
    });

    describe('Test false statement', () => {
        it('should avoid else flag missing', async () => {
            await chaincodeStub.getState("EolienFRvert28EIC");
            await chaincodeStub.getQueryResult("EolienFRvert28EIC");
        });
    });

    describe('Test restitutionSystemOperaterMarketParticipant', () => {    
        it('should return SUCCESS empty Participants', async () => {
            let star = new Star();

            let ret = await star.restitutionSystemOperaterMarketParticipant(transactionContext);
            ret = JSON.parse(ret);
            // console.log('ret=', ret)

            const expected = { producers: [], systemOperators: [] };

            expect(ret).to.eql(expected);
        });

        it('should return SUCCESS on System Operater view', async () => {
            let star = new Star();

            chaincodeStub.MspiID = 'RTEMSP';
            await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrId\": \"RTE01EIC\",\"marketParticipantName\": \"RTE\",\"marketParticipantRoleType\": \"A49\"}');
            await star.createProducer(transactionContext, 'EolienFRvert28EIC', 'EolienFR vert Cie', 'A21');
            chaincodeStub.MspiID = 'ENEDISMSP';
            await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrId\": \"ENEDIS02EIC\",\"marketParticipantName\": \"ENEDIS\",\"marketParticipantRoleType\": \"A50\"}');
            await star.createProducer(transactionContext, 'EolienFRvert29EIC', 'EolienFR vert Cie', 'A50');


            let ret = await star.restitutionSystemOperaterMarketParticipant(transactionContext);
            ret = JSON.parse(ret);
            // console.log('ret=', ret)
            // expect(ret.length).to.equal(3);

            const expected = {
                producers: [
                  {
                    docType: 'producer',
                    producerMarketParticipantMrId: 'EolienFRvert28EIC',
                    producerMarketParticipantName: 'EolienFR vert Cie',
                    producerMarketParticipantRoleType: 'A21'
                  },
                  {
                    docType: 'producer',
                    producerMarketParticipantMrId: 'EolienFRvert29EIC',
                    producerMarketParticipantName: 'EolienFR vert Cie',
                    producerMarketParticipantRoleType: 'A50'
                  }
                ],
                systemOperators: [
                  {
                    docType: 'systemOperator',
                    marketParticipantName: 'RTE',
                    marketParticipantRoleType: 'A49',
                    systemOperatorMarketParticipantMrId: 'RTE01EIC'
                  },
                  {
                    docType: 'systemOperator',
                    marketParticipantName: 'ENEDIS',
                    marketParticipantRoleType: 'A50',
                    systemOperatorMarketParticipantMrId: 'ENEDIS02EIC'
                  }
                ]
              };

            expect(ret).to.eql(expected);
        });
    });

    describe('Test restitutionProducerMarketParticipant', () => {    
        it('should return SUCCESS on Producer view', async () => {
            let star = new Star();

            chaincodeStub.MspiID = 'RTEMSP';
            await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrId\": \"RTE01EIC\",\"marketParticipantName\": \"RTE\",\"marketParticipantRoleType\": \"A49\"}');
            await star.createProducer(transactionContext, 'EolienFRvert28EIC', 'EolienFR vert Cie', 'A21');
            chaincodeStub.MspiID = 'ENEDISMSP';
            await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrId\": \"ENEDIS02EIC\",\"marketParticipantName\": \"ENEDIS\",\"marketParticipantRoleType\": \"A50\"}');
            await star.createProducer(transactionContext, 'EolienFRvert29EIC', 'EolienFR vert Cie', 'A50');


            let ret = await star.restitutionProducerMarketParticipant(transactionContext, 'EolienFRvert28EIC');
            ret = JSON.parse(ret);
            // console.log('ret=', ret)
            // expect(ret.length).to.equal(3);

            const expected = {
                producers: {
                    docType: 'producer',
                    producerMarketParticipantMrId: 'EolienFRvert28EIC',
                    producerMarketParticipantName: 'EolienFR vert Cie',
                    producerMarketParticipantRoleType: 'A21'
                },
                systemOperators: [
                {
                    docType: 'systemOperator',
                    marketParticipantName: 'RTE',
                    marketParticipantRoleType: 'A49',
                    systemOperatorMarketParticipantMrId: 'RTE01EIC'
                },
                {
                    docType: 'systemOperator',
                    marketParticipantName: 'ENEDIS',
                    marketParticipantRoleType: 'A50',
                    systemOperatorMarketParticipantMrId: 'ENEDIS02EIC'
                }
                ]
            };

            expect(ret).to.eql(expected);
        });
    });
});