import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {FormBuilder, FormGroup} from "@angular/forms";
import {TypeLimitation} from "../../../models/enum/TypeLimitation.enum";
import {RechercheHistoriqueLimitationEntiteWithAnnotation} from "../../../models/RechercheHistoriqueLimitation";
import {SortHelper} from "../../../helpers/sort.helper";
import {IndeminityStatus} from "../../../models/enum/IndeminityStatus.enum";
import {ReconciliationStatus} from "../../../models/enum/ReconciliationStatus.enum";
import {InstanceService} from "../../../services/api/instance.service";
import {Instance} from "../../../models/enum/Instance.enum";

@Component({
  selector: 'app-limitations-filter-on-results',
  templateUrl: './limitations-filter-on-results.component.html',
  styleUrls: ['./limitations-filter-on-results.component.css']
})
export class LimitationsFilterOnResultsComponent implements OnInit, OnChanges {

  @Output() typeLimitationChange = new EventEmitter<TypeLimitation | null>();
  @Output() motifNameChange = new EventEmitter<string | null>();
  @Output() indeminityStatusChange = new EventEmitter<IndeminityStatus | null>();
  @Output() reconciliationStatusChange = new EventEmitter<ReconciliationStatus | null>();
  @Input() researchResult: RechercheHistoriqueLimitationEntiteWithAnnotation[] = [];

  form: FormGroup = this.formBuilder.group({
    typeLimitation: [],
    motifName: [],
    indeminityStatus: [],
    reconciliationStatus: [],
  });

  TypeLimitationEnum = TypeLimitation;
  InstanceEnum = Instance;
  motifNames: string[] = [];
  indeminityStatus: IndeminityStatus[] = [];
  ReconciliationStatusEnum = ReconciliationStatus;
  typeInstance?: Instance;

  constructor(
    private formBuilder: FormBuilder,
    private instanceService: InstanceService,
  ) {
  }

  ngOnInit(): void {
    this.instanceService.getTypeInstance()
      .subscribe((typeInstance) => this.typeInstance = typeInstance);
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

  selectionReconciliationStatus() {
    const reconciliationStatus = this.form.get("reconciliationStatus")?.value;
    this.reconciliationStatusChange.emit(reconciliationStatus);
  }
}
