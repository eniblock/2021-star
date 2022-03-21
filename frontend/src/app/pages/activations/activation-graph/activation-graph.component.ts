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
    serieNames: ['Référence', 'Consigne'],
    data: [
      [
        { x: new Date('2015/04/28 11:24:00').getTime() / 1000, y: 8 },
        { x: new Date('2015/04/29 11:28:00').getTime() / 1000, y: 4 },
        { x: new Date('2015/04/29 12:24:00').getTime() / 1000, y: 3 },
      ],
      [
        { x: new Date('2015/04/29 11:23:00').getTime() / 1000, y: 1 },
        { x: new Date('2015/04/29 11:29:00').getTime() / 1000, y: 2 },
        { x: new Date('2015/04/29 12:10:00').getTime() / 1000, y: 1 },
        { x: new Date('2015/04/29 12:15:00').getTime() / 1000, y: 7 },
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
