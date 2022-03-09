import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { RechercheActivationsEntite } from 'src/app/models/RechercheActivations';
import { Sort } from '@angular/material/sort';
import { TypeLimitation } from 'src/app/models/enum/TypeLimitation.enum';
import {
  Motif,
  motifEnedisToString,
  motifIsEqualTo,
  motifRteToString,
} from 'src/app/models/Motifs';
import { TypeSite } from 'src/app/models/enum/TypeSite.enum';
import { InstanceService } from 'src/app/services/api/instance.service';
import { Instance } from 'src/app/models/enum/Instance.enum';

@Component({
  selector: 'app-activations-resultats',
  templateUrl: './activations-resultats.component.html',
  styleUrls: ['./activations-resultats.component.css'],
})
export class ActivationsResultatsComponent implements OnChanges {
  @Input() data: RechercheActivationsEntite[] = [];
  @Input() columnsToDisplay: string[] = [];
  @Output() sortChange = new EventEmitter<Sort>();

  dataComputed: any = [];

  instance?: Instance;

  constructor(private instanceService: InstanceService) {}

  ngOnChanges(changes: SimpleChanges): void {
    this.instanceService.getTypeInstance().subscribe((instance) => {
      this.instance = instance;
      this.computeData();
    });
  }

  private computeData() {
    this.dataComputed = this.data.map((rae) => {
      const limitationType = this.getLimitationType(
        rae.motifRte,
        rae.motifEnedis
      );
      const motif = this.getMotif(rae.motifRte, rae.motifEnedis, rae.typeSite);
      const showDate = this.whichDateMustBeShown(rae.typeSite, rae.motifEnedis);
      return {
        ...rae,
        showDate: showDate,
        motif: motif,
        limitationType: limitationType,
      };
    });
  }

  private whichDateMustBeShown(
    typeSite: TypeSite,
    motifEnedis: Motif | undefined
  ): { showRteDate: boolean; showEnedisDate: boolean } {
    if (typeSite == TypeSite.HTB) {
      return {
        showRteDate: true,
        showEnedisDate: false,
      };
    } else if (
      motifEnedis != null &&
      motifIsEqualTo(motifEnedis, 'D01', 'Z01', 'A70')
    ) {
      return {
        showRteDate: true,
        showEnedisDate: true,
      };
    } else {
      return {
        showRteDate: false,
        showEnedisDate: true,
      };
    }
  }

  private getMotif(
    motifRte: Motif | undefined,
    motifEnedis: Motif | undefined,
    typeSite: TypeSite
  ): string {
    if (
      this.instance == Instance.TSO ||
      (this.instance == Instance.PRODUCER && typeSite == TypeSite.HTB) // A producer can see only his own site.
    ) {
      return motifRteToString(motifRte);
    } else {
      return motifEnedisToString(motifEnedis);
    }
  }

  private getLimitationType(
    motifRte: Motif | undefined,
    motifEnedis: Motif | undefined
  ): TypeLimitation {
    if (
      motifEnedis != null &&
      (motifIsEqualTo(motifEnedis, 'D01', 'Z02', 'A70') ||
        motifIsEqualTo(motifEnedis, 'D01', 'Z03', 'Y98') ||
        motifIsEqualTo(motifEnedis, 'D01', 'Z04', 'Y99'))
    ) {
      return TypeLimitation.MANUELLE;
    }
    return TypeLimitation.AUTOMATIQUE;
  }
}