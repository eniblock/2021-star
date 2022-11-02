import { Producer } from "../src/model/producer";
import { Site } from "../src/model/site";
import { SystemOperator } from "../src/model/systemOperator";
import { StateQueryIterator } from 'fabric-shim/lib/iterators';
import { OrganizationTypeMsp } from "../src/enums/OrganizationMspType";
import { ActivationDocument } from "../src/model/activationDocument/activationDocument";
import { YellowPages } from "../src/model/yellowPages";
import { EnergyAmount } from "../src/model/energyAmount";
import { EnergyAccount } from "../src/model/energyAccount";
import { AttachmentFile, AttachmentFileWithStatus } from "../src/model/attachmentFile";
import { DocType } from "../src/enums/DocType";
import { ReserveBidMarketDocument } from "../src/model/reserveBidMarketDocument";
import { BalancingDocument } from "../src/model/balancingDocument";
import { CommonService } from '../src/controller/service/CommonService';

export class Values {
    public static FakeMSP = 'FakeMSP';

    /*********************************************/
    /*                 TOOLS                     */
    /*********************************************/
    public static async getQueryMockArrayValues(
        inputDataList:any[],
        mockHandler:any): Promise<StateQueryIterator> {

        var messageList: any[] = [];
        var key_int = 100;
        for (var data of inputDataList) {
            const input_str = JSON.stringify(data);
            const key = JSON.stringify(key_int);
            var mockValue = [10,1,"",20,1,key,30,1,Buffer.from(input_str)]
            const message = {resultBytes:mockValue};
            messageList.push(message);
            key_int++;
        }

        const response = {results: messageList, hasMore: false};
        return new StateQueryIterator(mockHandler, 'TestChannelID','txId', response);
    }

    public static getStartDate(): Date {
        var dateStart: Date = new Date();
        var offset:number = 0 - new Date().getTimezoneOffset();
        dateStart.setHours(0,0 + offset,0,1);
        // dateStart.setHours(0,0,0,1);

        //dateStart is yesterday at 00h00'00''001
        dateStart.setDate(dateStart.getDate() - 1);

        return dateStart;
    }

    private static getEndDate(): Date {
        var dateEnd = Values.getStartDate();
        var offset:number = 0 - new Date().getTimezoneOffset();

        //dateEnd is dateStart at 23h29'10''001
        dateEnd.setHours(23,29 + offset,10);

        return dateEnd;
    }



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


    /*********************************************/
    /*               PRODUCER                    */
    /*********************************************/
    public static HTB_Producer: Producer = {
        producerMarketParticipantMrid: "17X0000013097450",
        producerMarketParticipantName: "EolienFR vert Cie",
        producerMarketParticipantRoleType: "A21"
    };

    public static HTB_Producer_2: Producer = {
        producerMarketParticipantMrid: "17X0000023097450",
        producerMarketParticipantName: "EolienFR vert Cie",
        producerMarketParticipantRoleType: "A21"
    };

    public static HTB_Producer_3: Producer = {
        producerMarketParticipantMrid: "17X0000033097450",
        producerMarketParticipantName: "EolienFR vert Cie",
        producerMarketParticipantRoleType: "A21"
    };

    public static HTA_Producer: Producer = {
        producerMarketParticipantMrid: "17X000001309745X",
        producerMarketParticipantName: "EolienFR vert Cie",
        producerMarketParticipantRoleType: "A21"
    };


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


    /*********************************************/
    /*                  SITE                     */
    /*********************************************/
    public static HTB_site_valid: Site = {
        meteringPointMrid: 'PDLHTB10000289766',
        systemOperatorMarketParticipantMrid: Values.HTB_systemoperator.systemOperatorMarketParticipantMrid,
        producerMarketParticipantMrid: Values.HTB_Producer.producerMarketParticipantMrid,
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
        systemOperatorCustomerServiceName: 'DR Nantes Deux-Sèvres',
    };

    public static siteHTBProdA: Site = {
        meteringPointMrid: 'PDLHTB20000289767',
        systemOperatorMarketParticipantMrid: '17V0000009927469',
        producerMarketParticipantMrid: Values.HTB_Producer.producerMarketParticipantMrid,
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
        systemOperatorCustomerServiceName: 'DR Nantes Deux-Sèvres',
    }

    public static siteHTBProdB: Site = {
        meteringPointMrid: 'PDLHTB30000289768',
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
        systemOperatorCustomerServiceName: 'DR Nantes Deux-Sèvres',
    }


