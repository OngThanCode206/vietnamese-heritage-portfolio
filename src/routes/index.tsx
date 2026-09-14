import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  Moon,
  Sun,
  Globe,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Music,
  Menu,
  X,
} from "lucide-react";
import { content, languages, profile, socials, type Lang } from "@/data/portfolioData";
import mapPoster from "@/assets/viet-map-poster.png";
import motifs from "@/assets/retro-space-motifs.png";
import avatarDefault from "@/assets/avatar-default.jpg";
import { Chatbox } from "../components/Chatbox";

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

interface Track {
  title: string;
  id: string;
}

const PLAYLIST: Track[] = [
  { title: "Die With A Smile", id: "kPa7bsKwL-c" },
  { title: "Hello Em Có Khỏe Không 👽", id: "Q4cDgcvPBG4" },
  { title: "Xương Rồng", id: "4jjOH2FR6-E" },
  { title: "Bao Tiền Một Mớ Bình Yên?", id: "vVhKA9Av6vA" },
];

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Võ Lê Cao Kỳ — Portfolio" },
      {
        name: "description",
        content:
          "Portfolio của Võ Lê Cao Kỳ, sinh viên CNTT HUTECH: dự án IoT/AI, Java Spring Boot, thành tích và kinh nghiệm làm việc.",
      },
      {
        property: "og:title",
        content: "Võ Lê Cao Kỳ — Portfolio",
      },
      {
        property: "og:description",
        content:
          "Sinh viên CNTT HUTECH (GPA 3.42/4.0). Định hướng AI, IoT/Hệ thống nhúng, Java Web Developer.",
      },
      {
        property: "og:type",
        content: "profile",
      },
      {
        name: "twitter:card",
        content: "summary_large_image",
      },
    ],
    links: [
      {
        rel: "icon",
        type: "image/svg+xml",
        href: "/favicon.svg",
      },
    ],
  }),

  component: Portfolio,
});

function useTheme() {
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
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

  return { dark: mounted ? dark : false, toggle };
}

