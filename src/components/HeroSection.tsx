const SOUND_BARS = [32, 54, 78, 46, 94, 64, 40, 72, 50, 86, 38];

export default function HeroSection() {
  return (
    <section
      className="relative flex min-h-[23.75rem] items-center overflow-hidden py-14"
      id="home"
    >
      <div className="relative z-10 max-w-[38rem]">
        <span className="text-[0.65rem] font-bold tracking-[0.16em] text-accent">
          SUA MÚSICA, SEU SOM
        </span>
        <h1 className="my-4 text-5xl font-semibold leading-[1.02] tracking-[-0.065em] sm:text-7xl">
          Equalização
          <br />
          <span className="text-accent">para o que toca.</span>
        </h1>
        <p className="mb-6 max-w-[30rem] text-sm leading-7 text-text-muted">
          O TuneSync identifica a faixa ativa no Spotify e sugere um ponto de
          partida para o equalizador. Você ajusta os controles no próprio
          Spotify.
        </p>
      </div>
      <div className="pointer-events-none absolute right-0 top-1/2 hidden size-[20rem] -translate-y-1/2 items-center justify-center sm:flex">
        <div className="absolute size-44 rounded-full border border-accent/10" />
        <div className="absolute size-64 rounded-full border border-accent/10" />
        <div className="absolute size-80 rounded-full border border-accent/10" />
        <div className="relative flex h-28 items-center gap-[7px]">
          {SOUND_BARS.map((height, index) => (
            <span
              key={index}
              className="min-h-3 w-1.5 rounded-full bg-gradient-to-b from-accent-light to-accent-deep shadow-accent-bars"
              style={{ height: `${height}%` }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
