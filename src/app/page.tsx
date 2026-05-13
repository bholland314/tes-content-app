"use client";

import { useState } from "react";

type Variant = {
  id: string;
  platform: string;
  body: string;
};

const PLATFORM_LABELS: Record<string, { label: string; color: string; emoji: string }> = {
  TWITTER: { label: "X / Twitter", color: "#000000", emoji: "🐦" },
  LINKEDIN: { label: "LinkedIn", color: "#0077B5", emoji: "💼" },
  INSTAGRAM: { label: "Instagram", color: "#E1306C", emoji: "📸" },
  TIKTOK: { label: "TikTok", color: "#010101", emoji: "🎵" },
  FACEBOOK: { label: "Facebook", color: "#1877F2", emoji: "👥" },
};

export default function Home() {
  const [body, setBody] = useState("");
  const [variants, setVariants] = useState<Variant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  async function generate() {
    if (!body.trim()) return;
    setLoading(true);
    setError("");
    setVariants([]);

    try {
      const contentRes = await fetch("/api/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });
      if (!contentRes.ok) throw new Error("Failed to save content");
      const content = await contentRes.json();

      const variantsRes = await fetch(`/api/content/${content.id}/variants`, {
        method: "POST",
      });
      if (!variantsRes.ok) throw new Error("Failed to generate variants");
      const data = await variantsRes.json();

      setVariants(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function copy(text: string, id: string) {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <main style={{ maxWidth: 800, margin: "0 auto", padding: "2rem 1rem", fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ fontSize: "1.75rem", fontWeight: 700, marginBottom: "0.5rem" }}>
        Content Variant Generator
      </h1>
      <p style={{ color: "#555", marginBottom: "1.5rem" }}>
        Write your content once. Get ready-to-post versions for every platform in seconds.
      </p>

      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Write your content here — an announcement, idea, blog post excerpt, anything..."
        rows={6}
        style={{
          width: "100%",
          padding: "0.75rem",
          fontSize: "1rem",
          border: "1px solid #ccc",
          borderRadius: 8,
          resize: "vertical",
          boxSizing: "border-box",
          fontFamily: "inherit",
        }}
      />

      <div style={{ marginTop: "0.75rem", display: "flex", gap: "1rem", alignItems: "center" }}>
        <button
          onClick={generate}
          disabled={loading || !body.trim()}
          style={{
            padding: "0.6rem 1.5rem",
            fontSize: "1rem",
            fontWeight: 600,
            background: loading || !body.trim() ? "#ccc" : "#2563EB",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            cursor: loading || !body.trim() ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Generating…" : "Generate Variants"}
        </button>
        {loading && (
          <span style={{ color: "#555", fontSize: "0.9rem" }}>
            Asking AI to adapt your content for each platform…
          </span>
        )}
      </div>

      {error && (
        <p style={{ marginTop: "1rem", color: "#dc2626", background: "#fef2f2", padding: "0.75rem", borderRadius: 8 }}>
          {error}
        </p>
      )}

      {variants.length > 0 && (
        <div style={{ marginTop: "2rem" }}>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 600, marginBottom: "1rem" }}>
            Your platform variants
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {variants.map((v) => {
              const meta = PLATFORM_LABELS[v.platform] ?? { label: v.platform, color: "#333", emoji: "📋" };
              return (
                <div
                  key={v.id}
                  style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: 10,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "0.6rem 1rem",
                      background: meta.color,
                      color: "#fff",
                    }}
                  >
                    <span style={{ fontWeight: 600 }}>
                      {meta.emoji} {meta.label}
                    </span>
                    <button
                      onClick={() => copy(v.body, v.id)}
                      style={{
                        background: "rgba(255,255,255,0.2)",
                        border: "none",
                        color: "#fff",
                        padding: "0.3rem 0.75rem",
                        borderRadius: 6,
                        cursor: "pointer",
                        fontSize: "0.85rem",
                        fontWeight: 600,
                      }}
                    >
                      {copied === v.id ? "Copied!" : "Copy"}
                    </button>
                  </div>
                  <p
                    style={{
                      margin: 0,
                      padding: "0.75rem 1rem",
                      whiteSpace: "pre-wrap",
                      lineHeight: 1.6,
                      fontSize: "0.95rem",
                    }}
                  >
                    {v.body}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </main>
  );
}
