import { Component, Inject, OnInit } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { GraphData } from 'src/app/components/graph/square-graph/square-graph.component';
import { EnergyAccount } from 'src/app/models/EnergyAccount';
import { EnergyAccountService } from 'src/app/services/api/energy-account.service';

@Component({
  selector: 'app-activation-graph',
  templateUrl: './activation-graph.component.html',
  styleUrls: ['./activation-graph.component.css'],
})
export class ActivationGraphComponent implements OnInit {
  data: EnergyAccount[] = [];
  graphData?: GraphData = {
    yTitle: 'Puissance (MW)',
    serieNames: ['Référence', 'Consigne', 'Comptage'],
    data: [
      [
        { x: 1, y: 8 },
        { x: 3, y: 2 },
        { x: 4, y: 3 },
        { x: 5, y: 7 },
        { x: 6, y: 2 },
      ],
      [
        { x: 1, y: 1 },
        { x: 2, y: 2 },
        { x: 3, y: 2 },
        { x: 10, y: 3 },
        { x: 14, y: 2 },
        { x: 15, y: 4 },
      ],
    ],
    exportFileName: 'monFichier',
  };

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
