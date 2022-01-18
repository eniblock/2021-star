import { Component, OnInit } from '@angular/core';
import { RechercheReseauForm } from 'src/app/models/RechercheReseau';

@Component({
  selector: 'app-reseau',
  templateUrl: './reseau.component.html',
  styleUrls: ['./reseau.component.css'],
})
export class ReseauComponent implements OnInit {
  constructor() {}

  ngOnInit() {}

  rechercher(form: RechercheReseauForm) {
    console.log(form);
  }
}
