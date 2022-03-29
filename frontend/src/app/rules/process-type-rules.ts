import { ProcessType } from 'src/app/models/enum/ProcessType.enum';

export const processTypeToStr = (
  processType: ProcessType | undefined
): string => {
  switch (processType) {
    case ProcessType.A05:
      return 'Comptage';
  }
  return 'ProcessType inconnu';
};
