import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PortarLoguriComponent } from './portar-loguri.component';

describe('PortarLoguriComponent', () => {
  let component: PortarLoguriComponent;
  let fixture: ComponentFixture<PortarLoguriComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PortarLoguriComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PortarLoguriComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
