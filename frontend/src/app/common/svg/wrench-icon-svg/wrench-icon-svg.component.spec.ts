import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WrenchIconSvgComponent } from './wrench-icon-svg.component';

describe('WrenchIconSvgComponent', () => {
  let component: WrenchIconSvgComponent;
  let fixture: ComponentFixture<WrenchIconSvgComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WrenchIconSvgComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WrenchIconSvgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
