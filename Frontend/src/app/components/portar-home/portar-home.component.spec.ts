import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PortarHomeComponent } from './portar-home.component';

describe('PortarHomeComponent', () => {
  let component: PortarHomeComponent;
  let fixture: ComponentFixture<PortarHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PortarHomeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PortarHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
