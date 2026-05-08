/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { AddOcComponent } from './add-committees.component';

describe('AddOcComponent', () => {
  let component: AddOcComponent;
  let fixture: ComponentFixture<AddOcComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AddOcComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddOcComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
