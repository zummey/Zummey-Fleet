import { useState } from "react";
import { Card, Choice, Field, SettingsDialog } from "./shared";
import { usePreference } from "./usePreference";

const integrations = [
  {
    id: "payment", title: "Payment gateway", description: "Takes card and transfer payments from customers.",
    providers: ["Paystack", "Flutterwave"], fields: [["publicKey", "Public key", true], ["secret", "Secret key", true]],
    initial: { publicKey: "pk_l••••••c2d4", secret: "sk_l••••••a9c3", checked: "Today, 08:02" },
  },
  {
    id: "sms", title: "SMS provider", description: "Sends text messages to customers and riders.",
    providers: ["Termii", "Twilio"], fields: [["key", "API key", true], ["sender", "Sender ID"]],
    initial: { key: "TLxk••••••7710", sender: "ZUMMEY", checked: "Today, 08:02" },
  },
  {
    id: "email", title: "Email provider", description: "Sends receipts, updates and promotions by email.",
    providers: ["SendGrid", "Mailgun"], fields: [["key", "API key", true], ["email", "Send from (email)"], ["name", "Send from (name)"]],
    initial: { key: "SG.q••••••30aa", email: "no-reply@zummey.com", name: "Zummey", checked: "Yesterday, 17:30" },
  },
  {
    id: "whatsapp", title: "WhatsApp API", description: "Sends WhatsApp messages through the WhatsApp Business Platform.",
    fields: [["phone", "Business phone number"], ["token", "Access token", true], ["account", "Business account ID"]],
    initial: {},
  },
];

const defaults = Object.fromEntries(integrations.map(({ id, providers, initial }) => [
  id, { ...initial, provider: providers?.[0], connected: Boolean(providers) },
]));

export default function Integrations() {
  const [settings, save] = usePreference("integrations", defaults);
  const [editing, setEditing] = useState(null);
  const [notice, setNotice] = useState("");
  const [disconnect, setDisconnect] = useState(null);
  const update = (id, value) => save({ ...settings, [id]: value });

  return (
    <>
      {notice && <p role="status" className="ps-notice">{notice}</p>}
      <div className="ps-grid ps-integration-grid">
        {integrations.map((integration) => {
          const { id, title, description, providers, fields } = integration;
          const current = settings[id];
          let details = fields.map(([key, label]) => [label, current[key]]);
          if (providers) details.unshift(["Provider", current.provider]);
          if (id === "email") details = [...details.slice(0, 2), ["Sends from", current.email && `${current.name} <${current.email}>`]];
          if (id === "whatsapp") details[0][0] = "Phone number";
          details.push(["Last checked", current.checked ?? "Never"]);
          return (
            <Card key={id} title={title} description={description} action={
              <span className={`ps-badge ${current.connected ? "ps-good" : ""}`}>{current.connected ? "Connected" : "Not connected"}</span>
            }>
              <dl className="ps-integration-details">
                {details.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value || "—"}</dd></div>)}
              </dl>
              <div className="ps-actions">
                <button className={`ps-button ${current.connected ? "" : "ps-primary"}`} onClick={() => setEditing(integration)}>
                  {current.connected ? "Edit details" : "Connect"}
                </button>
                {current.connected && <>
                  <button className="ps-button" onClick={() => setNotice(`Testing ${title.toLowerCase()} requires a backend integration.`)}>Test connection</button>
                  <button className="ps-danger" onClick={() => setDisconnect(integration)}>Disconnect</button>
                </>}
              </div>
            </Card>
          );
        })}
      </div>
      {editing && <IntegrationEditor integration={editing} current={settings[editing.id]}
        onClose={() => setEditing(null)} onSave={(next) => {
          update(editing.id, next);
          setNotice(editing.id === "whatsapp" || !next.connected
            ? "Details saved locally. Connecting and testing require a backend integration."
            : "Details saved locally. Applying them to the provider requires a backend integration.");
          setEditing(null);
        }} />}
      {disconnect && (
        <SettingsDialog title={`Disconnect ${disconnect.title.toLowerCase()}`} submitLabel="Disconnect"
          onClose={() => setDisconnect(null)} onSubmit={(event) => {
            event.preventDefault();
            update(disconnect.id, { ...settings[disconnect.id], connected: false });
            setNotice("Disconnected in this browser. Changing the provider connection requires a backend integration.");
            setDisconnect(null);
          }}>
          <p>Mark {disconnect.title} as disconnected?</p>
        </SettingsDialog>
      )}
    </>
  );
}

function IntegrationEditor({ integration, current, onClose, onSave }) {
  const { id, title, providers, fields } = integration;
  const [provider, setProvider] = useState(current.provider);
  const [values, setValues] = useState(() => Object.fromEntries(fields.map(([key, , credential]) => [
    key, credential ? "" : current[key] ?? "",
  ])));
  const providerChanged = provider !== current.provider;
  const action = current.connected ? "Edit" : "Connect";

  return (
    <SettingsDialog title={`${action} ${id === "whatsapp" ? title : title.toLowerCase()}`}
      submitLabel={id === "whatsapp" && !current.connected ? "Save and test" : "Save"}
      onClose={onClose} onSubmit={(event) => {
        event.preventDefault();
        const next = { ...current, provider, connected: current.connected && !providerChanged };
        if (providerChanged) delete next.checked;
        for (const [key, , credential] of fields) {
          if (!credential) next[key] = values[key].trim();
          else if (values[key] || providerChanged) delete next[key];
        }
        onSave(next);
      }}>
      {providers && <div className="ps-field"><span>Provider</span>
        <Choice label="Provider" options={providers} value={provider} onChange={setProvider} />
      </div>}
      {fields.map(([key, label, credential], index) => (
        <Field key={key} label={label} value={values[key]} autoFocus={index === 0}
          type={credential ? "password" : key === "email" ? "email" : key === "phone" ? "tel" : "text"}
          autoComplete={credential ? "new-password" : undefined} required={!credential}
          onChange={(event) => setValues({ ...values, [key]: event.target.value })} />
      ))}
      <p className="ps-credential-note">Credentials require a backend integration and are discarded when you close this dialog.</p>
    </SettingsDialog>
  );
}
