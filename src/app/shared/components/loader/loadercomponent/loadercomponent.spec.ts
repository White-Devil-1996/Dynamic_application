import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Loadercomponent } from './loadercomponent';

describe('Loadercomponent', () => {
  let component: Loadercomponent;
  let fixture: ComponentFixture<Loadercomponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Loadercomponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Loadercomponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
