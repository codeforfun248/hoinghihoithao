import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { ApiService } from '../../../../../services/api.service';
import { NzSelectModule } from 'ng-zorro-antd/select';

@Component({
  selector: 'app-add-speaker',
  templateUrl: './add-speaker.component.html',
  styleUrls: ['./add-speaker.component.css'],
  imports: [ReactiveFormsModule, NzIconModule, NzInputModule, NzButtonModule, NzSelectModule],
})
export class AddSpeakerComponent implements OnInit {
  form: any;

  membersOptions: any = [];

  constructor(
    public fb: FormBuilder,
    public apiService: ApiService,
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      email: [{ value: '' }, Validators.required],
      name: [{ value: '', disabled: true }, Validators.required],
      academic_degree: [{ value: '', disabled: true }, Validators.required],
      position: [''],
      desc: [''],
    });

    this.getUsers();
  }

  getUsers() {
    this.apiService.getUsers_byFields({}, {}).then((res: any) => {
      if (res.vcode == 0) {
        this.membersOptions = res.data;
      }
    });
  }

  handleSelectEmail(e: any) {
    const findUser = this.membersOptions.find((item: any) => item.email == e);
    if (findUser) {
      this.form.patchValue({
        name: findUser.name,
        academic_degree: findUser.academic_degree,
      });
    }
  }

  onAddSpeaker() {
    return new Promise((resolve: any, reject: any) => {
      const findUser = this.membersOptions.find((item: any) => item.email == this.form.value.email);

      resolve({
        ...this.form.value,
        user: findUser._id,
        name: findUser.name,
        academic_degree: findUser.academic_degree,
        desc: findUser.desc,
      });
    });
  }
}
