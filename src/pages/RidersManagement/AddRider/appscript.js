const CONFIG = [
  {
    name: "TEST",
    folderId: "1AuOTFNFfx_Um3ZpC51m6UYGg5IsGTUeP",
    sheetId:  "1RLF3mze1D-ACe3g7n0nDwv0YGpjHH1fLht4PantYyDY",
    sheetTab: "Tests"
  }
];

// Exact label for incomplete notes
const MISSING_LABEL = "Missing/ Incomplete Notes";
const VALIDATION_SHEET_ID = "1RLF3mze1D-ACe3g7n0nDwv0YGpjHH1fLht4PantYyDY";

const CPT_MASTER_TAB  = "CPT Validation Table";
const LYTEC_CODES_TAB = "Lytec Billing Validation";

const COLS = [
  "Report Run Date", // A
  "Run Attempt", // B
  "AppointmentKey", // C
  "Provider Name", // D
  "Patient Name", // E
  "Date of Session", // F
  "Patient Initials", // G
  "Patient State", // H
  "TimeCard CPT Format", // I
  "TimeCard Appt Type", // J
  "Missing Notes Audit Status", // K
  "Missing Notes URL", // L
  "Provider No-Show Attestation*", // M
  "No Show/Late Cancellation Action", // N
  "Patient Name (Dup)", // O
  "DOB", // P
  "CPT Code (1)", // Q
  "CPT Code (2)", // R
  "ICD-10 Codes", // S
  "Appt Type", // T
  "Start Time", // U
  "Therapy Time", // V
  "Duration", // W
  "Final Row Flag", // X
  "Insurance", // Y
  "Auto Where to Bill", // AA
  "Billed?", // AB
  "DNS Reason", // AC
  "Note Link", // AD
  "Note", // AE
];

const META_ROW_1 = (function () {
  const a = new Array(COLS.length).fill("");
  a[0] = "FREEZE THESE COLUMNS";
  a[5] = "COLUMN GROUPING 1";
  a[14] = "COLUMN GROUPING 2";
  a[23] = "COLUMN GROUPING 3";
  return a;
})();

const META_ROW_2 = (function () {
  const a = new Array(COLS.length).fill("");
  a[0] = "APPOINTMENT DETAILS";
  a[9] = "TIMECARD - COPY/PASTE INTO J-K";
  a[23] = "BILLING INPUTS";
  a[27] = "BILLING STATUS & SUBMISSION";
  return a;
})();

const COL_INDEX = (function () {
  const idx = {};
  COLS.forEach(function (name, i) {
    idx[name] = i + 1;
  });
  return idx;
})();

const FIRST_DATA_ROW = 3;

const KNOWN_CPTS = new Set([
  "90791","90792","90832","90834","90837","90838",
  "99201","99202","99203","99204","99205",
  "99211","99212","99213","99214","99215",
]);

let _LYTEC_RULES_CACHE = null;

function getLytecRules_() {
  if (_LYTEC_RULES_CACHE) return _LYTEC_RULES_CACHE;
  const ss = SpreadsheetApp.openById(VALIDATION_SHEET_ID);
  const sh = ss.getSheetByName(LYTEC_CODES_TAB);
  if (!sh) throw new Error("Missing tab: " + LYTEC_CODES_TAB + " in validation sheet.");
  const values = sh.getDataRange().getValues();
  const rules = {};
  for (let i = 1; i < values.length; i++) {
    const insurance = normalizeInsuranceKey_(values[i][0]);
    const apptType = normalizeApptTypeKey_(values[i][1]);
    const cptRaw = String(values[i][2] || "").trim();
    if (!insurance || !apptType || !cptRaw) continue;
    const cpt = cptRaw.replace(/\s+/g, "");
    const key = insurance + "|" + apptType;
    if (!rules[key]) rules[key] = new Set();
    rules[key].add(cpt);
  }
  _LYTEC_RULES_CACHE = rules;
  return rules;
}

let _CPT_VALIDATION_CACHE = null;

function getCptValidationMap_() {
  if (_CPT_VALIDATION_CACHE) return _CPT_VALIDATION_CACHE;
  const ss = SpreadsheetApp.openById(VALIDATION_SHEET_ID);
  const sh = ss.getSheetByName(CPT_MASTER_TAB);
  if (!sh) throw new Error("Missing tab: " + CPT_MASTER_TAB + " in validation sheet.");
  const values = sh.getDataRange().getValues();
  const map = {};
  for (let i = 1; i < values.length; i++) {
    const cptRaw = String(values[i][0] || "").trim();
    const apptRaw = String(values[i][3] || "").trim();
    const minRaw = values[i][4];
    if (!cptRaw || !apptRaw) continue;
    const key = normalizeCptKeyFromTable_(cptRaw);
    const apptType = apptRaw.toLowerCase();
    let minTherapy = null;
    const n = parseInt(String(minRaw || "").replace(/[^\d]/g, ""), 10);
    if (isFinite(n)) minTherapy = n;
    map[key] = { apptType, minTherapy };
  }
  _CPT_VALIDATION_CACHE = map;
  return map;
}

function normalizeCptKeyFromTable_(cptRaw) {
  return String(cptRaw || "").replace(/\s+/g, "").toUpperCase();
}

function normalizeCptKeyFromNote_(cptStr) {
  const codes = (cptStr || "").split(",").map((s) => String(s || "").trim()).filter(Boolean);
  if (!codes.length) return "";
  const ordered = orderCptCodes_(codes).map((s) => s.toUpperCase());
  return ordered.join("+");
}

function therapyRangeOk_(therapyMin, minTherapy) {
  if (minTherapy == null) return true;
  if (therapyMin == null) return false;
  if (minTherapy === 16) return therapyMin >= 16 && therapyMin <= 37;
  if (minTherapy === 38) return therapyMin >= 38 && therapyMin <= 52;
  if (minTherapy === 53) return therapyMin >= 53;
  return therapyMin >= minTherapy;
}

const SUPPORTED_MIME = new Set([
  "application/pdf","image/png","image/jpeg","image/jpg","image/webp",
]);

/* ---------------- UI ---------------- */
function onOpen() {
  try {
    const ui = SpreadsheetApp.getUi();
    const menu = ui.createMenu("Session Report");
    const cfg = getActiveConfigOrNull_();
    const isProd = cfg && String(cfg.name || "").toUpperCase() === "PROD";
    menu
      .addItem("Process New Files (This Sheet Only)", "processOnlyNew_ThisBiller")
      .addItem("Process ALL Files (This Sheet Only)", "processAllFiles_ThisBiller")
      .addSeparator()
      .addItem("Fix Invalid Red Marks (This Sheet Only)", "fixInvalidRedMarks_ThisBiller")
      .addItem("Recompute AUTO Where to Bill (Blank cells only) — This Sheet", "recomputeWhereToBill_Blanks_ThisBiller")
      .addItem("Recompute AUTO Where to Bill (Overwrite ALL rows) — This Sheet", "recomputeAutoWhereToBill_AllRows_ThisBiller")
      .addItem("DIAGNOSE (This Sheet)", "diagnose_")
      .addItem("Self Test (compiles only)", "selfTest_");
    if (isProd) {
      menu
        .addSeparator()
        .addItem("RESET processed state (this sheet only)", "resetProcessed_ThisBiller")
        .addItem("REPROCESS NEW state (this sheet only)", "reprocessNewState_ThisBiller")
        .addSeparator()
        .addItem("Process New Files (ALL billers)", "processOnlyNew_AllBillers")
        .addItem("Fix Invalid Red Marks (ALL billers)", "fixInvalidRedMarks_AllBillers")
        .addItem("Recompute AUTO Where to Bill (Blank cells only) — ALL billers", "recomputeWhereToBill_Blanks_AllBillers");
    }
    menu.addToUi();
  } catch (e) {
    Logger.log("onOpen failed: " + (e && e.stack ? e.stack : e));
    SpreadsheetApp.getActive().toast("❌ onOpen failed (check Apps Script logs)", "Session Report", 8);
  }
}

function getActiveConfigOrNull_() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sh = ss.getActiveSheet();
    const ssId = ss.getId();
    const tab = sh.getName();
    return CONFIG.find(function (c) { return c.sheetId === ssId && c.sheetTab === tab; }) || null;
  } catch (e) { return null; }
}

function assertProdOnly_() {
  const cfg = getActiveConfig_();
  const isProd = String(cfg.name || "").toUpperCase() === "PROD";
  if (!isProd) throw new Error("This action is PROD-only.");
  return cfg;
}

function selfTest_() {
  SpreadsheetApp.getActive().toast("Self-test OK: script compiled.");
}

function onEdit(e) {
  try {
    if (!e || !e.range) return;
    const sh = e.range.getSheet();
    const sheetName = sh.getName();
    const ssId = SpreadsheetApp.getActiveSpreadsheet().getId();
    const allowed = CONFIG.some((cfg) => cfg.sheetId === ssId && cfg.sheetTab === sheetName);
    if (!allowed) return;
    const r = e.range.getRow();
    if (r < FIRST_DATA_ROW) return;
    const c = e.range.getColumn();
    const apptCol = COL_INDEX["Appt Type"];
    const insCol = COL_INDEX["Insurance"];
    const tcCol = COL_INDEX["TimeCard CPT Format"];
    const cpt1Col = COL_INDEX["CPT Code (1)"];
    const cpt2Col = COL_INDEX["CPT Code (2)"];
    const autoCol = COL_INDEX["Auto Where to Bill"];
    const noteCol = COL_INDEX["Note"];
    const isTrigger = c === apptCol || c === insCol || c === cpt1Col || c === cpt2Col;
    if (!isTrigger) return;
    const appt = String(sh.getRange(r, apptCol).getValue() || "").trim();
    const ins = String(sh.getRange(r, insCol).getValue() || "").trim();
    const cpt1 = String(sh.getRange(r, cpt1Col).getValue() || "").trim();
    const cpt2 = String(sh.getRange(r, cpt2Col).getValue() || "").trim();
    const rebuiltTc = buildTimecardFromCptCols_(cpt1, cpt2);
    sh.getRange(r, tcCol).setValue(rebuiltTc || "");
    const tcFinal = String(sh.getRange(r, tcCol).getValue() || "").trim();
    const auto = routeWhereToBill_(ins, appt, tcFinal);
    sh.getRange(r, autoCol).setValue(auto);
    const looksBillable = tcFinal && tcFinal !== MISSING_LABEL && tcFinal !== "No Show" && tcFinal !== "Late Cancel" && tcFinal !== "Cancel" && tcFinal !== "No Note";
    if (looksBillable && !normalizeInsuranceKey_(ins)) {
      const curNote = String(sh.getRange(r, noteCol).getValue() || "");
      if (!curNote.includes("⚠️ Select Insurance")) {
        sh.getRange(r, noteCol).setValue((curNote ? curNote + " | " : "") + "⚠️ Select Insurance to route billing");
      }
    }
  } catch (err) {
    Logger.log("onEdit error: " + (err && err.stack ? err.stack : err));
  }
}

function isManualOverride_(manualWtb, autoWtb) {
  const m = String(manualWtb || "").trim();
  const a = String(autoWtb || "").trim();
  if (!m) return false;
  if (!a) return true;
  return m !== a;
}

function buildTimecardFromCptCols_(cpt1, cpt2) {
  const a = String(cpt1 || "").trim().replace(/\s+/g, "");
  const b = String(cpt2 || "").trim().replace(/\s+/g, "");
  const isCpt = function (x) { return /^[0-9]{5}$/.test(x); };
  const codes = [];
  if (isCpt(a)) codes.push(a);
  if (isCpt(b)) codes.push(b);
  if (!codes.length) return "";
  if (codes.length === 1) return codes[0];
  const ordered = orderCptCodes_(codes);
  return ordered.join("+");
}

function diagnose_() {
  const cfg = getActiveConfigOrNull_();
  Logger.log("Active cfg: " + JSON.stringify(cfg));
  if (!cfg) {
    SpreadsheetApp.getActive().toast("❌ Active sheet/tab not found in CONFIG. Check sheetId + sheetTab.");
    return;
  }
  try {
    const files = listFilesInFolderModifiedAfter_(cfg.folderId, "");
    const byMime = {};
    files.forEach((f) => { byMime[f.mimeType] = (byMime[f.mimeType] || 0) + 1; });
    SpreadsheetApp.getActive().toast("✅ Folder read OK: " + files.length + " file(s) in " + cfg.name + " | Mimes: " + Object.keys(byMime).map((k) => k + "=" + byMime[k]).join(", "));
    Logger.log("DIAGNOSE mime breakdown: " + JSON.stringify(byMime));
    Logger.log("DIAGNOSE sample files: " + JSON.stringify(files.slice(0, 20)));
  } catch (e) {
    SpreadsheetApp.getActive().toast("❌ Folder read FAILED (Drive API / perms): " + (e.message || e));
    Logger.log(e && e.stack ? e.stack : e);
    return;
  }
  try {
    const subfolders = Drive.Files.list({
      q: "'" + cfg.folderId + "' in parents and trashed = false and mimeType = 'application/vnd.google-apps.folder'",
      fields: "items(id,title)", maxResults: 50, supportsAllDrives: true, includeItemsFromAllDrives: true,
    }).items || [];
    if (subfolders.length) {
      SpreadsheetApp.getActive().toast("⚠️ " + subfolders.length + " subfolder(s) found. Files inside subfolders are NOT scanned.");
    }
  } catch (e) { Logger.log("Subfolder check failed: " + (e && e.message ? e.message : e)); }
  try {
    SpreadsheetApp.openById(VALIDATION_SHEET_ID).getSheets();
    SpreadsheetApp.getActive().toast("✅ Validation sheet access OK");
  } catch (e) {
    SpreadsheetApp.getActive().toast("❌ Validation sheet access FAILED: " + (e.message || e));
  }
}

function routeWhereToBill_(insuranceRaw, apptTypeRaw, timecardCptFormatRaw) {
  const insKey = normalizeInsuranceKey_(String(insuranceRaw || "").trim());
  const apptKey = normalizeApptTypeKey_(String(apptTypeRaw || "").trim());
  const tcRaw = String(timecardCptFormatRaw || "").trim();
  const tcUp = tcRaw.toUpperCase();
  const tcClean = tcUp.replace(/\s+/g, "");
  const missingNorm = String(MISSING_LABEL || "").toUpperCase().replace(/\s+/g, "");
  if (!insKey) return "";
  if (insKey === "self pay") return "Self Pay";
  if (insKey === "grand total") return "";
  const apptKeyUp = String(apptTypeRaw || "").trim().toUpperCase().replace(/\s+/g, "");
  const NON_BILLABLE_APPT = new Set(["CANCEL","CANCELLED","LATECANCEL","NOSHOW","NONOTE"]);
  if (NON_BILLABLE_APPT.has(apptKeyUp)) return "";
  const NON_BILLABLE_TIMECARD = new Set(["NOSHOW","LATECANCEL","CANCEL","CANCELLED","NONOTE"]);
  if (!tcClean) return "";
  if (tcClean === missingNorm) return "";
  if (NON_BILLABLE_TIMECARD.has(tcClean)) return "";
  const rawKeep = tcUp.replace(/[^0-9,+]/g, "");
  const parts = rawKeep.split(/[,+]/g).map((s) => s.trim()).filter((s) => /^[0-9]{5}$/.test(s));
  if (!parts.length) return "";
  const ordered = orderCptCodes_(parts);
  const tcKey = ordered.join("+");
  const ALWAYS_LYTEC = new Set(["compsych","tricare","multiplan","comstack"]);
  if (ALWAYS_LYTEC.has(insKey)) {
    return apptKey === "intake" ? "Lytec (Intake Only)" : "Lytec (Follow-ups Only)";
  }
  const rules = getLytecRules_();
  const lookupKey = insKey + "|" + apptKey;
  const allowedSet = rules[lookupKey];
  if (allowedSet && allowedSet.has(tcKey)) {
    return apptKey === "intake" ? "Lytec (Intake Only)" : "Lytec (Follow-ups Only)";
  }
  return "Headway";
}

function getActiveConfig_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getActiveSheet();
  const ssId = ss.getId();
  const tab = sh.getName();
  const cfg = CONFIG.find(function (c) { return c.sheetId === ssId && c.sheetTab === tab; });
  if (!cfg) throw new Error("This active sheet is not in CONFIG.\n\nActive sheetId=" + ssId + "\nActive tab=" + tab);
  return cfg;
}

function processOnlyNew_ThisBiller() {
  try {
    SpreadsheetApp.getActive().toast("Running: Process New Files (This Sheet Only)...");
    const cfg = getActiveConfig_();
    runForConfig_(cfg, true);
  } catch (e) {
    SpreadsheetApp.getActive().toast("❌ Run failed: " + (e.message || e), "Session Report", 10);
    throw e;
  }
}

function processAllFiles_ThisBiller() {
  try {
    SpreadsheetApp.getActive().toast("Running: Process ALL Files (This Sheet Only)...", "Session Report", 6);
    const cfg = getActiveConfig_();
    runForConfig_(cfg, false);
  } catch (e) {
    SpreadsheetApp.getActive().toast("❌ Run failed: " + (e.message || e), "Session Report", 10);
    throw e;
  }
}

function fixInvalidRedMarks_ThisBiller() {
  const cfg = getActiveConfig_();
  const sheet = SpreadsheetApp.openById(cfg.sheetId).getSheetByName(cfg.sheetTab);
  ensureHeaderAndColumnO_(sheet);
  ensureInsuranceAndBilledValidation_(sheet);
  SpreadsheetApp.getActive().toast("Fixed validations for: " + cfg.name);
}

