// ============================================================
//  Admin · edit site content (Firebase Auth + Storage + Firestore)
// ============================================================
const { useState: useStateA, useEffect: useEffectA, useRef: useRefA } = React;

// Must match isAdmin() in the Firestore and Storage security rules.
const ADMIN_EMAIL = "mazprimrez@gmail.com";
const MAX_EDGE = 1600;
const JPEG_QUALITY = 0.8;

firebase.initializeApp(FIREBASE_CONFIG);
const fbAuth = firebase.auth();
const fbStorage = firebase.storage();
const contentDocRef = firebase.firestore().doc("website/content");

/* ---------- Image compression + upload ---------- */
async function decodeImage(file) {
  try {
    const bmp = await createImageBitmap(file);
    return { source: bmp, width: bmp.width, height: bmp.height, done: () => bmp.close() };
  } catch (e) {
    // Fallback for formats createImageBitmap can't read but <img> can (e.g. HEIC in Safari).
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.src = url;
    try { await img.decode(); }
    catch (err) { URL.revokeObjectURL(url); throw new Error(`Can't read ${file.name} — try exporting it as JPEG.`); }
    return { source: img, width: img.naturalWidth, height: img.naturalHeight, done: () => URL.revokeObjectURL(url) };
  }
}

function hasTransparency(ctx, w, h) {
  const px = ctx.getImageData(0, 0, w, h).data;
  for (let i = 3; i < px.length; i += 4) if (px[i] < 255) return true;
  return false;
}

async function compressImage(file) {
  const img = await decodeImage(file);
  const scale = Math.min(1, MAX_EDGE / Math.max(img.width, img.height));
  const w = Math.round(img.width * scale);
  const h = Math.round(img.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img.source, 0, 0, w, h);
  img.done();

  const png = file.type !== "image/jpeg" && hasTransparency(ctx, w, h);
  const type = png ? "image/png" : "image/jpeg";
  let blob = await new Promise(res => canvas.toBlob(res, type, JPEG_QUALITY));
  if (scale === 1 && file.type === type && file.size <= blob.size) blob = file;
  return { blob, type, ext: png ? "png" : "jpg" };
}

async function uploadImage(file, onProgress) {
  const { blob, type, ext } = await compressImage(file);
  const base = file.name.replace(/\.[^.]+$/, "").toLowerCase()
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40) || "photo";
  const path = `website/${Date.now()}-${base}.${ext}`;
  const ref = fbStorage.ref(path);
  const task = ref.put(blob, { contentType: type, cacheControl: "public,max-age=31536000" });
  task.on("state_changed", s => onProgress(s.bytesTransferred / s.totalBytes));
  await task;
  return { url: await ref.getDownloadURL(), path, alt: "", size: blob.size };
}

