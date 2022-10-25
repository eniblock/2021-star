import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {FormBuilder, FormGroup} from "@angular/forms";
import {TypeLimitation} from "../../../models/enum/TypeLimitation.enum";
import {RechercheHistoriqueLimitationEntiteAnnotated} from "../../../models/RechercheHistoriqueLimitation";
import {SortHelper} from "../../../helpers/sort.helper";

@Component({
  selector: 'app-limitations-filter-on-results',
  templateUrl: './limitations-filter-on-results.component.html',
  styleUrls: ['./limitations-filter-on-results.component.css']
})
export class LimitationsFilterOnResultsComponent implements OnInit, OnChanges {

  @Output() typeLimitationChange = new EventEmitter<TypeLimitation | null>();
  @Output() motifNameChange = new EventEmitter<string | null>();
  @Input() researchResult: RechercheHistoriqueLimitationEntiteAnnotated[] = [];

  form: FormGroup = this.formBuilder.group({
    typeLimitation: [],
    motifName: [],
  });

  TypeLimitationEnum = TypeLimitation;
  motifNames: string[] = [];

  constructor(
    private formBuilder: FormBuilder,
  ) {
  }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.motifNames = this.researchResult
      .map(n => n.motifName)
      .sort(SortHelper.caseInsensitive);
    this.motifNames = [...new Set(this.motifNames)]; // remove doublons
  }

  selectionTypeLimitation() {
    const typeLimitation = this.form.get("typeLimitation")?.value;
    this.typeLimitationChange.emit(typeLimitation);
  }

  selectionMotifName() {
    const motifName = this.form.get("motifName")?.value;
    this.motifNameChange.emit(motifName);
  }

}
