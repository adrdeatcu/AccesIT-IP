import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PortarManualLogComponent } from './portar-manual-log.component';

describe('PortarManualLogComponent', () => {
  let component: PortarManualLogComponent;
  let fixture: ComponentFixture<PortarManualLogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PortarManualLogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PortarManualLogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
