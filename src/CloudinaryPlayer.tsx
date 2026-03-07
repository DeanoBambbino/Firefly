import { useState, useEffect, useRef } from "react";

// Cloudinary Video Player types
declare global {
  interface Window {
    cloudinary: {
      Cloudinary: {
        new(config: { cloud_name: string }): CloudinaryInstance;
      };
    };
  }
}

interface CloudinaryInstance {
  videoPlayer(id: string, options: VideoPlayerOptions): VideoPlayer;
}

interface VideoPlayerOptions {
  fluid?: boolean;
  controls?: boolean;
  autoplay?: boolean;
  muted?: boolean;
  loop?: boolean;
  showLogo?: boolean;
  playbackRates?: number[];
  sourceTypes?: string[];
  transformation?: Record<string, string>;
  posterOptions?: Record<string, unknown>;
}

interface VideoPlayer {
  source(publicId: string): void;
  dispose(): void;
  on(event: string, callback: () => void): void;
}

interface VideoConfig {
  cloudName: string;
  publicId: string;
}

// Load external scripts dynamically
function useScript(src: string): boolean {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (document.querySelector(`script[src="${src}"]`)) {
      setLoaded(true);
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => setLoaded(true);
    document.head.appendChild(script);
  }, [src]);

  return loaded;
}

function useStylesheet(href: string): void {
  useEffect(() => {
    if (document.querySelector(`link[href="${href}"]`)) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    document.head.appendChild(link);
  }, [href]);
}

// --- Sub-components ---

function TopBar({ label }: { label: string }) {
  return (
    <div style={styles.topBar}>
      <span style={{ ...styles.dot, background: "#ff5f57" }} />
      <span style={{ ...styles.dot, background: "#febc2e" }} />
      <span style={{ ...styles.dot, background: "#28c840" }} />
      <span style={styles.playerLabel}>{label}</span>
    </div>
  );
}

function EmptyState() {
  return (
    <div style={styles.emptyState}>
      <div style={styles.emptyIcon}>🎬</div>
      <div style={styles.emptyTitle}>No video loaded</div>
      <div style={styles.emptySub}>
        Enter your Cloudinary Cloud Name and Public ID above, then press Load
        Video.
      </div>
    </div>
  );
}

function ErrorBar({ message }: { message: string }) {
  return <div style={styles.errorBar}>⚠ {message}</div>;
}

function ConfigPanel({
  config,
  onChange,
  onLoad,
}: {
  config: VideoConfig;
  onChange: (key: keyof VideoConfig, value: string) => void;
  onLoad: () => void;
}) {
  return (
    <div style={styles.configPanel}>
      <div style={styles.configTitle}>Video Source</div>
      <div style={styles.inputRow}>
        <Field
          label="Cloud Name"
          id="cloudName"
          value={config.cloudName}
          placeholder="e.g. demo"
          onChange={(v) => onChange("cloudName", v)}
          onEnter={onLoad}
        />
        <Field
          label="Public ID"
          id="publicId"
          value={config.publicId}
          placeholder="e.g. samples/elephants"
          onChange={(v) => onChange("publicId", v)}
          onEnter={onLoad}
        />
      </div>
      <button style={styles.loadBtn} onClick={onLoad}>
        Load Video
      </button>
    </div>
  );
}

function Field({
  label,
  id,
  value,
  placeholder,
  onChange,
  onEnter,
}: {
  label: string;
  id: string;
  value: string;
  placeholder: string;
  onChange: (v: string) => void;
  onEnter: () => void;
}) {
  return (
    <div style={styles.field}>
      <label htmlFor={id} style={styles.label}>
        {label}
      </label>
      <input
        id={id}
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onEnter()}
        style={styles.input}
      />
    </div>
  );
}

// --- Main Component ---