function recomputeWhereToBill_Blanks_ThisBiller() {
  const cfg = getActiveConfig_();
  const sheet = SpreadsheetApp.openById(cfg.sheetId).getSheetByName(cfg.sheetTab);
  const last = sheet.getLastRow();
  if (last < FIRST_DATA_ROW) return;
  const insCol = COL_INDEX["Insurance"];
  const apptCol = COL_INDEX["Appt Type"];
  const tcCol = COL_INDEX["TimeCard CPT Format"];
  const wtbCol = COL_INDEX["Auto Where to Bill"];
  const startRow = FIRST_DATA_ROW;
  const numRows = last - startRow + 1;
  const insVals = sheet.getRange(startRow, insCol, numRows, 1).getValues();
  const apptVals = sheet.getRange(startRow, apptCol, numRows, 1).getValues();
  const tcVals = sheet.getRange(startRow, tcCol, numRows, 1).getValues();
  const wtbRange = sheet.getRange(startRow, wtbCol, numRows, 1);
  const wtbVals = wtbRange.getValues();
  for (let i = 0; i < numRows; i++) {
    const cur = String(wtbVals[i][0] || "").trim();
    if (!cur) {
      wtbVals[i][0] = routeWhereToBill_(String(insVals[i][0] || ""), String(apptVals[i][0] || ""), String(tcVals[i][0] || ""));
    }
  }
  wtbRange.setValues(wtbVals);
  SpreadsheetApp.getActive().toast("Recomputed AUTO Where to Bill (blank cells only) for: " + cfg.name);
}

function processAll_AllBillers() {
  CONFIG.forEach(function (cfg) { runForConfig_(cfg, false); });
}

function processOnlyNew_AllBillers() {
  const failures = [];
  CONFIG.forEach(function (cfg) {
    try { runForConfig_(cfg, true); }
    catch (e) {
      failures.push(cfg.name + ": " + (e && e.message ? e.message : e));
      Logger.log("FAILED [" + cfg.name + "]: " + (e && e.stack ? e.stack : e));
    }
  });
  if (failures.length) SpreadsheetApp.getActive().toast("Some billers failed:\n" + failures.join("\n"), "Session Report", 10);
}

function runForConfig_(cfg, onlyNew) {
  const sheet = SpreadsheetApp.openById(cfg.sheetId).getSheetByName(cfg.sheetTab);
  if (!sheet) throw new Error("Sheet tab not found: " + cfg.sheetTab);
  ensureHeaderAndColumnO_(sheet);
  ensureInsuranceAndBilledValidation_(sheet);
  const keyIndex = buildKeyIndex_(sheet);
  const store = PropertiesService.getScriptProperties();
  const processedKey = "processed_" + cfg.name;
  const processed = JSON.parse(store.getProperty(processedKey) || "{}");
  const fileMetas = listFilesInFolderModifiedAfter_(cfg.folderId, "");
  const rows = [];
  const pendingFinalRowOff = [];
  const START_MS = Date.now();
  const MAX_MS = 5.5 * 60 * 1000;
  let scanned = 0, ocrDone = 0, added = 0, skipped = 0, errors = 0;
  for (let fi = 0; fi < fileMetas.length; fi++) {
    if (Date.now() - START_MS > MAX_MS) break;
    scanned++;
    const id = fileMetas[fi].id;
    const mime = fileMetas[fi].mimeType;
    const driveLink = "https://drive.google.com/file/d/" + id + "/view";
    if (!SUPPORTED_MIME.has(mime)) { skipped++; Logger.log("SKIP unsupported mime: " + mime + " fileId=" + id); continue; }
    if (onlyNew && processed[id] && processed[id].status === "ok") { skipped++; continue; }
    try {
      const ocr = ocrFileToText_(id);
      ocrDone++;
      const record = extractFields_(ocr.text);
      applyNoShowAndAuditRules_(ocr.text, record);
      record["Report Run Date"] = new Date();
      const split = splitCptIntoTwoForSheet_(record["CPT Code"]);
      const cpt1 = split.code1;
      const cpt2 = split.code2;
      if (split.extraCount > 0) {
        record["Missing Notes Audit Status"] = [record["Missing Notes Audit Status"], "⚠️ More than 2 CPT codes detected (" + (split.extraCount + 2) + ")"].filter(Boolean).join("; ");
        record["TimeCard CPT Format"] = MISSING_LABEL;
      }
      record["Insurance"] = record["Insurance"] || "";
      record["Billed?"] = record["Billed?"] || "";
      record["Note Link"] = driveLink;
      const timecardApptType = computeTimecardApptType_(record["Appt Type"], record["TimeCard CPT Format"]);
      const apptKey = buildAppointmentKey_(record["Date of Session"], record["Provider Name"], record["Patient Name"], record["Start Time"], id);
      let runAttempt = 1;
      if (apptKey && keyIndex[apptKey]) {
        runAttempt = (keyIndex[apptKey].maxRun || 0) + 1;
        if (keyIndex[apptKey].finalRow) pendingFinalRowOff.push(keyIndex[apptKey].finalRow);
      }
      if (apptKey) {
        if (!keyIndex[apptKey]) keyIndex[apptKey] = { maxRun: 0, finalRow: 0 };
        keyIndex[apptKey].maxRun = runAttempt;
      }
      const row = [
        record["Report Run Date"], runAttempt, apptKey,
        record["Provider Name"], record["Patient Name"], record["Date of Session"],
        record["Patient Initials"], record["Patient State"], record["TimeCard CPT Format"],
        timecardApptType, record["Missing Notes Audit Status"], "",
        record["Provider No-Show Attestation*"], record["No Show/Late Cancellation Action"],
        record["Patient Name"], record["Patient DOB"], cpt1, cpt2,
        record["ICD-10 Codes"], record["Appt Type"], record["Start Time"],
        record["Therapy Time"] || "", record["Duration"], true,
        record["Insurance"],
        routeWhereToBill_(record["Insurance"], record["Appt Type"], record["TimeCard CPT Format"]),
        record["Billed?"], record["DNS Reason"] || "", record["Note Link"] || "",
        record["Note"] || buildTrackingNote_(record, apptKey),
      ];
      rows.push(row);
      added++;
      processed[id] = { status: "ok", ts: Date.now() };
    } catch (e) {
      errors++;
      const fallback = new Array(COLS.length).fill("");
      fallback[0] = new Date();
      fallback[10] = "OCR/PARSE ERROR: " + (e.message || e);
      fallback[23] = true;
      fallback[COL_INDEX["Note Link"] - 1] = "https://drive.google.com/file/d/" + id + "/view";
      fallback[COL_INDEX["Note"] - 1] = "File ID: " + id;
      rows.push(fallback);
      processed[id] = { status: "error", ts: Date.now(), message: String((e && e.message) || e) };
    }
  }
  if (pendingFinalRowOff.length) {
    const finalCol = COL_INDEX["Final Row Flag"];
    const uniq = Array.from(new Set(pendingFinalRowOff.filter(Boolean)));
    uniq.forEach(function (rn) { sheet.getRange(rn, finalCol).setValue(false); });
  }
  if (rows.length) {
    const lastRow = sheet.getLastRow();
    const headerLastRow = FIRST_DATA_ROW - 1;
    const lastDataOrHeaderRow = Math.max(headerLastRow, lastRow);
    const startRow = lastDataOrHeaderRow + 1;
    sheet.insertRowsAfter(lastDataOrHeaderRow, rows.length);
    sheet.getRange(startRow, 1, rows.length, COLS.length).setValues(rows);
    const dataRange = sheet.getRange(startRow, 1, rows.length, COLS.length);
    dataRange.setFontWeight("normal");
    dataRange.setHorizontalAlignment("center");
    const keyCol = COL_INDEX["AppointmentKey"];
    const keysWritten = sheet.getRange(startRow, keyCol, rows.length, 1).getValues();
    for (let i = 0; i < rows.length; i++) {
      const k = String(keysWritten[i][0] || "").trim();
      if (!k) continue;
      if (!keyIndex[k]) keyIndex[k] = { maxRun: 0, finalRow: 0 };
      keyIndex[k].finalRow = startRow + i;
    }
    const last = sheet.getLastRow();
    const insCol = COL_INDEX["Insurance"];
    const apptCol = COL_INDEX["Appt Type"];
    const tcCol = COL_INDEX["TimeCard CPT Format"];
    const numRowsNew = last - startRow + 1;
    const insVals = sheet.getRange(startRow, insCol, numRowsNew, 1).getValues();
    const apptVals = sheet.getRange(startRow, apptCol, numRowsNew, 1).getValues();
    const tcVals = sheet.getRange(startRow, tcCol, numRowsNew, 1).getValues();
    const wtbRange = sheet.getRange(startRow, wtbCol, numRowsNew, 1);
    const wtbVals = wtbRange.getValues();
    for (let i = 0; i < numRowsNew; i++) {
      const cur = String(wtbVals[i][0] || "").trim();
      if (!cur) {
        wtbVals[i][0] = routeWhereToBill_(String(insVals[i][0] || ""), String(apptVals[i][0] || ""), String(tcVals[i][0] || ""));
      }
    }
    wtbRange.setValues(wtbVals);
    const dateCol = COL_INDEX["Date of Session"];
    const timeCol = COL_INDEX["Start Time"];
    const provCol = COL_INDEX["Provider Name"];
    if (last >= FIRST_DATA_ROW) {
      sheet.getRange(FIRST_DATA_ROW, 1, last - FIRST_DATA_ROW + 1, COLS.length).sort([
        { column: dateCol, ascending: true },
        { column: timeCol, ascending: true },
        { column: provCol, ascending: true },
      ]);
    }
    recomputeRunAttemptAndFinalFlags_(sheet);
    ensureInsuranceAndBilledValidation_(sheet);
  }
  store.setProperty(processedKey, JSON.stringify(processed));
  SpreadsheetApp.getActive().toast("[" + cfg.name + "] scanned=" + scanned + " ocr=" + ocrDone + " added=" + rows.length + " skipped=" + skipped + " errors=" + errors);
}

function ensureHeaderAndColumnO_(sheet) {
  const maxCols = COLS.length;
  try { const f = sheet.getFilter(); if (f) f.remove(); } catch (e) {}
  sheet.getRange(1, 1, 2, maxCols).breakApart();
  sheet.getRange(1, 1, 2, maxCols).clearDataValidations();
  sheet.getRange(1, 1, 2, COLS.length).clearContent();
  sheet.getRange(3, COL_INDEX["Date of Session"], sheet.getMaxRows() - 2, 1).setNumberFormat("MM/dd/yyyy");
  sheet.getRange(3, COL_INDEX["Start Time"], sheet.getMaxRows() - 2, 1).setNumberFormat("h:mm am/pm");
  sheet.getRange(3, COL_INDEX["CPT Code (1)"], sheet.getMaxRows() - 2, 1).setNumberFormat("@");
  sheet.getRange(3, COL_INDEX["CPT Code (2)"], sheet.getMaxRows() - 2, 1).setNumberFormat("@");
  sheet.getRange(3, COL_INDEX["TimeCard CPT Format"], sheet.getMaxRows() - 2, 1).setNumberFormat("@");
  const row1 = new Array(COLS.length).fill("");
  row1[0] = "APPOINTMENT DETAILS";
  row1[9] = "TIMECARD - COPY/PASTE INTO J-K";
  row1[23] = "BILLING INPUTS";
  row1[27] = "BILLING STATUS & SUBMISSION";
  sheet.getRange(1, 1, 1, COLS.length).setValues([row1]);
  sheet.getRange(2, 1, 1, COLS.length).setValues([COLS]);
  sheet.getRange(1, 1, 1, 5).merge();
  sheet.getRange(1, 10, 1, 2).merge();
  sheet.getRange(1, 24, 1, 4).merge();
  sheet.getRange(1, 28, 1, 4).merge();
  sheet.setFrozenRows(2);
  sheet.setFrozenColumns(5);
  sheet.getRange(1, 1, 1, COLS.length).setFontWeight("bold").setHorizontalAlignment("center");
  sheet.getRange(2, 1, 1, COLS.length).setFontWeight("bold").setHorizontalAlignment("center");
  const lastRow = sheet.getLastRow();
  try {
    const f = sheet.getFilter();
    if (!f && lastRow >= 2) {
      sheet.getRange(2, 1, Math.max(1, lastRow - 1), COLS.length).createFilter();
    }
  } catch (e) {}
  if (lastRow >= FIRST_DATA_ROW) {
    sheet.getRange(FIRST_DATA_ROW, 1, lastRow - FIRST_DATA_ROW + 1, COLS.length).setFontWeight("normal");
  }
  ensureColumnGroups_(sheet);
}

function ensureColumnGroups_(sheet) {
  const ss = sheet.getParent();
  const sheetId = sheet.getSheetId();
  const maxRows = sheet.getMaxRows();
  const maxCols = COLS.length;
  const all = sheet.getRange(1, 1, maxRows, maxCols);
  for (let i = 0; i < 12; i++) {
    try { all.shiftColumnGroupDepth(-1); } catch (e) { break; }
  }
  const requests = [
    { addDimensionGroup: { range: { sheetId, dimension: "COLUMNS", startIndex: 5, endIndex: 14 } } },
    { addDimensionGroup: { range: { sheetId, dimension: "COLUMNS", startIndex: 15, endIndex: 23 } } },
    { addDimensionGroup: { range: { sheetId, dimension: "COLUMNS", startIndex: 24, endIndex: 30 } } },
  ];
  try { Sheets.Spreadsheets.batchUpdate({ requests }, ss.getId()); } catch (e) {}
}

function ensureInsuranceAndBilledValidation_(sheet) {
  const firstDataRow = FIRST_DATA_ROW;
  const durationCol = COL_INDEX["Duration"];
  const insCol = COL_INDEX["Insurance"];
  const billedCol = COL_INDEX["Billed?"];
  const dnsCol = COL_INDEX["DNS Reason"];
  const lastRow = Math.max(sheet.getLastRow(), firstDataRow);
  const numRows = lastRow - firstDataRow + 1;
  if (numRows <= 0) return;
  sheet.getRange(firstDataRow, insCol, numRows, 1).clearDataValidations();
  sheet.getRange(firstDataRow, billedCol, numRows, 1).clearDataValidations();
  sheet.getRange(firstDataRow, dnsCol, numRows, 1).clearDataValidations();
  sheet.getRange(firstDataRow, durationCol, numRows, 1).clearDataValidations();
  const insRule = SpreadsheetApp.newDataValidation().requireValueInList(["Aetna","Anthem","Cigna","Optum","Point32","MultiPlan","Tricare","Compsych","Comstack","Self Pay","Other","Grand Total"], true).setAllowInvalid(true).build();
  sheet.getRange(firstDataRow, insCol, numRows, 1).setDataValidation(insRule);
  const billedRule = SpreadsheetApp.newDataValidation().requireValueInList(["HH Billed 1","LL Billed 2","OO Unbilled","SP Billed 3","WW — No billing req'd","DNS"], true).setAllowInvalid(true).build();
  sheet.getRange(firstDataRow, billedCol, numRows, 1).setDataValidation(billedRule);
  const dnsRule = SpreadsheetApp.newDataValidation().requireValueInList(["Missing Forms","Inactive Insurance","Unpaid Balances","CC Declined"], true).setAllowInvalid(true).build();
  sheet.getRange(firstDataRow, dnsCol, numRows, 1).setDataValidation(dnsRule);
  const durationRule = SpreadsheetApp.newDataValidation().requireValueInList(["5","10","15","20","30","40","45","50","60","75","90"], true).setAllowInvalid(true).build();
  sheet.getRange(firstDataRow, durationCol, numRows, 1).setDataValidation(durationRule);
}

function fixInvalidRedMarks_AllBillers() {
  CONFIG.forEach(function (cfg) {
    const sheet = SpreadsheetApp.openById(cfg.sheetId).getSheetByName(cfg.sheetTab);
    ensureHeaderAndColumnO_(sheet);
    ensureInsuranceAndBilledValidation_(sheet);
  });
  SpreadsheetApp.getActive().toast("Fixed validations for ALL billers.");
}

function recomputeWhereToBill_Blanks_AllBillers() {
  CONFIG.forEach(function (cfg) {
    const sheet = SpreadsheetApp.openById(cfg.sheetId).getSheetByName(cfg.sheetTab);
    const last = sheet.getLastRow();
    if (last < FIRST_DATA_ROW) return;
    const insCol = COL_INDEX["Insurance"];
    const apptCol = COL_INDEX["Appt Type"];
    const tcCol = COL_INDEX["TimeCard CPT Format"];
    const wtbCol = COL_INDEX["Auto Where to Bill"];
    const startRow = FIRST_DATA_ROW;
    const numRows = last - startRow + 1;
    const insVals = sheet.getRange(startRow, insCol, numRows, 1).getValues();
    const apptVals = sheet.getRange(startRow, apptCol, numRows, 1).getValues();
    const tcVals = sheet.getRange(startRow, tcCol, numRows, 1).getValues();
    const wtbRange = sheet.getRange(startRow, wtbCol, numRows, 1);
    const wtbVals = wtbRange.getValues();
    for (let i = 0; i < numRows; i++) {
      const cur = String(wtbVals[i][0] || "").trim();
      if (!cur) {
        wtbVals[i][0] = routeWhereToBill_(String(insVals[i][0] || ""), String(apptVals[i][0] || ""), String(tcVals[i][0] || ""));
      }
    }
    wtbRange.setValues(wtbVals);
  });
  SpreadsheetApp.getActive().toast("Recomputed AUTO Where to Bill (blank cells only) for ALL billers.");
}

