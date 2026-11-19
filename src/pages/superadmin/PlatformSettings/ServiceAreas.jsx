import { useState } from "react";
import { Ellipsis } from "lucide-react";
import { Card, Field, Sections, SettingsDialog } from "./shared";
import { usePreference } from "./usePreference";

const sections = [
  { id: "states", label: "States", item: "state", columns: ["State", "Cities", "Status"] },
  { id: "cities", label: "Cities", item: "city", columns: ["City", "State", "Zones", "Status"] },
  { id: "zones", label: "Zones", item: "zone", columns: ["Zone", "City", "Delivery radius", "Status"] },
];
const defaults = {
  states: [{ id: "edo", name: "Edo", active: true }],
  cities: [{ id: "benin", name: "Benin City", stateId: "edo", active: true }],
  zones: [{ id: "ring", name: "Ring Road", cityId: "benin", radius: "8", active: true }],
};

export default function ServiceAreas() {
  const [areas, save] = usePreference("areas", defaults);
  return (
    <Sections label="Service areas" sections={sections}>
      {(section) => <AreaTable section={section} areas={areas} save={save} />}
    </Sections>
  );
}

function AreaTable({ section, areas, save }) {
  const { id, item, label, columns } = section;
  const [editor, setEditor] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [menu, setMenu] = useState(null);
  const entries = areas[id];
  const cityFor = (entry) => areas.cities.find((city) => city.id === entry.cityId);
  const stateName = (stateId) => areas.states.find((state) => state.id === stateId)?.name;
  const replace = (next) => save({ ...areas, [id]: next });
  const update = (entry) => replace(entries.map((row) => row.id === entry.id ? entry : row));
  const hasChildren = deleting && (
    (id === "states" && areas.cities.some((city) => city.stateId === deleting.id)) ||
    (id === "cities" && areas.zones.some((zone) => zone.cityId === deleting.id))
  );

  function cells(entry) {
    if (id === "states") return [areas.cities.filter((city) => city.stateId === entry.id).length];
    if (id === "cities") return [stateName(entry.stateId), areas.zones.filter((zone) => zone.cityId === entry.id).length];
    return [cityFor(entry)?.name, `${entry.radius} km`];
  }

  return (
    <Card title={label} description={id === "states" ? "The states where customers can place orders." : undefined}
      action={<button className="ps-button ps-primary" onClick={() => setEditor({})}>+ Add {item}</button>}>
      <div className="ps-scroll ps-area-scroll">
        <table className="ps-table ps-area-table">
          <thead><tr>{columns.map((column) => <th key={column} scope="col">{column}</th>)}<th scope="col"><span className="sr-only">Actions</span></th></tr></thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry.id}>
                <th scope="row">{entry.name}</th>
                {cells(entry).map((value, index) => <td key={columns[index + 1]}>{value}</td>)}
                <td><span className={`ps-badge ${entry.active ? "ps-good" : ""}`}>{entry.active ? "Active" : "Inactive"}</span></td>
                <td className="ps-menu-cell">
                  <div className="ps-row-menu" onBlur={(event) => {
                    if (!event.currentTarget.contains(event.relatedTarget)) setMenu(null);
                  }} onKeyDown={(event) => {
                    if (event.key === "Escape") {
                      event.currentTarget.querySelector("button").focus();
                      setMenu(null);
                    }
                  }}>
                    <button type="button" className="ps-ellipsis" aria-label={`Actions for ${entry.name}`}
                      aria-expanded={menu === entry.id} onClick={() => setMenu(menu === entry.id ? null : entry.id)}>
                      <Ellipsis size={16} />
                    </button>
                    {menu === entry.id && (
                      <div className="ps-menu">
                        <button onClick={() => { update({ ...entry, active: !entry.active }); setMenu(null); }}>{entry.active ? "Turn off" : "Turn on"}</button>
                        <button onClick={() => { setEditor(entry); setMenu(null); }}>Edit</button>
                        <button className="ps-danger" onClick={() => { setDeleting(entry); setMenu(null); }}>Delete</button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {!entries.length && <tr><td colSpan={columns.length + 1}>No {label.toLowerCase()} added yet.</td></tr>}
          </tbody>
        </table>
      </div>
      {editor && <AreaEditor item={item} areas={areas} entry={editor}
        onClose={() => setEditor(null)} onSave={(entry) => {
          if (editor.id) update(entry);
          else replace([...entries, { ...entry, id: crypto.randomUUID(), active: true }]);
          setEditor(null);
        }} />}
      {deleting && (
        <SettingsDialog title={`Delete ${item}`} onClose={() => setDeleting(null)}
          submitLabel={hasChildren ? "OK" : "Delete"}
          onSubmit={(event) => {
            event.preventDefault();
            if (!hasChildren) replace(entries.filter((entry) => entry.id !== deleting.id));
            setDeleting(null);
          }}>
          <p>{hasChildren ? `Move or delete the associated ${id === "states" ? "cities" : "zones"} first.` : `Delete ${deleting.name} from service areas?`}</p>
        </SettingsDialog>
      )}
    </Card>
  );
}

function AreaEditor({ item, areas, entry, onClose, onSave }) {
  const [name, setName] = useState(entry.name ?? "");
  const [stateId, setStateId] = useState(entry.stateId ?? areas.cities.find(({ id }) => id === entry.cityId)?.stateId ?? "");
  const [cityId, setCityId] = useState(entry.cityId ?? "");
  const [radius, setRadius] = useState(entry.radius ?? "");
  const isZone = item === "zone";
  const isState = item === "state";
  const cities = areas.cities.filter((city) => !stateId || city.stateId === stateId);
  const title = `${entry.id ? "Edit" : "Add"} ${item}`;

  return (
    <SettingsDialog title={title} onClose={onClose} submitLabel={entry.id ? "Save changes" : title}
      onSubmit={(event) => {
        event.preventDefault();
        if (!name.trim()) return;
        if (isZone) onSave({ ...entry, name: name.trim(), cityId, radius });
        else if (isState) onSave({ ...entry, name: name.trim() });
        else onSave({ ...entry, name: name.trim(), stateId });
      }}>
      <Field label={`${item[0].toUpperCase()}${item.slice(1)} name`} value={name} onChange={(event) => setName(event.target.value)} autoFocus required pattern=".*\S.*" />
      {isZone && <Field label="City" options={cities} value={cityId} required onChange={(event) => {
        setCityId(event.target.value);
        const city = areas.cities.find(({ id }) => id === event.target.value);
        if (city) setStateId(city.stateId);
      }} />}
      {!isState && <Field label="State" options={areas.states} value={stateId} required onChange={(event) => {
        setStateId(event.target.value);
        if (areas.cities.find(({ id }) => id === cityId)?.stateId !== event.target.value) setCityId("");
      }} />}
      {isZone && <Field label="Delivery radius (km)" value={radius} type="number" min="0.01" step="any" required
        onChange={(event) => setRadius(event.target.value)} />}
    </SettingsDialog>
  );
}