export default function CloudinaryPlayer() {
  const [config, setConfig] = useState<VideoConfig>({
    cloudName: "demo",
    publicId: "samples/elephants",
  });
  const [playerLabel, setPlayerLabel] = useState("No video loaded");
  const [error, setError] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const playerRef = useRef<VideoPlayer | null>(null);
  const videoElId = "cld-player-video";

  const coreLoaded = useScript(
    "https://unpkg.com/cloudinary-core@2.13.1/cloudinary-core-shrinkwrap.min.js"
  );
  const sdkLoaded = useScript(
    "https://unpkg.com/cloudinary-video-player@2.1.0/dist/cld-video-player.min.js"
  );
  useStylesheet(
    "https://unpkg.com/cloudinary-video-player@2.1.0/dist/cld-video-player.min.css"
  );

  const sdkReady = coreLoaded && sdkLoaded;

  const loadVideo = () => {
    const { cloudName, publicId } = config;
    setError(null);

    if (!cloudName.trim() || !publicId.trim()) {
      setError("Please fill in both Cloud Name and Public ID.");
      return;
    }

    if (!sdkReady || !window.cloudinary) {
      setError("Cloudinary SDK not ready yet. Please try again.");
      return;
    }

    // Dispose previous player
    if (playerRef.current) {
      try {
        playerRef.current.dispose();
      } catch (_) {}
      playerRef.current = null;

      // Re-insert video element after dispose
      const container = document.getElementById("player-inner");
      if (container) {
        container.innerHTML = "";
        const video = document.createElement("video");
        video.id = videoElId;
        video.className = "cld-video-player cld-fluid";
        container.appendChild(video);
      }
    }

    const cld = new window.cloudinary.Cloudinary({ cloud_name: cloudName });
    const player = cld.videoPlayer(videoElId, {
      fluid: true,
      controls: true,
      autoplay: false,
      muted: false,
      loop: false,
      showLogo: false,
      playbackRates: [0.5, 0.75, 1, 1.25, 1.5, 2],
      sourceTypes: ["hls", "mp4"],
      transformation: { quality: "auto", fetch_format: "auto" },
      posterOptions: { transformation: { width: "860", crop: "fill" } },
    });

    player.source(publicId);
    playerRef.current = player;
    setPlayerLabel(`${cloudName} / ${publicId}`);
    setIsLoaded(true);

    player.on("error", () => {
      setError("Could not load video. Check your Cloud Name and Public ID.");
      setIsLoaded(false);
      setPlayerLabel("Load failed");
    });
  };

  // Auto-load on SDK ready


  useEffect(() => {
  if (sdkReady) loadVideo();

  return () => {
    if (playerRef.current) {
      try { playerRef.current.dispose(); } catch (_) {}
      playerRef.current = null;
    }
  };
}, [sdkReady]);


  return (
    <div style={styles.wrapper}>
      {/* Background glow */}
      <div style={styles.bgGlow} />

      {/* Header */}
      <header style={styles.header}>
        <div style={styles.brand}>
          <div style={styles.brandIcon}>▶</div>
          <div style={styles.brandName}>
            Cloud<span style={{ color: "#ff5c2b" }}>Play</span>
          </div>
        </div>
        <div style={styles.statusPill}>CLOUDINARY PLAYER</div>
      </header>

      {/* Config */}
      <ConfigPanel
        config={config}
        onChange={(key, value) => setConfig((prev) => ({ ...prev, [key]: value }))}
        onLoad={loadVideo}
      />

      {/* Error */}
      {error && <ErrorBar message={error} />}

      {/* Player Shell */}
      <div style={styles.playerShell}>
        <TopBar label={playerLabel} />
        <div style={styles.playerContainer}>
          {!isLoaded && <EmptyState />}
          <div
            id="player-inner"
            style={{ display: isLoaded ? "block" : "none" }}
          >
            <video
              id={videoElId}
              className="cld-video-player cld-fluid"
            />
          </div>
        </div>
      </div>

      <footer style={styles.footer}>
        Powered by Cloudinary Video Player SDK · cloudinary.com
      </footer>
    </div>
  );
}

