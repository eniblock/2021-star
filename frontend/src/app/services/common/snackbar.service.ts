import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class SnackbarService {
  DUREE_SNACKBAR = 5000;

  constructor(private snackBar: MatSnackBar) {}

  public showSuccessSnackbar(message?: string): void {
    const messageAAfficher =
      message == null ? "L'opération s'est bien déroulée !" : message;
    this.snackBar.open(messageAAfficher, 'x', {
      duration: this.DUREE_SNACKBAR,
      panelClass: ['success-snackbar'],
    });
  }

  public showErrorSnackbar(message?: string): void {
    const messageAAfficher =
      message == null ? "Une erreur s'est produite..." : message;
    this.snackBar.open(messageAAfficher, 'x', {
      duration: this.DUREE_SNACKBAR,
      panelClass: ['error-snackbar'],
    });
  }
}
