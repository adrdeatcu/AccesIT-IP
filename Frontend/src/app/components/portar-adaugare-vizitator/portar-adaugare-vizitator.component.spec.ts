import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PortarAdaugareVizitatorComponent } from './portar-adaugare-vizitator.component';

describe('PortarAdaugareVizitatorComponent', () => {
  let component: PortarAdaugareVizitatorComponent;
  let fixture: ComponentFixture<PortarAdaugareVizitatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PortarAdaugareVizitatorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PortarAdaugareVizitatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
