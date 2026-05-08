import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from '../../../services/api.service';
import { NZ_MODAL_DATA, NzModalModule, NzModalRef } from 'ng-zorro-antd/modal';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { NzTabsModule } from 'ng-zorro-antd/tabs';

import {
  ClassicEditor,
  // Core & text
  Essentials,
  Paragraph,
  Heading,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Autoformat,
  BlockQuote,
  Link,
  List,
  TodoList,
  RemoveFormat,
  FindAndReplace,
  SelectAll,
  // Tables
  Table,
  TableToolbar,
  TableProperties,
  TableCellProperties,
  // Images (OSS)
  Image,
  ImageToolbar,
  ImageCaption,
  ImageStyle,
  ImageResize,
  AutoImage /* tiện tự tạo <img> khi paste URL */,
  // Upload adapters (chọn 1 trong 2)
  Base64UploadAdapter, // nhanh để demo, không cần server
  // SimpleUploadAdapter, // nếu có endpoint
  // Media
  MediaEmbed,
  // Code & misc
  Code,
  CodeBlock,
  Highlight,
  HorizontalLine,
  Indent,
  Alignment,
  PasteFromOffice,
  WordCount,
  // Font & special chars
  Font,
  SpecialCharacters,
  SpecialCharactersEssentials,
  Subscript,
  Superscript,
} from 'ckeditor5';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { SessionManagementComponent } from './session-management/session-management.component';
import { CommitteesManagementComponent } from './committees-management/committees-management.component';
import { NzUploadFile, NzUploadModule } from 'ng-zorro-antd/upload';
import { SpeakerManagementComponent } from './speaker-management/speaker-management.component';
import { DocumentManagementComponent } from './document-management/document-management.component';
import { SponsorManagementComponent } from './sponsor-management/sponsor-management.component';

@Component({
  selector: 'app-add-conference',
  templateUrl: './add-conference.component.html',
  styleUrls: ['./add-conference.component.css'],
  imports: [
    ReactiveFormsModule,
    NzInputModule,
    NzSelectModule,
    NzDropDownModule,
    NzIconModule,
    NzTableModule,
    NzDatePickerModule,
    CKEditorModule,
    NzTabsModule,
    NzModalModule,
    NzButtonModule,
    SessionManagementComponent,
    CommitteesManagementComponent,
    DocumentManagementComponent,
    NzUploadModule,
    SpeakerManagementComponent,
    SponsorManagementComponent,
  ],
})
export class AddConferenceComponent implements OnInit {
  form: any;
  faculties: any = [];
  typeOptions: any = [
    { label: 'Hội nghị/Hội thảo', value: 'conference' },
    { label: 'Sự kiện', value: 'event' },
  ];
  uploading = false;

