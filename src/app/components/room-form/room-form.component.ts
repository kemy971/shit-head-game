import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ShitheadService } from '../../shithead.service';

@Component({
  selector: 'app-room-form',
  templateUrl: './room-form.component.html',
  styleUrls: ['./room-form.component.scss']
})
export class RoomFormComponent implements OnInit {

  username = '';
  isCreating = false;

  constructor(
    private router: Router,
    private shitheadService: ShitheadService
  ) { }

  ngOnInit(): void {
  }

  createRoom(): void {
    this.isCreating = true;
    this.shitheadService.createGame(this.username).subscribe(({player, game}) => {
      localStorage.setItem('player-id', player);
      this.router.navigate([`room/${game}`]);
    }, (err) => {
      this.isCreating = false;
    });
  }

}
