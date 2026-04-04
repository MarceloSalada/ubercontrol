import { createDailyEntryAction } from "@/app/dashboard/actions";

type DailyEntryFormProps = {
  defaultDate: string;
};

export function DailyEntryForm({ defaultDate }: DailyEntryFormProps) {
  return (
    <section className="card">
      <h2 className="section-title">Lançamento diário</h2>
      <form action={createDailyEntryAction} className="form-grid">
        <label className="field">
          <span>Data</span>
          <input className="input" type="date" name="date" defaultValue={defaultDate} required />
        </label>

        <label className="field">
          <span>Ganho bruto</span>
          <input className="input" type="text" name="gross" placeholder="320" required />
        </label>

        <label className="field">
          <span>KM rodado</span>
          <input className="input" type="text" name="km" placeholder="210" required />
        </label>

        <label className="field">
          <span>Preço do combustível</span>
          <input className="input" type="text" name="fuel_price" placeholder="5,87" required />
        </label>

        <label className="field">
          <span>Consumo médio (km/L)</span>
          <input className="input" type="text" name="consumption" placeholder="13" required />
        </label>

        <label className="field">
          <span>Custos extras</span>
          <input className="input" type="text" name="extras" placeholder="20" />
        </label>

        <button type="submit" className="primary-btn">
          Salvar diária
        </button>
      </form>
    </section>
  );
}
