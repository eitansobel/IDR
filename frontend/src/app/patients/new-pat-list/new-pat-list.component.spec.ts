import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewPatListComponent } from './new-pat-list.component';

describe('NewStaffListComponent', () => {
  let component: NewPatListComponent;
  let fixture: ComponentFixture<NewPatListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewPatListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewPatListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
