import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Moon, Sun, Globe, Square } from "lucide-react";
import { content, languages, profile, socials, type Lang } from "@/data/portfolioData";
import mapPoster from "@/assets/viet-map-poster.png";
import motifs from "@/assets/retro-space-motifs.png";
import avatarDefault from "@/assets/avatar-default.jpg";
import { Chatbox } from "../components/Chatbox";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Võ Lê Cao Kỳ — Portfolio" },
      {
        name: "description",
        content:
          "Portfolio của Võ Lê Cao Kỳ, sinh viên CNTT HUTECH: dự án IoT/AI, Java Spring Boot, thành tích và kinh nghiệm làm việc.",
      },
      { property: "og:title", content: "Võ Lê Cao Kỳ — Portfolio" },
      {
        property: "og:description",
        content:
          "Sinh viên CNTT HUTECH (GPA 3.42/4.0). Định hướng AI, IoT/Hệ thống nhúng, Java Web Developer.",
      },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Portfolio,
});

function useTheme() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const isDark = saved ? saved === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  const toggle = () => {
    setDark((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle("dark", next);
      localStorage.setItem("theme", next ? "dark" : "light");
      return next;
    });
  };

  return { dark, toggle };
}

function MusicToggle({ on, off, stop }: { on: string; off: string; stop: string }) {
  const [playing, setPlaying] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const youtubeVideoId = "-nJ0WHEetsQ";

  // URL nhúng YouTube chuẩn cho Autoplay + Loop
  const audioSrc = `https://www.youtube.com/embed/${youtubeVideoId}?enablejsapi=1&autoplay=1&mute=0&loop=1&playlist=${youtubeVideoId}`;

  useEffect(() => {
    // Thử tự bật nhạc khi vừa tải trang
    setPlaying(true);

    // Kích hoạt phát nhạc khi có tương tác đầu tiên nếu trình duyệt chặn autoplay ban đầu
    const handleFirstInteraction = () => {
      setPlaying(true);
      window.removeEventListener("click", handleFirstInteraction);
      window.removeEventListener("touchstart", handleFirstInteraction);
      window.removeEventListener("scroll", handleFirstInteraction);
    };

    window.addEventListener("click", handleFirstInteraction);
    window.addEventListener("touchstart", handleFirstInteraction);
    window.addEventListener("scroll", handleFirstInteraction);

    return () => {
      window.removeEventListener("click", handleFirstInteraction);
      window.removeEventListener("touchstart", handleFirstInteraction);
      window.removeEventListener("scroll", handleFirstInteraction);
    };
  }, []);

  const toggle = () => setPlaying((prev) => !prev);
  const stopPlayback = () => setPlaying(false);

  return (
    <div className="inline-flex items-center gap-1.5">
      {/* Nạp Iframe YouTube */}
      <iframe
        ref={iframeRef}
        width="0"
        height="0"
        src={playing ? audioSrc : ""}
        title="Background Music"
        allow="autoplay"
        className="hidden"
      />

      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? on : off}
        className="inline-flex items-center gap-2 rounded-full border-2 border-primary/70 bg-card px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-primary transition-colors hover:bg-accent hover:text-accent-foreground"
      >
        <span className="flex h-3 items-end gap-[2px]" aria-hidden>
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-[2px] rounded-full bg-current transition-all"
              style={{ height: playing ? `${6 + i * 3}px` : "4px" }}
            />
          ))}
        </span>
        <span className="hidden sm:inline">{playing ? on : off}</span>
      </button>

      {playing && (
        <button
          type="button"
          onClick={stopPlayback}
          aria-label={stop}
          title={stop}
          className="inline-flex items-center justify-center rounded-full border-2 border-primary/70 bg-card p-1.5 text-primary transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          <Square className="h-3 w-3 fill-current" />
        </button>
      )}
    </div>
  );
}

function Section({
  id,
  eyebrow,
  title,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mx-auto w-full max-w-5xl scroll-mt-24 px-6 py-16 md:py-24">
      <p className="inline-block -rotate-1 bg-accent px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.28em] text-accent-foreground">
        {eyebrow}
      </p>
      <h2 className="mt-4 font-display text-3xl font-extrabold uppercase tracking-tight text-primary md:text-4xl">
        {title}
      </h2>
      <div className="mt-3 h-1 w-24 bg-gold" />
      <div className="mt-10">{children}</div>
    </section>
  );
}

