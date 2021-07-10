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
  selector: 'app-contentblock',
  templateUrl: './contentblock.component.html',
  styleUrls: ['./contentblock.component.scss']
})

export class ContentBlockComponent implements OnInit {
    form: FormGroup ;
    currentUser: User;
    loading = false;
    showLoader: boolean;
    submitted = false;
    error: any = '';
    success: any = '';
    contentBlocks: any = [];
    contentBlock: any = null;
    order: string = 'id';
    reverse: boolean = false;
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
    
    }   

    ngOnInit() {

      this.form = this.formBuilder.group({
            id: ['0'],
            name: [''],
            content: ['', Validators.required]
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

        this.getContentBlocks();
    }

    getContentBlocks(){
      this.loaderService.display(true);
      this.loading = true;
      this.authenticationService.getContentBlocks(this.currentUser.apikey)
            .pipe(first())
            .subscribe(
              (data: any) => {
                if(data != null && data.length > 0){
                  this.dataSource = data;
                  this.contentBlocks = data;

                  this.totalSize = this.dataSource.length;
                  this.iterator();
                        
                  this.loading = false;
                  this.loaderService.display(false);
                }
                else{
                  this.dataSource = [];
                  this.contentBlocks = [];
                  this.error = "no content block found";
                  this.loading = false;
                  this.loaderService.display(false);
                  }
              },
              (error: any) => {
                this.dataSource = [];
                this.contentBlocks = [];
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

      this.contentBlock = {
        Id: this.f.id.value,
        Name: this.f.name.value,
        Content: this.f.content.value
      };

      if(this.isNew){
        this.authenticationService.createContentBlock(this.contentBlock, this.currentUser.apikey)
            .pipe(first())
            .subscribe(
                (data: any) => {
                  if(data != null && data.id > 0){
                    this.success = "content block created!!!";
                    this.contentBlock = null;
                    this.isForm=!this.isForm;
                    this.isNew=false;
                    this.isEdit=false;
                    this.getContentBlocks();
                  }
                  else{
                    this.error = "error on content block creation";
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
        this.authenticationService.updateContentBlock(this.contentBlock, this.currentUser.apikey)
            .pipe(first())
            .subscribe(
                (data: any) => {
                  if(data == null){
                    this.success = "content block updated!!!";
                    this.contentBlock = null;
                    this.loading = false;
                    this.loaderService.display(false);
                    this.isForm=!this.isForm;
                    this.isNew=false;
                    this.isEdit=false;
                    this.getContentBlocks();
                  }
                  else{
                    this.error = "error on content block updated";
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

    removeContentBlock(Id: number) {
      if(confirm('Are you sure you want to delete this content block?')){
        this.loaderService.display(true);

        this.authenticationService.deleteContentBlock(Id)
          .pipe(first())
          .subscribe(
              (data: any) => {
                  if(data != null && data.id > 0){ 
                    this.success = "content block deleted!!!";
                    this.loading = false;
                    this.loaderService.display(false);                    
                    this.contentBlocks = this.contentBlocks.filter(({ id }: any) => id !== Id); 
                  }
                  else{
                    this.loading = false;
                    this.loaderService.display(false);
                    this.error = "error on content block deletion";
                  }
              },
              (error: any) => {
                  this.loading = false;
                  this.loaderService.display(false);
              });
      }
    }

    edit(contentBlock: any){
      this.success = "";
      this.error = "";
      this.isForm=!this.isForm;
      this.isNew=false;
      this.isEdit=true;

      this.contentBlock= contentBlock;

      this.form.controls.id.setValue(this.contentBlock.id);
      this.form.controls.name.setValue(this.contentBlock.name);
      this.form.controls.content.setValue(this.contentBlock.content);
    }

    new(){
      this.success = "";
      this.error = "";
      this.isForm=!this.isForm;
      this.isNew=true;
      this.isEdit=false;

      this.logoUrl='';

      this.contentBlock= null;
      this.form.controls.id.setValue(0);
      this.form.controls.name.setValue('');
      this.form.controls.content.setValue('<div class="pnlProductDetail"><h1>Bogo 1/2 OFF</h1><p><span>Buy one get one 1/2 off</span></p><p><span>Aug 1 - Aug 25, 2021</span></p><p><span>Promo Code: <b>12ADIDAS21</b></span></p></div><div class="pnlProductImage"><img src="https://res.cloudinary.com/passbee/image/upload/v1624298021/rdsbsywzhuqkdzstrkxx.png" alt="" width="448px"></div>');
    }

    close(){
      this.success = "";
      this.error = "";
      this.isForm=!this.isForm;
      this.isNew=false;
      this.isEdit=false;

      this.logoUrl='';

      this.contentBlock= null;
      this.form.controls.id.setValue(0);
      this.form.controls.name.setValue('');
      this.form.controls.content.setValue('');
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

    insertImage(){
      var content = this.f.content.value;
      var isImgUrl= /src\s*=\s*(['"])(https?:\/\/.*\.(?:png|jpg|gif))\1/gi;
      content = content.replace(isImgUrl, "src='"+this.logoUrl+"'");
      this.form.controls.content.setValue(content);
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
      this.contentBlocks = part;
    }
}