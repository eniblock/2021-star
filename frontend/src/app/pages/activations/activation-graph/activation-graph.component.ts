import { Component, Inject, OnInit } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { GraphData } from 'src/app/components/graph/square-graph/square-graph.component';
import { EnergyAccount } from 'src/app/models/EnergyAccount';
import { MeasurementUnitName } from 'src/app/models/enum/MeasurementUnitName.enum';
import { EnergyAccountService } from 'src/app/services/api/energy-account.service';

@Component({
  selector: 'app-activation-graph',
  templateUrl: './activation-graph.component.html',
  styleUrls: ['./activation-graph.component.css'],
})
export class ActivationGraphComponent implements OnInit {
  data: EnergyAccount[] = [];
  graphData?: GraphData;

  invalidData = false;

  constructor(
    private energyAccountService: EnergyAccountService,
    @Inject(MAT_BOTTOM_SHEET_DATA)
    public bottomSheetParams: {
      meteringPointMrid: string;
      startCreatedDateTime?: string;
      endCreatedDateTime?: string;
      orderValueConsign?: number;
      measurementUnitNameConsign?: MeasurementUnitName;
    }
  ) {}

  ngOnInit() {
    const startCreatedDateTime = this.bottomSheetParams.startCreatedDateTime;
    const endCreatedDateTime = this.bottomSheetParams.endCreatedDateTime;
    if (startCreatedDateTime == null || endCreatedDateTime == null) {
      this.invalidData = true;
    } else {
      this.energyAccountService
        .find(
          this.bottomSheetParams.meteringPointMrid,
          startCreatedDateTime,
          endCreatedDateTime
        )
        .subscribe((data) => {
          this.data = data;
          this.makeGraph();
        });
    }
  }

  makeGraph() {
    console.log(this.data);

    // 1) We get the measurementUnitName
    let measurementUnitName = this.bottomSheetParams.measurementUnitNameConsign;
    this.data.forEach((d) => {
      if (
        measurementUnitName != null &&
        d.measurementUnitName != measurementUnitName
      ) {
        // If we have MW and KW => we choose KW
        measurementUnitName = MeasurementUnitName.KW;
      }
    });
    if (measurementUnitName == null) {
      this.invalidData = true;
      return;
    }

    // Final : the graph data
    this.graphData = {
      yTitle: `Puissance ${measurementUnitName}`,
      serieNames: [],
      data: [],
      exportFileName: 'ee',
    };

    console.log(this.graphData);
  }
}
