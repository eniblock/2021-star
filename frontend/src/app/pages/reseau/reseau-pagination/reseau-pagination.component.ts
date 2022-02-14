import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { OrdreRechercheReseau } from 'src/app/models/enum/OrdreRechercheReseau.enum';
import { FormulairePagination } from 'src/app/models/Pagination';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-reseau-pagination',
  templateUrl: './reseau-pagination.component.html',
  styleUrls: ['./reseau-pagination.component.css'],
})
export class ReseauPaginationComponent implements OnInit {
  @Output() paginationModifiee = new EventEmitter<
    FormulairePagination<OrdreRechercheReseau>
  >();

<<<<<<< HEAD
  @Input() pageSize = environment.pageSizes[0];
=======
  @Input() pagesize = environment.pageSizes[0];
>>>>>>> develop
  @Input() order = OrdreRechercheReseau.producerMarketParticipantName;

  ordreRechercheReseauEnum = OrdreRechercheReseau;

  pageSizes = environment.pageSizes;

  form: FormGroup = this.formBuilder.group({
<<<<<<< HEAD
    pageSize: [],
=======
    pagesize: [],
>>>>>>> develop
    order: [],
  });

  constructor(private formBuilder: FormBuilder) {}

  ngOnInit() {
    this.form.patchValue({
<<<<<<< HEAD
      pageSize: this.pageSize,
=======
      pagesize: this.pagesize,
>>>>>>> develop
      order: this.order,
    });
  }

  formChange() {
    this.paginationModifiee.emit(this.form.value);
  }
}
