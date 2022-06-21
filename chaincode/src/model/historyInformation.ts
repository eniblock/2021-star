import { ActivationDocument } from "./activationDocument";
import { EnergyAmount } from "./energyAmount";
import { Producer } from "./producer";
import { Site } from "./site";

export class HistoryInformation {
    public activationDocument: ActivationDocument;
    public site: Site;
    public producer: Producer;
    public energyAmount: EnergyAmount;
}
