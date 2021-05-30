import { Component, OnInit, ViewChild  } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';
import { FileUploader, FileUploaderOptions, ParsedResponseHeaders } from 'ng2-file-upload';

import { AuthenticationService, LoaderService } from '../../_services';
import { environment } from '../../../environments/environment';
import { User } from '../../_models';

export class CSVRecord {
    public id: any;
    public firstName: any;
    public lastName: any;
    public since: any;
    public tier: any;
    public mobile: any; 
    public email: any;   
    public imageUrl: any;   
  }

@Component({
  moduleId: module.id.toString(),
  selector: 'app-bulkupload',
  templateUrl: './bulkupload.component.html',
  styleUrls: ['./bulkupload.component.scss']
})

export class BulkUploadComponent implements OnInit {
    @ViewChild('csvReader') csvReader: any;

    bulkUploadForm: FormGroup ;
    loading = false;
    showLoader: boolean;
    currentUser: User;
    id: number = 0;
    storeName: string = "";
    submitted = false;
    error: any = '';
    success: any = '';
    records: any[] = [];
    order: string = 'id';
    reverse: boolean = false;

    isFileProgress: boolean = false;
    hasBaseDropZoneOver: boolean = false;
    uploader: FileUploader;

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private loaderService: LoaderService,
        private authenticationService: AuthenticationService
    ) { 
        this.id = this.route.snapshot.params.id;
    }

    ngOnInit() {
        this.bulkUploadForm = this.formBuilder.group({
            phone: ['']
        });

        this.authenticationService.currentUser.subscribe((x: any) => {
            this.currentUser = x;
        });

        this.loaderService.status.subscribe((val: boolean) => {
            setTimeout(() => this.showLoader = val, 0);
        });

        const uploaderOptions: FileUploaderOptions = {
          url: environment.apiMainUrl +'/api/loyalty/bulkUpload',
          // Upload files automatically upon addition to upload queue
          autoUpload: true,
          // Use xhrTransport in favor of iframeTransport
          isHTML5: true,
          // Calculate progress independently for each uploaded file
          removeAfterUpload: true,
          // XHR request headers
          headers: [
            {
              name: 'X-Requested-With',
              value: 'XMLHttpRequest'
            }
          ]
        };

        this.uploader = new FileUploader(uploaderOptions);

        this.uploader.onBuildItemForm = (fileItem: any, form: FormData): any => {
          //form.append('upload_preset', this.cloudinary.config().upload_preset);
          form.append('template_id', this.id.toString());

          form.append('file', fileItem);
          fileItem.withCredentials = false;
          this.uploadListener(fileItem.file);

          this.uploader.onCompleteItem = (item: any, response: string, status: number, headers: ParsedResponseHeaders) => {
              var objResponse = JSON.parse(response);
              //this.iconUrl=objResponse.secure_url;
              this.isFileProgress=false;
          }

          this.uploader.onProgressItem = (fileItem: any, progress: any) => {
            this.isFileProgress=true;
          }

          return { fileItem, form };
        };

        this.getStore();
    }  

    getStore(){
        if(this.id != 0){
            this.loaderService.display(true);
            this.authenticationService.getStore(this.id, this.currentUser.apikey)
                .pipe(first())
                .subscribe(
                    (data: any) => {
                        if(data != null && data.uid != ''){
                            this.storeName=data.name;
                            this.error = "";
                            this.loading = false;
                            this.loaderService.display(false);
                        }
                        else{
                            this.storeName = "";
                            this.error = "No store found";
                            this.loading = false;
                            this.loaderService.display(false);
                        }
                    },
                    (error: any) => {
                        this.storeName = "";
                        this.error = error;
                        this.loading = false;
                        this.loaderService.display(false);
                    });
        }
    }  

    // convenience getter for easy access to form fields
    get f() { return this.bulkUploadForm.controls; }

    onSubmit() {
        this.loaderService.display(true);
        this.submitted = true;
        this.success = "";
        this.error = "";

        if (this.bulkUploadForm.invalid) {
            this.error = "Please fill required fields";
            this.loaderService.display(false);
            this.submitted = false;
            return;
        }
    }

    fileOverBase(e: any): void {
        this.hasBaseDropZoneOver = e;
    }

    uploadListener(file: any): void {
        let text: any = [];
        this.error = "";
        if (this.isValidCSVFile(file)) {
          let reader = new FileReader();
          reader.readAsText(file.rawFile);
          reader.onload = () => {
            let csvData = reader.result;
            let csvRecordsArray = (<string>csvData).split(/\r\n|\n/);
            let headersRow = this.getHeaderArray(csvRecordsArray);
            this.records = this.getDataRecordsArrayFromCSVFile(csvRecordsArray, headersRow.length);
          };
          reader.onerror = function () {
            //this.error = "error is occured while reading file!";
            console.log('error is occured while reading file!');
          };
        } else {
            this.error = "Please import valid .csv file.";
            this.fileReset();
        }
    }

    getDataRecordsArrayFromCSVFile(csvRecordsArray: any, headerLength: any) {
        let csvArr: any = [];
        for (let i = 1; i < csvRecordsArray.length; i++) {
          let curruntRecord = (<string>csvRecordsArray[i]).split(',');
          if (curruntRecord.length == headerLength) {
            let csvRecord: CSVRecord = new CSVRecord();
            csvRecord.id = curruntRecord[0].trim();
            csvRecord.firstName = curruntRecord[1].trim();
            csvRecord.lastName = curruntRecord[2].trim();
            csvRecord.since = curruntRecord[3].trim();
            csvRecord.tier = curruntRecord[4].trim();
            csvRecord.mobile = curruntRecord[5].trim();
            csvRecord.email = curruntRecord[6].trim();
            csvRecord.imageUrl = curruntRecord[7].trim();
            csvArr.push(csvRecord);
          }
        }
        return csvArr;
    }

    isValidCSVFile(file: any) {
        return file.name.endsWith(".csv");
    }

    getHeaderArray(csvRecordsArr: any) {
        let headers: any = (<string>csvRecordsArr[0]).split(',');
        let headerArray: any = [];
        for (let j = 0; j < headers.length; j++) {
            headerArray.push(headers[j]);
        }
        return headerArray;
    }

    fileReset() {
        this.csvReader.nativeElement.value = "";
        this.records = [];
    }

    setOrder(value: string) {
      if (this.order === value) {
        this.reverse = !this.reverse;
      }

      this.order = value;
    }
}