    public static HTA_site_valid: Site = {
        meteringPointMrid: 'PDLHTA10000289766',
        systemOperatorMarketParticipantMrid: Values.HTA_systemoperator.systemOperatorMarketParticipantMrid,
        producerMarketParticipantMrid: Values.HTA_Producer.producerMarketParticipantMrid,
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
        meteringPointMrid: 'PDLHTA20000289766',
        systemOperatorMarketParticipantMrid: Values.HTA_systemoperator.systemOperatorMarketParticipantMrid,
        producerMarketParticipantMrid: Values.HTA_Producer.producerMarketParticipantMrid,
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
        meteringPointMrid: 'PDLHTA30000289766',
        systemOperatorMarketParticipantMrid: Values.HTA_systemoperator.systemOperatorMarketParticipantMrid,
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
    public static HTA_ActivationDocument_Valid: ActivationDocument = {
        activationDocumentMrid: '8c56459a-794a-4ed1-a7f6-33b0064508f1', // PK
        originAutomationRegisteredResourceMrid: Values.HTA_yellowPage.originAutomationRegisteredResourceMrid, // FK1
        registeredResourceMrid: Values.HTA_site_valid.meteringPointMrid,
        measurementUnitName: 'KW',
        messageType: 'D01',
        businessType: 'Z01',
        orderEnd: false,

        orderValue: '1',
        startCreatedDateTime: JSON.parse(JSON.stringify(Values.getStartDate())),
        // testDateTime: 'Date', // Test DELETE ME //////////////////////
        endCreatedDateTime: JSON.parse(JSON.stringify(Values.getEndDate())),
        revisionNumber: '1',
        reasonCode: 'A70', // optionnal in case of TVC modulation
        senderMarketParticipantMrid: Values.HTA_systemoperator.systemOperatorMarketParticipantMrid,
        receiverMarketParticipantMrid: Values.HTA_Producer.producerMarketParticipantMrid,
        eligibilityStatusEditable: true
    }

    public static HTA_ActivationDocument_Valid_ForRTETest: ActivationDocument = {
        activationDocumentMrid: '8c56459a-794a-4ed1-a7f6-33b0064508f1', // PK
        originAutomationRegisteredResourceMrid: Values.HTA_yellowPage.originAutomationRegisteredResourceMrid, // FK1
        registeredResourceMrid: Values.HTA_site_valid.meteringPointMrid,
        measurementUnitName: 'KW',
        messageType: 'A98',
        businessType: 'C55',
        orderEnd: false,

        orderValue: '1',
        startCreatedDateTime: JSON.parse(JSON.stringify(Values.getStartDate())),
        // testDateTime: 'Date', // Test DELETE ME //////////////////////
        endCreatedDateTime: JSON.parse(JSON.stringify(Values.getEndDate())),
        revisionNumber: '1',
        reasonCode: 'A70', // optionnal in case of TVC modulation
        senderMarketParticipantMrid: Values.HTA_systemoperator.systemOperatorMarketParticipantMrid,
        receiverMarketParticipantMrid: Values.HTA_Producer.producerMarketParticipantMrid,
        eligibilityStatusEditable: true
    }

    public static HTA_ActivationDocument_Valid_Doc2: ActivationDocument = {
        activationDocumentMrid: '8c56459a-794a-4ed1-a7f6-33b0064508f2', // PK
        originAutomationRegisteredResourceMrid: Values.HTA_yellowPage.originAutomationRegisteredResourceMrid, // FK1
        registeredResourceMrid: Values.HTA_site_valid_ProdA.meteringPointMrid,
        measurementUnitName: 'KW',
        messageType: 'D01',
        businessType: 'Z03',
        orderEnd: false,

        orderValue: '1',
        startCreatedDateTime: JSON.parse(JSON.stringify(Values.getStartDate())),
        // testDateTime: 'Date', // Test DELETE ME //////////////////////
        endCreatedDateTime: JSON.parse(JSON.stringify(Values.getEndDate())),
        revisionNumber: '1',
        reasonCode: 'Y98', // optionnal in case of TVC modulation
        senderMarketParticipantMrid: Values.HTA_systemoperator2.systemOperatorMarketParticipantMrid,
        receiverMarketParticipantMrid: Values.HTA_Producer.producerMarketParticipantMrid,
        eligibilityStatusEditable: true
    }

    public static HTB_ActivationDocument_Valid: ActivationDocument = {
        activationDocumentMrid: "8c56459a-794a-4ed1-a7f6-33b0064508f1-r1",
        originAutomationRegisteredResourceMrid: Values.HTB_yellowPage.originAutomationRegisteredResourceMrid,
        registeredResourceMrid: Values.HTB_site_valid.meteringPointMrid,
        measurementUnitName: "MW",
        messageType: "string",
        businessType: "string",

        orderEnd: false,
        orderValue: "1",
        startCreatedDateTime: JSON.parse(JSON.stringify(Values.getStartDate())),
        endCreatedDateTime: JSON.parse(JSON.stringify(Values.getEndDate())),
        revisionNumber: "1",
        reasonCode: "string",
        senderMarketParticipantMrid: Values.HTB_systemoperator.systemOperatorMarketParticipantMrid,
        receiverMarketParticipantMrid: Values.HTB_Producer.producerMarketParticipantMrid,
        eligibilityStatusEditable: true
    }

    public static HTB_ActivationDocument_JustStartDate: ActivationDocument = {
        activationDocumentMrid: "8c56459a-794a-4ed1-a7f6-33b0064508f1-r1",
        originAutomationRegisteredResourceMrid: Values.HTB_yellowPage.originAutomationRegisteredResourceMrid,
        registeredResourceMrid: Values.HTB_site_valid.meteringPointMrid,
        measurementUnitName: "MW",
        messageType: "A98",
        businessType: "C55",

        orderEnd: false,
        orderValue: "1",
        startCreatedDateTime: JSON.parse(JSON.stringify(Values.getStartDate())),
        revisionNumber: "1",
        reasonCode: "A70",
        senderMarketParticipantMrid: Values.HTB_systemoperator.systemOperatorMarketParticipantMrid,
        receiverMarketParticipantMrid: Values.HTB_Producer.producerMarketParticipantMrid,
        eligibilityStatusEditable: true
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
        receiverMarketParticipantMrid: Values.HTB_Producer.producerMarketParticipantMrid,
        eligibilityStatusEditable: true
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
        receiverMarketParticipantMrid: Values.HTA_systemoperator2.systemOperatorMarketParticipantMrid,
        eligibilityStatusEditable: true
    }

    public static HTB_ActivationDocument_HTA_JustStartDate2: ActivationDocument = {
        activationDocumentMrid: "8c56459a-794a-4ed1-a7f6-33b0064508f22",
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
        receiverMarketParticipantMrid: Values.HTA_systemoperator2.systemOperatorMarketParticipantMrid,
        eligibilityStatusEditable: true
    }




    /*********************************************/
    /*               ENERGY_AMOUNT               */
    /*********************************************/
    public static HTB_EnergyAmount : EnergyAmount = {
        energyAmountMarketDocumentMrid: "mmea4cef73-ff6b-400b-8957-d34000eb30a1",
        activationDocumentMrid: Values.HTB_ActivationDocument_Valid.activationDocumentMrid,
        registeredResourceMrid: Values.HTB_ActivationDocument_Valid.registeredResourceMrid,
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
        timeInterval: `${Values.HTB_ActivationDocument_Valid.startCreatedDateTime}/${Values.HTB_ActivationDocument_Valid.endCreatedDateTime}`,
    };

    public static HTB_EnergyAmount_2 : EnergyAmount = {
        energyAmountMarketDocumentMrid: "mmea4cef73-ff6b-400b-8957-d34000eb30a2",
        activationDocumentMrid: Values.HTB_ActivationDocument_Valid.activationDocumentMrid,
        registeredResourceMrid: Values.HTB_ActivationDocument_Valid.registeredResourceMrid,
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
        createdDateTime: "2021-10-23T10:29:10.000Z",
        timeInterval: `${Values.HTB_ActivationDocument_Valid.startCreatedDateTime}/${Values.HTB_ActivationDocument_Valid.endCreatedDateTime}`,
    };

    public static HTA_EnergyAmount : EnergyAmount = {
        energyAmountMarketDocumentMrid: "mmea4cef73-ff6b-400b-8957-d34000eb30a3",
        activationDocumentMrid: Values.HTA_ActivationDocument_Valid.activationDocumentMrid,
        registeredResourceMrid: Values.HTA_site_valid.meteringPointMrid,
        quantity: "42",
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
        timeInterval: `${Values.HTA_ActivationDocument_Valid.startCreatedDateTime}/${Values.HTA_ActivationDocument_Valid.endCreatedDateTime}`,
    };

    public static HTA_EnergyAmount_2 : EnergyAmount = {
        energyAmountMarketDocumentMrid: "mmea4cef73-ff6b-400b-8957-d34000eb30a4",
        activationDocumentMrid: Values.HTA_ActivationDocument_Valid.activationDocumentMrid,
        registeredResourceMrid: Values.HTA_site_valid.meteringPointMrid,
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
        createdDateTime: "2021-10-23T10:29:10.000Z",
        timeInterval: `${Values.HTA_ActivationDocument_Valid.startCreatedDateTime}/${Values.HTA_ActivationDocument_Valid.endCreatedDateTime}`,
    };






    /*********************************************/
    /*               ENERGY_ACCOUNT              */
    /*********************************************/
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
        startCreatedDateTime: "2021-10-21T10:29:10.000Z",
        endCreatedDateTime: "",
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
        endCreatedDateTime: "",
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
        timeSeries: [{"position":1,"inQuantity":3822},{"position":2,"inQuantity":10873},{"position":3,"inQuantity":10203},{"position":4,"inQuantity":0},{"position":5,"inQuantity":0},{"position":6,"inQuantity":0},{"position":7,"inQuantity":0},{"position":8,"inQuantity":0},{"position":9,"inQuantity":0},{"position":10,"inQuantity":0},{"position":11,"inQuantity":0},{"position":12,"inQuantity":0},{"position":13,"inQuantity":0},{"position":14,"inQuantity":0},{"position":15,"inQuantity":0},{"position":16,"inQuantity":0},{"position":17,"inQuantity":0},{"position":18,"inQuantity":0},{"position":19,"inQuantity":0},{"position":20,"inQuantity":0},{"position":21,"inQuantity":0},{"position":22,"inQuantity":0},{"position":23,"inQuantity":175},{"position":24,"inQuantity":1205},{"position":25,"inQuantity":1832},{"position":26,"inQuantity":814},{"position":27,"inQuantity":701},{"position":28,"inQuantity":508},{"position":29,"inQuantity":991},{"position":30,"inQuantity":684},{"position":31,"inQuantity":1273},{"position":32,"inQuantity":1797},{"position":33,"inQuantity":1866},{"position":34,"inQuantity":2312},{"position":35,"inQuantity":3254},{"position":36,"inQuantity":3820},{"position":37,"inQuantity":5078},{"position":38,"inQuantity":5403},{"position":39,"inQuantity":4598},{"position":40,"inQuantity":5212},{"position":41,"inQuantity":6534},{"position":42,"inQuantity":6162},{"position":43,"inQuantity":6457},{"position":44,"inQuantity":5513},{"position":45,"inQuantity":5165},{"position":46,"inQuantity":4995},{"position":47,"inQuantity":4940},{"position":48,"inQuantity":4444},{"position":49,"inQuantity":3646},{"position":50,"inQuantity":2570},{"position":51,"inQuantity":2026},{"position":52,"inQuantity":1361},{"position":53,"inQuantity":1112},{"position":54,"inQuantity":1030},{"position":55,"inQuantity":669},{"position":56,"inQuantity":1538},{"position":57,"inQuantity":1632},{"position":58,"inQuantity":1942},{"position":59,"inQuantity":1352},{"position":60,"inQuantity":1480},{"position":61,"inQuantity":1574},{"position":62,"inQuantity":847},{"position":63,"inQuantity":1216},{"position":64,"inQuantity":1276},{"position":65,"inQuantity":1394},{"position":66,"inQuantity":1602},{"position":67,"inQuantity":1200},{"position":68,"inQuantity":890},{"position":69,"inQuantity":669},{"position":70,"inQuantity":390},{"position":71,"inQuantity":141},{"position":72,"inQuantity":88},{"position":73,"inQuantity":143},{"position":74,"inQuantity":104},{"position":75,"inQuantity":181},{"position":76,"inQuantity":215},{"position":77,"inQuantity":117},{"position":78,"inQuantity":323},{"position":79,"inQuantity":175},{"position":80,"inQuantity":0},{"position":81,"inQuantity":0},{"position":82,"inQuantity":30},{"position":83,"inQuantity":113},{"position":84,"inQuantity":195},{"position":85,"inQuantity":808},{"position":86,"inQuantity":1233},{"position":87,"inQuantity":1619},{"position":88,"inQuantity":1778},{"position":89,"inQuantity":1329},{"position":90,"inQuantity":874},{"position":91,"inQuantity":467},{"position":92,"inQuantity":190},{"position":93,"inQuantity":43},{"position":94,"inQuantity":0},{"position":95,"inQuantity":0},{"position":96,"inQuantity":0},{"position":97,"inQuantity":0},{"position":98,"inQuantity":0},{"position":99,"inQuantity":0},{"position":100,"inQuantity":0},{"position":101,"inQuantity":0},{"position":102,"inQuantity":0},{"position":103,"inQuantity":0},{"position":104,"inQuantity":0},{"position":105,"inQuantity":0},{"position":106,"inQuantity":0},{"position":107,"inQuantity":107},{"position":108,"inQuantity":407},{"position":109,"inQuantity":138},{"position":110,"inQuantity":272},{"position":111,"inQuantity":649},{"position":112,"inQuantity":1213},{"position":113,"inQuantity":1786},{"position":114,"inQuantity":2005},{"position":115,"inQuantity":2377},{"position":116,"inQuantity":2688},{"position":117,"inQuantity":2762},{"position":118,"inQuantity":2186},{"position":119,"inQuantity":2383},{"position":120,"inQuantity":3615},{"position":121,"inQuantity":3605},{"position":122,"inQuantity":4415},{"position":123,"inQuantity":5240},{"position":124,"inQuantity":5993},{"position":125,"inQuantity":5680},{"position":126,"inQuantity":4872},{"position":127,"inQuantity":6165},{"position":128,"inQuantity":7701},{"position":129,"inQuantity":8108},{"position":130,"inQuantity":5745},{"position":131,"inQuantity":5015},{"position":132,"inQuantity":4700},{"position":133,"inQuantity":4284},{"position":134,"inQuantity":6463},{"position":135,"inQuantity":5541},{"position":136,"inQuantity":3965},{"position":137,"inQuantity":3696},{"position":138,"inQuantity":3554},{"position":139,"inQuantity":5219},{"position":140,"inQuantity":8939},{"position":141,"inQuantity":8638},{"position":142,"inQuantity":6747},{"position":143,"inQuantity":7728},{"position":144,"inQuantity":7297}],
        revisionNumber: "1",
        businessType: "A14 / Z14",
        docStatus: "A02",
        processType: "A05",
        classificationType: "A02",
        product: "Energie active/Réactive",
        startCreatedDateTime: "",
        endCreatedDateTime: "",
    };


