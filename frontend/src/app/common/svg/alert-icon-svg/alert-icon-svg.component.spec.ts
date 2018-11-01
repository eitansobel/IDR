import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AlertIconSvgComponent } from './alert-icon-svg.component';

describe('AlertIconSvgComponent', () => {
  let component: AlertIconSvgComponent;
  let fixture: ComponentFixture<AlertIconSvgComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AlertIconSvgComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AlertIconSvgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
