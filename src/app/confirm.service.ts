import { Injectable, Component, Input } from '@angular/core';
import { MdDialog, MdDialogRef } from '@angular/material';

@Component({
  selector: 'app-confirm',
  template: `
    <h2 md-dialog-title *ngIf="title">
      {{title}}
    </h2>
    <p md-dialog-content>
      {{message}}
    </p>
    <md-dialog-actions>
        <button color="primary" md-button md-dialog-close>Cancel</button>
        <button class="confirm-btn" [color]="confirmColor" md-button
          (click)="dialogRef.close('confirm')">{{confirmLabel}}</button>
    </md-dialog-actions>`,
  styles: [`
    md-dialog-actions {
        display: flex;
        flex-direction: row;
        justify-content: flex-end;
    }
    md-dialog-actions button {
        margin-left: 6px;
    }
  `]
})
export class ConfirmComponent {
  @Input() public message: string;
  @Input() public confirmLabel = 'OK';
  @Input() public confirmColor = 'accent';
  @Input() public title: string;

  constructor(public dialogRef: MdDialogRef<ConfirmComponent>) { }
}

@Injectable()
export class ConfirmService {

  constructor(private dialog: MdDialog) { }

  show(message: string, confirmLabel?: string, confirmColor?: string, title?: string): MdDialogRef<ConfirmComponent> {
    const dialogRef: MdDialogRef<ConfirmComponent> = this.dialog.open(ConfirmComponent);
    dialogRef.componentInstance.message = message;
    dialogRef.componentInstance.confirmLabel = confirmLabel;
    dialogRef.componentInstance.confirmColor = confirmColor;
    dialogRef.componentInstance.title = title;
    return dialogRef;
  }
}
