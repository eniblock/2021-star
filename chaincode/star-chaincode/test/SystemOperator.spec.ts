
'use strict';
const sinon = require('sinon');
const chai = require('chai');
const sinonChai = require('sinon-chai');
const expect = chai.expect;

import { Context } from 'fabric-contract-api'
import { ChaincodeServer, ChaincodeStub } from 'fabric-shim'

import { Star } from '../src/star'
import { SystemOperator } from '../src/systemOperator';

let assert = sinon.assert;
chai.use(sinonChai);

describe('Star Tests', () => {
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

        chaincodeStub.getMspID.callsFake(async () => {
            return Promise.resolve(chaincodeStub.MspiID);
        });
    });

    
    describe('Test InitLedger', () => {
        it('should return ERROR on InitLedger', async () => {
            chaincodeStub.putState.rejects('failed inserting key');
            let star = new Star();
            try {
                await star.initLedger(transactionContext);
            } catch (err) {
                // console.info(err.message)
                expect(err.name).to.equal('failed inserting key');
            }
        });

        it('should return SUCCESS on InitLedger', async () => {    

            let star = new Star();
            await star.initLedger(transactionContext);
        });
    });

    describe('Test createSystemOperatorMarketParticipant', () => {
        it('should return ERROR on createSystemOperatorMarketParticipant', async () => {
            chaincodeStub.putState.rejects('failed inserting key');

            let star = new Star();
            chaincodeStub.MspiID = 'RTEMSP';
            try {
                await star.createSystemOperatorMarketParticipant(transactionContext, 'RTE01EIC', 'RTE', 'A49');
            } catch(err) {
                // console.info(err.message)
                expect(err.name).to.equal('failed inserting key');
            }
        });

        it('should return ERROR wrong MSPID', async () => {
            let star = new Star();
            try {
                await star.createSystemOperatorMarketParticipant(transactionContext, 'RTE01EIC', 'RTE', 'A49');
            } catch(err) {
                console.info(err.message)
                expect(err.message).to.equal('Identity is not a TSO organisition, FakeMspID does not have write access');
            }
        });

        it('should return SUCCESS wit RTE on createSystemOperator', async () => {
            let star = new Star();
            const systemOperator: SystemOperator = {
                docType: 'systemOperatorMarketParticipant',
                systemOperaterMarketParticipantMrId: 'RTE01EIC',
                marketParticipantName: 'RTE',
                marketParticipantRoleType: 'A49'
            };

            chaincodeStub.MspiID = 'RTEMSP';
            await star.createSystemOperatorMarketParticipant(transactionContext, systemOperator.systemOperaterMarketParticipantMrId, systemOperator.marketParticipantName, systemOperator.marketParticipantRoleType);

            let ret = JSON.parse((await chaincodeStub.getState("RTE01EIC")).toString());
            expect(ret).to.eql( systemOperator );
        });
    });

    describe('Test querySystemOperatorMarketParticipant', () => {
        it('should return ERROR on querySystemOperatorMarketParticipant', async () => {
            let star = new Star();
            chaincodeStub.MspiID = 'RTEMSP';
            await star.createSystemOperatorMarketParticipant(transactionContext, 'RTE01EIC', 'RTE', 'A49');

            try {
                await star.querySystemOperatorMarketParticipant(transactionContext, 'toto');
            } catch (err) {
                // console.info(err.message)
                expect(err.message).to.equal('toto does not exist');
            }
        });

        it('should return SUCCESS on querySystemOperator', async () => {
            let star = new Star();
            chaincodeStub.MspiID = 'RTEMSP';
            await star.createSystemOperatorMarketParticipant(transactionContext, 'RTE01EIC', 'RTE', 'A49');
            const systemOperator: SystemOperator = {
                docType: 'systemOperatorMarketParticipant',
                systemOperaterMarketParticipantMrId: 'RTE01EIC',
                marketParticipantName: 'RTE',
                marketParticipantRoleType: 'A49'
            };

            let test = JSON.parse(await star.querySystemOperatorMarketParticipant(transactionContext, "RTE01EIC"));
            expect(test).to.eql(systemOperator);
            let ret = JSON.parse(await chaincodeStub.getState('RTE01EIC'));
            expect(ret).to.eql(systemOperator);
        });
    });

    describe('Test updateSystemOperatorMarketParticipant', () => {
        it('should return ERROR on updateSystemOperatorMarketParticipant', async () => {
            let star = new Star();
            chaincodeStub.MspiID = 'RTEMSP';
            await star.createSystemOperatorMarketParticipant(transactionContext, 'RTE01EIC', 'RTE', 'A49');

            try {
                await star.updateSystemOperatorMarketParticipant(transactionContext, 'XXX', 'RTE', 'A49');
            } catch (err) {
                expect(err.message).to.equal('XXX does not exist');
            }
        });

        it('should return ERROR wrong MSPID', async () => {
            let star = new Star();
            chaincodeStub.MspiID = 'RTEMSP';
            await star.createSystemOperatorMarketParticipant(transactionContext, 'RTE01EIC', 'RTE', 'A49');

            try {
                chaincodeStub.MspiID = 'FakeMSP';
                await star.createSystemOperatorMarketParticipant(transactionContext, 'RTE01EIC', 'RTE', 'A49');
            } catch(err) {
                console.info(err.message)
                expect(err.message).to.equal('Identity is not a TSO organisition, FakeMSP does not have write access');
            }
        });

        it('should return SUCCESS on updateSystemOperatorMarketParticipant', async () => {
            let star = new Star();
            chaincodeStub.MspiID = 'RTEMSP';
            await star.createSystemOperatorMarketParticipant(transactionContext, 'RTE01EIC', 'RTE', 'A49');
            await star.updateSystemOperatorMarketParticipant(transactionContext, 'RTE01EIC', 'titi', 'toto');

            let ret = JSON.parse(await chaincodeStub.getState('RTE01EIC'));
            let expected = {
                docType: 'systemOperatorMarketParticipant',
                systemOperaterMarketParticipantMrId: 'RTE01EIC',
                marketParticipantName: 'titi',
                marketParticipantRoleType: 'toto'
            };
            expect(ret).to.eql(expected);
        });
    });
});

        // chaincodeStub.setCreator.callsFake(async (key) => {
        //     // if (!chaincodeStub.mspid) {
        //     //     chaincodeStub.mspid = {};
        //     // }
        //     chaincodeStub.mspid = key;
        // });

        // chaincodeStub.getCreator.callsFake(async () => {
        //     return Promise.resolve(chaincodeStub.mspid);
        
        // });
/*
        chaincodeStub.getStateByRange.callsFake(async () => {
            function* internalGetStateByRange() {
                if (chaincodeStub.states) {
                    // Shallow copy
                    const copied = Object.assign({}, chaincodeStub.states);

                    for (let key in copied) {
                        yield {value: copied[key]};
                    }
                }
            }

            return Promise.resolve(internalGetStateByRange());
        });

        chaincodeStub.deleteState.callsFake(async (key) => {
            if (chaincodeStub.states) {
                delete chaincodeStub.states[key];
            }
            return Promise.resolve(key);
        });

ENEDIS02EIC;ENEDIS;A50
*/