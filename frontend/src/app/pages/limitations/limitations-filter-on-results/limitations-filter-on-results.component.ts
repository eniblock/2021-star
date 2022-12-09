import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {FormBuilder, FormGroup} from "@angular/forms";
import {TypeLimitation} from "../../../models/enum/TypeLimitation.enum";
import {RechercheHistoriqueLimitationEntiteWithAnnotation} from "../../../models/RechercheHistoriqueLimitation";
import {SortHelper} from "../../../helpers/sort.helper";
import {IndeminityStatus} from "../../../models/enum/IndeminityStatus.enum";

@Component({
  selector: 'app-limitations-filter-on-results',
  templateUrl: './limitations-filter-on-results.component.html',
  styleUrls: ['./limitations-filter-on-results.component.css']
})
export class LimitationsFilterOnResultsComponent implements OnInit, OnChanges {

  @Output() typeLimitationChange = new EventEmitter<TypeLimitation | null>();
  @Output() motifNameChange = new EventEmitter<string | null>();
  @Output() indeminityStatusChange = new EventEmitter<IndeminityStatus | null>();
  @Input() researchResult: RechercheHistoriqueLimitationEntiteWithAnnotation[] = [];

  form: FormGroup = this.formBuilder.group({
    typeLimitation: [],
    motifName: [],
    indeminityStatus: [],
  });

  TypeLimitationEnum = TypeLimitation;
  motifNames: string[] = [];
  indeminityStatus: IndeminityStatus[] = [];

  constructor(
    private formBuilder: FormBuilder,
  ) {
  }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Motif names
    this.motifNames = this.researchResult
      .map(n => n.motifName)
      .sort(SortHelper.caseInsensitive);
    this.motifNames = [...new Set(this.motifNames)]; // remove doublons
    // Indemnity status
    this.indeminityStatus = this.researchResult
      .map(n => n.feedbackProducer?.indeminityStatus)
      .filter(n => n != null)
      .sort(SortHelper.caseInsensitive);
    this.indeminityStatus = [...new Set(this.indeminityStatus)]; // remove doublons
  }

  selectionTypeLimitation() {
    const typeLimitation = this.form.get("typeLimitation")?.value;
    this.typeLimitationChange.emit(typeLimitation);
  }

  selectionMotifName() {
    const motifName = this.form.get("motifName")?.value;
    this.motifNameChange.emit(motifName);
  }

  selectionIndemnityStatus() {
    const motifIndeminityStatus = this.form.get("indeminityStatus")?.value;
    this.indeminityStatusChange.emit(motifIndeminityStatus);
  }
}
