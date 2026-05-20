export const personalInfo = {
  name: 'Harit',
  title: 'Software Engineer & ML Researcher',
  tagline: 'Builder. Researcher. Systems Thinker.',
  location: 'Boston, Massachusetts',
  email: 'harittarwani@gmail.com',
  github: 'github.com/HaritMT25',
  linkedin: 'linkedin.com/in/harit-tarwani',
  website: 'harit.dev',
}

export const education = [
  {
    degree: 'MS Computer Science',
    school: 'Northeastern University — Khoury College of Computer Sciences',
    gpa: '3.67',
    date: 'Expected 2027',
    location: 'Boston, MA',
  },
  {
    degree: 'B.Tech Information Technology',
    school: 'CHARUSAT',
    gpa: '3.9',
    date: '2025',
    location: 'India',
  },
]

export const experience = [
  {
    title: 'Teaching Assistant — DS 4300',
    org: 'Northeastern University',
    date: 'May 2026 – Present',
    details: 'Large-Scale Information Storage & Retrieval under Prof. John Rachlin. Supporting students with NoSQL databases, vector search, indexing strategies, and data pipeline architecture.',
  },
  {
    title: 'Research Intern',
    org: 'Academia Sinica, Taiwan',
    date: 'Jun 2025 – Aug 2025',
    details: 'Conducted computational research at one of Asia\'s premier research institutions, contributing to scientific computing projects and publishing collaborative work.',
  },
  {
    title: 'Research Intern',
    org: 'Physical Research Laboratory, India',
    date: 'Jan 2025 – May 2025',
    details: 'Applied computational methods to scientific research problems at a national research laboratory, working with large-scale datasets and simulation frameworks.',
  },
  {
    title: 'SDE / Data Analytics Intern',
    org: 'Pandya Corporation, India',
    date: 'Feb 2024 – Nov 2024',
    details: 'Built interactive React dashboards and internal tooling to streamline operational reporting across departments. Designed and maintained RESTful APIs using Node.js and Express to serve aggregated business metrics. Developed Power BI and Tableau dashboards that consolidated data from multiple sources, reducing manual reporting cycles by over 60%. Wrote automated ETL scripts to clean and transform raw datasets, improving data reliability for executive decision-making.',
  },
]