function recomputeAutoWhereToBill_AllRows_ThisBiller() {
  const cfg = getActiveConfig_();
  const sheet = SpreadsheetApp.openById(cfg.sheetId).getSheetByName(cfg.sheetTab);
  const last = sheet.getLastRow();
  if (last < FIRST_DATA_ROW) return;
  const startRow = FIRST_DATA_ROW;
  const numRows = last - startRow + 1;
  const insCol = COL_INDEX["Insurance"];
  const apptCol = COL_INDEX["Appt Type"];
  const tcCol = COL_INDEX["TimeCard CPT Format"];
  const autoCol = COL_INDEX["Auto Where to Bill"];
  const insVals = sheet.getRange(startRow, insCol, numRows, 1).getValues();
  const apptVals = sheet.getRange(startRow, apptCol, numRows, 1).getValues();
  const tcVals = sheet.getRange(startRow, tcCol, numRows, 1).getValues();
  const out = [];
  for (let i = 0; i < numRows; i++) {
    out.push([routeWhereToBill_(String(insVals[i][0] || ""), String(apptVals[i][0] || ""), String(tcVals[i][0] || ""))]);
  }
  sheet.getRange(startRow, autoCol, numRows, 1).setValues(out);
  SpreadsheetApp.getActive().toast("Recomputed Auto Where to Bill (ALL rows) for: " + cfg.name);
}

function recomputeRunAttemptAndFinalFlags_(sheet) {
  const startRow = FIRST_DATA_ROW;
  const last = sheet.getLastRow();
  if (last < startRow) return;
  const numRows = last - startRow + 1;
  const dosCol = COL_INDEX["Date of Session"];
  const stCol = COL_INDEX["Start Time"];
  const dosVals = sheet.getRange(startRow, dosCol, numRows, 1).getValues();
  const stVals = sheet.getRange(startRow, stCol, numRows, 1).getValues();
  const keyCol = COL_INDEX["AppointmentKey"];
  const runCol = COL_INDEX["Run Attempt"];
  const finalCol = COL_INDEX["Final Row Flag"];
  const runDateCol = COL_INDEX["Report Run Date"];
  const keys = sheet.getRange(startRow, keyCol, numRows, 1).getValues();
  const runs = sheet.getRange(startRow, runCol, numRows, 1).getValues();
  const finals = sheet.getRange(startRow, finalCol, numRows, 1).getValues();
  const rdates = sheet.getRange(startRow, runDateCol, numRows, 1).getValues();
  const groups = {};
  for (let i = 0; i < numRows; i++) {
    const k = String(keys[i][0] || "").trim();
    if (!k) continue;
    if (!groups[k]) groups[k] = [];
    groups[k].push(i);
  }
  Object.keys(groups).forEach(function (k) {
    const idxs = groups[k];
    idxs.sort(function (a, b) {
      const da = dosVals[a][0]; const db = dosVals[b][0];
      const ta = da instanceof Date ? da.getTime() : 0;
      const tb = db instanceof Date ? db.getTime() : 0;
      if (ta !== tb) return ta - tb;
      const sa = normalizeTime24_(String(stVals[a][0] || ""));
      const sb = normalizeTime24_(String(stVals[b][0] || ""));
      if (sa !== sb) return sa.localeCompare(sb);
      const ra = rdates[a][0]; const rb = rdates[b][0];
      const tra = ra instanceof Date ? ra.getTime() : 0;
      const trb = rb instanceof Date ? rb.getTime() : 0;
      if (tra !== trb) return tra - trb;
      return a - b;
    });
    for (let j = 0; j < idxs.length; j++) {
      const i = idxs[j];
      runs[i][0] = j + 1;
      finals[i][0] = j === idxs.length - 1;
    }
  });
  sheet.getRange(startRow, runCol, numRows, 1).setValues(runs);
  sheet.getRange(startRow, finalCol, numRows, 1).setValues(finals);
}

/* ---------------- OCR ---------------- */
function ocrFileToText_(fileId) {
  var copy = withRetry_(function () {
    return Drive.Files.copy({ title: "OCR_" + new Date().toISOString(), mimeType: MimeType.GOOGLE_DOCS },
      fileId, { ocr: true, ocrLanguage: "en", convert: true, supportsAllDrives: true });
  }, "drive.files.copy");
  var txt = withRetry_(function () {
    return DocumentApp.openById(copy.id).getBody().getText() || "";
  }, "DocumentApp.openById");
  withRetry_(function () { Drive.Files.trash(copy.id, { supportsAllDrives: true }); }, "drive.files.trash");
  return { text: txt };
}

function withRetry_(fn, label) {
  var tries = 4; var baseSleep = 750;
  for (var i = 0; i < tries; i++) {
    try { return fn(); }
    catch (e) {
      var msg = String(e && e.message ? e.message : e);
      var transient = /Internal Error/i.test(msg) || /Service invoked too many times/i.test(msg) || /Rate Limit Exceeded/i.test(msg) || /Backend Error/i.test(msg) || /502|503|504/.test(msg);
      if (!transient || i === tries - 1) throw new Error((label ? label + ": " : "") + msg);
      Utilities.sleep(baseSleep * Math.pow(2, i));
    }
  }
}

/* ---------------- Parse fields ---------------- */
function extractFields_(txt) {
  const t = normalize_(txt);
  const out = {};
  const header = extractHeaderClientProvider_(txt);
  if (header.client) { out["Patient Name"] = header.client; out["Patient Initials"] = toInitials_(header.client); }
  if (header.provider) { out["Provider Name"] = header.provider; }
  if (header.dob) { out["Patient DOB"] = header.dob; }
  Logger.log("DOB debug | header=" + header.dob + " | findDob=" + findDob_(txt) + " | final=" + out["Patient DOB"]);
  if (isClaimEobDoc_(t)) {
    const c = parseClaimEobFields_(txt);
    out["Date of Session"] = c.serviceDateFrom || c.serviceDateTo || "";
    out["Patient Name"] = c.clientName || "";
    out["Patient Initials"] = c.clientName ? toInitials_(c.clientName) : "";
    out["Patient DOB"] = c.dob || "";
    out["Patient State"] = c.state || "";
    out["Insurance"] = c.customer || "";
    out["CPT Code"] = c.serviceCode || "";
    out["Billed?"] = c.status ? String(c.status).toUpperCase() : "";
    out["Missing Notes Audit Status"] = [out["Missing Notes Audit Status"] || "", "Parsed from Claim/EOB image"].filter(Boolean).join("; ");
    return out;
  }
  out["Date of Session"] = findSessionDate_(t);
  const pname = getPatientName_(t);
  out["Patient Name"] = pname || "";
  out["Patient Initials"] = pname ? toInitials_(pname) : "";
  const clinician = findClinicianName_(t);
  let prov = getProviderName_(t);
  if (clinician) { prov = clinician; }
  else {
    const prov2 = findProviderFromAppointmentInfoPanel_(t);
    if (prov2) prov = prov2;
  }
  if (!prov || (pname && prov && prov.toLowerCase() === pname.toLowerCase()) || /\brecord\b/i.test(prov || "")) {
    const guessed = guessProviderFallback_(t, pname);
    if (guessed) prov = guessed;
  }
  if (clinician) {
    const patLower = String(out["Patient Name"] || "").toLowerCase();
    const provLower = String(prov || "").toLowerCase();
    const clinLower = String(clinician || "").toLowerCase();
    if (patLower && clinLower && patLower === clinLower && provLower && provLower !== clinLower) {
      const tmp = out["Patient Name"];
      out["Patient Name"] = prov;
      out["Patient Initials"] = out["Patient Name"] ? toInitials_(out["Patient Name"]) : "";
      prov = tmp;
    }
  }
  out["Provider Name"] = cleanProviderName_(prov);
  if (!out["Provider Name"]) {
    out["Missing Notes Audit Status"] = out["Missing Notes Audit Status"] || "";
    out["Missing Notes Audit Status"] = [out["Missing Notes Audit Status"], "Provider name not found (manual review required)"].filter(Boolean).join("; ");
  }
  if (!out["Patient Name"]) {
    const pname2 = getPatientName_(t);
    out["Patient Name"] = pname2 || "";
    out["Patient Initials"] = pname2 ? toInitials_(pname2) : "";
  }
  if (!out["Provider Name"]) {
    const clinician2 = findClinicianName_(t);
    let prov2 = getProviderName_(t);
    if (clinician2) prov2 = clinician2;
    else { const prov3 = findProviderFromAppointmentInfoPanel_(t); if (prov3) prov2 = prov3; }
    out["Provider Name"] = cleanProviderName_(prov2);
  }
  if (!out["Patient Name"] || !looksLikePersonName_(out["Patient Name"])) {
    out["Missing Notes Audit Status"] = [out["Missing Notes Audit Status"] || "", "Patient name not reliably detected (manual review)"].filter(Boolean).join("; ");
    const pn = String(out["Patient Name"] || "").trim();
    if (!pn || isBadNameHeader_(pn) || looksLikeLabel_(pn)) { out["Patient Name"] = ""; out["Patient Initials"] = ""; }
    else { out["Patient Initials"] = out["Patient Initials"] || toInitials_(pn); }
  }
  if (!out["Provider Name"] || !looksLikePersonName_(out["Provider Name"])) {
    out["Missing Notes Audit Status"] = [out["Missing Notes Audit Status"] || "", "Provider name not reliably detected (manual review)"].filter(Boolean).join("; ");
    out["Provider Name"] = "";
  }
  const patNow = String(out["Patient Name"] || "").trim().toLowerCase();
  const provNow = String(out["Provider Name"] || "").trim().toLowerCase();
  const clinicianNow = String(findClinicianName_(t) || "").trim().toLowerCase();
  if (clinicianNow && patNow && patNow === clinicianNow && provNow && provNow !== clinicianNow) {
    const tmp = out["Patient Name"];
    out["Patient Name"] = out["Provider Name"];
    out["Patient Initials"] = out["Patient Name"] ? toInitials_(out["Patient Name"]) : "";
    out["Provider Name"] = tmp;
  }
  if (!out["Provider Name"] || (pname && out["Provider Name"] && out["Provider Name"].toLowerCase() === pname.toLowerCase()) || /\brecord\b/i.test(out["Provider Name"] || "")) {
    const guessed = guessProviderFallback_(t, pname);
    if (guessed) out["Provider Name"] = guessed;
  }
  if (!out["Patient DOB"]) out["Patient DOB"] = findDob_(txt);
  out["Patient State"] = findPatientState_(txt);
  const icdSection = grabBlock_(t, /ICD\s*10\s*Diagnosis/i, /(PSYCHIATRIC ASSESSMENT|Assessment|PLAN|Plan|CPT Codes|DOCUMENTATION)/i);
  const icdMatches = new Set();
  (t.match(/\b[A-Z][0-9][0-9A-Z](?:\.[0-9A-Z]+)?\b/g) || []).forEach(function (code) {
    if (/^[A-TV-Z][0-9]/.test(code)) icdMatches.add(code.toUpperCase());
  });
  if (icdSection) {
    const inSection = icdSection.match(/\b[A-Z][0-9][0-9A-Z](?:\.[0-9A-Z]+)?\b/g) || [];
    out["ICD-10 Codes"] = inSection.length ? Array.from(new Set(inSection.map(function (s) { return s.toUpperCase(); }))).join(", ") : Array.from(icdMatches).join(", ");
  } else { out["ICD-10 Codes"] = Array.from(icdMatches).join(", "); }
  const cptMatches = new Set();
  const billingBlock = grabBlock_(t, /Billing code/i, /(Orenda|Please indicate|Chief Complaint|ICD|CPT Codes|DOCUMENTATION)/i);
  const cptBlock = grabBlock_(t, /CPT Codes?/i, /(DOCUMENTATION|Provider|Signed|Time Spent|Plan|PSYCHOTHERAPY|$)/i);
  [billingBlock, cptBlock, t].forEach(function (s) {
    if (!s) return;
    (s.match(/\b9\d{4}\b/g) || []).forEach(function (c) { cptMatches.add(c); });
  });
  const cptList = orderCptCodes_(Array.from(cptMatches));
  out["CPT Code"] = cptList.join(", ");
  out["TimeCard CPT Format"] = formatCptForTimecard_(out["CPT Code"]);
  const apptFromTable = inferApptTypeFromCptValidation_(out["CPT Code"]);
  out["Appt Type"] = apptFromTable || classifyApptType_(t, out["CPT Code"]);
  out["Start Time"] = (function () {
    const panel = getCurrentAppointmentPanel_(t);
    const m = panel.match(/\b(\d{1,2}:\d{2}\s*[ap]m)\s*[-–]\s*\d{1,2}:\d{2}\s*[ap]m\b/i) ||
              t.match(/\b(\d{1,2}:\d{2}\s*[ap]m)\s*[-–]\s*\d{1,2}:\d{2}\s*[ap]m\b/i);
    return m ? m[1].toUpperCase() : "";
  })();
  out["Duration"] = (function () {
    const totalLine = (t.match(/^\s*total\s*time\s*in\s*minutes\s*:\s*.*?\b(\d{1,3})\b\s*(?:min|mins|minutes)?\b/im) || [])[1];
    let n = totalLine ? parseInt(totalLine, 10) : null;
    if (n == null) {
      const m2 = (t.match(/^\s*the\s+total\s+time\s+i\s+spent[\s\S]{0,120}?\b:\s*\b(\d{1,3})\b\s*(?:min|mins|minutes)?\b/im) || [])[1];
      if (m2) n = parseInt(m2, 10);
    }
    if (isFinite(n) && n > 0 && n <= 300) return String(n);
    const panel = getCurrentAppointmentPanel_(t) || t;
    const m = panel.match(/\b(\d{1,2}):(\d{2})\s*([ap]m)\s*[-–]\s*(\d{1,2}):(\d{2})\s*([ap]m)\b/i);
    if (m) {
      function to24(h, min, ampm) {
        h = parseInt(h, 10); min = parseInt(min, 10); ampm = String(ampm || "").toLowerCase();
        if (ampm === "pm" && h !== 12) h += 12;
        if (ampm === "am" && h === 12) h = 0;
        return h * 60 + min;
      }
      const start = to24(m[1], m[2], m[3]);
      const end = to24(m[4], m[5], m[6]);
      const diff = end - start;
      if (diff > 0 && diff <= 300) return String(diff);
    }
    return "";
  })();
  out["Session Location"] = getOne_(t, /\bSession Location[:\s]*([A-Za-zÀ-ÿ /-]+)\b/i) || (/telehealth/i.test(t) ? "Telehealth" : "");
  out["Provider No-Show Attestation*"] = getOne_(t, /\bprovider no[-\s]?show attestation[:\s]*([a-z ,.-]+)\b/i) || getOne_(t, /\bno[-\s]?show attestation[:\s]*([a-z ,.-]+)\b/i) || getOne_(t, /\battestation[:\s]*([a-z ,.-]+)\b/i) || "";
  out["Insurance"] = "";
  out["No Show/Late Cancellation Action"] = "";
  out["Billed?"] = "";
  out["CPT Code"] = (out["CPT Code"] || "").split(",").map(function (s) { return String(s || "").trim().replace(/\s+/g, ""); }).filter(function (v) { return !!v; }).join(", ");
  return out;
}

