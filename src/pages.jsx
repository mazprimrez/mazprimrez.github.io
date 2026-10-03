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
/* Journey chart: each timeline entry becomes a bar on a time axis, read from its `when`
   text ("Aug ’16 — Oct ’20", "May ’25 — Present", "2019"). */
const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
// Start of the named month as a decimal year (e.g. 2016.58), or null without a year.
function parseMonth(s) {
  const y = s.match(/\b(\d{4})\b|[’'‘](\d{2})\b/);
  if (!y) return null;
  const m = MONTHS.indexOf((s.match(/[a-z]{3}/i) || [""])[0].toLowerCase());
  return (y[1] ? +y[1] : 2000 + +y[2]) + Math.max(m, 0) / 12;
}
const shortYear = v => "’" + String(Math.floor(v)).slice(-2);

function journeyChart(timeline) {
  const d = new Date();
  const now = d.getFullYear() + (d.getMonth() + 1) / 12;
  const bars = timeline.map((t, i) => {
    const parts = t.when.split(/\s*[—–-]\s*/);
    const last = parts.length > 1 ? parts[parts.length - 1] : "";
    const ongoing = /present|now|today/i.test(last);
    const parsedStart = parseMonth(parts[0]);
    const parsedEnd = ongoing ? null : parseMonth(last);
    // Undated entries still get a (minimum-width) bar at the present end instead of vanishing.
    const start = parsedStart === null ? now : parsedStart;
    const end = ongoing || parsedStart === null ? now
      : parsedEnd === null ? start + 1 / 12 : parsedEnd + 1 / 12;
    const label = parsedStart === null ? t.when
      : ongoing ? shortYear(start) + "~"
      : parsedEnd === null || Math.floor(parsedEnd) === Math.floor(start) ? shortYear(start)
      : shortYear(start) + "–" + shortYear(parsedEnd);
    return { i, t, start, end, label };
  }).sort((a, b) => b.start - a.start);
  const from = Math.min(...bars.map(b => b.start));
  const to = Math.max(now, ...bars.map(b => b.end));
  const span = Math.max(to - from, 1);
  bars.forEach(b => {
    b.right = (to - b.end) / span * 100;
    b.width = (b.end - b.start) / span * 100;
  });
  return { bars, span };
}

// Photos in the timeline popup: a sideways-scrolling strip.
function PhotoStrip({ photos }) {
  if (!photos.length) return null;
  return (
    <div className="m-photos">
      {photos.map((p, i) => <SiteImg key={p.path || i} image={p} alt={p.alt} loading="lazy" />)}
    </div>
  );
}

function About() {
  const content = useSiteContent();
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
  }, [content]);

  if (!content) return <main className="page about-page"></main>;
  const { about, timeline, skills } = content;
  const entry = open !== null ? timeline[open] : null;
  const journey = journeyChart(timeline);

  return (
    <main className="page about-page">
      <div className="wrap">
        <section className="about-head">
          <div className="hero-photo reveal">
            <Doodles.flower className="doodle" style={{ top: '-22px', right: '-12px' }} />
            <div className="polaroid" style={{ transform: 'rotate(-3deg)' }}>
              <span className="tape t1"></span>
              {about.photo.url && (
                <SiteImg image={about.photo}
                     alt={about.photo.alt || "Mazi Prima Reza"}
                     fetchpriority="high"
                     onError={(e)=>{e.target.style.display='none'; e.target.nextSibling.style.display='grid';}} />
              )}
              <div className="ph" style={{ display: about.photo.url ? 'none' : 'grid' }}>your photo<br/>goes here ✏️</div>
              <span className="cap">Hi, it's me!</span>
            </div>
          </div>
          <div className="intro reveal">
            <span className="eyebrow">a little about me</span>
            <h1>{rich(about.heading)}</h1>
            {about.intro.map((p, i) => (
              <p key={i}>
                {rich(p)}
                {i === about.intro.length - 1 && about.story.length > 0 && (
                  <React.Fragment>
                    {' '}
                    <button className="story-link" type="button"
                            onClick={() => setStoryOpen(o => !o)} aria-expanded={storyOpen}>
                      {storyOpen ? 'show less' : 'read more about it →'}
                    </button>
                  </React.Fragment>
                )}
              </p>
            ))}
          </div>
        </section>

        {storyOpen && (
          <section className="story-body">
            {about.story.map((p, i) => <p key={i}>{rich(p)}</p>)}
          </section>
        )}

        <SecHead eyebrow="where i’ve been ✿" title="My journey so far" />
        <p className="tl-hint reveal">← scroll left to travel back in time</p>
      </div>

      <div className="tl-scroll reveal">
        <div className="journey" style={{ '--years': journey.span.toFixed(2) }}>
          {journey.bars.map(b => (
            <div className="journey-row" key={b.i}>
              <button className="journey-bar" type="button" title={b.t.when} onClick={() => setOpen(b.i)}
                      style={{ right: b.right + '%', width: `max(${b.width}%, var(--bar-min))` }}>
                <span className="journey-text">
                  <span className="journey-org">{b.t.org}</span>
                  <span className="journey-role">{b.t.role}</span>
                </span>
                <span className="journey-when">{b.label}</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="wrap">

        <SecHead eyebrow="my little toolbox" title="Things I work with" />
        <section className="chips reveal">
          {skills.map(s => <span className="tag" key={s}>{s}</span>)}
        </section>

      </div>

      {entry && (
        <div className="tl-modal" onClick={() => setOpen(null)}>
          <div className="tl-modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="tl-close" onClick={() => setOpen(null)} aria-label="Close">✕</button>
            {entry.badge && <span className="tl-badge dark">{entry.badge}</span>}
            <div className="m-when">{entry.when}</div>
            <h3 className="m-role">{entry.role}</h3>
            <div className="m-org">{entry.org}</div>
            <p className="m-desc">{rich(entry.desc)}</p>
            <PhotoStrip photos={entry.photos} />
            {entry.bullets.length > 0 && (
              <div className="m-bulletwrap">
                {entry.bulletsLabel && <div className="m-sublabel">{entry.bulletsLabel}</div>}
                <ul className="m-bullets">
                  {entry.bullets.map((b, k) => (
                    <li key={k}>
                      {b.title && <strong>{b.title}.</strong>}
                      {b.title && b.text && ' '}
                      {rich(b.text)}
                      {b.points.length > 0 && (
                        <ul className="m-bullets">
                          {b.points.map((pt, j) => <li key={j}>{rich(pt)}</li>)}
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {entry.tools.length > 0 && (
              <div className="m-tools">
                <div className="m-sublabel">Tools I reach for ✦</div>
                <ul className="m-bullets">
                  {entry.tools.map((t, k) => <li key={k}>{t}</li>)}
                </ul>
              </div>
            )}
            {entry.details.length > 0 && (
              <div className="m-sublist">
                {entry.detailsLabel && <div className="m-sublabel">{entry.detailsLabel}</div>}
                {entry.details.map((d, k) => (
                  <div className="m-subitem" key={k}>
                    <h4 className="m-sub-role">{d.role}</h4>
                    <div className="m-sub-org">{d.org}</div>
                    <div className="m-sub-when">{d.when}</div>
                    <p className="m-sub-desc">{rich(d.desc)}</p>
                    {d.points.length > 0 && (
                      <ul className="m-bullets">
                        {d.points.map((pt, j) => <li key={j}>{rich(pt)}</li>)}
                      </ul>
                    )}
                    <PhotoStrip photos={d.photos} />
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
  const content = useSiteContent();
  const [active, setActive] = useStateP("all");
  useReveal();
  useEffectP(() => {
    // re-run reveal when filter changes
    document.querySelectorAll('.reveal:not(.in)').forEach(e => e.classList.add('in'));
  }, [active]);

  if (!content) return <main className="page"></main>;
  const projects = content.projects;
  const filters = ["all"];
  projects.forEach(p => p.tags.forEach(t => { if (!filters.includes(t.name)) filters.push(t.name); }));
  const shown = projects.filter(p => active === "all" || p.tags.some(t => t.name === active));

  return (
    <main className="page">
      <div className="wrap">
        <SecHead eyebrow="just for fun!" title="Projects" />
        <p className="proj-intro reveal">
          These aren't my best or my professional work — just little projects I build in my free time.
          Some are examples what I do at work, others are pure curiosity and skill-sharpening ✿
        </p>

        <div className="filters reveal">
          {filters.map(f => (
            <button key={f}
              className={"filter" + (active === f ? " active" : "")}
              onClick={() => setActive(f)}>
              #{f}
            </button>
          ))}
        </div>

        <section className="proj-grid">
          {shown.map(p => (
            <article className="proj-card reveal" key={p.id}>
              {p.clip && <span className="clip">{p.clip}</span>}
              {p.image.url
                ? <SiteImg className="proj-thumb" image={p.image} alt={p.image.alt || p.title} loading="lazy" />
                : <div className="proj-thumb"></div>}
              <div className="proj-body">
                <div className="ptags">
                  {p.tags.map(t => <span className={"tag " + t.color} key={t.name}>#{t.name}</span>)}
                </div>
                <h3>{p.title}</h3>
                <p>{rich(p.desc)}</p>
                <div className="proj-links">
                  {p.links.map((l, j) => (
                    <a key={j} className={l.href ? "" : "muted"}
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
