import { Component } from '@angular/core';
import { AngularFire, FirebaseListObservable, FirebaseObjectObservable } from 'angularfire2';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'SP90X';
  email: string;
  password: string;
  list: FirebaseListObservable<any>;
  user: FirebaseObjectObservable<any>;

  constructor(private af:AngularFire) {
    this.af.auth.subscribe(auth => {
      console.log(auth);
      if (auth) {
        this.list = af.database.list(`/schedules/${auth.uid}`);
        this.user = af.database.object(`/users/${auth.uid}`);       
      }
      else {
        this.list = null;
        this.user = null;
      }
    });
  }

  login () {
    this.af.auth.login({
      email: this.email,
      password: this.password
    });
  }

  logout() {
    this.af.auth.logout();
  }
}
