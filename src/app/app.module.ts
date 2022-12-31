import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { AngularFireModule } from '@angular/fire';
import { AngularFireDatabaseModule, URL } from '@angular/fire/database';
import { AngularFireFunctionsModule, ORIGIN } from '@angular/fire/functions';
import { NgxAuthFirebaseUIModule } from 'ngx-auth-firebaseui';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { MaterialModule } from './material/material.module';

import { environment } from '../environments/environment';
import { AppComponent } from './app.component';
import { RoomFormComponent } from './components/room-form/room-form.component';
import { RoomComponent } from './components/room/room.component';
import { GameComponent } from './components/game/game.component';
import { PlayerDeckComponent } from './components/player-deck/player-deck.component';
import { PlayerComponent } from './components/player/player.component';

@NgModule({
  declarations: [
    AppComponent,
    RoomFormComponent,
    RoomComponent,
    GameComponent,
    PlayerDeckComponent,
    PlayerComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MaterialModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireDatabaseModule,
    AngularFireFunctionsModule,
    FormsModule,
    ReactiveFormsModule,
    NgxAuthFirebaseUIModule.forRoot(environment.firebase),
    BrowserAnimationsModule
  ],
  providers: [
    { provide: URL, useValue: 'http://localhost:9000/?ns=shithead-95103' },
    { provide: ORIGIN, useValue: 'http://localhost:5001' }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
