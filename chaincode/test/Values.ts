import { Producer } from "../src/model/producer";
import { Site } from "../src/model/site";
import { SystemOperator } from "../src/model/systemOperator";
import { StateQueryIterator } from 'fabric-shim/lib/iterators';
import { OrganizationTypeMsp } from "../src/enums/OrganizationMspType";
import { ActivationDocument } from "../src/model/activationDocument";
import { YellowPages } from "../src/model/yellowPages";
import { EnergyAmount } from "../src/model/energyAmount";
import { EnergyAccount } from "../src/model/energyAccount";

export class Values {
    public static FakeMSP = 'FakeMSP';

    /*********************************************/
    /*                 TOOLS                     */
    /*********************************************/


    public static async deleteJSONField(jsonvalue: string, todelete: string): Promise<string> {
        let value:string = JSON.parse(JSON.stringify(jsonvalue));

        let pattern = new RegExp("\"".concat(todelete).concat("[^,]+,"));
        let newvalue = value.replace(pattern, '');
        if (newvalue === value) {
            pattern = new RegExp(",\"".concat(todelete).concat("[^}]+"));
            newvalue = value.replace(pattern, '');
        }
        return newvalue;
    }

    private static getStartDate(): Date {
        var dateStart = new Date();
        dateStart.setUTCMilliseconds(1);
        dateStart.setUTCSeconds(0);
        dateStart.setMinutes(0);
        dateStart.setHours(0);

        //dateStart is yesterday at 00h00'00''001
        dateStart = new Date(dateStart.getTime() - 86400000);

        return dateStart;
    }

    private static getEndDate(): Date {
        var dateEnd = Values.getStartDate();

        //dateEnd is dateStart at 23h29'10''001
        dateEnd.setHours(23);
        dateEnd.setMinutes(29);
        dateEnd.setSeconds(10);

        return dateEnd;
    }


    public static reduceDateStr(dateref: string, reducing: number): string {
        var reducedDate = new Date(Date.parse(dateref));

        reducedDate = new Date(reducedDate.getTime() - reducing);

        return JSON.parse(JSON.stringify(reducedDate));
    }


    /*********************************************/
    /*               PRODUCER                    */
    /*********************************************/
    public static HTB_Producer: Producer = {
        producerMarketParticipantMrid: "17X0000013097450",
        producerMarketParticipantName: "EolienFR vert Cie",
        producerMarketParticipantRoleType: "A21"
    };

    public static HTA_Producer: Producer = {
        producerMarketParticipantMrid: "17X000001309745X",
        producerMarketParticipantName: "EolienFR vert Cie",
        producerMarketParticipantRoleType: "A21"
    };

    public static async getProducerQueryMock2Values(producerA:Producer, producerB:Producer, mockHandler:any): Promise<StateQueryIterator> {
        const producerA_str = JSON.stringify(producerA);
        const keyA = producerA.producerMarketParticipantMrid
        var mockValueA = [10,1,"",20,1,keyA,30,1,Buffer.from(producerA_str)]
        const messageA = {resultBytes:mockValueA}

        const producerB_str = JSON.stringify(producerB);
        const keyB = producerB.producerMarketParticipantMrid
        var mockValueB = [10,1,"",20,1,keyB,30,1,Buffer.from(producerB_str)]
        const messageB = {resultBytes:mockValueB}

        const response = {results: [messageA, messageB], hasMore: false};
        return new StateQueryIterator(mockHandler, 'TestChannelID','txId', response);
    }



    /*********************************************/
    /*            SYSTEM_OPERATOR                */
    /*********************************************/
    public static HTA_systemoperator: SystemOperator = {
        systemOperatorMarketParticipantMrid: "17V0000009927464",
        systemOperatorMarketParticipantName: OrganizationTypeMsp.ENEDIS,
        systemOperatorMarketParticipantRoleType: "A50"
    };

    public static HTA_systemoperator2: SystemOperator = {
        systemOperatorMarketParticipantMrid: "17V000000992746E",
        systemOperatorMarketParticipantName: OrganizationTypeMsp.ENEDIS,
        systemOperatorMarketParticipantRoleType: "A50"
    };

