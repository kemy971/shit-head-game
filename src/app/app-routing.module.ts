import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GameComponent } from './components/game/game.component';
import { RoomFormComponent } from './components/room-form/room-form.component';
import { RoomComponent } from './components/room/room.component';
import { NgxAuthFirebaseuiLoginComponent } from 'ngx-auth-firebaseui';


const routes: Routes = [
  {path: 'login', component: NgxAuthFirebaseuiLoginComponent},
  {path: '', component: RoomFormComponent},
  {path: 'room/:roomId', component: RoomComponent},
  {path: 'game/:gameId', component: GameComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
