# Riprendere The Warriors · Night Run

Checkpoint verificato il 29 ottobre 2026. Questo file serve a continuare da qualsiasi chat o assistente, senza ricostruire le decisioni.

## Mandato attuale

La progettazione è già stata scritta. L'autore ha poi richiesto: «sviluppare tutti gli sprite ed i fondali, caricali pure su github». Ha autorizzato il caricamento diretto senza dover vedere ogni immagine in chat. Procedere con il lavoro concreto, senza chiedere nuovamente queste autorizzazioni.

## Fonti da leggere

1. docs/PROJECT_MEMORY.md — decisioni e cronologia della baseline.
2. docs/GAME_DESIGN.md — indice del progetto.
3. docs/CAST.md, docs/LEVELS.md, docs/ART_AND_AUDIO.md — personaggi, scene e standard.
4. design/campaign.json e design/asset_catalog.json — specifiche strutturate.
5. docs/ASSET_PLAN.md e docs/PRODUCTION_AND_QA.md — fabbisogno e verifiche.

## Stato verificato prima del recupero degli asset

La scansione ricorsiva del branch main (tree b27fc7a0e990f20a6e8e3482a084fb7aec8c4aaa) contiene README, dieci documenti e due JSON. Nessun file immagine, nessun runtime. Non equivale a un gioco completo. La progettazione descrive prologo + 8 capitoli, 35 aree e 267 pacchetti di produzione; i percorsi futuri nel catalogo non sono file esistenti.

Un vecchio prototipo esterno 0.2 risulta descritto come demo Furies, singolo e senza salvataggio; non è incluso in questo repository. Non sovrascrivere il design con quel prototipo.

## Materiali da recuperare e conservare

- Warrior non identificato: de893e_Ji78XOeZR7qVOtHvm4h-Aw_image.png. Non assegnargli arbitrariamente l'identità di Swan/Ajax.
- Fury: ff5f23_u-HyQjCyQ2SlXXmuL7RWHw_image.png.
- Parco: 65bc58_MCatdEcrTfWSAvto3TAplg_image.png.
- Tavola aggiuntiva: Sprite sheet di Ajax in combattimento.png.

Conservare gli originali in assets/source/. Controllare dimensioni, alpha, margini e pose prima di dichiararli pronti. Le osservazioni della chat interrotta su sfondi e bordi richiedono una nuova verifica dei pixel. Non dichiarare corretti o caricati i file senza riscontro.

## Prossime azioni

1. Recuperare e caricare le quattro tavole originali con inventario e hash.
2. Verificare trasparenza, frame e pivot; conservare separatamente originali ed esportazioni.
3. Completare il primo lotto Swan/Ajax/Fury e parco secondo gli standard esistenti, poi procedere per lotti al resto del catalogo.
4. Aggiornare inventario e stato dopo ogni lotto effettivamente salvato; registrare verifiche eseguite e problemi rimasti.
5. Implementare il nucleo e la prova Furies secondo il piano produttivo, mantenendo la campagna definita.

## Regole di continuità

Non affidare lo stato solo alla chat. Salvare ogni lotto su GitHub e aggiornare questo checkpoint. Distinguere source, processed, integrated e verified. Non ricominciare la progettazione, non chiedere di rispiegare il progetto e non spacciare placeholder per asset finali. Una generazione fallita resta da fare: non segnarla completata.

Per ripartire: «Leggi CONTINUE_HERE.md nel repository b3pz/The_Warriors, verifica il branch attuale e continua dal primo punto incompleto. Le autorizzazioni al caricamento degli asset sono già riportate.»
