import { MeasurementUnitName } from './enum/MeasurementUnitName.enum';
import { ProcessType } from './enum/ProcessType.enum';

export interface FormulaireEnergyAccount {
  files: File[];
}

export interface EnergyAccountPoint {
  inQuantity: number;
  position: number;
}

export interface EnergyAccount {
  processType: ProcessType;
  timeInterval: string; // Format : YYYY-MM-DDThh:mmZ/YYYY-MM-DDThh:mmZ
  resolution: string; // Format : PnYnMnDTnHnMnS
  measurementUnitName: MeasurementUnitName;
  timeSeries: EnergyAccountPoint[];
}
