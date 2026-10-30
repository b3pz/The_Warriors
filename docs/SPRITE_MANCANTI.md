# Sprite e fondali mancanti

Stato al 30 ottobre 2026. Serve a chi prepara le immagini nuove: che cosa manca, che cosa è un ripiego, con quali misure.
Le descrizioni dell'aspetto dei personaggi sono in `docs/GRAFICA_IN_ARRIVO.md`. Formato consigliato: un PNG trasparente per posa, figura rivolta a destra, piedi sulla stessa riga, stessa scala per tutti (in gioco un personaggio in piedi è alto circa 185 pixel).

## Warriors: pose di base mancanti

Pose di base: riposo, camminata (4 fotogrammi), pugno, calcio, colpo pesante, salto, colpito, a terra.

| Warrior | Mancano | Camminata |
|---|---|---|
| Swan | colpito | 4/4 |
| Ajax | **tutto il set** (nessuna figura adatta: capelli corti, guanti senza dita) | 4/4 |
| Snow | — | 4/4 |
| Cowboy | colpo pesante, salto, colpito, a terra | 3/4 |
| Cochise | pugno, calcio, colpito, a terra | 4/4 |
| Vermin | **tutto il set** (nessuna figura adatta: tarchiato, capelli castani corti) | 4/4 |
| Rembrandt | calcio, colpito, a terra | 4/4 |
| Fox | pugno, colpo pesante, salto, colpito, a terra | 4/4 |
| Cleon | **tutto il set** (nessuna figura adatta: afroamericano, bandana leopardata) | 2/4 |

## Pose che mancano a tutti i Warriors

Rialzata da terra · presa e colpi in presa · lancio del nemico · schivata · calcio volante · corsa · camminata e colpo con la mazza, il tubo e l'asse · lancio dell'arma · soccorso a un compagno · seduto (treno, C7) · nascosto e uscita dal gabinetto (bagno, C6-02).

Pose speciali della storia:
- **Swan**: coltello a scatto, lancio del coltello (duello con Luther), mano nella mano con Mercy.
- **Ajax**: senza gilet, a mani nude contro le mazze, che strappa la mazza al capo dei Furies; arresto e manette.
- **Rembrandt**: bomboletta spray, a terra bloccato dal Punk mentre spruzza.
- **Cochise e Vermin**: salto dei tornelli (96ª Strada).
- **Chi spacca la radio delle Lizzies**: sedia sollevata e colpo (da confermare chi è).
- **Cleon**: discorso al raduno, circondato dai Riffs.
- **Fox**: spinto sui binari (anche solo una sagoma per la scena).

## Mercy

Ha solo riposo e un fotogramma di camminata. Servono: camminata (4), corsa, attesa, salto, voltata, riparo, mentre si sistema i capelli sul treno, mano nella mano con Swan, seduta.

## Nemici

| Banda | Mancano |
|---|---|
| Turnbull AC's | carica, colpo, colpito, a terra; il grosso diverso dal veloce |
| Orphans | colpito, a terra, con l'asse; Sully riconoscibile |
| Baseball Furies | a terra (quella attuale è scartata), rialzata, colpo a mani nude dopo il disarmo; **il capo con il trucco diverso** |
| Lizzies | pistola alzata e sparo, spinta della bloccatrice, colpito, a terra; la capa |
| Punks | **pattini a rotelle**, presa, colpito, a terra; il capo riconoscibile |
| Rogues | lancio della bottiglia, colpito, a terra |
| Polizia | colpo di manganello, carica, colpito, a terra; la poliziotta in borghese della panchina |

## Personaggi della storia

Cyrus (sul palco, colpito), Masai e i Riffs (folla in tuta), Luther (con le bottiglie al finestrino, con la pistola, coltello nel braccio, a terra), la DJ (labbra al microfono, oppure lo studio), il testimone, la coppia elegante del treno, comparse del raduno e dei passeggeri.

## Veicoli e oggetti

Bus verde dei Turnbull · treno della metro (esterno che passa e interno) · auto dei Rogues · auto degli Orphans in fiamme · tornelli · transenne · panchine · cestini · casse · bidoni · porte dei gabinetti · lavandini e specchi · radio/giradischi delle Lizzies · sedia · bomboletta · coltello a scatto · pistola · bottiglie · mazza, tubo, asse, manganello.

