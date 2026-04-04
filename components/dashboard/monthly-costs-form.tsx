import { saveMonthlyCostsAction } from "@/app/dashboard/actions";

type MonthlyCosts = {
  financing?: number;
  insurance?: number;
  ipva?: number;
  oil_maintenance?: number;
  reserve_maintenance?: number;
  cellphone?: number;
  washing?: number;
  other_monthly?: number;
};

type MonthlyCostsFormProps = {
  monthRef: string;
  initialValues?: MonthlyCosts | null;
};

function asInputValue(value?: number) {
  return value && value > 0 ? String(value) : "";
}

export function MonthlyCostsForm({ monthRef, initialValues }: MonthlyCostsFormProps) {
  return (
    <section className="card">
      <h2 className="section-title">Custos mensais</h2>
      <form action={saveMonthlyCostsAction} className="form-grid">
        <input type="hidden" name="month_ref" value={monthRef} />

        <label className="field">
          <span>Mês de referência</span>
          <input className="input" type="month" value={monthRef} readOnly />
        </label>

        <label className="field">
          <span>Financiamento</span>
          <input className="input" type="text" name="financing" defaultValue={asInputValue(initialValues?.financing)} placeholder="0,00" />
        </label>

        <label className="field">
          <span>Seguro</span>
          <input className="input" type="text" name="insurance" defaultValue={asInputValue(initialValues?.insurance)} placeholder="0,00" />
        </label>

        <label className="field">
          <span>IPVA</span>
          <input className="input" type="text" name="ipva" defaultValue={asInputValue(initialValues?.ipva)} placeholder="0,00" />
        </label>

        <label className="field">
          <span>Manutenção óleo</span>
          <input className="input" type="text" name="oil_maintenance" defaultValue={asInputValue(initialValues?.oil_maintenance)} placeholder="0,00" />
        </label>

        <label className="field">
          <span>Reserva manutenção</span>
          <input className="input" type="text" name="reserve_maintenance" defaultValue={asInputValue(initialValues?.reserve_maintenance)} placeholder="0,00" />
        </label>

        <label className="field">
          <span>Internet / celular</span>
          <input className="input" type="text" name="cellphone" defaultValue={asInputValue(initialValues?.cellphone)} placeholder="0,00" />
        </label>

        <label className="field">
          <span>Lavagem</span>
          <input className="input" type="text" name="washing" defaultValue={asInputValue(initialValues?.washing)} placeholder="0,00" />
        </label>

        <label className="field">
          <span>Outros custos mensais</span>
          <input className="input" type="text" name="other_monthly" defaultValue={asInputValue(initialValues?.other_monthly)} placeholder="0,00" />
        </label>

        <button type="submit" className="primary-btn">
          Salvar custos mensais
        </button>
      </form>
    </section>
  );
}