const cardClass =
  "rounded-xl border-2 border-primary/25 bg-card p-6 shadow-[6px_6px_0_0_var(--gold)] transition-transform hover:-translate-y-1";

function Portfolio() {
  const [lang, setLang] = useState<Lang>("vi");
  const { dark, toggle } = useTheme();
  const t = content[lang];

  useEffect(() => {
    const saved = localStorage.getItem("lang") as Lang | null;
    if (saved && ["vi", "en", "kr"].includes(saved)) setLang(saved);
  }, []);

  const pick = (code: Lang) => {
    setLang(code);
    localStorage.setItem("lang", code);
  };

  const nav = [
    { id: "gioi-thieu", label: t.nav.about },
    { id: "kinh-nghiem", label: t.nav.experience },
    { id: "du-an", label: t.nav.projects },
    { id: "ky-nang", label: t.nav.skills },
    { id: "thanh-tich", label: t.nav.achievements },
    { id: "lien-he", label: t.nav.contact },
  ];

  return (
    <div className="paper-grain min-h-screen bg-background font-sans text-foreground antialiased">
      <header className="sticky top-0 z-30 border-b-2 border-primary/30 bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-3">
          <a
            href="#gioi-thieu"
            className="font-display text-sm font-extrabold tracking-[0.25em] text-primary"
          >
            ★ V.L.C.K
          </a>

          <nav className="hidden items-center gap-6 lg:flex">
            {nav.map((n) => (
              <a
                key={n.id}
                href={`#${n.id}`}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-accent"
              >
                {n.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <div
              className="flex items-center gap-1 rounded-full border-2 border-primary/70 bg-card px-2 py-1"
              aria-label={t.ui.language}
            >
              <Globe className="h-3.5 w-3.5 text-primary" aria-hidden />
              {languages.map((l) => (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => pick(l.code)}
                  aria-label={l.name}
                  aria-pressed={lang === l.code}
                  className={`rounded-full px-2 py-0.5 text-[11px] font-bold tracking-wide transition-colors ${
                    lang === l.code
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-accent"
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={toggle}
              aria-label={dark ? t.ui.light : t.ui.dark}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary/70 bg-card text-primary transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            <MusicToggle on={t.ui.musicOn} off={t.ui.musicOff} stop={t.ui.musicOff} />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="gioi-thieu" className="relative overflow-hidden scroll-mt-24">
        <div aria-hidden className="pointer-events-none absolute inset-0 flex justify-center">
          <img
            src={mapPoster}
            alt=""
            width={1024}
            height={1280}
            className="h-full w-auto max-w-none object-contain opacity-[0.28] mix-blend-multiply dark:opacity-[0.22] dark:mix-blend-screen"
          />
        </div>
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0">
          <img
            src={motifs}
            alt=""
            width={1536}
            height={768}
            loading="lazy"
            className="w-full opacity-40 dark:opacity-30"
          />
        </div>

        <div className="relative mx-auto grid max-w-5xl gap-12 px-6 py-20 md:grid-cols-[1.35fr_1fr] md:items-center md:py-28">
          <div>
            <p className="inline-block rotate-[-1.5deg] bg-gold px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.28em] text-deepsea">
              {t.ui.eyebrow}
            </p>
            <h1 className="mt-5 font-display text-4xl font-black uppercase leading-[1.05] tracking-tight text-primary md:text-6xl">
              {profile.name}
            </h1>
            <p className="mt-4 font-display text-base font-bold text-foreground md:text-lg">
              {t.ui.role} · GPA {profile.gpa}
            </p>
            <p className="mt-2 text-sm font-semibold uppercase tracking-[0.18em] text-accent">
              {t.ui.tagline}
            </p>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground">
              {t.ui.intro}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href={profile.cvUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center rounded-full bg-primary px-6 py-3 text-sm font-bold uppercase tracking-wide text-primary-foreground shadow-[4px_4px_0_0_var(--gold)] transition-transform hover:-translate-y-0.5"
              >
                {t.ui.cv}
              </a>
              <a
                href="#lien-he"
                className="inline-flex items-center rounded-full border-2 border-primary bg-card px-6 py-3 text-sm font-bold uppercase tracking-wide text-primary transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                {t.ui.contactBtn}
              </a>
            </div>

            <div className="mt-8 flex flex-wrap gap-2 text-[11px] font-bold uppercase tracking-[0.15em] text-deepsea">
              <span className="rounded-full border-2 border-gold bg-card/80 px-3 py-1">
                ● ● {t.ui.hoangSa}
              </span>
              <span className="rounded-full border-2 border-gold bg-card/80 px-3 py-1">
                ● ● ● {t.ui.truongSa}
              </span>
            </div>
          </div>

          <div className="mx-auto w-full max-w-xs">
            <div className="rounded-[2rem] border-4 border-primary bg-card p-3 shadow-[8px_8px_0_0_var(--gold)]">
              <div className="overflow-hidden rounded-[1.5rem] border-2 border-gold bg-secondary">
                <img
                  src={profile.avatar || avatarDefault}
                  alt={`Chân dung ${profile.name}`}
                  width={640}
                  height={800}
                  className="aspect-[4/5] w-full object-cover"
                />
              </div>
              <p className="py-3 text-center text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                {t.ui.avatarCaption}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Experience Section */}
      <Section
        id="kinh-nghiem"
        eyebrow={t.sections.experience.eyebrow}
        title={t.sections.experience.title}
      >
        <div className="grid gap-6 md:grid-cols-2">
          {t.experiences.map((e) => (
            <article key={e.org} className={cardClass}>
              <h3 className="font-display text-lg font-extrabold text-primary">{e.role}</h3>
              <p className="mt-1 text-sm font-bold text-accent">{e.org}</p>
              <ul className="mt-4 space-y-2 text-sm leading-relaxed text-muted-foreground">
                {e.details.map((d) => (
                  <li key={d} className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rotate-45 bg-gold" />
                    {d}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </Section>

      {/* Projects Section */}
      <Section id="du-an" eyebrow={t.sections.projects.eyebrow} title={t.sections.projects.title}>
        <div className="grid gap-6 md:grid-cols-2">
          {t.projects.map((p) => (
            <article key={p.title} className={`flex flex-col ${cardClass}`}>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-accent">{p.role}</p>
              <h3 className="mt-2 font-display text-lg font-extrabold leading-snug text-primary">
                {p.title}
              </h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                {p.description}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {p.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border-2 border-primary/30 px-3 py-1 text-xs font-semibold text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </Section>

      {/* Skills Section */}
      <Section id="ky-nang" eyebrow={t.sections.skills.eyebrow} title={t.sections.skills.title}>
        <div className="grid gap-6 md:grid-cols-3">
          {t.skills.map((s) => (
            <article key={s.group} className={cardClass}>
              <h3 className="font-display text-sm font-extrabold uppercase tracking-[0.15em] text-primary">
                {s.group}
              </h3>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                {s.items.map((i) => (
                  <li key={i}>{i}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </Section>

      {/* Achievements Section */}
      <Section
        id="thanh-tich"
        eyebrow={t.sections.achievements.eyebrow}
        title={t.sections.achievements.title}
      >
        <ul className="divide-y-2 divide-primary/15 overflow-hidden rounded-xl border-2 border-primary/25 bg-card shadow-[6px_6px_0_0_var(--gold)]">
          {t.achievements.map((a) => (
            <li
              key={a.title}
              className="flex items-baseline gap-5 px-6 py-5 transition-colors hover:bg-secondary/60"
            >
              <span className="font-display text-sm font-extrabold text-accent">
                {a.year}
              </span>
              <span className="text-sm text-foreground">{a.title}</span>
            </li>
          ))}
        </ul>
      </Section>

      {/* Contact Section */}
      <Section id="lien-he" eyebrow={t.sections.contact.eyebrow} title={t.sections.contact.title}>
        <div className="flex flex-wrap gap-3">
          {socials.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target={s.href.startsWith("mailto:") ? undefined : "_blank"}
              rel="noopener noreferrer"
              className="rounded-full border-2 border-primary/60 bg-card px-5 py-2.5 text-sm font-bold transition-all hover:-translate-y-0.5 hover:bg-accent hover:text-accent-foreground"
            >
              {s.label}
            </a>
          ))}
        </div>
        <a
          href={profile.cvUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 inline-flex items-center rounded-full bg-primary px-6 py-3 text-sm font-bold uppercase tracking-wide text-primary-foreground shadow-[4px_4px_0_0_var(--gold)] transition-transform hover:-translate-y-0.5"
        >
          {t.ui.cv}
        </a>
      </Section>

      <footer className="border-t-2 border-primary/30 py-10 text-center text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        © {new Date().getFullYear()} {profile.name} · {t.ui.footer}
      </footer>

      <Chatbox />
    </div>
  );
}