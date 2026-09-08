import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  achievements,
  experiences,
  profile,
  projects,
  skills,
  socials,
} from "@/data/portfolioData";
import vietnamMap from "@/assets/vietnam-map.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Võ Lê Cao Kỳ — Portfolio AI, IoT & Java Web" },
      {
        name: "description",
        content:
          "Portfolio của Võ Lê Cao Kỳ, sinh viên CNTT HUTECH: dự án IoT/AI, Java Spring Boot, thành tích và kinh nghiệm làm việc.",
      },
      { property: "og:title", content: "Võ Lê Cao Kỳ — Portfolio AI, IoT & Java Web" },
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

const nav = [
  { id: "gioi-thieu", label: "Giới thiệu" },
  { id: "kinh-nghiem", label: "Kinh nghiệm" },
  { id: "du-an", label: "Dự án" },
  { id: "ky-nang", label: "Kỹ năng" },
  { id: "thanh-tich", label: "Thành tích" },
  { id: "lien-he", label: "Liên hệ" },
];

function MusicToggle() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const audio = new Audio(profile.music);
    audio.loop = true;
    audio.volume = 0.35;
    audioRef.current = audio;
    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, []);

  const toggle = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      try {
        await audio.play();
        setPlaying(true);
      } catch {
        setPlaying(false);
      }
    }
  };

  return (
    <button
      onClick={toggle}
      aria-label={playing ? "Tắt nhạc nền" : "Bật nhạc nền"}
      className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-xs font-medium tracking-wide text-foreground transition-colors hover:border-accent hover:text-accent"
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
      {playing ? "Đang phát" : "Nhạc nền"}
    </button>
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
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent">{eyebrow}</p>
      <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-primary md:text-4xl">
        {title}
      </h2>
      <div className="mt-10">{children}</div>
    </section>
  );
}

function Portfolio() {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground antialiased">
      <header className="sticky top-0 z-30 border-b border-border/70 bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-4">
          <a href="#gioi-thieu" className="font-display text-sm font-bold tracking-[0.2em] text-primary">
            V.L.C.K
          </a>
          <nav className="hidden items-center gap-6 md:flex">
            {nav.map((n) => (
              <a
                key={n.id}
                href={`#${n.id}`}
                className="text-sm text-muted-foreground transition-colors hover:text-accent"
              >
                {n.label}
              </a>
            ))}
          </nav>
          <MusicToggle />
        </div>
      </header>

      {/* Intro */}
      <section id="gioi-thieu" className="relative overflow-hidden scroll-mt-24">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 -top-24 bottom-0 flex justify-center"
        >
          <img
            src={vietnamMap}
            alt=""
            width={1024}
            height={1280}
            className="h-[115%] w-auto max-w-none opacity-[0.23] brightness-125 saturate-125"
            style={{ filter: "drop-shadow(0 0 30px oklch(0.72 0.12 78 / 0.35))" }}
          />
          <div className="absolute inset-0 hidden md:block">
            <span className="absolute left-[62%] top-[42%] text-[10px] font-semibold uppercase tracking-[0.15em] text-accent opacity-60">
              • • Hoàng Sa
            </span>
            <span className="absolute left-[58%] top-[64%] text-[10px] font-semibold uppercase tracking-[0.15em] text-accent opacity-60">
              • • • Trường Sa
            </span>
          </div>
        </div>

        <div className="relative mx-auto grid max-w-5xl gap-12 px-6 py-20 md:grid-cols-[1.4fr_1fr] md:items-center md:py-28">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">
              Modern Heritage Portfolio
            </p>
            <h1 className="mt-4 font-display text-4xl font-extrabold leading-tight tracking-tight text-primary md:text-6xl">
              {profile.name}
            </h1>
            <p className="mt-4 font-display text-base font-semibold text-foreground md:text-lg">
              {profile.role} · GPA {profile.gpa}
            </p>
            <p className="mt-2 text-sm uppercase tracking-[0.18em] text-accent">{profile.tagline}</p>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground">
              {profile.intro}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href={profile.cvUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-transform hover:-translate-y-0.5 hover:bg-accent"
              >
                Tải CV
              </a>
              <a
                href="#lien-he"
                className="inline-flex items-center rounded-full border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:border-accent hover:text-accent"
              >
                Liên hệ
              </a>
            </div>
          </div>

          <div className="mx-auto w-full max-w-xs">
            <div className="rounded-3xl border border-border bg-card/80 p-3 shadow-sm backdrop-blur transition-transform hover:-translate-y-1">
              <div className="overflow-hidden rounded-2xl border border-border/70 bg-secondary">
                <img
                  src={profile.avatar}
                  alt={`Ảnh đại diện của ${profile.name}`}
                  width={640}
                  height={800}
                  className="aspect-[4/5] w-full object-cover"
                />
              </div>
              <p className="py-3 text-center text-xs uppercase tracking-[0.2em] text-muted-foreground">
                HUTECH · IT Student
              </p>
            </div>
          </div>
        </div>
      </section>

      <Section id="kinh-nghiem" eyebrow="Work Experiences" title="Kinh nghiệm làm việc">
        <div className="grid gap-6 md:grid-cols-2">
          {experiences.map((e) => (
            <article
              key={e.org}
              className="rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:border-accent"
            >
              <h3 className="font-display text-lg font-bold text-primary">{e.role}</h3>
              <p className="mt-1 text-sm font-medium text-accent">{e.org}</p>
              <ul className="mt-4 space-y-2 text-sm leading-relaxed text-muted-foreground">
                {e.details.map((d) => (
                  <li key={d} className="flex gap-2">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" />
                    {d}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </Section>

      <Section id="du-an" eyebrow="Projects" title="Dự án tiêu biểu">
        <div className="grid gap-6 md:grid-cols-2">
          {projects.map((p) => (
            <article
              key={p.title}
              className="flex flex-col rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:border-accent"
            >
              <p className="text-xs uppercase tracking-[0.2em] text-accent">{p.role}</p>
              <h3 className="mt-2 font-display text-lg font-bold leading-snug text-primary">
                {p.title}
              </h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                {p.description}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {p.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section id="ky-nang" eyebrow="Skills" title="Kỹ năng chuyên môn">
        <div className="grid gap-6 md:grid-cols-3">
          {skills.map((s) => (
            <article
              key={s.group}
              className="rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:border-accent"
            >
              <h3 className="font-display text-sm font-bold uppercase tracking-[0.15em] text-primary">
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

      <Section id="thanh-tich" eyebrow="Achievements" title="Thành tích & Chứng chỉ">
        <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
          {achievements.map((a) => (
            <li
              key={a.title}
              className="flex items-baseline gap-5 px-6 py-5 transition-colors hover:bg-secondary/60"
            >
              <span className="font-display text-sm font-bold text-accent">{a.year}</span>
              <span className="text-sm text-foreground">{a.title}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="lien-he" eyebrow="Contact" title="Kết nối với mình">
        <div className="flex flex-wrap gap-3">
          {socials.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target={s.href.startsWith("mailto:") ? undefined : "_blank"}
              rel="noopener noreferrer"
              className="rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium transition-all hover:-translate-y-0.5 hover:border-accent hover:text-accent"
            >
              {s.label}
            </a>
          ))}
        </div>
        <a
          href={profile.cvUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 inline-flex items-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-accent"
        >
          Download CV
        </a>
      </Section>

      <footer className="border-t border-border py-10 text-center text-xs tracking-wide text-muted-foreground">
        © {new Date().getFullYear()} {profile.name} · Modern Heritage Portfolio
      </footer>
    </div>
  );
}