    public static HTA_EnergyAccount_a4 : EnergyAccount = {
        energyAccountMarketDocumentMrid: "ea4cef73-ff6b-400b-8957-d34000eb30a4",
        meteringPointMrid: Values.HTA_site_valid.meteringPointMrid,
        // marketEvaluationPointMrid: "CodePPE",
        areaDomain: "17X100A100A0001A",
        senderMarketParticipantMrid: Values.HTA_systemoperator.systemOperatorMarketParticipantMrid,
        senderMarketParticipantRole: "A50",
        receiverMarketParticipantMrid: "Producteur1",
        receiverMarketParticipantRole: "A32",
        createdDateTime: "2021-10-23T10:29:10.000Z",
        measurementUnitName: "KW",
        timeInterval: "2021-10-23T10:29:10.000Z",
        resolution: "PT10M",
        timeSeries: [{"position":1,"inQuantity":3822},{"position":2,"inQuantity":10873},{"position":3,"inQuantity":10203},{"position":4,"inQuantity":0},{"position":5,"inQuantity":0},{"position":6,"inQuantity":0},{"position":7,"inQuantity":0},{"position":8,"inQuantity":0},{"position":9,"inQuantity":0},{"position":10,"inQuantity":0},{"position":11,"inQuantity":0},{"position":12,"inQuantity":0},{"position":13,"inQuantity":0},{"position":14,"inQuantity":0},{"position":15,"inQuantity":0},{"position":16,"inQuantity":0},{"position":17,"inQuantity":0},{"position":18,"inQuantity":0},{"position":19,"inQuantity":0},{"position":20,"inQuantity":0},{"position":21,"inQuantity":0},{"position":22,"inQuantity":0},{"position":23,"inQuantity":175},{"position":24,"inQuantity":1205},{"position":25,"inQuantity":1832},{"position":26,"inQuantity":814},{"position":27,"inQuantity":701},{"position":28,"inQuantity":508},{"position":29,"inQuantity":991},{"position":30,"inQuantity":684},{"position":31,"inQuantity":1273},{"position":32,"inQuantity":1797},{"position":33,"inQuantity":1866},{"position":34,"inQuantity":2312},{"position":35,"inQuantity":3254},{"position":36,"inQuantity":3820},{"position":37,"inQuantity":5078},{"position":38,"inQuantity":5403},{"position":39,"inQuantity":4598},{"position":40,"inQuantity":5212},{"position":41,"inQuantity":6534},{"position":42,"inQuantity":6162},{"position":43,"inQuantity":6457},{"position":44,"inQuantity":5513},{"position":45,"inQuantity":5165},{"position":46,"inQuantity":4995},{"position":47,"inQuantity":4940},{"position":48,"inQuantity":4444},{"position":49,"inQuantity":3646},{"position":50,"inQuantity":2570},{"position":51,"inQuantity":2026},{"position":52,"inQuantity":1361},{"position":53,"inQuantity":1112},{"position":54,"inQuantity":1030},{"position":55,"inQuantity":669},{"position":56,"inQuantity":1538},{"position":57,"inQuantity":1632},{"position":58,"inQuantity":1942},{"position":59,"inQuantity":1352},{"position":60,"inQuantity":1480},{"position":61,"inQuantity":1574},{"position":62,"inQuantity":847},{"position":63,"inQuantity":1216},{"position":64,"inQuantity":1276},{"position":65,"inQuantity":1394},{"position":66,"inQuantity":1602},{"position":67,"inQuantity":1200},{"position":68,"inQuantity":890},{"position":69,"inQuantity":669},{"position":70,"inQuantity":390},{"position":71,"inQuantity":141},{"position":72,"inQuantity":88},{"position":73,"inQuantity":143},{"position":74,"inQuantity":104},{"position":75,"inQuantity":181},{"position":76,"inQuantity":215},{"position":77,"inQuantity":117},{"position":78,"inQuantity":323},{"position":79,"inQuantity":175},{"position":80,"inQuantity":0},{"position":81,"inQuantity":0},{"position":82,"inQuantity":30},{"position":83,"inQuantity":113},{"position":84,"inQuantity":195},{"position":85,"inQuantity":808},{"position":86,"inQuantity":1233},{"position":87,"inQuantity":1619},{"position":88,"inQuantity":1778},{"position":89,"inQuantity":1329},{"position":90,"inQuantity":874},{"position":91,"inQuantity":467},{"position":92,"inQuantity":190},{"position":93,"inQuantity":43},{"position":94,"inQuantity":0},{"position":95,"inQuantity":0},{"position":96,"inQuantity":0},{"position":97,"inQuantity":0},{"position":98,"inQuantity":0},{"position":99,"inQuantity":0},{"position":100,"inQuantity":0},{"position":101,"inQuantity":0},{"position":102,"inQuantity":0},{"position":103,"inQuantity":0},{"position":104,"inQuantity":0},{"position":105,"inQuantity":0},{"position":106,"inQuantity":0},{"position":107,"inQuantity":107},{"position":108,"inQuantity":407},{"position":109,"inQuantity":138},{"position":110,"inQuantity":272},{"position":111,"inQuantity":649},{"position":112,"inQuantity":1213},{"position":113,"inQuantity":1786},{"position":114,"inQuantity":2005},{"position":115,"inQuantity":2377},{"position":116,"inQuantity":2688},{"position":117,"inQuantity":2762},{"position":118,"inQuantity":2186},{"position":119,"inQuantity":2383},{"position":120,"inQuantity":3615},{"position":121,"inQuantity":3605},{"position":122,"inQuantity":4415},{"position":123,"inQuantity":5240},{"position":124,"inQuantity":5993},{"position":125,"inQuantity":5680},{"position":126,"inQuantity":4872},{"position":127,"inQuantity":6165},{"position":128,"inQuantity":7701},{"position":129,"inQuantity":8108},{"position":130,"inQuantity":5745},{"position":131,"inQuantity":5015},{"position":132,"inQuantity":4700},{"position":133,"inQuantity":4284},{"position":134,"inQuantity":6463},{"position":135,"inQuantity":5541},{"position":136,"inQuantity":3965},{"position":137,"inQuantity":3696},{"position":138,"inQuantity":3554},{"position":139,"inQuantity":5219},{"position":140,"inQuantity":8939},{"position":141,"inQuantity":8638},{"position":142,"inQuantity":6747},{"position":143,"inQuantity":7728},{"position":144,"inQuantity":7297}],
        revisionNumber: "1",
        businessType: "A14 / Z14",
        docStatus: "A02",
        processType: "A05",
        classificationType: "A02",
        product: "Energie active/Réactive",
        startCreatedDateTime: "",
        endCreatedDateTime: "",
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
        timeSeries: [{"position":1,"inQuantity":3822},{"position":2,"inQuantity":10873},{"position":3,"inQuantity":10203},{"position":4,"inQuantity":0},{"position":5,"inQuantity":0},{"position":6,"inQuantity":0},{"position":7,"inQuantity":0},{"position":8,"inQuantity":0},{"position":9,"inQuantity":0},{"position":10,"inQuantity":0},{"position":11,"inQuantity":0},{"position":12,"inQuantity":0},{"position":13,"inQuantity":0},{"position":14,"inQuantity":0},{"position":15,"inQuantity":0},{"position":16,"inQuantity":0},{"position":17,"inQuantity":0},{"position":18,"inQuantity":0},{"position":19,"inQuantity":0},{"position":20,"inQuantity":0},{"position":21,"inQuantity":0},{"position":22,"inQuantity":0},{"position":23,"inQuantity":175},{"position":24,"inQuantity":1205},{"position":25,"inQuantity":1832},{"position":26,"inQuantity":814},{"position":27,"inQuantity":701},{"position":28,"inQuantity":508},{"position":29,"inQuantity":991},{"position":30,"inQuantity":684},{"position":31,"inQuantity":1273},{"position":32,"inQuantity":1797},{"position":33,"inQuantity":1866},{"position":34,"inQuantity":2312},{"position":35,"inQuantity":3254},{"position":36,"inQuantity":3820},{"position":37,"inQuantity":5078},{"position":38,"inQuantity":5403},{"position":39,"inQuantity":4598},{"position":40,"inQuantity":5212},{"position":41,"inQuantity":6534},{"position":42,"inQuantity":6162},{"position":43,"inQuantity":6457},{"position":44,"inQuantity":5513},{"position":45,"inQuantity":5165},{"position":46,"inQuantity":4995},{"position":47,"inQuantity":4940},{"position":48,"inQuantity":4444},{"position":49,"inQuantity":3646},{"position":50,"inQuantity":2570},{"position":51,"inQuantity":2026},{"position":52,"inQuantity":1361},{"position":53,"inQuantity":1112},{"position":54,"inQuantity":1030},{"position":55,"inQuantity":669},{"position":56,"inQuantity":1538},{"position":57,"inQuantity":1632},{"position":58,"inQuantity":1942},{"position":59,"inQuantity":1352},{"position":60,"inQuantity":1480},{"position":61,"inQuantity":1574},{"position":62,"inQuantity":847},{"position":63,"inQuantity":1216},{"position":64,"inQuantity":1276},{"position":65,"inQuantity":1394},{"position":66,"inQuantity":1602},{"position":67,"inQuantity":1200},{"position":68,"inQuantity":890},{"position":69,"inQuantity":669},{"position":70,"inQuantity":390},{"position":71,"inQuantity":141},{"position":72,"inQuantity":88},{"position":73,"inQuantity":143},{"position":74,"inQuantity":104},{"position":75,"inQuantity":181},{"position":76,"inQuantity":215},{"position":77,"inQuantity":117},{"position":78,"inQuantity":323},{"position":79,"inQuantity":175},{"position":80,"inQuantity":0},{"position":81,"inQuantity":0},{"position":82,"inQuantity":30},{"position":83,"inQuantity":113},{"position":84,"inQuantity":195},{"position":85,"inQuantity":808},{"position":86,"inQuantity":1233},{"position":87,"inQuantity":1619},{"position":88,"inQuantity":1778},{"position":89,"inQuantity":1329},{"position":90,"inQuantity":874},{"position":91,"inQuantity":467},{"position":92,"inQuantity":190},{"position":93,"inQuantity":43},{"position":94,"inQuantity":0},{"position":95,"inQuantity":0},{"position":96,"inQuantity":0},{"position":97,"inQuantity":0},{"position":98,"inQuantity":0},{"position":99,"inQuantity":0},{"position":100,"inQuantity":0},{"position":101,"inQuantity":0},{"position":102,"inQuantity":0},{"position":103,"inQuantity":0},{"position":104,"inQuantity":0},{"position":105,"inQuantity":0},{"position":106,"inQuantity":0},{"position":107,"inQuantity":107},{"position":108,"inQuantity":407},{"position":109,"inQuantity":138},{"position":110,"inQuantity":272},{"position":111,"inQuantity":649},{"position":112,"inQuantity":1213},{"position":113,"inQuantity":1786},{"position":114,"inQuantity":2005},{"position":115,"inQuantity":2377},{"position":116,"inQuantity":2688},{"position":117,"inQuantity":2762},{"position":118,"inQuantity":2186},{"position":119,"inQuantity":2383},{"position":120,"inQuantity":3615},{"position":121,"inQuantity":3605},{"position":122,"inQuantity":4415},{"position":123,"inQuantity":5240},{"position":124,"inQuantity":5993},{"position":125,"inQuantity":5680},{"position":126,"inQuantity":4872},{"position":127,"inQuantity":6165},{"position":128,"inQuantity":7701},{"position":129,"inQuantity":8108},{"position":130,"inQuantity":5745},{"position":131,"inQuantity":5015},{"position":132,"inQuantity":4700},{"position":133,"inQuantity":4284},{"position":134,"inQuantity":6463},{"position":135,"inQuantity":5541},{"position":136,"inQuantity":3965},{"position":137,"inQuantity":3696},{"position":138,"inQuantity":3554},{"position":139,"inQuantity":5219},{"position":140,"inQuantity":8939},{"position":141,"inQuantity":8638},{"position":142,"inQuantity":6747},{"position":143,"inQuantity":7728},{"position":144,"inQuantity":7297}],
        revisionNumber: "1",
        businessType: "A14 / Z14",
        docStatus: "A02",
        processType: "A05",
        classificationType: "A02",
        product: "Energie active/Réactive",
        startCreatedDateTime: "",
        endCreatedDateTime: "",
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
        endCreatedDateTime: "",
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
        endCreatedDateTime: "",
    }

