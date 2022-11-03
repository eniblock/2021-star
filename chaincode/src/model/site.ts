/*
 * SPDX-License-Identifier: Apache-2.0
 */
import * as Yup from 'yup';
import { DocType } from '../enums/DocType';

export class Site {

    public static readonly schema = Yup.object().shape({
        docType: Yup.string().notRequired(),
        instance: Yup.string().notRequired(),
        meteringPointMrid: Yup.string().required('meteringPointMrid is a compulsory field (string)'),
        producerMarketParticipantMrid: Yup.string().required('producerMarketParticipantMrid is a compulsory field (string)'),
        siteName: Yup.string().required('siteName is a compulsory field (string)'),
        siteType: Yup.string().required('siteType is a compulsory field (string)'),
        substationMrid: Yup.string().required('substationMrid is a compulsory field (string)'),
        substationName: Yup.string().required('substationName is a compulsory field (string)'),
        systemOperatorMarketParticipantMrid: Yup.string().required('systemOperatorMarketParticipantMrid is a compulsory field (string)'),
        technologyType: Yup.string().required('technologyType is a compulsory field (string)'),

        marketEvaluationPointMrid: Yup.string().notRequired(),
        producerMarketParticipantName: Yup.string().notRequired(),
        schedulingEntityRegisteredResourceMrid: Yup.string().notRequired(),
        siteAdminMrid: Yup.string().notRequired(),
        siteIecCode: Yup.string().notRequired(),
        siteLocation: Yup.string().notRequired(),
        systemOperatorCustomerServiceName: Yup.string().notRequired(),
        systemOperatorEntityFlexibilityDomainMrid: Yup.string().notRequired(),
        systemOperatorEntityFlexibilityDomainName: Yup.string().notRequired(),
        systemOperatorMarketParticipantName: Yup.string().notRequired(),
    });

    public static formatString(inputString: string): Site {
        let siteObj: Site;
        try {
            siteObj = JSON.parse(inputString);
        } catch (error) {
            throw new Error(`ERROR ${DocType.SITE} -> Input string NON-JSON value`);
        }

        try {
            Site.schema.validateSync(
                siteObj,
                {strict: true, abortEarly: false},
            );
        } catch (error) {
            throw error;
        }
        return siteObj;
    }

    public static formatListString(inputString: string): Site[] {
        let siteList: Site[] = [];
        try {
            siteList = JSON.parse(inputString);
        } catch (error) {
            throw new Error(`ERROR ${DocType.SITE} by list -> Input string NON-JSON value`);
        }

        if (siteList && siteList.length > 0) {
            for (const siteObj of siteList) {
                try {
                    Site.schema.validateSync(
                        siteObj,
                        {strict: true, abortEarly: false},
                    );
                } catch (error) {
                    throw error;
                }
            }
        }
        return siteList;
    }

    public docType?: string;
    public meteringPointMrid: string; // PK
    public systemOperatorMarketParticipantMrid: string; // FK1
    public producerMarketParticipantMrid: string; // FK2
    public technologyType: string;
    public siteType: string;
    public siteName: string;
    public substationMrid: string;
    public substationName: string;

    public marketEvaluationPointMrid?: string;
    public schedulingEntityRegisteredResourceMrid?: string;
    public siteAdminMrid?: string;
    public siteLocation?: string;
    public siteIecCode?: string;
    public systemOperatorEntityFlexibilityDomainMrid?: string;
    public systemOperatorEntityFlexibilityDomainName?: string;
    public systemOperatorCustomerServiceName?: string;
    public producerMarketParticipantName?: string;
}
