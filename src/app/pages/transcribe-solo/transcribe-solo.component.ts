import { Component } from '@angular/core';
import { NOTES_GUITAR_NERK } from '../../shared/constants/notes-guitar-nerk.constant';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'wal-transcribe-solo',
  imports: [CommonModule, FormsModule],
  templateUrl: './transcribe-solo.component.html',
  styleUrl: './transcribe-solo.component.scss',
})
export class TranscribeSoloComponent {
  notes: Record<string, string> = NOTES_GUITAR_NERK;
  soloNumerico = '';

  soloEmNotas: string[][][] = [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tablaturas: any;

  constructor() {
    this.gerarTabMap();
  }

  private cromatica = [
    'C',
    'C#',
    'D',
    'D#',
    'E',
    'F',
    'F#',
    'G',
    'G#',
    'A',
    'A#',
    'B',
  ];
  private afinacao1a6 = ['E', 'B', 'G', 'D', 'A', 'E'];
  private TAB_MAP: Record<string, { corda: number; casa: number }[]> = {};

  onSubmit(): void {
    if (!this.soloNumerico) return;

    const linhas = this.soloNumerico.split(/\r?\n/);
    const newLinhas: string[] = [];
    this.soloEmNotas = [];
    linhas.forEach((l) => {
      const tabs = l.split('/');

      if (tabs.length > 1) {
        tabs.forEach((t) => newLinhas.push(t));
      } else {
        newLinhas.push(l);
      }
    });

    newLinhas.forEach((linha) => {
      const grupos = linha.split(/\s+/).filter((n) => n);

      // começa com uma linha temporária
      const linhasTemp: string[][] = [[]];

      grupos.forEach((grupo) => {
        const partes = grupo.split('/'); // separa B/C

        // garante que temos linhas temporárias suficientes
        while (linhasTemp.length < partes.length) {
          linhasTemp.push([]);
        }

        // adiciona cada parte na linha correspondente
        partes.forEach((p, idx) => {
          linhasTemp[idx].push(this.notes[p] || p);
        });

        // notas normais: preencher todas as linhas temporárias se partes.length === 1
        if (partes.length === 1 && linhasTemp.length > 1) {
          linhasTemp.forEach((arr, idx) => {
            if (idx >= 1) arr.push(this.notes[grupo] || grupo);
          });
        }
      });

      // adiciona cada linha temporária ao soloEmNotas
      linhasTemp.forEach((arr) => this.soloEmNotas.push([arr]));
    });

    console.log(this.soloEmNotas);
  }

  handlerTabs(): void {
    this.tablaturas = this.gerarTablaturas(7, 2, [1, 2, 3]);

    console.log('Tablatura:', this.tablaturas);
  }

  private gerarTabMap(): void {
    this.TAB_MAP = {};
    this.afinacao1a6.forEach((notaAberta, idxCorda) => {
      let pos = this.cromatica.indexOf(notaAberta);
      for (let casa = 0; casa <= 23; casa++) {
        const nota = this.cromatica[pos % 12];
        if (!this.TAB_MAP[nota]) this.TAB_MAP[nota] = [];
        this.TAB_MAP[nota].push({ corda: idxCorda + 1, casa });
        pos++;
      }
    });
  }

  private escolherPosicao(
    nota: string,
    ultima: { corda: number; casa: number } | null,
    usadasNoAcorde: Set<number>,
    centro = 7,
    janela = 2,
    cordasPermitidas: number[] = [1, 2, 3]
  ): { corda: number; casa: number } | null {
    const todas = this.TAB_MAP[nota] || [];
    let pool = todas.filter(
      (p) =>
        cordasPermitidas.includes(p.corda) &&
        !usadasNoAcorde.has(p.corda) &&
        p.casa >= centro - janela &&
        p.casa <= centro + janela
    );
    if (!pool.length) {
      pool = todas.filter(
        (p) =>
          cordasPermitidas.includes(p.corda) && !usadasNoAcorde.has(p.corda)
      );
    }
    if (!pool.length) pool = todas;

    if (!pool.length) return null;

    const alvoCasa = ultima ? ultima.casa : centro;

    const sortedCordas = [...cordasPermitidas].sort((a, b) => a - b);
    const medianIndex = Math.floor((sortedCordas.length - 1) / 2);
    const alvoCorda = ultima
      ? ultima.corda
      : sortedCordas[medianIndex] ?? cordasPermitidas[0];

    const custo = (p: { corda: number; casa: number }) =>
      Math.abs(p.casa - alvoCasa) * 3 + Math.abs(p.corda - alvoCorda);

    return pool.reduce(
      (best, cur) => (custo(cur) < custo(best) ? cur : best),
      pool[0]
    );
  }

  gerarTablaturas(
    centro = 7,
    janela = 2,
    cordas: number[] = [1, 2, 3]
  ): string[][] {
    const labels = ['E', 'B', 'G', 'D', 'A', 'E'];
    const saida: string[][] = [];

    this.soloEmNotas.forEach((linhas) => {
      linhas.forEach((notasDaLinha) => {
        const grid: string[][] = Array.from({ length: 6 }, () => []);
        let ultimaPos: { corda: number; casa: number } | null = null;

        notasDaLinha.forEach((token) => {
          const subNotas = token.split('/');
          const usadas = new Set<number>();
          const escolhidas: { corda: number; casa: number }[] = [];

          subNotas.forEach((n) => {
            const pos = this.escolherPosicao(
              n,
              ultimaPos,
              usadas,
              centro,
              janela,
              cordas
            );
            if (pos) {
              escolhidas.push(pos);
              usadas.add(pos.corda);
            }
          });

          for (let s = 1; s <= 6; s++) {
            const hit = escolhidas.find((p) => p.corda === s);
            grid[s - 1].push(hit ? String(hit.casa) : '-');
          }

          if (escolhidas.length) ultimaPos = escolhidas[0];
        });


        const numCols = grid[0].length;
        let maxWidth = 1;
        for (let s = 0; s < 6; s++) {
          for (let c = 0; c < numCols; c++) {
            const tok = grid[s][c];
            if (tok !== '-') maxWidth = Math.max(maxWidth, tok.length);
          }
        }

        const separador = '---';
        const tab = grid.map((linha, i) => {
          const cells = linha.map((cell) => {
            if (cell === '-') return `${separador}-${separador}`;
            return `${separador}${cell}${separador}`;
          });
          return `${labels[i]}|${cells.join('')}`;
        });

        saida.push(tab);
      });
    });

    return saida;
  }
}
