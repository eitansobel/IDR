import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CropSvgComponent } from './crop-svg.component';

describe('CropSvgComponent', () => {
  let component: CropSvgComponent;
  let fixture: ComponentFixture<CropSvgComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CropSvgComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CropSvgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
