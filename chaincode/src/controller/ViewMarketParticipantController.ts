import { STARParameters } from '../model/starParameters';
import { ViewMarketParticipant } from '../model/viewMarketParticipant';

import { ProducerController } from './ProducerController';
import { SystemOperatorController } from './SystemOperatorController';

export class ViewMarketParticipantController {

    public static async viewSystemOperaterMarketParticipant(params: STARParameters): Promise<string> {
        const systemOperators = await SystemOperatorController.getAllSystemOperator(params);
        const producers = await ProducerController.getAllProducer(params);

        const restitutionView: ViewMarketParticipant = {
            producers : JSON.parse(producers),
            systemOperators : JSON.parse(systemOperators),
        };
        return JSON.stringify(restitutionView);
    }

    public static async viewProducerMarketParticipant(params: STARParameters, prodId: string): Promise<string> {
        const systemOperators = await SystemOperatorController.getAllSystemOperator(params);
        const producers = await ProducerController.getProducerById(params, prodId);

        const restitutionView: ViewMarketParticipant = {
            producers : JSON.parse(producers),
            systemOperators : JSON.parse(systemOperators),
        };
        return JSON.stringify(restitutionView);
    }

}