    public static HTA_systemoperator3: SystemOperator = {
        systemOperatorMarketParticipantMrid: "17V000000992746D",
        systemOperatorMarketParticipantName: OrganizationTypeMsp.ENEDIS,
        systemOperatorMarketParticipantRoleType: "A50"
    };

    public static HTB_systemoperator: SystemOperator = {
        systemOperatorMarketParticipantMrid: "17V000000992746D",
        systemOperatorMarketParticipantName: OrganizationTypeMsp.RTE,
        systemOperatorMarketParticipantRoleType: "A49"
    };

    public static HTB_systemoperator2: SystemOperator = {
        systemOperatorMarketParticipantMrid: "17V0000009927469",
        systemOperatorMarketParticipantName: OrganizationTypeMsp.RTE,
        systemOperatorMarketParticipantRoleType: "A49"
    };

    public static async getSystemOperatorQueryMock2Values(inputA:SystemOperator, inputB:SystemOperator, mockHandler:any): Promise<StateQueryIterator> {
        const inputA_str = JSON.stringify(inputA);
        const keyA = inputA.systemOperatorMarketParticipantMrid
        var mockValueA = [10,1,"",20,1,keyA,30,1,Buffer.from(inputA_str)]
        const messageA = {resultBytes:mockValueA}

        const inputB_str = JSON.stringify(inputB);
        const keyB = inputB.systemOperatorMarketParticipantMrid
        var mockValueB = [10,1,"",20,1,keyB,30,1,Buffer.from(inputB_str)]
        const messageB = {resultBytes:mockValueB}

        const response = {results: [messageA, messageB], hasMore: false};
        return new StateQueryIterator(mockHandler, 'TestChannelID','txId', response);
    }


    /*********************************************/
    /*                  SITE                     */
    /*********************************************/
    public static async getSiteQueryMock(site:Site, collectionName: string, mockHandler:any): Promise<StateQueryIterator> {
        const site_str = JSON.stringify(site);
        const key = site.systemOperatorMarketParticipantMrid

        var mockValue = [10,1,collectionName,20,1,key,30,1,Buffer.from(site_str)]
        const message = {resultBytes:mockValue}
        const response = {results: [message], hasMore: false};
        return new StateQueryIterator(mockHandler, 'TestChannelID','txId', response);
    }

    public static async getSiteQueryMock2Values(siteA:Site, siteB:Site, collectionName: string, mockHandler:any): Promise<StateQueryIterator> {
        const siteA_str = JSON.stringify(siteA);
        const keyA = siteA.systemOperatorMarketParticipantMrid
        var mockValueA = [10,1,collectionName,20,1,keyA,30,1,Buffer.from(siteA_str)]
        const messageA = {resultBytes:mockValueA}

        const siteB_str = JSON.stringify(siteB);
        const keyB = siteB.systemOperatorMarketParticipantMrid
        var mockValueB = [10,1,collectionName,20,1,keyB,30,1,Buffer.from(siteB_str)]
        const messageB = {resultBytes:mockValueB}

        const response = {results: [messageA, messageB], hasMore: false};
        return new StateQueryIterator(mockHandler, 'TestChannelID','txId', response);
    }


    public static HTB_site_valid: Site = {
        meteringPointMrid: 'PDL00000000289766',
        systemOperatorMarketParticipantMrid: Values.HTB_systemoperator.systemOperatorMarketParticipantMrid,
        producerMarketParticipantMrid: '17X0000013097450',
        technologyType: 'Eolien',
        siteType: 'Injection',
        siteName: 'Ferme éolienne de Genonville',
        substationMrid: 'GDO A4RTD',
        substationName: 'CIVRAY',
        marketEvaluationPointMrid: 'CodePPE', // optional
        schedulingEntityRegisteredResourceMrid: 'CodeEDP', // optional
        siteAdminMrid: '489 981 029', // optional
        siteLocation: 'Biscarosse', // optional
        siteIecCode: 'S7X0000013077478', // optional
        systemOperatorEntityFlexibilityDomainMrid: 'PSC4511', // optional
        systemOperatorEntityFlexibilityDomainName: 'Départ 1', // optional
        systemOperatorCustomerServiceName: 'DR Nantes Deux-Sèvres', // optional
    };

