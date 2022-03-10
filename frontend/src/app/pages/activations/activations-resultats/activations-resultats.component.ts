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
import { Motif, motifIsEqualTo } from 'src/app/models/Motifs';

@Component({
  selector: 'app-activations-resultats',
  templateUrl: './activations-resultats.component.html',
  styleUrls: ['./activations-resultats.component.css'],
})
export class ActivationsResultatsComponent implements OnInit, OnChanges {
  @Input() data: RechercheActivationsEntite[] = [];
  @Input() columnsToDisplay: string[] = [];
  @Output() sortChange = new EventEmitter<Sort>();

  dataComputed: any = [];

  constructor() {}

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges): void {
    this.dataComputed = this.data.map((rae) => {
      const limitationType = this.getLimitationType(
        rae.motifRte,
        rae.motifEnedis
      );
      return {
        ...rae,
        showRteDates: true,
        showEnedisDates: true,
        motif: '??? Le motif',
        limitationType: limitationType,
      };
    });
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
      motifIsEqualTo(motifEnedis, {
        messageType: 'D01',
        businessType: 'Z02',
        reasonCode: 'A70',
      }) ||
      motifIsEqualTo(motifEnedis, {
        messageType: 'D01',
        businessType: 'Z03',
        reasonCode: 'Y98',
      }) ||
      motifIsEqualTo(motifEnedis, {
        messageType: 'D01',
        businessType: 'Z04',
        reasonCode: 'Y99',
      })
    ) {
      return TypeLimitation.MANUELLE;
    }
    return TypeLimitation.AUTOMATIQUE;
  }
}
