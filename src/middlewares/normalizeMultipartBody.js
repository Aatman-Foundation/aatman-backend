// middlewares/normalizeMultipartBody.js
export function normalizeMultipartBody(req, _res, next) {
  try {
    // Ensure req and req.body exist
    if (!req) return next();
    if (req.body == null || typeof req.body !== "object") req.body = {};
    const body = req.body;

    // Helper: safe JSON parse (for cases where you send JSON strings in form-data)
    const maybeParseJSON = (v) => {
      if (typeof v !== "string") return v;
      const s = v.trim();
      if (!(s.startsWith("{") || s.startsWith("["))) return v;
      try { return JSON.parse(s); } catch { return v; }
    };

    // Start with a shallow clone (guard against null)
    const out = { ...(body || {}) };

    // ---- researchInterests ----
    // Accept either indexed keys researchInterests[0], [1] ... OR a JSON string/array.
    let ri = [];
    // 1) Collect indexed keys
    for (const k of Object.keys(body || {})) {
      const m = /^researchInterests\[(\d+)\]$/.exec(k);
      if (m) ri[Number(m[1])] = body[k];
    }
    // 2) If plain "researchInterests" exists, allow JSON string or array
    if ("researchInterests" in body) {
      const v = maybeParseJSON(body.researchInterests);
      if (Array.isArray(v)) ri = v;
      else if (typeof v === "string" && v) ri = [v];
    }
    if (ri.length) out.researchInterests = ri.filter(v => v != null && v !== "");

    // ---- previousExperience ---- (array of objects)
    // Accept indexed object fields or a JSON array string
    let pe = [];
    // JSON array path
    if ("previousExperience" in body) {
      const v = maybeParseJSON(body.previousExperience);
      if (Array.isArray(v)) pe = v;
    }
    // Indexed fields path
    const peMap = {};
    for (const k of Object.keys(body || {})) {
      const m = /^previousExperience\[(\d+)\]\.(\w+)$/.exec(k);
      if (m) {
        const idx = Number(m[1]);
        const field = m[2];
        (peMap[idx] ||= {})[field] = body[k];
      }
    }
    if (Object.keys(peMap).length) {
      pe = Object.keys(peMap).map(Number).sort((a,b)=>a-b).map(i => peMap[i]);
    }
    if (pe.length) out.previousExperience = pe;

    // ---- publicationDetails ---- (array of objects)
    let pubs = [];
    if ("publicationDetails" in body) {
      const v = maybeParseJSON(body.publicationDetails);
      if (Array.isArray(v)) pubs = v;
    }
    const pubsMap = {};
    for (const k of Object.keys(body || {})) {
      const m = /^publicationDetails\[(\d+)\]\.(\w+)$/.exec(k);
      if (m) {
        const idx = Number(m[1]);
        const field = m[2];
        (pubsMap[idx] ||= {})[field] = body[k];
      }
    }
    if (Object.keys(pubsMap).length) {
      pubs = Object.keys(pubsMap).map(Number).sort((a,b)=>a-b).map(i => pubsMap[i]);
    }
    if (pubs.length) out.publicationDetails = pubs;

    // ---- traningDetails (note spelling in your schema) ----
    let tr = [];
    if ("traningDetails" in body) {
      const v = maybeParseJSON(body.traningDetails);
      if (Array.isArray(v)) tr = v;
    }
    const trMap = {};
    for (const k of Object.keys(body || {})) {
      const m = /^traningDetails\[(\d+)\]\.(\w+)$/.exec(k);
      if (m) {
        const idx = Number(m[1]);
        const field = m[2];
        (trMap[idx] ||= {})[field] = body[k];
      }
    }
    if (Object.keys(trMap).length) {
      tr = Object.keys(trMap).map(Number).sort((a,b)=>a-b).map(i => trMap[i]);
    }
    if (tr.length) out.traningDetails = tr;

    // ---- specializationAreas inside practiceDetails ----
    // Support practiceDetails.specializationAreas[0] or a JSON array string
    if (!out.practiceDetails && body.practiceDetails) {
      // If someone sent a JSON string for the whole object
      const v = maybeParseJSON(body.practiceDetails);
      if (v && typeof v === "object") out.practiceDetails = v;
    }
    out.practiceDetails = out.practiceDetails || {};
    const sa = [];
    for (const k of Object.keys(body || {})) {
      const m = /^practiceDetails\.specializationAreas\[(\d+)\]$/.exec(k);
      if (m) sa[Number(m[1])] = body[k];
    }
    if ("practiceDetails.specializationAreas" in body) {
      const v = maybeParseJSON(body["practiceDetails.specializationAreas"]);
      if (Array.isArray(v)) v.forEach(x => sa.push(x));
    }
    if (sa.length) out.practiceDetails.specializationAreas = sa.filter(Boolean);

    // ---- Booleans (consent) ----
    const toBool = (v) => {
      if (typeof v === "boolean") return v;
      const s = String(v).toLowerCase();
      return s === "true" || s === "on" || s === "1";
    };
    ["consent_infoTrueAndCorrect","consent_authorizeDataUse","consent_agreeToNotifications"]
      .forEach(k => { if (k in out) out[k] = toBool(out[k]); });

    // ---- Dates (coerce simple top-level and nested) ----
    const toDate = (v) => (typeof v === "string" ? new Date(v) : v);

    if (out.dateOfBirth) out.dateOfBirth = toDate(out.dateOfBirth);

    if (out.regulatoryDetails && typeof out.regulatoryDetails === "object") {
      const r = out.regulatoryDetails;
      if (r.registrationDate) r.registrationDate = toDate(r.registrationDate);
      if (r.regulatoryValidityUntil) r.regulatoryValidityUntil = toDate(r.regulatoryValidityUntil);
    }

    if (Array.isArray(out.previousExperience)) {
      out.previousExperience = out.previousExperience.map(e => ({
        ...e,
        startDate: e?.startDate ? toDate(e.startDate) : e?.startDate,
        endDate: e?.endDate ? toDate(e.endDate) : e?.endDate,
      }));
    }

    if (Array.isArray(out.traningDetails)) {
      out.traningDetails = out.traningDetails.map(e => ({
        ...e,
        trainingStartDate: e?.trainingStartDate ? toDate(e.trainingStartDate) : e?.trainingStartDate,
        trainingEndDate: e?.trainingEndDate ? toDate(e.trainingEndDate) : e?.trainingEndDate,
      }));
    }

    // ---- Permanent address support (dot notation OR JSON string) ----
    if (!out.permanentAddress) {
      // assemble from dot-notation if present
      const pa = {};
      for (const k of Object.keys(body || {})) {
        const m = /^permanentAddress\.(\w+)$/.exec(k);
        if (m) pa[m[1]] = body[k];
      }
      if (Object.keys(pa).length) out.permanentAddress = pa;
    } else if (typeof out.permanentAddress === "string") {
      const v = maybeParseJSON(out.permanentAddress);
      if (v && typeof v === "object") out.permanentAddress = v;
    }

    req.body = out;
    return next();
  } catch (err) {
    // Don’t crash the request; pass error to your handler
    return next(err);
  }
}