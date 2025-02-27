require('dotenv').config();
const express = require('express');
const { MongoClient } = require('mongodb');
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
        console.log(`✅ Verbunden mit MongoDB (${DB_NAME})`);
    })
    .catch(err => console.error("Fehler bei der Verbindung zu MongoDB:", err));

// Statische Dateien aus dem "public"-Ordner bereitstellen
app.use(express.static(path.join(__dirname, "public")));

// Alle Reisen abrufen (nur Reiseinformationen)
app.get('/reisen', async (req, res) => {
    try {
        const reisen = await db.collection("reisen").find({}, { projection: { reisenummer: 1, reisebezeichnung: 1, abreiseOrt: 1, ankunftsOrt: 1 } }).toArray();
        res.json(reisen);
    } catch (error) {
        res.status(500).json({ error: "Fehler beim Abrufen der Reisen" });
    }
});

// Kunden und deren gewähltes Reiseangebot basierend auf der Reisenummer abrufen
app.get('/reisen/:nummer/kunden', async (req, res) => {
    try {
        const { nummer } = req.params;
        const reise = await db.collection("reisen").findOne({ reisenummer: nummer });
        if (!reise) {
            return res.status(404).json({ error: "Reise nicht gefunden" });
        }

        const kunden = reise.reiseangebot.flatMap(angebot =>
            angebot.kundenListe?.kunde.map(kunde => ({
                ...kunde,
                angebot: angebot.angebotbezeichnung
            })) ?? []
        );

        res.json(kunden);
    } catch (error) {
        res.status(500).json({ error: "Fehler beim Abrufen der Kunden" });
    }
});

// Frontend ausliefern
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Server starten
app.listen(PORT, () => console.log(`Server läuft auf http://localhost:${PORT}`));