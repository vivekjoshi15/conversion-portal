import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';
import { FileUploader, FileUploaderOptions, ParsedResponseHeaders } from 'ng2-file-upload';
import { Cloudinary } from '@cloudinary/angular-5.x';

import { environment } from '../../../environments/environment';
import { AuthenticationService, LoaderService, AlertService } from '../../_services';
import { User } from '../../_models';

@Component({
  moduleId: module.id.toString(),
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})

export class HomeComponent implements OnInit {
    form: FormGroup ;
    currentUser: User;
    loading = false;
    showLoader: boolean;
    submitted = false;
    error: any = '';
    success: any = '';
    companies: any = [];
    company: any = null;
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

    constructor(
        private formBuilder: FormBuilder,
        private cloudinary: Cloudinary,
        private route: ActivatedRoute,
        private router: Router,
        private loaderService: LoaderService,
        private alertService: AlertService,
        private authenticationService: AuthenticationService
    ) { 
    
    }   

    ngOnInit() {

      this.form = this.formBuilder.group({
        id: ['0'],
        name: ['', Validators.required],
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

      this.getCompanies();
    }

    getCompanies(){
      this.loaderService.display(true);
      this.loading = true;
      this.authenticationService.getCompanies(this.currentUser.apikey)
            .pipe(first())
            .subscribe(
                (data: any) => {
                    if(data != null && data.length > 0){
                      this.companies = data;
                      this.loading = false;
                      this.loaderService.display(false);
                    }
                    else{
                      this.companies = [];
                      this.error = "no company found";
                      this.loading = false;
                      this.loaderService.display(false);
                    }
                },
                (error: any) => {
                    this.companies = [];
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

      this.company = {
        Id: this.f.id.value,
        Name: this.f.name.value,
        WebsiteUrl: this.f.websiteUrl.value,
        CalendarUrl: this.f.calendarUrl.value,
        ContactFormUrl: this.f.contactFormUrl.value,
        FacebookUrl: this.f.facebookUrl.value,
        HeaderText: this.f.headerText.value,
        FooterText: this.f.footerText.value,
        LogoUrl: this.logoUrl,
        IsActive: (this.f.isActive.value==true)?1:0,
      };

      if(this.isNew){
        this.authenticationService.createCompany(this.company, this.currentUser.apikey)
            .pipe(first())
            .subscribe(
                (data: any) => {
                  if(data != null && data.id > 0){
                    this.success = "company created!!!";
                    this.company = null;
                    this.isForm=!this.isForm;
                    this.isNew=false;
                    this.isEdit=false;
                    this.getCompanies();
                  }
                  else{
                    this.error = "error on company creation";
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
        this.authenticationService.updateCompany(this.company, this.currentUser.apikey)
            .pipe(first())
            .subscribe(
                (data: any) => {
                  if(data == null){
                    this.success = "company updated!!!";
                    this.company = null;
                    this.isForm=!this.isForm;
                    this.isNew=false;
                    this.isEdit=false;
                    this.getCompanies();
                  }
                  else{
                    this.error = "error on company updated";
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

    removeCompany(Id: number) {
      if(confirm('Are you sure you want to delete this company?')){
        this.loaderService.display(true);
        this.authenticationService.deleteCompany(Id)
          .pipe(first())
          .subscribe(
              (data: any) => {
                  if(data != null && data.id > 0){ 
                    this.success = "company deleted!!!";
                    this.loading = false;
                    this.loaderService.display(false);                    
                    this.companies = this.companies.filter(({ id }: any) => id !== Id); 
                  }
                  else{
                    this.loading = false;
                    this.loaderService.display(false);
                    this.error = "error on company deletion";
                  }
              },
              (error: any) => {
                  this.loading = false;
                  this.loaderService.display(false);
                  this.error = error;
              });
      }
    }

    edit(company: any){
      this.success = "";
      this.error = "";
      this.isForm=!this.isForm;
      this.isNew=false;
      this.isEdit=true;

      this.company= company;

      this.logoUrl=this.company.logoUrl;
      this.form.controls.id.setValue(this.company.id);
      this.form.controls.name.setValue(this.company.name);
      this.form.controls.websiteUrl.setValue(this.company.websiteUrl);
      this.form.controls.calendarUrl.setValue(this.company.calendarUrl);
      this.form.controls.contactFormUrl.setValue(this.company.contactFormUrl);
      this.form.controls.facebookUrl.setValue(this.company.facebookUrl);
      this.form.controls.headerText.setValue(this.company.headerText);
      this.form.controls.footerText.setValue(this.company.footerText);
      this.form.controls.isActive.setValue(this.company.isActive);
    }

    new(){
      this.success = "";
      this.error = "";
      this.isForm=!this.isForm;
      this.isNew=true;
      this.isEdit=false;

      this.company= null;

      this.logoUrl='';
      this.form.controls.id.setValue(0);
      this.form.controls.name.setValue('');
      this.form.controls.websiteUrl.setValue('');
      this.form.controls.calendarUrl.setValue('');
      this.form.controls.contactFormUrl.setValue('');
      this.form.controls.facebookUrl.setValue('');
      this.form.controls.headerText.setValue('');
      this.form.controls.footerText.setValue('');
      this.form.controls.isActive.setValue('');
    }

    close(){
      this.success = "";
      this.error = "";
      this.isForm=!this.isForm;
      this.isNew=false;
      this.isEdit=false;

      this.company= null;

      this.logoUrl='';
      this.form.controls.id.setValue(0);
      this.form.controls.name.setValue('');
      this.form.controls.websiteUrl.setValue('');
      this.form.controls.calendarUrl.setValue('');
      this.form.controls.contactFormUrl.setValue('');
      this.form.controls.facebookUrl.setValue('');
      this.form.controls.headerText.setValue('');
      this.form.controls.footerText.setValue('');
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
}