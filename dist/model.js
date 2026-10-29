// A small, real multilayer perceptron for the portfolio's browser experiment.
export function randomGenerator(seed = 42) {
  let state = seed >>> 0;
  return () => {state = (Math.imul(state, 1664525) + 1013904223) >>> 0; return state / 4294967296;};
}

export function createDataset(kind, seed = 42) {
  const random = randomGenerator(seed), points = [];
  const noise = () => (random() + random() + random() - 1.5) * 0.055;
  for (let label = 0; label < 2; label++) {
    for (let i = 0; i < 100; i++) {
      let x, y;
      if (kind === 'circles') {
        const angle = random() * Math.PI * 2, radius = (label ? 0.73 : 0.28) + noise();
        x = Math.cos(angle) * radius; y = Math.sin(angle) * radius;
      } else if (kind === 'moons') {
        const angle = i / 99 * Math.PI;
        x = label ? 0.2 - Math.cos(angle) * 0.65 : Math.cos(angle) * 0.65 - 0.2;
        y = label ? 0.18 - Math.sin(angle) * 0.65 : Math.sin(angle) * 0.65 - 0.18;
        x += noise(); y += noise();
      } else {
        const radius = (i + 3) / 103 * 0.86, angle = radius * 7.2 + label * Math.PI;
        x = Math.sin(angle) * radius + noise(); y = Math.cos(angle) * radius + noise();
      }
      points.push({x, y, label});
    }
  }
  return points;
}

export class NeuralNetwork {
  constructor(seed = 42) {
    this.random = randomGenerator(seed); this.width = 12;
    const init = (fanIn, fanOut) => (this.random() * 2 - 1) * Math.sqrt(6 / (fanIn + fanOut));
    this.w1 = Array.from({length:12}, () => Float64Array.from({length:2}, () => init(2,12)));
    this.b1 = new Float64Array(12);
    this.w2 = Array.from({length:12}, () => Float64Array.from({length:12}, () => init(12,12)));
    this.b2 = new Float64Array(12);
    this.w3 = Float64Array.from({length:12}, () => init(12,1)); this.b3 = 0;
    this.h1 = new Float64Array(12); this.h2 = new Float64Array(12);
    this.d1 = new Float64Array(12); this.d2 = new Float64Array(12);
  }
  forward(x, y) {
    for (let j=0;j<12;j++) this.h1[j] = Math.tanh(this.w1[j][0]*x + this.w1[j][1]*y + this.b1[j]);
    for (let k=0;k<12;k++) {let sum=this.b2[k];for(let j=0;j<12;j++)sum+=this.w2[k][j]*this.h1[j];this.h2[k]=Math.tanh(sum);}
    let sum=this.b3;for(let k=0;k<12;k++)sum+=this.w3[k]*this.h2[k];
    return 1/(1+Math.exp(-Math.max(-35,Math.min(35,sum))));
  }
  trainEpoch(points, rate) {
    const order = Array.from({length:points.length}, (_,i)=>i);
    for(let i=order.length-1;i>0;i--){const j=Math.floor(this.random()*(i+1));[order[i],order[j]]=[order[j],order[i]];}
    for(const index of order){
      const point=points[index],error=this.forward(point.x,point.y)-point.label;
      for(let k=0;k<12;k++)this.d2[k]=error*this.w3[k]*(1-this.h2[k]*this.h2[k]);
      for(let j=0;j<12;j++){let sum=0;for(let k=0;k<12;k++)sum+=this.d2[k]*this.w2[k][j];this.d1[j]=sum*(1-this.h1[j]*this.h1[j]);}
      for(let k=0;k<12;k++){this.w3[k]-=rate*error*this.h2[k];this.b2[k]-=rate*this.d2[k];for(let j=0;j<12;j++)this.w2[k][j]-=rate*this.d2[k]*this.h1[j];}
      this.b3-=rate*error;
      for(let j=0;j<12;j++){this.w1[j][0]-=rate*this.d1[j]*point.x;this.w1[j][1]-=rate*this.d1[j]*point.y;this.b1[j]-=rate*this.d1[j];}
    }
  }
  evaluate(points) {
    let loss=0,correct=0;
    for(const point of points){const p=Math.max(1e-9,Math.min(1-1e-9,this.forward(point.x,point.y)));loss-=point.label*Math.log(p)+(1-point.label)*Math.log(1-p);if((p>=0.5?1:0)===point.label)correct++;}
    return {loss:loss/points.length,accuracy:correct/points.length};
  }
}
