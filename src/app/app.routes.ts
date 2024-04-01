import { Routes } from '@angular/router';
import { TranscribeSoloComponent } from './pages/transcribe-solo/transcribe-solo.component';

export const routes: Routes = [
  {
    path: 'transcrever-solo',
    component: TranscribeSoloComponent
  },
  {
    path: '',
    redirectTo: 'transcrever-solo',
    pathMatch: 'full'
  }
];
