import { Context } from 'fabric-contract-api';
import { ViewMarketParticipant } from '../model/viewMarketParticipant';
import { ProducerController } from './ProducerController';
import { SystemOperatorController } from './SystemOperatorController';

export class ViewMarketParticipantController {

    public static async viewSystemOperaterMarketParticipant(ctx: Context): Promise<string> {
        const systemOperators = await SystemOperatorController.getAllSystemOperator(ctx);
        const producers = await ProducerController.getAllProducer(ctx);

        const restitutionView: ViewMarketParticipant = {
            producers : JSON.parse(producers),
            systemOperators : JSON.parse(systemOperators),
        };
        return JSON.stringify(restitutionView);
    }

    public static async viewProducerMarketParticipant(ctx: Context, prodId: string): Promise<string> {
        const systemOperators = await SystemOperatorController.getAllSystemOperator(ctx);
        const producers = await ProducerController.queryProducer(ctx, prodId);

        const restitutionView: ViewMarketParticipant = {
            producers : JSON.parse(producers),
            systemOperators : JSON.parse(systemOperators),
        };
        return JSON.stringify(restitutionView);
    }

}
