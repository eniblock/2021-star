import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { environment } from 'src/environments/environment';

export interface PageSizeAndVisibilityFieldsEvent {
  pageSize: number;
}

@Component({
  selector: 'app-activations-pagination',
  templateUrl: './activations-pagination.component.html',
  styleUrls: ['./activations-pagination.component.css'],
})
export class ActivationsPaginationComponent implements OnInit {
  @Output() paginationModifiee =
    new EventEmitter<PageSizeAndVisibilityFieldsEvent>();

  @Input() pageSize = environment.pageSizes[0];

  pageSizes = environment.pageSizes;

  form: FormGroup = this.formBuilder.group({
    pageSize: [],
  });

  constructor(private formBuilder: FormBuilder) {}

  ngOnInit() {
    this.form.patchValue({
      pageSize: this.pageSize,
    });
  }

  formChange() {
    this.paginationModifiee.emit(this.form.value);
  }
}
