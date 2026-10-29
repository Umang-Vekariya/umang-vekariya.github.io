// Generic candidate physics. No imports from the footage generator or true rules.
export const ENGINE_VERSION='reconstruction-v1';
const copy=value=>JSON.parse(JSON.stringify(value));
const clamp=(value,lo,hi)=>Math.max(lo,Math.min(hi,value));
function collision(ball,rect){
  const x=clamp(ball.x,rect.x,rect.x+rect.width),y=clamp(ball.y,rect.y,rect.y+rect.height),dx=ball.x-x,dy=ball.y-y,d=Math.hypot(dx,dy);
  if(d>=ball.radius)return null;
  if(!d){const sides=[[ball.x-rect.x,-1,0],[rect.x+rect.width-ball.x,1,0],[ball.y-rect.y,0,-1],[rect.y+rect.height-ball.y,0,1]].sort((a,b)=>a[0]-b[0]);return {nx:sides[0][1],ny:sides[0][2],depth:ball.radius+sides[0][0]};}
  return {nx:dx/d,ny:dy/d,depth:ball.radius-d};
}
function reflect(ball,hit){ball.x+=hit.nx*(hit.depth+.001);ball.y+=hit.ny*(hit.depth+.001);const dot=ball.vx*hit.nx+ball.vy*hit.ny;if(dot<0){ball.vx-=2*dot*hit.nx;ball.vy-=2*dot*hit.ny;}}
export function stateAt(scene,index){
  if(!Number.isInteger(index)||index<0||index>=scene.snapshots.length)throw new Error('Frame is outside this recording.');
  const frame=scene.snapshots[index];if(!frame.takeover_ready)throw new Error(frame.reason||'This frame has insufficient motion context.');
  return {ball:copy(frame.ball),paddle:copy(frame.paddle),alive_brick_ids:[...frame.alive_brick_ids],status:frame.alive_brick_ids.length?'running':'won',elapsed:0,origin_frame:index,events:[]};
}
export function advance(state,scene,dt,nextPaddle){
  if(!Number.isFinite(dt)||dt<=0||dt>.1)throw new Error('Invalid simulation timestep.');
  if(state.status!=='running')return state;
  const ball=state.ball,model=scene.model,walls=model.geometry.walls,previous={...state.paddle};state.events=[];
  const steps=Math.max(Math.ceil((scene.physics_hz||240)*dt),Math.ceil(Math.hypot(ball.vx,ball.vy)*dt/Math.max(1,ball.radius/3))),step=dt/steps;
  for(let n=0;n<steps;n++){
    const t=(n+1)/steps,paddle={};for(const k of ['x','y','width','height'])paddle[k]=previous[k]+(nextPaddle[k]-previous[k])*t;
    ball.x+=ball.vx*step;ball.y+=ball.vy*step;
    for(const [side,axis,direction]of [['left','x',-1],['right','x',1],['top','y',-1]]){const bound=walls[side]-direction*ball.radius;if((ball[axis]-bound)*direction>0&&ball['v'+axis]*direction>0){ball[axis]=bound;ball['v'+axis]*=-1;state.events.push({type:'wall_hit',object_id:side});}}
    let hit=collision(ball,paddle);
    if(hit&&ball.vy>0){reflect(ball,hit);if(model.paddle_rule==='offset'){const speed=Math.hypot(ball.vx,ball.vy),offset=clamp((ball.x-paddle.x-paddle.width/2)/(paddle.width/2),-1,1),angle=offset*model.paddle_angle_degrees*Math.PI/180;ball.vx=speed*Math.sin(angle);ball.vy=-Math.abs(speed*Math.cos(angle));}state.events.push({type:'paddle_hit',object_id:'paddle'});}
    for(const brick of scene.bricks){if(!state.alive_brick_ids.includes(brick.id))continue;hit=collision(ball,brick);if(!hit)continue;reflect(ball,hit);state.alive_brick_ids=state.alive_brick_ids.filter(id=>id!==brick.id);ball.vx*=model.brick_speed_multiplier;ball.vy*=model.brick_speed_multiplier;state.events.push({type:'brick_hit',object_id:brick.id});break;}
    if(!Number.isFinite(ball.x+ball.y)||Math.hypot(ball.vx,ball.vy)>10000){state.status='unstable';break;}
    if(ball.y-ball.radius>scene.height){state.status='lost';break;}
    if(!state.alive_brick_ids.length){state.status='won';break;}
  }
  state.paddle={...nextPaddle};state.elapsed+=dt;return state;
}
export function buildModelReplay(scene){
  const seed=scene.snapshots.findIndex(frame=>frame.takeover_ready);if(seed<0)throw new Error('No reliable takeover frame is available.');
  const states=Array(scene.snapshots.length).fill(null),state=stateAt(scene,seed);if(scene.replay_seed_velocity){state.ball.vx=scene.replay_seed_velocity.vx;state.ball.vy=scene.replay_seed_velocity.vy;}if(scene.replay_seed_position){state.ball.x=scene.replay_seed_position.x;state.ball.y=scene.replay_seed_position.y;}states[seed]=copy(state);let heldControls=0;
  for(let i=seed+1;i<states.length;i++){const observed=scene.snapshots[i].paddle;if(!observed)heldControls++;advance(state,scene,1/scene.fps,observed||state.paddle);states[i]=copy(state);}
  return {seed_frame:seed,states,held_control_frames:heldControls,protocol:'One observed seed; recorded paddle controls; no future ball or brick resynchronization.'};
}
export class ReplaySession{
  constructor(scene,replay){this.scene=scene;this.replay=replay;this.frame=0;this.mode='observed';this.viewMode='observed';this.playing=false;this.state=null;this.branch=null;}
  seek(index){if(this.mode==='manual')throw new Error('Return to footage before seeking.');this.frame=clamp(Math.round(index),0,this.scene.snapshots.length-1);}
  setView(mode){if(!['observed','model'].includes(mode))throw new Error('Unknown preview mode.');if(this.mode==='manual')throw new Error('Return to footage before changing view.');this.mode=mode;this.viewMode=mode;if(mode==='model'&&this.frame<this.replay.seed_frame)this.frame=this.replay.seed_frame;}
  takeover(){if(this.mode==='manual')throw new Error('Return to footage before taking over another frame.');this.state=stateAt(this.scene,this.frame);this.mode='manual';this.playing=true;this.branch={schema_version:'1.0.0',engine:ENGINE_VERSION,scene_id:this.scene.id,origin_frame:this.frame,initial_state:copy(this.state),timestep:1/60,commands:[]};return this.state;}
  tick(center=null){
    if(!this.playing)return;
    if(this.mode!=='manual'){if(this.frame>=this.scene.snapshots.length-1){this.playing=false;return;}this.frame++;return;}
    if(this.state.status!=='running'){this.playing=false;return;}
    if(this.branch.commands.length>=9000){this.playing=false;throw new Error('Session limit reached. Export this branch and start another run.');}
    const paddle=this.state.paddle,walls=this.scene.model.geometry.walls,target=Number.isFinite(center)?center:paddle.x+paddle.width/2;
    const maximum=Math.max(500,this.scene.width*.85),x=clamp(paddle.x+clamp(target-paddle.width/2-paddle.x,-maximum/60,maximum/60),walls.left,walls.right-paddle.width);
    this.branch.commands.push(target);advance(this.state,this.scene,1/60,{...paddle,x});if(this.state.status!=='running')this.playing=false;
  }
  returnToFootage(){if(this.state&&this.branch)this.branch.final_state=copy(this.state);this.playing=false;this.mode=this.viewMode;this.state=null;}
  exportBranch(){if(!this.branch)throw new Error('Take over a frame before exporting a branch.');return {...copy(this.branch),final_state:copy(this.state||this.branch.final_state),command_count:this.branch.commands.length};}
  display(){if(this.mode==='manual')return this.state;if(this.mode==='model')return this.replay.states[this.frame];return this.scene.snapshots[this.frame];}
}
export function replayBranch(scene,branch){
  if(branch.engine!==ENGINE_VERSION||branch.scene_id!==scene.id||branch.timestep!==1/60||!Array.isArray(branch.commands)||branch.commands.length>9000)throw new Error('Incompatible branch recording.');
  const session=new ReplaySession(scene,{seed_frame:0,states:[]});session.seek(branch.origin_frame);session.takeover();
  for(const command of branch.commands){if(!Number.isFinite(command))throw new Error('Invalid branch input.');session.tick(command);}
  return copy(session.state);
}
export function drawReconstruction(canvas,scene,state){
  const c=canvas.getContext('2d'),assets=scene.assets,walls=scene.model.geometry.walls;c.fillStyle=assets.background;c.fillRect(0,0,scene.width,scene.height);c.fillStyle=assets.wall;c.fillRect(0,0,walls.left,scene.height);c.fillRect(walls.right,0,scene.width-walls.right,scene.height);c.fillRect(0,0,scene.width,walls.top);if(!state)return;
  for(const brick of scene.bricks)if(state.alive_brick_ids.includes(brick.id)){c.fillStyle=brick.color;c.fillRect(brick.x,brick.y,brick.width,brick.height);}
  const paddle=state.paddle;if(paddle){c.fillStyle=assets.paddle;c.fillRect(paddle.x,paddle.y,paddle.width,paddle.height);}
  if(state.ball){const ball=state.ball;c.fillStyle=assets.ball;c.beginPath();c.arc(ball.x,ball.y,ball.radius,0,Math.PI*2);c.fill();}
}