    /*********************************************/
    /*              ATTACHMENT_FILE              */
    /*********************************************/
    public static AttachmentFile_1: AttachmentFile = {
        docType: DocType.ATTACHMENT_FILE,
        fileId: "AttachmentFile_1",
        fileContent: "AttachmentFile_1_Content"
    }

    /*********************************************/
    /*        RESERVE_BID_MARKET_DOCUMENT        */
    /*********************************************/
    public static HTA_ReserveBidMarketDocument_1_Min: ReserveBidMarketDocument = {
        reserveBidMrid: "HTA_ReserveBidMarketDocument_1",
        meteringPointMrid: Values.HTA_site_valid.meteringPointMrid,
        createdDateTime: JSON.parse(JSON.stringify(Values.getStartDate())),
        flowDirection: "Direction_HTA_ReserveBidMarketDocument_1",
        energyPriceAmount: 42.0
    }

    public static HTA_ReserveBidMarketDocument_1_Full: ReserveBidMarketDocument = {
        docType: DocType.RESERVE_BID_MARKET_DOCUMENT,
        reserveBidMrid: "HTA_ReserveBidMarketDocument_1",
        meteringPointMrid: Values.HTA_site_valid.meteringPointMrid,
        revisionNumber: "0",
        messageType: 'A44',
        processType: 'A27',
        senderMarketParticipantMrid: Values.HTA_site_valid.systemOperatorMarketParticipantMrid,
        receiverMarketParticipantMrid: Values.HTA_site_valid.producerMarketParticipantMrid,
        createdDateTime: JSON.parse(JSON.stringify(Values.getStartDate())),
        validityPeriodStartDateTime: JSON.parse(JSON.stringify(Values.getStartDate())),
        validityPeriodEndDateTime: "",
        businessType: 'A87',
        quantityMeasureUnitName: 'MWh',
        priceMeasureUnitName: '€/MWh',
        currencyUnitName: '€',
        flowDirection: "Direction_HTA_ReserveBidMarketDocument_1",
        energyPriceAmount: 42.0,

        attachments: [],
        attachmentsWithStatus: [],
    }

