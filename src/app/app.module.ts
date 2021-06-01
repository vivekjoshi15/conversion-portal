import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { HttpClientModule, HTTP_INTERCEPTORS, HttpClientJsonpModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {LocationStrategy, HashLocationStrategy, DatePipe} from '@angular/common';

import { MAT_COLOR_FORMATS, NgxMatColorPickerModule, NGX_MAT_COLOR_FORMATS } from '@angular-material-components/color-picker';

import { OrderModule } from 'ngx-order-pipe';
import { FileUploadModule } from 'ng2-file-upload';
import { Cloudinary as CloudinaryCore } from 'cloudinary-core';
import { CloudinaryModule, CloudinaryConfiguration } from '@cloudinary/angular-5.x';
import { NgxIntlTelInputModule } from 'ngx-intl-tel-input';

import { cloudinaryConfiguration } from '../environments/environment';

export const cloudinary = {
  Cloudinary: CloudinaryCore
};
export const config: CloudinaryConfiguration = cloudinaryConfiguration;

// used to create fake backend
import { fakeBackendProvider } from './_helpers';
import { BasicAuthInterceptor, ErrorInterceptor } from './_helpers';
import { TimeoutInterceptor, DEFAULT_TIMEOUT } from './_helpers/angular-interceptor';
import { HttpService, AlertService, LoaderService, WindowService, PrintingService, SafeHtmlPipe, SortByPipe, DownloadService } from './_services';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { HeaderComponent } from './shared/header';
import { HeaderSecureComponent } from './shared/header-secure';
import { FooterComponent } from './shared/footer';
import { ForgotPasswordComponent } from './views/forgotpassword';
import { LoginComponent } from './views/login';
import { ResetComponent } from './views/reset';
import { SignupComponent } from './views/signup';
import { HomeComponent } from './views/home';
import { ProfileComponent } from './views/profile';
import { SettingsComponent } from './views/settings';
import { ReportsComponent } from './views/reports';
import { StoreComponent } from './views/store';
import { ModuleComponent } from './views/module';
import { CampaignComponent } from './views/campaign';
import { BulkStoreUploadComponent } from './views/bulkstoreupload';
import { BulkCampaignStoreUploadComponent } from './views/bulkcampaignstoreupload';
import { CampaignStoreComponent } from './views/campaignstore';


@NgModule({
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    HttpClientJsonpModule,
    MatIconModule,
    NgxMatColorPickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSlideToggleModule,
    MatNativeDateModule,
    MatDatepickerModule,
    FileUploadModule,
    OrderModule,
    NgxIntlTelInputModule,
    CloudinaryModule.forRoot(cloudinary, config),
  ],
  declarations: [
    AppComponent,
    HeaderComponent,
    HeaderSecureComponent,
    ForgotPasswordComponent,
    FooterComponent,
    LoginComponent,
    ResetComponent,
    SignupComponent,
    HomeComponent,
    ProfileComponent,
    ReportsComponent,
    SettingsComponent,
    StoreComponent,
    ModuleComponent,
    CampaignComponent,
    BulkStoreUploadComponent,
    BulkCampaignStoreUploadComponent,
    CampaignStoreComponent
  ],
  providers: [
      DatePipe,
      HttpService,
      AlertService, 
      LoaderService, 
      WindowService, 
      PrintingService, 
      SafeHtmlPipe,
      SortByPipe,
      DownloadService,
      {provide: LocationStrategy, useClass: HashLocationStrategy},
      [{ provide: HTTP_INTERCEPTORS, useClass: TimeoutInterceptor, multi: true }],
      [{ provide: DEFAULT_TIMEOUT, useValue: 300000 }],
      { provide: HTTP_INTERCEPTORS, useClass: BasicAuthInterceptor, multi: true },
      { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
      { provide: MAT_COLOR_FORMATS, useValue: NGX_MAT_COLOR_FORMATS },

      // provider used to create fake backend
      fakeBackendProvider
  ],
  exports:  [
    FooterComponent,
    HeaderSecureComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
