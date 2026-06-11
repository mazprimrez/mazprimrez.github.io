// ============================================================
//  Shared data + components
// ============================================================
const { useState, useEffect, useRef } = React;

/* ---------- Content data ---------- */
const NAV = [
  { path: '#/',         label: 'Home' },
  { path: '#/about',    label: 'About' },
  { path: '#/projects', label: 'Projects' },
  { path: '#/contact',  label: 'Contact' },
];

const TIMELINE = [
  { when: "Aug ’16 — Oct ’20", role: "B.Sc. Mathematics", org: "Institut Teknologi Bandung",
    desc: "Mathematics major — the foundation behind every model I build.",
    bulletsLabel: "Highlights ✦",
    bullets: [
      { title: "Thesis", text: "\"ASABRI and JIWASRAYA Stock Portfolio Optimization using the Adaptive Spiral Optimization Method.\"" },
      { title: "Published scientific papers", points: [
        "Thrust profile optimisation for small inclination changes: a case study on LAPAN-A4.",
        "Mathematical Modeling and Sensitivity Analysis of the Existence of a Male Calico Cat Population Based on Cross-Breeding of All Coat-Colour Types.",
      ] },
      { title: "Leadership", text: "Contributed to several organizations — mostly as Head of Department or Division — at HIMATIKA ITB (Mathematics Students Association) and UBALA ITB (Lampung Students Association)." },
    ] },
  { when: "Nov ’20 — May ’24", role: "Data Scientist", org: "Vidio",
    desc: "Vidio is Indonesia's leading streaming service. Based in Jakarta, I built end-to-end ML across recommendation, growth, and retention — and helped raise engineering standards on the team.",
    bulletsLabel: "Notable projects ✦",
    bullets: [
      { title: "Recommendation System", text: "Implemented a collaborative-filtering model using cosine similarity — achieving Recall@20 of 0.2 and lifting CTR by over 10%, outperforming existing models." },
      { title: "Predictive Modeling", text: "Partnered with marketing to identify persuadable non-subscribers, building TensorFlow neural networks with 87% AUC that drove a 20% conversion rate." },
      { title: "Churn Prediction", text: "Reduced churn with ML models at 90% accuracy, analyzing user behavior to inform retention marketing strategies." },
      { title: "Engineering Best Practices", text: "Introduced Test-Driven Development across the team, writing unit and integration tests with PyTest to increase code coverage." },
    ] },
  { when: "Jan ’22 — Present", role: "Teacher & Mentor", org: "Various Programs",
    desc: "Teaching and mentoring aspiring data scientists across several programs — something I still do today.",
    highlight: true, badge: "★ Still going",
    details: [
      { role: "Data Science & AI Mentor · Curriculum Developer", org: "Hacktiv8", when: "Mar 2025 — Present",
        desc: "Hacktiv8 is a famous educational technology platform that transforms complete beginners into an IT professional. Mentoring and building curriculum across Hacktiv8's Data Science and AI programs:",
        points: [
          "Developed and structured comprehensive curriculum materials for several Generative AI workshops.",
          "Mentored hundreds of participants at Hacktiv8 events including Samsung Innovation Campus Batch 6, the Meta Hackathon, the Maju Bareng AI program, and many more.",
          "Served as a judge — identifying and selecting the best projects at the Meta and IBM Hackathons.",
        ] },
      { role: "Data Science Mentor", org: "ARKAVIDIA", when: "Mar 2025",
        desc: "AKAVIDIA ITB is a technology event held by the Association of Informatics Engineering Students (HMIF ITB). Guided a team through every stage of the competition — from exploratory data analysis and feature engineering to modeling. The team went on to win Top 1 Best Project." },
      { role: "Mentor of Dashboard & Analytics Competition", org: "Compfest UI", when: "Mar 2024 — Jul 2024",
        desc: "Compfest UI is a technology event held by the Computer Science Faculty, Universitas Indonesia. As a mentor, I helped 4 finalists build analysis and dashboards on education data — guiding them from framing the problem, to storytelling, to visualization." },
      { role: "AI & IoT Mentor · Samsung Innovation Campus Batch 5 & 6", org: "Samsung Indonesia", when: "2024 — 2025",
        desc: "Samsung Innovation Campus is a bootcamp and competition by Samsung Indonesia for high school and university students focused on building AI and IoT projects that solve real-world problems.",
        points: [
          "Introduced 1,000+ high school and university students to the fundamentals of Artificial Intelligence and the Internet of Things through the SIC Batch 5 & 6 programs.",
          "Intensively mentored 6 student teams (24 students) in the SIC 5 competition on project ideation, technical feasibility, and presentation skills — resulting in 4 teams reaching the top 40 (of 100), 2 teams the top 20, and 1 team the top 10 finalist status.",
          "Delivered advanced AI & IoT training to 24 students in the SIC Bootcamp, covering Machine Learning, Computer Vision, GenAI, and IoT fundamentals.",
        ] },
      { role: "Data Science Mentor", org: "Generation Girls", when: "May 2022 — Mar 2023",
        desc: "Generation Girls is a non-profit organization aims to promote STEM to the young generations. A series of teaching and mentoring engagements with Generation Girls:",
        points: [
          "Mar 2023 — Computer Science 101 mentor on the Spring Club Explorer program.",
          "Dec 2022 — Teaching assistant for GenG's Hour of Code, Intermediate class.",
          "Sep–Nov 2022 — Mentor and teaching assistant for the Data Science for Kids program, in collaboration with YCAB (Yayasan Cinta Anak Bangsa) and the Ministry of Communication and Information Technology.",
          "May–Jun 2022 — Co-built a data science curriculum for high schoolers and mentored 25 students over five consecutive days at the Summer Club 2022 program.",
        ] },
      { role: "Local Volunteer — SUMMARY 2.0: Widyawiyata", org: "AIESEC in Universitas Lampung", when: "Jan 2022",
        desc: "Taught Lampung high school students about culture, environment, and education amid pandemic challenges — alongside international buddies from Central Asia and Latin America." },
    ] },
  { when: "Apr ’24 — May ’25", role: "AI Engineer", org: "Metrodata",
    desc: "Metrodata is one of Indonesia's largest IT companies. As an AI Engineer at the consulting arm, I worked with several leading Indonesian companies across industries to build automation products powered by Machine Learning and Generative AI.",
    bulletsLabel: "Notable projects ✦",
    bullets: [
      { title: "Speaker & Consultant", text: "Led AI/ML workshops for major Indonesian companies as a speaker and mentor — advising on Generative AI and Machine Learning implementations with solutions tailored to each company's use case." },
      { title: "Chatbot Development", text: "Built chatbots for major Indonesian organizations — including government agencies and a leading food & beverage company — on Microsoft Azure, integrating vector & NoSQL databases, RAG, GPT models, and REST APIs to answer context-aware queries. Improved response accuracy by over 50% through a custom indexing process." },
      { title: "Research & Experimentation", text: "Pioneered indexing and chunking best practices for RAG — improvements now widely adopted across the team." },
      { title: "Achievements", text: "Awarded Best Partner in AI Innovation 2024 by Microsoft Indonesia." },
      { title: "Certifications", text: "Microsoft Azure AI Fundamentals (940/1000) — and more to come." },
    ],
    tools: [
      "Azure AI Services — Azure OpenAI, Azure ML, Azure AI Search, Document Intelligence, Speech",
      "Python for chatbots — LangChain, LangGraph",
      "Python for data science — pandas, scikit-learn, TensorFlow",
      "Python for deployment — Flask, Streamlit, Function Apps",
    ] },
  { when: "May ’25 — Present", role: "Data Scientist", org: "Artefact",
    desc: "Artefact is a global leader in data and AI consulting services dedicated to transforming data into business impact.",
    highlight: true, badge: "★ Latest",
    bulletsLabel: "Notable projects ✦",
    bullets: [
      "Developed a Share of Voice analytics solution on GCP Vertex AI Workbench — owning the end-to-end pipeline from data ingestion and DBT transformation to automated feature engineering and model deployment, giving clients market visibility and sharper investment decisions across five countries.",
      "Built an end-to-end leads identification pipeline combining Google Maps API geospatial extraction with ML classification across 29 Asia-Pacific cities — expanding the client's targetable leads by 50%.",
    ],
  tools: [
      "Google AI Services — AI Vertex, Google Workstation, Cloud Run",
      "Python for chatbots — LangChain, LangGraph",
      "Python for data science — pandas, scikit-learn, TensorFlow",
      "Python for deployment — Flask, Streamlit, Function Apps",
    ] },
];

