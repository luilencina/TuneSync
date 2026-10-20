import type { Equalizer } from "../types/components";

type EqualizerEditorProps = {
  title: string;
  artist: string;
  equalizer: Equalizer;
  isEditing: boolean;
  onTitleChange: (value: string) => void;
  onArtistChange: (value: string) => void;
  onEqualizerChange: (key: keyof Equalizer, value: number) => void;
  onReset: () => void;
  onSave: () => void;
  onDelete: () => void;
  onClose: () => void;
};

const BANDS = [
  {
    key: "bass",
    label: "Graves",
    description: "Peso e impacto",
  },
  {
    key: "mids",
    label: "Médios",
    description: "Vozes e instrumentos",
  },
  {
    key: "treble",
    label: "Agudos",
    description: "Brilho e detalhes",
  },
] as const;

export default function EqualizerEditor({
  title,
  artist,
  equalizer,
  isEditing,
  onTitleChange,
  onArtistChange,
  onEqualizerChange,
  onReset,
  onSave,
  onDelete,
  onClose,
}: EqualizerEditorProps) {
  return (
    <section className="editor-section">
      <div className="section-heading">
        <div>
          <span className="eyebrow">
            {isEditing ? "PERFIL SELECIONADO" : "NOVO PERFIL"}
          </span>
          <h2>{isEditing ? "Editar equalização" : "Configurar música"}</h2>
        </div>

        <button className="text-button" onClick={onClose}>
          Fechar
        </button>
      </div>

      <div className="form-fields">
        <div>
          <label className="field-label" htmlFor="track-title">
            Nome da música
          </label>
          <input
            id="track-title"
            className="text-input"
            value={title}
            onChange={(event) => onTitleChange(event.target.value)}
            placeholder="Ex.: Midnight City"
          />
        </div>

        <div>
          <label className="field-label" htmlFor="track-artist">
            Artista
          </label>
          <input
            id="track-artist"
            className="text-input"
            value={artist}
            onChange={(event) => onArtistChange(event.target.value)}
            placeholder="Ex.: M83"
          />
        </div>
      </div>

      <div className="equalizer-panel">
        <div className="equalizer-heading">
          <div>
            <span className="eyebrow">AJUSTE MANUAL</span>
            <h3>Equalizador</h3>
          </div>

          <button className="text-button" onClick={onReset}>
            Restaurar
          </button>
        </div>

        <p className="helper-text">
          Ajuste os valores conforme o som que deseja obter.
        </p>

        {BANDS.map((band) => (
          <div className="eq-control" key={band.key}>
            <div className="eq-label-row">
              <div>
                <strong>{band.label}</strong>
                <small>{band.description}</small>
              </div>

              <output className="eq-value">
                {equalizer[band.key] > 0 ? "+" : ""}
                {equalizer[band.key]}
              </output>
            </div>

            <input
              type="range"
              min="-10"
              max="10"
              step="1"
              value={equalizer[band.key]}
              onChange={(event) =>
                onEqualizerChange(band.key, Number(event.target.value))
              }
              aria-label={band.label}
            />

            <div className="range-labels">
              <span>-10</span>
              <span>0</span>
              <span>+10</span>
            </div>
          </div>
        ))}

        <div className="eq-preview">
          {BANDS.map((band) => (
            <div className="preview-band" key={band.key}>
              <div className="preview-track">
                <div
                  className="preview-center"
                  style={{
                    left: `${((equalizer[band.key] + 10) / 20) * 100}%`,
                  }}
                />
              </div>

              <span>{band.label.toUpperCase()}</span>
            </div>
          ))}
        </div>
      </div>

      <button className="primary-button save-button" onClick={onSave}>
        Salvar perfil de áudio
      </button>

      {isEditing && (
        <button className="delete-button" onClick={onDelete}>
          Excluir perfil
        </button>
      )}

      <p className="helper-text disclaimer">
        Os valores são referências para ajuste manual. O TuneSync não altera
        diretamente o Spotify nem controla a central multimídia.
      </p>
    </section>
  );
}
