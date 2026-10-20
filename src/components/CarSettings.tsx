type CarSettingsProps = {
  carName: string;
  onCarNameChange: (value: string) => void;
};

export default function CarSettings({
  carName,
  onCarNameChange,
}: CarSettingsProps) {
  return (
    <section className="car-section">
      <div className="section-heading">
        <div>
          <span className="eyebrow">SEU EQUIPAMENTO</span>
          <h2>Meu carro</h2>
        </div>

        <span className="section-number">01</span>
      </div>

      <label className="field-label" htmlFor="car-name">
        Modelo do carro ou central multimídia
      </label>

      <input
        id="car-name"
        className="text-input"
        value={carName}
        onChange={(event) => onCarNameChange(event.target.value)}
        placeholder="Ex.: Ford Focus 2.0"
      />

      <p className="helper-text">
        Identifique o equipamento ao qual seus ajustes se destinam.
      </p>
    </section>
  );
}
