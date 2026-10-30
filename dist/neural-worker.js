import {NeuralNetwork} from './model.js?v=2';

let network,points=[],epoch=0,rate=.025,running=false,visible=true,version=0,timer,lastReport=0;
function report(){postMessage({version,epoch,running,state:network.snapshot(),metrics:network.evaluate(points)});lastReport=performance.now();}
function tick(){
 if(!running||!visible)return;
 const start=performance.now();let steps=0;
 do{network.trainEpoch(points,rate);epoch++;}while(++steps<4&&performance.now()-start<8&&epoch<3000);
 if(epoch>=3000)running=false;
 if(performance.now()-lastReport>100||!running)report();
 if(running)timer=setTimeout(tick,12);
}
self.onmessage=({data})=>{
 clearTimeout(timer);
 if(data.type==='reset'){
  version=data.version;network=new NeuralNetwork(data.seed,data.width);points=data.points;epoch=0;running=false;report();
 }else if(data.version===version){
  if(data.type==='samples'){points=data.points;report();}
  if(data.type==='run'){running=data.running&&points.length>=2;report();}
  if(data.type==='rate')rate=data.rate;
  if(data.type==='visible')visible=data.visible;
 }
 if(running&&visible)timer=setTimeout(tick,0);
};
