import { TypeSite } from 'src/app/models/enum/TypeSite.enum';
import { Component, Input, OnInit } from '@angular/core';
import { RechercheSitesProductionEntite } from 'src/app/models/RechercheSitesProduction';

@Component({
  selector: 'app-sites-production-resultat',
  templateUrl: './sites-production-resultat.component.html',
  styleUrls: ['./sites-production-resultat.component.css'],
})
export class SitesProductionResultatComponent implements OnInit {
  @Input() resultat?: RechercheSitesProductionEntite;

  TypeSiteEnum = TypeSite;

  showDetails = false;

  constructor() {}

  ngOnInit() {}

  open() {
    this.showDetails = true;
  }

  close() {
    this.showDetails = false;
  }
}
