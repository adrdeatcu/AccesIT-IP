import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PortarVizitatoriComponent } from './portar-vizitatori.component';

describe('PortarVizitatoriComponent', () => {
  let component: PortarVizitatoriComponent;
  let fixture: ComponentFixture<PortarVizitatoriComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PortarVizitatoriComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PortarVizitatoriComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
