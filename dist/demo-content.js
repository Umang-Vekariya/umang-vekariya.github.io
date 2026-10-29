export const demoContent=[
 {id:'wnams',kind:'INTERACTIVE EXPLANATION · SAMPLE SURVEY',source:'https://github.com/Umang-Vekariya/final_heatmap_proj',action:'Add survey point',steps:[
  ['Collect','Start with signal measurements.','A floor plan gives each observation a position. Add sample points to see how the survey becomes a map.'],
  ['Interpolate','Connect the measurements.','Inverse-distance weighting estimates signal between the sample points. Nearby measurements carry more weight.'],
  ['Inspect','Find the weak coverage.','Inspect the generated heatmap and compare strong and weak areas. These are synthetic survey values, not measurements from your device.']
 ]},
 {id:'deepfake',kind:'REPOSITORY WALKTHROUGH · EXAMPLE SCORES',source:'https://github.com/Umang-Vekariya/Deep-Fake-Detector',action:'Switch score example',steps:[
  ['Extract','A video becomes eight frames.','The actual prediction script samples eight positions, detects a face when possible, and resizes each input to 128 × 128.'],
  ['Classify','Each frame gets a score.','The trained MobileNetV2 model produces frame scores. Model weights are not present in the repository, so the scores shown here are illustrative.'],
  ['Aggregate','Three scores inform the result.','The script averages the three largest frame scores and applies a 0.5 threshold. This board runs that same aggregation rule on the example values.']
 ]},
 {id:'vit-vault',source:'https://github.com/Umang-Vekariya/vitvault',kind:'INTERACTIVE EXPLANATION · LOCAL OUTBOX',action:'Submit sample',steps:[
  ['Receive','Accept the work locally.','A campus gateway can issue a local receipt while the internet is unavailable. Submit a sample to the in-memory outbox.'],
  ['Queue','Keep the receipt durable.','An outbox separates accepting work from synchronizing it. The sketch computes a real SHA-256 digest for its sample content and deduplicates repeats.'],
  ['Synchronize','Reconnect and verify.','Reconnect the simulated gateway to synchronize queued items. The live Azure service is not contacted by this explanation.']
 ]},
 {id:'polyglot',kind:'REAL COMPILER OUTPUT · REPLAY + LIVE IDE',source:'https://github.com/hst257/PolyGlot',action:'Next example',steps:[
  ['Write','Different spellings, one language.','These examples were executed with the repository’s actual compiler. Select an example, then follow its real compiler records.'],
  ['Compile','Inspect the working pipeline.','The recorded tokens, typed IR, optimization and bytecode come from the actual Python compiler. Invalid programs stop before execution.'],
  ['Execute','Run the real virtual machine.','The output shown is a verified run. Open the included browser IDE to edit programs and run the same compiler and bounded VM yourself.']
 ]},
 {id:'realityforge',source:'https://github.com/Umang-Vekariya/RealityForge',app:'apps/realityforge/',appLabel:'Launch RealityForge',kind:'INTERACTIVE EXPLANATION · SYNTHETIC OBSTACLES',action:'Move obstacle',steps:[
  ['Calibrate','Give the desk a coordinate system.','The original prototype calibrates a planar desk. The board introduces the geometry. Launch the real app to run its vision pipeline on illustrated props, or choose your own camera there.'],
  ['Segment','Turn a silhouette into an obstacle.','A foreground region becomes a collision boundary. Move the obstacle or click the display to change its position.'],
  ['Respond','Let the world react.','Particles navigate around the obstacle and a marble bounces from its boundary. The physics sketch runs here; camera segmentation is not being performed.']
 ]},
 {id:'playable-replay',app:'apps/playable-replay/',appLabel:'Play real reconstruction',kind:'ACTUAL RECONSTRUCTION · SYNTHETIC SOURCE FOOTAGE',action:'Take control',steps:[
  ['Observe','Recover a motion trace.','Watch the actual exported observations from the Staggered synthetic fixture: detected ball, paddle and remaining bricks, frame by frame.'],
  ['Fit','Predict the next positions.','The exported reconstruction runs its inferred physics from one observed seed and recorded paddle controls. Future ball positions are not resynchronized to the footage.'],
  ['Play','Step into the replay.','Take over a reliable observed frame. Move over the display or use the paddle slider. The original reconstruction engine advances your branch using the inferred physics.']
 ]},
 {id:'intent-lab',source:'https://github.com/Umang-Vekariya/intent-lab',kind:'ACTUAL QWEN + V5 CHECKER · RECORDED REHEARSAL',action:'Next recorded scenario',steps:[
  ['Request','The task comes before the email.','Replay four actual local Qwen3-4B runs recorded on 27 October 2026. The plan is created from the original request before reading external content.'],
  ['Check','Inspect what the agent proposed.','See the recorded tool proposals, trained checker labels, and explicit permission decisions. These are saved run records, not fresh model inference.'],
  ['Receipt','Follow the executed result.','Read the actual answer and mock execution receipts. These familiar rehearsal scenarios overlap development data; they are not an independent benchmark. All tools use fictional data.']
 ]},
 {id:'clubsphere',source:'https://github.com/Umang-Vekariya/clubsphere',kind:'INTERACTIVE EXPLANATION · IN-MEMORY BOOKINGS',action:'Book next student',steps:[
  ['Model','Connect the campus records.','Membership, events and bookings belong to related records. The original system uses nine normalized MySQL tables.'],
  ['Book','Fill seats without overbooking.','This local sketch has two seats. Add fictional students: the first two get seats and later students enter a waitlist.'],
  ['Promote','Give the next student the seat.','Cancel a booking to promote the first waiting student. This demonstrates FIFO behavior in memory, rather than claiming a live database transaction.']
 ]}
];
