import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CopyIconSvgComponent } from './copy-icon-svg.component';

describe('CopyIconSvgComponent', () => {
  let component: CopyIconSvgComponent;
  let fixture: ComponentFixture<CopyIconSvgComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CopyIconSvgComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CopyIconSvgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
