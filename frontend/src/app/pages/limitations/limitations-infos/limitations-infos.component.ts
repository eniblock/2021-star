import {Component, Inject, OnInit} from '@angular/core';
import {MAT_BOTTOM_SHEET_DATA} from "@angular/material/bottom-sheet";
import {MeasurementUnitName} from "../../../models/enum/MeasurementUnitName.enum";
import {RechercheHistoriqueLimitationEntite} from "../../../models/RechercheHistoriqueLimitation";

@Component({
  selector: 'app-limitations-infos',
  templateUrl: './limitations-infos.component.html',
  styleUrls: ['./limitations-infos.component.css']
})
export class LimitationsInfosComponent implements OnInit {

  constructor(
    @Inject(MAT_BOTTOM_SHEET_DATA)
    public bottomSheetParams: RechercheHistoriqueLimitationEntite,
  ) {
  }

  ngOnInit(): void {
    console.log(this.bottomSheetParams)
  }

}
