import type { MouseEventHandler } from "react";

type HeaderProps = {
  onHome: MouseEventHandler<HTMLAnchorElement>;
};

export default function Header({ onHome }: HeaderProps) {
  return (
    <header className="topbar">
      <a
        className="brand"
        href="#home"
        aria-label="TuneSync início"
        onClick={onHome}
      >
        <span className="brand-mark" aria-hidden="true">
          TS
        </span>

        <span>
          <strong>TuneSync</strong>
          <small>CAR AUDIO COMPANION</small>
        </span>
      </a>

      <span className="status-indicator">
        <span className="status-dot" />
        Perfis locais
      </span>
    </header>
  );
}
