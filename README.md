APMorrowland Festival Management Suite

Welkom bij de APMorrowland Management Suite, een mini-ERP systeem ontworpen voor het beheer van de backstage operaties van het APMorrowland festival. Dit project is gebouwd als onderdeel van de opdracht ERP Applications (Toegepaste Informatica).

Overzicht

Dit platform brengt verschillende kritieke festivalprocessen samen in één modulaire suite:

Artist Management: Beheer van artiestenprofielen en publieksfeedback.

Order Management: Een gestroomlijnd proces voor de verkoop van tickets en merchandise.

Line-up & Planning: Een interactieve kalender voor het inplannen van optredens.

Leaderboard: Een live ranglijst van de populairste artiesten op basis van bezoeker-reviews.

Projectstructuur

Het project volgt de standaard SAP Cloud Application Programming Model (CAP) structuur:

app/: Bevat de SAPUI5 freestyle applicaties (Artists, Orders, Planning, Leaderboard).

db/: Bevat het datamodel (schema.cds) en de initiële data (.csv bestanden).

srv/: Bevat de service definities (cat-service.cds) en de bijbehorende logica.

Installatie & Gebruik

Vereisten

Node.js (https://nodejs.org/)

SAP CDS SDK (npm i -g @sap/cds-dk)

Stappen

Clone de repository:

git clone <jouw-repo-url>
cd apmorrowland


Installeer afhankelijkheden:

npm install


Start de applicatie:

cds watch


Bekijk de apps:
Ga naar http://localhost:4004 en klik op de web-applicaties onder de /app sectie.

Belangrijkste Functionaliteiten

1. Artist Management & Reviews

Uitgebreide artiestenprofielen met biografieën en sociale media integratie (Spotify/Instagram).

Top Rated Badge: Verschijnt automatisch bij artiesten met een gemiddelde score > 4.0.

Interactief review-systeem met directe score-berekening.

2. Interactieve Line-up Planning

Drag & Drop: Verplaats optredens tussen verschillende podia of tijdstippen direct in de kalender.

Real-time Sync: Wijzigingen in de kalender worden direct gepatcht naar de OData V4 backend.

3. Dynamic Leaderboard

Hype Meter: Visuele weergave van de populariteit van een artiest op basis van het aantal reviews (Vlam, Ster, of Stijgende pijl icoon).

Gebruik van CDS Views voor efficiënte server-side berekeningen van gemiddelde ratings.

4. Order Wizard

Stap-voor-stap proces voor het aanmaken van orders.

Mogelijkheid om orderbevestigingen te exporteren naar PDF.

Technologie Stack

Backend: SAP CAP (Node.js runtime), SQLite (lokale dev database).

Frontend: SAPUI5 (v1.120.0), Fiori Fundamentals.

Data Protocol: OData V4.

Tools: Business Application Studio (BAS), CDS-DK.