## Effetti

Spruzzo di vernice · scintille dei colpi · polvere · fuoco · vetro che si rompe · lampi dello sparo.

## Interfaccia

Ritratti dei nove Warriors e di Mercy per HUD e selezione · logo per il titolo · cornici per le vignette a fumetto.

## Fondali: uno per area

Il gioco è a 1280 × 720. Il pavimento comincia alla riga indicata e arriva in fondo all'immagine: da lì in su ci sono muri, palazzi, alberi; da lì in giù il piano dove si cammina. In pixel art si può disegnare a metà misura (larghezza / 2 × 360) e il gioco la ingrandisce. Meglio ancora a livelli separati: cielo, sfondo lontano, muro, pavimento, primo piano.

| Area | Nome | Ambiente | Luce | Misura | Pavimento da y |
|---|---|---|---|---|---|
| P0-01 | Il ritrovo | Coney Island | sera | 1280 × 720 | 510 |
| P0-02 | Allenamento | Coney Island | sera | 1280 × 720 | 470 |
| P0-03 | Verso l'uscita | Coney Island | sera | 1280 × 720 | 480 |
| P0-04 | Partenza | banchina | sera | 1280 × 720 | 480 |
| C1-01 | Il raduno | raduno | notte | 1920 × 720 | 500 |
| C1-02 | Il discorso | raduno | notte | 1280 × 720 | 480 |
| C1-03 | Fuga dal parco | parco | notte | 2560 × 720 | 490 |
| C1-04 | Il cimitero di Woodlawn | cimitero | notte | 1280 × 720 | 500 |
| C2-01 | Isolato del Bronx | strada | notte | 2560 × 720 | 460 |
| C2-02 | Vicolo con cancello | vicolo | notte | 1920 × 720 | 490 |
| C2-03 | Corsa alle scale | strada | notte | 3840 × 720 | 450 |
| C2-04 | Stazione di Gun Hill Road | banchina | notte | 1920 × 720 | 480 |
| C3-01 | Strada degli Orphans | strada | notte | 1280 × 720 | 480 |
| C3-02 | Cortile | cortile | notte | 2560 × 720 | 490 |
| C3-03 | Strada laterale | strada | notte | 2560 × 720 | 460 |
| C3-04 | Stazione della 96ª Strada | banchina | notte | 1920 × 720 | 510 |
| C4-01 | Ingresso del parco | parco | notte | 1920 × 720 | 480 |
| C4-02 | Sentiero con panchine | parco | notte | 2560 × 720 | 450 |
| C4-03 | Radura | parco | notte | 2560 × 720 | 440 |
| C4-04 | Il bivio | parco | notte | 1280 × 720 | 480 |
| C5-01 | La panchina | parco | notte | 1280 × 720 | 480 |
| C5-02 | L'appartamento | appartamento | notte | 1280 × 720 | 510 |
| C5-03 | La trappola | appartamento | notte | 1920 × 720 | 510 |
| C5-04 | Sotterraneo | tunnel | notte | 1920 × 720 | 510 |
| C5-05 | Verso Union Square | strada | notte | 1920 × 720 | 480 |
| C6-01 | Union Square | banchina | notte | 1920 × 720 | 500 |
| C6-02 | I bagni | bagno | notte | 1280 × 720 | 530 |
| C6-03 | Il bagno | bagno | notte | 1920 × 720 | 510 |
| C6-04 | Banchina | banchina | notte | 1280 × 720 | 500 |
| C7-01 | L'ultimo treno | vagone | alba | 1920 × 720 | 570 |
| C7-02 | Casa | banchina | alba | 1280 × 720 | 480 |
| C8-01 | Strada di casa | Coney Island | alba | 1920 × 720 | 480 |
| C8-02 | Il varco | Coney Island | alba | 1920 × 720 | 460 |
| C8-03 | La spiaggia | spiaggia | alba | 1280 × 720 | 450 |
| C8-04 | Alba | spiaggia | alba | 1280 × 720 | 450 |

Oggi tutti questi fondali sono disegnati a codice (`js/scenery.js`) come ripiego in scala. Le scene vere li sostituiranno area per area.