/* ------------- Rules & audits ------------- */
function applyNoShowAndAuditRules_(rawText, rec) {
  const t = normalize_(rawText || "");
  const tl = t.toLowerCase();

  const status = detectCancelStatusInCurrentPanel_(t);
  const isLateCncl = status.hasLate;
  const isCancel = status.hasCancel;
  const isNoNoteScreen = detectNoNoteScreen_(t);

  if (isCancel && !isNoNoteScreen) {
    rec["Appt Type"] = "Cancel";
    rec["ICD-10 Codes"] = "";
    rec["CPT Code"] = "";
    rec["TimeCard CPT Format"] = "";
    rec["Duration"] = "";
    rec["Provider No-Show Attestation*"] = "";
    rec["No Show/Late Cancellation Action"] = "";
    rec["Missing Notes Audit Status"] = "";
    if (!rec["Date of Session"]) { const d = findSessionDate_(t); if (d) rec["Date of Session"] = d; }
    if (!rec["Provider Name"]) { const p = getProviderName_(t); if (p) rec["Provider Name"] = p; }
    if (!rec["Patient Name"] || !rec["Patient Initials"]) {
      const pn = getPatientName_(t);
      if (pn) { rec["Patient Name"] = rec["Patient Name"] || pn; rec["Patient Initials"] = rec["Patient Initials"] || toInitials_(pn); }
    }
    return;
  }

  const isNoShow = isNoShowText_(t) || /\bno[\s\-–—]?show(?:ed)?\b/i.test(t) || /\bno[\s\-–—]?show\s+appointment\b/i.test(t);
  const hasSignature = /\b(electronically\s*)?signed by\b/i.test(t) || /\bsigned:\s*[A-ZÀ-ÿ]/i.test(t) || /\bsignature on file\b/i.test(t) || /\be-signed\b/i.test(t) || /\besigned\b/i.test(t) || /\bsignature date[:\s]/i.test(t);
  const hasLocked = /\blocked\b/i.test(t) || /\bfinalized\b/i.test(t) || /\bstatus[:\s]*locked\b/i.test(t) || /\blocked by\b/i.test(t) || /\bfinalized and locked\b/i.test(t);
  const headerTop = String(t || "").split(/\n+/).slice(0, 40).join("\n");
  const noShowInHeader = isNoShowText_(headerTop);
  const lateCancelInHeader = isLateCancelText_(headerTop);

  // 🔧 FIX: Check Late Cancel / No Show BEFORE isNoNoteSession.
  // Previously, appointment cards with "Add Note" + no Diagnosis fields
  // were being caught by isNoNoteSession FIRST, causing them to output
  // "Missing/ Incomplete Notes" instead of "Late Cancel".
  // Grace Buzzi's late-cancel card has "Add Note" in the Notes section,
  // which was triggering isNoNoteSession even though "× Late canceled" badge
  // was clearly visible in the header.
  // Fix: if late cancel or no-show is confirmed in the header, skip
  // straight to Case 2 — never let isNoNoteSession override it.
  if ((isLateCncl || lateCancelInHeader) && !isNoShow) {
    const lateCancelLabel = "Late Cancel";
    rec["Appt Type"] = lateCancelLabel;
    rec["ICD-10 Codes"] = lateCancelLabel;
    rec["CPT Code"] = lateCancelLabel;
    rec["TimeCard CPT Format"] = lateCancelLabel;
    rec["Duration"] = "";
    if (!rec["Date of Session"]) {
      let d = findNoShowDateNear_(t);
      if (!d) d = findSessionDate_(t);
      if (d) rec["Date of Session"] = d;
    }
    var _lcProvToks = (rec["Provider Name"] || "").trim().split(/\s+/).filter(Boolean);
    var _lcProvIsInitials = _lcProvToks.length > 0 && _lcProvToks.every(function(tok){ return /^[A-Z]{1,3}$/.test(tok); });
    if (!rec["Provider Name"] || _lcProvIsInitials) {
      if (_lcProvIsInitials) rec["Provider Name"] = "";
      const lcp1 = findNoShowProviderNear_(t);
      if (lcp1) rec["Provider Name"] = cleanProviderName_(lcp1);
      if (!rec["Provider Name"]) { const lcp2 = findClinicianName_(t); if (lcp2) rec["Provider Name"] = lcp2; }
      if (!rec["Provider Name"]) { const lcp3 = getProviderName_(t); if (lcp3) rec["Provider Name"] = cleanProviderName_(lcp3); }
    }
    if (!rec["Patient Name"] || !rec["Patient Initials"]) {
      const pn = getPatientName_(t);
      if (pn) { rec["Patient Name"] = rec["Patient Name"] || pn; rec["Patient Initials"] = rec["Patient Initials"] || toInitials_(pn); }
    }
    rec["Provider No-Show Attestation*"] = "";
    let lcAction = parseNoShowAction_(t);
    rec["No Show/Late Cancellation Action"] = lcAction;
    rec["Missing Notes Audit Status"] = lcAction ? "" : "Provider decision needed: charge or waive";
    return;
  }

  if ((isNoShow || noShowInHeader) && !isLateCncl && !lateCancelInHeader) {
    // handled below in Case 2 (isNoShow path)
  }

  let isNoNoteSession = false;
  if (!isNoShow && !isLateCncl && !noShowInHeader && !lateCancelInHeader) {
    if (isNoNoteScreen || /\bno note\b/i.test(tl)) {
      isNoNoteSession = true;
    } else {
      const looksLikeApptScreen = /\bClinician\b/i.test(t) && /\bLocation\b/i.test(t);
      const hasAddNote = /\bAdd Note\b/i.test(t);
      const hasDiagnosisFields = /\bDiagnosis\b/i.test(t) || /\bICD\b/i.test(t);
      if (looksLikeApptScreen && hasAddNote && !hasDiagnosisFields) { isNoNoteSession = true; }
    }
  }

  if (isNoNoteSession) {
    rec["ICD-10 Codes"] = "No Note";
    rec["CPT Code"] = "No Note";
    rec["TimeCard CPT Format"] = MISSING_LABEL;
    rec["Duration"] = "";
    rec["Provider No-Show Attestation*"] = "";
    rec["No Show/Late Cancellation Action"] = "";
    rec["Missing Notes Audit Status"] = "No Note";
    if (!rec["Date of Session"]) { const d = findSessionDate_(t); if (d) rec["Date of Session"] = d; }
    if (!rec["Provider Name"]) { const p = getProviderName_(t); if (p) rec["Provider Name"] = p; }
    if (!rec["Patient Name"] || !rec["Patient Initials"]) {
      const pn = getPatientName_(t);
      if (pn) { rec["Patient Name"] = rec["Patient Name"] || pn; rec["Patient Initials"] = rec["Patient Initials"] || toInitials_(pn); }
    }
    return;
  }

  /* ---------- Case 2: No-show / Late Cancel ---------- */
  if (isNoShow || isLateCncl) {
    const label = isLateCncl ? "Late Cancel" : "No Show";
    rec["Appt Type"] = label;
    rec["ICD-10 Codes"] = label;
    rec["CPT Code"] = label;
    rec["TimeCard CPT Format"] = label;
    rec["Duration"] = "";

    if (!rec["Date of Session"]) {
      let d = findNoShowDateNear_(t);
      if (!d) d = findSessionDate_(t);
      if (d) rec["Date of Session"] = d;
    }

    // 🔧 FIX: Provider name on late cancel screens
    // Clear pure-initials ("AA", "KC") that extractFields_ may have stored,
    // then try 3-step fallback to find the real name.
    var _provToks = (rec["Provider Name"] || "").trim().split(/\s+/).filter(Boolean);
    var _provIsInitials = _provToks.length > 0 && _provToks.every(function(tok){ return /^[A-Z]{1,3}$/.test(tok); });
    if (!rec["Provider Name"] || _provIsInitials) {
      if (_provIsInitials) rec["Provider Name"] = "";
      // Step 1: No-show attestation "with provider X" pattern
      const p1 = findNoShowProviderNear_(t);
      if (p1) rec["Provider Name"] = cleanProviderName_(p1);
      // Step 2: Clinician field — handles Orenda late-cancel card (name before label)
      if (!rec["Provider Name"]) {
        const p2 = findClinicianName_(t);
        if (p2) rec["Provider Name"] = p2;
      }
      // Step 3: Generic provider extraction as last resort
      if (!rec["Provider Name"]) {
        const p3 = getProviderName_(t);
        if (p3) rec["Provider Name"] = cleanProviderName_(p3);
      }
    }

    if (!rec["Patient Name"] || !rec["Patient Initials"]) {
      const pn = getPatientName_(t);
      if (pn) { rec["Patient Name"] = rec["Patient Name"] || pn; rec["Patient Initials"] = rec["Patient Initials"] || toInitials_(pn); }
    }

    let hasNSAttest = false;
    if (isNoShow) {
      hasNSAttest = !!rec["Provider No-Show Attestation*"] || /\bno[\-\s]?show attestation[:\s]/i.test(t) || /\bclient no[\-\s]?show attestation\b/i.test(t) || /\bprovider attests\b/i.test(t) || (hasSignature && /\bno[\-\s]?show\b/i.test(t));
      rec["Provider No-Show Attestation*"] = hasNSAttest ? "Yes" : "No";
    } else {
      rec["Provider No-Show Attestation*"] = "";
    }

    let action = parseNoShowAction_(t);
    rec["No Show/Late Cancellation Action"] = action;

    if (isNoShow) {
      if (!hasNSAttest) { rec["Missing Notes Audit Status"] = "Missing No-show attestation"; }
      else if (!action) { rec["Missing Notes Audit Status"] = "Provider decision needed: charge or waive"; }
      else { rec["Missing Notes Audit Status"] = ""; }
    } else {
      if (!action) { rec["Missing Notes Audit Status"] = "Provider decision needed: charge or waive"; }
      else { rec["Missing Notes Audit Status"] = ""; }
    }
    return;
  }

  /* ---------- Case 3: Normal sessions ---------- */
  const issues = [];
  const tlNorm = tl.replace(/\s+/g, " ").trim();
  if (!hasSignature) issues.push("Unsigned");
  if (!hasLocked) issues.push("Unlocked Note");
  if (!rec["CPT Code"] || rec["CPT Code"] === "No Show" || rec["CPT Code"] === "No Note") {
    issues.push("Missing CPT Code");
  } else {
    const cores = rec["CPT Code"].split(",").map(function (s) { return s.trim().split("-")[0]; });
    const allOk = cores.every(function (core) { return /^[0-9]{4,5}$/.test(core) || KNOWN_CPTS.has(core); });
    if (!allOk) issues.push("Incorrect CPT Codes");
  }
  if (!rec["ICD-10 Codes"]) {
    issues.push("Missing ICD-10 (F-codes)");
  } else {
    const dxList = rec["ICD-10 Codes"].split(",").map(function (s) { return s.trim(); }).filter(Boolean);
    if (dxList.length && !dxList.some(function (code) { return /^F/i.test(code); })) { issues.push("Incorrect ICD-10 Codes"); }
  }
  const total = coalesceMinutes_([
    extractLabeledMinutes_(tl, /\btotal time in minutes\b/i),
    extractLabeledMinutes_(tl, /\btotal time\b/i),
    extractPairMinutes_(tl, /time spent[:\s]*therapy[:\s]*([0-9]{1,3}).*?total[:\s]*([0-9]{1,3})/i, 2),
  ]);
  if (total != null && isFinite(total) && total > 0 && total <= 300) { rec["Duration"] = String(total); }
  const therapy = coalesceMinutes_([
    extractLabeledMinutes_(tl, /\btherapy time in minutes\b/i),
    extractLabeledMinutes_(tl, /\btherapy time\b/i),
    extractPairMinutes_(tl, /time spent[:\s]*therapy[:\s]*([0-9]{1,3})/i, 1),
    extractMinutes_(tl, /\bpsychotherapy time[:\s]*([0-9]{1,3})\b/i),
  ]);
  rec["Therapy Time"] = therapy != null ? String(therapy) : "";
  const hasRealCpt = !!rec["CPT Code"] && rec["CPT Code"] !== "No Show" && rec["CPT Code"] !== "No Note";
  const cptCodesForTime = (rec["CPT Code"] || "").split(",").map(function (s) { return s.trim(); }).filter(Boolean);
  const hasPsychotherapyCode = cptCodesForTime.some(function (code) { return /^9083[2-8]$/.test(code); });
  const coresForTime = cptCodesForTime.map(function (code) { return code.split("-")[0].trim(); });
  const only99213_14 = coresForTime.length && coresForTime.every(function (c) { return c === "99213" || c === "99214"; });
  if (!only99213_14 && hasRealCpt && hasPsychotherapyCode && (total == null || therapy == null)) { issues.push("Missing Total and/or Therapy Time"); }
  if (!only99213_14 && total != null && therapy != null && therapy > total) { issues.push("Therapy Time > Total Time"); }
  validateCptAndAppt_(tlNorm, rec["CPT Code"], rec["Appt Type"], therapy, total, issues);
  rec["Missing Notes Audit Status"] = dedupeList_(issues).join("; ");
  rec["No Show/Late Cancellation Action"] = "";
  if (rec["Missing Notes Audit Status"]) { rec["TimeCard CPT Format"] = MISSING_LABEL; }
}

function validateCptAndAppt_(noteTextLower, cptStr, apptType, therapyMin, totalMin, issues) {
  const table = getCptValidationMap_();
  const keyFromNote = normalizeCptKeyFromNote_(cptStr);
  const row = table[keyFromNote];
  if (row) {
    const appt = String(apptType || "").toLowerCase();
    if (row.apptType && appt && row.apptType !== appt) { issues.push("CPT / Appt Type mismatch (" + keyFromNote + " expects " + row.apptType + ")"); }
    if (!therapyRangeOk_(therapyMin, row.minTherapy)) { issues.push("Incorrect CPT Codes"); return; }
  }
  const t = String(noteTextLower || "");
  const codes = (cptStr || "").split(",").map(function (s) { return s.trim(); }).filter(Boolean);
  if (!codes.length) return;
  const codeSet = new Set(codes);
  function has(code) { return codeSet.has(code); }
  const has90792 = has("90792");
  const has99203 = has("99203"); const has99204 = has("99204"); const has99205 = has("99205");
  const has99213 = has("99213"); const has99214 = has("99214"); const has99215 = has("99215");
  const has90832 = has("90832"); const has90834 = has("90834"); const has90837 = has("90837");
  const has90833 = has("90833"); const has90836 = has("90836"); const has90838 = has("90838");
  const has99205Justification = has99205 && (/\bjustif(?:y|ied|ication)\b/i.test(t) || /\brationale\b/i.test(t) || /\bmedical decision making\b/i.test(t) || /\bmdm\b/i.test(t) || /\bcomplexit(?:y|ies)\b/i.test(t));
  if (has99205 && !has99205Justification) { issues.push("99205 missing justification"); }
  let incorrect = false;
  function checkTherapyRange(minVal, minReq, maxReq) {
    if (minVal == null) { incorrect = true; return; }
    if (maxReq == null) { if (minVal < minReq) incorrect = true; }
    else { if (minVal < minReq || minVal > maxReq) incorrect = true; }
  }
  if (has99205) {
    if (totalMin == null || totalMin < 60) { issues.push("Incorrect CPT Codes"); return; }
    if (has90838) { checkTherapyRange(therapyMin, 53, null); if (incorrect) { issues.push("Incorrect CPT Codes"); return; } }
    else if (has90836) { checkTherapyRange(therapyMin, 38, 52); if (incorrect) { issues.push("Incorrect CPT Codes"); return; } }
    else if (has90833) { checkTherapyRange(therapyMin, 16, 37); if (incorrect) { issues.push("Incorrect CPT Codes"); return; } }
  }
  if (codes.length === 2 && (has99203 || has99204 || has99205 || has99213 || has99214 || has99215) && (has90833 || has90836 || has90838)) {
    if (has99203 && has90833) checkTherapyRange(therapyMin, 16, 37);
    else if (has99203 && has90836) checkTherapyRange(therapyMin, 38, 52);
    else if (has99204 && has90833) checkTherapyRange(therapyMin, 16, 37);
    else if (has99204 && has90836) checkTherapyRange(therapyMin, 38, 52);
    else if (has99204 && has90838) checkTherapyRange(therapyMin, 53, null);
    else if (has99205 && has90836) checkTherapyRange(therapyMin, 38, 52);
    else if (has99205 && has90833) checkTherapyRange(therapyMin, 16, 37);
    else if (has99205 && has90838) checkTherapyRange(therapyMin, 53, null);
    else if (has99213 && has90833) checkTherapyRange(therapyMin, 16, 37);
    else if (has99213 && has90836) checkTherapyRange(therapyMin, 38, 52);
    else if (has99213 && has90838) checkTherapyRange(therapyMin, 53, null);
    else if (has99214 && has90833) checkTherapyRange(therapyMin, 16, 37);
    else if (has99214 && has90836) checkTherapyRange(therapyMin, 38, 52);
    else if (has99214 && has90838) checkTherapyRange(therapyMin, 53, null);
    else if (has99215 && has90833) checkTherapyRange(therapyMin, 16, 37);
    else if (has99215 && has90836) checkTherapyRange(therapyMin, 38, 52);
    else if (has99215 && has90838) checkTherapyRange(therapyMin, 53, null);
    else incorrect = true;
  } else {
    if (codes.length === 1 && has90792) { /* ok */ }
    else {
      if ((has90832 || has90834 || has90837) && !has99213 && !has99214 && !has99215 && !has99203 && !has99204 && !has99205 && !has90833 && !has90836 && !has90838) {
        if (codes.length !== 1) incorrect = true;
        else if (has90832) checkTherapyRange(therapyMin, 16, 37);
        else if (has90834) checkTherapyRange(therapyMin, 38, 52);
        else if (has90837) checkTherapyRange(therapyMin, 53, null);
      }
      if (!incorrect && !has90832 && !has90834 && !has90837 && !has90833 && !has90836 && !has90838 && (has99213 || has99214 || has99215)) {
        const countE = (has99213 ? 1 : 0) + (has99214 ? 1 : 0) + (has99215 ? 1 : 0);
        if (countE !== 1 || codes.length !== 1) incorrect = true;
      }
    }
  }
  if (incorrect) issues.push("Incorrect CPT Codes");
  const intakeOnly = ["90791","90792","99203","99204","99205"];
  const followOnly = ["99213","99214","99215"];
  const psychOnly = ["90832","90834","90837"];
  const hasIntakeCode = intakeOnly.some(has);
  const hasFollowCode = followOnly.some(has);
  const hasPsychOnly = psychOnly.some(has);
  const hasFollowCombo = (has99213 || has99214 || has99215) && (has90833 || has90836 || has90838);
  const appt = (apptType || "").toLowerCase();
  if (appt === "intake") {
    if (!hasIntakeCode && (hasFollowCode || hasPsychOnly || hasFollowCombo)) { issues.push("CPT / Appt Type mismatch (follow-up code used on Intake)"); }
  } else if (appt === "follow-up") {
    if (hasIntakeCode) { issues.push("CPT / Appt Type mismatch (intake code used on Follow-up)"); }
  }
}

