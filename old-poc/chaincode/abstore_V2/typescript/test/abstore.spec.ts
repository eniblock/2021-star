
'use strict';
const sinon = require('sinon');
const chai = require('chai');
const sinonChai = require('sinon-chai');
const expect = chai.expect;

import { Context } from 'fabric-contract-api'
import { ChaincodeStub } from 'fabric-shim'

// const { Context } = require('fabric-contract-api');
// const { ChaincodeStub } = require('fabric-shim');

// const AssetTransfer = require('../src/assetTransfer.ts');
import { ABstore } from '../src/abstore'

let assert = sinon.assert;
chai.use(sinonChai);

describe('ABstore Tests', () => {
    let transactionContext, chaincodeStub, asset;
    beforeEach(() => {
        transactionContext = new Context();

        chaincodeStub = sinon.createStubInstance(ChaincodeStub);
        transactionContext.setChaincodeStub(chaincodeStub);

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

        chaincodeStub.deleteState.callsFake(async (key) => {
            if (chaincodeStub.states) {
                delete chaincodeStub.states[key];
            }
            return Promise.resolve(key);
        });

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

    });

    describe('Test InitLedger', () => {
        // it('should return error on InitLedger', async () => {
        //     chaincodeStub.putState.rejects('failed inserting key');
        //     let abstore = new ABstore();
        //     try {
        //         // console.log('transactionContext=', transactionContext)
        //         await abstore.Init(transactionContext);
        //         assert.fail('InitLedger should have failed');
        //     } catch (err) {
        //         // console.log("err=", err.name)
        //         // expect(err.name).to.equal('failed inserting key');
        //         expect(err.name).to.equal('TypeError');
        //     }
        // });

        it('should return success on InitLedger', async () => {
            let abstore = new ABstore();
            await abstore.Init(transactionContext);
            let ret = JSON.parse((await chaincodeStub.getState('A')).toString());
            // console.log("ret A=", ret)
            expect(ret).to.eql(100);
            ret = JSON.parse((await chaincodeStub.getState('B')).toString());
            // console.log("ret B=", ret)
            expect(ret).to.eql(100);
        });
    });

    describe('Test invoke', () => {
        // it('should return error on invoke', async () => {
        //     chaincodeStub.putState.rejects('failed inserting key');

        //     let abstore = new ABstore();
        //     await abstore.Init(transactionContext);
        //     try {
        //         await abstore.invoke(transactionContext, ["A", "B", "10"]);
        //         assert.fail('invoke should have failed');
        //     } catch(err) {
        //         expect(err.name).to.equal('failed inserting key');
        //     }
        // });

        it('should return success on invoke', async () => {
            let abstore = new ABstore();

            await abstore.Init(transactionContext);
            await abstore.invoke(transactionContext, ['A', "B", "10"]);

            let ret = JSON.parse((await chaincodeStub.getState("A")).toString());
            expect(ret).to.eql(90);
        });
    });

    describe('Test query', () => {
    //     it('should return error on query', async () => {
    //         let abstore = new ABstore();
    //         await abstore.CreateAsset(transactionContext, asset.ID, asset.Color, asset.Size, asset.Owner, asset.AppraisedValue);

    //         try {
    //             await abstore.query(transactionContext, 'asset2');
    //             assert.fail('query should have failed');
    //         } catch (err) {
    //             expect(err.message).to.equal('The asset asset2 does not exist');
    //         }
    //     });

        it('should return success on query', async () => {
            let abstore = new ABstore();
            await abstore.Init(transactionContext);
            let test = await abstore.query(transactionContext, ["B"]).toString();
            console.log('test', test);
            let ret = JSON.parse(await chaincodeStub.getState('A'));
            expect(ret).to.eql(100);
        });
    });

    describe('Test delete', () => {
    //     it('should return error on delete', async () => {
    //         let abstore = new ABstore();
    //         await abstore.CreateAsset(transactionContext, asset.ID, asset.Color, asset.Size, asset.Owner, asset.AppraisedValue);

    //         try {
    //             await abstore.delete(transactionContext, 'asset2');
    //             assert.fail('delete should have failed');
    //         } catch (err) {
    //             expect(err.message).to.equal('The asset asset2 does not exist');
    //         }
    //     });

        it('should return success on delete', async () => {
            let abstore = new ABstore();

            await abstore.Init(transactionContext);
            await abstore.delete(transactionContext, ['A']);
            let ret = await chaincodeStub.getState('A');
            expect(ret).to.equal(undefined);
            ret = JSON.parse(await chaincodeStub.getState('B'));
            expect(ret).to.equal(100);
        });
    });

});