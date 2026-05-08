/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { CommitteesManagementComponent } from './committees-management.component';

describe('CommitteesManagementComponent', () => {
  let component: CommitteesManagementComponent;
  let fixture: ComponentFixture<CommitteesManagementComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CommitteesManagementComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommitteesManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
