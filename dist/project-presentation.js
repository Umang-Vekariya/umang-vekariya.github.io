// Short exhibit copy. Complete explanations remain in demo-content/case studies.
export const featuredWork=[
 {id:'intent-lab',contribution:'Local agent planning, a learned action checker, and explicit permission gates.',evidence:'Inspect actual recorded proposals, decisions and mock execution receipts.'},
 {id:'realityforge',contribution:'A browser vision pipeline that turns desk silhouettes into interactive obstacles.',evidence:'Evaluation covers 6 synthetic clips and 144 labeled frames.'},
 {id:'playable-replay',contribution:'Video tracking, fitted physics, and a reconstruction you can take control of.',evidence:'Physics fitted on the first 60% of observations; later frames kept separate.'}
];
export function orderForReading(projects){const ids=featuredWork.map(p=>p.id);return [...projects].sort((a,b)=>{const x=ids.indexOf(a.id),y=ids.indexOf(b.id);return (x<0?99:x)-(y<0?99:y);});}
export const exhibitCopy={
 wnams:{subtitle:'MEASURE → MAP → INSPECT',scope:'Synthetic survey · Real interpolation',steps:['Place a sample on the floor plan.','Nearby samples shape the estimated signal.','Compare stronger and weaker coverage. Synthetic values only.']},
 deepfake:{subtitle:'FRAMES → SCORES → VIDEO DECISION',scope:'Example scores · Repository aggregation rule',steps:['Sample eight frames from a video.','Compare illustrative frame scores; model weights are unavailable.','Average the highest three scores to classify the example.']},
 'vit-vault':{subtitle:'ACCEPT LOCALLY. VERIFY AFTER RECONNECTING.',scope:'Local outbox explanation · No Azure connection',steps:['Submit a sample while the gateway is offline.','SHA-256 identifies content and prevents duplicate receipts.','Reconnect to verify the queued samples in this local sketch.']},
 polyglot:{subtitle:'SOURCE → TYPED IR → BOUNDED VM',scope:'Actual saved compiler output · Live IDE available',steps:['Choose an example from the real compiler.','Inspect its recorded tokens, typed IR and bytecode.','Read verified output, or open the IDE to run your own code.']},
 realityforge:{subtitle:'A DESK THAT BECOMES A PLAYGROUND',scope:'Synthetic obstacle sketch · Full vision app available',steps:['Calibrate a plane. Open the real app for vision processing.','Move the silhouette to change the collision boundary.','Watch the simulation respond. This preview uses synthetic obstacles.']},
 'playable-replay':{subtitle:'OBSERVE → RECONSTRUCT → TAKE CONTROL',scope:'Actual reconstruction · Synthetic source footage',steps:['Watch the exported ball, paddle and brick observations.','Compare inferred motion from one observed seed.','Take control of a reconstructed frame and play.']},
 'intent-lab':{subtitle:'A PLAN IS A PROPOSAL. CHECK THE ACTION.',scope:'Recorded Qwen runs · Mock tools · No live inference',steps:['Start with the original request, before external content.','Inspect the proposed tool call and its permission decision.','Follow the actual recorded answer and mock execution receipts.']},
 clubsphere:{subtitle:'THE LAST SEAT IS A TRANSACTION',scope:'In-memory booking explanation · Fictional students',steps:['Trace the records behind membership, events and bookings.','Fill two seats; later bookings join the waitlist.','Cancel a seat to promote the first waiting student.']}
};
