import Switch from "../../../components/Ui/Switch";
import { Card, Choice, Field } from "./shared";
import { usePreference } from "./usePreference";

const contactTypes = ["Email", "Phone", "WhatsApp"];
const companyFields = [
  ["legalName", "Company legal name"], ["rc", "RC number", "The Corporate Affairs Commission number."],
  ["tin", "Tax ID (TIN)", "Optional."], ["website", "Website"], ["address", "Company address"],
  ["city", "City"], ["state", "State"],
];
const generalDefaults = {
  name: "Zummey", hours: "Mon to Fri, 9 am to 5 pm",
  legalName: "Zummey Logistics Limited", rc: "RC 1860021", tin: "31842907-0001",
  website: "https://zummey.com", address: "Edo Innovation Hub", city: "Benin", state: "Edo",
  contacts: [
    { id: "support", label: "General support", type: "Email", value: "support@zummey.com" },
    { id: "line", label: "Support line", type: "Phone", value: "0809 112 4408" },
    { id: "whatsapp", label: "WhatsApp support", type: "WhatsApp", value: "0817 330 5521" },
  ],
};

export function General() {
  const [settings, save] = usePreference("general", generalDefaults);
  const set = (key, value) => save({ ...settings, [key]: value });
  const field = (key, label, hint) => <Field key={key} label={label} hint={hint} value={settings[key]}
    onChange={(event) => set(key, event.target.value)} />;

  function updateContact(id, key, value) {
    set("contacts", settings.contacts.map((contact) => contact.id === id ? { ...contact, [key]: value } : contact));
  }

  return (
    <div className="ps-stack">
      <Card title="Platform"><div className="ps-half">{field("name", "Platform name")}</div></Card>
      <Card title="Support contacts" description="Shown to customers and riders in the app and in emails."
        action={<button className="ps-button ps-primary" onClick={() => set("contacts", [
          ...settings.contacts, { id: crypto.randomUUID(), label: "", type: "Email", value: "" },
        ])}>+ Add contact</button>}>
        <div className="ps-contacts">
          {settings.contacts.map(({ id, label, type, value }) => (
            <div key={id} className="ps-contact">
              <Field label="Label" value={label} onChange={(event) => updateContact(id, "label", event.target.value)} />
              <div className="ps-field">
                <span>Type</span>
                <Choice label="Contact type" options={contactTypes} value={type} segmented
                  onChange={(choice) => updateContact(id, "type", choice)} />
              </div>
              <Field label={type === "Email" ? "Email address" : "Phone number"}
                type={type === "Email" ? "email" : "tel"} value={value}
                onChange={(event) => updateContact(id, "value", event.target.value)} />
              <button className="ps-danger" onClick={() => set("contacts", settings.contacts.filter((contact) => contact.id !== id))}>Remove</button>
            </div>
          ))}
        </div>
        <div className="ps-half">{field("hours", "Support hours")}</div>
      </Card>
      <Card title="Company information" description="Used on invoices, receipts and legal pages.">
        <div className="ps-grid">{companyFields.map(([key, label, hint]) => field(key, label, hint))}</div>
      </Card>
    </div>
  );
}

const channels = ["Email", "SMS", "WhatsApp", "Push"];
const messages = [
  ["Order placed", "Customers", [true, true, false, true]],
  ["Rider assigned", "Customers", [false, false, false, true]],
  ["Out for delivery", "Customers", [false, true, false, true]],
  ["Delivered", "Customers", [true, true, false, true]],
  ["Delivery delayed", "Customers", [false, true, false, true]],
  ["Refund processed", "Customers", [true, false, false, true]],
  ["Promotions", "Customers", [true, false, false, true]],
  ["New delivery request", "Riders", [false, true, false, true]],
  ["Payout sent", "Riders", [true, true, false, true]],
  ["New incident opened", "Admins", [true, false, false, true]],
];