function normalizeInsuranceKey_(insuranceRaw) {
  const s = String(insuranceRaw || "").trim().toLowerCase();
  if (!s) return "";
  if (s === "grand total") return "grand total";
  if (s === "self pay") return "self pay";
  const compact = s.replace(/\s+/g, "");
  if (compact.includes("multiplan")) return "multiplan";
  if (compact.includes("tricare")) return "tricare";
  if (compact.includes("compsych")) return "compsych";
  if (compact.includes("comstack")) return "comstack";
  if (compact.includes("aetna")) return "aetna";
  if (compact.includes("optum")) return "optum";
  if (compact.includes("cigna")) return "cigna";
  if (compact.includes("anthem")) return "anthem";
  if (compact.includes("point32")) return "point32";
  return s;
}

function normalizeApptTypeKey_(apptTypeRaw) {
  const s = String(apptTypeRaw || "").trim().toLowerCase();
  if (!s) return "";
  const compact = s.replace(/[._]/g, " ").replace(/\s+/g, " ").trim();
  if (["intake","initial","initial visit","initial evaluation","new","new patient","new pt"].includes(compact)) return "intake";
  if (["follow-up","follow up","followup","f/u","fu","existing","existing patient","established","return visit","return"].includes(compact)) return "follow-up";
  return compact.replace(/\s+/g, "-");
}

function inferApptTypeFromCptValidation_(cptStr) {
  const table = getCptValidationMap_();
  const key = normalizeCptKeyFromNote_(cptStr);
  const row = table[key];
  if (!row || !row.apptType) return "";
  const a = String(row.apptType).toLowerCase();
  if (a === "intake") return "Intake";
  if (a === "follow-up" || a === "follow up" || a === "followup") return "Follow-up";
  return "";
}