    public static siteHTBProdA: Site = {
        meteringPointMrid: 'PDL00000000289767',
        systemOperatorMarketParticipantMrid: '17V0000009927469',
        producerMarketParticipantMrid: '17X0000013097450',
        technologyType: 'Eolien',
        siteType: 'Injection',
        siteName: 'Ferme éolienne de Genonville',
        substationMrid: 'GDO A4RTD',
        substationName: 'CIVRAY',
        marketEvaluationPointMrid: 'CodePPE',
        schedulingEntityRegisteredResourceMrid: 'CodeEDP',
        siteAdminMrid: '489 981 029',
        siteLocation: 'Biscarosse',
        siteIecCode: 'S7X0000013077478',
        systemOperatorEntityFlexibilityDomainMrid: 'PSC4511',
        systemOperatorEntityFlexibilityDomainName: 'Départ 1',
        systemOperatorCustomerServiceName: 'DR Nantes Deux-Sèvres'
    }

    public static siteHTBProdB: Site = {
        meteringPointMrid: 'PDL00000000289768',
        systemOperatorMarketParticipantMrid: '17V0000009927469',
        producerMarketParticipantMrid: '17X0000013097450',
        technologyType: 'Eolien',
        siteType: 'Injection',
        siteName: 'Ferme éolienne de Genonville',
        substationMrid: 'GDO A4RTD',
        substationName: 'CIVRAY',
        marketEvaluationPointMrid: 'CodePPE',
        schedulingEntityRegisteredResourceMrid: 'CodeEDP',
        siteAdminMrid: '489 981 029',
        siteLocation: 'Biscarosse',
        siteIecCode: 'S7X0000013077478',
        systemOperatorEntityFlexibilityDomainMrid: 'PSC4511',
        systemOperatorEntityFlexibilityDomainName: 'Départ 1',
        systemOperatorCustomerServiceName: 'DR Nantes Deux-Sèvres'
    }


    public static HTA_site_valid: Site = {
        meteringPointMrid: 'PDL00000000289766',
        systemOperatorMarketParticipantMrid: '17V0000009927464',
        producerMarketParticipantMrid: '17X000001309745X',
        technologyType: 'Eolien',
        siteType: 'Injection',
        siteName: 'Ferme éolienne de Genonville',
        substationMrid: 'GDO A4RTD',
        substationName: 'CIVRAY',
        // marketEvaluationPointMrid: 'CodePPE', // optional
        // schedulingEntityRegisteredResourceMrid: 'CodeEDP', // optional
        siteAdminMrid: '489 981 029', // optional
        siteLocation: 'Biscarosse', // optional
        siteIecCode: 'S7X0000013077478', // optional
        systemOperatorEntityFlexibilityDomainMrid: 'PSC4511', // optional
        systemOperatorEntityFlexibilityDomainName: 'Départ 1', // optional
        systemOperatorCustomerServiceName: 'DR Nantes Deux-Sèvres', // optional
    }

    public static HTA_site_valid_ProdA: Site = {
        meteringPointMrid: 'PDL00000000289766',
        systemOperatorMarketParticipantMrid: '17V0000009927464',
        producerMarketParticipantMrid: '17X000001309745X',
        technologyType: 'Eolien',
        siteType: 'Injection',
        siteName: 'Ferme éolienne de AAAAAAAAAAAA',
        substationMrid: 'GDO A4RTD',
        substationName: 'CIVRAY',
        // marketEvaluationPointMrid: 'CodePPE', // optional
        // schedulingEntityRegisteredResourceMrid: 'CodeEDP', // optional
        siteAdminMrid: '489 981 029', // optional
        siteLocation: 'Biscarosse', // optional
        siteIecCode: 'S7X0000013077478', // optional
        systemOperatorEntityFlexibilityDomainMrid: 'PSC4511', // optional
        systemOperatorEntityFlexibilityDomainName: 'Départ 1', // optional
        systemOperatorCustomerServiceName: 'DR Nantes Deux-Sèvres', // optional
    }

