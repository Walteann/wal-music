import { Component } from '@angular/core';
import { NOTES_GUITAR_NERK } from '../../shared/constants/notes-guitar-nerk.constant';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'wal-transcribe-solo',
    imports: [CommonModule, FormsModule],
    templateUrl: './transcribe-solo.component.html',
    styleUrl: './transcribe-solo.component.scss'
})
export class TranscribeSoloComponent {
  notes: Record<string, string> = NOTES_GUITAR_NERK;
  soloNumerico = '';

  soloEmNotas: string[][][] = [[]];

   onSubmit(): void {
    if (!this.soloNumerico) {
      return
    }
    const linhas = this.soloNumerico.split(/\r?\n/);

    this.soloEmNotas = linhas.map(linha => {
      const numerosConvertidos: string[] = [];
      const grupos = linha.split(/\s+/).filter(n => n);

      grupos.forEach(grupo => {
        if (grupo.includes('/')) {
          const partes = grupo.split('/');
          const notasConvertidas = partes.map(p => this.notes[p] || p);
          numerosConvertidos.push(notasConvertidas.join('/'));
        } else {
          numerosConvertidos.push(this.notes[grupo] || grupo);
        }
      });

      return [numerosConvertidos];
    });

  }
}