function MusicPlayer() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const playerRef = useRef<any>(null);
  const isFirstRender = useRef(true);

  const currentTrack: Track = PLAYLIST[currentIndex] ?? PLAYLIST[0] ?? { title: "", id: "" };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Khởi tạo YouTube Player
  useEffect(() => {
    if (!isMounted) return;

    const initPlayer = () => {
      if (playerRef.current) return;
      playerRef.current = new window.YT.Player("yt-audio-element", {
        height: "0",
        width: "0",
        videoId: PLAYLIST[0]?.id ?? "",
        playerVars: {
          autoplay: 0,
          controls: 0,
        },
        events: {
          onReady: (e: any) => {
            setIsReady(true);
            setDuration(e.target.getDuration() || 0);
          },
          onStateChange: (e: any) => {
            if (e.data === 0) {
              handleNext();
            }
          },
        },
      });
    };

    if (!window.YT || !window.YT.Player) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      if (firstScriptTag && firstScriptTag.parentNode) {
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      } else {
        document.head.appendChild(tag);
      }
      window.onYouTubeIframeAPIReady = initPlayer;
    } else {
      initPlayer();
    }
  }, [isMounted]);

  // Khởi tạo audio khi có tương tác đầu tiên
  useEffect(() => {
    if (!isReady) return;

    const startAudioOnInteraction = () => {
      if (playerRef.current && playerRef.current.playVideo && !isPlaying) {
        playerRef.current.playVideo();
        setIsPlaying(true);
      }
      window.removeEventListener("click", startAudioOnInteraction);
      window.removeEventListener("touchstart", startAudioOnInteraction);
      window.removeEventListener("scroll", startAudioOnInteraction);
      window.removeEventListener("keydown", startAudioOnInteraction);
    };

    window.addEventListener("click", startAudioOnInteraction);
    window.addEventListener("touchstart", startAudioOnInteraction);
    window.addEventListener("scroll", startAudioOnInteraction);
    window.addEventListener("keydown", startAudioOnInteraction);

    return () => {
      window.removeEventListener("click", startAudioOnInteraction);
      window.removeEventListener("touchstart", startAudioOnInteraction);
      window.removeEventListener("scroll", startAudioOnInteraction);
      window.removeEventListener("keydown", startAudioOnInteraction);
    };
  }, [isReady]);

  // Cập nhật tiến trình bài hát
  useEffect(() => {
    let interval: any;
    if (isPlaying && playerRef.current) {
      interval = setInterval(() => {
        if (playerRef.current.getCurrentTime) {
          setCurrentTime(playerRef.current.getCurrentTime() || 0);
          setDuration(playerRef.current.getDuration() || 0);
        }
      }, 500);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Chuyển bài hát khi currentIndex thay đổi
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (playerRef.current && playerRef.current.loadVideoById) {
      playerRef.current.loadVideoById(currentTrack.id);
      if (isPlaying) {
        playerRef.current.playVideo();
      }
    }
  }, [currentIndex]);

  const togglePlay = () => {
    if (!playerRef.current) return;
    if (isPlaying) {
      playerRef.current.pauseVideo();
      setIsPlaying(false);
    } else {
      playerRef.current.playVideo();
      setIsPlaying(true);
    }
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % PLAYLIST.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + PLAYLIST.length) % PLAYLIST.length);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = Number(e.target.value);
    if (playerRef.current && playerRef.current.seekTo) {
      playerRef.current.seekTo(newTime, true);
      setCurrentTime(newTime);
    }
  };

  const toggleMute = () => {
    if (!playerRef.current) return;
    if (isMuted) {
      playerRef.current.unMute();
      setIsMuted(false);
    } else {
      playerRef.current.mute();
      setIsMuted(true);
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "00:00";
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins < 10 ? "0" : ""}${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  if (!isMounted) return null;

  return (
    <div className="relative inline-block">
      <div id="yt-audio-element" className="hidden" />

      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Mở trình phát nhạc"
        className="inline-flex items-center gap-1.5 rounded-full border-2 border-primary/70 bg-card px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.1em] text-primary transition-colors hover:bg-accent hover:text-accent-foreground"
      >
        <span className="flex h-3 items-end gap-[2px]" aria-hidden>
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-[2px] rounded-full bg-current transition-all"
              style={{ height: isPlaying ? `${6 + i * 3}px` : "4px" }}
            />
          ))}
        </span>
        <Music className="h-3.5 w-3.5 shrink-0" />
        <span className="hidden md:inline-block max-w-[80px] lg:max-w-[110px] truncate">{currentTrack.title}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-11 z-50 w-72 rounded-2xl border-2 border-primary/40 bg-card/95 p-3.5 shadow-[6px_6px_0_0_var(--gold)] backdrop-blur-md animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between font-bold text-primary">
            <span className="truncate text-xs">{currentTrack.title}</span>
            <span className="ml-1 text-[10px] text-muted-foreground shrink-0">
              {currentIndex + 1}/{PLAYLIST.length}
            </span>
          </div>

          <div className="mt-2 flex items-center gap-2">
            <span className="w-8 text-[10px] font-mono text-muted-foreground">
              {formatTime(currentTime)}
            </span>
            <input
              type="range"
              min={0}
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              aria-label="Thanh thời gian bài hát"
              className="h-1.5 flex-1 cursor-pointer appearance-none rounded-lg bg-primary/20 accent-primary"
            />
            <span className="w-8 text-[10px] font-mono text-muted-foreground">
              {formatTime(duration)}
            </span>
          </div>

          <div className="mt-2 flex items-center justify-between pt-1 border-t border-primary/10">
            <button
              type="button"
              onClick={toggleMute}
              className="p-1 text-primary hover:text-accent transition-colors"
              title={isMuted ? "Bật âm thanh" : "Tắt âm thanh"}
              aria-label={isMuted ? "Bật âm thanh" : "Tắt âm thanh"}
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrev}
                className="p-1 text-primary hover:text-accent transition-colors"
                title="Bài trước"
                aria-label="Bài trước"
              >
                <SkipBack className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={togglePlay}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm hover:scale-105 transition-transform"
                title={isPlaying ? "Tạm dừng" : "Phát"}
                aria-label={isPlaying ? "Tạm dừng" : "Phát"}
              >
                {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 ml-0.5" />}
              </button>

              <button
                type="button"
                onClick={handleNext}
                className="p-1 text-primary hover:text-accent transition-colors"
                title="Bài tiếp"
                aria-label="Bài tiếp"
              >
                <SkipForward className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
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
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
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
    { id: "hoat-dong", label: (t.nav as any).activities ?? "Hoạt động" },
    { id: "so-thich", label: (t.nav as any).interests ?? (t.nav as any).hobbies ?? "Sở thích" },
    { id: "lien-he", label: t.nav.contact },
  ];

  return (
    <div className="paper-grain min-h-screen bg-background font-sans text-foreground antialiased">
      {/* HEADER TỐI ƯU KHÔNG BỊ RỚT HÀNG */}
      <header className="sticky top-0 z-30 border-b-2 border-primary/30 bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <a
            href="#gioi-thieu"
            className="shrink-0 font-display text-sm font-extrabold tracking-[0.2em] text-primary"
          >
            ★ V.L.C.K
          </a>

          {/* Desktop Nav - Hiển thị gọn từ màn hình XL trở lên */}
          <nav className="hidden items-center gap-3 xl:flex 2xl:gap-5">
            {nav.map((n) => (
              <a
                key={n.id}
                href={`#${n.id}`}
                className="whitespace-nowrap text-xs font-semibold text-muted-foreground transition-colors hover:text-accent"
              >
                {n.label}
              </a>
            ))}
          </nav>

          {/* Cụm nút công cụ giữ nguyên bên phải */}
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            {/* Chọn ngôn ngữ */}
            <div
              className="flex items-center gap-0.5 rounded-full border-2 border-primary/70 bg-card px-1.5 py-1"
              aria-label={t.ui.language}
            >
              <Globe className="ml-0.5 h-3.5 w-3.5 text-primary" aria-hidden />
              {languages.map((l) => (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => pick(l.code)}
                  aria-label={l.name}
                  aria-pressed={lang === l.code}
                  className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold tracking-wide transition-colors ${
                    lang === l.code
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-accent"
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>

            {/* Toggle Theme */}
            <button
              type="button"
              onClick={toggle}
              aria-label={dark ? t.ui.light : t.ui.dark}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary/70 bg-card text-primary transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {/* Music Player */}
            <MusicPlayer />

            {/* Mobile Nav Toggle - Hiện ở màn hình < XL */}
            <button
              type="button"
              onClick={() => setMobileNavOpen((prev) => !prev)}
              aria-label="Menu chuyển hướng"
              aria-expanded={mobileNavOpen}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary/70 bg-card text-primary xl:hidden"
            >
              {mobileNavOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav Dropdown */}
        {mobileNavOpen && (
          <nav className="border-t border-primary/20 bg-card px-6 py-4 xl:hidden">
            <div className="flex flex-col gap-3">
              {nav.map((n) => (
                <a
                  key={n.id}
                  href={`#${n.id}`}
                  onClick={() => setMobileNavOpen(false)}
                  className="text-sm font-semibold text-foreground transition-colors hover:text-accent"
                >
                  {n.label}
                </a>
              ))}
            </div>
          </nav>
        )}
      </header>

      {/* SECTION GIỚI THIỆU */}
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

      {/* SECTION KINH NGHIỆM */}
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

      {/* SECTION DỰ ÁN */}
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

      {/* SECTION KỸ NĂNG */}
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

      {/* SECTION THÀNH TÍCH */}
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

      {/* SECTION HOẠT ĐỘNG & PHONG TRÀO */}
      {t.activities && (
        <Section
          id="hoat-dong"
          eyebrow={t.sections.activities?.eyebrow ?? "Phong trào"}
          title={t.sections.activities?.title ?? "Hoạt động & Phong trào"}
        >
          <div className="grid gap-6 md:grid-cols-2">
            {t.activities.map((act, index) => (
              <article key={act.title || index} className={cardClass}>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-display text-lg font-extrabold text-primary">
                    {act.title}
                  </h3>
                  {act.period && (
                    <span className="shrink-0 rounded-full border-2 border-primary/30 bg-card px-2.5 py-0.5 text-[11px] font-bold text-accent">
                      {act.period}
                    </span>
                  )}
                </div>
                {act.role && (
                  <p className="mt-1 text-xs font-bold uppercase tracking-wider text-accent">
                    {act.role}
                  </p>
                )}
                <ul className="mt-4 space-y-2 text-sm leading-relaxed text-muted-foreground">
                  {act.details?.map((d, dIdx) => (
                    <li key={dIdx} className="flex gap-2">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rotate-45 bg-gold" />
                      {d}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </Section>
      )}

      {/* SECTION SỞ THÍCH CÁ NHÂN */}
      <Section
        id="so-thich"
        eyebrow={(t.sections as any)?.hobbies?.eyebrow ?? "Cá nhân"}
        title={(t.sections as any)?.hobbies?.title ?? "Sở thích cá nhân"}
      >
        <div className="grid gap-6 sm:grid-cols-3">
          {((t as any).interests ?? (t as any).hobbies ?? [
            "⚽ Bóng đá",
            "✈️ Đi du lịch",
            "🍲 Ăn uống",
          ]).map((item: any, idx: number) => {
            const isString = typeof item === "string";

            let icon = isString
              ? item.match(/\p{Extended_Pictographic}/u)?.[0] || "✨"
              : item.icon;
            let title = isString
              ? item.replace(/\p{Extended_Pictographic}/u, "").trim()
              : item.title || item.name;

            const defaultDescriptions: Record<string, string> = {
              "Bóng đá": "Theo dõi các trận cầu sôi động, giao lưu và rèn luyện thể lực cùng tinh thần đồng đội.",
              "Đi du lịch":
                "Trải nghiệm văn hóa ẩm thực và ghi lại khoảnh khắc đẹp.",
              "Ăn uống":
                "Thưởng thức ẩm thực đa dạng, khám phá các quán ăn ngon và đặc sản các vùng miền.",
            };

            const desc = isString
              ? defaultDescriptions[title] || "Sở thích và nguồn cảm hứng giải trí hàng ngày."
              : item.description || item.detail;

            return (
              <article key={title || idx} className={cardClass}>
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border-2 border-primary/40 bg-accent/20 text-2xl">
                    {icon}
                  </span>
                  <h3 className="font-display text-lg font-extrabold text-primary">
                    {title}
                  </h3>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {desc}
                </p>
              </article>
            );
          })}
        </div>
      </Section>

      {/* SECTION LIÊN HỆ */}
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