    public static HTA_site_valid_ProdB: Site = {
        meteringPointMrid: 'PDL00000000289766',
        systemOperatorMarketParticipantMrid: '17V0000009927464',
        producerMarketParticipantMrid: '17X000001309745X',
        technologyType: 'Eolien',
        siteType: 'Injection',
        siteName: 'Ferme éolienne de BBBBBBBBBBBB',
        substationMrid: 'GDO A4RTD',
        substationName: 'CIVRAY',
        // marketEvaluationPointMrid: 'CodePPE', // optional
        // schedulingEntityRegisteredResourceMrid: 'CodeEDP', // optional
        siteAdminMrid: '489 981 029', // optional
        siteLocation: 'Biscarosse', // optional
        siteIecCode: 'S7X0000013077478', // optional
        systemOperatorEntityFlexibilityDomainMrid: 'PSC4511', // optional
        systemOperatorEntityFlexibilityDomainName: 'Départ 1', // optional
        systemOperatorCustomerServiceName: 'DR Nantes Deux-Sèvres', // optional
    }

    /*********************************************/
    /*                YELLOW_PAGE                */
    /*********************************************/
    public static async getYellowPageQueryMock(yellowpage:YellowPages, mockHandler:any): Promise<StateQueryIterator> {
        const input_str = JSON.stringify(yellowpage);
        const key = yellowpage.originAutomationRegisteredResourceMrid

        var mockValue = [10,1,"",20,1,key,30,1,Buffer.from(input_str)]
        const message = {resultBytes:mockValue}
        const response = {results: [message], hasMore: false};
        return new StateQueryIterator(mockHandler, 'TestChannelID','txId', response);
    }

    // public static async getYellowPageQueryMock2Values(yellowpageA:YellowPages, yellowpageB:YellowPages, mockHandler:any): Promise<StateQueryIterator> {
    //     const siteA_str = JSON.stringify(yellowpageA);
    //     const keyA = yellowpageA.originAutomationRegisteredResourceMrid
    //     var mockValueA = [10,1,"",20,1,keyA,30,1,Buffer.from(siteA_str)]
    //     const messageA = {resultBytes:mockValueA}

    //     const siteB_str = JSON.stringify(yellowpageB);
    //     const keyB = yellowpageB.originAutomationRegisteredResourceMrid
    //     var mockValueB = [10,1,"",20,1,keyB,30,1,Buffer.from(siteB_str)]
    //     const messageB = {resultBytes:mockValueB}

    //     const response = {results: [messageA, messageB], hasMore: false};
    //     return new StateQueryIterator(mockHandler, 'TestChannelID','txId', response);
    // }

    public static HTB_yellowPage: YellowPages = {
        yellowPageMrid: 'ypId_HTB',
        originAutomationRegisteredResourceMrid: Values.HTA_site_valid.meteringPointMrid,
        registeredResourceMrid: 'CRIVA1_TSO_Y411',
        systemOperatorMarketParticipantMrid: Values.HTB_systemoperator.systemOperatorMarketParticipantMrid
    };

    public static HTA_yellowPage: YellowPages = {
        yellowPageMrid: 'ypId_HTA',
        originAutomationRegisteredResourceMrid: 'CRIVA1_DSO_Y411',
        registeredResourceMrid: Values.HTB_site_valid.meteringPointMrid,
        systemOperatorMarketParticipantMrid: Values.HTA_systemoperator.systemOperatorMarketParticipantMrid
    };


    /*********************************************/
    /*            ACTIVATION_DOCUMENT            */
    /*********************************************/
    public static async getActivationDocumentQueryMock(activationdocument:ActivationDocument, mockHandler:any): Promise<StateQueryIterator> {
        const input_str = JSON.stringify(activationdocument);
        const key = activationdocument.activationDocumentMrid

        var mockValue = [10,1,"",20,1,key,30,1,Buffer.from(input_str)]
        const message = {resultBytes:mockValue}
        const response = {results: [message], hasMore: false};
        return new StateQueryIterator(mockHandler, 'TestChannelID','txId', response);
    }

