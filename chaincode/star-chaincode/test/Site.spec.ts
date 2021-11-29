
'use strict';
const sinon = require('sinon');
const chai = require('chai');
const sinonChai = require('sinon-chai');
const expect = chai.expect;

import { Context } from 'fabric-contract-api'
import { ChaincodeServer, ChaincodeStub } from 'fabric-shim'

import { Star } from '../src/star'
import { Site } from '../src/site';

let assert = sinon.assert;
chai.use(sinonChai);

describe('Star Tests SITES', () => {
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

    describe('Test false statement', () => {
        it('should avoid else flag missing', async () => {
            await chaincodeStub.getState("EolienFRvert28EIC");
            await chaincodeStub.getQueryResult("EolienFRvert28EIC");
        });
    });

    describe('Test createSite', () => {
        it('should return ERROR on createSite', async () => {
            chaincodeStub.putState.rejects('failed inserting key');

            let star = new Star();
            chaincodeStub.MspiID = 'RTEMSP';
            try {
                await star.createSite(transactionContext, 'RTE01EIC');
            } catch(err) {
                console.info(err.message)
                expect(err.name).to.equal('failed inserting key');
            }
        });

        it('should return ERROR on createSite NON-JSON Value', async () => {
            let star = new Star();
            chaincodeStub.MspiID = 'RTEMSP';
            try {
                await star.createSite(transactionContext, 'RTE01EIC');
            } catch(err) {
                console.info(err.message)
                expect(err.message).to.equal('Organisition, FakeMspID does not have write access');
            }
        });

        // it('should return ERROR wrong MSPID', async () => {
        //     let star = new Star();
        //     try {
        //         await star.createSite(transactionContext, 'RTE01EIC', 'RTE', 'A49');
        //     } catch(err) {
        //         console.info(err.message)
        //         expect(err.message).to.equal('Organisition, FakeMspID does not have write access');
        //     }
        // });

        // it('should return ERROR right MSPID TSO -> DSO', async () => {
        //     let star = new Star();
        //     chaincodeStub.MspiID = 'RTEMSP';
        //     try {
        //         await star.createSite(transactionContext, 'ENEDIS02EIC', 'ENEDIS', 'A50');
        //     } catch(err) {
        //         console.info(err.message)
        //         expect(err.message).to.equal('Organisition, RTEMSP does not have write access for ENEDIS');
        //     }
        // });

        // it('should return ERROR right MSPID DSO -> TSO', async () => {
        //     let star = new Star();
        //     chaincodeStub.MspiID = 'ENEDISMSP';
        //     try {
        //         await star.createSite(transactionContext, 'RTE01EIC', 'RTE', 'A49');
        //     } catch(err) {
        //         console.info(err.message)
        //         expect(err.message).to.equal('Organisition, ENEDISMSP does not have write access for RTE');
        //     }
        // });

        // it('should return SUCCESS wit RTE on createSite', async () => {
        //     let star = new Star();
        //     const systemOperator: Site = {
        //         docType: 'systemOperator',
        //         systemOperaterMarketParticipantMrId: 'RTE01EIC',
        //         marketParticipantName: 'RTE',
        //         marketParticipantRoleType: 'A49'
        //     };

        //     chaincodeStub.MspiID = 'RTEMSP';
        //     await star.createSite(transactionContext, systemOperator.systemOperaterMarketParticipantMrId, systemOperator.marketParticipantName, systemOperator.marketParticipantRoleType);

        //     let ret = JSON.parse((await chaincodeStub.getState("RTE01EIC")).toString());
        //     expect(ret).to.eql( systemOperator );
        // });

        // it('should return SUCCESS with Enedis on createSite', async () => {
        //     let star = new Star();
        //     const systemOperator: Site = {
        //         docType: 'systemOperator',
        //         systemOperaterMarketParticipantMrId: 'ENEDIS02EIC',
        //         marketParticipantName: 'ENEDIS',
        //         marketParticipantRoleType: 'A50'
        //     };

        //     chaincodeStub.MspiID = 'ENEDISMSP';
        //     await star.createSite(transactionContext, systemOperator.systemOperaterMarketParticipantMrId, systemOperator.marketParticipantName, systemOperator.marketParticipantRoleType);

        //     let ret = JSON.parse((await chaincodeStub.getState("ENEDIS02EIC")).toString());
        //     expect(ret).to.eql( systemOperator );
        // });
    });
/*
    describe('Test querySite', () => {
        it('should return ERROR on querySite', async () => {
            let star = new Star();
            chaincodeStub.MspiID = 'RTEMSP';
            await star.createSite(transactionContext, 'RTE01EIC', 'RTE', 'A49');

            try {
                await star.querySite(transactionContext, 'toto');
            } catch (err) {
                // console.info(err.message)
                expect(err.message).to.equal('toto does not exist');
            }
        });

        it('should return SUCCESS on querySite', async () => {
            let star = new Star();
            chaincodeStub.MspiID = 'RTEMSP';
            await star.createSite(transactionContext, 'RTE01EIC', 'RTE', 'A49');
            const systemOperator: Site = {
                docType: 'systemOperator',
                systemOperaterMarketParticipantMrId: 'RTE01EIC',
                marketParticipantName: 'RTE',
                marketParticipantRoleType: 'A49'
            };

            let test = JSON.parse(await star.querySite(transactionContext, "RTE01EIC"));
            expect(test).to.eql(systemOperator);
            let ret = JSON.parse(await chaincodeStub.getState('RTE01EIC'));
            expect(ret).to.eql(systemOperator);
        });
    });

    describe('Test updateSite', () => {
        it('should return ERROR on updateSite', async () => {
            let star = new Star();
            chaincodeStub.MspiID = 'RTEMSP';
            await star.createSite(transactionContext, 'RTE01EIC', 'RTE', 'A49');

            try {
                await star.updateSite(transactionContext, 'XXX', 'RTE', 'A49');
            } catch (err) {
                expect(err.message).to.equal('XXX does not exist');
            }
        });

        it('should return ERROR wrong MSPID', async () => {
            let star = new Star();
            chaincodeStub.MspiID = 'RTEMSP';
            await star.createSite(transactionContext, 'RTE01EIC', 'RTE', 'A49');

            try {
                chaincodeStub.MspiID = 'FakeMSP';
                await star.updateSite(transactionContext, 'RTE01EIC', 'RTE', 'A49');
            } catch(err) {
                console.info(err.message)
                expect(err.message).to.equal('Organisition, FakeMSP does not have write access');
            }
        });

        it('should return ERROR right MSPID TSO -> DSO', async () => {
            let star = new Star();
            chaincodeStub.MspiID = 'RTEMSP';
            await star.createSite(transactionContext, 'RTE01EIC', 'RTE', 'A49');

            try {
                await star.updateSite(transactionContext, 'RTE01EIC', 'ENEDIS', 'A49');
            } catch(err) {
                console.info(err.message)
                expect(err.message).to.equal('Organisition, RTEMSP does not have write access for ENEDIS');
            }
        });

        it('should return ERROR right MSPID DSO -> TSO', async () => {
            let star = new Star();
            chaincodeStub.MspiID = 'ENEDISMSP';
            await star.createSite(transactionContext, 'ENEDIS02EIC', 'ENEDIS', 'A50');

            try {
                await star.updateSite(transactionContext, 'ENEDIS02EIC', 'RTE', 'A49');
            } catch(err) {
                console.info(err.message)
                expect(err.message).to.equal('Organisition, ENEDISMSP does not have write access for RTE');
            }
        });

        it('should return SUCCESS on updateSite', async () => {
            let star = new Star();
            chaincodeStub.MspiID = 'RTEMSP';
            await star.createSite(transactionContext, 'RTE01EIC', 'RTE', 'A49');
            await star.updateSite(transactionContext, 'RTE01EIC', 'RTE', 'toto');

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

    describe('Test getAllSite', () => {
        it('should return error on getAllSite', async () => {
            let star = new Star();

            let ret = await star.getAllSite(transactionContext);
            ret = JSON.parse(ret);
            // console.log('ret=', ret)
            expect(ret.length).to.equal(0);
            expect(ret).to.eql([]);
        });

        it('should return success on getAllSite', async () => {
            let star = new Star();

            chaincodeStub.MspiID = 'RTEMSP';
            await star.createProducer(transactionContext, 'EolienFRvert28EIC', 'EolienFR vert Cie', 'A21');
            chaincodeStub.MspiID = 'RTEMSP';
            await star.createSite(transactionContext, 'RTE01EIC', 'RTE', 'A49');
            chaincodeStub.MspiID = 'ENEDISMSP';
            await star.createSite(transactionContext, 'ENEDIS02EIC', 'ENEDIS', 'A50');

            let ret = await star.getAllSite(transactionContext);
            ret = JSON.parse(ret);
            // console.log('ret=', ret)
            expect(ret.length).to.equal(2);

            const expected: Site[] = [
                { docType: 'systemOperator', marketParticipantName: 'RTE', marketParticipantRoleType: 'A49', systemOperaterMarketParticipantMrId: 'RTE01EIC'},
                { docType: 'systemOperator', marketParticipantName: 'ENEDIS', marketParticipantRoleType: 'A50', systemOperaterMarketParticipantMrId: 'ENEDIS02EIC'}
            ];

            expect(ret).to.eql(expected);
        });

        it('should return success on GetAllAssets for non JSON value', async () => {
            let star = new Star();
            chaincodeStub.putState.onFirstCall().callsFake((key, value) => {
                chaincodeStub.states = {};
                chaincodeStub.states[key] = 'non-json-value';
            });

            chaincodeStub.MspiID = 'RTEMSP';
            await star.createSite(transactionContext, 'RTE00EIC', 'RTE', 'A49');
            chaincodeStub.MspiID = 'RTEMSP';
            await star.createSite(transactionContext, 'RTE01EIC', 'RTE', 'A49');
            chaincodeStub.MspiID = 'ENEDISMSP';
            await star.createSite(transactionContext, 'ENEDIS02EIC', 'ENEDIS', 'A50');

            let ret = await star.getAllSite(transactionContext);
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
*/
});