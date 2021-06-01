import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkStoreUploadComponent } from './bulkstoreupload.component';

describe('BulkStoreUploadComponent', () => {
  let component: BulkStoreUploadComponent;
  let fixture: ComponentFixture<BulkStoreUploadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BulkStoreUploadComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BulkStoreUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