export const projects = [
  {
    name: 'HaritOS XP — Portfolio',
    icon: '🖥️',
    tech: ['React', 'Vite', 'CSS', 'Window Manager', 'Groq API'],
    description: 'Interactive Windows XP-themed portfolio with a custom window manager, 10+ apps, boot sequence, Clippy, Minesweeper, and a dual-mode landing page (quick view + full XP experience). Built from scratch — no code copied.',
    color: '#0078d7',
    status: 'Active',
  },
  {
    name: 'HaritBot — AI Assistant',
    icon: '🤖',
    tech: ['Groq', 'Llama 3.3', 'RAG', 'React', 'Prompt Engineering'],
    description: 'AI-powered portfolio assistant with full RAG context of resume, projects, and skills. Embedded inside the XP desktop as an interactive chat app. Answers recruiter questions with genuine technical depth and enthusiasm.',
    color: '#7c3aed',
    status: 'Active',
  },
  {
    name: 'Real-Time Voice Conversion',
    icon: '🎤',
    tech: ['Seed-VC', 'RVC', 'Python', 'Colab Pro', 'A100 GPU'],
    description: 'Hybrid voice conversion app with end-to-end pipeline tested via phone call. Targets both entertainment/content creation and an underserved trans voice changer community.',
    color: '#e74c3c',
    status: 'Active',
  },
  {
    name: 'Roboxers — RL Locomotion',
    icon: '🤖',
    tech: ['MuJoCo', 'mjlab', 'Python', 'RL', 'Colab A100'],
    description: 'Humanoid RL locomotion project achieving ~75–80K steps/sec. Robot learned standing and alternating foot contacts through five major reward function iterations.',
    color: '#3498db',
    status: 'Active',
  },
  {
    name: 'SriDarshan',
    icon: '🕉️',
    tech: ['Java', 'REST APIs', '100+ users'],
    description: 'Gujarati/Hindi chatbot for a local temple community. 8+ integrated REST APIs serving over 100 active users with cultural and religious information.',
    color: '#e67e22',
    status: 'Shipped',
  },
  {
    name: 'Kazam',
    icon: '🎰',
    tech: ['Java 21', 'Spring Boot', 'MVC'],
    description: 'Scratch card promotional platform with architecture documented to senior-engineer standards. Designed with clean separation of concerns and production-grade patterns.',
    color: '#2ecc71',
    status: 'Portfolio',
  },
  {
    name: 'Chess Behavioral Stylometry',
    icon: '♟️',
    tech: ['C++', 'Python', 'HDF5', 'Neural Networks'],
    description: 'Processing lichess PGN files into feature tensors for player style identification. C++ preprocessing pipeline with batch scheduling to eliminate random NFS I/O.',
    color: '#1abc9c',
    status: 'Research',
  },
  {
    name: 'Authorship Verification (PAN2020)',
    icon: '✍️',
    tech: ['NLP', 'Python', 'Stylometry'],
    description: 'Placed 3rd on PAN2020 leaderboard with 82.55% accuracy for authorship verification using stylometric and linguistic features.',
    color: '#f39c12',
    status: 'Complete',
  },
  {
    name: 'AWS Cloud Architecture',
    icon: '☁️',
    tech: ['AWS', 'EC2', 'S3', 'RDS', 'VPC', 'CloudFormation', 'CloudFront'],
    description: 'Designed and deployed a multi-tier web application on AWS across 15+ services, progressing from static S3 hosting to a fully automated, multi-region, fault-tolerant architecture with Auto Scaling, ALB, and IaC-managed deployments.',
    color: '#ff9900',
    status: 'Complete',
  },
  {
    name: 'ParkKing',
    icon: '🅿️',
    tech: ['Java', 'Android', 'Google Maps', 'Firebase'],
    description: 'Android parking management application with real-time availability tracking via Google Maps API and Firebase backend.',
    color: '#34495e',
    status: 'Complete',
  },
]

export const skills = {
  'Languages': {
    items: ['Java', 'Python', 'C++', 'JavaScript', 'TypeScript', 'SQL', 'Bash'],
    color: '#1e5799',
  },
  'ML / AI': {
    items: ['PyTorch', 'TensorFlow', 'Reinforcement Learning', 'NLP', 'Computer Vision', 'Voice/Audio ML', 'Transformers'],
    color: '#e74c3c',
  },
  'Frameworks & Libraries': {
    items: ['Spring Boot', 'React', 'Node.js', 'Express', 'MuJoCo', 'Seed-VC', 'RVC', 'JUnit 5'],
    color: '#27ae60',
  },
  'Data & Visualization': {
    items: ['Power BI', 'Tableau', 'Pandas', 'ETL Pipelines', 'Data Modeling'],
    color: '#8e44ad',
  },
  'Systems & Infrastructure': {
    items: ['Git', 'Docker', 'Linux', 'Google Cloud', 'Firebase', 'Colab Pro', 'CI/CD'],
    color: '#e67e22',
  },
  'Databases': {
    items: ['PostgreSQL', 'MongoDB', 'Redis', 'Neo4j', 'NoSQL', 'HDF5'],
    color: '#9b59b6',
  },
  'Soft Skills': {
    items: ['Leadership', 'Technical Communication', 'Cross-functional Collaboration', 'Mentoring', 'Problem Decomposition', 'Stakeholder Management'],
    color: '#e91e63',
  },
  'Practices': {
    items: ['MVC', 'Design Patterns', 'Mutation Testing (PIT)', 'REST API Design', 'Agile', 'Code Review'],
    color: '#16a085',
  },
}

export const publications = [
  {
    title: 'Authorship Verification — PAN2020',
    authors: 'Harit et al.',
    venue: 'PAN@CLEF 2020',
    description: 'Achieved 82.55% accuracy, 3rd place on the PAN2020 leaderboard for cross-domain authorship verification.',
  },
]
