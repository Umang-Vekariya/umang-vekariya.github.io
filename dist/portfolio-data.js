// Portfolio facts supplied in Umang Vekariya's résumé. No inferred performance claims.
export const profile={
  name:'Umang Vekariya',email:'umangvekariya206@gmail.com',linkedin:'https://www.linkedin.com/in/umangvekariya',location:'Mumbai, India',
  role:'Computer Science · Artificial Intelligence & Machine Learning',
  university:'Vellore Institute of Technology, Vellore',degree:'B.Tech',educationDates:'2024 – Present',cgpa:'9.21',
  focus:'Seeking AI Engineer and Software Engineering internship opportunities.',
  bio:'I’m a Computer Science (AI & ML) undergraduate at VIT Vellore. I build intelligent applications and software systems—from computer vision and local agents to compilers, wireless diagnostics, and infrastructure that keeps working through an internet outage.'
};
export const projects=[
  {id:'wnams',name:'WNAMS',fullName:'Wireless Network Analysis and Mapping System',category:'Systems',kind:'Wireless diagnostics',year:'',visual:'signal',
    short:'Make the invisible network visible.',
    summary:'A full-stack macOS Wi-Fi analysis platform that connects real laptop measurements with calibrated floor-plan mapping, coverage analysis, and network diagnostics.',
    stack:['React','TypeScript','FastAPI','SQLite','NumPy','SciPy','Swift CoreWLAN'],
    architecture:['CoreWLAN measurements','Authenticated survey','IDW / RBF mapping','Analysis & exports'],
    highlights:['Calibrated floor plans and authenticated survey sessions using real laptop measurements.','Five-sample RSSI collection, IDW/RBF coverage heatmaps, and channel-overlap analysis.','ICMP diagnostics and internet throughput testing.','Spatial cross-validation, before/after survey comparisons, and CSV, JSON, and PDF exports with measured and simulated data clearly labeled.'],
    note:'Measurement, interpolation, and validation are separate parts of the workflow. Measured and simulated data are labeled in the platform.',
    detailLabel:'Full-stack macOS platform',featured:true
  },
  {id:'deepfake',name:'Deepfake Detection',fullName:'Deepfake Video Detection using Deep Learning',category:'AI & ML',kind:'Computer vision',visual:'vision',
    short:'Look closer at what looks real.',
    summary:'A video forgery detection system using MobileNetV2 transfer learning to classify authentic and manipulated videos.',
    stack:['Python','TensorFlow','MobileNetV2','OpenCV','NumPy'],
    architecture:['Input video','OpenCV frame extraction','MobileNetV2 classifier','Video-level prediction'],
    highlights:['Used MobileNetV2 transfer learning for authentic-versus-manipulated video classification.','Built an OpenCV preprocessing pipeline to extract video frames and prepare TensorFlow inputs.','Combined frame-level predictions into video-level authenticity predictions.'],
    note:'The pipeline connects video preprocessing, frame classification, and video-level aggregation.',detailLabel:'Deep learning project',featured:true
  },
  {id:'vit-vault',name:'VIT Vault',fullName:'VIT Vault — Resilient Campus Submission Platform',category:'Systems',kind:'Resilient infrastructure',visual:'vault',
    short:'The internet goes down. Work goes on.',
    summary:'Co-developed and deployed an Azure-hosted campus workspace for versioned assignment submissions, course resources, private faculty feedback, and student collaboration.',
    stack:['Python','FastAPI','PostgreSQL','SQLite','Azure Blob / Queue Storage','Docker'],
    architecture:['Campus LAN gateway','Local receipt & outbox','Durable synchronization','Azure verification worker'],
    highlights:['Co-developed an Azure-hosted workspace with versioned submissions, resources, private feedback, and collaboration.','Built a campus LAN gateway for submission during internet outages, with local receipts and durable synchronization.','Added retry deduplication and SHA-256 integrity checks.','Implemented an outbox, a queue-backed verification worker, access-controlled reviews, and isolated non-root Docker coding labs on an Azure VM.'],
    note:'A local gateway, durable outbox, and cloud verification worker support the submission lifecycle.',detailLabel:'Co-developed · Deployed on Azure',featured:true
  },
  {id:'polyglot',name:'PolyGlot',fullName:'PolyGlot — Mixed Syntax Compiler and Browser IDE',category:'Systems',kind:'Compiler engineering',visual:'compiler',
    short:'Different syntax. One execution model.',
    summary:'An educational compiler for a restricted language with six syntax families, paired with a CLI and a browser IDE for inspecting the compilation pipeline.',
    stack:['Python','JavaScript','Typed IR','Custom bytecode VM','Pyodide / WebAssembly'],
    architecture:['Lexer & parser','AST & semantic analysis','Typed IR & optimization','Bytecode & stack VM'],
    highlights:['Built a lexer, parser, AST, semantic analysis, typed intermediate representation, bytecode format, and stack virtual machine.','Implemented arrays, recursion, scope and type checks, and bounded execution.','Added constant folding, branch simplification, and dead-code elimination.','Created a shared CLI and browser IDE with compiler-stage inspection and reusable bytecode artifacts. Browser execution runs through Pyodide in a Web Worker.'],
    note:'An educational language with a restricted scope and six syntax families; execution is bounded.',detailLabel:'Educational compiler & browser IDE',featured:true
  },
  {id:'realityforge',name:'RealityForge',fullName:'RealityForge — Interactive Computer Vision Playground',category:'AI & ML',kind:'Interactive vision',visual:'vision',
    short:'Turn the desk into a world that responds.',
    summary:'A browser prototype that calibrates a planar desk and tracks foreground silhouettes as obstacles for marble collisions, particle avoidance, and creature navigation.',
    stack:['TypeScript','MediaPipe','Web Workers','WebAssembly','HTML Canvas'],
    architecture:['Desk calibration','Silhouette tracking','Hand & gesture controls','Interactive simulation'],
    highlights:['Used a planar desk calibration and foreground silhouettes to drive interactive simulations.','Added local hand and pinch controls and a session-based personal gesture classifier.','Built a clip-annotation evaluation bench.','Evaluated segmentation and tracking on six annotated synthetic clips containing 144 frames, including lighting changes, shadows, and hand occlusion.'],
    note:'Browser prototype. The reported evaluation uses six synthetic clips and 144 annotated frames.',detailLabel:'Browser prototype',featured:false
  },
  {id:'playable-replay',name:'PlayableReplay',fullName:'PlayableReplay — Gameplay Reconstruction and Takeover',category:'AI & ML',kind:'Vision & simulation',visual:'replay',
    short:'From watching a game to stepping inside it.',
    summary:'A seven-stage pipeline that reconstructs supported fixed-camera Breakout footage, fits its physics, and enables reliable-frame player takeover.',
    stack:['Python','OpenCV','NumPy','JavaScript','HTML Canvas'],
    architecture:['Capture & tracking','Contact extraction','Physics fitting','Replay & player takeover'],
    highlights:['Implemented capture, object tracking, contact extraction, physics fitting, reconstruction, takeover, and verification.','Fitted motion and collision parameters on the first 60% of observations.','Evaluated later-frame forecasts and continuous replay on five synthetic fixtures.','Added human-assisted detection corrections, deterministic input replay, and standalone offline game ZIP exports.'],
    note:'Scoped to supported fixed-camera Breakout footage. Evaluation uses five synthetic fixtures, with fitting on the first 60% of observations.',detailLabel:'Fixed-camera Breakout reconstruction',featured:false
  },
  {id:'intent-lab',name:'Intent Lab',fullName:'Intent Lab — Local Agent Action Alignment Experiment',category:'AI & ML',kind:'Agent evaluation',visual:'agent',
    short:'A proposed action deserves a second look.',
    summary:'A local checker that classifies proposed agent actions as aligned, misaligned, or insufficient context using text and action/source features.',
    stack:['Python','scikit-learn','TF-IDF','Logistic Regression','Qwen3-4B','Ollama'],
    architecture:['User intent & proposal','Action / source features','Alignment classifier','Permission check & receipt'],
    highlights:['Built an action checker with aligned, misaligned, and insufficient-context labels.','Integrated Qwen-generated plans, separate permission checks, and execution receipts in a browser demo.','Used fictional, in-memory email tools for the demo.','Collected 36 local Qwen development runs and 72 actual proposals, compared versioned models on frozen synthetic evaluations, and added a queue for independent label review.'],
    note:'A local experiment using fictional in-memory tools and synthetic evaluations. It is not a general safety guarantee.',detailLabel:'Local alignment experiment',featured:false
  },
  {id:'clubsphere',name:'ClubSphere',fullName:'ClubSphere — University Club and Event Management System',category:'Full stack',kind:'Database systems',visual:'clubs',
    short:'Campus activity, with the hard parts handled.',
    summary:'A university club and event management system with student, coordinator, and admin workflows for membership, booking, waitlists, attendance, feedback, and reports.',
    stack:['React','JavaScript','FastAPI','SQLAlchemy','MySQL','JWT'],
    architecture:['Role-based workflows','Booking transactions','FIFO waitlist promotion','Reports & integrity checks'],
    highlights:['Developed student, coordinator, and admin workflows for membership, booking, attendance, feedback, and reports.','Designed nine normalized MySQL tables with keys, constraints, and indexes.','Added two views, two stored procedures, and six integrity triggers.','Implemented row-locked booking transactions, atomic FIFO waitlist promotion, Argon2id password hashing, and server-enforced role and ownership checks.'],
    note:'The database design and transaction flow enforce booking, access, and waitlist integrity.',detailLabel:'Full-stack campus application',featured:false
  }
];
export const experiences=[
  {dates:'MAY — JUL 2026',title:'Software Engineering Intern',organization:'Mahant Solutions',text:'Contributed to full-stack development, feature implementation, debugging, testing, and maintenance. Collaborated through version-control workflows and agile development practices.'},
  {dates:'JUL 2026',title:'Edge AI & Robotics Summer School',organization:'ACM India · IISc Bengaluru',text:'Selected participant in the ACM India Summer School at IISc. Explored edge AI, embedded machine learning, robotics, computer vision, and autonomous systems through expert-led sessions and hands-on activities.'}
];
export const skills=[
  {name:'Languages',items:['Python','C++','Java','C','JavaScript','TypeScript']},
  {name:'AI & computer vision',items:['TensorFlow','OpenCV','MediaPipe','scikit-learn','NumPy','SciPy']},
  {name:'Web & APIs',items:['React','Tailwind CSS','FastAPI','Node.js','Express.js','HTML / CSS']},
  {name:'Data & infrastructure',items:['PostgreSQL','MySQL','MongoDB','SQLite','Azure','AWS S3','Docker','Git']}
];
export const certificates=[
  'Meta Front-End Developer Professional','Meta Advanced React','Meta Programming with JavaScript','Meta Introduction to Front-End Development','Meta React Basics','Meta HTML and CSS in Depth','Meta Coding Interview Preparation','Infosys Understanding Social Styles','Oracle Cloud Infrastructure AI Foundations','Infosys Basics of Python','Meta Version Control','Infosys Communicating to Succeed','Introduction to Generative AI Studio','Infosys Java Programming Fundamentals','Meta Principles of UX/UI Design','Meta Front-End Developer Capstone'
];
