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

  public functionStart: number;
  public functionStop: number;
  public functionStep: number;
  public functionInterval: any[] = [];

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
    this.functionStart = -1;
    this.functionStop = 5;
    this.functionStep = 0.5;

    // Example 1: https://www.youtube.com/watch?v=Gn0S-pYXiw0
    /*this.nodes = 3;
    this.multiplicity = [
      {fold: 3, name: "x1", x: -1, y: 9, derivatives: [9, -19, 44]}, 
      {fold: 2, name: "x2", x: 1, y: 3, derivatives: [3, 1]},
      {fold: 1, name: "x3", x: 2, y: 15, derivatives: [15]}
    ];
    this.hasFolds = true;*/

    // Example 2: https://en.wikipedia.org/wiki/Hermite_interpolation#Example
    /*this.nodes = 3;
    this.multiplicity = [
      {fold: 3, name: "x1", x: -1, y: 2, derivatives: [2, -8, 56]}, 
      {fold: 3, name: "x2", x: 0, y: 1, derivatives: [1, 0, 0]},
      {fold: 3, name: "x3", x: 1, y: 2, derivatives: [2, 8, 56]}
    ];
    this.hasFolds = true;*/

    // Example 3: https://pl.wikipedia.org/wiki/Interpolacja_Hermite%E2%80%99a#Przyk%C5%82ad
    /*this.nodes = 2;
    this.multiplicity = [
      {fold: 2, name: "x1", x: 1, y: 3, derivatives: [3, 2]}, 
      {fold: 2, name: "x2", x: 3, y: 5, derivatives: [5, 6]},
    ];
    this.hasFolds = true;*/

    // Example 4: http://www.kosiorowski.edu.pl/wp-content/uploads/2016/11/6.-Interpolacja-wielomianowa.pdf
    /*this.nodes = 3;
    this.multiplicity = [
      {fold: 2, name: "x1", x: -1, y: -8, derivatives: [-8, 12]}, 
      {fold: 2, name: "x2", x: 0, y: -2, derivatives: [-2, 1]},
      {fold: 2, name: "x3", x: 1, y: -4, derivatives: [-4, -2]}
    ];
    this.hasFolds = true;*/
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

    for (let col = 1; col < tableSize; col++) {
      factorial *= col;

      for (let row = col; row < tableSize; row++) {
        let result = 0;

        if(this.hermitTable[row].needsDerivative[col]) {
          let multiplicityRow = this.multiplicity[ this.hermitTable[row].indexInMultiplicity ];
          result = multiplicityRow.derivatives[col] / factorial;
        }
        else {
          let nominator = this.hermitTable[row].y[col-1] - this.hermitTable[row-1].y[col-1];
          let denominator = this.hermitTable[row].x - this.hermitTable[row-col].x;
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

    this.multiplicity.forEach( (n, index) => {
      for (let i = 0; i < n.fold; i++) {
        this.hermitTable = [...this.hermitTable, {
          indexInMultiplicity: index,
          name: n.name,
          x: n.x,
          y: new Array(tableSize).fill(null).fill(n.y, 0, 1).fill('--', firstDisabledField, tableSize),
          needsDerivative: new Array(tableSize).fill(false).fill(true, 1, i+1), // to avoid comparing float numbers
        }];
        firstDisabledField++;
      }
    });

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

          let temp = this.hermitTable[j].x;
          if(temp < 0) {
            iloczyn = `${iloczyn.toString()} * (x + ${Math.abs(this.hermitTable[j].x)})`;
          } else if(temp == 0) {
            iloczyn = `${iloczyn.toString()} * x`;
          } else {
            iloczyn = `${iloczyn.toString()} * (x - ${this.hermitTable[j].x})`;
          }
          
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

  createFunctionInterval = () => {
    this.functionInterval = [];
    let currentPoint = this.functionStart;
    while(currentPoint <= this.functionStop)
    {
      this.functionInterval.push(currentPoint);
      currentPoint += this.functionStep;
    }
  }

  generate = () => {
    this.createFunctionInterval();

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
