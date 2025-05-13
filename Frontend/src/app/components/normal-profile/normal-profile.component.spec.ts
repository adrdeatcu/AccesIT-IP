import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NormalProfileComponent } from './normal-profile.component';

describe('NormalProfileComponent', () => {
  let component: NormalProfileComponent;
  let fixture: ComponentFixture<NormalProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NormalProfileComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NormalProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
