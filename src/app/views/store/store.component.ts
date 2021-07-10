import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';
import { FileUploader, FileUploaderOptions, ParsedResponseHeaders } from 'ng2-file-upload';
import { Cloudinary } from '@cloudinary/angular-5.x';
import { PageEvent } from '@angular/material/paginator';

import { AuthenticationService, LoaderService, AlertService } from '../../_services';
import { User } from '../../_models';

@Component({
  moduleId: module.id.toString(),
  selector: 'app-store',
  templateUrl: './store.component.html',
  styleUrls: ['./store.component.scss']
})

export class StoreComponent implements OnInit {
    form: FormGroup ;
    currentUser: User;
    loading = false;
    showLoader: boolean;
    submitted = false;
    error: any = '';
    success: any = '';
    companies: any = [];
    stores: any = [];
    store: any = null;
    companyId: any= 0;    
    companyName: string = "";
    static: any = null;
    order: string = 'name';
    reverse: boolean = false;
    selView: number =  -1;
    isForm: boolean= false;
    isNew: boolean= false;
    isEdit: boolean= false;
    logoUrl: string = '';
    isLogoProgress: boolean = false;

    hasBaseDropZoneOver: boolean = false;
    uploader: FileUploader;

    pageSize: number = 10;
    currentPage: number = 0;
    totalSize: number = 0;
    dataSource: any = [];
    pageEvent: PageEvent;

    constructor(
        private formBuilder: FormBuilder,
        private cloudinary: Cloudinary,
        private route: ActivatedRoute,
        private router: Router,
        private loaderService: LoaderService,
        private alertService: AlertService,
        private authenticationService: AuthenticationService
    ) { 
      this.companyId = this.route.snapshot.params.companyId;    
    }   

    ngOnInit() {

      this.form = this.formBuilder.group({
        id: ['0'],
        companyId: ['0'],
        storeId: ['', Validators.required],
        name: ['', Validators.required],
        uniqueUrl: [''],
        address1: [''],
        city: [''],
        state: [''],
        zipcode: [''],
        phone: [''],
        email: [''],
        websiteUrl: [''],
        calendarUrl: [''],
        contactFormUrl: [''],
        facebookUrl: [''],
        headerText: [''],
        footerText: [''],
        isActive: ['']
      });

      const uploaderOptions: FileUploaderOptions = {
        url: `https://api.cloudinary.com/v1_1/${this.cloudinary.config().cloud_name}/upload`,
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
        form.append('upload_preset', this.cloudinary.config().upload_preset);

        form.append('file', fileItem);
        fileItem.withCredentials = false;

        this.uploader.onCompleteItem = (item: any, response: string, status: number, headers: ParsedResponseHeaders) => {
            var objResponse = JSON.parse(response);
            this.logoUrl=objResponse.secure_url;
            this.isLogoProgress=false;
        }

        this.uploader.onProgressItem = (fileItem: any, progress: any) => {
          this.isLogoProgress=true;
        }

        return { fileItem, form };
      };

      this.authenticationService.currentUser.subscribe((x: any) => {
        this.currentUser = x;
      });

      this.loaderService.status.subscribe((val: boolean) => {
        setTimeout(() => this.showLoader = val, 0);
      });

      this.form.controls.companyId.setValue(this.companyId);      

      this.getCompanies(true);
    } 

    getCompanies(isLoad = false){

        this.loaderService.display(true);
        this.loading = true;
        this.authenticationService.getCompanies(this.currentUser.apikey)
                .pipe(first())
                .subscribe(
                    (data: any) => {
                        if(data != null){
                          this.companies=data;
                          this.error = "";
                          this.companyName = "";
                          if(this.companyId != 0){
                            this.getCompany();
                          }
                          else{
                            this.loading = false;
                            this.loaderService.display(false);
                          }
                        }
                        else{
                        this.companies = [];
                          this.companyName = "";
                          this.error = "No company found";
                          this.loading = false;
                          this.loaderService.display(false);
                        }
                    },
                    (error: any) => {
                        this.companies = [];
                        this.companyName = "";
                        this.error = error;
                        this.loading = false;
                        this.loaderService.display(false);
                    });
    }

