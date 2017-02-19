import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MdDialogRef } from '@angular/material';
import { ImageCropperComponent, CropperSettings } from 'ng2-img-cropper';
import { ImageService } from '../image.service';
import { WindowSizeService } from '../window-size.service';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';


@Component({
  selector: 'app-choose-image',
  templateUrl: './choose-image.component.html',
  styleUrls: ['./choose-image.component.scss']
})
export class ChooseImageComponent implements OnInit, OnDestroy {
  public imageUrl: string;

  public columnCount: BehaviorSubject<number>;

  public imageType: 'upload'|'search' = 'search';
  public query = '';
  public data: any;
  public loading = false;
  public page = 1;
  public pageSize: number;
  public firstIndex: number;
  public lastIndex: number;
  public cropperSettings: CropperSettings;

  public imageResults: BehaviorSubject<any> = new BehaviorSubject<any>({});

  private searchUpdated: Subject<string> = new Subject<string>();

  private searchSubscription: Subscription;

  @ViewChild('cropper') cropper: ImageCropperComponent;

  constructor(
    private imageSearch: ImageService,
    private windowSize: WindowSizeService,
    public dialogRef: MdDialogRef<ChooseImageComponent>
  ) {
    this.columnCount = this.windowSize.gridColumnCount;
  }

  ngOnInit() {
    this.cropperSettings = new CropperSettings();
    this.cropperSettings.width = 200;
    this.cropperSettings.height = 200;
    this.cropperSettings.croppedWidth = 200;
    this.cropperSettings.croppedHeight = 200;
    this.cropperSettings.canvasWidth = 300;
    this.cropperSettings.canvasHeight = 300;
    this.cropperSettings.noFileInput = true;

    this.data = {};
    if (this.imageUrl) {
      const image: any = new Image();
      image.src = this.imageUrl;
      this.cropper.setImage(image);
    }

    this.searchSubscription = this.searchUpdated.asObservable()
    .debounceTime(300)
    .distinctUntilChanged()
    .subscribe((value: string) => {
      this.page = 1;
      this.search();
    });
  }

  ngOnDestroy() {
    this.searchSubscription.unsubscribe();
  }

  selectImage(imageData: any) {
    this.loading = true;
    this.imageSearch.getDataUrl(imageData).first().subscribe((dataURL: string) => {
      const img = new Image();
      img.src = dataURL;
      this.cropper.setImage(img);
      this.loading = false;
    });
  }

  onSearchType(value: string) {
    this.searchUpdated.next(value);
  }

  private search() {
    this.pageSize = this.columnCount.value * 3;
    this.imageSearch.search(this.query, this.pageSize, this.page)
    .first().subscribe((results) => {
      this.firstIndex = this.pageSize * (this.page - 1) + 1;
      this.lastIndex = Math.min(this.pageSize * this.page, results.totalHits);
      this.imageResults.next(results);
    });
  }

  prevPage() {
    this.page--;
    this.search();
  }

  nextPage() {
    this.page++;
    this.search();
  }

  fileChangeListener($event) {
    this.loading = true;
    const image: any = new Image();
    const file: File = $event.target.files[0];
    const myReader: FileReader = new FileReader();
    myReader.onloadend = (loadEvent: any) => {
      image.src = loadEvent.target.result;
      this.cropper.setImage(image);
      this.loading = false;
    };
    myReader.readAsDataURL(file);
  }

}
