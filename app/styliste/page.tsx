"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { BlobImage } from "@/components/BlobImage";
import { getItems } from "@/lib/db";
import type { Item } from "@/lib/types";

interface Msg {
  role: "me" | "ai";
  text: string;
  itemIds?: string[];
}

export default function StylistePage() {
  const [items, setItems] = useState<Item[]>([]);
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "ai",
      text: "Coucou Anjed 💛 Dis-moi l'occasion ou l'envie du jour, et je te compose un look avec tes vêtements.",
    },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getItems("perso").then(setItems).catch(() => {});
  }, []);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, busy]);

  async function send() {
    const text = input.trim();
    if (!text || busy) return;
    setMessages((m) => [...m, { role: "me", text }]);
    setInput("");
    setBusy(true);
    try {
      const wardrobe = items.map((i) => ({
        id: i.id,
        category: i.category,
        name: i.name,
        color: i.colorTag,
      }));
      const history = messages.slice(-6).map((m) => ({ role: m.role, text: m.text }));
      const r = await fetch("/api/stylist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, wardrobe, history }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Réponse impossible");
      setMessages((m) => [
        ...m,
        { role: "ai", text: data.message, itemIds: data.itemIds },
      ]);
    } catch (e) {
      setMessages((m) => [
        ...m,
        {
          role: "ai",
          text: e instanceof Error ? e.message : "Oups, je n'ai pas réussi à répondre. Réessaie ?",
        },
      ]);
    } finally {
      setBusy(false);
    }
  }

  const byId = (id: string) => items.find((i) => i.id === id);

  return (
    <div className="screen chat">
      <header className="app-header">
        <h1 className="section-title">Ta styliste</h1>
      </header>

      <div className="chat__messages">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`bubble ${m.role === "ai" ? "bubble--ai" : "bubble--me"}`}
          >
            <p>{m.text}</p>
            {m.itemIds && m.itemIds.length > 0 && (
              <div className="suggestion-card">
                <div className="selected-strip">
                  {m.itemIds.map((id) => {
                    const it = byId(id);
                    return it ? (
                      <BlobImage
                        key={id}
                        blob={it.image}
                        alt={it.name ?? ""}
                        className="selected-strip__img"
                      />
                    ) : null;
                  })}
                </div>
                <Link
                  className="btn btn--primary btn--block"
                  href={`/essayer?items=${m.itemIds.join(",")}`}
                >
                  ✨ Essayer ce look
                </Link>
              </div>
            )}
          </div>
        ))}
        {busy && (
          <div className="bubble bubble--ai">
            <span className="typing" aria-label="La styliste écrit">
              <i />
              <i />
              <i />
            </span>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {items.length === 0 && (
        <p className="muted-text center">
          Ajoute des vêtements à ton dressing pour que je puisse composer 💛
        </p>
      )}

      <div className="chat__composer">
        <input
          className="input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") send();
          }}
          placeholder="Quoi porter aujourd'hui ?"
          aria-label="Message à la styliste"
        />
        <button
          type="button"
          className="btn btn--primary chat__composer__send"
          onClick={send}
          disabled={busy || !input.trim()}
          aria-label="Envoyer"
        >
          ➤
        </button>
      </div>
    </div>
  );
}
