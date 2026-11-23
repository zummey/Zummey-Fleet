import { useId } from "react";
import { useSearchParams } from "react-router-dom";
import DetailTabs from "../../admin/components/DetailTabs";
import Modal from "../../admin/components/Modal";

export function Card({ title, description, action, children }) {
  return (
    <section className="ps-card">
      <header className="ps-card-header">
        <div><h2>{title}</h2>{description && <p>{description}</p>}</div>
        {action}
      </header>
      {children}
    </section>
  );
}

export function Field({ label, hint, options, placeholder, ...input }) {
  return (
    <label className="ps-field">
      <span>{label}</span>
      {options ? (
        <select {...input}>
          <option value="">{placeholder ?? `Select ${label.toLowerCase()}`}</option>
          {options.map(({ id, name }) => <option key={id} value={id}>{name}</option>)}
        </select>
      ) : <input placeholder={placeholder} {...input} />}
      {hint && <small>{hint}</small>}
    </label>
  );
}

export function Choice({ label, options, value, onChange, segmented = false, multiple = false }) {
  return (
    <div role="group" aria-label={label} className={`ps-choices ${segmented ? "ps-segmented" : ""}`}>
      {options.map((choice) => (
        <button key={choice} type="button" aria-pressed={multiple ? value.includes(choice) : value === choice}
          onClick={() => onChange(choice)}>{choice}</button>
      ))}
    </div>
  );
}

export function Sections({ label, sections, children }) {
  const [params, setParams] = useSearchParams();
  const idPrefix = useId();
  const active = sections.find(({ id }) => id === params.get("section")) ?? sections[0];

  return (
    <>
      <DetailTabs tabs={sections} activeTab={active.id} label={label} idPrefix={idPrefix}
        containerClassName="ps-subtabs"
        onChange={(id) => {
          const next = new URLSearchParams(params);
          next.set("section", id);
          setParams(next);
        }} />
      <div key={active.id} role="tabpanel" id={`${idPrefix}-panel-${active.id}`}
        aria-labelledby={`${idPrefix}-tab-${active.id}`}>
        {children(active)}
      </div>
    </>
  );
}

export function SettingsDialog({ title, onClose, onSubmit, submitLabel, children }) {
  const heading = useId();
  return (
    <Modal labelledBy={heading} onClose={onClose} className="ps-dialog max-w-lg">
      <form onSubmit={onSubmit}>
        <h2 id={heading}>{title}</h2>
        <div className="ps-dialog-fields">{children}</div>
        <div className="ps-actions">
          <button type="button" className="ps-button" onClick={onClose}>Cancel</button>
          <button className="ps-button ps-primary">{submitLabel}</button>
        </div>
      </form>
    </Modal>
  );
}