    public static async getActivationDocumentQueryMock2Values(activationdocumentA:ActivationDocument, activationdocumentB:ActivationDocument, mockHandler:any): Promise<StateQueryIterator> {
        const inputA_str = JSON.stringify(activationdocumentA);
        const keyA = activationdocumentA.activationDocumentMrid
        var mockValueA = [10,1,"",20,1,keyA,30,1,Buffer.from(inputA_str)]
        const messageA = {resultBytes:mockValueA}

        const inputB_str = JSON.stringify(activationdocumentB);
        const keyB = activationdocumentB.activationDocumentMrid
        var mockValueB = [10,1,"",20,1,keyB,30,1,Buffer.from(inputB_str)]
        const messageB = {resultBytes:mockValueB}

        const response = {results: [messageA, messageB], hasMore: false};
        return new StateQueryIterator(mockHandler, 'TestChannelID','txId', response);
    }

    public static HTA_ActivationDocument_Valid: ActivationDocument = {
        activationDocumentMrid: '8c56459a-794a-4ed1-a7f6-33b0064508f1', // PK
        originAutomationRegisteredResourceMrid: Values.HTA_yellowPage.originAutomationRegisteredResourceMrid, // FK1
        registeredResourceMrid: Values.HTA_site_valid.meteringPointMrid,
        measurementUnitName: 'KW',
        messageType: 'string',
        businessType: 'string',
        orderEnd: false,

        orderValue: '1',
        startCreatedDateTime: JSON.parse(JSON.stringify(Values.getStartDate())),
        // testDateTime: 'Date', // Test DELETE ME //////////////////////
        endCreatedDateTime: JSON.parse(JSON.stringify(Values.getEndDate())),
        revisionNumber: '1',
        reasonCode: 'string', // optionnal in case of TVC modulation
        senderMarketParticipantMrid: Values.HTA_systemoperator.systemOperatorMarketParticipantMrid,
        receiverMarketParticipantMrid: Values.HTA_Producer.producerMarketParticipantMrid,
    }

    public static HTA_ActivationDocument_Valid_Doc2: ActivationDocument = {
        activationDocumentMrid: '8c56459a-794a-4ed1-a7f6-33b0064508f2', // PK
        originAutomationRegisteredResourceMrid: Values.HTA_yellowPage.originAutomationRegisteredResourceMrid, // FK1
        registeredResourceMrid: Values.HTA_site_valid.meteringPointMrid,
        measurementUnitName: 'KW',
        messageType: 'string',
        businessType: 'string',
        orderEnd: false,

        orderValue: '1',
        startCreatedDateTime: JSON.parse(JSON.stringify(Values.getStartDate())),
        // testDateTime: 'Date', // Test DELETE ME //////////////////////
        endCreatedDateTime: JSON.parse(JSON.stringify(Values.getEndDate())),
        revisionNumber: '1',
        reasonCode: 'string', // optionnal in case of TVC modulation
        senderMarketParticipantMrid: Values.HTA_systemoperator2.systemOperatorMarketParticipantMrid,
        receiverMarketParticipantMrid: Values.HTA_Producer.producerMarketParticipantMrid,
    }

    public static HTB_ActivationDocument_JustStartDate: ActivationDocument = {
        activationDocumentMrid: "8c56459a-794a-4ed1-a7f6-33b0064508f1-r1",
        originAutomationRegisteredResourceMrid: Values.HTB_yellowPage.originAutomationRegisteredResourceMrid,
        registeredResourceMrid: Values.HTB_site_valid.meteringPointMrid,
        measurementUnitName: "MW",
        messageType: "string",
        businessType: "string",

        orderEnd: false,
        orderValue: "1",
        startCreatedDateTime: JSON.parse(JSON.stringify(Values.getStartDate())),
        revisionNumber: "1",
        reasonCode: "string",
        senderMarketParticipantMrid: Values.HTB_systemoperator.systemOperatorMarketParticipantMrid,
        receiverMarketParticipantMrid: Values.HTB_Producer.producerMarketParticipantMrid
    }

    public static HTB_ActivationDocument_JustEndDate: ActivationDocument = {
        activationDocumentMrid: "8c56459a-794a-4ed1-a7f6-33b0064508f1-r2",
        originAutomationRegisteredResourceMrid: Values.HTB_yellowPage.originAutomationRegisteredResourceMrid,
        registeredResourceMrid: Values.HTB_site_valid.meteringPointMrid,
        measurementUnitName: "MW",
        messageType: "string",
        businessType: "string",

        orderEnd: false,
        orderValue: "1",
        endCreatedDateTime: JSON.parse(JSON.stringify(Values.getEndDate())),
        revisionNumber: "1",
        reasonCode: "string",
        senderMarketParticipantMrid: Values.HTB_systemoperator.systemOperatorMarketParticipantMrid,
        receiverMarketParticipantMrid: Values.HTB_Producer.producerMarketParticipantMrid
    }

