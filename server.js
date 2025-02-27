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
    .catch(err => console.error("❌ Fehler bei der Verbindung zu MongoDB:", err));

// Statische Dateien aus dem "public"-Ordner bereitstellen
app.use(express.static(path.join(__dirname, "public")));

// **1️⃣ Alle Reisen abrufen**
app.get('/reisen', async (req, res) => {
    try {
        const reisen = await db.collection("reisen").find().toArray();
        res.json(reisen);
    } catch (error) {
        res.status(500).json({ error: "Fehler beim Abrufen der Reisen" });
    }
});

// **2️⃣ Alle Reiseteilnehmer abrufen**
app.get('/teilnehmer', async (req, res) => {
    try {
        const reisen = await db.collection("reisen").find().toArray();
        const teilnehmer = reisen.flatMap(reise =>
            reise.reiseangebot?.flatMap(angebot =>
                angebot.kundenListe?.kunde ?? []
            ) ?? []
        );
        res.json(teilnehmer);
    } catch (error) {
        res.status(500).json({ error: "Fehler beim Abrufen der Reiseteilnehmer" });
    }
});

// **3️⃣ Reisen nach Zielort filtern**
app.get('/reisen/ort/:ort', async (req, res) => {
    try {
        const { ort } = req.params;
        const reisen = await db.collection("reisen").find({ ankunftsOrt: ort }).toArray();
        res.json(reisen);
    } catch (error) {
        res.status(500).json({ error: "Fehler beim Abrufen der Reisen nach Ort" });
    }
});

// **4️⃣ Reiseangebote mit Preisfilter**
app.get('/angebote/preis/:maxPreis', async (req, res) => {
    try {
        const maxPreis = parseInt(req.params.maxPreis, 10);
        const reisen = await db.collection("reisen").find().toArray();
        const angebote = reisen.flatMap(reise =>
            reise.reiseangebot?.filter(angebot => parseInt(angebot.preis, 10) <= maxPreis) ?? []
        );
        res.json(angebote);
    } catch (error) {
        res.status(500).json({ error: "Fehler beim Abrufen der Angebote nach Preis" });
    }
});

// **Frontend ausliefern**
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// **Server starten**
app.listen(PORT, () => console.log(`🚀 Server läuft auf http://localhost:${PORT}`));