    public static HTA_ReserveBidMarketDocument_2_Full: ReserveBidMarketDocument = {
        docType: DocType.RESERVE_BID_MARKET_DOCUMENT,
        reserveBidMrid: "HTA_ReserveBidMarketDocument_2",
        meteringPointMrid: Values.HTA_site_valid.meteringPointMrid,
        revisionNumber: "0",
        messageType: 'A44',
        processType: 'A27',
        senderMarketParticipantMrid: Values.HTA_site_valid.systemOperatorMarketParticipantMrid,
        receiverMarketParticipantMrid: Values.HTA_site_valid.producerMarketParticipantMrid,
        createdDateTime: JSON.parse(JSON.stringify(Values.getStartDate())),
        validityPeriodStartDateTime: CommonService.increaseDateDaysStr(JSON.parse(JSON.stringify(Values.getStartDate())), 10),
        validityPeriodEndDateTime: "",
        businessType: 'A87',
        quantityMeasureUnitName: 'MWh',
        priceMeasureUnitName: '€/MWh',
        currencyUnitName: '€',
        flowDirection: "Direction_HTA_ReserveBidMarketDocument_2",
        energyPriceAmount: 42.0,

        attachments: [],
        attachmentsWithStatus: [],
    }


    public static HTB_ReserveBidMarketDocument_1_Full: ReserveBidMarketDocument = {
        docType: DocType.RESERVE_BID_MARKET_DOCUMENT,
        reserveBidMrid: "HTB_ReserveBidMarketDocument_1_Full",
        meteringPointMrid: Values.HTB_site_valid.meteringPointMrid,
        revisionNumber: "0",
        messageType: 'A44',
        processType: 'A27',
        senderMarketParticipantMrid: Values.HTB_site_valid.systemOperatorMarketParticipantMrid,
        receiverMarketParticipantMrid: Values.HTB_site_valid.producerMarketParticipantMrid,
        createdDateTime: JSON.parse(JSON.stringify(Values.getStartDate())),
        validityPeriodStartDateTime: JSON.parse(JSON.stringify(Values.getStartDate())),
        validityPeriodEndDateTime: "",
        businessType: 'A87',
        quantityMeasureUnitName: 'MWh',
        priceMeasureUnitName: '€/MWh',
        currencyUnitName: '€',
        flowDirection: "Direction_HTB_ReserveBidMarketDocument_1",
        energyPriceAmount: 42.0,

        attachments: [],
        attachmentsWithStatus: [],
    }


