import { Injectable, Component, Input } from '@angular/core';
import { MdDialog, MdDialogRef } from '@angular/material';

@Component({
  selector: 'app-error',
  template: `
    <h2 md-dialog-title *ngIf="title">
      {{title}}
    </h2>
    <p md-dialog-content>
      {{error.message}}
    </p>
    <md-dialog-actions>
      <button md-button md-dialog-close>OK</button>
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
export class ErrorComponent {
  @Input() public error: Error;
  @Input() public title: string;

  constructor() { }
}

@Injectable()
export class ErrorService {

  constructor(private dialog: MdDialog) { }

  show(error: Error, title?: string) {
    const dialogRef: MdDialogRef<ErrorComponent> = this.dialog.open(ErrorComponent);
    if (!error.message) {
      error = new Error('Unknown error');
    }
    dialogRef.componentInstance.error = error;
    dialogRef.componentInstance.title = title;
  }
}
