import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import {environment} from "../../../environments/environment";

@Injectable({
  providedIn: 'root',
})
export class SnackbarService {
  DUREE_SNACKBAR_SUCCESS = environment.snackBarSuccessTime;
  DUREE_SNACKBAR_ERROR = environment.snackBarErrorTime;

  constructor(private snackBar: MatSnackBar) {}

  public showSuccessSnackbar(message?: string): void {
    const messageAAfficher =
      message == null ? "L'opération s'est bien déroulée !" : message;
    this.snackBar.open(messageAAfficher, 'x', {
      duration: this.DUREE_SNACKBAR_SUCCESS,
      panelClass: ['success-snackbar'],
    });
  }

  public showErrorSnackbar(message?: string): void {
    const messageAAfficher =
      message == null ? "Une erreur s'est produite..." : message;
    this.snackBar.open(messageAAfficher, 'x', {
      duration: this.DUREE_SNACKBAR_ERROR,
      panelClass: ['error-snackbar'],
    });
  }
}
