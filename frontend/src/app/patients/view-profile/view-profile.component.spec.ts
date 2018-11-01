import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewPatientProfileComponent } from './view-profile.component';

describe('ViewPatientProfileComponent', () => {
  let component: ViewPatientProfileComponent;
  let fixture: ComponentFixture<ViewPatientProfileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewPatientProfileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewPatientProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