    public static HTB_ActivationDocument_HTA_JustStartDate: ActivationDocument = {
        activationDocumentMrid: "8c56459a-794a-4ed1-a7f6-33b0064508f12",
        originAutomationRegisteredResourceMrid: Values.HTA_yellowPage.originAutomationRegisteredResourceMrid,
        registeredResourceMrid: Values.HTB_site_valid.meteringPointMrid,
        measurementUnitName: "MW",
        messageType: "string",
        businessType: "string",

        orderEnd: false,
        orderValue: "1",
        startCreatedDateTime: JSON.parse(JSON.stringify(Values.getStartDate())),
        revisionNumber: "1",
        reasonCode: "string",
        senderMarketParticipantMrid: Values.HTB_systemoperator.systemOperatorMarketParticipantMrid,
        receiverMarketParticipantMrid: Values.HTA_systemoperator2.systemOperatorMarketParticipantMrid
    }



    /*********************************************/
    /*               ENERGY_AMOUNT               */
    /*********************************************/
    public static async getEnergyAmountQueryMock(input:EnergyAmount, mockHandler:any): Promise<StateQueryIterator> {
        const input_str = JSON.stringify(input);
        const key = input.energyAmountMarketDocumentMrid

        var mockValue = [10,1,"",20,1,key,30,1,Buffer.from(input_str)]
        const message = {resultBytes:mockValue}
        const response = {results: [message], hasMore: false};
        return new StateQueryIterator(mockHandler, 'TestChannelID','txId', response);
    }

    public static HTB_EnergyAmount : EnergyAmount = {
        energyAmountMarketDocumentMrid: "ea4cef73-ff6b-400b-8957-d34000eb30a1",
        activationDocumentMrid: "8c56459a-794a-4ed1-a7f6-33b0064508f1",
        registeredResourceMrid: Values.HTB_ActivationDocument_JustStartDate.registeredResourceMrid,
        quantity: "number",
        measurementUnitName: "KW",
        revisionNumber: "1",
        businessType: "A14 / Z14",
        docStatus: "A02",
        processType: "A05",
        classificationType: "A02",
        areaDomain: "17X100A100A0001A",
        senderMarketParticipantMrid: Values.HTB_systemoperator.systemOperatorMarketParticipantMrid,
        senderMarketParticipantRole: "A50",
        receiverMarketParticipantMrid: "Producteur1",
        receiverMarketParticipantRole: "A32",
        createdDateTime: "2021-10-22T10:29:10.000Z",
        timeInterval: "2021-10-22T01:01:01.001Z / 2021-10-22T23:59:59.999Z",
    };

    public static HTA_EnergyAmount : EnergyAmount = {
        energyAmountMarketDocumentMrid: "ea4cef73-ff6b-400b-8957-d34000eb30a3",
        activationDocumentMrid: "CIVRA/PRM50012536123467/2021-10-22T11:29:10.000Z/2021-10-22T22:29:10.000Z",
        registeredResourceMrid: "PRM50012536123467",
        quantity: "number",
        measurementUnitName: "KW",
        revisionNumber: "1",
        businessType: "A14 / Z14",
        docStatus: "A02",
        processType: "A05",
        classificationType: "A02",
        areaDomain: "17X100A100A0001A",
        senderMarketParticipantMrid: Values.HTA_systemoperator.systemOperatorMarketParticipantMrid,
        senderMarketParticipantRole: "A50",
        receiverMarketParticipantMrid: "Producteur1",
        receiverMarketParticipantRole: "A32",
        createdDateTime: "2021-10-22T10:29:10.000Z",
        timeInterval: "2021-10-22T01:01:01.001Z / 2021-10-22T23:59:59.999Z",
    };





