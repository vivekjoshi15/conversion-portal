import { Component, OnInit, ViewChild  } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';
import { FileUploader, FileUploaderOptions, ParsedResponseHeaders } from 'ng2-file-upload';
import { saveAs } from 'file-saver';

import { AuthenticationService, LoaderService, DownloadService } from '../../_services';
import { environment } from '../../../environments/environment';
import { User, Store, CampaignStore, CampaignStoreModule, CampaignStoreData } from '../../_models';

@Component({
  moduleId: module.id.toString(),
  selector: 'app-bulkcampaignstoreupload',
  templateUrl: './bulkcampaignstoreupload.component.html',
  styleUrls: ['./bulkcampaignstoreupload.component.scss']
})

export class BulkCampaignStoreUploadComponent implements OnInit {
    @ViewChild('csvReader') csvReader: any;

    bulkUploadForm: FormGroup ;
    loading = false;
    showLoader: boolean;
    currentUser: User;
    id: number = 0;
    companyId: number = 0;
    campaignName: string = "";
    submitted = false;
    error: any = '';
    success: any = '';
    campaignStores: CampaignStoreData[] = [];
    invalidCampaignStores: CampaignStoreData[] = [];
    validCampaignStores: CampaignStoreData[] = [];
    order: string = 'id';
    reverse: boolean = false;

    isFileProgress: boolean = false;
    hasBaseDropZoneOver: boolean = false;
    uploader: FileUploader;

    constructor(
        private downloads: DownloadService,
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private loaderService: LoaderService,
        private authenticationService: AuthenticationService
    ) { 
        this.id = this.route.snapshot.params.id;
        this.companyId = this.route.snapshot.params.companyId;
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
          url: environment.apiApiUrl +'/Store/bulkCampaignStoreUpload/' + this.id,
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
          form.append('company_id', this.id.toString());

          form.append('filebinary', fileItem);
          fileItem.withCredentials = false;
          this.uploadListener(fileItem.file);

            this.uploader.onCompleteItem = (item: any, response: string, status: number, headers: ParsedResponseHeaders) => {
             
                this.isFileProgress=false;
                if(status==200){
                    var objResponse = JSON.parse(response);
                    //this.iconUrl=objResponse.secure_url;
                }
            }

          this.uploader.onProgressItem = (fileItem: any, progress: any) => {
            this.isFileProgress=true;
          }

          return { fileItem, form };
        };

