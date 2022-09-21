import {Component, Inject, OnInit} from '@angular/core';
import {MAT_BOTTOM_SHEET_DATA} from "@angular/material/bottom-sheet";

@Component({
  selector: 'app-sites-production-ajout-tarif-unitaire',
  templateUrl: './sites-production-ajout-tarif-unitaire.component.html',
  styleUrls: ['./sites-production-ajout-tarif-unitaire.component.css']
})
export class SitesProductionAjoutTarifUnitaireComponent implements OnInit {

  constructor(
    @Inject(MAT_BOTTOM_SHEET_DATA)
    public bottomSheetParams: {
      meteringPointMrid: string;
    }
  ) {
  }

  ngOnInit(): void {
  }

}
