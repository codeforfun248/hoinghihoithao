/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { EditCommitteesComponent } from './edit-committees.component';

describe('EditCommitteesComponent', () => {
  let component: EditCommitteesComponent;
  let fixture: ComponentFixture<EditCommitteesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [EditCommitteesComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditCommitteesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