    getCompany(){
      if(this.companyId != 0){
        this.loaderService.display(true);
        this.loading = true;
        this.authenticationService.getCompany(this.companyId, this.currentUser.apikey)
                .pipe(first())
                .subscribe(
                    (data: any) => {
                        if(data != null){
                          this.companyName=data.name;
                          this.error = "";
                          this.getStores();
                        }
                        else{
                          this.companyName = "";
                          this.error = "No company found";
                          this.loading = false;
                          this.loaderService.display(false);
                        }
                    },
                    (error: any) => {
                        this.companyName = "";
                        this.error = error;
                        this.loading = false;
                        this.loaderService.display(false);
                    });
      }
    }   

    changeCompany(e){
      if(e.target.value != ""){
        this.companyId = e.target.value;    
        this.getCompany();
      }
      else{   
        this.companyId = 0;
        this.companyName = "";
        this.stores = []; 
      }
    }

    resetCompany(){
      this.companyId = 0;
      this.companyName = ""; 
    } 

    getStores(){
      this.loaderService.display(true);
      this.loading = true;
      this.authenticationService.getCompanyStores(this.companyId, this.currentUser.apikey)
            .pipe(first())
            .subscribe(
                (data: any) => {
                    if(data != null && data.length > 0){
                        this.dataSource = data;
                        this.stores = data;

                        this.totalSize = this.dataSource.length;
                        this.iterator();
                        
                        this.loading = false;
                        this.loaderService.display(false);
                    }
                    else{
                        this.dataSource = [];
                        this.stores = [];
                        this.error = "no store found";
                        this.loading = false;
                        this.loaderService.display(false);
                    }
                },
                (error: any) => {
                    this.dataSource = [];
                    this.stores = [];
                    this.error = error;
                    this.loading = false;
                    this.loaderService.display(false);
                });
    }

    onSubmit(){  
      this.loaderService.display(true);
      this.submitted = true;
      this.success = "";
      this.error = "";

      if (this.form.invalid) {
        this.error = "Please fill required fields";
        this.loaderService.display(false);
        return;
      }

      this.loading = true;

      this.store = {
        Id: this.f.id.value,
        StoreId: this.f.storeId.value,
        CompanyId: this.companyId,
        Name: this.f.name.value,
        UniqueUrl: this.f.uniqueUrl.value,
        Address1: this.f.address1.value,
        City: this.f.city.value,
        State: this.f.state.value,
        Zipcode: this.f.zipcode.value,
        Phone: this.f.phone.value,
        Email: this.f.email.value,
        WebsiteUrl: this.f.websiteUrl.value,
        CalendarUrl: this.f.calendarUrl.value,
        ContactFormUrl: this.f.contactFormUrl.value,
        FacebookUrl: this.f.facebookUrl.value,
        LogoUrl: this.logoUrl,
        IsActive: (this.f.isActive.value==true)?1:0,
      };

      if(this.isNew){
        this.authenticationService.createStore(this.store, this.currentUser.apikey)
            .pipe(first())
            .subscribe(
                (data: any) => {
                  if(data != null && data.id > 0){
                    this.success = "store created!!!";
                    this.store = null;
                    this.isForm=!this.isForm;
                    this.isNew=false;
                    this.isEdit=false;
                    this.getStores();
                  }
                  else{
                    this.error = "error on store creation";
                    this.loading = false;
                    this.loaderService.display(false);
                  }
                },
                (error: any) => {
                    this.error = error;
                    this.loading = false;
                    this.loaderService.display(false);
                });
      }
      else{
        this.authenticationService.updateStore(this.store, this.currentUser.apikey)
            .pipe(first())
            .subscribe(
                (data: any) => {
                  if(data == null){
                    this.success = "store updated!!!";
                    this.store = null;
                    this.isForm=!this.isForm;
                    this.isNew=false;
                    this.isEdit=false;
                    this.getStores();
                  }
                  else{
                    this.error = "error on store updated";
                    this.loading = false;
                    this.loaderService.display(false);
                  }
                },
                (error: any) => {
                    this.error = error;
                    this.loading = false;
                    this.loaderService.display(false);
                });
      }
    }