/* ---------- Helpers ---------- */
const fileName = path => (path || "").split("/").pop();
const kb = n => n >= 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.round(n / 1024)} KB`;
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const patch = (obj, p) => Object.assign({}, obj, p);
const newId = () => "p" + Date.now().toString(36);

// Immutable list edits for an editor that owns `items` and reports changes via onChange.
function listOps(items, onChange) {
  return {
    update: (i, p) => onChange(items.map((it, j) => j === i ? patch(it, p) : it)),
    move: (i, d) => {
      const next = items.slice();
      const [it] = next.splice(i, 1);
      next.splice(i + d, 0, it);
      onChange(next);
    },
    remove: i => onChange(items.filter((_, j) => j !== i)),
    add: item => onChange(items.concat([item])),
  };
}

function pathsInUse(c) {
  if (!c) return [];
  return [c.about.photo, ...c.projects.map(p => p.image)].map(i => i && i.path).filter(Boolean);
}

function errorText(e) {
  if (e && e.code && /permission|unauthorized/.test(e.code)) {
    return "Permission denied — check the website/ rules in Firestore and Storage.";
  }
  return (e && e.message) || String(e);
}

const NEW_ENTRY = {
  when: "", role: "New role", org: "", desc: "", badge: "", highlight: false,
  bulletsLabel: "Notable projects ✦", bullets: [], tools: [], detailsLabel: "", details: [],
};
const NEW_BULLET = { title: "", text: "", points: [] };
const NEW_DETAIL = { role: "", org: "", when: "", desc: "", points: [] };
const RICH_HINT = "Use **bold** and *italic*.";

/* ---------- Form building blocks ---------- */
function Field({ label, hint, value, onChange, multiline, rows, placeholder, className }) {
  return (
    <label className={"adm-field " + (className || "")}>
      <span className="adm-label">{label}</span>
      {multiline
        ? <textarea className="adm-input" rows={rows || 3} value={value} placeholder={placeholder}
                    onChange={e => onChange(e.target.value)} />
        : <input className="adm-input" value={value} placeholder={placeholder}
                 onChange={e => onChange(e.target.value)} />}
      {hint && <span className="adm-field-hint">{hint}</span>}
    </label>
  );
}

// One list item per line. Blank lines are kept while typing and dropped on save.
function LinesField({ label, hint, value, onChange, rows }) {
  return (
    <Field label={label} hint={hint || "One per line."} multiline rows={rows || Math.max(3, value.length + 1)}
           value={value.join("\n")} onChange={v => onChange(v.split("\n"))} />
  );
}

function ItemControls({ index, count, onMove, onRemove, removeLabel }) {
  return (
    <div className="adm-controls">
      <button type="button" className="adm-icon" disabled={index === 0}
              onClick={() => onMove(index, -1)} aria-label="Move up">↑</button>
      <button type="button" className="adm-icon" disabled={index === count - 1}
              onClick={() => onMove(index, 1)} aria-label="Move down">↓</button>
      <button type="button" className="adm-link danger"
              onClick={() => { if (confirm(`Remove this ${removeLabel}?`)) onRemove(index); }}>Remove</button>
    </div>
  );
}

function ParagraphList({ label, items, onChange }) {
  const ops = listOps(items, onChange);
  return (
    <div className="adm-group">
      <span className="adm-label">{label}</span>
      {items.map((p, i) => (
        <div className="adm-para" key={i}>
          <textarea className="adm-input" rows={4} value={p}
                    onChange={e => onChange(items.map((x, j) => j === i ? e.target.value : x))} />
          <ItemControls index={i} count={items.length} onMove={ops.move} onRemove={ops.remove} removeLabel="paragraph" />
        </div>
      ))}
      <button type="button" className="adm-btn sm" onClick={() => onChange(items.concat([""]))}>+ Add paragraph</button>
      <span className="adm-field-hint">{RICH_HINT}</span>
    </div>
  );
}

function PickButton({ label, multiple, disabled, onFiles, className }) {
  const input = useRefA(null);
  return (
    <React.Fragment>
      <button type="button" className={"adm-btn " + (className || "")} disabled={disabled}
              onClick={() => input.current.click()}>{label}</button>
      <input ref={input} type="file" accept="image/*" multiple={multiple} hidden
             onChange={e => {
               const files = Array.from(e.target.files);
               e.target.value = "";
               if (files.length) onFiles(files);
             }} />
    </React.Fragment>
  );
}

function ImageSlot({ image, ratio, busy, onFiles, onRemove }) {
  return (
    <div className="adm-slot">
      {image.url
        ? <img src={image.url} alt="" style={{ aspectRatio: ratio }} />
        : <div className="adm-slot-empty" style={{ aspectRatio: ratio }}>no image</div>}
      <span className="adm-file">{fileName(image.path) || "—"}</span>
      <div className="adm-controls">
        <PickButton label={image.url ? "Replace" : "Upload"} disabled={busy} onFiles={onFiles} className="sm" />
        {onRemove && image.url && <button type="button" className="adm-link danger" onClick={onRemove}>Remove</button>}
      </div>
    </div>
  );
}

// Card that expands to show its form; only one open per list.
function Expandable({ open, onToggle, title, meta, children }) {
  return (
    <div className={"adm-exp" + (open ? " open" : "")}>
      <button type="button" className="adm-exp-head" onClick={onToggle} aria-expanded={open}>
        <span className="adm-exp-title">{title}</span>
        {meta && <span className="adm-exp-meta">{meta}</span>}
        <span className="adm-exp-caret">{open ? "▴" : "▾"}</span>
      </button>
      {open && <div className="adm-exp-body">{children}</div>}
    </div>
  );
}

/* ---------- Tabs ---------- */
function AboutTab({ about, setAbout, busy, upload }) {
  const replacePhoto = async files => {
    const [img] = await upload(files.slice(0, 1));
    if (img) setAbout(a => patch(a, { photo: patch(img, { alt: a.photo.alt }) }));
  };
  return (
    <React.Fragment>
      <section className="adm-card">
        <header className="adm-card-head"><div><h2>Profile photo</h2><p className="adm-hint">The polaroid on the About page.</p></div></header>
        <div className="adm-photo-row">
          <ImageSlot image={about.photo} ratio="4 / 4.4" busy={busy} onFiles={replacePhoto} />
          <Field label="Alt text" value={about.photo.alt} placeholder="Describe the photo"
                 onChange={v => setAbout(a => patch(a, { photo: patch(a.photo, { alt: v }) }))} />
        </div>
      </section>
      <section className="adm-card">
        <header className="adm-card-head"><div><h2>Introduction</h2><p className="adm-hint">Next to the photo on the About page.</p></div></header>
        <Field label="Heading" hint="*Italic* text shows in the pink handwriting font." value={about.heading}
               onChange={v => setAbout(a => patch(a, { heading: v }))} />
        <ParagraphList label="Intro paragraphs (the last one gets the “read more” link)" items={about.intro}
                       onChange={v => setAbout(a => patch(a, { intro: v }))} />
        <ParagraphList label="“Read more” story" items={about.story}
                       onChange={v => setAbout(a => patch(a, { story: v }))} />
      </section>
    </React.Fragment>
  );
}

function BulletsEditor({ items, onChange }) {
  const ops = listOps(items, onChange);
  return (
    <div className="adm-group">
      {items.map((b, i) => (
        <div className="adm-sub" key={i}>
          <Field label="Title (optional, shown in bold)" value={b.title} onChange={v => ops.update(i, { title: v })} />
          <Field label="Text" multiline value={b.text} hint={RICH_HINT} onChange={v => ops.update(i, { text: v })} />
          <LinesField label="Sub-points" hint="Optional. One per line." rows={2} value={b.points}
                      onChange={v => ops.update(i, { points: v })} />
          <ItemControls index={i} count={items.length} onMove={ops.move} onRemove={ops.remove} removeLabel="highlight" />
        </div>
      ))}
      <button type="button" className="adm-btn sm" onClick={() => ops.add(NEW_BULLET)}>+ Add highlight</button>
    </div>
  );
}

function DetailsEditor({ items, onChange }) {
  const ops = listOps(items, onChange);
  return (
    <div className="adm-group">
      {items.map((d, i) => (
        <div className="adm-sub" key={i}>
          <div className="adm-grid3">
            <Field label="Role" value={d.role} onChange={v => ops.update(i, { role: v })} />
            <Field label="Organisation" value={d.org} onChange={v => ops.update(i, { org: v })} />
            <Field label="When" value={d.when} onChange={v => ops.update(i, { when: v })} />
          </div>
          <Field label="Description" multiline value={d.desc} hint={RICH_HINT} onChange={v => ops.update(i, { desc: v })} />
          <LinesField label="Points" hint="Optional. One per line." rows={2} value={d.points}
                      onChange={v => ops.update(i, { points: v })} />
          <ItemControls index={i} count={items.length} onMove={ops.move} onRemove={ops.remove} removeLabel="sub-entry" />
        </div>
      ))}
      <button type="button" className="adm-btn sm" onClick={() => ops.add(NEW_DETAIL)}>+ Add sub-entry</button>
    </div>
  );
}

function ExperienceTab({ timeline, setTimeline }) {
  const [openIdx, setOpenIdx] = useStateA(null);
  const ops = listOps(timeline, setTimeline);
  const move = (i, d) => { ops.move(i, d); if (openIdx === i) setOpenIdx(i + d); else if (openIdx === i + d) setOpenIdx(i); };
  const remove = i => { ops.remove(i); setOpenIdx(null); };
  return (
    <section className="adm-card">
      <header className="adm-card-head">
        <div>
          <h2>Experience timeline</h2>
          <p className="adm-hint">Top of this list = left end of the timeline (oldest). The page opens scrolled to the last entry.</p>
        </div>
        <button type="button" className="adm-btn primary"
                onClick={() => { ops.add(NEW_ENTRY); setOpenIdx(timeline.length); }}>+ Add entry</button>
      </header>
      <div className="adm-list">
        {timeline.map((t, i) => (
          <Expandable key={i} open={openIdx === i} onToggle={() => setOpenIdx(openIdx === i ? null : i)}
                      title={`${t.role || "Untitled"}${t.org ? " · " + t.org : ""}`}
                      meta={[t.when, t.badge].filter(Boolean).join("  ·  ")}>
            <div className="adm-grid3">
              <Field label="Role / title" value={t.role} onChange={v => ops.update(i, { role: v })} />
              <Field label="Organisation" value={t.org} onChange={v => ops.update(i, { org: v })} />
              <Field label="When" value={t.when} placeholder="May ’25 — Present" onChange={v => ops.update(i, { when: v })} />
            </div>
            <Field label="Summary (on the card and at the top of the popup)" multiline value={t.desc}
                   onChange={v => ops.update(i, { desc: v })} />
            <div className="adm-grid3">
              <Field label="Badge" value={t.badge} placeholder="★ Latest" onChange={v => ops.update(i, { badge: v })} />
              <label className="adm-check adm-check-field">
                <input type="checkbox" checked={t.highlight} onChange={e => ops.update(i, { highlight: e.target.checked })} />
                Highlight this card in pink
              </label>
            </div>

            <h3 className="adm-h3">Highlights</h3>
            <Field label="Heading" value={t.bulletsLabel} placeholder="Notable projects ✦"
                   onChange={v => ops.update(i, { bulletsLabel: v })} />
            <BulletsEditor items={t.bullets} onChange={v => ops.update(i, { bullets: v })} />

            <h3 className="adm-h3">Tools I reach for</h3>
            <LinesField label="Tools" hint="Optional. One per line." value={t.tools} onChange={v => ops.update(i, { tools: v })} />

            <h3 className="adm-h3">Sub-entries</h3>
            <p className="adm-hint">For roles with several engagements, like mentoring programmes.</p>
            <Field label="Heading" value={t.detailsLabel} placeholder="What I’ve mentored ✦"
                   onChange={v => ops.update(i, { detailsLabel: v })} />
            <DetailsEditor items={t.details} onChange={v => ops.update(i, { details: v })} />

            <ItemControls index={i} count={timeline.length} onMove={move} onRemove={remove} removeLabel="timeline entry" />
          </Expandable>
        ))}
      </div>
    </section>
  );
}

function SkillsTab({ skills, setSkills }) {
  return (
    <section className="adm-card">
      <header className="adm-card-head"><div><h2>Skills</h2><p className="adm-hint">“Things I work with” on the About page.</p></div></header>
      <div className="adm-skills">
        <LinesField label="Skills" rows={Math.max(6, skills.length + 1)} value={skills} onChange={setSkills} />
        <div>
          <span className="adm-label">Preview</span>
          <div className="adm-chips">{skills.filter(s => s.trim()).map((s, i) => <span className="tag" key={i}>{s}</span>)}</div>
        </div>
      </div>
    </section>
  );
}

function TagsEditor({ tags, onChange }) {
  const ops = listOps(tags, onChange);
  return (
    <div className="adm-group">
      <span className="adm-label">Tags (also used as the filter buttons)</span>
      {tags.map((t, i) => (
        <div className="adm-row" key={i}>
          <input className="adm-input" value={t.name} placeholder="nlp" onChange={e => ops.update(i, { name: e.target.value })} />
          <select className="adm-input adm-select" value={t.color} onChange={e => ops.update(i, { color: e.target.value })}>
            {TAG_COLORS.map(c => <option key={c} value={c}>{c || "pink"}</option>)}
          </select>
          <span className={"tag " + t.color}>#{t.name || "tag"}</span>
          <button type="button" className="adm-link danger" onClick={() => ops.remove(i)}>Remove</button>
        </div>
      ))}
      <button type="button" className="adm-btn sm" onClick={() => ops.add({ name: "", color: "" })}>+ Add tag</button>
    </div>
  );
}

function LinksEditor({ links, onChange }) {
  const ops = listOps(links, onChange);
  return (
    <div className="adm-group">
      <span className="adm-label">Links</span>
      {links.map((l, i) => (
        <div className="adm-row" key={i}>
          <input className="adm-input adm-short" value={l.label} placeholder="GitHub" onChange={e => ops.update(i, { label: e.target.value })} />
          <input className="adm-input" value={l.href} placeholder="https://… (leave empty for a greyed-out “soon” button)"
                 onChange={e => ops.update(i, { href: e.target.value })} />
          <button type="button" className="adm-link danger" onClick={() => ops.remove(i)}>Remove</button>
        </div>
      ))}
      <button type="button" className="adm-btn sm" onClick={() => ops.add({ label: "", href: "" })}>+ Add link</button>
    </div>
  );
}

function ProjectsTab({ projects, setProjects, busy, upload }) {
  const [openId, setOpenId] = useStateA(null);
  const ops = listOps(projects, setProjects);
  const replaceImage = id => async files => {
    const [img] = await upload(files.slice(0, 1));
    if (img) setProjects(ps => ps.map(p => p.id === id ? patch(p, { image: img }) : p));
  };
  const add = () => {
    const id = newId();
    ops.add({ id, title: "New project", desc: "", image: { url: "", path: "", alt: "" }, tags: [], links: [], clip: "📌" });
    setOpenId(id);
  };
  return (
    <section className="adm-card">
      <header className="adm-card-head">
        <div><h2>Projects</h2><p className="adm-hint">Shown in this order on the Projects page.</p></div>
        <button type="button" className="adm-btn primary" onClick={add}>+ Add project</button>
      </header>
      <div className="adm-list">
        {projects.map((p, i) => (
          <Expandable key={p.id} open={openId === p.id} onToggle={() => setOpenId(openId === p.id ? null : p.id)}
                      title={<React.Fragment>{p.image.url && <img className="adm-exp-thumb" src={p.image.url} alt="" />}{p.title || "Untitled"}</React.Fragment>}
                      meta={p.tags.map(t => "#" + t.name).join(" ")}>
            <div className="adm-project">
              <ImageSlot image={p.image} ratio="16 / 10" busy={busy} onFiles={replaceImage(p.id)}
                         onRemove={() => ops.update(i, { image: { url: "", path: "", alt: "" } })} />
              <div>
                <Field label="Title" value={p.title} onChange={v => ops.update(i, { title: v })} />
                <Field label="Description" multiline rows={4} value={p.desc} hint={RICH_HINT}
                       onChange={v => ops.update(i, { desc: v })} />
                <label className="adm-field">
                  <span className="adm-label">Pin decoration</span>
                  <select className="adm-input adm-select" value={p.clip} onChange={e => ops.update(i, { clip: e.target.value })}>
                    {["📌", "🔖", "📎", ""].map(c => <option key={c} value={c}>{c || "none"}</option>)}
                  </select>
                </label>
              </div>
            </div>
            <TagsEditor tags={p.tags} onChange={v => ops.update(i, { tags: v })} />
            <LinksEditor links={p.links} onChange={v => ops.update(i, { links: v })} />
            <ItemControls index={i} count={projects.length} onMove={ops.move}
                          onRemove={j => { ops.remove(j); setOpenId(null); }} removeLabel="project" />
          </Expandable>
        ))}
      </div>
    </section>
  );
}

function Library({ inUse, version, onChanged, setNotice }) {
  const [files, setFiles] = useStateA(null);
  const [error, setError] = useStateA("");

  useEffectA(() => {
    let live = true;
    fbStorage.ref("website").listAll()
      .then(res => Promise.all(res.items.map(async ref => {
        const meta = await ref.getMetadata();
        const url = await ref.getDownloadURL().catch(() => IMG_BASE + encodeURIComponent(ref.name));
        return { ref, path: ref.fullPath, name: ref.name, size: meta.size, updated: meta.updated, url };
      })))
      .then(list => { if (live) { setFiles(list.sort((a, b) => b.updated.localeCompare(a.updated))); setError(""); } })
      .catch(e => { if (live) setError(errorText(e)); });
    return () => { live = false; };
  }, [version]);

  const remove = async f => {
    if (!confirm(`Delete ${f.name} from Firebase Storage? This can't be undone.`)) return;
    try {
      await f.ref.delete();
      setNotice({ kind: "ok", text: `Deleted ${f.name}.` });
      onChanged();
    } catch (e) {
      setNotice({ kind: "err", text: errorText(e) });
    }
  };

  const used = new Set(inUse);
  const total = files ? files.reduce((s, f) => s + f.size, 0) : 0;
  const unused = files ? files.filter(f => !used.has(f.path)).length : 0;
  return (
    <section className="adm-card">
      <header className="adm-card-head">
        <div>
          <h2>Library</h2>
          <p className="adm-hint">
            Everything in the <code>website/</code> folder{files && ` · ${files.length} files · ${kb(total)} · ${unused} unused`}.
            Files that aren't used anywhere can be deleted.
          </p>
        </div>
      </header>
      {error && <p className="adm-notice err">{error}</p>}
      {!files && !error && <p className="adm-empty">Loading…</p>}
      {files && (
        <ul className="adm-library">
          {files.map(f => (
            <li key={f.path} className={used.has(f.path) ? "" : "unused"}>
              <img src={f.url} alt="" loading="lazy" />
              <div className="adm-lib-meta">
                <span className="adm-file" title={f.name}>{f.name}</span>
                <span className="adm-size">{kb(f.size)}</span>
              </div>
              {used.has(f.path)
                ? <span className="adm-badge">in use</span>
                : <button type="button" className="adm-link danger" onClick={() => remove(f)}>Delete</button>}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/* ---------- Editor (signed in as admin) ---------- */
const TABS = [
  ["about", "About"],
  ["experience", "Experience"],
  ["skills", "Skills"],
  ["projects", "Projects"],
  ["library", "Library"],
];

function Editor() {
  const [saved, setSaved] = useStateA(null);
  const [exists, setExists] = useStateA(true);
  const [draft, setDraft] = useStateA(null);
  const [loadError, setLoadError] = useStateA("");
  const [tab, setTab] = useStateA(() => {
    const t = location.hash.slice(1);
    return TABS.some(([k]) => k === t) ? t : "about";
  });
  const [uploads, setUploads] = useStateA(0);
  const [progress, setProgress] = useStateA("");
  const [saving, setSaving] = useStateA(false);
  const [notice, setNotice] = useStateA(null);
  const [libVersion, setLibVersion] = useStateA(0);

  useEffectA(() => {
    contentDocRef.get()
      .then(snap => {
        const content = normalizeContent(snap.exists ? snap.data() : null, DEFAULT_CONTENT);
        setExists(snap.exists);
        setSaved(content);
        setDraft(content);
      })
      .catch(e => setLoadError(errorText(e)));
  }, []);

  useEffectA(() => { history.replaceState(null, "", "#" + tab); }, [tab]);

  const dirty = draft && (!exists || !same(draft, saved));
  useEffectA(() => {
    if (!dirty) return;
    const warn = e => { e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  useEffectA(() => {
    if (!notice || notice.kind === "err") return;
    const t = setTimeout(() => setNotice(null), 4000);
    return () => clearTimeout(t);
  }, [notice]);

  // Uploads one file at a time; returns the ones that succeeded.
  const upload = async files => {
    setUploads(n => n + 1);
    const done = [];
    const failed = [];
    for (let i = 0; i < files.length; i++) {
      const label = files.length > 1 ? `${i + 1}/${files.length} · ` : "";
      try {
        setProgress(`${label}Compressing ${files[i].name}…`);
        done.push(await uploadImage(files[i], p =>
          setProgress(`${label}Uploading ${files[i].name} · ${Math.round(p * 100)}%`)));
      } catch (e) {
        failed.push(`${files[i].name}: ${errorText(e)}`);
      }
    }
    setUploads(n => n - 1);
    setProgress("");
    setLibVersion(v => v + 1);
    if (failed.length) setNotice({ kind: "err", text: failed.join(" · ") });
    else setNotice({ kind: "ok", text: `Uploaded (${kb(done.reduce((s, d) => s + d.size, 0))} after compression). Save to publish.` });
    return done.map(({ size, ...img }) => img);
  };

  // Section setters accept a value or an updater function (for async uploads).
  const section = key => v => setDraft(d => patch(d, { [key]: typeof v === "function" ? v(d[key]) : v }));

  const save = async () => {
    setSaving(true);
    const clean = normalizeContent(draft);
    try {
      await contentDocRef.set(patch(clean, { updatedAt: firebase.firestore.FieldValue.serverTimestamp() }));
      setSaved(clean);
      setDraft(clean);
      setExists(true);
      setNotice({ kind: "ok", text: "Saved — visitors see the changes on their next page load." });
      setLibVersion(v => v + 1);
    } catch (e) {
      setNotice({ kind: "err", text: errorText(e) });
    }
    setSaving(false);
  };

  if (loadError) return <p className="adm-notice err">Couldn't load site content: {loadError}</p>;
  if (!draft) return <p className="adm-empty">Loading site content…</p>;

  const busy = uploads > 0;
  return (
    <React.Fragment>
      {!exists && (
        <p className="adm-notice">
          The site is still showing its built-in content. Press <strong>Save changes</strong> once to start managing it from here.
        </p>
      )}

      <nav className="adm-tabs" role="tablist">
        {TABS.map(([key, label]) => (
          <button key={key} type="button" role="tab" aria-selected={tab === key}
                  className={"adm-tab" + (tab === key ? " active" : "")} onClick={() => setTab(key)}>{label}</button>
        ))}
      </nav>

      {tab === "about" && <AboutTab about={draft.about} setAbout={section("about")} busy={busy} upload={upload} />}
      {tab === "experience" && <ExperienceTab timeline={draft.timeline} setTimeline={section("timeline")} />}
      {tab === "skills" && <SkillsTab skills={draft.skills} setSkills={section("skills")} />}
      {tab === "projects" && <ProjectsTab projects={draft.projects} setProjects={section("projects")} busy={busy} upload={upload} />}
      {tab === "library" && <Library inUse={pathsInUse(saved).concat(pathsInUse(draft))} version={libVersion}
                                     onChanged={() => setLibVersion(v => v + 1)} setNotice={setNotice} />}

      <div className={"adm-savebar" + (dirty || busy || notice ? " show" : "")}>
        <div className="adm-savebar-inner">
          <span className={"adm-status " + (notice ? notice.kind : "")}>
            {progress || (notice && notice.text) || (dirty ? "You have unsaved changes." : "")}
          </span>
          {notice && notice.kind === "err" && !progress &&
            <button type="button" className="adm-link" onClick={() => setNotice(null)}>dismiss</button>}
          <div className="adm-savebar-actions">
            <button type="button" className="adm-btn" disabled={!dirty || !exists || busy || saving}
                    onClick={() => { if (confirm("Discard all unsaved changes?")) setDraft(saved); }}>Discard</button>
            <button type="button" className="adm-btn primary" disabled={!dirty || busy || saving}
                    onClick={save}>{saving ? "Saving…" : "Save changes"}</button>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
}

/* ---------- Shell + auth ---------- */
function AdminApp() {
  const [user, setUser] = useStateA(undefined);
  const [error, setError] = useStateA("");

  useEffectA(() => fbAuth.onAuthStateChanged(u => setUser(u)), []);

  const signIn = () => {
    setError("");
    fbAuth.signInWithPopup(new firebase.auth.GoogleAuthProvider())
      .catch(e => {
        if (e.code === "auth/unauthorized-domain") {
          setError(`${location.hostname} isn't an authorized domain yet — add it in Firebase console → Authentication → Settings → Authorized domains.`);
        } else if (e.code !== "auth/popup-closed-by-user" && e.code !== "auth/cancelled-popup-request") {
          setError(errorText(e));
        }
      });
  };
  const signOut = () => fbAuth.signOut();
  const isAdmin = user && user.email === ADMIN_EMAIL && user.emailVerified;

  return (
    <div className="adm">
      <header className="adm-top">
        <div className="adm-top-inner">
          <div>
            <span className="eyebrow">behind the scenes ✿</span>
            <h1>Site admin</h1>
          </div>
          <div className="adm-top-actions">
            <a className="adm-link" href="./#/about" target="_blank" rel="noreferrer">View site →</a>
            {user && <button type="button" className="adm-btn" onClick={signOut}>Sign out</button>}
          </div>
        </div>
      </header>

      <main className="adm-main">
        {user === undefined && <p className="adm-empty">Checking sign-in…</p>}

        {user === null && (
          <section className="adm-card adm-signin">
            <h2>Sign in to edit the site</h2>
            <p className="adm-hint">Only the site owner's Google account can make changes.</p>
            <button type="button" className="adm-btn primary" onClick={signIn}>Sign in with Google</button>
            {error && <p className="adm-notice err">{error}</p>}
          </section>
        )}

        {user && !isAdmin && (
          <section className="adm-card adm-signin">
            <h2>Not allowed</h2>
            <p className="adm-hint">{user.email} can't edit this site.</p>
            <button type="button" className="adm-btn" onClick={signOut}>Sign out</button>
          </section>
        )}

        {isAdmin && (
          <React.Fragment>
            <p className="adm-whoami">Signed in as {user.email}</p>
            <Editor />
          </React.Fragment>
        )}
      </main>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<AdminApp />);