        this.getCampaign();
    }  

    getCampaign(){
        if(this.id != 0){
            this.loading = true;
            this.loaderService.display(true);
            this.authenticationService.getCampaign(this.id, this.currentUser.apikey)
                .pipe(first())
                .subscribe(
                    (data: any) => {
                        if(data != null && data.uid != ''){
                            this.campaignName=data.name;
                            this.error = "";
                            this.loading = false;
                            this.loaderService.display(false);
                        }
                        else{
                            this.campaignName = "";
                            this.error = "No store found";
                            this.loading = false;
                            this.loaderService.display(false);
                        }
                    },
                    (error: any) => {
                        this.campaignName = "";
                        this.error = error;
                        this.loading = false;
                        this.loaderService.display(false);
                    });
        }
    }  

    // convenience getter for easy access to form fields
    get f() { return this.bulkUploadForm.controls; }

    onUpload() {
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

        this.invalidCampaignStores = [];
        this.validCampaignStores = [];
        this.loading = true;

        this.authenticationService.bulkCampaignStoreUpload(this.companyId, this.id, this.campaignStores, this.currentUser.apikey)
            .pipe(first())
            .subscribe(
                (data: any) => {
                  if(data != null && data.message == "success"){
                    this.fileReset();

                    if(data.validCampaignStores.length > 0){                        
                        this.success = data.validCampaignStores.length + " campaign store(s) uploaded.";
                        this.validCampaignStores = data.validCampaignStores;
                    }

                    if(data.invalidCampaignStores.length > 0){                        
                        this.error = data.invalidCampaignStores.length + " invalid campaign store(s) found with duplicate StoreIds.";
                        this.invalidCampaignStores = data.invalidCampaignStores;

                        //data.invalidStores.forEach(function (storeObj) {
                        //  console.log(value);
                        //}); 
                    }

                    this.submitted = false;
                    this.loading = false;
                    this.loaderService.display(false);
                  }
                  else{
                    this.submitted = false;
                    this.error = data.message;
                    this.loading = false;
                    this.loaderService.display(false);
                  }
                },
                (error: any) => {
                    this.submitted = false;
                    this.error = error;
                    this.loading = false;
                    this.loaderService.display(false);
                });
    }

    fileOverBase(e: any): void {
        this.hasBaseDropZoneOver = e;
    }

    uploadListener(file: any): void {
        this.error = "";
        this.success = "";
        let text: any = [];
        this.invalidCampaignStores = [];
        this.validCampaignStores = [];
        
        if (this.isValidCSVFile(file)) {
          let reader = new FileReader();
          reader.readAsText(file.rawFile);
          reader.onload = () => {
            let csvData = reader.result;
            let csvRecordsArray = (<string>csvData).split(/\r\n|\n/);
            let headersRow = this.getHeaderArray(csvRecordsArray);
            this.campaignStores = this.getDataRecordsArrayFromCSVFile(csvRecordsArray, headersRow.length);
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
            let curruntRecord = this.CSVtoArray(<string>csvRecordsArray[i]);
            
            if (curruntRecord.length == headerLength) {
                if(curruntRecord[0] != undefined && curruntRecord[0].trim() != ""){
                    let csvRecord: CampaignStoreData = new CampaignStoreData();
                    csvRecord.StoreId = curruntRecord[0].trim();
                    csvRecord.CampaignId = this.id;
                    csvRecord.UniqueUrl = "";
                    csvRecord.Module1 = curruntRecord[1].trim();
                    csvRecord.Module2 = curruntRecord[2].trim();
                    csvRecord.Module3 = curruntRecord[3].trim();
                    csvRecord.Module4 = curruntRecord[4].trim();
                    csvRecord.Module5 = curruntRecord[5].trim();
                    csvRecord.Module6 = curruntRecord[6].trim();
                    csvRecord.Module7 = curruntRecord[7].trim();
                    csvRecord.Module8 = curruntRecord[8].trim();
                    csvRecord.IsActive = 1;
                    csvArr.push(csvRecord);
                }
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

    CSVtoArray(text: any) {
        var re_valid = /^\s*(?:'[^'\\]*(?:\\[\S\s][^'\\]*)*'|"[^"\\]*(?:\\[\S\s][^"\\]*)*"|[^,'"\s\\]*(?:\s+[^,'"\s\\]+)*)\s*(?:,\s*(?:'[^'\\]*(?:\\[\S\s][^'\\]*)*'|"[^"\\]*(?:\\[\S\s][^"\\]*)*"|[^,'"\s\\]*(?:\s+[^,'"\s\\]+)*)\s*)*$/;
        var re_value = /(?!\s*$)\s*(?:'([^'\\]*(?:\\[\S\s][^'\\]*)*)'|"([^"\\]*(?:\\[\S\s][^"\\]*)*)"|([^,'"\s\\]*(?:\s+[^,'"\s\\]+)*))\s*(?:,|$)/g;

        // Return NULL if input string is not well formed CSV string.
        if (!re_valid.test(text)) return null;

        var a: any = []; // Initialize array to receive values.
        text.replace(re_value, // "Walk" the string using replace with callback.
            function(m0: any, m1: any, m2: any, m3: any) {

                // Remove backslash from \' in single quoted values.
                if (m1 !== undefined) a.push(m1.replace(/\\'/g, "'"));

                // Remove backslash from \" in double quoted values.
                else if (m2 !== undefined) a.push(m2.replace(/\\"/g, '"'));
                else if (m3 !== undefined) a.push(m3);
                return ''; // Return empty string.
            });

        // Handle special case of empty last value.
        if (/,\s*$/.test(text)) a.push('');
        return a;
    }

    fileReset() {
        this.csvReader.nativeElement.value = "";
        this.campaignStores = [];
        this.error = "";
        this.success = "";
    }

    setOrder(value: string) {
      if (this.order === value) {
        this.reverse = !this.reverse;
      }

      this.order = value;
    }

    goto(){
        this.router.navigate(["campaignstores/" + this.companyId + "/" + this.id]);
    }

    download(): void {
        this.downloads
          .download('/assets/campaign-template.xlsx')
          .subscribe(blob => {
            const a = document.createElement('a')
            const objectUrl = URL.createObjectURL(blob)
            a.href = objectUrl
            a.download = 'campaign-template.xlsx';
            a.click();
            URL.revokeObjectURL(objectUrl);
          })
      }
}