import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { formatDate } from "@angular/common";
import { Router, ActivatedRoute, RouterStateSnapshot } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Color } from '@angular-material-components/color-picker';
import { first } from 'rxjs/operators';

import { DeviceDetectorService } from 'ngx-device-detector';

import { AuthenticationService, LoaderService, WindowService } from '../../_services';
import { ModalService } from '../../_modal';

@Component({
  moduleId: module.id.toString(),
  selector: 'app-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss']
})

export class ViewComponent implements OnInit {
    @ViewChild("userHtml", { static: false }) module8;
    loading = false;
    loading1 = false;
    showLoader: boolean;
    submitted: boolean = false;
    submitted1: boolean = false;
    campaignStore: any = '';
    minDate: any;
    error: any = '';
    success: any = '';
    error1: any = '';
    success1: any = '';
    error2: any = '';
    success2: any = '';
    shortCode: string = '';
    module1: string = '';
    module2: string = '';
    module3: string = '';
    module4: string = '';
    module5: string = '';
    module6: string = '';
    module7: string = '';
    storeModule1: string = '';
    storeModule2: string = '';
    storeModule3: string = '';
    storeModule4: string = '';
    storeModule5: string = '';
    storeModule6: string = '';
    storeModule7: string = '';
    storeModule8: string = '';
    IpAddress: string = '';
    browser: string = '';
    Os: string = '';
    storeEmail: string = '';
    storeId: number = 0;
    moduleId: number = 0;
    campaignStoreModuleId: number = 0;
    campaignId: number = 0;
    campaignStoreId: number = 0;
    selSize: number = 2;
    formContact: FormGroup;
    formCalendar: FormGroup;

    constructor(
        private deviceService: DeviceDetectorService,
        private windowService: WindowService,
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private loaderService: LoaderService,
        private modalService: ModalService,
        private authenticationService: AuthenticationService
    ) { 
      this.shortCode = this.route.snapshot.params.shortcode; 
      this.browser = this.deviceService.getDeviceInfo().browser; 
      this.Os = this.deviceService.getDeviceInfo().os + ' ' + this.deviceService.getDeviceInfo().os_version; 
    }   

    ngOnInit() {
        this.loaderService.status.subscribe((val: boolean) => {
            setTimeout(() => this.showLoader = val, 0);
        });

        this.authenticationService.getIPAddress()
            .pipe(first())
            .subscribe(
              (data: any) => {
                this.IpAddress = data;
                console.log(data);
              },
              (error: any) => {
              });

        this.formContact = this.formBuilder.group({
          firstname: ['', Validators.required],
          lastname: ['', Validators.required],
          email: ['', Validators.required],
          message: [''],
        });

        this.formCalendar = this.formBuilder.group({
          date: ['', Validators.required],
          time: ['', Validators.required],
          firstname: ['', Validators.required],
          lastname: ['', Validators.required],
          email: ['', Validators.required],
        });

        this.minDate = new Date();

        if(this.shortCode != null){
            this.getCampaignStoreByShortCode(); 
        }
    }

    getCampaignStoreByShortCode(){
        this.loaderService.display(true);
        this.loading = true;
        this.error = '';
        this.success = '';
        this.authenticationService.getCampaignStoreByShortCode(this.shortCode)
            .pipe(first())
            .subscribe(
              (data: any) => {
                if(data != null && data.id > 0){
                    this.campaignStore = data;
                    this.storeId =  this.campaignStore.store.id;
                    this.moduleId =  this.campaignStore.campaign.id;
                    this.campaignStoreModuleId =  this.campaignStore.campaign.id;
                    this.campaignId =  this.campaignStore.campaign.id;
                    this.campaignStoreId =  this.campaignStore.id;
                    this.storeEmail = this.campaignStore.store.email;

                    if(this.campaignStore.campaign != null){
                        let currDate = formatDate(new Date(),'yyyy-MM-dd','en_US');
                        let startDate = formatDate(this.campaignStore.campaign.startDate,'yyyy-MM-dd','en_US');
                        let endDate = formatDate(this.campaignStore.campaign.endDate,'yyyy-MM-dd','en_US');
                        if(this.campaignStore.campaign.isActive == 0){
                            this.error = "Campaign is not active";
                        }
                        else if(startDate > currDate){                            
                            this.error = "Campaign will start on " + formatDate(startDate,'MM-dd-yyyy','en_US');
                        }
                        else if(endDate < currDate){
                            this.error = "Campaign expired on " + formatDate(endDate,'MM-dd-yyyy','en_US');
                        }
                        else{          
                            if(this.campaignStore.campaignStoreModules != null && this.campaignStore.campaignStoreModules.length > 0){
                                this.campaignStore.campaignStoreModules.forEach(item => {
                                        if(item.moduleId == 1 && item.content != ""){
                                            this.module1 = item.content;
                                            this.storeModule1 = item.id;
                                        }
                                        if(item.moduleId == 3 && item.content != ""){
                                            this.module2 = item.content;
                                            this.storeModule2 = item.id;
                                        }
                                        if(item.moduleId == 4 && item.content != ""){
                                            this.module3 = item.content;
                                            this.storeModule3 = item.id;
                                        }
                                        if(item.moduleId == 5 && item.content != ""){
                                            this.module4 = item.content;
                                            this.storeModule4 = item.id;
                                        }
                                        if(item.moduleId == 6 && item.content != ""){
                                            this.module5 = item.content;
                                            this.storeModule5 = item.id;
                                        }
                                        if(item.moduleId == 7 && item.content != ""){
                                            this.module6 = item.content;
                                            this.storeModule6 = item.id;
                                        }
                                        if(item.moduleId == 8 && item.content != ""){
                                            this.module7 = item.content;
                                            this.storeModule7 = item.id;
                                        }
                                        if(item.moduleId == 9 && item.content != ""){
                                            if(item.content.startsWith("id=")){
                                                let contentBlockIdStr=item.content.split('='); 
                                                if (contentBlockIdStr.Length > 1 && contentBlockIdStr[1] != ""){
                                                    let contentBlockId = parseInt(contentBlockIdStr[1]);         
                                                }          
                                            }
                                            else{
                                                this.module8 = item.content;
                                                this.storeModule8 = item.id;
                                            }
                                        }
                                });
                            }     
                        }
                    }
                  this.loading = false;
                  this.loaderService.display(false);
                }
                else{
                  this.campaignStore = null;
                  this.error = "invalid campaign";
                  this.loading = false;
                  this.loaderService.display(false);
                  }
              },
              (error: any) => {
                this.campaignStore = null;
                this.error = error;
                this.loading = false;
                this.loaderService.display(false);
              });
    }

