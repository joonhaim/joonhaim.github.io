(() => {
  const procedureFinder = document.getElementById("procedure-finder");
  if (!procedureFinder) return;

  const qualityScriptUrl = document.currentScript?.src || window.location.href;
  const locale = ["en", "de", "fr", "it"].includes(
    document.documentElement.lang,
  )
    ? document.documentElement.lang
    : "en";
  const copy = {
    en: {
      procedures: "Case volumes 2023",
      quality: "Quality indicators 2024",
      eyebrow: "CH-IQI QUALITY INDICATORS",
      title: "Explore clinical quality indicators",
      body: "Compare observed and expected mortality outcomes for official 2024 CH-IQI quality indicators. Results require clinical context and should not be interpreted as a simple hospital ranking.",
      step: "Step 1",
      choose: "Select a mortality indicator",
      help: "Search the catalogue by indicator name or CH-IQI code.",
      search: "Find an indicator",
      placeholder: "Search by name or code",
      loading: "Loading quality indicators…",
      results: "Results",
      cases: "Cases",
      observed: "Observed mortality",
      expected: "Expected mortality",
      smr: "SMR",
      historical: "2019–2023",
      current: "2024",
      filter: "Search hospital",
      filterPlaceholder: "Type to filter hospitals",
      select: "Select an indicator to compare hospitals.",
      noIndicators: "No indicators match your search.",
      noRows: "No hospitals match your search.",
      hospitals: "hospitals",
      warning:
        "Mortality indicators should be interpreted with caution: patient mix, transfers, specialization, and low case volumes can influence the results.",
      all: "All indicators",
      legend: ["PD = principal diagnosis", "SD = secondary diagnosis"],
    },
    de: {
      procedures: "Fallzahlen 2023",
      quality: "Qualitätsindikatoren 2024",
      eyebrow: "CH-IQI QUALITÄTSINDIKATOREN",
      title: "Klinische Qualitätsindikatoren erkunden",
      body: "Vergleichen Sie beobachtete und erwartete Mortalitätsergebnisse der offiziellen CH-IQI-Qualitätsindikatoren 2024. Die Ergebnisse erfordern klinischen Kontext und sollten nicht als einfaches Spitalranking interpretiert werden.",
      step: "Schritt 1",
      choose: "Mortalitätsindikator auswählen",
      help: "Durchsuchen Sie den Katalog nach Indikatorname oder CH-IQI-Code.",
      search: "Indikator suchen",
      placeholder: "Nach Name oder Code suchen",
      loading: "Qualitätsindikatoren werden geladen…",
      results: "Ergebnisse",
      cases: "Fälle",
      observed: "Beobachtete Mortalität",
      expected: "Erwartete Mortalität",
      smr: "SMR",
      historical: "2019–2023",
      current: "2024",
      filter: "Spital suchen",
      filterPlaceholder: "Spitäler filtern",
      select: "Wählen Sie einen Indikator, um Spitäler zu vergleichen.",
      noIndicators: "Keine Indikatoren entsprechen Ihrer Suche.",
      noRows: "Keine Spitäler entsprechen Ihrer Suche.",
      hospitals: "Spitäler",
      warning:
        "Mortalitätsindikatoren müssen mit Vorsicht interpretiert werden: Patientenstruktur, Verlegungen, Spezialisierung und geringe Fallzahlen können die Ergebnisse beeinflussen.",
      all: "Alle Indikatoren",
    },
    fr: {
      procedures: "Nombre de cas 2023",
      quality: "Indicateurs de qualité 2024",
      eyebrow: "INDICATEURS DE QUALITÉ CH-IQI",
      title: "Explorer les indicateurs de qualité clinique",
      body: "Comparez les résultats de mortalité observés et attendus pour les indicateurs de qualité CH-IQI 2024 officiels. Ces résultats nécessitent un contexte clinique et ne doivent pas être interprétés comme un simple classement des hôpitaux.",
      step: "Étape 1",
      choose: "Sélectionner un indicateur de mortalité",
      help: "Recherchez dans le catalogue par nom d’indicateur ou code CH-IQI.",
      search: "Rechercher un indicateur",
      placeholder: "Rechercher par nom ou code",
      loading: "Chargement des indicateurs de qualité…",
      results: "Résultats",
      cases: "Cas",
      observed: "Mortalité observée",
      expected: "Mortalité attendue",
      smr: "SMR",
      historical: "2019–2023",
      current: "2024",
      filter: "Rechercher un hôpital",
      filterPlaceholder: "Filtrer les hôpitaux",
      select: "Sélectionnez un indicateur pour comparer les hôpitaux.",
      noIndicators: "Aucun indicateur ne correspond à votre recherche.",
      noRows: "Aucun hôpital ne correspond à votre recherche.",
      hospitals: "hôpitaux",
      warning:
        "Les indicateurs de mortalité doivent être interprétés avec prudence : la structure des cas traités, les transferts, la spécialisation et les faibles volumes peuvent influencer les résultats.",
      all: "Tous les indicateurs",
    },
    it: {
      procedures: "Numero di casi 2023",
      quality: "Indicatori di qualità 2024",
      eyebrow: "INDICATORI DI QUALITÀ CH-IQI",
      title: "Esplora gli indicatori di qualità clinica",
      body: "Confronta gli esiti di mortalità osservati e attesi degli indicatori ufficiali di qualità CH-IQI 2024. I risultati richiedono un contesto clinico e non devono essere interpretati come una semplice classifica degli ospedali.",
      step: "Fase 1",
      choose: "Seleziona un indicatore di mortalità",
      help: "Cerca nel catalogo per nome dell’indicatore o codice CH-IQI.",
      search: "Trova un indicatore",
      placeholder: "Cerca per nome o codice",
      loading: "Caricamento indicatori di qualità…",
      results: "Risultati",
      cases: "Casi",
      observed: "Mortalità osservata",
      expected: "Mortalità attesa",
      smr: "SMR",
      historical: "2019–2023",
      current: "2024",
      filter: "Cerca ospedale",
      filterPlaceholder: "Filtra gli ospedali",
      select: "Seleziona un indicatore per confrontare gli ospedali.",
      noIndicators: "Nessun indicatore corrisponde alla ricerca.",
      noRows: "Nessun ospedale corrisponde alla ricerca.",
      hospitals: "ospedali",
      warning:
        "Gli indicatori di mortalità devono essere interpretati con cautela: la tipologia dei casi trattati, i trasferimenti, la specializzazione e i bassi volumi di casi possono influenzare i risultati.",
      all: "Tutti gli indicatori",
    },
  }[locale];
  const esc = (value) =>
    String(value ?? "").replace(
      /[&<>"']/g,
      (char) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[char],
    );
  const text = (value) => String(value ?? "").trim();
  const finiteNumber = (value) => {
    if (value == null || value === "") return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  };
  const normalizeRow = (row) => {
    if (!row || typeof row !== "object") return null;
    const institution = text(row.institution);
    const code = text(row.code);
    if (!institution || !code) return null;
    return {
      institution,
      code,
      label: text(row.label),
      comment: text(row.comment),
      cases2024: Math.max(0, finiteNumber(row.cases2024) ?? 0),
      observed2024: finiteNumber(row.observed2024),
      expected2024: finiteNumber(row.expected2024),
      smr2024: finiteNumber(row.smr2024),
    };
  };
  const number = (value) =>
    Number.isFinite(value)
      ? value.toLocaleString(locale === "en" ? "en-CH" : `${locale}-CH`)
      : "—";
  const percent = (value) =>
    Number.isFinite(value) ? `${value.toFixed(1)}%` : "—";
  const ratio = (value) => (Number.isFinite(value) ? value.toFixed(2) : "—");
  const indicatorLegend = copy.legend
    ? `<p class="quality-legend">${copy.legend.map(esc).join("<br>")}</p>`
    : "";

  const toggle = document.createElement("nav");
  toggle.className = "explorer-mode-toggle page-shell";
  toggle.setAttribute("aria-label", copy.quality);
  toggle.innerHTML = `<button class="explorer-mode-btn active" type="button" data-mode="procedures">${copy.procedures}</button><button class="explorer-mode-btn" type="button" data-mode="quality">${copy.quality}</button>`;
  procedureFinder.before(toggle);

  const root = document.createElement("section");
  root.id = "quality-finder";
  root.className = "quality-finder page-shell";
  root.hidden = true;
  root.innerHTML = `
    <div class="quality-intro surface-card"><p class="quality-eyebrow">${copy.eyebrow}</p><h2>${copy.title}</h2><p>${copy.body}</p></div>
    <div class="quality-selector surface-card">
      <div class="quality-selector-header"><div><span class="finder-selector-step">${copy.step}</span><h3>${copy.choose}</h3><p>${copy.help}</p></div>${indicatorLegend}</div>
      <label class="quality-search"><span>${copy.search}</span><input id="quality-indicator-search" type="search" placeholder="${copy.placeholder}"></label>
      <div class="quality-categories" id="quality-categories"></div>
      <div class="quality-catalogue" id="quality-catalogue"><p class="quality-status">${copy.loading}</p></div>
    </div>
    <div class="finder-results-divider" data-quality-results-anchor><span class="finder-results-label">${copy.results}</span></div>
    <div class="quality-warning">${copy.warning}</div>
    <div class="finder-kpis" id="quality-kpis"></div>
    <div class="quality-results surface-card">
      <div class="quality-results-header"><div><p class="finder-list-context">${copy.current}</p><h3 id="quality-results-title">${copy.select}</h3></div><label><span>${copy.filter}</span><input id="quality-hospital-search" type="search" placeholder="${copy.filterPlaceholder}"></label></div>
      <div id="quality-results-list" class="quality-results-list"><p class="quality-status">${copy.select}</p></div>
    </div>`;
  procedureFinder.after(root);

  let rows = [];
  let catalogue = [];
  let selectedCode = "";
  let selectedCategory = "all";
  const indicatorSearch = root.querySelector("#quality-indicator-search");
  const hospitalSearch = root.querySelector("#quality-hospital-search");
  const categories = root.querySelector("#quality-categories");
  const list = root.querySelector("#quality-catalogue");
  const resultList = root.querySelector("#quality-results-list");
  const title = root.querySelector("#quality-results-title");
  const kpis = root.querySelector("#quality-kpis");

  const procedureLetterCategories =
    window.swissHospitalInsights?.procedureLetterCategories || {};
  const indicatorLabelPatterns = {
    de: /Mortalität/i,
    fr: /mortalité/i,
    it: /mortalità/i,
  };
  const categoryName = (code) => text(code).split(".")[0] || "—";
  const categoryLabel = (code) =>
    procedureLetterCategories[code]
      ? `${code} - ${procedureLetterCategories[code]}`
      : code;
  const indicatorLabelLocale = (label) =>
    Object.entries(indicatorLabelPatterns).find(([, pattern]) =>
      pattern.test(text(label)),
    )?.[0];
  // Use the translated indicator descriptions when available, while keeping
  // the published language variants as fallbacks for incomplete data.
  const localizedIndicatorLabel = (labels) =>
    [
      labels?.[locale],
      labels?.de,
      labels?.fr,
      labels?.it,
      ...Object.values(labels || {}),
    ]
      .map(text)
      .find(Boolean) || "";
  const parseIndicatorDescriptions = (text) => {
    const descriptions = new Map();
    if (typeof text !== "string" || !text.trim()) return descriptions;
    text
      .split(/\r?\n/)
      .slice(1)
      .forEach((line) => {
        const [code, de, fr, it, en] = line.split(";");
        const normalizedCode = code?.trim();
        if (normalizedCode)
          descriptions.set(normalizedCode, { de, fr, it, en });
      });
    return descriptions;
  };
  function renderCategories() {
    const values = [
      ...new Set(catalogue.map((item) => categoryName(item.code))),
    ].sort();
    categories.innerHTML = [
      { code: "all", label: copy.all },
      ...values.map((code) => ({ code, label: categoryLabel(code) })),
    ]
      .map(
        ({ code, label }) =>
          `<button type="button" class="finder-chip ${selectedCategory === code ? "active" : ""}" data-category="${esc(code)}">${esc(label)}</button>`,
      )
      .join("");
  }
  function renderCatalogue() {
    const query = indicatorSearch.value.trim().toLowerCase();
    const visible = catalogue.filter(
      (item) =>
        (selectedCategory === "all" ||
          categoryName(item.code) === selectedCategory) &&
        `${item.code} ${item.label}`.toLowerCase().includes(query),
    );
    list.innerHTML =
      visible
        .map(
          (item) =>
            `<button type="button" class="quality-indicator ${selectedCode === item.code ? "active" : ""}" data-code="${esc(item.code)}"><strong>${esc(item.code)}</strong><span>${esc(item.label)}</span></button>`,
        )
        .join("") || `<p class="quality-status">${copy.noIndicators}</p>`;
  }
  const scrollTo = (element) => {
    if (!element) return;
    if (window.swissHospitalInsights?.scrollPageToElement) {
      window.swissHospitalInsights.scrollPageToElement(element);
    } else {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };
  function scrollToResults() {
    requestAnimationFrame(() =>
      scrollTo(root.querySelector("[data-quality-results-anchor]")),
    );
  }
  function renderResults() {
    if (!selectedCode) return;
    const indicator = catalogue.find((item) => item.code === selectedCode);
    const query = hospitalSearch.value.trim().toLowerCase();
    const selected = rows
      .filter(
        (row) =>
          row.code === selectedCode &&
          row.institution.toLowerCase().includes(query),
      )
      .sort((a, b) => b.cases2024 - a.cases2024);
    title.textContent = indicator
      ? `${indicator.code} · ${indicator.label}`
      : selectedCode;
    const observed = selected.filter((row) =>
      Number.isFinite(row.observed2024),
    );
    const totalCases = selected.reduce((sum, row) => sum + row.cases2024, 0);
    const weightedObserved =
      observed.reduce((sum, row) => sum + row.observed2024 * row.cases2024, 0) /
      (observed.reduce((sum, row) => sum + row.cases2024, 0) || 1);
    kpis.innerHTML = `<div class="finder-kpi"><small>${copy.hospitals}</small><strong>${number(selected.length)}</strong></div><div class="finder-kpi"><small>${copy.cases} ${copy.current}</small><strong>${number(totalCases)}</strong></div><div class="finder-kpi"><small>${copy.observed}</small><strong>${percent(weightedObserved)}</strong></div>`;
    resultList.innerHTML =
      selected
        .map(
          (row) =>
            `<article class="quality-row"><div class="quality-hospital"><h4>${esc(row.institution)}</h4>${row.comment ? `<p>${esc(row.comment)}</p>` : ""}</div><div class="quality-metric"><small>${copy.cases}</small><strong>${number(row.cases2024)}</strong></div><div class="quality-metric"><small>${copy.observed}</small><strong>${percent(row.observed2024)}</strong></div><div class="quality-metric"><small>${copy.expected}</small><strong>${percent(row.expected2024)}</strong></div><div class="quality-metric quality-smr"><small>${copy.smr}</small><strong>${ratio(row.smr2024)}</strong></div></article>`,
        )
        .join("") || `<p class="quality-status">${copy.noRows}</p>`;
  }

  toggle.addEventListener("click", (event) => {
    const button = event.target.closest("[data-mode]");
    if (!button) return;
    const quality = button.dataset.mode === "quality";
    toggle
      .querySelectorAll(".explorer-mode-btn")
      .forEach((item) => item.classList.toggle("active", item === button));
    procedureFinder.hidden = quality;
    root.hidden = !quality;
    scrollTo(toggle);
  });
  categories.addEventListener("click", (event) => {
    const button = event.target.closest("[data-category]");
    if (!button) return;
    selectedCategory = button.dataset.category;
    renderCategories();
    renderCatalogue();
  });
  list.addEventListener("click", (event) => {
    const button = event.target.closest("[data-code]");
    if (!button) return;
    selectedCode = button.dataset.code;
    renderCatalogue();
    renderResults();
    scrollToResults();
  });
  indicatorSearch.addEventListener("input", renderCatalogue);
  hospitalSearch.addEventListener("input", renderResults);

  const dataUrl = new URL(
    "../data/qip24_mortality_indicators.json",
    qualityScriptUrl,
  );
  const descriptionsUrl = new URL(
    "../data/qip24_mortality_indicators_with_en.csv",
    qualityScriptUrl,
  );
  Promise.all([
    fetch(dataUrl).then((response) => {
      if (!response.ok)
        throw new Error(`Dataset request failed: ${response.status}`);
      return response.json();
    }),
    fetch(descriptionsUrl)
      .then((response) => {
        if (!response.ok)
          throw new Error(`Description request failed: ${response.status}`);
        return response.text();
      })
      .catch((error) => {
        console.warn(error);
        return "";
      }),
  ])
    .then(([data, descriptionText]) => {
      rows = (Array.isArray(data?.rows) ? data.rows : [])
        .map(normalizeRow)
        .filter(Boolean);
      const seen = parseIndicatorDescriptions(descriptionText);
      const activeCodes = new Set(rows.map((row) => row.code));
      rows.forEach((row) => {
        if (!seen.has(row.code)) seen.set(row.code, {});
        const labels = seen.get(row.code);
        const labelLocale = indicatorLabelLocale(row.label);
        if (labelLocale && !labels[labelLocale])
          labels[labelLocale] = row.label;
      });
      catalogue = [...seen.entries()]
        .filter(([code]) => activeCodes.has(code))
        .map(([code, labels]) => ({
          code,
          labels,
          label: localizedIndicatorLabel(labels),
        }))
        .sort((a, b) =>
          a.code.localeCompare(b.code, undefined, { numeric: true }),
        );
      renderCategories();
      renderCatalogue();
    })
    .catch((error) => {
      console.error(error);
      list.innerHTML = `<p class="quality-status">${copy.noIndicators}</p>`;
    });
})();
