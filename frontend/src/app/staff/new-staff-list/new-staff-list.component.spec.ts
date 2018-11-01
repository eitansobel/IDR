import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewStaffListComponent } from './new-staff-list.component';

describe('NewStaffListComponent', () => {
  let component: NewStaffListComponent;
  let fixture: ComponentFixture<NewStaffListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewStaffListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewStaffListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
