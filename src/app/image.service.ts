import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';

const pixabayKey = '2947844-f779b4bcf12de6e90f8dd4e63';

@Injectable()
export class ImageService {

  constructor(
    private http: Http
  ) { }

  search(query: string, perPage = 20, page = 1): Observable<any> {
    return this.http.get(
      `https://pixabay.com/api/?key=${pixabayKey}&safesearch=true&q=${query}&per_page=${perPage}&page=${page}`
    ).map((response: Response) => {
      return response.json();
    });
  }

  getDataUrl(imageData: any): Observable<string> {
    return Observable.create((observer) => {
      const canvas = document.createElement('canvas');
      canvas.width = imageData.webformatWidth;
      canvas.height = imageData.webformatHeight;
      const context = canvas.getContext('2d');

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = imageData.webformatURL;
      img.onload = function(){
        context.drawImage(img, 0, 0);
        observer.next(canvas.toDataURL());
        observer.complete();
      };
      /* istanbul ignore next */
      img.onerror = (err) => {
        observer.error(err);
      };
    });
  }

}
