import { ActivationDocument } from '../activationDocument/activationDocument';
import { BalancingDocument } from '../balancingDocument';
import { EnergyAmount } from '../energyAmount';
import { Producer } from '../producer';
import { ReserveBidMarketDocument } from '../reserveBidMarketDocument';
import { Site } from '../site';

export class HistoryInformation {
    public activationDocument: ActivationDocument;
    public subOrderList: ActivationDocument[];
    public site: Site;
    public producer: Producer;
    public energyAmount: EnergyAmount;

    public reserveBidMarketDocument?: ReserveBidMarketDocument;
    public balancingDocument?: BalancingDocument;

    // additionnal properties
    public displayedSourceName: string;
}
