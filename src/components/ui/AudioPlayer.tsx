import { useEffect, useRef, useState } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Music,
} from "lucide-react";

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

export function AudioPlayer() {
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

  // Khởi tạo audio khi có tương tác đầu tiên (Tối ưu cho Mobile & PC)
  useEffect(() => {
    if (!isReady) return;

    const startAudioOnInteraction = () => {
      if (playerRef.current && playerRef.current.playVideo && !isPlaying) {
        playerRef.current.unMute();
        playerRef.current.playVideo();
        setIsPlaying(true);
      }
      window.removeEventListener("click", startAudioOnInteraction);
      window.removeEventListener("touchstart", startAudioOnInteraction);
      window.removeEventListener("pointerdown", startAudioOnInteraction);
      window.removeEventListener("scroll", startAudioOnInteraction);
      window.removeEventListener("keydown", startAudioOnInteraction);
    };

    window.addEventListener("click", startAudioOnInteraction);
    window.addEventListener("touchstart", startAudioOnInteraction);
    window.addEventListener("pointerdown", startAudioOnInteraction);
    window.addEventListener("scroll", startAudioOnInteraction);
    window.addEventListener("keydown", startAudioOnInteraction);

    return () => {
      window.removeEventListener("click", startAudioOnInteraction);
      window.removeEventListener("touchstart", startAudioOnInteraction);
      window.removeEventListener("pointerdown", startAudioOnInteraction);
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