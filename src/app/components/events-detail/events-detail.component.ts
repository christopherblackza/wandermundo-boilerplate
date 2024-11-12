import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../services/supabase.service';
import { switchMap, take } from 'rxjs';
import { MyEvent } from '../../models/event.model';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-events-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './events-detail.component.html',
  styleUrls: ['./events-detail.component.scss']
})
export class EventsDetailComponent implements OnInit {

  event: any;

  constructor(
    private router: Router,
    private supabaseService: SupabaseService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.event = history.state.event;
  }

}