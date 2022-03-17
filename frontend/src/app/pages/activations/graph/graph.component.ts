import { Component, Inject, OnInit } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { EnergyAccount } from 'src/app/models/EnergyAccount';
import { EnergyAccountService } from 'src/app/services/api/energy-account.service';

@Component({
  selector: 'app-graph',
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.css'],
})
export class GraphComponent implements OnInit {
  data: EnergyAccount[] = [];

  constructor(
    private energyAccountService: EnergyAccountService,
    @Inject(MAT_BOTTOM_SHEET_DATA)
    public bottomSheetParams: {
      meteringPointMrid: string;
      startCreatedDateTime: string;
      endCreatedDateTime: string;
    }
  ) {}

  ngOnInit() {
    this.energyAccountService
      .find(
        this.bottomSheetParams.meteringPointMrid,
        this.bottomSheetParams.startCreatedDateTime,
        this.bottomSheetParams.endCreatedDateTime
      )
      .subscribe((data) => {
        this.data = data;
        this.makeGraph();
      });
  }

  makeGraph() {}
}
