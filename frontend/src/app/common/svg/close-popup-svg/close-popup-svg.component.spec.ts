import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClosePopupSvgComponent } from './close-popup-svg.component';

describe('ClosePopupSvgComponent', () => {
  let component: ClosePopupSvgComponent;
  let fixture: ComponentFixture<ClosePopupSvgComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClosePopupSvgComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClosePopupSvgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