const SKILLS = [
  "Python", "Generative AI", "LLMs / RAG", "Machine Learning", "Recommendation Systems",
  "Time Series", "NLP", "BERTopic", "XGBoost", "Prophet", "Tableau", "SQL",
];

const PROJECTS = [
  {
    title: "Beating My Own Self in Guessing Taylor Swift Eras Tour Outfit",
    desc: "Using time series for categorical data to win the Eras Tour Mastermind game — one of my favorite tour rituals turned into a modeling experiment.",
    img: "assets/images/eras-tour-outfit.jpg",
    cats: ["time-series"], tags: [["time-series","honey"]],
    links: [{ label: "Medium", href: "https://medium.com/@sparklingdust/beating-my-own-self-on-swift-alert-mastermind-game-in-guessing-taylor-swift-eras-tour-outfit-52b6535e0d8f" }, { label: "GitHub (soon)", muted: true }],
    clip: "📌",
  },
  {
    title: "Topic Extraction · Instagram App Reviews, July 2023",
    desc: "End-to-end project extracting topics from Instagram reviews so teams get a clear overview of their issues — a semi-supervised approach with BERTopic and XGBoost.",
    img: "assets/images/text-segmentation.png",
    cats: ["classification","nlp"], tags: [["nlp","lilac"],["classification","blue"]],
    links: [{ label: "Tableau", href: "https://public.tableau.com/app/profile/mazi.prima.reza/viz/InstagramAppReviewsinJuly2023/InstagramAppReviewsDashbaord" }, { label: "Deck", href: "https://docs.google.com/presentation/d/14WpJBWfw3LVZ0KR71z8a_MGAAvkj14owe7L0-RZ9g10/edit?usp=sharing" }, { label: "GitHub (soon)", muted: true }],
    clip: "🔖",
  },
  {
    title: "Ecommerce Sales Forecast using Prophet",
    desc: "Accurate sales prediction for the supply chain — aligning stock with anticipated demand to reduce stockouts and excess inventory.",
    img: "assets/images/prophet.png",
    cats: ["time-series"], tags: [["time-series","honey"]],
    links: [{ label: "Kaggle", href: "https://www.kaggle.com/code/maziprimareza/ecommerce-sales-forecast-using-prophet" }, { label: "Deck", href: "https://docs.google.com/presentation/d/14KyGeSOj47n4IV8Rlz7MTYMQG3Dqpc-AnM5rN0GRlEc/edit?usp=sharing" }],
    clip: "📎",
  },
  {
    title: "Zeeflix — Multistage Recommendation System",
    desc: "A multi-stage recommendation web-app: candidate retrieval followed by a learning-to-rank stage to generate better recommendations for users.",
    img: "assets/images/zeeflix.png",
    cats: ["rec-sys"], tags: [["rec-sys","sage"]],
    links: [{ label: "Web app", href: "https://zeeflix-5e68.onrender.com/" }, { label: "GitHub", href: "https://github.com/mazprimrez/zeeflix" }],
    clip: "📌",
  },
  {
    title: "Los Angeles Restaurants Information Dashboard",
    desc: "Ratings, popularity, reviews and location for restaurants across Los Angeles — scraped from Yelp and visualized in Tableau.",
    img: "assets/images/dashboard.png",
    cats: ["dashboard"], tags: [["dashboard","blue"]],
    links: [{ label: "Tableau", href: "https://public.tableau.com/app/profile/mazi.prima.reza/viz/Book2_16338472311500/Dashboard1" }],
    clip: "🔖",
  },
];

