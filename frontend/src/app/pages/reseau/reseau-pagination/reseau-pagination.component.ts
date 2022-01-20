import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { OrdreRechercheReseau } from 'src/app/models/enum/OrdreRechercheReseau.enum';
import { FormulairePagination } from 'src/app/models/Pagination';

@Component({
  selector: 'app-reseau-pagination',
  templateUrl: './reseau-pagination.component.html',
  styleUrls: ['./reseau-pagination.component.css'],
})
export class ReseauPaginationComponent implements OnInit {
  @Output() paginationModifiee = new EventEmitter<
    FormulairePagination<OrdreRechercheReseau>
  >();

  constructor() {}

  ngOnInit() {}
}
