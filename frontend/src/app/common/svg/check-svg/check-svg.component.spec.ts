import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckSvgComponent } from './check-svg.component';

describe('CheckSvgComponent', () => {
  let component: CheckSvgComponent;
  let fixture: ComponentFixture<CheckSvgComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CheckSvgComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckSvgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
