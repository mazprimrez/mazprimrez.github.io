// ============================================================
//  Pages
// ============================================================
const { useState: useStateP, useEffect: useEffectP } = React;

/* ===================== HOME ===================== */
function Home() {
  useReveal();
  const doItems = [
    { ic: '🤖', label: 'Generative AI', tip: 'Building AI tools that automate daily tasks and boost productivity.' },
    { ic: '📈', label: 'End-to-End ML', tip: 'Recommendation systems, churn prediction, media investment — data to deployment.' },
    { ic: '🎓', label: 'Teaching & Mentoring', tip: 'Helping the next wave of data scientists find their footing.' },
  ];
  return (
    <main className="page home-page">
      <div className="wrap home-inner">
        <section className="hero">
          <div className="hero-text">
            <span className="eyebrow hero-ey">hi there, welcome!</span>
            <h1>
              I’m <span className="name">Mazi</span> <span className="wave">👋🏼</span>
            </h1>
            <p className="role">An <span className="hl">AI Engineer</span> &amp; <span className="hl">Data Scientist</span></p>
            <p className="lead">
              With 5+ years of experience building AI &amp; ML solutions powered by
              millions of data.
            </p>

            {/* What I get up to — compact icon chips */}
            <span className="eyebrow do-ey">this is what i do ✿</span>
            <div className="do-row">
              {doItems.map(d => (
                <div className="do-chip" key={d.label} title={d.tip}>
                  <span className="ic">{d.ic}</span>
                  <span className="do-label">{d.label}</span>
                </div>
              ))}
            </div>

            <div className="hero-cta">
              <a className="btn" href="#/contact">Say hello →</a>
              <a className="btn ghost" href="#/about">Read my story →</a>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

/* ===================== ABOUT ===================== */
function About() {
  const [open, setOpen] = useStateP(null);
  const [storyOpen, setStoryOpen] = useStateP(false);
  useReveal();
  useEffectP(() => {
    const onKey = (e) => { if (e.key === 'Escape') setOpen(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  // start the timeline scrolled to the right (newest), so visitors scroll left into the past
  useEffectP(() => {
    const sc = document.querySelector('.tl-scroll');
    if (!sc) return;
    const toEnd = () => { sc.scrollLeft = sc.scrollWidth; };
    toEnd();
    requestAnimationFrame(toEnd);
    const t = setTimeout(toEnd, 250);
    return () => clearTimeout(t);
  }, []);
  return (
    <main className="page about-page">
      <div className="wrap">
        <section className="about-head">
          <div className="hero-photo reveal">
            <Doodles.flower className="doodle" style={{ top: '-22px', right: '-12px' }} />
            <div className="polaroid" style={{ transform: 'rotate(-3deg)' }}>
              <span className="tape t1"></span>
              <img src="assets/images/me.jpg"
                   alt="Mazi Prima Reza"
                   onError={(e)=>{e.target.style.display='none'; e.target.nextSibling.style.display='grid';}} />
              <div className="ph" style={{ display: 'none' }}>your photo<br/>goes here ✏️</div>
              <span className="cap">Hi, it's me!</span>
            </div>
          </div>
          <div className="intro reveal">
            <span className="eyebrow">a little about me</span>
            <h1>I’m a Data Scientist &amp; AI Engineer who works <em>from Jakarta, Indonesia</em>.</h1>
            <p>
              I’m based with an IT consulting company in Jakarta, Indonesia. Over the past few years
              I’ve built many end-to-end projects ML prediction to Agentic AI. Widely used by various companies from various industries.
            </p>
            <p>
              These days I mainly focus on building AI products that automate daily tasks, improve
              productivity and enhance user experience. Powered by Generative AI and Machine Learning.
              This story was started back in 2013 …{' '}
              <button className="story-link" type="button"
                      onClick={() => setStoryOpen(o => !o)} aria-expanded={storyOpen}>
                {storyOpen ? 'show less' : 'read more about it →'}
              </button>
            </p>
          </div>
        </section>

        {storyOpen && (
          <section className="story-body">
            <p>
              Starting from <strong>Tumblr.com in 2013</strong>, I was a young girl who found sparks in
              customizing my Tumblr blog interface. Every day, after school, I would go back home, open my laptop, and dive into the world of HTML, CSS, and JavaScript. I surfed the web for Tumblr tutorials and eagerly experimented with different layouts. This daily ritual sparked my passion for web development and taught me the fundamentals of coding.
            </p>
            <p>
              Back to 17, when I began planning for university, I realized my hobby could transform into a career. My heart was set on joining a Computer Science related major. However, insecurities held me back, and I decided to pursue a degree in <strong>Mathematics at ITB</strong> instead.
            </p>
            <p>
              In my final year, I took a course called <strong>Deep Learning</strong> (<em>Pembelajaran
              Mendalam</em>) that revealed how Machine Learning and Deep Learning algorithms work from a
              mathematical perspective. I <strong>LOVE</strong> how creative the basic idea is — minimizing the gap between the predicted and actual values using optimization algorithms and repeat the process until the gap close to 0.
            </p>
            <p>
              Yet, the desire to involve myself in technology never vanished, the Deep Learning class lighted the sparks again. I continued my journey and discovered a love for data science and artificial intelligence. This path has led me to become a <strong>Data Scientist and AI Engineer</strong> — fulfilling my dream of being a woman in tech. ✿
            </p>
          </section>
        )}

        <SecHead eyebrow="how it all unfolded" title="My journey so far" />
        <p className="tl-hint reveal">← scroll left to travel back in time</p>
      </div>

      <div className="tl-scroll reveal">
        <div className="tl-track">
          {TIMELINE.map((t, i) => (
            <div className={"tl-item " + (i % 2 === 0 ? "up" : "down") + (t.highlight ? " latest" : "")} key={i}>
              <button className="tl-card" type="button" onClick={() => setOpen(i)}>
                {t.badge && <span className="tl-badge">{t.badge}</span>}
                <div className="when">{t.when}</div>
                <div className="role">{t.role}</div>
                <div className="org">{t.org}</div>
                <div className="desc">{t.desc}</div>
                <span className="tl-more">read more →</span>
              </button>
              <span className="tl-dot"></span>
            </div>
          ))}
        </div>
      </div>

      <div className="wrap">

        <SecHead eyebrow="my little toolbox" title="Things I work with" />
        <section className="chips reveal">
          {SKILLS.map(s => <span className="tag" key={s}>{s}</span>)}
        </section>

      </div>

      {open !== null && (
        <div className="tl-modal" onClick={() => setOpen(null)}>
          <div className="tl-modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="tl-close" onClick={() => setOpen(null)} aria-label="Close">✕</button>
            {TIMELINE[open].badge && <span className="tl-badge dark">{TIMELINE[open].badge}</span>}
            <div className="m-when">{TIMELINE[open].when}</div>
            <h3 className="m-role">{TIMELINE[open].role}</h3>
            <div className="m-org">{TIMELINE[open].org}</div>
            <p className="m-desc">{TIMELINE[open].desc}</p>
            {TIMELINE[open].bullets && (
              <div className="m-bulletwrap">
                {TIMELINE[open].bulletsLabel && (
                  <div className="m-sublabel">{TIMELINE[open].bulletsLabel}</div>
                )}
                <ul className="m-bullets">
                  {TIMELINE[open].bullets.map((b, k) => (
                    <li key={k}>
                      {b.title ? <><strong>{b.title}.</strong>{b.text ? ` ${b.text}` : ''}</> : b}
                      {b.points && (
                        <ul className="m-bullets">
                          {b.points.map((pt, j) => <li key={j}>{pt}</li>)}
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {TIMELINE[open].tools && (
              <div className="m-tools">
                <div className="m-sublabel">Tools I reach for ✦</div>
                <ul className="m-bullets">
                  {TIMELINE[open].tools.map((t, k) => <li key={k}>{t}</li>)}
                </ul>
              </div>
            )}
            {TIMELINE[open].details && (
              <div className="m-sublist">
                <div className="m-sublabel">What I’ve mentored ✦</div>
                {TIMELINE[open].details.map((d, k) => (
                  <div className="m-subitem" key={k}>
                    <h4 className="m-sub-role">{d.role}</h4>
                    <div className="m-sub-org">{d.org}</div>
                    <div className="m-sub-when">{d.when}</div>
                    <p className="m-sub-desc">{d.desc}</p>
                    {d.points && (
                      <ul className="m-bullets">
                        {d.points.map((pt, j) => <li key={j}>{pt}</li>)}
                      </ul>
                    )}
                    {d.img && <img className="m-sub-img" src={d.img} alt={d.role} loading="lazy" />}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}

/* ===================== PROJECTS ===================== */
function Projects() {
  const [active, setActive] = useStateP("all");
  useReveal();
  useEffectP(() => {
    // re-run reveal when filter changes
    document.querySelectorAll('.reveal:not(.in)').forEach(e => e.classList.add('in'));
  }, [active]);

  const shown = PROJECTS.filter(p => active === "all" || p.cats.includes(active));

  return (
    <main className="page">
      <div className="wrap">
        <SecHead eyebrow="just for fun!" title="Projects" />
        <p className="proj-intro reveal">
          These aren't my best or my professional work — just little projects I build in my free time.
          Some are examples what I do at work, others are pure curiosity and skill-sharpening ✿
        </p>

        <div className="filters reveal">
          {FILTERS.map(f => (
            <button key={f}
              className={"filter" + (active === f ? " active" : "")}
              onClick={() => setActive(f)}>
              #{f}
            </button>
          ))}
        </div>

        <section className="proj-grid">
          {shown.map((p, i) => (
            <article className="proj-card reveal" key={p.title}>
              <span className="clip">{p.clip}</span>
              <img className="proj-thumb" src={p.img} alt={p.title} loading="lazy" />
              <div className="proj-body">
                <div className="ptags">
                  {p.tags.map(([t, c]) => <span className={"tag " + c} key={t}>#{t}</span>)}
                </div>
                <h3>{p.title}</h3>
                <p>{p.desc}</p>
                <div className="proj-links">
                  {p.links.map((l, j) => (
                    <a key={j} className={l.muted ? "muted" : ""}
                       href={l.href || "#"} target={l.href ? "_blank" : undefined} rel="noreferrer">
                      {l.label}
                    </a>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </section>

        {shown.length === 0 && (
          <p style={{ textAlign: 'center', color: 'var(--ink-faint)', fontFamily: 'var(--hand)', fontSize: '1.6rem' }}>
            nothing here yet — more coming soon! ✨
          </p>
        )}
      </div>
    </main>
  );
}

/* ===================== CONTACT ===================== */
function Contact() {
  useReveal();
  const socials = [
    { name: "LinkedIn", cls: "li", href: "https://www.linkedin.com/in/maziprimareza/",
      icon: (<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z"/></svg>) },
    { name: "GitHub", cls: "gh", href: "https://github.com/mazprimrez",
      icon: (<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .5C5.7.5.5 5.7.5 12c0 5.1 3.3 9.4 7.9 10.9.6.1.8-.2.8-.5v-1.8c-3.2.7-3.9-1.5-3.9-1.5-.5-1.3-1.3-1.7-1.3-1.7-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.7 1.3 3.4 1 .1-.7.4-1.3.7-1.6-2.6-.3-5.3-1.3-5.3-5.7 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.6 1.6.2 2.8.1 3.1.8.8 1.2 1.8 1.2 3.1 0 4.4-2.7 5.4-5.3 5.7.4.3.8 1 .8 2.1v3.1c0 .3.2.6.8.5 4.6-1.5 7.9-5.8 7.9-10.9C23.5 5.7 18.3.5 12 .5z"/></svg>) },
    { name: "Email", cls: "em", href: "mailto:maziprimareza@gmail.com",
      icon: (<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M2 6.5C2 5.7 2.7 5 3.5 5h17c.8 0 1.5.7 1.5 1.5v11c0 .8-.7 1.5-1.5 1.5h-17C2.7 19 2 18.3 2 17.5v-11zm2 .3v.2l8 5.2 8-5.2v-.2H4zm16 2.4-7.5 4.8c-.3.2-.7.2-1 0L4 9.2v8.3h16V9.2z"/></svg>) },
  ];
  return (
    <main className="page contact-page">
      <div className="contact-hero">
        <h1 className="reveal">Let’s connect <span style={{ fontFamily: 'var(--serif)' }}>✿</span></h1>
        <div className="soc-row reveal">
          {socials.map(s => (
            <a key={s.name} className={"soc-tile " + s.cls} href={s.href}
               target={s.cls === 'em' ? undefined : "_blank"} rel="noreferrer"
               aria-label={s.name} title={s.name}>
              {s.icon}
            </a>
          ))}
        </div>
        <p className="reveal contact-sign">talk soon!</p>
      </div>
    </main>
  );
}

Object.assign(window, { Home, About, Projects, Contact });