// --- Styles ---

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    position: "relative",
    minHeight: "100vh",
    background: "#080a0e",
    color: "#eceef2",
    fontFamily: "'Syne', sans-serif",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "40px 20px",
    gap: "24px",
    maxWidth: "880px",
    margin: "0 auto",
  },
  bgGlow: {
    position: "fixed",
    inset: 0,
    background:
      "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(255,92,43,0.08) 0%, transparent 70%)",
    pointerEvents: "none",
    zIndex: 0,
  },
  header: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottom: "1px solid #1e2530",
    paddingBottom: "16px",
    position: "relative",
    zIndex: 1,
  },
  brand: { display: "flex", alignItems: "center", gap: "10px" },
  brandIcon: {
    width: "36px",
    height: "36px",
    background: "linear-gradient(135deg, #ff5c2b, #ffb547)",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
  },
  brandName: { fontSize: "1.1rem", fontWeight: 700, letterSpacing: "-0.02em" },
  statusPill: {
    fontFamily: "monospace",
    fontSize: "0.68rem",
    color: "#ffb547",
    background: "rgba(255,181,71,0.1)",
    border: "1px solid rgba(255,181,71,0.25)",
    borderRadius: "999px",
    padding: "3px 10px",
    letterSpacing: "0.05em",
  },
  configPanel: {
    width: "100%",
    background: "#0f1318",
    border: "1px solid #1e2530",
    borderRadius: "16px",
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    position: "relative",
    zIndex: 1,
  },
  configTitle: {
    fontSize: "0.72rem",
    fontWeight: 600,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: "#636b7a",
  },
  inputRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "14px",
  },
  field: { display: "flex", flexDirection: "column", gap: "6px" },
  label: {
    fontSize: "0.72rem",
    fontWeight: 600,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "#636b7a",
  },
  input: {
    background: "#080a0e",
    border: "1px solid #1e2530",
    borderRadius: "10px",
    padding: "11px 14px",
    fontFamily: "monospace",
    fontSize: "0.85rem",
    color: "#eceef2",
    outline: "none",
    width: "100%",
  },
  loadBtn: {
    alignSelf: "flex-start",
    background: "linear-gradient(135deg, #ff5c2b 0%, #ffb547 100%)",
    color: "#080a0e",
    fontFamily: "'Syne', sans-serif",
    fontWeight: 700,
    fontSize: "0.9rem",
    letterSpacing: "0.04em",
    border: "none",
    borderRadius: "10px",
    padding: "12px 28px",
    cursor: "pointer",
  },
  errorBar: {
    width: "100%",
    background: "rgba(255,92,43,0.1)",
    border: "1px solid rgba(255,92,43,0.3)",
    borderRadius: "10px",
    padding: "12px 16px",
    fontSize: "0.82rem",
    color: "#ff5c2b",
    position: "relative",
    zIndex: 1,
  },
  playerShell: {
    width: "100%",
    background: "#0f1318",
    border: "1px solid #1e2530",
    borderRadius: "20px",
    overflow: "hidden",
    boxShadow: "0 24px 80px rgba(0,0,0,0.5)",
    position: "relative",
    zIndex: 1,
  },
  topBar: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "14px 18px",
    borderBottom: "1px solid #1e2530",
  },
  dot: { width: "10px", height: "10px", borderRadius: "50%", display: "inline-block" },
  playerLabel: {
    marginLeft: "8px",
    fontFamily: "monospace",
    fontSize: "0.72rem",
    color: "#636b7a",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    flex: 1,
  },
  playerContainer: { position: "relative", width: "100%", background: "#000" },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "14px",
    padding: "80px 40px",
    textAlign: "center",
  },
  emptyIcon: { fontSize: "3rem", opacity: 0.3 },
  emptyTitle: { fontSize: "1.1rem", fontWeight: 700, color: "#636b7a" },
  emptySub: {
    fontSize: "0.82rem",
    color: "#636b7a",
    opacity: 0.6,
    maxWidth: "300px",
    lineHeight: 1.5,
  },
  footer: {
    fontFamily: "monospace",
    fontSize: "0.68rem",
    color: "#636b7a",
    opacity: 0.5,
    position: "relative",
    zIndex: 1,
  },
};
