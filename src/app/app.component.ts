import { Component } from '@angular/core';
import { MdDialog, MdDialogRef } from '@angular/material';
import { Router, NavigationEnd } from '@angular/router';
import { AuthService } from './auth.service';
import { ConfirmDeleteAccountComponent } from './confirm-delete-account/confirm-delete-account.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  public appName = 'SP90X';
  public title = '';
  public showTitle = false;

  private confirmDialogRef: MdDialogRef<ConfirmDeleteAccountComponent>;

  constructor(
    public auth: AuthService,
    private router: Router,
    private dialog: MdDialog
  ) {
    this.router.events.filter(event => event instanceof NavigationEnd)
      .subscribe(event => {
        this.title = '';
        let currentRoute = this.router.routerState.root;
        do {
          const childRoutes = currentRoute.children;
          currentRoute = null;
          childRoutes.forEach(route => {
            if (route.outlet === 'primary') {
              const routeSnapshot = route.snapshot;
              if (routeSnapshot.data && routeSnapshot.data['title']) {
                this.title = routeSnapshot.data['title'];
              }
              currentRoute = route;
            }
          });
        } while (currentRoute);

        this.showTitle = (this.title !== 'Home' && this.title !== 'About');
      });
  }

  public deleteAccount() {
    this.confirmDialogRef = this.dialog.open(ConfirmDeleteAccountComponent, {});
    this.confirmDialogRef.afterClosed().first().subscribe(result => {
      // console.log('result: ' + result);
      this.confirmDialogRef = null;
      if (result === 'delete') {
        this.auth.delete();
      }
    });
  }
}
