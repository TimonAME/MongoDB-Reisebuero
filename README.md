# Reisebüro Projekt
### Projektbeschreibung
Dieses Projekt implementiert einen Serverzugriff auf eine NoSQL-Datenbank, um Reisen, ihre Start- und Endtermine, Preise, die Orte und die Reiseteilnehmer zu speichern. Die Datenbank enthält Informationen zu Reisen, Reiseangeboten, Reisebuchungen und Reiseteilnehmern. Die Ausgabe aller Reisen und eine vollständige Anzeige der Reiseteilnehmer sind Pflicht.  Der Node.js-Server kann entweder plain, über das Framework Express oder mit Python verwendet werden.

### Datenbankstruktur
In der Datenbank sollen folgende Collections existieren:
- Reisen
- Reiseangebot
- Reisebuchungen
- Reiseteilnehmer

### Voraussetzungen
- Node.js
- MongoDB
- MongoDB Compass (optional)

### Setup
#### MongoDB Setup
1. MongoDB und MongoDB Compass installieren.
2. In MongoDB Compass eine neue Verbindung erstellen und eine neue Datenbank reisebüro erstellen.
3. XML-Datei in JSON umwandeln und in die Datenbank reisebüro importieren.

#### Node.js Setup
1. Projekt initialisieren: 
npm init -y
2. Benötigte Pakete installieren:
npm install express mongodb dotenv
3. .env Datei erstellen und konfigurieren.
4. server.js Datei erstellen und den Server starten:
node server.js