    public static HTB_ReserveBidMarketDocument_2_Full: ReserveBidMarketDocument = {
        docType: DocType.RESERVE_BID_MARKET_DOCUMENT,
        reserveBidMrid: "HTB_ReserveBidMarketDocument_2_Full",
        meteringPointMrid: Values.HTB_site_valid.meteringPointMrid,
        revisionNumber: "0",
        messageType: 'A44',
        processType: 'A27',
        senderMarketParticipantMrid: Values.HTB_site_valid.systemOperatorMarketParticipantMrid,
        receiverMarketParticipantMrid: Values.HTB_site_valid.producerMarketParticipantMrid,
        createdDateTime: JSON.parse(JSON.stringify(Values.getStartDate())),
        validityPeriodStartDateTime: CommonService.increaseDateDaysStr(JSON.parse(JSON.stringify(Values.getStartDate())), 10),
        validityPeriodEndDateTime: "",
        businessType: 'A87',
        quantityMeasureUnitName: 'MWh',
        priceMeasureUnitName: '€/MWh',
        currencyUnitName: '€',
        flowDirection: "Direction_HTB_ReserveBidMarketDocument_2",
        energyPriceAmount: 42.0,

        attachments: [],
        attachmentsWithStatus: [],
    }


    /*********************************************/
    /*            BALANCING_DOCUMENT             */
    /*********************************************/
    public static BalancingDocument_1: BalancingDocument = {
        docType: DocType.BALANCING_DOCUMENT,
        balancingDocumentMrid:"BalancingDocument_1",
        activationDocumentMrid:"activationDocumentMrid",
        energyAmountMarketDocumentMrid:"energyAmountMarketDocumentMrid",
        reserveBidMrid:"reserveBidMrid",
        revisionNumber:"1",
        messageType:"B44",
        processsType:"Z42",
        senderMarketParticipantMrid:"senderMarketParticipantMrid",
        receiverMarketParticipantMrid:"receiverMarketParticipantMrid",
        createdDateTime:"2112-12-21",
        period:"",
        businessType:"B77",
        quantityMeasureUnitName:"MWh",
        priceMeasureUnitName:"€/MWh",
        currencyUnitName:"€",
        meteringPointMrid:"meteringPointMrid",
        direction:"A02",
        quantity: 42,
        activationPriceAmount: 42,
        financialPriceAmount: 1764
    }

}