const FILTERS = ["all", "classification", "rec-sys", "time-series", "nlp", "dashboard"];

const CONTACTS = [
  { ic: "💼", lbl: "LinkedIn", val: "in/maziprimareza", href: "https://www.linkedin.com/in/maziprimareza/" },
  { ic: "🐙", lbl: "GitHub",   val: "github.com/mazprimrez", href: "https://github.com/mazprimrez" },
  { ic: "✉️", lbl: "Email",    val: "maziprimareza@gmail.com", href: "mailto:maziprimareza@gmail.com" },
];

/* ---------- Scroll reveal hook ---------- */
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal:not(.in)');
    if (!('IntersectionObserver' in window)) { els.forEach(e => e.classList.add('in')); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en, i) => {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    els.forEach(e => io.observe(e));
    return () => io.disconnect();
  });
}

/* ---------- Navbar ---------- */
function Nav({ route }) {
  return (
    <nav className="nav">
      <div className="nav-inner">
        <ul className="nav-links">
          {NAV.map(n => (
            <li key={n.path}>
              <a href={n.path} className={route === n.path ? "active" : ""}>{n.label}</a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

/* ---------- Footer ---------- */
function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <span>Made with Opus 4.8, human touch, and a little <span className="heart">♥</span> © {new Date().getFullYear()} Mazi Prima Reza</span>
        <div className="footer-soc">
          <a href="https://github.com/mazprimrez" target="_blank" rel="noreferrer">GitHub</a>
          <a href="https://www.linkedin.com/in/maziprimareza/" target="_blank" rel="noreferrer">LinkedIn</a>
          <a href="mailto:maziprimareza@gmail.com">Email</a>
        </div>
      </div>
    </footer>
  );
}

/* ---------- Section heading ---------- */
function SecHead({ eyebrow, title }) {
  return (
    <div className="sec-head reveal">
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      <h2>{title}</h2>
    </div>
  );
}

/* ---------- Doodle squiggle SVGs (decoration) ---------- */
const Doodles = {
  star: (props) => (
    <svg width="34" height="34" viewBox="0 0 34 34" fill="none" {...props}>
      <path d="M17 3l3.2 8.1 8.8.5-6.8 5.6 2.3 8.5L17 21.7 9.5 26.3l2.3-8.5-6.8-5.6 8.8-.5L17 3z" stroke="#F4A6C0" strokeWidth="2" strokeLinejoin="round"/>
    </svg>
  ),
  heart: (props) => (
    <svg width="30" height="30" viewBox="0 0 30 30" fill="none" {...props}>
      <path d="M15 26C7 20 3 15 3 10.5 3 7 5.8 4.5 9 4.5c2.3 0 4.5 1.4 6 3.6 1.5-2.2 3.7-3.6 6-3.6 3.2 0 6 2.5 6 6C27 15 23 20 15 26z" stroke="#EC85A6" strokeWidth="2"/>
    </svg>
  ),
  flower: (props) => (
    <svg width="34" height="34" viewBox="0 0 34 34" fill="none" {...props}>
      <g stroke="#EC85A6" strokeWidth="2" strokeLinejoin="round">
        <ellipse cx="17" cy="7" rx="4.4" ry="5.6"/>
        <ellipse cx="17" cy="27" rx="4.4" ry="5.6"/>
        <ellipse cx="7" cy="17" rx="5.6" ry="4.4"/>
        <ellipse cx="27" cy="17" rx="5.6" ry="4.4"/>
      </g>
      <circle cx="17" cy="17" r="3.4" fill="#F4A6C0" stroke="#EC85A6" strokeWidth="1.6"/>
    </svg>
  ),
  spark: (props) => (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none" {...props}>
      <path d="M13 1c.6 5.6 5.4 10.4 11 11-5.6.6-10.4 5.4-11 11-.6-5.6-5.4-10.4-11-11C7.6 11.4 12.4 6.6 13 1z" stroke="#F4A6C0" strokeWidth="1.8" strokeLinejoin="round"/>
    </svg>
  ),
  arrow: (props) => (
    <svg width="70" height="50" viewBox="0 0 70 50" fill="none" {...props}>
      <path d="M4 8c18 4 34 16 40 36" stroke="#EC85A6" strokeWidth="2.4" strokeLinecap="round"/>
      <path d="M44 44c-3-5-6-8-12-9M44 44c1-6 1-10 4-14" stroke="#EC85A6" strokeWidth="2.4" strokeLinecap="round"/>
    </svg>
  ),
};

Object.assign(window, { useReveal, Nav, Footer, SecHead, Doodles,
  NAV, TIMELINE, SKILLS, PROJECTS, FILTERS, CONTACTS });
