import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Landing2Component } from './landing-2.component';

describe('Landing2Component', () => {
  let component: Landing2Component;
  let fixture: ComponentFixture<Landing2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Landing2Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Landing2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
