document.addEventListener("DOMContentLoaded", () => {
    fetchReisen();
    fetchKundenListe();
});

// Reisen abrufen und anzeigen
function fetchReisen() {
    fetch("/reisen")
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            const container = document.getElementById("reisen-container");
            container.innerHTML = "";

            if (!data || data.length === 0) {
                container.innerHTML = "<p>Keine Reisen verfügbar</p>";
                return;
            }

            data.forEach(reise => {
                const card = document.createElement("div");
                card.classList.add("reise-card");
                card.innerHTML = `
                    <div class="reise-header">
                        <div>
                            <h3>${reise.reisebezeichnung}</h3>
                            <p><strong>Abreise:</strong> ${reise.abreiseOrt} → ${reise.ankunftsOrt}</p>
                            <p><strong>Reisenummer:</strong> ${reise.reisenummer}</p>
                        </div>
                        <button class="toggle-button" onclick="toggleTeilnehmer('${reise.reisenummer}')">⬇</button>
                    </div>
                    <ul id="teilnehmer-${reise.reisenummer}" style="display: none;">
                        <li>Lade Teilnehmer...</li>
                    </ul>
                `;
                container.appendChild(card);
            });
        })
        .catch(error => {
            console.error("Fehler beim Laden der Reisen:", error);
            document.getElementById("reisen-container").innerHTML =
                "<p>Fehler beim Laden der Reisen. Bitte versuchen Sie es später erneut.</p>";
        });
}

// Kundenliste abrufen und anzeigen
function fetchKundenListe() {
    fetch("/kunden")
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            const container = document.getElementById("kunden-container");
            container.innerHTML = "";

            if (!data || data.length === 0) {
                container.innerHTML = "<p>Keine Kunden verfügbar</p>";
                return;
            }

            data.forEach(kunde => {
                const card = document.createElement("div");
                card.classList.add("kunde-card");
                card.innerHTML = `
                    <div class="kunde-header">
                        <div>
                            <h3>${kunde.Vorname} ${kunde.Nachname}</h3>
                        </div>
                        <button class="toggle-button" onclick="toggleKundeReisen('${kunde._id}')">⬇</button>
                    </div>
                    <ul id="kunde-reisen-${kunde._id}" style="display: none;">
                        <li>Lade gebuchte Reisen...</li>
                    </ul>
                `;
                container.appendChild(card);
            });
        })
        .catch(error => {
            console.error("Fehler beim Laden der Kunden:", error);
            document.getElementById("kunden-container").innerHTML =
                "<p>Fehler beim Laden der Kunden. Bitte versuchen Sie es später erneut.</p>";
        });
}

// Kunden für eine bestimmte Reise abrufen und anzeigen
function fetchKunden(reisenummer) {
    fetch(`/reisen/${reisenummer}/kunden`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            const teilnehmerList = document.getElementById(`teilnehmer-${reisenummer}`);
            teilnehmerList.innerHTML = "";

            if (!data || data.length === 0) {
                teilnehmerList.innerHTML = "<li>Keine Teilnehmer für diese Reise</li>";
                return;
            }

            data.forEach(person => {
                const li = document.createElement("li");
                li.textContent = `${person.Vorname} ${person.Nachname} (${person.angebot})`;
                teilnehmerList.appendChild(li);
            });
        })
        .catch(error => {
            console.error("Fehler beim Laden der Kunden:", error);
            const teilnehmerList = document.getElementById(`teilnehmer-${reisenummer}`);
            if (teilnehmerList) {
                teilnehmerList.innerHTML = "<li>Fehler beim Laden der Teilnehmer</li>";
            }
        });
}

// Reisen für einen bestimmten Kunden abrufen und anzeigen
function fetchKundeReisen(kundeId) {
    fetch(`/kunden/${kundeId}/reisen`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            const reisenList = document.getElementById(`kunde-reisen-${kundeId}`);
            reisenList.innerHTML = "";

            if (!data.reisen || data.reisen.length === 0) {
                reisenList.innerHTML = "<li>Keine gebuchten Reisen</li>";
                return;
            }

            data.reisen.forEach(reise => {
                reise.gebuchteAngebote.forEach(angebot => {
                    const li = document.createElement("li");
                    // Formatiere das Datum, falls es vorhanden ist
                    let abreiseDatum = "Kein Datum";
                    if (angebot.datumAbreise) {
                        try {
                            abreiseDatum = new Date(angebot.datumAbreise).toLocaleDateString("de-DE");
                        } catch (e) {
                            abreiseDatum = angebot.datumAbreise || "Kein Datum";
                        }
                    }

                    li.innerHTML = `
                        <strong>${reise.reisebezeichnung}</strong><br>
                        ${reise.abreiseOrt} → ${reise.ankunftsOrt}<br>
                        Angebot: ${angebot.angebotbezeichnung}<br>
                        Abreise: ${abreiseDatum}<br>
                        Preis: ${angebot.preis || "N/A"} €
                    `;
                    reisenList.appendChild(li);
                });
            });
        })
        .catch(error => {
            console.error("Fehler beim Laden der Reisen:", error);
            const reisenList = document.getElementById(`kunde-reisen-${kundeId}`);
            if (reisenList) {
                reisenList.innerHTML = "<li>Fehler beim Laden der gebuchten Reisen</li>";
            }
        });
}

// Teilnehmerliste ein-/ausblenden und Kunden abrufen
function toggleTeilnehmer(reisenummer) {
    const teilnehmerList = document.getElementById(`teilnehmer-${reisenummer}`);
    if (!teilnehmerList) return;

    const toggleButton = teilnehmerList.previousElementSibling.querySelector('.toggle-button');
    if (teilnehmerList.style.display === "none") {
        teilnehmerList.style.display = "block";
        if (toggleButton) toggleButton.classList.add('rotated');
        fetchKunden(reisenummer);
    } else {
        teilnehmerList.style.display = "none";
        if (toggleButton) toggleButton.classList.remove('rotated');
    }
}

// Kunden-Reisenliste ein-/ausblenden und Reisen abrufen
function toggleKundeReisen(kundeId) {
    const reisenList = document.getElementById(`kunde-reisen-${kundeId}`);
    if (!reisenList) return;

    const toggleButton = reisenList.previousElementSibling.querySelector('.toggle-button');
    if (reisenList.style.display === "none") {
        reisenList.style.display = "block";
        if (toggleButton) toggleButton.classList.add('rotated');
        fetchKundeReisen(kundeId);
    } else {
        reisenList.style.display = "none";
        if (toggleButton) toggleButton.classList.remove('rotated');
    }
}