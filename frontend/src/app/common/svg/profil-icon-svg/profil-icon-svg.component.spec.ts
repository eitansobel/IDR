import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfilIconSvgComponent } from './profil-icon-svg.component';

describe('ProfilIconSvgComponent', () => {
  let component: ProfilIconSvgComponent;
  let fixture: ComponentFixture<ProfilIconSvgComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProfilIconSvgComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfilIconSvgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