export function Notifications() {
  const [settings, save] = usePreference("notifications", {
    enabled: [true, true, false, true], rules: messages.map((message) => message[2]),
  });
  const change = (values, index, next) => values.map((value, i) => i === index ? next : value);

  return (
    <Card title="Who gets which message, and how">
      <div className="ps-scroll ps-matrix">
        <table className="ps-table">
          <thead>
            <tr>
              <th scope="col">Message</th>
              {channels.map((channel, col) => (
                <th scope="col" key={channel}>
                  <div>{channel}</div>
                  <Switch color="green" ariaLabel={`Enable ${channel}`} checked={settings.enabled[col]}
                    onChange={(next) => save({ ...settings, enabled: change(settings.enabled, col, next) })} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {messages.map(([message, audience], row) => (
              <tr key={message}>
                <th scope="row"><div>{message}<span className={`ps-badge ps-${audience.toLowerCase()}`}>{audience}</span></div></th>
                {channels.map((channel, col) => (
                  <td key={channel}>
                    <Switch color="green" ariaLabel={`${message} via ${channel}`} checked={settings.rules[row][col]}
                      disabled={!settings.enabled[col]} onChange={(next) => save({
                        ...settings, rules: change(settings.rules, row, change(settings.rules[row], col, next)),
                      })} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

const securityDefaults = {
  length: 10, capital: true, lower: true, number: true, symbol: false,
  expiry: "90 days", attempts: "5 attempts", lockTime: "15 minutes",
  requireMfa: true, requireSuperMfa: false, methods: ["Email code"],
  timeout: "30 minutes", warn: true, browser: false,
};

export function Security() {
  const [settings, save] = usePreference("security", securityDefaults);
  const set = (key, value) => save({ ...settings, [key]: value });
  const toggle = (key, label, detail) => (
    <div className="ps-security-row">
      <div>{label}{detail && <small>{detail}</small>}</div>
      <Switch color="green" ariaLabel={label} checked={settings[key]} onChange={(next) => set(key, next)} />
    </div>
  );
  const choices = (key, label, options, detail) => (
    <div className="ps-security-choice">
      <div>{label}{detail && <small>{detail}</small>}</div>
      <Choice label={label} options={options} value={settings[key]} multiple={key === "methods"}
        onChange={(choice) => {
          if (key !== "methods") set(key, choice);
          else if (!settings.methods.includes(choice)) set(key, [...settings.methods, choice]);
          else if (settings.methods.length > 1) set(key, settings.methods.filter((method) => method !== choice));
        }} />
    </div>
  );

  return (
    <div className="ps-stack ps-security">
      <Card title="Password policy" description="Rules every admin must follow when they set a password.">
        <div className="ps-security-row">
          <div>Minimum length<small>From 8 to 32 characters.</small></div>
          <div className="ps-actions">
            <button className="ps-button" aria-label="Decrease minimum length" disabled={settings.length <= 8} onClick={() => set("length", settings.length - 1)}>−</button>
            <span>{settings.length} characters</span>
            <button className="ps-button" aria-label="Increase minimum length" disabled={settings.length >= 32} onClick={() => set("length", settings.length + 1)}>+</button>
          </div>
        </div>
        {toggle("capital", "Require a capital letter", "At least one A to Z.")}
        {toggle("lower", "Require a small letter", "At least one a to z.")}
        {toggle("number", "Require a number", "At least one number from 0 to 9.")}
        {toggle("symbol", "Require a symbol", "At least one symbol, like ! or @.")}
        <div className="ps-grid">
          <div>
            {choices("expiry", "Change password every", ["Never", "30 days", "60 days", "90 days"], "How often admins must choose a new password.")}
            {choices("attempts", "Lock the account after", ["3 attempts", "5 attempts", "10 attempts"], "Consecutive wrong password attempts.")}
          </div>
          {choices("lockTime", "Keep it locked for", ["5 minutes", "15 minutes", "30 minutes", "1 hour"], "Admins can try again after this time.")}
        </div>
      </Card>
      <Card title="Multi-factor authentication (MFA)" description="A second proof, like a code, after the password.">
        {toggle("requireMfa", "Require MFA for all admins", "Every admin must confirm with a second step each time they sign in.")}
        {toggle("requireSuperMfa", "Always require MFA for Super Admins", "Applies to admins who can change prices and manage admins.")}
        {choices("methods", "Allowed ways to confirm", ["SMS code", "Email code"], "Admins choose from these when they set up MFA.")}
      </Card>
      <Card title="Session timeout" description="How long an admin can stay signed in without doing anything.">
        {choices("timeout", "Sign out after being inactive for", ["15 minutes", "30 minutes", "1 hour", "4 hours", "8 hours"], "The timer resets when the admin clicks or types.")}
        {toggle("warn", "Warn one minute before signing out")}
        {toggle("browser", "Sign out when the browser is closed")}
      </Card>
    </div>
  );
}