    removeStore(Id: number) {
      if(confirm('Are you sure you want to delete this store?')){
        this.loaderService.display(true);
        this.authenticationService.deleteStore(Id)
          .pipe(first())
          .subscribe(
              (data: any) => {
                  if(data != null && data.id > 0){ 
                    this.success = "store deleted!!!";  
                    this.loading = false;
                    this.loaderService.display(false);                    
                    this.stores = this.stores.filter(({ id }: any) => id !== Id); 
                  }
                  else{
                    this.loading = false;
                    this.loaderService.display(false);
                    this.error = "error on store deletion";
                  }
              },
              (error: any) => {
                  this.loading = false;
                  this.loaderService.display(false);
                  this.error = error;
              });
      }
    }

    edit(store: any){
      this.success = "";
      this.error = "";
      this.isForm=!this.isForm;
      this.isNew=false;
      this.isEdit=true;

      this.store= store;

      this.logoUrl=this.store.logoUrl;
      this.form.controls.id.setValue(this.store.id);
      this.form.controls.storeId.setValue(this.store.storeId);
      this.form.controls.name.setValue(this.store.name);
      this.form.controls.uniqueUrl.setValue(this.store.uniqueUrl);
      this.form.controls.address1.setValue(this.store.address1);
      this.form.controls.city.setValue(this.store.city);
      this.form.controls.state.setValue(this.store.state);
      this.form.controls.zipcode.setValue(this.store.zipcode);
      this.form.controls.phone.setValue(this.store.phone);
      this.form.controls.email.setValue(this.store.email);
      this.form.controls.websiteUrl.setValue(this.store.websiteUrl);
      this.form.controls.calendarUrl.setValue(this.store.calendarUrl);
      this.form.controls.contactFormUrl.setValue(this.store.contactFormUrl);
      this.form.controls.facebookUrl.setValue(this.store.facebookUrl);
      this.form.controls.isActive.setValue(this.store.isActive);
    }

    new(){
      this.success = "";
      this.error = "";
      this.isForm=!this.isForm;
      this.isNew=true;
      this.isEdit=false;

      this.store= null;

      this.logoUrl='';
      this.form.controls.id.setValue(0);
      this.form.controls.storeId.setValue('');
      this.form.controls.name.setValue('');
      this.form.controls.uniqueUrl.setValue('');
      this.form.controls.address1.setValue('');
      this.form.controls.city.setValue('');
      this.form.controls.state.setValue('');
      this.form.controls.zipcode.setValue('');
      this.form.controls.phone.setValue('');
      this.form.controls.email.setValue('');
      this.form.controls.websiteUrl.setValue('');
      this.form.controls.calendarUrl.setValue('');
      this.form.controls.contactFormUrl.setValue('');
      this.form.controls.facebookUrl.setValue('');
      this.form.controls.isActive.setValue('');
    }

    close(){
      this.success = "";
      this.error = "";
      this.isForm=!this.isForm;
      this.isNew=false;
      this.isEdit=false;

      this.store= null;

      this.logoUrl='';
      this.form.controls.id.setValue(0);
      this.form.controls.storeId.setValue('');
      this.form.controls.name.setValue('');
      this.form.controls.uniqueUrl.setValue('');
      this.form.controls.address1.setValue('');
      this.form.controls.city.setValue('');
      this.form.controls.state.setValue('');
      this.form.controls.zipcode.setValue('');
      this.form.controls.phone.setValue('');
      this.form.controls.email.setValue('');
      this.form.controls.websiteUrl.setValue('');
      this.form.controls.calendarUrl.setValue('');
      this.form.controls.contactFormUrl.setValue('');
      this.form.controls.facebookUrl.setValue('');
      this.form.controls.isActive.setValue('');
    }

    formatDate(value: any){
      var customDate = new Date(value.match(/\d+/)[0] * 1);  
      return  customDate;
    }

    setOrder(value: string) {
      if (this.order === value) {
        this.reverse = !this.reverse;
      }

      this.order = value;
    }

    encode(value: string){
      return encodeURI(value);
    }   

    // convenience getter for easy access to form fields
    get f() { return this.form.controls; }

    fileOverBase(e: any): void {
      this.hasBaseDropZoneOver = e;
    }

    public handlePage(e: any) {
      this.pageEvent = e;
      this.currentPage = e.pageIndex;
      this.pageSize = e.pageSize;
      this.iterator();
      return this.pageEvent;
    }

    private iterator() {
      const end = (this.currentPage + 1) * this.pageSize;
      const start = this.currentPage * this.pageSize;
      const part = this.dataSource.slice(start, end);
      this.stores = part;
    }
}