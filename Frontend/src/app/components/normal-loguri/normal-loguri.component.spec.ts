import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NormalLoguriComponent } from './normal-loguri.component';

describe('NormalLoguriComponent', () => {
  let component: NormalLoguriComponent;
  let fixture: ComponentFixture<NormalLoguriComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NormalLoguriComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NormalLoguriComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