function parseNoShowAction_(rawText) {
  const t = String(rawText || "");
  const block = grabBlock_(t, /provider\s+no[-\s]?show\s+attestation|client\s+no[-\s]?show\s+attestation|no[-\s]?show\s+attestation/i, /(documentation|provider\s+signature|signed|status|time\s+spent|plan|psychotherapy|ip\s*address|$)/i) || t;
  const s = String(block || "");
  const waiveRe = /\b(waive|waived|waiver|fee\s*waived|waive\s*fee|no\s*charge|do\s*not\s*charge|don'?t\s*charge|do\s*not\s*bill|don'?t\s*bill|waive\s+the\s+fee)\b/i;
  if (waiveRe.test(s)) return "Waive";
  const chargeRe = /\b(?:patient\s*(?:to|will|shall|should)?\s*(?:re?ceiv(?:e|ed|es|ing)|recie?v(?:e|ed|es|ing)|receve(?:s|d)?)\s*(?:a\s*)?(?:no[\s-]?show|late[\s-]?cancel(?:lation)?|cancell?ation)\s*fee)\b/i;
  const chargeRe2 = /\b(?:should\s*be\s*charged|charge\s*(?:the\s*)?(?:patient|pt|client)|charge\s*(?:a\s*)?(?:no[\s-]?show|late[\s-]?cancel|cancell?ation)\s*fee|apply\s*(?:the\s*)?(?:no[\s-]?show|late[\s-]?cancel|cancell?ation)\s*fee|bill\s*(?:the\s*)?(?:patient|pt|client)|patient\s*(?:will|should)\s*be\s*billed|collect\s*(?:the\s*)?fee)\b/i;
  if ((chargeRe.test(s) || chargeRe2.test(s)) && !/\b(do\s*not\s*charge|don'?t\s*charge|no\s*charge)\b/i.test(s)) return "Charge";
  const idx = t.search(/attestation/i);
  if (idx !== -1) {
    const win = t.slice(Math.max(0, idx - 400), Math.min(t.length, idx + 900));
    if (/\b(do\s*not\s*charge|don'?t\s*charge|no\s*charge|waive)\b/i.test(win)) return "Waive";
    if (/\b(patient\s*(?:to|will|shall)?\s*(?:re?ceiv|recie?v|receve)|should\s*be\s*charged|charge|apply\s+fee|bill\s+patient|no[\s-]?show\s*fee)\b/i.test(win)) return "Charge";
  }
  return "";
}

/* ------------- Provider, Patient & Date helpers ------------- */

// =====================================================================
// 🔧 FIX: LATE CANCEL STATUS DETECTION
// =====================================================================
// PROBLEM: "Late canceled" badge appears ABOVE "Appointment details" in
//   the UI. getCurrentAppointmentPanel_() starts searching FROM
//   "Appointment details", so it MISSES the status badge entirely.
//   Result: detectCancelStatusInCurrentPanel_() sees no panel or a panel
//   with no status → returns { hasLate: false } → falls through to Case 3
//   → outputs "Missing/Incomplete Notes" instead of "Late Cancel".
//
// FIX: Scan the ENTIRE document (not just the panel) for late cancel /
//   cancel status signals, using both:
//   1) isLateCancelText_() / isNoShowText_() on the top 40 lines
//   2) A 3-pattern status field extractor on the panel
//
// The top-of-doc scan catches the status badge that sits above the panel.
// =====================================================================
function detectCancelStatusInCurrentPanel_(text) {
  const t = normalize_(text || "");

  // ── STEP 1: Check top of document for status badge ──────────────────
  // The "Late canceled" / "Canceled" / "No show" badge appears in the
  // top section of the appointment card, BEFORE "Appointment details".
  // Scan the first 40 lines explicitly before trying the panel.
  const topLines = t.split(/\n+/).slice(0, 40).join("\n");

  // Late cancel in the top area → definitive signal
  if (isLateCancelText_(topLines)) {
    return { hasLate: true, hasCancel: false };
  }

  // ── STEP 2: Get the appointment panel and scan it ────────────────────
  const panel = getCurrentAppointmentPanel_(t);

  // If panel found, check for late cancel text anywhere in it
  if (panel && isLateCancelText_(panel)) {
    return { hasLate: true, hasCancel: false };
  }

  // ── STEP 3: Multi-pattern status field extraction from panel ─────────
  const searchArea = panel || topLines; // fallback to top lines if no panel
  let statusLine = "";

  // Pattern A: "Status: Late canceled" (same line)
  let m = searchArea.match(/\b(?:appointment\s+)?status\b\s*[:\-]?\s*([A-Za-z \-]{3,40})/i);
  if (m) statusLine = m[1];

  // Pattern B: "Status" label on one line, value on next line
  if (!statusLine) {
    const lines = searchArea.split(/\n+/).map(s => s.trim());
    for (let i = 0; i < lines.length; i++) {
      if (/^(?:appointment\s+)?status\b\s*[:\-]?\s*$/i.test(lines[i])) {
        if (i + 1 < lines.length) { statusLine = lines[i + 1]; break; }
      }
    }
  }

  // Pattern C: Broader search for cancel keywords near status word
  if (!statusLine) {
    m = searchArea.match(/\bstatus\b[^\n]{0,80}(late[\s\-]*cancel|cancel(?:led|ed)?|no[\s\-]*show)/i);
    if (m) statusLine = m[0];
  }

  const s = String(statusLine || "").toLowerCase().replace(/\s+/g, " ").trim();

  // Late cancel detection (flexible OCR variants)
  const hasLate =
    /\blate[\s\-]*cancel(?:led|ed|ation)?\b/.test(s) ||
    /\blate[\s\-]*cance(?:l|ll)ed\b/.test(s) ||
    /\blate[\s\-]*cncl(?:d|ed)?\b/.test(s) ||
    /\blatecance/.test(s.replace(/[\s\-]/g, ""));

  // Plain cancel (only if NOT late cancel)
  const hasCancel =
    !hasLate &&
    (/\bcancel(?:led|ed|ation)?\b/.test(s) || /\bcance(?:l|ll)ed\b/.test(s));

  // ── STEP 4: Final fallback — scan whole top area for plain cancel ────
  // If status extraction still found nothing, check top area for
  // a plain canceled badge (but NOT if late cancel was already ruled out).
  if (!hasLate && !hasCancel) {
    const topNorm = topLines.toLowerCase().replace(/\s+/g, " ");
    if (/\bcancel(?:led|ed|ation)?\b/.test(topNorm) && !isLateCancelText_(topLines)) {
      return { hasLate: false, hasCancel: true };
    }
  }

  return { hasLate, hasCancel };
}
// =====================================================================
// 🔧 END FIX: LATE CANCEL STATUS DETECTION
// =====================================================================

function cleanProviderName_(name){
  let n = (name || "").replace(/\bProvider\b.*$/i,"").trim();

  // 🔧 FIX: Reject pure-initials strings like "AA", "KC", "BY", "AA AA"
  // These are avatar badge OCR artifacts — every space-separated token
  // is 1-3 ALL-CAPS letters with no lowercase at all.
  var _itoks = n.trim().split(/\s+/).filter(Boolean);
  if (_itoks.length > 0 && _itoks.every(function(tok){ return /^[A-Z]{1,3}$/.test(tok); })) return "";

  // Remove location keywords that OCR merges into the name
  n = n.replace(/\b(Location|Video|Office|Telehealth|In-Person|Remote).*$/i, "").trim();

  if (isBadProviderLike_(n) || isBadNameHeader_(n)) return "";
  if (/\bfree\s*text\s*note\b/i.test(n)) return "";
  if (/\bprogress\s*note\b/i.test(n)) return "";
  if (/\b(appointment info|details|treatment progress)\b/i.test(n)) return "";
  if (/\b(progress note|intake note|follow[-\s]?up note)\b/i.test(n)) return "";

  n = n.replace(/^(Show\s+Edit|Show|Edit)\s+/i, "").trim();
  n = n.replace(/^[A-Z]{1,3}\s+(?=[A-Z][A-Za-zÀ-ÿ.'-]+\s+[A-Z][A-Za-zÀ-ÿ.'-]+)/, "").trim();

  const parts1 = n.split(/\s+/);
  if (parts1.length === 3 && parts1[0].length <= 3) { n = parts1[1] + " " + parts1[2]; }

  n = n.replace(/,?\s+(PMHNP(?:-BC)?|FNP|AGNP|LCSW|LMHC|LICSW|LCPC|LPC|NP|APRN|RN|MD|DO|PA(?:-C)?|PhD|PsyD|DNP|MSN|MSW)\b.*$/i,"")
       .replace(/,?\s*(License|Lic\.?)[:\s]*\S+$/i,"")
       .replace(/,?\s*#\s*\d+$/i,"")
       .trim();

  n = n.replace(/\s*Location.*$/i,"").trim();
  n = n.replace(/\s*Orenda.*$/i,"").trim();
  n = n.replace(/\s*Telehealth.*$/i,"").trim();
  n = n.replace(/\s*\(you\)$/i,"").trim();
  n = n.replace(/\s+Provider$/i,"").trim();

  if (!n || /^\s*provider\s*$/i.test(n)) return "";

  // Clean spacing around parentheses but KEEP them (for names like "Maria (Ria) Johnson")
  n = n.replace(/\s*\(\s*/g, " (").replace(/\s*\)\s*/g, ") ").replace(/\s+/g, " ").trim();

  const parts2 = n.split(/\s+/).filter(Boolean);
  if (parts2.length > 5) n = parts2.slice(0, 5).join(" ");

  if (/\b(appointment info|details|treatment progress)\b/i.test(n)) return "";
  if (isUSStateLike_(n)) return "";

  const parts = n.split(/\s+/).filter(Boolean);
  if (parts.length < 2) return "";

  // Allow parentheses in names
  if (!/^[A-Z][A-Za-zÀ-ÿ.'()-]+(?:\s+[A-Z][A-Za-zÀ-ÿ.'()-]+){1,4}$/.test(n)) return "";

  const particle = "(?:de|del|de la|da|di|van|von|la|le|du)";
  const token = "[A-Z][A-Za-zÀ-ÿ.'()-]+";
  const tokenOrParticle = "(?:" + token + "|" + particle + ")";
  const nameRe = new RegExp("^" + token + "(?:\\s+" + tokenOrParticle + "){0,4}\\s+" + token + "$", "i");

  if (!nameRe.test(n)) return "";
  return n;
}

function getProviderName_(t) {
  const text = normalize_(t);
  const candidates = [];
  function pushIf(v) { if (v) candidates.push(v); }
  pushIf(getOne_(text, /(?:^|\n)\s*Provider:\s*([A-Z][A-Za-zÀ-ÿ.'-]+\s+[A-Z][A-Za-zÀ-ÿ.'-]+(?:\s+[A-Z][A-Za-zÀ-ÿ.'-]+){0,2})\b/i, 1));
  pushIf(getOne_(text, /(?:^|\n)\s*Provider\s*[:\-]?\s*([A-Z][A-Za-zÀ-ÿ.'-]+\s+[A-Z][A-Za-zÀ-ÿ.'-]+(?:\s+[A-Z][A-Za-zÀ-ÿ.'-]+){0,2})\b/i, 1));
  pushIf(getOne_(text, /(?:^|\n)\s*Provider\s*[:\-]?\s*\n\s*([A-Z][A-Za-zÀ-ÿ.'-]+\s+[A-Z][A-Za-zÀ-ÿ.'-]+(?:\s+[A-Z][A-Za-zÀ-ÿ.'-]+){0,2})\b/i, 1));
  pushIf(getOne_(text, /(?:^|\n)\s*Provider\s*\n\s*([A-Z][A-Za-zÀ-ÿ.'-]+\s+[A-Z][A-Za-zÀ-ÿ.'-]+(?:\s+[A-Z][A-Za-zÀ-ÿ.'-]+){0,2})\b/i, 1));
  pushIf(getOne_(text, /\bLocked and Signed by\s+([A-Z][A-Za-zÀ-ÿ.'-]+\s+[A-Z][A-Za-zÀ-ÿ.'-]+(?:\s+[A-Z][A-Za-zÀ-ÿ.'-]+){0,2})\b/i, 1));
  pushIf(getOne_(text, /\bShow\s+Edit\s+([A-Z][A-Za-zÀ-ÿ.'-]+(?:\s+[A-Z][A-Za-zÀ-ÿ.'-]+){0,2})\b/i));
  pushIf(getOne_(text, /(?:^|\n)\s*[A-Z]{1,3}\s+([A-Z][A-Za-zÀ-ÿ.'-]+\s+[A-Z][A-Za-zÀ-ÿ.'-]+)\b/m, 1));
  pushIf(getOne_(text, /Appointment details(?: for.*)? with\s+([A-Z][A-Za-zÀ-ÿ.'-]+(?:\s+[A-Z][A-Za-zÀ-ÿ.'-]+){0,3})\b/i));
  pushIf(getOne_(text, /\bProvider Name[:\s]*([A-Z][A-Za-zÀ-ÿ.'-]+(?:\s+[A-Z][A-Za-zÀ-ÿ.'-]+){0,3})\b/i));
  pushIf(getOne_(text, /\bProvider[:\s]*([A-Z][A-Za-zÀ-ÿ.'-]+(?:\s+[A-Z][A-Za-zÀ-ÿ.'-]+){0,3})\b(?!\s*(?:License|Lic\.|#|PMHNP|LCSW|NP|MD|DO|PA|APRN|RN|PhD|PsyD|DNP))/i));
  pushIf(getOne_(text, /\b(Clinician|Therapist)[:\s]*([A-Z][A-Za-zÀ-ÿ.'-]+(?:\s+[A-Z][A-Za-zÀ-ÿ.'-]+){0,3})/i, 2));
  pushIf(getOne_(text, /\b(?:Electronically\s+)?Signed by[:\s]*([A-Z][A-Za-zÀ-ÿ.'-]+(?:\s+[A-Z][A-Za-zÀ-ÿ.'-]+){0,3})\b/i));
  const prox = getOne_(text, /no[\-\s]?show[^.\n\r]{0,160}?\bwith\s+(?:provider\s+)?([A-Z][A-Za-zÀ-ÿ.'-]+(?:\s+[A-Z][A-Za-zÀ-ÿ.'-]+){0,3})/i);
  if (prox) candidates.unshift(prox);
  if (!candidates.length) {
    const m = text.match(/([A-Z][A-Za-zÀ-ÿ.'-]+\s+[A-Z][A-Za-zÀ-ÿ.'-]+)\s*,?\s*(PMHNP(?:-BC)?|FNP|AGNP|LCSW|LMHC|LICSW|LCPC|LPC|NP|APRN|RN|MD|DO|PA(?:-C)?|PhD|PsyD|DNP|MSN|MSW)\b/i);
    if (m) candidates.push(m[1]);
  }
  (function () {
    const t2 = normalize_(text || "");
    const lines = t2.split("\n").map((s) => (s || "").trim()).filter(Boolean);
    for (let i = 0; i < lines.length; i++) {
      if (!/^Provider\b[:\s]*$/i.test(lines[i]) && !/^Provider\s*[:\-]/i.test(lines[i])) continue;
      for (let j = i + 1; j < Math.min(lines.length, i + 10); j++) {
        const ln = lines[j];
        if (/^(DOB|Date of Birth|Client|Patient|Provider License|Appointment)\b/i.test(ln)) continue;
        if (/^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}$/.test(ln)) continue;
        if (/^Provider License\b/i.test(ln)) continue;
        const maybe = cleanProviderName_(ln);
        if (maybe) { candidates.unshift(maybe); return; }
      }
    }
  })();
  let name = (candidates[0] || "").trim();
  name = cleanProviderName_(name);
  if (isBadProviderLike_(name) || isBadNameHeader_(name)) return "";
  return name;
}

// Clinician name helper
function findClinicianName_(text) {
  const t = normalize_(text || "");

  // Pattern 1: "Clinician: Kirstie Crespo-Solomon" (same line, label first)
  let m = t.match(/\bClinician\b\s*[:\-]?\s*([A-Z][A-Za-zÀ-ÿ.'-]+(?:\s+[A-Z][A-Za-zÀ-ÿ.'-]+){1,3})\b/i);
  if (m) return cleanProviderName_(m[1]);

  // Pattern 2: "Clinician" then name on next line(s)
  // 🔧 FIX: Changed {1,2} to {1,3} so "KC Kirstie Crespo-Solomon" (3 tokens)
  // is fully captured. Previous limit of 2 would capture "KC Kirstie" only,
  // leaving "Crespo-Solomon" off, causing the entire name to fail validation.
  m = t.match(/\bClinician\b[\s\r\n]{1,20}([A-Z][A-Za-zÀ-ÿ.'-]+(?:\s+[A-Z][A-Za-zÀ-ÿ.'-]+){1,3})(?=\s*(?:\n|Location|Video|Office|Telehealth|In-Person|Remote|$))/i);
  if (m) return cleanProviderName_(m[1]);

  // 🔧 FIX — Pattern 3: Name appears on line BEFORE "Clinician" label
  // Orenda's late-cancel card layout puts name first, label second:
  //   [KC]                     ← avatar initials (own line — skipped)
  //   Kirstie Crespo-Solomon   ← actual name (no label)
  //   Clinician                ← label comes AFTER the name
  //   Location
  const lines = t.split(/\n+/).map(function(s){ return (s||"").trim(); }).filter(Boolean);
  for (var i = 0; i < lines.length; i++) {
    if (!/^Clinician\b/i.test(lines[i])) continue;
    // Search up to 3 lines BEFORE the "Clinician" label
    for (var j = i - 1; j >= Math.max(0, i - 3); j--) {
      var ln = lines[j];
      // Skip known non-name lines
      if (/^(Location|Video|Office|Telehealth|In-Person|Remote|All day|Add Note|New Note|Memo|Services|Notes)\b/i.test(ln)) continue;
      if (/^\d/.test(ln)) continue;                    // date/time lines
      if (/^[×xX✕]\s/i.test(ln)) continue;            // "× Late canceled"
      if (/^[A-Z]{1,3}$/.test(ln)) continue;          // pure initials line "KC"
      if (/(canceled|cancelled|no.?show|cancel)\b/i.test(ln)) continue;
      // Strip leading avatar initials if glued before the name on same line
      // e.g. "KC Kirstie Crespo-Solomon" → "Kirstie Crespo-Solomon"
      var stripped = ln.replace(/^[A-Z]{1,3}\s+(?=[A-Z][A-Za-zÀ-ÿ.'-]+\s+[A-Z][A-Za-zÀ-ÿ.'-]+)/, "").trim();
      var cand = cleanProviderName_(stripped);
      if (cand) return cand;
    }
  }

  return "";
}

function looksLikeLabel_(s) {
  if (!s) return true;
  const t = String(s).trim().toUpperCase();
  if (["NAME","SERVICE DATE FROM","CLIENT INFORMATION","CLAIM INFORMATION","STATUS"].includes(t)) return true;
  if (t.length <= 30 && !/\d/.test(t) && /^[A-Z _|]+$/.test(t)) return true;
  return false;
}

function toTitleCaseName_(s) {
  return String(s || "").toLowerCase().split(/\s+/).filter(Boolean).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

function stripParenthetical_(s) {
  return String(s || "").replace(/\([^)]*\)/g, " ").replace(/\s+/g, " ").trim();
}

function looksLikePersonName_(s) {
  const raw = String(s || "").trim();
  if (!raw) return false;
  const rawHasLower = /[a-z]/.test(raw);
  if (!rawHasLower && /^[A-Z\s.'()-]+$/.test(raw)) { s = toTitleCaseName_(raw); }
  if (isBadNameHeader_(raw)) return false;
  if (/\b(telemedicine|hipaa|secure location|billable service|consent)\b/i.test(raw)) return false;
  // Strip parenthetical nicknames for validation only
  const chk = stripParenthetical_(raw);
  const parts = chk.split(/\s+/).filter(Boolean);
  if (parts.length < 2 || parts.length > 4) return false;
  const token = "[A-Z][A-Za-zÀ-ÿ.'-]+";
  const particle = "(?:de|del|de la|da|di|van|von|la|le|du)";
  const re = new RegExp("^" + token + "(?:\\s+(?:" + token + "|" + particle + ")){0,2}\\s+" + token + "$");
  return re.test(chk);
}

function extractHeaderClientProvider_(rawText) {
  const t = normalize_(rawText || "");
  const lines = t.split(/\n+/).map((s) => (s || "").trim()).filter(Boolean);
  const head = lines.slice(0, 40);
  let client = "", provider = "", dob = "";
  for (let i = 0; i < head.length; i++) {
    const ln = head[i];
    if (!client && /^Client\b/i.test(ln)) {
      const v = ln.replace(/^Client\s*[:\-]?\s*/i, "").trim();
      const cand = cleanPatientName_(v);
      if (cand && looksLikePersonName_(cand)) client = cand;
      continue;
    }
    if (!provider && /^Provider\b/i.test(ln)) {
      const v = ln.replace(/^Provider\s*[:\-]?\s*/i, "").trim();
      const cand = cleanProviderName_(v);
      if (cand && looksLikePersonName_(cand)) provider = cand;
      continue;
    }
    if (!dob && /^(DOB|Date of Birth)\b/i.test(ln)) {
      const m = ln.match(/([01]\d\/[0-3]\d\/\d{4})/);
      if (m) dob = m[1];
    }
  }
  return { client, provider, dob };
}

function normalizeOcr_(raw) {
  return String(raw || "").replace(/[|_]+/g, " ").replace(/\s+/g, " ").trim();
}

function parseClaimPngFields_(rawText) {
  const t = normalizeOcr_(rawText);
  const get = (re) => { const m = t.match(re); return m ? m[1].trim() : ""; };
  const first = get(/FIRST\s*NAME\s*([A-Z][A-Z' -]{1,30})/i);
  const last = get(/LAST\s*NAME\s*([A-Z][A-Z' -]{1,30})/i);
  return {
    client_name: [first, last].filter(Boolean).join(" ").trim(),
    dob: get(/DATE\s*OF\s*BIRTH\s*([01]\d\/[0-3]\d\/\d{4})/i),
    city: get(/CITY\s*([A-Z][A-Z' -]{2,40})/i),
    state: get(/STATE\s*([A-Z][A-Z' -]{2,40})/i),
    customer: get(/CUSTOMER\s*NAME\s*([A-Z0-9][A-Z0-9&.,' -]{2,60})/i),
    service_date_from: get(/SERVICE\s*DATE\s*FROM\*?\s*([01]\d\/[0-3]\d\/\d{4})/i),
    service_date_to: get(/SERVICE\s*DATE\s*TO\*?\s*([01]\d\/[0-3]\d\/\d{4})/i),
    service_code: get(/SERVICE\s*CODE\s*(\d{4,6})/i),
    status: get(/STATUS\s*(DENIED|PAID|PENDING|REJECTED|APPROVED)/i),
    billed_amount: get(/BILLED\s*AMOUNT\s*([0-9]+\.[0-9]{2})/i),
    units: get(/NUMBER\s*OF\s*UNITS\s*([0-9]+(?:\.[0-9]+)?)/i),
    received_date: get(/RECEIVED\s*DATE\*?\s*([01]\d\/[0-3]\d\/\d{4})/i),
    claim_number: get(/CLAIM\s*#\s*(\d{6,})/i),
    reason: (function () { const m = t.match(/REASON\s*CODE\s*(.+?)(PAYMENT\s*NUMBER|PAYMENT\s*TOTAL|CLAIM\s*#|RECEIVED\s*DATE|$)/i); return m ? m[1].trim() : ""; })(),
  };
}

function getFieldValue_(rawText, currentPickedValue, fieldKey) {
  if (!looksLikeLabel_(currentPickedValue)) return currentPickedValue;
  const parsed = parseClaimPngFields_(rawText);
  const map = { Name: "client_name", "Service Date From": "service_date_from", "Service Date To": "service_date_to", "Service Code": "service_code", Status: "status", "Billed Amount": "billed_amount", "Number Of Units": "units", "Received Date": "received_date", "Claim #": "claim_number", "Reason Code": "reason" };
  const k = map[fieldKey];
  return k && parsed[k] ? parsed[k] : currentPickedValue;
}

function isClaimEobDoc_(t) {
  const hasClaimInfo = /\bclaim\s*information\b/i.test(t);
  const hasClientHints = /\bclient\s*information\b/i.test(t) || /\bdate\s*of\s*birth\b/i.test(t) || /\bdate\s*of\s*bi\b/i.test(t) || /\blast\s*name\b/i.test(t) || /\bbilled\s*amount\b/i.test(t) || /\bservice\s*code\b/i.test(t) || /\bclaim\s*#\b/i.test(t) || /\bstatus\b/i.test(t);
  return hasClaimInfo && hasClientHints;
}

function normalizeClaimOcr_(raw) {
  return String(raw || "").replace(/FILE\|\S+/gi, " ").replace(/[|_]+/g, " ").replace(/\s+/g, " ").trim();
}

function parseClaimEobFields_(txt) {
  const s = normalizeClaimOcr_(txt);
  const get = (re) => { const m = s.match(re); return m ? m[1].trim() : ""; };
  const first = get(/\b([A-Z][A-Z' -]{1,30})\s+last\s*name\b/i) || get(/first\s*name\s*([A-Z][A-Z' -]{1,30})/i);
  const last = get(/last\s*name\s*([A-Z][A-Z' -]{1,30})/i);
  const clientName = [first, last].filter(Boolean).join(" ").trim();
  const dob = get(/date\s*of\s*birth\s*([01]\d\/[0-3]\d\/\d{4})/i) || get(/date\s*of\s*bi(?:rth)?\s*([01]\d\/[0-3]\d\/\d{4})/i);
  const serviceDateFrom = get(/service\s*date\s*from\*?\s*([01]\d\/[0-3]\d\/\d{4})/i);
  const serviceDateTo = get(/service\s*date\s*to\*?\s*([01]\d\/[0-3]\d\/\d{4})/i);
  return {
    clientName, dob, state: get(/state\s*([A-Z][A-Z' -]{2,40})/i), customer: get(/customer\s*name\s*([A-Z0-9][A-Z0-9&.,' -]{2,80})/i),
    serviceDateFrom, serviceDateTo, serviceCode: get(/service\s*code\s*(\d{4,6})/i),
    status: get(/status\s*(denied|paid|pending|rejected|approved)/i), billedAmount: get(/billed\s*amount\s*([0-9]+\.[0-9]{2})/i),
    units: get(/number\s*of\s*units\s*([0-9]+(?:\.[0-9]+)?)/i), receivedDate: get(/received\s*date\*?\s*([01]\d\/[0-3]\d\/\d{4})/i),
    claimNumber: get(/claim\s*#\s*(\d{6,})/i),
    reason: (function () { const m = s.match(/reason\s*code\s*(.+?)(payment\s*number|payment\s*total|claim\s*#|received\s*date|$)/i); return m ? m[1].trim() : ""; })(),
  };
}

function isUSStateLike_(s) {
  const x = String(s || "").trim().toLowerCase();
  if (!x) return false;
  const states = new Set(["alabama","alaska","arizona","arkansas","california","colorado","connecticut","delaware","florida","georgia","hawaii","idaho","illinois","indiana","iowa","kansas","kentucky","louisiana","maine","maryland","massachusetts","michigan","minnesota","mississippi","missouri","montana","nebraska","nevada","new hampshire","new jersey","new mexico","new york","north carolina","north dakota","ohio","oklahoma","oregon","pennsylvania","rhode island","south carolina","south dakota","tennessee","texas","utah","vermont","virginia","washington","west virginia","wisconsin","wyoming","district of columbia","dc"]);
  return states.has(x);
}

function getValueAfterLabel_(text, labelRe, valueRe, maxLines) {
  maxLines = maxLines || 6;
  const t = normalize_(text || "");
  const lines = t.split("\n").map((s) => (s || "").trim());
  for (let i = 0; i < lines.length; i++) {
    if (!labelRe.test(lines[i])) continue;
    const sameLine = lines[i].match(valueRe);
    if (sameLine) return (sameLine[0] || "").trim();
    for (let j = i + 1; j < Math.min(lines.length, i + 1 + maxLines); j++) {
      const ln = lines[j];
      if (/^(DOB|Date of Birth|Provider|Provider License|Client|Patient|Appointment)\b[:\s]*$/i.test(ln)) continue;
      const m = ln.match(valueRe);
      if (m) return (m[0] || "").trim();
    }
  }
  return "";
}

function findProviderFromAppointmentInfoPanel_(text) {
  const panel = getCurrentAppointmentPanel_(text);
  if (!panel) return "";
  const lines = panel.split(/\n+/).map((s) => (s || "").trim()).filter(Boolean);
  for (let i = 0; i < lines.length; i++) {
    if (/\b\d{1,2}:\d{2}\s*[ap]m\s*[-–]\s*\d{1,2}:\d{2}\s*[ap]m\b/i.test(lines[i])) {
      for (let j = i + 1; j < Math.min(i + 6, lines.length); j++) {
        const cand = cleanProviderName_(lines[j]);
        if (cand) return cand;
      }
    }
  }
  return "";
}

function guessProviderFallback_(text, patientName) {
  const t = normalize_(text || "");
  const pat = (patientName || "").trim();
  const patLower = pat.toLowerCase();
  const nameMatches = t.match(/[A-Z][A-Za-zÀ-ÿ.'-]+\s+[A-Z][A-Za-zÀ-ÿ.'-]+/g) || [];
  const candidates = nameMatches.map(function (n) { return cleanProviderName_(n); }).filter(function (n) { return !!n; }).filter(function (n) { return !isBadProviderLike_(n) && !isBadNameHeader_(n); }).filter(function (n) {
    const lower = n.toLowerCase();
    if (pat && lower === patLower) return false;
    if (/\brecord\b/i.test(lower)) return false;
    if (/\borenda\b/i.test(lower)) return false;
    if (/\btelehealth\b/i.test(lower)) return false;
    return true;
  });
  if (!candidates.length) return "";
  if (candidates.length === 1) return candidates[0];
  for (let i = 0; i < candidates.length; i++) {
    const n = candidates[i];
    const idx = t.indexOf(n);
    if (idx === -1) continue;
    const window = t.slice(Math.max(0, idx - 80), idx + n.length + 80);
    if (/\bProvider\b/i.test(window)) return n;
  }
  return "";
}

function cleanPatientName_(name) {
  let n = (name || "").trim();
  n = n.replace(/\s+/g, " ").trim();
  if (!n) return "";
  
  // 🔧 FIX: Reject location keywords that OCR picks up as patient names
  // "Video Office", "Telehealth", "In-Person", "Remote", "Location"
  if (/^(Video Office|Telehealth|In-Person|Remote|Location|Office|Video)$/i.test(n)) return "";
  if (/^(Video Office|Telehealth)$/i.test(n)) return "";
  
  if (/^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)$/i.test(n)) return "";
  if (/^(January|February|March|April|May|June|July|August|September|October|November|December)$/i.test(n)) return "";
  if (isBadNameHeader_(n)) return "";
  if (/\b(progress\s+note|intake\s+note|follow[-\s]?up\s+note)\b/i.test(n)) return "";
  n = n.replace(/[\^_]{2,}/g, " ").trim();
  n = n.replace(/\bProvider\b.*$/i, " ").trim();
  n = n.replace(/\bProvider\s*:\s*.*$/i, " ").trim();
  n = n.replace(/\bPT\s*of\b.*$/i, " ").trim();
  n = n.replace(/\bPatient\s*of\b.*$/i, " ").trim();
  n = n.replace(/\b(adult|child|minor)\b[^\w]{0,3}\b/gi, " ");
  n = n.replace(/\b(adult|child|minor)[^\s]{0,12}\b/gi, " ");
  n = n.replace(/\b(active|inactive)[^\s]{0,6}\b/gi, " ");
  n = n.replace(/\b(no\s*show|late\s*cancel(?:led|ed|ation)?|cancel(?:led|ed|ation)?)\b/gi, " ");
  n = n.replace(/\b(appointment info|appointment details|details|treatment progress)\b/gi, " ");
  let parts = n.split(/\s+/).filter(Boolean);
  const last = parts[parts.length - 1] || "";
  if (/^(active|inactive|adult|child|minor)[a-z!]{0,6}$/i.test(last)) { parts.pop(); n = parts.join(" "); }
  n = n.replace(/\bminor\b/gi, " ");
  n = n.replace(/\bDOB\b.*$/i, "").trim();
  n = n.replace(/\bDate of Birth\b.*$/i, "").trim();
  if (/\bOwes\b/i.test(n)) return "";
  n = n.replace(/[,;]?\s*\$?\d.*$/, "").trim();
  n = n.replace(/[^A-Za-zÀ-ÿ.'-\s()]+$/g, "").trim();
  n = n.replace(/\s*\(\s*/g, " (").replace(/\s*\)\s*/g, ") ").replace(/\s+/g, " ").trim();
  n = n.replace(/\s+/g, " ").trim();
  if (/\b(denies|endorses|reports|states|presents|complains|says|sleep|appetite|mood|anxiety)\b/i.test(n)) return "";
  const hasLower = /[a-z]/.test(n);
  const isAllCapsWords = !hasLower && /^[A-Z\s.'-]+$/.test(n);
  if (isAllCapsWords) {
    const partsCaps = n.split(/\s+/).filter(Boolean);
    if (partsCaps.length >= 2 && partsCaps.length <= 4) { n = toTitleCaseName_(n); }
    else { return ""; }
  }
  if (/^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)$/i.test(n)) return "";
  if (/^(January|February|March|April|May|June|July|August|September|October|November|December)$/i.test(n)) return "";
  parts = n.split(/\s+/).filter(Boolean);
  if (parts.length >= 3) {
    const last2 = parts[parts.length - 1].toLowerCase();
    if (/^(active|inactive|adult|child)[a-z|!]{0,6}$/.test(last2)) { parts.pop(); n = parts.join(" "); }
  }
  if (isUSStateLike_(n)) return "";
  parts = n.split(/\s+/).filter(Boolean);
  if (parts.length < 2) return "";
  return n;
}

function getPatientName_(text) {
  const t = normalize_(text || "");
  const lines = t.split(/\n+/).map((s) => (s || "").trim()).filter(Boolean);
  const topLines = [];
  for (let i = 0; i < Math.min(lines.length, 20); i++) {
    const ln = lines[i];
    if (/^(Clinician|Provider|Therapist)\b/i.test(ln)) { i++; continue; }
    if (/^(Show|Edit|Show\s+Edit)\b/i.test(ln)) continue;
    if (/\b(appointment info|appointment details|treatment progress|details)\b/i.test(ln)) continue;
    topLines.push(ln);
    if (topLines.length >= 10) break;
  }
  const top = topLines.join("\n");
  const clinician = findClinicianName_(t);
  const clinicianLower = clinician ? clinician.toLowerCase() : "";
  function cleaned(v) { return cleanPatientName_(v || ""); }
  const rawCands = [
    getOne_(top, /^(?!Chief\s+Complaint\b)(?!Treatment\s+Plan\b)(?!Mental\s+Status\b)(?!Assessment\b)(?!Plan\b)(?!Documentation\b)([A-Z][A-Za-zÀ-ÿ.'-]+\s+[A-Z][A-Za-zÀ-ÿ.'-]+)\s*$/m),
    getOne_(top, /^([A-Z][A-Za-zÀ-ÿ.'-]+\s+[A-Z][A-Za-zÀ-ÿ.'-]+)\s+(adult|child)\s+(active|inactive)\b/im, 1),
    getOne_(top, /^([A-Z][A-Za-zÀ-ÿ.'-]+\s+[A-Z][A-Za-zÀ-ÿ.'-]+)\^\^/m),
    getOne_(top, /^([A-Z][A-Za-zÀ-ÿ.'-]+\s+[A-Z][A-Za-zÀ-ÿ.'-]+(?:\s+[A-Z][A-Za-zÀ-ÿ.'-]+)?)\s+(adult|child)\s+(active|inactive)[^\s]{0,6}\b/im, 1),
    getOne_(t, /(?:^|\n)\s*Client[:\s]*([^\n\r]+)\s*(?:\n|$)/i, 1),
    getOne_(t, /(?:^|\n)\s*Patient\s*:\s*([^\n\r]+)\s*(?:\n|$)/i, 1),
    getOne_(t, /Appointment details for\s+([A-Z][^\n,]+)\b/i),
    getOne_(t, /Appointment[:\s]+Individual appointment on\s+([A-Z][A-Za-zÀ-ÿ.'-]+(?:\s+[A-Za-zÀ-ÿ.'-]+){0,3})\b/i),
    getOne_(t, /Appointment(?: details)?[:\s]+[^\n]*?\bwith\s+([A-Z][A-Za-zÀ-ÿ.'-]+(?:\s+[A-Za-zÀ-ÿ.'-]+){0,3})\b/i),
    getOne_(t, /no[\-\s]?show[^.\n\r]{0,60}?\bfor\s+([A-Z][A-Za-zÀ-ÿ.'-]+(?:\s+[A-Za-zÀ-ÿ.'-]+){0,3})/i),
    getOne_(t, /\bAppt(?:\.|ointment)?\s+for\s+([A-Z][A-Za-zÀ-ÿ.'-]+(?:\s+[A-Za-zÀ-ÿ.'-]+){0,3})\b/i),
  ].filter(Boolean);
  const cands = rawCands.map(cleaned).filter(Boolean);
  const filtered = cands.filter(function (nm) { return !clinicianLower || nm.toLowerCase() !== clinicianLower; });
  function looksLikeName(nm) {
    if (!nm) return false;
    if (isBadNameHeader_(nm)) return false;
    const chk = stripParenthetical_(nm);
    return /^[A-Z][A-Za-zÀ-ÿ.'-]+(?:\s+[A-Za-zÀ-ÿ.'-]+){1,3}$/.test(chk);
  }
  for (let i = 0; i < filtered.length; i++) { const nm = filtered[i]; if (looksLikeName(nm)) return nm; }
  if (filtered.length) return filtered[0];
  if (cands.length) return cands[0];
  var fallbackLines = t.split(/\n+/).map(function (s) { return s.trim(); }).filter(function (s) { return !!s; }).filter(function (s) { return !/^(adult|child|active|inactive|no\s*show|show|canceled|cancelled)/i.test(s); }).filter(function (s) { return !/\bDOB\b/i.test(s); }).filter(function (s) { return !/\bOwes\b/i.test(s); }).filter(function (s) { return !/\bProvider\b/i.test(s); });
  for (let j = 0; j < Math.min(fallbackLines.length, 6); j++) {
    const line = cleaned(fallbackLines[j]);
    if (looksLikeName(line)) return line;
  }
  return "";
}

function findSessionDate_(text) {
  const t = normalize_(text || "");
  let m = t.match(/Appointment(?: details)?(?: for [^\n]*)?\s+on\s+([A-Za-z]{3,9}\s+\d{1,2},?\s+(?:20\d{2}|\d{2}))/i);
  if (m) return toMDY_(m[1]);
  m = t.match(/Appointment(?: details)?(?: for [^\n]*)?\s+on\s+(\d{1,2}[\/\-]\d{1,2}[\/\-](?:20\d{2}|\d{2}))/i);
  if (m) return toMDY_(m[1]);
  m = t.match(/\bSigned by\b[\s\S]{0,120}?\b(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{1,2},?\s*(20\d{2}|\d{2})\b/i);
  if (m) return toMDY_(m[0].match(/\b(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{1,2},?\s*(20\d{2}|\d{2})\b/i)[0]);
  const labeled = getOne_(t, /\b(Date of Session|Session Date|Appointment Date|When|Date of Service|Service Date|DOS)[:\s]*([A-Za-z]{3,9}\s+\d{1,2},?\s+(?:20\d{2}|\d{2}))\b/i, 2) || getOne_(t, /\b(Date of Session|Session Date|Appointment Date|When|Date of Service|Service Date|DOS)[:\s]*(\d{1,2}[\/\-]\d{1,2}[\/\-](?:20\d{2}|\d{2}))\b/i, 2);
  if (labeled) return toMDY_(labeled);
  const timeIdx = t.search(/\b\d{1,2}:\d{2}\s*[ap]m\s*[-–]\s*\d{1,2}:\d{2}\s*[ap]m\b/i);
  if (timeIdx !== -1) {
    const start = Math.max(0, timeIdx - 160);
    const end = Math.min(t.length, timeIdx + 40);
    const windowText = t.slice(start, end);
    let mmatch = windowText.match(/\b(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{1,2},?\s*(20\d{2}|\d{2})\b/i);
    if (mmatch && inYearRange_(normalizeYear_(mmatch[2]))) return toMDY_(mmatch[0]);
    mmatch = windowText.match(/\b(\d{1,2}[\/\-]\d{1,2}[\/\-](20\d{2}|\d{2}))\b/);
    if (mmatch && inYearRange_(normalizeYear_(mmatch[2]))) return toMDY_(mmatch[1]);
  }
  const scrubbed = t.replace(/(DOB|Date of Birth|Birthdate|Born)[:\s]*[A-Za-z]{3,9}\s+\d{1,2},?\s+\d{2,4}/gi, " ").replace(/(DOB|Date of Birth|Birthdate|Born)[:\s]*\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/gi, " ");
  let g = scrubbed.match(/\b(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{1,2},?\s*(20\d{2}|\d{2})\b/i);
  if (g && inYearRange_(normalizeYear_(g[2]))) return toMDY_(g[0]);
  g = scrubbed.match(/\b(\d{1,2}[\/\-]\d{1,2}[\/\-](20\d{2}|\d{2}))\b/);
  if (g && inYearRange_(normalizeYear_(g[2]))) return toMDY_(g[1]);
  return "";
}

function findDob_(rawText) {
  const t0 = String(rawText || "");
  const t = t0.replace(/[O]/g, "0").replace(/[Il]/g, "1").replace(/\u00A0/g, " ").replace(/[|]/g, "");
  const DATE_RE = /\b(0?[1-9]|1[0-2])\s*[\/\-\.\s]\s*(0?[1-9]|[12]\d|3[01])\s*[\/\-\.\s]\s*(\d{4})\b/;
  let m = t.match(/\b(?:DOB|Date of Birth)\b[^0-9]{0,30}((?:0?[1-9]|1[0-2])\s*[\/\-\.\s]\s*(?:0?[1-9]|[12]\d|3[01])\s*[\/\-\.\s]\s*\d{4})\b/i);
  if (m) return normalizeDate_(m[1]);
  const v = getValueAfterLabel_(t, /^(DOB|Date of Birth)\b/i, /((?:0?[1-9]|1[0-2])\s*[\/\-\.\s]\s*(?:0?[1-9]|[12]\d|3[01])\s*[\/\-\.\s]\s*\d{4})/i, 10);
  if (v) return normalizeDate_(v);
  const idx = t.search(/\b(DOB|Date of Birth)\b/i);
  if (idx !== -1) {
    const win = t.slice(idx, Math.min(t.length, idx + 500));
    const m2 = win.match(DATE_RE);
    if (m2) return normalizeDate_(m2[0]);
  }
  return "";
}

function normalizeDate_(s) {
  const cleaned = String(s || "").trim().replace(/[.\-\s]+/g, "/").replace(/\/+/g, "/");
  const parts = cleaned.split("/");
  if (parts.length !== 3) return cleaned;
  let [mm, dd, yyyy] = parts;
  mm = mm.padStart(2, "0"); dd = dd.padStart(2, "0");
  return `${mm}/${dd}/${yyyy}`;
}

function findPatientState_(text) {
  const t = normalize_(text || "");
  
  // Primary pattern: "What state is your patient located in?" followed by the state name
  let m = t.match(/What\s+state\s+is\s+your\s+patient\s+located\s+in\?[\s\r\n]*([A-Z][A-Za-z\s]{2,30}?)(?:\n|$)/i);
  if (m) {
    const state = m[1].trim();
    // Validate it's actually a state name (not a sentence continuation)
    if (state.split(/\s+/).length <= 3) {
      return state;
    }
  }
  
  // Secondary pattern: "Patient State:" or "State:" label
  m = t.match(/\b(?:Patient\s+)?State[:\s]+([A-Z][A-Za-z\s]{2,30}?)(?:\n|Please|What|$)/i);
  if (m) {
    const state = m[1].trim();
    if (state.split(/\s+/).length <= 3) {
      return state;
    }
  }
  
  // Tertiary pattern: Common in session notes - state mentioned near location question
  const lines = t.split(/\n+/).map(s => (s || "").trim()).filter(Boolean);
  for (let i = 0; i < lines.length; i++) {
    if (/What\s+state\s+is\s+your\s+patient\s+located/i.test(lines[i])) {
      // Check next 2 lines for a state name
      for (let j = i + 1; j < Math.min(i + 3, lines.length); j++) {
        const candidate = lines[j].trim();
        // Skip empty lines or lines that look like questions
        if (!candidate || /^(Please|What|Where|How|Why|When)\b/i.test(candidate)) continue;
        // Check if it looks like a state (1-3 words, starts with capital, no numbers)
        if (/^[A-Z][A-Za-z\s]{2,30}$/.test(candidate) && candidate.split(/\s+/).length <= 3) {
          return candidate;
        }
      }
    }
  }
  
  return "";
}

function findNoShowDateNear_(text) {
  const t = normalize_(text);
  const idx = t.search(/no[\-\s]?show/i);
  let windowText = "";
  if (idx > -1) { windowText = t.slice(Math.max(0, idx - 80), Math.min(t.length, idx + 400)); }
  const lines = t.split(/\n/);
  for (let i = 0; i < lines.length; i++) {
    if (/no[\-\s]?show/i.test(lines[i])) { windowText += " " + (lines[i + 1] || "") + " " + (lines[i + 2] || "") + " " + (lines[i + 3] || ""); break; }
  }
  let m = windowText.match(/\b(?:on|when|date|appointment date)[:\s]*([A-Za-z]{3,9}\s+\d{1,2},\s+(20\d{2}|\d{2}))\b/i);
  if (m) return toMDY_(m[1]);
  m = windowText.match(/\b(?:on|when|date|appointment date)[:\s]*(\d{1,2}[\/\-]\d{1,2}[\/\-](20\d{2}|\d{2}))\b/i);
  if (m) return toMDY_(m[1]);
  m = windowText.match(/\b(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{1,2},\s*(20\d{2}|\d{2})\b/i);
  if (m) return toMDY_(m[0]);
  m = windowText.match(/\b(\d{1,2}[\/\-]\d{1,2}[\/\-](20\d{2}|\d{2}))\b/);
  if (m) return toMDY_(m[0]);
  return "";
}

function findNoShowProviderNear_(text) {
  const t = normalize_(text);
  let m = t.match(/no[\-\s]?show[^.\n\r]{0,160}?\bwith\s+(?:provider\s+)?([A-Z][A-Za-zÀ-ÿ.'-]+(?:\s+[A-Z][A-Za-zÀ-ÿ.'-]+){0,3})/i);
  if (m) return m[1];
  m = t.match(/no[\-\s]?show[^.\n\r]{0,160}?\bwith\s+([A-Z][A-Za-zÀ-ÿ.'-]+)\s+([A-Z][A-Za-zÀ-ÿ.'-]+)/i);
  if (m) return (m[1] + " " + m[2]).trim();
  return "";
}

function inYearRange_(y) { return y >= 2015 && y <= 2035; }
function normalizeYear_(yy) { const n = parseInt(yy, 10); if (yy.length === 2) return 2000 + n; return n; }

function getOne_(text, re, groupIndex) {
  if (groupIndex == null) groupIndex = 1;
  const m = text.match(re);
  return m ? (m[groupIndex] || "").trim() : "";
}

function listFilesInFolderModifiedAfter_(folderId, modifiedAfterIso) {
  const out = [];
  let pageToken = null;
  let driveId = null;
  try {
    const folderMeta = Drive.Files.get(folderId, { fields: "id, driveId", supportsAllDrives: true });
    driveId = folderMeta && folderMeta.driveId ? folderMeta.driveId : null;
  } catch (e) {}
  const qParts = ["'" + folderId + "' in parents", "trashed = false", "(" + "mimeType = 'application/pdf' OR " + "mimeType = 'image/png' OR " + "mimeType = 'image/jpeg' OR " + "mimeType = 'image/jpg' OR " + "mimeType = 'image/webp'" + ")"];
  if (modifiedAfterIso) qParts.push("modifiedDate > '" + modifiedAfterIso + "'");
  const q = qParts.join(" and ");
  do {
    const params = { q: q, fields: "nextPageToken, items(id, title, mimeType, modifiedDate)", maxResults: 200, supportsAllDrives: true, includeItemsFromAllDrives: true, pageToken: pageToken };
    if (driveId) { params.corpora = "drive"; params.driveId = driveId; }
    const res = Drive.Files.list(params);
    (res.items || []).forEach(function (f) { out.push({ id: f.id, title: f.title || "", mimeType: f.mimeType, modifiedTime: f.modifiedDate }); });
    pageToken = res.nextPageToken;
  } while (pageToken);
  out.sort(function (a, b) { return String(a.modifiedTime).localeCompare(String(b.modifiedTime)); });
  return out;
}

function isBadNameHeader_(s) {
  const x = String(s || "").trim().toLowerCase();
  if (!x) return true;
  const bad = ["chief complaint","history present","history of","present illness","review of","mental status","assessment","treatment plan","plan","documentation","billing code","billing codes","cpt codes","icd","icd-10","diagnosis","psychiatric assessment","time spent","session location","appointment details","appointment info","treatment progress","progress note","intake note","follow-up note","follow up note","codes created","cardiac history","of med","temporary coverage psychiatry note","temporary coverage","free text note","mgnt only","medication management","location video","psychiatry note"];
  if (bad.includes(x)) return true;
  if (/(chief\s+complaint|psychiatric\s+assessment|mental\s+status|treatment\s+plan|cpt\s+codes?|icd(?:-?\s*10)?|documentation|assessment|plan|progress\s+note|intake\s+note|follow[-\s]?up\s+note|review\s+of|cardiac\s+history|history\s+of|codes?\s+created|session\s+location|time\s+spent|appointment\s+(details|info)|treatment\s+progress|of\s+med|temporary\s+coverage(?:\s+psychiatry\s+note)?|psychiatry\s+note|free\s*text\s*note|mgnt\s*only|medication\s*management|location\s*video)/i.test(x)) return true;
  return false;
}

function isBadProviderLike_(s) {
  const x = String(s || "").trim().toLowerCase();
  if (!x) return true;
  const badPhrases = ["codes created","review of","cardiac history","history of","of med","treatment progress","appointment details","appointment info","chief complaint","psychiatric assessment","documentation","assessment","plan","time spent","session location","if approved","approved","approval","not approved","temporary coverage psychiatry note","temporary coverage","free text note","mgnt only","medication management","location video","psychiatry note"];
  if (badPhrases.includes(x)) return true;
  if (/(review\s+of|cardiac\s+history|history\s+of|of\s+med|codes?\s+created|treatment\s+progress|appointment\s+(details|info)|chief\s+complaint|psychiatric\s+assessment|documentation|assessment|plan|time\s+spent|session\s+location|temporary\s+coverage(?:\s+psychiatry\s+note)?|psychiatry\s+note|if\s+approved|approved|approval|not\s+approved|free\s*text\s*note|mgnt\s*only|medication\s*management|location\s*video)/i.test(x)) return true;
  return false;
}

function classifyApptType_(text, cptListStr) {
  const t = text || "";
  const lower = t.toLowerCase();
  const cpts = (cptListStr || "").split(",").map(function (s) { return s.trim(); });
  const hasIntakeCpt = cpts.some(function (c) { return /^9079[12]$/.test(c) || /^9920[2-5]$/.test(c); });
  const hasFollowCpt = cpts.some(function (c) { return /^9921[3-5]$/.test(c); });
  const hasBillingIntake = /billing\s*code[:\s-]*.*\bintake\b/i.test(t) || /\bpsychiatric diagnostic intake\b/i.test(t);
  const hasIntakeWords = /\b(intake|initial evaluation|initial visit|new patient)\b/i.test(t);
  const hasIntakeSignal = hasBillingIntake || hasIntakeWords || hasIntakeCpt;
  const hasFollowWords = /\bfollow[-\s]?up\b/i.test(t) || /\bfollowup\b/i.test(lower) || /\bfu visit\b/i.test(lower) || /\bf\/u\b/i.test(lower);
  const hasFollowSignal = hasFollowWords || hasFollowCpt;
  if (hasIntakeSignal && !hasFollowSignal) return "Intake";
  if (!hasIntakeSignal && hasFollowSignal) return "Follow-up";
  if (hasIntakeSignal && hasFollowSignal) {
    if (hasIntakeCpt && !hasFollowCpt) return "Intake";
    if (hasFollowCpt && !hasIntakeCpt) return "Follow-up";
    if (hasBillingIntake) return "Intake";
    return "Intake";
  }
  if (hasIntakeCpt && !hasFollowCpt) return "Intake";
  if (hasFollowCpt && !hasIntakeCpt) return "Follow-up";
  return "Follow-up";
}

function buildTrackingNote_(record, apptKey) {
  if (apptKey) return "";
  const prov = String(record["Provider Name"] || "").trim();
  const pat = String(record["Patient Name"] || "").trim();
  const dos = String(record["Date of Session"] || "").trim();
  const tm = String(record["Start Time"] || "").trim();
  return "⚠️ Missing AppointmentKey piece(s). Captured fields: Provider=" + (prov || "[blank]") + " | Patient=" + (pat || "[blank]") + " | DOS=" + (dos || "[blank]") + " | Start=" + (tm || "[blank]");
}

function resetProcessed_ThisBiller() {
  assertProdOnly_();
  const cfg = getActiveConfig_();
  const store = PropertiesService.getScriptProperties();
  store.deleteProperty("processed_" + cfg.name);
  store.deleteProperty("lastScan_" + cfg.name);
  SpreadsheetApp.getActive().toast("Reset processed state for: " + cfg.name);
}

function reprocessNewState_ThisBiller() {
  assertProdOnly_();
  const cfg = getActiveConfig_();
  const store = PropertiesService.getScriptProperties();
  const processedKey = "processed_" + cfg.name;
  const processed = JSON.parse(store.getProperty(processedKey) || "{}");
  let removed = 0;
  Object.keys(processed).forEach(function (fileId) {
    if (processed[fileId] && processed[fileId].status === "ok") { delete processed[fileId]; removed++; }
  });
  store.setProperty(processedKey, JSON.stringify(processed));
  SpreadsheetApp.getActive().toast("✅ Reprocess NEW state enabled for " + cfg.name + " — cleared " + removed + " processed OK file(s).", "Session Report", 8);
}

function toInitials_(name) {
  return name.replace(/[^A-Za-zÀ-ÿ ]/g, "").trim().split(/\s+/).filter(function (x) { return !!x; }).map(function (s) { return s[0]; }).join("").toUpperCase();
}

function formatCptForTimecard_(cptStr) {
  const codes = orderCptCodes_((cptStr || "").split(",").map(function (s) { return s.trim(); }));
  if (!codes.length) return "";
  if (codes.length === 1) return codes[0];
  return codes.join("+");
}

function computeTimecardApptType_(apptType, timecardCptFormat) {
  if ((timecardCptFormat || "") === MISSING_LABEL) return "";
  const t = (apptType || "").toLowerCase();
  if (t === "intake") return "NEW";
  if (t === "follow-up" || t === "follow up") return "EXISTING";
  return "";
}

function splitCptIntoTwoForSheet_(cptStr) {
  const raw = (cptStr || "").trim();
  if (!raw) return { code1: "", code2: "", extraCount: 0 };
  const upper = raw.toUpperCase();
  if (upper === "NO SHOW" || upper === "NO NOTE") return { code1: "", code2: "", extraCount: 0 };
  const ordered = orderCptCodes_(raw.split(",").map(function (s) { return s.trim(); }));
  return { code1: ordered[0] || "", code2: ordered[1] || "", extraCount: Math.max(0, ordered.length - 2) };
}

function extractMinutes_(text, re) {
  const m = text.match(re);
  if (!m) return null;
  const n = parseInt(m[1], 10);
  return isFinite(n) ? n : null;
}

function extractPairMinutes_(text, re, groupIndex) {
  const m = text.match(re);
  if (!m) return null;
  const n = parseInt(m[groupIndex], 10);
  return isFinite(n) ? n : null;
}

function extractLabeledMinutes_(text, labelRe) {
  const idx = text.search(labelRe);
  if (idx === -1) return null;
  const slice = text.slice(idx, idx + 2000);
  let m = slice.match(/(?:\.\:|:|—|-)\s*([0-9]{1,3})\s*(?:min|mins|minutes)\b/i);
  if (m) return toIntSafe_(m[1]);
  m = slice.match(/\b([0-9]{1,3})\s*(?:min|mins|minutes)\b/i);
  if (m) return toIntSafe_(m[1]);
  return null;
}

function toIntSafe_(x) {
  const n = parseInt(String(x).replace(/[^\d]/g, ""), 10);
  if (!isFinite(n)) return null;
  if (n < 0 || n > 300) return null;
  return n;
}

function coalesceMinutes_(vals) {
  for (let i = 0; i < vals.length; i++) { if (vals[i] != null) return vals[i]; }
  return null;
}

function normalize_(s) {
  return (s || "").replace(/['']/g, "'").replace(/\u00A0/g, " ").replace(/[ \t]+/g, " ").replace(/\r/g, "").trim();
}

function toMDY_(input) {
  const numRe = /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2}|\d{4})$/;
  let m = input.match(numRe);
  if (m) {
    const mm = String(parseInt(m[1], 10)).padStart(2, "0");
    const dd = String(parseInt(m[2], 10)).padStart(2, "0");
    let yy = m[3]; let yyyy;
    if (yy.length === 2) { yyyy = 2000 + parseInt(yy, 10); } else { yyyy = parseInt(yy, 10); }
    return mm + "/" + dd + "/" + yyyy;
  }
  const months = { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, sept: 9, oct: 10, nov: 11, dec: 12 };
  m = input.match(/(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+(\d{1,2}),?\s*(20\d{2}|\d{2})/i);
  if (!m) return input;
  const monKey = m[1].toLowerCase().slice(0, 3);
  const mm2 = String(months[monKey]).padStart(2, "0");
  const dd2 = String(parseInt(m[2], 10)).padStart(2, "0");
  let year = m[3]; let yyyy2;
  if (year.length === 2) { yyyy2 = 2000 + parseInt(year, 10); } else { yyyy2 = parseInt(year, 10); }
  return mm2 + "/" + dd2 + "/" + yyyy2;
}

function grabBlock_(text, startRe, endRe) {
  const s = text.search(startRe);
  if (s === -1) return "";
  const from = text.slice(s);
  const e = from.search(endRe);
  return e === -1 ? from : from.slice(0, e);
}

function getCurrentAppointmentPanel_(text) {
  const t = normalize_(text || "");
  const startRe = /(Appointment\s+details|Appointment\s+info|Appointment\s+Details|Treatment\s+Progress)/i;
  const endRe = /(DOCUMENTATION|Psychiatric Assessment|Progress Note|Intake Note|Follow[-\s]?up Note|Chief Complaint|Assessment|Plan|ICD|CPT Codes|Billing code)/i;
  const startIdx = t.search(startRe);
  if (startIdx === -1) {
    const lines = t.split("\n").map((s) => (s || "").trim());
    const top = lines.slice(0, 40).join("\n");
    if (/\bClinician\b/i.test(top) && /\bLocation\b/i.test(top)) return top;
    return "";
  }
  const slice = t.slice(startIdx);
  const endIdx = slice.search(endRe);
  const panel = endIdx === -1 ? slice.slice(0, 1200) : slice.slice(0, endIdx);
  return panel.trim();
}

function isNoShowText_(text) {
  const t = String(text || "");
  return /\bno[\s\-–—]?show\b/i.test(t) || /\bnoshow\b/i.test(t);
}

function isLateCancelText_(text) {
  const t = String(text || "");
  return /\blate[\s\-–—]?(?:cancel(?:led|ed|lation)?|cncl)\b/i.test(t);
}

function looksLikeNoShowAttestation_(t) {
  const s = String(t || "");
  if (/\b(no[-\s]?show)\s+(attestation|affidavit)\b/i.test(s)) return true;
  if (/\b(provider|client)\s+no[-\s]?show\s+attestation\b/i.test(s)) return true;
  if (/\b(no[-\s]?show)\b/i.test(s) && /\b(waive|charge|no charge|fee waived|bill patient|provider decision)\b/i.test(s)) return true;
  return false;
}

function noShowAppearsInHeaderArea_(t) {
  const lines = String(t || "").split(/\n+/).slice(0, 35).join("\n");
  return /\bno[-\s]?show\b/i.test(lines);
}

function lateCancelAppearsInHeaderArea_(t) {
  const lines = String(t || "").split(/\n+/).slice(0, 35).join("\n");
  return /\blate\s*cancel(?:led|ation)?\b/i.test(lines) || /\blate\s*cncl\b/i.test(lines);
}

function detectNoNoteScreen_(text) {
  const t = normalize_(text || "");
  const looksLikeApptCard = /\bClinician\b/i.test(t) && /\bLocation\b/i.test(t);
  if (!looksLikeApptCard) return false;
  const signed = /\b(electronically\s*)?signed by\b/i.test(t) || /\bsignature on file\b/i.test(t);
  const locked = /\blocked\b/i.test(t) || /\bfinalized\b/i.test(t) || /\bfinalized and locked\b/i.test(t);
  if (signed && locked) return false;
  const hasAddNote = /\bAdd Note\b/i.test(t) || /\bNew Note\b/i.test(t);
  const hasDiagnosisFields = /\bDiagnosis\b/i.test(t) || /\bICD\b/i.test(t) || /\bCPT\b/i.test(t);
  return hasAddNote && !hasDiagnosisFields;
}

function fixNoShowVerdictColumns_ThisSheet() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const last = sheet.getLastRow();
  if (last < FIRST_DATA_ROW) return;
  const numRows = last - FIRST_DATA_ROW + 1;
  const tcCol = COL_INDEX["TimeCard CPT Format"];
  const kCol = COL_INDEX["Missing Notes Audit Status"];
  const nCol = COL_INDEX["No Show/Late Cancellation Action"];
  const tcVals = sheet.getRange(FIRST_DATA_ROW, tcCol, numRows, 1).getValues();
  const kVals = sheet.getRange(FIRST_DATA_ROW, kCol, numRows, 1).getValues();
  const nVals = sheet.getRange(FIRST_DATA_ROW, nCol, numRows, 1).getValues();
  let changed = 0;
  for (let i = 0; i < numRows; i++) {
    const tc = String(tcVals[i][0] || "").trim().toUpperCase();
    const n = String(nVals[i][0] || "").trim();
    const k = String(kVals[i][0] || "").trim();
    const isDnsRow = tc === "NO SHOW" || tc === "LATE CANCEL";
    if (isDnsRow && (n === "Charge" || n === "Waive") && k) { kVals[i][0] = ""; changed++; }
    if (isDnsRow && (k === "Charge" || k === "Waive") && !n) { nVals[i][0] = k; kVals[i][0] = ""; changed++; }
  }
  sheet.getRange(FIRST_DATA_ROW, kCol, numRows, 1).setValues(kVals);
  sheet.getRange(FIRST_DATA_ROW, nCol, numRows, 1).setValues(nVals);
  SpreadsheetApp.getActive().toast("Fixed verdict placement on " + changed + " row(s).");
}

function dedupeList_(arr) {
  const out = []; const seen = new Set();
  for (let i = 0; i < arr.length; i++) {
    const x = arr[i] || ""; const k = x.toLowerCase();
    if (k && !seen.has(k)) { seen.add(k); out.push(x); }
  }
  return out;
}

function cptPriority_(code) {
  const core = (code || "").split("-")[0].trim();
  if (/^992\d{2}$/.test(core)) return 1;
  if (/^908\d{2}$/.test(core)) return 2;
  return 3;
}

function orderCptCodes_(codes) {
  return (codes || []).map(function (s) { return (s || "").trim(); }).filter(function (s) { return !!s; }).sort(function (a, b) {
    const pa = cptPriority_(a); const pb = cptPriority_(b);
    if (pa !== pb) return pa - pb;
    return a.localeCompare(b);
  });
}

function normalizeKeyDate_(mdy) {
  const m = String(mdy || "").match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!m) return "";
  const mm = String(parseInt(m[1], 10)).padStart(2, "0");
  const dd = String(parseInt(m[2], 10)).padStart(2, "0");
  return m[3] + "-" + mm + "-" + dd;
}

function normalizeName_(s) {
  return String(s || "").toUpperCase().replace(/[^A-Z0-9\s]/g, "").trim().replace(/\s+/g, " ");
}

function patientLastFirst_(fullName) {
  const n = normalizeName_(fullName);
  const parts = n.split(" ").filter(Boolean);
  if (parts.length < 2) return n.replace(/\s+/g, "_");
  return parts[parts.length - 1] + "_" + parts[0];
}

function normalizeTime24_(t) {
  const m = String(t || "").match(/^(\d{1,2}):(\d{2})\s*([AP]M)$/i);
  if (!m) return "";
  let hh = parseInt(m[1], 10); const mm = m[2]; const ap = m[3].toUpperCase();
  if (ap === "PM" && hh !== 12) hh += 12;
  if (ap === "AM" && hh === 12) hh = 0;
  return `${String(hh).padStart(2, "0")}:${mm}`;
}

function buildAppointmentKey_(dateMDY, providerName, patientName, startTime, fileId) {
  const d = normalizeKeyDate_(dateMDY);
  let provNameClean = cleanProviderName_(providerName);
  if (isBadProviderLike_(provNameClean) || isBadNameHeader_(provNameClean)) provNameClean = "";
  const prov = normalizeName_(provNameClean);
  const patRaw = patientLastFirst_(patientName);
  const pat = patRaw ? patRaw : "NA";
  if (d && prov) return d + "|" + prov + "|" + pat;
  const fid = String(fileId || "").trim();
  if (fid) return "FILE|" + fid;
  return "FILE|UNKNOWN|" + Date.now();
}

function buildKeyIndex_(sheet) {
  const keyCol = COL_INDEX["AppointmentKey"];
  const runCol = COL_INDEX["Run Attempt"];
  const finalCol = COL_INDEX["Final Row Flag"];
  const last = sheet.getLastRow();
  const startRow = FIRST_DATA_ROW;
  if (last < startRow) return {};
  const numRows = last - startRow + 1;
  const keys = sheet.getRange(startRow, keyCol, numRows, 1).getValues();
  const runs = sheet.getRange(startRow, runCol, numRows, 1).getValues();
  const finals = sheet.getRange(startRow, finalCol, numRows, 1).getValues();
  const index = {};
  for (let i = 0; i < numRows; i++) {
    const k = String(keys[i][0] || "").trim();
    if (!k) continue;
    const rRaw = runs[i][0];
    const rNum = parseInt(String(rRaw || "").replace(/[^\d]/g, ""), 10);
    const runN = isFinite(rNum) ? rNum : 0;
    const isFinal = String(finals[i][0] || "").toLowerCase() === "true" || finals[i][0] === true;
    if (!index[k]) index[k] = { maxRun: 0, finalRow: 0 };
    if (runN > index[k].maxRun) index[k].maxRun = runN;
    if (isFinal) index[k].finalRow = startRow + i;
  }
  return index;
}

function markPreviousFinalFalse_(sheet, finalRow) {
  if (!finalRow) return;
  const finalCol = COL_INDEX["Final Row Flag"];
  sheet.getRange(finalRow, finalCol).setValue(false);
}