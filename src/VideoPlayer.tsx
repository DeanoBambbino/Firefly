import { useState, useRef, DragEvent, ChangeEvent } from "react";

export default function VideoPlayer() {
  const [activeUrl, setActiveUrl] = useState("");
  const [activeLabel, setActiveLabel] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const ACCEPTED = ["video/mp4", "video/webm", "video/ogg", "video/quicktime"];

  const loadFromFile = async (file: File) => {
    if (!ACCEPTED.includes(file.type)) {
      setError(`Unsupported format: ${file.type || "unknown"}. Use MP4, WebM, or OGG.`);
      return;
    }

    setError(null);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "cod the fish"); // 🔴 replace with your Cloudinary upload preset

      const res = await fetch("https://api.cloudinary.com/v1_1/dtpxju1dm/video/upload", { // 🔴 replace your_cloud with your Cloudinary cloud name
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      console.log(data);
      if (!res.ok) {
        throw new Error(data.error?.message || "Upload failed");
      }

      setActiveUrl(data.secure_url);
      setActiveLabel(file.name);
    } catch (err) {
      setError("Upload failed. Check your Cloudinary config and try again.");
    } finally {
      setUploading(false);
    }
  };

  const closeVideo = () => {
    setActiveUrl("");
    setActiveLabel("");
    setError(null);
  };

  const closeVideo = () => {
    setActiveUrl("");
    setActiveLabel("");
    setError(null);
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
    closeVideo();
  };

  return (
    <div style={s.page}>
      <div style={s.bgGlow} />

      <header style={s.header}>
        <div style={s.brand}>
          <div style={s.brandIcon}>▶</div>
          <div style={s.brandName}>
            Beat<span style={{ color: "#ff5c2b" }}>Fly</span>
          </div>
        </div>

        {activeUrl && (
          <button style={s.newBtn} onClick={closeVideo}>
            + New Video
          </button>
        )}
      </header>

      {!activeUrl && (
        <div
          style={s.pageCenter}
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

      {activeUrl && (
        <div style={s.playerPage}>
          {error && <div style={s.errorBar}>⚠ {error}</div>}

          <div style={s.playerShell}>
            <div style={s.topBar}>
              <button
                style={{ ...s.dot, background: "#ff5f57", border: "none", cursor: "pointer" }}
                onClick={closeVideo}
              />
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

          {/* METADATA GRID - appears after video is added */}
          <div style={s.metaContainer}>
            <div style={s.metaTable}>
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} style={s.metaRow}>
                  <div style={s.metaCell}>Song:</div>
                  <div style={s.metaCell}>Artist:</div>
                  <div style={s.metaCell}>BPM:</div>
                </div>
              ))}
            </div>
          </div>

          <footer style={s.footer}>Powered By getsongbpm.com</footer>
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

  brandName: { fontSize: "1.1rem", fontWeight: 700 },

  newBtn: {
    background: "transparent",
    border: "1px solid #1e2530",
    borderRadius: "10px",
    color: "#636b7a",
    fontSize: "0.82rem",
    fontWeight: 600,
    padding: "8px 16px",
    cursor: "pointer",
  },

  pageCenter: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
  },

  emptyContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "28px",
  },

  dropContent: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "12px",
    textAlign: "center",
    padding: "60px 80px",
    border: "4px dashed #4a5260",
    borderRadius: "20px",
    cursor: "pointer",
  },

  dropIcon: { fontSize: "3.5rem", opacity: 0.6 },

  dropTitle: { fontWeight: 700, fontSize: "1.4rem" },

  dropSub: { fontSize: "0.82rem", color: "#636b7a" },
  errorBar: {
    width: "100%",
  },

  metaRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: "10px",
  },

  metaCell: {
    background: "#0f1318",
    border: "1px solid #1e2530",
    borderRadius: "10px",
    padding: "12px",
    textAlign: "center",
    fontFamily: "monospace",
    fontSize: "0.85rem",
    color: "#636b7a",
    pointerEvents: "none",
  },

  errorBar: {
    background: "rgba(255,92,43,0.1)",
    border: "1px solid rgba(255,92,43,0.3)",
    borderRadius: "10px",
    padding: "10px",
    fontSize: "0.82rem",
    color: "#ff5c2b",
  },

  playerPage: {
    maxWidth: "880px",
    margin: "0 auto",
    padding: "120px 20px 40px",
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },

  playerShell: {
    background: "#0f1318",
    border: "1px solid #1e2530",
    borderRadius: "20px",
    overflow: "hidden",
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
  },

  playerLabel: {
    marginLeft: "8px",
    fontFamily: "monospace",
    fontSize: "0.72rem",
    color: "#636b7a",
    flex: 1,
  },

  video: {
    width: "100%",
    maxHeight: "540px",
  },

  footer: {
    fontFamily: "monospace",
    fontSize: "0.7rem",
    color: "#636b7a",
    textAlign: "center",
    opacity: 0.5,
  },
};