    /*********************************************/
    /*               ENERGY_ACCOUNT              */
    /*********************************************/
    public static async getEnergyAccountQueryMock(input:EnergyAccount, mockHandler:any): Promise<StateQueryIterator> {
        const input_str = JSON.stringify(input);
        const key = input.energyAccountMarketDocumentMrid

        var mockValue = [10,1,"",20,1,key,30,1,Buffer.from(input_str)]
        const message = {resultBytes:mockValue}
        const response = {results: [message], hasMore: false};
        return new StateQueryIterator(mockHandler, 'TestChannelID','txId', response);
    }

    public static async getEnergyAccountQueryMock2Values(inputA:EnergyAccount, inputB:EnergyAccount, mockHandler:any): Promise<StateQueryIterator> {
        const inputA_str = JSON.stringify(inputA);
        const keyA = inputA.energyAccountMarketDocumentMrid
        var mockValueA = [10,1,"",20,1,keyA,30,1,Buffer.from(inputA_str)]
        const messageA = {resultBytes:mockValueA}

        const inputB_str = JSON.stringify(inputB);
        const keyB = inputB.energyAccountMarketDocumentMrid
        var mockValueB = [10,1,"",20,1,keyB,30,1,Buffer.from(inputB_str)]
        const messageB = {resultBytes:mockValueB}

        const response = {results: [messageA, messageB], hasMore: false};
        return new StateQueryIterator(mockHandler, 'TestChannelID','txId', response);
    }

    public static HTA_EnergyAccount_a1 : EnergyAccount = {
        energyAccountMarketDocumentMrid: "ea4cef73-ff6b-400b-8957-d34000eb30a1",
        meteringPointMrid: "PRM50012536123456",
        // marketEvaluationPointMrid: "CodePPE",
        areaDomain: "17X100A100A0001A",
        senderMarketParticipantMrid: Values.HTA_systemoperator.systemOperatorMarketParticipantMrid,
        senderMarketParticipantRole: "A50",
        receiverMarketParticipantMrid: "Producteur1",
        receiverMarketParticipantRole: "A32",
        createdDateTime: "2021-10-21T10:29:10.000Z",
        measurementUnitName: "KW",
        timeInterval: "2021-10-21T10:29:10.000Z",
        resolution: "PT10M",
        timeSeries: [{ inQuantity: 7500, position: 3 }, { inQuantity: 7500, position: 3 }],
        revisionNumber: "1",
        businessType: "A14 / Z14",
        docStatus: "A02",
        processType: "A05",
        classificationType: "A02",
        product: "Energie active/Réactive",
        startCreatedDateTime: "",
        endCreatedDateTime: ""
    }

    public static HTA_EnergyAccount_a2 : EnergyAccount = {
        energyAccountMarketDocumentMrid: "ea4cef73-ff6b-400b-8957-d34000eb30a2",
        meteringPointMrid: "PRM50012536123456",
        // marketEvaluationPointMrid: "CodePPE",
        areaDomain: "17X100A100A0001A",
        senderMarketParticipantMrid: Values.HTA_systemoperator.systemOperatorMarketParticipantMrid,
        senderMarketParticipantRole: "A50",
        receiverMarketParticipantMrid: "Producteur2",
        receiverMarketParticipantRole: "A32",
        createdDateTime: "2021-10-22T10:29:10.000Z",
        measurementUnitName: "KW",
        timeInterval: "2021-10-22T10:29:10.000Z",
        resolution: "PT10M",
        timeSeries: [{ inQuantity: 7500, position: 3 }, { inQuantity: 7500, position: 3 }],
        revisionNumber: "1",
        businessType: "A14 / Z14",
        docStatus: "A02",
        processType: "A05",
        classificationType: "A02",
        product: "Energie active/Réactive",
        startCreatedDateTime: "",
        endCreatedDateTime: ""
    }

    public static HTA_EnergyAccount_a3 : EnergyAccount = {
        energyAccountMarketDocumentMrid: "ea4cef73-ff6b-400b-8957-d34000eb30a3",
        meteringPointMrid: Values.HTA_site_valid.meteringPointMrid,
        // marketEvaluationPointMrid: "CodePPE",
        areaDomain: "17X100A100A0001A",
        senderMarketParticipantMrid: Values.HTA_systemoperator.systemOperatorMarketParticipantMrid,
        senderMarketParticipantRole: "A50",
        receiverMarketParticipantMrid: "Producteur1",
        receiverMarketParticipantRole: "A32",
        createdDateTime: "2021-10-22T10:29:10.000Z",
        measurementUnitName: "KW",
        timeInterval: "2021-10-22T10:29:10.000Z",
        resolution: "PT10M",
        timeSeries: [{ inQuantity: 7500, position: 3 }, { inQuantity: 7500, position: 3 }],
        revisionNumber: "1",
        businessType: "A14 / Z14",
        docStatus: "A02",
        processType: "A05",
        classificationType: "A02",
        product: "Energie active/Réactive",
        startCreatedDateTime: "",
        endCreatedDateTime: ""
    };


