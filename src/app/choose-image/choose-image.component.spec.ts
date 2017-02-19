/* tslint:disable:no-unused-variable */
import { async, fakeAsync, tick, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ImageCropperComponent, CropperSettings } from 'ng2-img-cropper';
import { MaterialModule, MdDialogRef } from '@angular/material';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { ImageService } from '../image.service';
import { WindowSizeService } from '../window-size.service';
import { ChooseImageComponent } from './choose-image.component';

describe('ChooseImageComponent', () => {
  let component: ChooseImageComponent;
  let fixture: ComponentFixture<ChooseImageComponent>;

  const testImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVQYV2NgAAIAAAUAAarVyFEAAAAASUVORK5CYII=';

  const mockImageService = {
    getDataUrl: jasmine.createSpy('getDataUrl', () => {
      return Observable.of(testImage);
    }).and.callThrough(),
    search: jasmine.createSpy('search', () => {
      return Observable.of({
        totalHits: 1,
        hits: [{
          webformatURL: 'https://goog.le/image.png'
        }]
      });
    }).and.callThrough(),
  };

  const mockMdDialogRef = {
  };

  const mockWindowSize = {
    gridColumnCount: new BehaviorSubject<number>(3)
  };

  beforeEach(() => {
    mockImageService.getDataUrl.calls.reset();
    mockImageService.search.calls.reset();

    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        MaterialModule.forRoot(),
      ],
      declarations: [
        ChooseImageComponent,
        ImageCropperComponent,
      ],
      providers: [{
        provide: ImageService, useValue: mockImageService
      }, {
        provide: WindowSizeService, useValue: mockWindowSize
      }, {
        provide: MdDialogRef, useValue: mockMdDialogRef
      }]
    });

    fixture = TestBed.createComponent(ChooseImageComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
    expect(component.data).toEqual({});
  });

  it('should set the column count', () => {
    fixture.detectChanges();
    component.columnCount.first().subscribe((count) => {
      expect(count).toBe(3);
    });
  });

  it('should set cropper settings', () => {
    fixture.detectChanges();
    expect(component.cropperSettings.width).toBe(200);
    expect(component.cropperSettings.height).toBe(200);
    expect(component.cropperSettings.croppedWidth).toBe(200);
    expect(component.cropperSettings.croppedHeight).toBe(200);
    expect(component.cropperSettings.canvasWidth).toBe(300);
    expect(component.cropperSettings.canvasHeight).toBe(300);
    expect(component.cropperSettings.noFileInput).toBe(true);
  });

  it('should initialize with an empty image', () => {
    spyOn(component.cropper, 'setImage').and.callThrough();
    fixture.detectChanges();
    expect(component.cropper.setImage).not.toHaveBeenCalled();
  });

  it('should initialize with an existing image', () => {
    spyOn(component.cropper, 'setImage').and.callThrough();
    component.imageUrl = testImage;
    fixture.detectChanges();
    expect(component.cropper.setImage).toHaveBeenCalled();
  });

  describe('selectImage', () => {

    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should convert to a data URL', () => {
      const imageData = {};
      component.selectImage(imageData);
      expect(mockImageService.getDataUrl).toHaveBeenCalledWith(imageData);
    });

    it('should set the cropper image', () => {
      spyOn(component.cropper, 'setImage').and.callThrough();
      const imageData = {};
      component.selectImage(imageData);
      fixture.detectChanges();
      expect(component.cropper.setImage).toHaveBeenCalled();
    });

  });

  describe('onSearchType', () => {

    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should search after debounce', fakeAsync(() => {
      component.query = 'superman';
      component.onSearchType(component.query);
      expect(mockImageService.search).not.toHaveBeenCalled();
      tick(300);
      expect(mockImageService.search).toHaveBeenCalledWith('superman', 9, 1);
      expect(component.imageResults.value).toEqual({
        totalHits: 1,
        hits: [{
          webformatURL: 'https://goog.le/image.png'
        }]
      });
    }));

    it('should reset the page number', fakeAsync(() => {
      component.page = 3;
      component.query = 'superman';
      component.onSearchType(component.query);
      tick(300);
      expect(mockImageService.search).toHaveBeenCalledWith('superman', 9, 1);
      expect(component.page).toBe(1);
    }));

    it('should update the first and last index', fakeAsync(() => {
      component.query = 'superman';
      component.onSearchType(component.query);
      expect(mockImageService.search).not.toHaveBeenCalled();
      tick(300);
      expect(component.firstIndex).toBe(1);
      expect(component.lastIndex).toBe(1);
    }));

  });

  describe('prevPage', () => {

    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should search the previous page', () => {
      component.query = 'supergirl';
      component.page = 3;
      component.prevPage();
      expect(component.page).toBe(2);
      expect(mockImageService.search).toHaveBeenCalledWith('supergirl', 9, 2);
    });

  });

  describe('nextPage', () => {

    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should search the next page', () => {
      component.query = 'supergirl';
      component.page = 3;
      component.nextPage();
      expect(component.page).toBe(4);
      expect(mockImageService.search).toHaveBeenCalledWith('supergirl', 9, 4);
    });

  });


  describe('fileChangeListener', () => {
    let fileReader: any;

    beforeEach(() => {
      fixture.detectChanges();
      fileReader = {
        readAsDataURL: jasmine.createSpy('readAsDataUrl', () => {
          fileReader.onloadend({
            target: {
              result: testImage
            }
          });
        }).and.callThrough(),
      };
      spyOn(component.cropper, 'setImage').and.callThrough();
      spyOn(window, 'FileReader').and.returnValue(fileReader);
    });

    it('should load a file', () => {
      component.fileChangeListener({
        target: {
          files: [{
            path: 'path/to/file.png'
          }]
        }
      });

      expect(fileReader.readAsDataURL).toHaveBeenCalledWith({
        path: 'path/to/file.png'
      });
      expect(component.cropper.setImage).toHaveBeenCalled();
    });

  });


});