  public Editor = ClassicEditor;
  public config: any = {
    // BẮT BUỘC từ v44+ khi tự host:
    licenseKey: 'GPL', // dùng OSS (GPL). Nếu dùng thương mại -> key thương mại.
    // Nếu muốn dùng CDN Free Plan thì vẫn cần key (trên Cloud). :contentReference[oaicite:5]{index=5}

    plugins: [
      Essentials,
      Paragraph,
      Heading,
      Bold,
      Italic,
      Underline,
      Strikethrough,
      Autoformat,
      BlockQuote,
      Link,
      List,
      TodoList,
      RemoveFormat,
      FindAndReplace,
      SelectAll,
      Table,
      TableToolbar,
      TableProperties,
      TableCellProperties,
      Image,
      ImageToolbar,
      ImageCaption,
      ImageStyle,
      ImageResize,
      AutoImage,
      Base64UploadAdapter, // hoặc SimpleUploadAdapter (rồi cấu hình simpleUpload)
      MediaEmbed,
      Code,
      CodeBlock,
      Highlight,
      HorizontalLine,
      Indent,
      Alignment,
      PasteFromOffice,
      WordCount,
      Font,
      SpecialCharacters,
      SpecialCharactersEssentials,
      Subscript,
      Superscript,
    ],

    toolbar: {
      items: [
        'undo',
        'redo',
        '|',
        'heading',
        '|',
        'bold',
        'italic',
        'underline',
        'strikethrough',
        'removeFormat',
        '|',
        'fontSize',
        'fontFamily',
        'fontColor',
        'fontBackgroundColor',
        '|',
        'link',
        'blockquote',
        'code',
        'codeBlock',
        '|',
        'bulletedList',
        'numberedList',
        'todoList',
        '|',
        'insertTable',
        'mediaEmbed',
        'horizontalLine',
        '|',
        'alignment',
        'outdent',
        'indent',
        '|',
        'highlight',
        'findAndReplace',
        'selectAll',
        '|',
        'subscript',
        'superscript',
        'specialCharacters',
      ],
      shouldNotGroupWhenFull: true, // <--- thêm dòng này
    },
    fontSize: {
      options: [8, 9, 10, 11, 12, 13, 14, 16, 18, 20, 24, 28, 32],
    },

    image: {
      toolbar: [
        'imageStyle:inline',
        'imageStyle:block',
        'imageStyle:side',
        '|',
        'toggleImageCaption',
        'imageTextAlternative',
        '|',
        'resizeImage',
      ],
      styles: ['inline', 'block', 'side'],
      resizeUnit: '%',
    },

    table: {
      contentToolbar: [
        'tableColumn',
        'tableRow',
        'mergeTableCells',
        'tableProperties',
        'tableCellProperties',
      ],
    },

    // Nếu dùng SimpleUploadAdapter (thay cho Base64):
    // simpleUpload: {
    //   uploadUrl: '/api/upload',
    //   withCredentials: true
    // },

    // Loại bỏ hoàn toàn premium để không hiện watermark/đòi key thương mại:
    removePlugins: [
      'ExportPdf',
      'ExportWord',
      'CKBox',
      'CKFinder',
      'EasyImage',
      'RealTimeCollaborativeComments',
      'Comments',
      'TrackChanges',
      'RevisionHistory',
      'PresenceList',
      'WProofreader',
      'AIAssistant',
      'SlashCommand',
      'Pagination',
      'ImportWord',
    ],
  };

  tabOptions: any = [
    { label: 'Phiên', value: 'sessions' },
    { label: 'Ban tổ chức', value: 'organizers' },
    { label: 'Diễn giả ', value: 'speakers' },
    { label: 'Tài liệu', value: 'documents' },
  ];

  sessions: any = [];

  committees: any = [];

  speakers: any = [];

  documents: any = [];

  sponsors: any = [];

  readonly nzModalData = inject(NZ_MODAL_DATA);

  constructor(
    private fb: FormBuilder,
    public apiService: ApiService,
    public modalRef: NzModalRef<AddConferenceComponent>,
  ) {}

  ngOnInit(): void {
    this.initForm();

    this.getFaculties();

    // Thêm đoạn này để tự động lưu nháp
    this.form.valueChanges.subscribe((val: any) => {
      this.saveDraft();
    });
  }

  getFaculties() {
    this.apiService.getFaculties_byFields({}, {}).then((res: any) => {
      this.faculties = res.data;
    });
  }

  initForm() {
    // 1. Lấy data từ LocalStorage
    const localData = localStorage.getItem('conference_draft');
    const savedDraft = localData ? JSON.parse(localData) : null;

    const formGroupConfig: any = {};

    formGroupConfig['img'] = [savedDraft?.img || ''];
    formGroupConfig['name'] = [savedDraft?.name || ''];
    formGroupConfig['type'] = [savedDraft?.type || 'conference'];
    formGroupConfig['faculty'] = [savedDraft?.faculty || ''];
    // Chú ý bọc new Date() nếu dữ liệu lưu dạng chuỗi ISO
    formGroupConfig['start_date'] = [
      savedDraft?.start_date ? new Date(savedDraft?.start_date) : new Date(),
    ];
    formGroupConfig['end_date'] = [
      savedDraft?.end_date ? new Date(savedDraft?.end_date) : new Date(),
    ];
    formGroupConfig['submission_deadline'] = [
      savedDraft?.submission_deadline ? new Date(savedDraft?.submission_deadline) : new Date(),
    ];
    formGroupConfig['registration_deadline'] = [
      savedDraft?.registration_deadline ? new Date(savedDraft?.registration_deadline) : new Date(),
    ];
    formGroupConfig['max_participants'] = [savedDraft?.max_participants || 100];
    formGroupConfig['location'] = [savedDraft?.location || ''];
    formGroupConfig['map'] = [savedDraft?.map || ''];
    formGroupConfig['desc'] = [savedDraft?.desc || ''];
    formGroupConfig['desc_detail'] = [savedDraft?.desc_detail || ''];

    // Gán lại data cho mảng
    this.sessions = savedDraft?.sessions || [];
    this.committees = savedDraft?.committees || [];
    this.speakers = savedDraft?.speakers || [];
    this.documents = savedDraft?.documents || [];
    this.sponsors = savedDraft?.sponsors || [];

    this.form = this.fb.group(formGroupConfig);
  }

