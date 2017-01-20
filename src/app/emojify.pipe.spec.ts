/* tslint:disable:no-unused-variable */

import { TestBed, async } from '@angular/core/testing';
import { EmojifyPipe } from './emojify.pipe';

describe('EmojifyPipe', () => {
  it('should create an instance', () => {
    const pipe = new EmojifyPipe();
    expect(pipe).toBeTruthy();
  });
  it('should replace an emoji', () => {
    const pipe = new EmojifyPipe();
    expect(pipe.transform('Hello :smiley: world')).toBe(
      `Hello <span class='emoji emoji-smiley' title=':smiley:'></span> world`
    );
  });
});
