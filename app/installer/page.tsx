import Link from "next/link";

export const metadata = { title: "Installer — Anjed's Closet" };

export default function InstallerPage() {
  return (
    <div className="screen stack">
      <header className="app-header">
        <h1 className="section-title">Installer l&rsquo;app</h1>
        <p className="muted-text">Pour l&rsquo;avoir comme une vraie app, avec son icône 💛</p>
      </header>

      <section className="card stack">
        <h2>📱 Sur iPhone (Safari)</h2>
        <ol className="guide">
          <li>
            Ouvre cette page dans <strong>Safari</strong>.
          </li>
          <li>
            Touche le bouton <strong>Partager</strong> (le carré avec une flèche vers le haut),
            en bas de l&rsquo;écran.
          </li>
          <li>
            Fais défiler, puis choisis <strong>« Sur l&rsquo;écran d&rsquo;accueil »</strong>.
          </li>
          <li>
            Touche <strong>Ajouter</strong> → l&rsquo;icône apparaît sur ton écran ✨
          </li>
        </ol>
      </section>

      <section className="card stack">
        <h2>🤖 Sur Android (Chrome)</h2>
        <ol className="guide">
          <li>
            Ouvre cette page dans <strong>Chrome</strong>.
          </li>
          <li>
            Touche le menu <strong>⋮</strong> en haut à droite.
          </li>
          <li>
            Choisis <strong>« Ajouter à l&rsquo;écran d&rsquo;accueil »</strong>.
          </li>
          <li>Confirme → l&rsquo;icône apparaît ✨</li>
        </ol>
      </section>

      <Link href="/" className="btn btn--primary btn--block">
        C&rsquo;est parti
      </Link>
    </div>
  );
}
