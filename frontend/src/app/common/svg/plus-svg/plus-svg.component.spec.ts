import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlusSvgComponent } from './plus-svg.component';

describe('PlusSvgComponent', () => {
  let component: PlusSvgComponent;
  let fixture: ComponentFixture<PlusSvgComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlusSvgComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlusSvgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
