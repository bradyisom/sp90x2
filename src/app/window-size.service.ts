import { Inject, Injectable } from '@angular/core';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Injectable()
export class WindowSizeService {

  public gridColumnCount: BehaviorSubject<number>;

  constructor(
    @Inject('Window') private window: any,
  ) {
    this.gridColumnCount = new BehaviorSubject<number>(this.calcGridColumnCount());
    this.window.addEventListener('resize', () => {
      this.gridColumnCount.next(this.calcGridColumnCount());
    });
  }

  private calcGridColumnCount() {
    return Math.max(1, Math.floor(this.window.innerWidth / 200));
  }

}
