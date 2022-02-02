import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-form-ordre-debut-limitation',
  templateUrl: './form-ordre-debut-limitation.component.html',
  styleUrls: ['./form-ordre-debut-limitation.component.css'],
})
export class FormOrdreDebutLimitationComponent implements OnInit {
  form: FormGroup = this.formBuilder.group({
    documentName: [''],
    document: ['', Validators.required],
  });

  constructor(private formBuilder: FormBuilder) {}

  selectFile(event: any) {
    const file = (event.target as HTMLInputElement).files?.[0];
    this.form.get('documentName')?.setValue(file?.name);
    this.form.get('document')?.setValue(file);
  }

  ngOnInit() {}

  onSubmit() {}
}
