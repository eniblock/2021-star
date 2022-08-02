import { ProcessType } from 'src/app/models/enum/ProcessType.enum';

export const processTypeToStr = (
  processType: ProcessType | undefined
): string => {
  switch (processType) {
    case ProcessType.A05:
      return 'Comptage';
    case ProcessType.A14:
      return 'Référence';
    case ProcessType.Z99:
      return 'Référence';
  }
  return 'ProcessType inconnu';
};
