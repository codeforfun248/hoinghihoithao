import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from '../footer/footer.component';
import { ChatWidgetComponent } from './chat-widget/chat-widget.component';
import { CskhWidgetComponent } from '../cskh-widget/cskh-widget.component';

@Component({
  selector: 'app-user-layout',
  templateUrl: './user-layout.component.html',
  styleUrls: ['./user-layout.component.css'],
  imports: [HeaderComponent, RouterOutlet, FooterComponent, ChatWidgetComponent, CskhWidgetComponent],
})
export class UserLayoutComponent implements OnInit {
  constructor() {}

  ngOnInit() {}
}
