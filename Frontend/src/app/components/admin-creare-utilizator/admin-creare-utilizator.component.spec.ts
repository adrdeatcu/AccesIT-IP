import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminCreareUtilizatorComponent } from './admin-creare-utilizator.component';

describe('AdminCreareUtilizatorComponent', () => {
  let component: AdminCreareUtilizatorComponent;
  let fixture: ComponentFixture<AdminCreareUtilizatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AdminCreareUtilizatorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminCreareUtilizatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
