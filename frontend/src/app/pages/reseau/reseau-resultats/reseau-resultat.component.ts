import { TypeSite } from 'src/app/models/enum/TypeSite.enum';
import { Component, Input, OnInit } from '@angular/core';
import { RechercheReseauEntite } from 'src/app/models/RechercheReseau';

@Component({
  selector: 'app-reseau-resultat',
  templateUrl: './reseau-resultat.component.html',
  styleUrls: ['./reseau-resultat.component.css'],
})
export class ReseauResultatComponent implements OnInit {
  @Input() resultat?: RechercheReseauEntite;

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