    onContactSubmit(){  
          this.loaderService.display(true);
          this.submitted = true;
          this.success1 = "";
          this.error1 = "";

          if (this.formContact.invalid) {
            this.error1 = "Please fill required fields";
            this.loaderService.display(false);
            return;
        }

        this.loading = true;

        let contactUs = {
            storeEmail: this.storeEmail,
            id: this.campaignId,
            campaignStoreId: this.campaignStoreId,
            firstname: this.f.firstname.value,
            lastname: this.f.lastname.value,
            email: this.f.email.value,
            message: this.f.message.value
        };

        this.authenticationService.sendContact(contactUs)
            .pipe(first())
            .subscribe(
                (data: any) => {
                    if(data != null){
                        this.success1 = "Email Sent!!!";
                        this.modalService.open('ContactFormModal');
                        this.formContact.controls.message.setValue('');
                        this.formContact.controls.firstname.setValue('');
                        this.formContact.controls.lastname.setValue('');
                        this.formContact.controls.email.setValue('');
                    }
                    else{
                        this.error1 = "error while sending email";
                    }
                    this.submitted = false;
                    this.loading = false;
                    this.loaderService.display(false);
                },
                (error: any) => {
                    this.error1 = error;
                    this.loading = false;
                    this.submitted = false;
                    this.loaderService.display(false);
                });      
    }  

    onCalendarSubmit(){  
        this.loaderService.display(true);
        this.submitted1 = true;
        this.success2 = "";
        this.error2 = "";

        if (this.formCalendar.invalid) {
            this.error2 = "Please fill required fields";
            this.loaderService.display(false);
            return;
        }

        this.loading1 = true;

        let calendar = {
            storeEmail: this.storeEmail,
            id: this.campaignId,
            campaignStoreId: this.campaignStoreId,
            date: this.f1.date.value,
            time: this.f1.time.value,
            firstname: this.f1.firstname.value,
            lastname: this.f1.lastname.value,
            email: this.f1.email.value
        };

        this.authenticationService.sendCalendar(calendar)
            .pipe(first())
            .subscribe(
                (data: any) => {
                    if(data != null){
                        this.success2 = "Email Sent!!!";
                        this.modalService.open('CalendarFormModal');
                        this.formCalendar.controls.date.setValue('');
                        this.formCalendar.controls.time.setValue('');
                        this.formCalendar.controls.firstname.setValue('');
                        this.formCalendar.controls.lastname.setValue('');
                        this.formCalendar.controls.email.setValue('');
                    }
                    else{
                        this.error2 = "error while sending email";
                    }
                    this.submitted1 = false;
                    this.loading1 = false;
                    this.loaderService.display(false);
                },
                (error: any) => {
                    this.error2 = error;
                    this.loading1 = false;
                    this.submitted1 = false;
                    this.loaderService.display(false);
                });      
    }  

    closeModal(id: string) {
        this.modalService.close(id);
        this.success1 = "";
        this.success2 = "";
    }

    // convenience getter for easy access to form fields
    get f() { return this.formContact.controls; }  

    // convenience getter for easy access to form fields
    get f1() { return this.formCalendar.controls; }

    hexToRGB(hex: any, alpha: any) {
      if(hex != null && hex != ''){
        hex = hex.replace('#','');
        var r = parseInt(hex.substring(0,2), 16);
        var g = parseInt(hex.substring(2,4), 16);
        var b = parseInt(hex.substring(4,6), 16);

        if (alpha) {
            return new Color(r, g, b, alpha/100);
        } else {
            return new Color(r, g, b);
        }
      }
      else{
        return '';
      }
    }

    gotUrl(url, moduleId, storeModule){
        this.loaderService.display(true);

        let calendar = {
            CampaignId: this.campaignId,
            StoreId: this.storeId,
            ModuleId: moduleId,
            CampaignStoreId: this.campaignStoreId,
            CampaignStoreModuleId: storeModule,
            Browser: this.browser,
            IpAddress: this.IpAddress,
            Os: this.Os,
        };

        this.authenticationService.createCampaignStatistic(calendar)
            .pipe(first())
            .subscribe(
                (data: any) => {
                    if(data != null){
                        this.windowService.nativeWindow.open(url, "_blank");
                    }
                    else{
                        this.error2 = "error while sending email";
                    }
                    this.loaderService.display(false);
                },
                (error: any) => {
                    this.loaderService.display(false);
                }); 

    }
}