  saveDraft() {
    if (!this.form) return;
    const draftData = {
      ...this.form.value,
      sessions: this.sessions,
      committees: this.committees,
      speakers: this.speakers,
      documents: this.documents,
      sponsors: this.sponsors,
    };
    localStorage.setItem('conference_draft', JSON.stringify(draftData));
  }

  onChangeDocuments(event: any) {
    this.documents = event;
    this.saveDraft();
  }

  onChangeSession(event: any) {
    this.sessions = event;
    this.saveDraft();
  }

  onChangeSpeakers(event: any) {
    this.speakers = event;
    this.saveDraft();
  }

  onChangeOrganizingCommittee(event: any) {
    this.committees = event;
    this.saveDraft();
  }

  onChangeSponsor(event: any) {
    this.sponsors = event;
    this.saveDraft();
  }

  beforeUpload: (
    file: NzUploadFile,
    _fileList: NzUploadFile[],
  ) => boolean | import('rxjs').Observable<boolean> = (file) => {
    // 1) Lấy File thô từ NzUploadFile
    const rawFile: any = file;
    if (!rawFile) {
      // Không có file gốc (trường hợp file từ URL sẵn có), chặn upload mặc định
      return false;
    }
    this.uploading = true;
    // 2) Thêm “pending item” vào fileList để hiển thị đang upload
    const pending: any = {
      uid: file.uid,
      name: rawFile.name,
      status: 'uploading' as const,
      percent: 0,
    };

    // 3) Gọi upload của bạn
    this.apiService
      .uploadImage(rawFile, 'conference')
      .then((res: any) => {
        // đồng bộ vào gallery dữ liệu của bạn
        if (res.vcode == 0) {
          if (res?.data) {
            this.form.patchValue({ img: res.data });
          }
        }
      })
      .catch(() => {
        pending['status'] = 'error';
      })
      .finally(() => (this.uploading = false));

    // 4) Trả FALSE để chặn upload mặc định của nz-upload
    return false;
  };

  onAddConference() {
    const conference = {
      ...this.form.value,
      sessions: this.sessions,
      committees: this.committees,
      speakers: this.speakers,
      documents: this.documents,
      sponsors: this.sponsors,
    };

    const cleanPayload = {
      ...conference,

      // Thêm `: any` vào sau phần destructuring
      sessions: conference.sessions.map(({ _id, ...rest }: any) => rest),

      // Lọc bỏ _id trong committees và cả members bên trong (nếu có)
      committees: conference.committees.map(({ _id, ...rest }: any) => ({
        ...rest,
        members: rest.members.map(({ _id, ...memberRest }: any) => memberRest),
      })),

      // Lọc bỏ _id trong documents
      documents: conference.documents.map(({ _id, ...rest }: any) => rest),

      // Lọc bỏ _id trong speakers (phòng hờ)
      speakers: conference.speakers?.map(({ _id, ...rest }: any) => rest),

      // Lọc bỏ _id trong sponsors
      sponsors: conference.sponsors?.map(({ _id, ...rest }: any) => rest),
    };

    return new Promise((resolve) => {
      this.apiService.addConference(cleanPayload).then((res: any) => {
        resolve(res);
      });
    });
  }
}
