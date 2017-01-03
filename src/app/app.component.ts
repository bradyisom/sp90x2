import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  public appName = 'SP90X';
  public title = '';
  public showTitle = false;

  constructor(
    public auth: AuthService,
    private router: Router
  ) {
    this.router.events.filter(event => event instanceof NavigationEnd)
      .subscribe(event => {
        this.title = '';
        let currentRoute = this.router.routerState.root;
        do {
          let childRoutes = currentRoute.children;
          currentRoute = null;
          childRoutes.forEach(route => {
            if (route.outlet === 'primary') {
              let routeSnapshot = route.snapshot;
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
}
