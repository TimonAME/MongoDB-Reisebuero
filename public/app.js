document.addEventListener("DOMContentLoaded", () => {
    fetchReisen();
});

// Reisen & Teilnehmer abrufen und anzeigen
function fetchReisen() {
    fetch("/reisen")
        .then(response => response.json())
        .then(data => {
            const container = document.getElementById("reisen-container");
            container.innerHTML = ""; // Alte Inhalte löschen

            data.forEach(reise => {
                const card = document.createElement("div");
                card.classList.add("reise-card");
                card.innerHTML = `
                    <h3>${reise.reisebezeichnung}</h3>
                    <p><strong>Abreise:</strong> ${reise.abreiseOrt} → ${reise.ankunftsOrt}</p>
                    <h4>Teilnehmer:</h4>
                    <ul id="teilnehmer-${reise.reisenummer}">
                        <li>🔄 Lade Teilnehmer...</li>
                    </ul>
                `;
                container.appendChild(card);

                fetchTeilnehmer(reise.reiseangebot, `teilnehmer-${reise.reisenummer}`);
            });
        })
        .catch(error => console.error("Fehler beim Laden der Reisen:", error));
}

// Teilnehmer für eine bestimmte Reise abrufen
function fetchTeilnehmer(reiseangebote, listId) {
    const teilnehmerList = document.getElementById(listId);
    teilnehmerList.innerHTML = "";

    let teilnehmer = [];
    reiseangebote.forEach(angebot => {
        if (angebot.kundenListe && Array.isArray(angebot.kundenListe.kunde)) {
            teilnehmer.push(...angebot.kundenListe.kunde);
        }
    });

    if (teilnehmer.length === 0) {
        teilnehmerList.innerHTML = "<li>Keine Teilnehmer</li>";
    } else {
        teilnehmer.forEach(person => {
            const li = document.createElement("li");
            li.textContent = `${person.Vorname} ${person.Nachname}`;
            teilnehmerList.appendChild(li);
        });
    }
}
