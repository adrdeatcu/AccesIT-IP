import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminAngajatiComponent } from './admin-angajati.component';

describe('AdminAngajatiComponent', () => {
  let component: AdminAngajatiComponent;
  let fixture: ComponentFixture<AdminAngajatiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AdminAngajatiComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminAngajatiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
