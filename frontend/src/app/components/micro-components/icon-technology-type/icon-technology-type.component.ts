import { Component, Input, OnInit } from '@angular/core';
import { TechnologyType } from 'src/app/models/enum/TechnologyType.enum';

@Component({
  selector: 'app-icon-technology-type',
  templateUrl: './icon-technology-type.component.html',
  styleUrls: ['./icon-technology-type.component.css'],
})
export class IconTechnologyTypeComponent implements OnInit {
  @Input() technologyType?: TechnologyType;
  @Input() versionBlanc = false;

  TechnologyTypeEnum = TechnologyType;

  constructor() {}

  ngOnInit() {}
}
