import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { NotFoundComponent } from './not-found.component';

describe('NotFoundComponent', () => {
  let fixture: ComponentFixture<NotFoundComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NotFoundComponent],
      imports: [RouterTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(NotFoundComponent);
  });

  it('renders a 404 message', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('404');
    expect(compiled.textContent).toContain('does not exist');
  });
});
