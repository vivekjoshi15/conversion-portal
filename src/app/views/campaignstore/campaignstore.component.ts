import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ThemePalette } from '@angular/material/core';
import { first } from 'rxjs/operators';
import { PageEvent } from '@angular/material/paginator';

import { AuthenticationService, LoaderService, AppService } from '../../_services';
import { User, CampaignStoreData } from '../../_models';

@Component({
  moduleId: module.id.toString(),
  selector: 'app-campaignstore',
  templateUrl: './campaignstore.component.html',
  styleUrls: ['./campaignstore.component.scss']
})

export class CampaignStoreComponent implements OnInit {
    form: FormGroup ;
    currentUser: User;
    loading = false;
    showLoader: boolean;
    submitted = false;
    error: any = '';
    success: any = '';
    id: number = 0;
    companyId: any= 0;    
    campaignName: string = "";
    campaigns: any = [];
    stats: any = [];
    campaign: any = null;
    static: any = null;
    order: string = 'storeId';
    reverse: boolean = false;
    selView: number =  -1;
    isForm: boolean= false;
    isNew: boolean= false;
    isEdit: boolean= false;
    isReport: boolean= false;

    pageSize: number = 10;
    currentPage: number = 0;
    totalSize: number = 0;
    dataSource: any = [];
    pageEvent: PageEvent;

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private appService: AppService,
        private loaderService: LoaderService,
        private authenticationService: AuthenticationService
    ) { 
      this.id = this.route.snapshot.params.id;
      this.companyId = this.route.snapshot.params.companyId;
    }   

    ngOnInit() {

      this.form = this.formBuilder.group({
        id: ['0'],
        storeId: ['', Validators.required],
        uniqueUrl: ['', Validators.required],
        module1: [''],
        module2: [''],
        module3: [''],
        module4: [''],
        module5: [''],
        module6: [''],
        module7: [''],
        module8: [''],
        isActive: ['']
      });

      this.authenticationService.currentUser.subscribe((x: any) => {
        this.currentUser = x;
      });

      this.loaderService.status.subscribe((val: boolean) => {
        setTimeout(() => this.showLoader = val, 0);
      });

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
                            this.getCampaignStores();
                            this.error = "";
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

    getCampaignStores(){
      this.loaderService.display(true);
      this.loading = true;
      this.authenticationService.getCampaignStores(this.companyId, this.id, this.currentUser.apikey)
            .pipe(first())
            .subscribe(
                (data: any) => {
                    if(data != null && data.length > 0){
                        this.dataSource = data;
                        this.campaigns = data;

                        this.totalSize = this.dataSource.length;
                        this.iterator();

                        this.loading = false;
                        this.loaderService.display(false);
                    }
                    else{
                        this.dataSource = [];
                        this.campaigns = [];
                        this.error = "no campaign store found";
                        this.loading = false;
                        this.loaderService.display(false);
                    }
                },
                (error: any) => {
                    this.dataSource = [];
                    this.campaigns = [];
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

      let campaign: CampaignStoreData= {
        Id: this.f.id.value,
        CampaignId: this.id,
        StoreId: this.f.storeId.value,
        UniqueUrl: this.f.uniqueUrl.value,
        Module1: this.f.module1.value,
        Module2: this.f.module2.value,
        Module3: this.f.module3.value,
        Module4: this.f.module4.value,
        Module5: this.f.module5.value,
        Module6: this.f.module6.value,
        Module7: this.f.module7.value,
        Module8: this.f.module8.value,
        IsActive: (this.f.isActive.value==true)?1:0,
      };

      if(this.isNew){
        this.authenticationService.createCampaignStore(campaign, this.currentUser.apikey)
            .pipe(first())
            .subscribe(
                (data: any) => {
                  if(data != null && data.id > 0){
                    this.success = "campaign store created!!!";
                    this.campaign = null;
                    this.isForm=!this.isForm;
                    this.isNew=false;
                    this.isEdit=false;
                    this.isReport=false;
                    this.getCampaignStores();
                  }
                  else{
                    this.error = "error on campaign store creation";
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
        this.authenticationService.updateCampaignStore(campaign, this.currentUser.apikey)
            .pipe(first())
            .subscribe(
                (data: any) => {
                  if(data == null){
                    this.success = "campaign store updated!!!";
                    this.campaign = null;
                    this.isForm=!this.isForm;
                    this.isNew=false;
                    this.isEdit=false;
                    this.isReport=false;
                    this.getCampaignStores();
                  }
                  else{
                    this.error = "error on campaign store updated";
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

    removeCampaign(Id: number) {
      if(confirm('Are you sure you want to delete this campaign store?')){
        this.loaderService.display(true);
        this.authenticationService.deleteCampaignStore(Id)
          .pipe(first())
          .subscribe(
              (data: any) => {
                  if(data != null && data.id > 0){    
                    this.success = "campaign store deleted!!!";   
                    this.loading = false;
                    this.loaderService.display(false);          
                     this.dataSource = this.dataSource.filter(({ id }: any) => id !== Id);   
                     this.campaigns = this.dataSource; 
                  }
                  else{
                    this.loading = false;
                    this.loaderService.display(false);
                    this.error = "error on campaign store deletion";
                  }
              },
              (error: any) => {
                  this.loading = false;
                  this.loaderService.display(false);
                  this.error = error;
              });
      }
    }

    edit(campaign: any){
      this.success = "";
      this.error = "";
      this.isForm=!this.isForm;
      this.isNew=false;
      this.isEdit=true;
      this.isReport=false;

      this.campaign= campaign;

      this.form.controls.id.setValue(this.campaign.id);
      this.form.controls.storeId.setValue(this.campaign.storeId);
      this.form.controls.uniqueUrl.setValue(this.campaign.uniqueUrl);
      this.form.controls.module1.setValue(this.campaign.module1);
      this.form.controls.module2.setValue(this.campaign.module2);
      this.form.controls.module3.setValue(this.campaign.module3);
      this.form.controls.module4.setValue(this.campaign.module4);
      this.form.controls.module5.setValue(this.campaign.module5);
      this.form.controls.module6.setValue(this.campaign.module6);
      this.form.controls.module7.setValue(this.campaign.module7);
      this.form.controls.module8.setValue(this.campaign.module8);
      this.form.controls.isActive.setValue(this.campaign.isActive);
    }

    viewReport(Id: number){

      this.success = "";
      this.error = "";
      this.isForm=!this.isForm;
      this.isNew=false;
      this.isEdit=false;
      this.isReport = true;

      this.campaign= null;

      this.form.controls.id.setValue(0);
      this.form.controls.storeId.setValue('');
      this.form.controls.uniqueUrl.setValue('');
      this.form.controls.module1.setValue('');
      this.form.controls.module2.setValue('');
      this.form.controls.module3.setValue('');
      this.form.controls.module4.setValue('');
      this.form.controls.module5.setValue('');
      this.form.controls.module6.setValue('');
      this.form.controls.module7.setValue('');
      this.form.controls.module8.setValue('');
      this.form.controls.isActive.setValue('');

      if(Id != 0){
            this.loading = true;
            this.loaderService.display(true);
            this.authenticationService.getCampaignStatisticById(Id, this.currentUser.apikey)
                .pipe(first())
                .subscribe(
                    (data: any) => {
                        if(data != null && data.length > 0){
                            this.stats = data;
                            this.error = "";
                            this.loading = false;
                            this.loaderService.display(false);
                        }
                        else{
                            this.stats = [];
                            this.error = "No statistic found";
                            this.loading = false;
                            this.loaderService.display(false);
                        }
                    },
                    (error: any) => {
                        this.stats = [];
                        this.error = error;
                        this.loading = false;
                        this.loaderService.display(false);
                    });
        }
    }

    new(){
      this.success = "";
      this.error = "";
      this.isForm=!this.isForm;
      this.isNew=true;
      this.isEdit=false;
      this.isReport=false;

      this.campaign = null;

      this.form.controls.id.setValue(0);
      this.form.controls.storeId.setValue('');
      this.form.controls.uniqueUrl.setValue('');
      this.form.controls.module1.setValue('');
      this.form.controls.module2.setValue('');
      this.form.controls.module3.setValue('');
      this.form.controls.module4.setValue('');
      this.form.controls.module5.setValue('');
      this.form.controls.module6.setValue('');
      this.form.controls.module7.setValue('');
      this.form.controls.module8.setValue('');
      this.form.controls.isActive.setValue('');
    }

    close(){
      this.success = "";
      this.error = "";
      this.isForm=!this.isForm;
      this.isNew=false;
      this.isEdit=false;
      this.isReport=false;

      this.campaign = null;

      this.form.controls.id.setValue(0);
      this.form.controls.storeId.setValue('');
      this.form.controls.uniqueUrl.setValue('');
      this.form.controls.module1.setValue('');
      this.form.controls.module2.setValue('');
      this.form.controls.module3.setValue('');
      this.form.controls.module4.setValue('');
      this.form.controls.module5.setValue('');
      this.form.controls.module6.setValue('');
      this.form.controls.module7.setValue('');
      this.form.controls.module8.setValue('');
      this.form.controls.isActive.setValue('');
    }

    back(){
      this.success = "";
      this.error = "";
      this.isForm=!this.isForm;
      this.isNew=false;
      this.isEdit=false;
      this.isReport=false;

      this.campaign = null;
      this.stats = [];      
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

    goto(){
      this.router.navigate(["campaigns/" + this.companyId]);
    }

    downloadCSV(){
      let headerList: any= ['storeId', 'uniqueUrl'];//,'Shop Online','Contact Form','Download a offer','Location Directions','Book Appointment','Open an account','Signup for an event','Content Block'];
      this.appService.downloadFile(this.campaigns, headerList, 'campaignstore');
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
      this.campaigns = part;
    }
}