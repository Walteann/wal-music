import { Component } from '@angular/core';
import { NOTES_GUITAR_NERK } from '../../shared/constants/notes-guitar-nerk.constant';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'wal-transcribe-solo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './transcribe-solo.component.html',
  styleUrl: './transcribe-solo.component.scss',
})
export class TranscribeSoloComponent {
  notes: any = NOTES_GUITAR_NERK;
  soloNumerico: string = '';

  soloEmNotas: any;

  onSubmit() {

    let novaFrase = this.soloNumerico;
    let notasNumericas = this.soloNumerico
      .split(/\s+/)
      .map((a) => a.trim())
      .join(',')
      .split('/')
      .join(',')
      .split(',');
    notasNumericas.forEach((n) => {
      novaFrase = novaFrase.replace(n, this.notes[n]);
    });

    this.soloEmNotas = novaFrase.split(/\s{2,}/).map(x => {
      let notas = []
      notas.push(x.split(' '))
      return notas;
    });

    console.log(this.soloEmNotas)
  }
}
