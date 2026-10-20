import type { TrackProfile } from "../types/components";

type ProfileListProps = {
  profiles: TrackProfile[];
  selectedId: string | null;
  search: string;
  onSearchChange: (value: string) => void;
  onSelect: (profile: TrackProfile) => void;
  onCreate: () => void;
};

export default function ProfileList({
  profiles,
  selectedId,
  search,
  onSearchChange,
  onSelect,
  onCreate,
}: ProfileListProps) {
  const query = search.toLowerCase();

  const filteredProfiles = profiles.filter(
    (profile) =>
      profile.title.toLowerCase().includes(query) ||
      profile.artist.toLowerCase().includes(query),
  );

  return (
    <section className="library-section">
      <div className="section-heading">
        <div>
          <span className="eyebrow">SUA COLEÇÃO</span>
          <h2>Perfis de áudio</h2>
        </div>

        <span className="profile-count">
          {profiles.length} {profiles.length === 1 ? "perfil" : "perfis"}
        </span>
      </div>

      <input
        className="text-input search-input"
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="Buscar música ou artista..."
        aria-label="Buscar música ou artista"
      />

      {filteredProfiles.length === 0 ? (
        <div className="empty-state">
          <div className="empty-symbol" aria-hidden="true">
            EQ
          </div>

          <h3>
            {profiles.length === 0
              ? "Sua biblioteca começa aqui"
              : "Nenhum perfil encontrado"}
          </h3>

          <p>
            {profiles.length === 0
              ? "Cadastre uma música e monte seu primeiro perfil."
              : "Experimente buscar por outro título ou artista."}
          </p>

          {profiles.length === 0 && (
            <button className="secondary-button" onClick={onCreate}>
              Adicionar primeira música
            </button>
          )}
        </div>
      ) : (
        <div className="profile-list">
          {filteredProfiles.map((profile) => (
            <button
              key={profile.id}
              className={`profile-card ${
                selectedId === profile.id ? "selected" : ""
              }`}
              onClick={() => onSelect(profile)}
            >
              <span className="track-art" aria-hidden="true">
                <span>EQ</span>
              </span>

              <span className="track-info">
                <strong>{profile.title}</strong>
                <small>{profile.artist}</small>
              </span>

              <span className="track-values">
                <small>
                  B {profile.equalizer.bass > 0 ? "+" : ""}
                  {profile.equalizer.bass}
                </small>
                <small>
                  M {profile.equalizer.mids > 0 ? "+" : ""}
                  {profile.equalizer.mids}
                </small>
                <small>
                  A {profile.equalizer.treble > 0 ? "+" : ""}
                  {profile.equalizer.treble}
                </small>
              </span>

              <span className="profile-arrow" aria-hidden="true">
                →
              </span>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
