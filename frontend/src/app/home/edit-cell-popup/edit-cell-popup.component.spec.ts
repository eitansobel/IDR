import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {EditCellPopupComponent} from './edit-cell-popup.component';

describe('EditCellPopupComponent', () => {
    let component: EditCellPopupComponent;
    let fixture: ComponentFixture<EditCellPopupComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [EditCellPopupComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(EditCellPopupComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
