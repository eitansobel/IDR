import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KeyIconSvgComponent } from './key-icon-svg.component';

describe('KeyIconSvgComponent', () => {
  let component: KeyIconSvgComponent;
  let fixture: ComponentFixture<KeyIconSvgComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KeyIconSvgComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KeyIconSvgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
