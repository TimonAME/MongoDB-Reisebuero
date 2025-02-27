document.addEventListener("DOMContentLoaded", () => {
    fetchReisen();
});

// Reisen abrufen und anzeigen
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

                fetchKunden(reise.reisenummer, `teilnehmer-${reise.reisenummer}`);
            });
        })
        .catch(error => console.error("Fehler beim Laden der Reisen:", error));
}

// Kunden für eine bestimmte Reise abrufen
function fetchKunden(reisenummer, listId) {
    fetch(`/reisen/${reisenummer}/kunden`)
        .then(response => response.json())
        .then(data => {
            const teilnehmerList = document.getElementById(listId);
            teilnehmerList.innerHTML = "";

            if (data.length === 0) {
                teilnehmerList.innerHTML = "<li>Keine Teilnehmer</li>";
            } else {
                data.forEach(person => {
                    const li = document.createElement("li");
                    li.textContent = `${person.Vorname} ${person.Nachname} (${person.angebot})`;
                    teilnehmerList.appendChild(li);
                });
            }
        })
        .catch(error => console.error("Fehler beim Laden der Kunden:", error));
}