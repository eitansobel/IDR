import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditSvgComponent } from './edit-svg.component';

describe('EditSvgComponent', () => {
  let component: EditSvgComponent;
  let fixture: ComponentFixture<EditSvgComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditSvgComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditSvgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
