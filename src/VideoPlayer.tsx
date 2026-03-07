import { useState, useRef, DragEvent, ChangeEvent } from "react";

export default function VideoPlayer() {
  const [activeUrl, setActiveUrl] = useState("");
  const [activeLabel, setActiveLabel] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const ACCEPTED = ["video/mp4", "video/webm", "video/ogg", "video/quicktime"];

  const loadFromFile = (file: File) => {
    if (!ACCEPTED.includes(file.type)) {
      setError(`Unsupported format: ${file.type || "unknown"}. Use MP4, WebM, or OGG.`);
      return;
    }
    setError(null);
    const objectUrl = URL.createObjectURL(file);
    setActiveUrl(objectUrl);
    setActiveLabel(file.name);
  };

  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(true);
  };
  const onDragLeave = () => setDragging(false);
  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) loadFromFile(file);
  };

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) loadFromFile(file);
  };

  const handleError = () => {
    setError("Could not load video. Try a different file.");
    setActiveUrl("");
    setActiveLabel("");
  };

  return (
    <div style={s.page}>
      <div style={s.bgGlow} />

      {/* Fixed header — always visible */}
      <header style={s.header}>
        <div style={s.brand}>
          <div style={s.brandIcon}>▶</div>
          <div style={s.brandName}>
            Beat<span style={{ color: "#ff5c2b" }}>Fly</span>
          </div>
        </div>
        {activeUrl && (
          <button
            style={s.newBtn}
            onClick={() => {
              setActiveUrl("");
              setActiveLabel("");
              setError(null);
            }}
          >
            + New Video
          </button>
        )}
      </header>

      {/* EMPTY STATE */}
      {!activeUrl && (
        <div
          style={{ ...s.fullDropZone, ...(dragging ? s.fullDropZoneActive : {}) }}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div style={{ ...s.dropContent, ...(dragging ? { borderColor: "#ff5c2b" } : {}) }}>
            <div style={s.dropIcon}>{dragging ? "⬇" : "📁"}</div>
            <div style={s.dropTitle}>{dragging ? "Release to load" : "Drop a video file"}</div>
            <div style={s.dropSub}>or click anywhere to browse · MP4, WebM, OGG</div>
            {error && <div style={s.errorBar}>⚠ {error}</div>}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="video/mp4,video/webm,video/ogg,video/quicktime"
            style={{ display: "none" }}
            onChange={onFileChange}
          />
        </div>
      )}

      {/* PLAYER STATE */}
      {activeUrl && (
        <div style={s.playerPage}>
          {error && <div style={s.errorBar}>⚠ {error}</div>}

          <div style={s.playerShell}>
            <div style={s.topBar}>
              <span style={{ ...s.dot, background: "#ff5f57" }} />
              <span style={{ ...s.dot, background: "#febc2e" }} />
              <span style={{ ...s.dot, background: "#28c840" }} />
              <span style={s.playerLabel}>{activeLabel}</span>
            </div>
            <video
              ref={videoRef}
              key={activeUrl}
              src={activeUrl}
              controls
              autoPlay
              style={s.video}
              onError={handleError}
            />
          </div>

          <footer style={s.footer}>HTML5 Video Player</footer>
        </div>
      )}
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: {
    position: "fixed",
    inset: 0,
    background: "#080a0e",
    color: "#eceef2",
    fontFamily: "'Syne', sans-serif",
    overflow: "auto",
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
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "20px 32px",
    borderBottom: "1px solid #1e2530",
    background: "#080a0e",
    zIndex: 10,
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
  newBtn: {
    background: "transparent",
    border: "1px solid #1e2530",
    borderRadius: "10px",
    color: "#636b7a",
    fontFamily: "inherit",
    fontSize: "0.82rem",
    fontWeight: 600,
    padding: "8px 16px",
    cursor: "pointer",
  },
  fullDropZone: {
    position: "fixed",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    zIndex: 1,
    transition: "background 0.2s",
  },
  fullDropZoneActive: {
    background: "rgba(255,92,43,0.05)",
  },
  dropContent: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "12px",
    pointerEvents: "none",
    textAlign: "center",
    padding: "60px 80px",
    border: "4px dashed #4a5260",
    borderRadius: "20px",
    transition: "border-color 0.2s",
  },
  dropIcon: { fontSize: "3.5rem", opacity: 0.6 },
  dropTitle: { fontWeight: 700, fontSize: "1.4rem", letterSpacing: "-0.02em" },
  dropSub: { fontSize: "0.82rem", color: "#636b7a" },
  errorBar: {
    width: "100%",
    background: "rgba(255,92,43,0.1)",
    border: "1px solid rgba(255,92,43,0.3)",
    borderRadius: "10px",
    padding: "12px 16px",
    fontSize: "0.82rem",
    color: "#ff5c2b",
    pointerEvents: "auto",
  },
  playerPage: {
    position: "relative",
    zIndex: 1,
    maxWidth: "880px",
    margin: "0 auto",
    padding: "120px 20px 40px",
    display: "flex",
    flexDirection: "column",
    gap: "24px",
    minHeight: "100vh",
  },
  playerShell: {
    width: "100%",
    background: "#0f1318",
    border: "1px solid #1e2530",
    borderRadius: "20px",
    overflow: "hidden",
    boxShadow: "0 24px 80px rgba(0,0,0,0.5)",
  },
  topBar: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "14px 18px",
    borderBottom: "1px solid #1e2530",
  },
  dot: {
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    display: "inline-block",
  },
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
  video: {
    width: "100%",
    maxHeight: "540px",
    display: "block",
  },
  footer: {
    fontFamily: "monospace",
    fontSize: "0.68rem",
    color: "#636b7a",
    opacity: 0.5,
    textAlign: "center",
    marginTop: "auto",
  },
};
