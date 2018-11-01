import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeSetupComponent } from './time-setup.component';

describe('TimeSetupComponent', () => {
  let component: TimeSetupComponent;
  let fixture: ComponentFixture<TimeSetupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TimeSetupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimeSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
