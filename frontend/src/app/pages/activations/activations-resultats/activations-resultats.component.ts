import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
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
      this.updateContent();
    });
  }

  private updateContent() {
    this.dataComputed = this.data.map((rae) => {
      const limitationType = this.getLimitationType(
        rae.motifRte,
        rae.motifEnedis
      );
      const motif = this.getMotif(rae.motifRte, rae.motifEnedis, rae.typeSite);
      return {
        ...rae,
        showRteDates: true,
        showEnedisDates: true,
        motif: motif,
        limitationType: limitationType,
      };
    });
  }

  private getMotif(
    motifRte: Motif | undefined,
    motifEnedis: Motif | undefined,
    typeSite: TypeSite
  ): string {
    if (this.instance == Instance.TSO) {
      return motifRteToString(motifRte);
    } else if (this.instance == Instance.DSO) {
      return motifEnedisToString(motifEnedis);
    } else if (this.instance == Instance.PRODUCER && typeSite == TypeSite.HTB) {
      return motifRteToString(motifRte);
    } else if (this.instance == Instance.PRODUCER && typeSite == TypeSite.HTA) {
      return motifEnedisToString(motifEnedis);
    }
    return '---';
  }

  private getLimitationType(
    motifRte: Motif | undefined,
    motifEnedis: Motif | undefined
  ): TypeLimitation {
    if (
      motifEnedis == null ||
      motifEnedis.messageType == null ||
      motifEnedis.businessType == null ||
      motifEnedis.reasonCode == null
    ) {
      return TypeLimitation.AUTOMATIQUE;
    } else if (
      motifRte != null &&
      motifRte.messageType != null &&
      motifRte.businessType != null &&
      motifRte.reasonCode != null
    ) {
      return TypeLimitation.AUTOMATIQUE;
    } else if (
      motifIsEqualTo(motifEnedis, 'D01', 'Z02', 'A70') ||
      motifIsEqualTo(motifEnedis, 'D01', 'Z03', 'Y98') ||
      motifIsEqualTo(motifEnedis, 'D01', 'Z04', 'Y99')
    ) {
      return TypeLimitation.MANUELLE;
    }
    return TypeLimitation.AUTOMATIQUE;
  }
}
