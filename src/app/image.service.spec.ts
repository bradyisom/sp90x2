/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { ImageService } from './image.service';

describe('ImageService', () => {

  const mockHttp = {
    get: jasmine.createSpy('get', () => {
      return Observable.of({
        json: () => {
          return {
            totalHits: 1,
            hits: [{
              webformatURL: 'https://goog.le/image.png'
            }]
          };
        }
      });
    }).and.callThrough(),
  };

  const service: ImageService = new ImageService(<any>mockHttp);

  beforeEach(() => {
    mockHttp.get.calls.reset();
 });

  it('should exist', () => {
    expect(service).toBeTruthy();
  });


  describe('search', () => {

    it('should call pixabay', () => {
      service.search('superman');
      expect(mockHttp.get).toHaveBeenCalledWith(
        'https://pixabay.com/api/?key=2947844-f779b4bcf12de6e90f8dd4e63&safesearch=true&q=superman&per_page=20&page=1'
      );
    });

    it('should call take options', () => {
      service.search('supergirl', 30, 2);
      expect(mockHttp.get).toHaveBeenCalledWith(
        'https://pixabay.com/api/?key=2947844-f779b4bcf12de6e90f8dd4e63&safesearch=true&q=supergirl&per_page=30&page=2'
      );
    });

    it('should resolve', () => {
      service.search('superman').first().subscribe((result) => {
        expect(result).toEqual({
          totalHits: 1,
          hits: [{
            webformatURL: 'https://goog.le/image.png'
          }]
        });
      });
    });

  });

  describe('getDataUrl', () => {

    it('should get a data URL', (done) => {
      service.getDataUrl({
        webformatURL: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVQYV2NgAAIAAAUAAarVyFEAAAAASUVORK5CYII=',
        webformatWidth: 1,
        webformatHeight: 1
      }).first().subscribe((result) => {
        expect(result).toBe(
          'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVQYV2NgAAIAAAUAAarVyFEAAAAASUVORK5CYII='
        );
      }, (error) => {
        expect(error).toBeFalsy();
      }, () => {
        done();
      });
    });
  });


});
