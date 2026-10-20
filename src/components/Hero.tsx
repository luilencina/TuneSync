type HeroProps = {
  onCreateProfile: () => void;
};

export default function Hero({ onCreateProfile }: HeroProps) {
  return (
    <section className="hero" id="home">
      <div className="hero-copy">
        <span className="eyebrow">SEU SOM, DO SEU JEITO</span>

        <h1>
          Cada música.
          <br />
          <span>Uma experiência.</span>
        </h1>

        <p>
          Crie ajustes de áudio personalizados para suas músicas e consulte as
          configurações recomendadas no seu carro.
        </p>

        <button className="primary-button" onClick={onCreateProfile}>
          + Criar perfil de áudio
        </button>
      </div>

      <div className="sound-visual" aria-hidden="true">
        <div className="sound-ring ring-one" />
        <div className="sound-ring ring-two" />
        <div className="sound-ring ring-three" />

        <div className="sound-bars">
          {[32, 54, 78, 46, 94, 64, 40, 72, 50, 86, 38].map((height, index) => (
            <span key={index} style={{ height: `${height}%` }} />
          ))}
        </div>
      </div>
    </section>
  );
}
