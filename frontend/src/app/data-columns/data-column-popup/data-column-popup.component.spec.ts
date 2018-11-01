import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {DataColumnPopupComponent} from './data-column-popup.component';

describe('DataColumnsComponent', () => {
    let component: DataColumnPopupComponent;
    let fixture: ComponentFixture<DataColumnPopupComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [DataColumnPopupComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(DataColumnPopupComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
