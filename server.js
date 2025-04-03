require('dotenv').config();
const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URL = process.env.MONGO_URL || "mongodb://127.0.0.1:27017";
const DB_NAME = "Reisebüro";

let db;

// Verbindung zur MongoDB herstellen
MongoClient.connect(MONGO_URL)
    .then(client => {
        db = client.db(DB_NAME);
        console.log(`Verbunden mit MongoDB (${DB_NAME})`);
    })
    .catch(err => console.error("Fehler bei der Verbindung zu MongoDB:", err));

// Statische Dateien aus dem "public"-Ordner bereitstellen
app.use(express.static(path.join(__dirname, "public")));

// Alle Reisen abrufen (nur Reiseinformationen)
app.get('/reisen', async (req, res) => {
    try {
        const reisen = await db.collection("reisen").find({}, {
            projection: {
                reisenummer: 1,
                reisebezeichnung: 1,
                abreiseOrt: 1,
                ankunftsOrt: 1
            }
        }).toArray();
        res.json(reisen);
    } catch (error) {
        console.error("Fehler beim Abrufen der Reisen:", error);
        res.status(500).json({ error: "Fehler beim Abrufen der Reisen" });
    }
});

// Kunden und deren gewähltes Reiseangebot basierend auf der Reisenummer abrufen
app.get('/reisen/:nummer/kunden', async (req, res) => {
    try {
        const nummer = req.params.nummer;

        // Versuche erst mit dem String-Wert
        let reise = await db.collection("reisen").findOne({ reisenummer: nummer });

        // Wenn nichts gefunden wurde, versuche mit dem Integer-Wert
        if (!reise) {
            const nummerInt = parseInt(nummer);
            if (!isNaN(nummerInt)) {
                reise = await db.collection("reisen").findOne({ reisenummer: nummerInt });
            }
        }

        // Wenn immer noch nichts gefunden wurde, suche nach _id wenn es ein gültiger ObjectId ist
        if (!reise && ObjectId.isValid(nummer)) {
            reise = await db.collection("reisen").findOne({ _id: new ObjectId(nummer) });
        }

        if (!reise) {
            console.log(`Reise mit Nummer ${nummer} nicht gefunden`);
            return res.status(404).json({ error: "Reise nicht gefunden" });
        }

        // Alle Angebot-IDs dieser Reise extrahieren
        const angebotIDs = reise.reiseangebot.map(angebot => angebot.angebotID);

        // Alle Kunden finden, die mindestens eines dieser Angebote gebucht haben
        const kunden = await db.collection("kunden").find({
            angebotIDs: { $in: angebotIDs }
        }).toArray();

        // Die Kundenliste im für das Frontend erwarteten Format aufbereiten
        const kundenMitAngebote = [];

        kunden.forEach(kunde => {
            // Nur die Angebote berücksichtigen, die zu dieser Reise gehören
            const relevantOffers = kunde.angebotIDs.filter(id => angebotIDs.includes(id));

            relevantOffers.forEach(angebotID => {
                const angebot = reise.reiseangebot.find(ang => ang.angebotID === angebotID);
                if (angebot) {
                    kundenMitAngebote.push({
                        Vorname: kunde.Vorname,
                        Nachname: kunde.Nachname,
                        angebot: angebot.angebotbezeichnung
                    });
                }
            });
        });

        res.json(kundenMitAngebote);
    } catch (error) {
        console.error("Fehler beim Abrufen der Kunden für Reise:", error);
        res.status(500).json({ error: "Fehler beim Abrufen der Kunden" });
    }
});

// Alle Kunden abrufen
app.get('/kunden', async (req, res) => {
    try {
        const kunden = await db.collection("kunden").find({}).toArray();
        res.json(kunden);
    } catch (error) {
        console.error("Fehler beim Abrufen der Kunden:", error);
        res.status(500).json({ error: "Fehler beim Abrufen der Kunden" });
    }
});

// Alle Reisen eines Kunden abrufen
app.get('/kunden/:id/reisen', async (req, res) => {
    try {
        const { id } = req.params;

        // Kunde mit der angegebenen ID finden
        const kunde = await db.collection("kunden").findOne({
            _id: new ObjectId(id)
        });

        if (!kunde) {
            console.log(`Kunde mit ID ${id} nicht gefunden`);
            return res.status(404).json({ error: "Kunde nicht gefunden" });
        }

        // Angebote-IDs des Kunden extrahieren
        const angebotIDs = kunde.angebotIDs || [];

        // Reisen mit diesen Angeboten finden
        const reisen = await db.collection("reisen").find({
            "reiseangebot.angebotID": { $in: angebotIDs }
        }).toArray();

        // Detaillierte Informationen über die Reisen und gebuchten Angebote zusammenstellen
        const reisenDetails = [];

        reisen.forEach(reise => {
            // Nur die Angebote filtern, die der Kunde tatsächlich gebucht hat
            const gebuchteAngebote = reise.reiseangebot.filter(angebot =>
                angebotIDs.includes(angebot.angebotID)
            );

            if (gebuchteAngebote.length > 0) {
                reisenDetails.push({
                    reiseID: reise._id,
                    reisenummer: reise.reisenummer,
                    reisebezeichnung: reise.reisebezeichnung,
                    abreiseOrt: reise.abreiseOrt,
                    ankunftsOrt: reise.ankunftsOrt,
                    gebuchteAngebote: gebuchteAngebote.map(angebot => ({
                        angebotID: angebot.angebotID,
                        angebotbezeichnung: angebot.angebotbezeichnung,
                        preis: angebot.preis,
                        datumAbreise: angebot.datumAbreise
                    }))
                });
            }
        });

        res.json(reisenDetails);
    } catch (error) {
        console.error("Fehler beim Abrufen der Reisen des Kunden:", error);
        res.status(500).json({ error: "Fehler beim Abrufen der Reisen des Kunden" });
    }
});

// Frontend ausliefern
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Server starten
app.listen(PORT, () => console.log(`Server läuft auf http://localhost:${PORT}`));