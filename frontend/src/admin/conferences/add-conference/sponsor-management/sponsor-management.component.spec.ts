import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SponsorManagementComponent } from './sponsor-management.component';

describe('SponsorManagementComponent', () => {
  let component: SponsorManagementComponent;
  let fixture: ComponentFixture<SponsorManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SponsorManagementComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SponsorManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
