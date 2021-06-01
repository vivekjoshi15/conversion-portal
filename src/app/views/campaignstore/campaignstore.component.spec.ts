import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CampaignStoreComponent } from './campaignstore.component';

describe('CampaignStoreComponent', () => {
  let component: CampaignStoreComponent;
  let fixture: ComponentFixture<CampaignStoreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CampaignStoreComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CampaignStoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
