import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkCampaignStoreUploadComponent } from './bulkcampaignstoreupload.component';

describe('BulkCampaignStoreUploadComponent', () => {
  let component: BulkCampaignStoreUploadComponent;
  let fixture: ComponentFixture<BulkCampaignStoreUploadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BulkCampaignStoreUploadComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BulkCampaignStoreUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
