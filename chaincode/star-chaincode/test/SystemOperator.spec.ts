
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

        chaincodeStub.getQueryResult.callsFake(async (query) => {
            function* internalGetQueryResult() {
                if (chaincodeStub.states) {
                    const copied = Object.assign({}, chaincodeStub.states);
                    for (let key in copied) {
                        if (copied[key] == 'non-json-value') { 
                            yield {value: copied[key]};
                            continue
                        }
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

    describe('Test createSystemOperator', () => {
        it('should return ERROR on createSystemOperator', async () => {
            chaincodeStub.putState.rejects('failed inserting key');

            let star = new Star();
            chaincodeStub.MspiID = 'RTEMSP';
            try {
                await star.createSystemOperator(transactionContext, 'RTE01EIC', 'RTE', 'A49');
            } catch(err) {
                console.info(err.message)
                expect(err.name).to.equal('failed inserting key');
            }
        });

        it('should return ERROR wrong MSPID', async () => {
            let star = new Star();
            try {
                await star.createSystemOperator(transactionContext, 'RTE01EIC', 'RTE', 'A49');
            } catch(err) {
                console.info(err.message)
                expect(err.message).to.equal('Organisition, FakeMspID does not have write access');
            }
        });

        it('should return ERROR right MSPID TSO -> DSO', async () => {
            let star = new Star();
            chaincodeStub.MspiID = 'RTEMSP';
            try {
                await star.createSystemOperator(transactionContext, 'ENEDIS02EIC', 'ENEDIS', 'A50');
            } catch(err) {
                console.info(err.message)
                expect(err.message).to.equal('Organisition, RTEMSP does not have write access for ENEDIS');
            }
        });

        it('should return ERROR right MSPID DSO -> TSO', async () => {
            let star = new Star();
            chaincodeStub.MspiID = 'ENEDISMSP';
            try {
                await star.createSystemOperator(transactionContext, 'RTE01EIC', 'RTE', 'A49');
            } catch(err) {
                console.info(err.message)
                expect(err.message).to.equal('Organisition, ENEDISMSP does not have write access for RTE');
            }
        });

        it('should return SUCCESS wit RTE on createSystemOperator', async () => {
            let star = new Star();
            const systemOperator: SystemOperator = {
                docType: 'systemOperator',
                systemOperaterMarketParticipantMrId: 'RTE01EIC',
                marketParticipantName: 'RTE',
                marketParticipantRoleType: 'A49'
            };

            chaincodeStub.MspiID = 'RTEMSP';
            await star.createSystemOperator(transactionContext, systemOperator.systemOperaterMarketParticipantMrId, systemOperator.marketParticipantName, systemOperator.marketParticipantRoleType);

            let ret = JSON.parse((await chaincodeStub.getState("RTE01EIC")).toString());
            expect(ret).to.eql( systemOperator );
        });

        it('should return SUCCESS with Enedis on createSystemOperator', async () => {
            let star = new Star();
            const systemOperator: SystemOperator = {
                docType: 'systemOperator',
                systemOperaterMarketParticipantMrId: 'ENEDIS02EIC',
                marketParticipantName: 'ENEDIS',
                marketParticipantRoleType: 'A50'
            };

            chaincodeStub.MspiID = 'ENEDISMSP';
            await star.createSystemOperator(transactionContext, systemOperator.systemOperaterMarketParticipantMrId, systemOperator.marketParticipantName, systemOperator.marketParticipantRoleType);

            let ret = JSON.parse((await chaincodeStub.getState("ENEDIS02EIC")).toString());
            expect(ret).to.eql( systemOperator );
        });
    });

    describe('Test querySystemOperator', () => {
        it('should return ERROR on querySystemOperator', async () => {
            let star = new Star();
            chaincodeStub.MspiID = 'RTEMSP';
            await star.createSystemOperator(transactionContext, 'RTE01EIC', 'RTE', 'A49');

            try {
                await star.querySystemOperator(transactionContext, 'toto');
            } catch (err) {
                // console.info(err.message)
                expect(err.message).to.equal('toto does not exist');
            }
        });

        it('should return SUCCESS on querySystemOperator', async () => {
            let star = new Star();
            chaincodeStub.MspiID = 'RTEMSP';
            await star.createSystemOperator(transactionContext, 'RTE01EIC', 'RTE', 'A49');
            const systemOperator: SystemOperator = {
                docType: 'systemOperator',
                systemOperaterMarketParticipantMrId: 'RTE01EIC',
                marketParticipantName: 'RTE',
                marketParticipantRoleType: 'A49'
            };

            let test = JSON.parse(await star.querySystemOperator(transactionContext, "RTE01EIC"));
            expect(test).to.eql(systemOperator);
            let ret = JSON.parse(await chaincodeStub.getState('RTE01EIC'));
            expect(ret).to.eql(systemOperator);
        });
    });

    describe('Test updateSystemOperator', () => {
        it('should return ERROR on updateSystemOperator', async () => {
            let star = new Star();
            chaincodeStub.MspiID = 'RTEMSP';
            await star.createSystemOperator(transactionContext, 'RTE01EIC', 'RTE', 'A49');

            try {
                await star.updateSystemOperator(transactionContext, 'XXX', 'RTE', 'A49');
            } catch (err) {
                expect(err.message).to.equal('XXX does not exist');
            }
        });

        it('should return ERROR wrong MSPID', async () => {
            let star = new Star();
            chaincodeStub.MspiID = 'RTEMSP';
            await star.createSystemOperator(transactionContext, 'RTE01EIC', 'RTE', 'A49');

            try {
                chaincodeStub.MspiID = 'FakeMSP';
                await star.updateSystemOperator(transactionContext, 'RTE01EIC', 'RTE', 'A49');
            } catch(err) {
                console.info(err.message)
                expect(err.message).to.equal('Organisition, FakeMSP does not have write access');
            }
        });

        it('should return ERROR right MSPID TSO -> DSO', async () => {
            let star = new Star();
            chaincodeStub.MspiID = 'RTEMSP';
            await star.createSystemOperator(transactionContext, 'RTE01EIC', 'RTE', 'A49');

            try {
                await star.updateSystemOperator(transactionContext, 'RTE01EIC', 'ENEDIS', 'A49');
            } catch(err) {
                console.info(err.message)
                expect(err.message).to.equal('Organisition, RTEMSP does not have write access for ENEDIS');
            }
        });

        it('should return ERROR right MSPID DSO -> TSO', async () => {
            let star = new Star();
            chaincodeStub.MspiID = 'ENEDISMSP';
            await star.createSystemOperator(transactionContext, 'ENEDIS02EIC', 'ENEDIS', 'A50');

            try {
                await star.updateSystemOperator(transactionContext, 'ENEDIS02EIC', 'RTE', 'A49');
            } catch(err) {
                console.info(err.message)
                expect(err.message).to.equal('Organisition, ENEDISMSP does not have write access for RTE');
            }
        });

        it('should return SUCCESS on updateSystemOperator', async () => {
            let star = new Star();
            chaincodeStub.MspiID = 'RTEMSP';
            await star.createSystemOperator(transactionContext, 'RTE01EIC', 'RTE', 'A49');
            await star.updateSystemOperator(transactionContext, 'RTE01EIC', 'RTE', 'toto');

            let ret = JSON.parse(await chaincodeStub.getState('RTE01EIC'));
            let expected = {
                docType: 'systemOperator',
                systemOperaterMarketParticipantMrId: 'RTE01EIC',
                marketParticipantName: 'RTE',
                marketParticipantRoleType: 'toto'
            };
            expect(ret).to.eql(expected);
        });
    });

    describe('Test getAllSystemOperator', () => {
        // it('should return error on getAllSystemOperator', async () => {
        //     let star = new Star();

        //     let ret = await star.getAllSystemOperator(transactionContext);
        //     ret = JSON.parse(ret);
        //     console.log('ret=', ret)
        //     expect(ret.length).to.equal(0);
        //     expect(ret).to.eql([]);
        // });

        it('should return success on getAllSystemOperator', async () => {
            let star = new Star();

            chaincodeStub.MspiID = 'RTEMSP';
            await star.createSystemOperator(transactionContext, 'RTE01EIC', 'RTE', 'A49');
            chaincodeStub.MspiID = 'ENEDISMSP';
            await star.createSystemOperator(transactionContext, 'ENEDIS02EIC', 'ENEDIS', 'A50');

            let ret = await star.getAllSystemOperator(transactionContext);
            ret = JSON.parse(ret);
            // console.log('ret=', ret)
            expect(ret.length).to.equal(2);

            const expected: SystemOperator[] = [
                { docType: 'systemOperator', marketParticipantName: 'RTE', marketParticipantRoleType: 'A49', systemOperaterMarketParticipantMrId: 'RTE01EIC'},
                { docType: 'systemOperator', marketParticipantName: 'ENEDIS', marketParticipantRoleType: 'A50', systemOperaterMarketParticipantMrId: 'ENEDIS02EIC'}
            ];

            expect(ret).to.eql(expected);
        });

        it('should return success on GetAllAssets for non JSON value', async () => {
            let star = new Star();
            chaincodeStub.putState.onFirstCall().callsFake((key, value) => {
                if (!chaincodeStub.states) {
                    chaincodeStub.states = {};
                }
                chaincodeStub.states[key] = 'non-json-value';
            });

            chaincodeStub.MspiID = 'RTEMSP';
            await star.createSystemOperator(transactionContext, 'RTE00EIC', 'RTE', 'A49');
            chaincodeStub.MspiID = 'RTEMSP';
            await star.createSystemOperator(transactionContext, 'RTE01EIC', 'RTE', 'A49');
            chaincodeStub.MspiID = 'ENEDISMSP';
            await star.createSystemOperator(transactionContext, 'ENEDIS02EIC', 'ENEDIS', 'A50');

            let ret = await star.getAllSystemOperator(transactionContext);
            ret = JSON.parse(ret);
            // console.log('ret=', ret)
            expect(ret.length).to.equal(3);

            const expected = [
                'non-json-value',
                { docType: 'systemOperator', marketParticipantName: 'RTE', marketParticipantRoleType: 'A49', systemOperaterMarketParticipantMrId: 'RTE01EIC'},
                { docType: 'systemOperator', marketParticipantName: 'ENEDIS', marketParticipantRoleType: 'A50', systemOperaterMarketParticipantMrId: 'ENEDIS02EIC'}
            ];

            expect(ret).to.eql(expected);
        });
    });
});