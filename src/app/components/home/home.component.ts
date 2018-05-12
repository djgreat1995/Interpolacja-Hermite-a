import { Component, OnInit } from '@angular/core';

declare var require: any;
const math = require('mathjs');

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {

  public nodes: number;
  public multiplicity: any[] = [];
  public hermitTable: any[] = [];
  public interpolateFunction = '';
  public functionInterval = [-1, -0.5,
      0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5];

  public hasFolds = false;

  public  stringFunction = '';

  public isShowFunction = false;
  public lineChartType = 'line';
  public lineChartData: any[] = [
    { data: [], label: 'Wykres funkcji interpolującej' },
    { data: [], label: 'Wykres funkcji' },
  ];

  public lineChartLabels: string[] = [];

  public lineChartOptions: any = {
    responsive: true
  };

  public lineChartLegend = true;

  constructor() {
    this.nodes = 2;
    this.multiplicity = [
      {fold: 2, name: "x1", x: 1, y: 3, derivatives: [3, 2]}, 
      {fold: 2, name: "x2", x: 3, y: 5, derivatives: [5, 6]}
    ];
    this.hasFolds = true;
  }

  generateFolds = () => {
    for (let i = 0; i < this.nodes; i++) {
      this.multiplicity = [...this.multiplicity, { name: `x${i + 1}`, fold: null }];
    }
  }

  getDerivatives = () => {
    this.multiplicity.forEach(n => {
      n.derivatives = new Array(n.fold).fill(null);
      n.derivatives[0] = n.y;
    });

    this.hasFolds = true;
  }

  fillHermitTable = (tableSize) => {
    let factorial = 1;
    debugger;
    for (let col = 1; col < tableSize; col++) {
      factorial *= col;

      for (let row = col; row < tableSize; row++) {
        // tu może być problem z zaokrągleniem
        let nominator = this.hermitTable[row].y[col-1] - this.hermitTable[row-1].y[col-1];
        let denominator = this.hermitTable[row].x - this.hermitTable[row-col].x;//this.hermitTable[row-1].x;

        let result = 0;
        if(denominator == 0) {
          let multiplicityIndex = this.hermitTable[row].multiplicityIndex;
          result = this.multiplicity[multiplicityIndex].derivatives[col] / factorial;
        }
        else {
          result = nominator / denominator;
        }

        this.hermitTable[row].y[col] = result;
      }
    }
  }

  generateTable = () => {
    let tableSize = 0;

    this.multiplicity.forEach(n => {
      tableSize += n.fold;
    });

    let firstDisabledField = 1;

    for(let mi = 0; mi < this.multiplicity.length; mi++)
    {
      let n = this.multiplicity[mi];
      for (let i = 0; i < n.fold; i++) {
        this.hermitTable = [...this.hermitTable, {
          multiplicityIndex: mi,
          name: n.name,
          x: n.x,
          y: new Array(tableSize).fill(null).fill(n.y, 0, 1).fill('--', firstDisabledField, tableSize)
        }];
        firstDisabledField++;
      }
    }

    this.fillHermitTable(tableSize);
  }

  calculate = (x: number) => {
    let iloczyn = 1;
    let sumaE = 0;
    let wynik = 0;

    for (let i = 0; i < this.hermitTable.length; i++) {
      sumaE = this.hermitTable[i].y[i];

      if (i - 1 >= 0) {
        for (let j = 0; j <= i - 1; j++) {
          iloczyn = iloczyn * (x - this.hermitTable[j].x);
        }
      }

      sumaE = sumaE * iloczyn;
      iloczyn = 1;
      wynik += sumaE;
    }



    return wynik;
  }

  createStringFunction = () => {
    let iloczyn = '1';
    let sumaE = '1';
    let wynik = '0';

    for (let i = 0; i < this.hermitTable.length; i++) {
      sumaE = `${this.hermitTable[i].y[i]}`;

      if (i - 1 >= 0) {
        for (let j = 0; j <= i - 1; j++) {
          iloczyn = `${iloczyn.toString()} * (x - ${this.hermitTable[j].x})`;
        }
      }

      sumaE = `${sumaE} * ${iloczyn}`;
      iloczyn = '1';
      wynik = `${wynik} + ${sumaE}`;
    }
    return wynik;
  }

  calculateInterpolatedFunction = (x: number) => {
    const f = math.parse(this.interpolateFunction);
    const simplified = math.simplify(f);

    return simplified.eval({ x });
  }

  generate = () => {
    this.isShowFunction = true;
    this.lineChartLabels = [];
    this.lineChartData[0].data = [];
    this.lineChartData[1].data = [];

   this.functionInterval.forEach(i => {
      this.lineChartLabels = [...this.lineChartLabels, i.toString()];
      this.lineChartData[0].data = [...this.lineChartData[0].data, this.calculate(i)];
      this.lineChartData[1].data = [...this.lineChartData[1].data, this.calculateInterpolatedFunction(i)];
    });

  this.stringFunction = this.createStringFunction();
  }

}