    public static HTB_EnergyAccount_a3 : EnergyAccount = {
        energyAccountMarketDocumentMrid: "ea4cef73-ff6b-400b-8957-d34000eb30a3",
        meteringPointMrid: Values.HTB_site_valid.meteringPointMrid,
        marketEvaluationPointMrid: "CodePPE",
        areaDomain: "17X100A100A0001A",
        senderMarketParticipantMrid: Values.HTB_site_valid.systemOperatorMarketParticipantMrid,
        senderMarketParticipantRole: "A50",
        receiverMarketParticipantMrid: "Producteur1",
        receiverMarketParticipantRole: "A32",
        createdDateTime: "2021-10-22T10:29:10.000Z",
        measurementUnitName: "KW",
        timeInterval: "2021-10-22T10:29:10.000Z",
        resolution: "PT10M",
        timeSeries: [{ inQuantity: 7500, position: 3 }, { inQuantity: 7500, position: 3 }],
        revisionNumber: "1",
        businessType: "A14 / Z14",
        docStatus: "A02",
        processType: "A05",
        classificationType: "A02",
        product: "Energie active/Réactive",
        startCreatedDateTime: "",
        endCreatedDateTime: ""
    }

    public static HTB_EnergyAccount_a4 : EnergyAccount = {
        energyAccountMarketDocumentMrid: "ea4cef73-ff6b-400b-8957-d34000eb30a4",
        meteringPointMrid: Values.siteHTBProdA.meteringPointMrid,
        marketEvaluationPointMrid: "CodePPE",
        areaDomain: "17X100A100A0001A",
        senderMarketParticipantMrid: Values.HTB_systemoperator.systemOperatorMarketParticipantMrid,
        senderMarketParticipantRole: "A50",
        receiverMarketParticipantMrid: "Producteur2",
        receiverMarketParticipantRole: "A32",
        createdDateTime: "2021-10-22T10:29:10.000Z",
        measurementUnitName: "KW",
        timeInterval: "2021-10-22T10:29:10.000Z",
        resolution: "PT10M",
        timeSeries: [{ inQuantity: 7500, position: 3 }, { inQuantity: 7500, position: 3 }],
        revisionNumber: "1",
        businessType: "A14 / Z14",
        docStatus: "A02",
        processType: "A05",
        classificationType: "A02",
        product: "Energie active/Réactive",
        startCreatedDateTime: "",
        endCreatedDateTime: ""
    }

    public static HTB_EnergyAccount_a5 : EnergyAccount = {
        energyAccountMarketDocumentMrid: "ea4cef73-ff6b-400b-8957-d34000eb30a5",
        meteringPointMrid: Values.HTB_site_valid.meteringPointMrid,
        marketEvaluationPointMrid: "CodePPE",
        areaDomain: "17X100A100A0001A",
        senderMarketParticipantMrid: Values.HTB_systemoperator.systemOperatorMarketParticipantMrid,
        senderMarketParticipantRole: "A50",
        receiverMarketParticipantMrid: "Producteur2",
        receiverMarketParticipantRole: "A32",
        createdDateTime: "2021-10-22T10:29:10.000Z",
        measurementUnitName: "KW",
        timeInterval: "2021-10-22T10:29:10.000Z",
        resolution: "PT10M",
        timeSeries: [{ inQuantity: 7500, position: 3 }, { inQuantity: 7500, position: 3 }],
        revisionNumber: "1",
        businessType: "A14 / Z14",
        docStatus: "A02",
        processType: "A05",
        classificationType: "A02",
        product: "Energie active/Réactive",
        startCreatedDateTime: "",
        endCreatedDateTime: ""
    }


}
