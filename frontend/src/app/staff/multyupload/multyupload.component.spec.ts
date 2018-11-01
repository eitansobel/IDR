import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MultyUploadComponent } from './multyupload.component';

describe('MultyUploadComponent', () => {
  let component: MultyUploadComponent;
  let fixture: ComponentFixture<MultyUploadComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MultyUploadComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MultyUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
