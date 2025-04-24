import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminUtilizatoriComponent } from './admin-utilizatori.component';

describe('AdminUtilizatoriComponent', () => {
  let component: AdminUtilizatoriComponent;
  let fixture: ComponentFixture<AdminUtilizatoriComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AdminUtilizatoriComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminUtilizatoriComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
