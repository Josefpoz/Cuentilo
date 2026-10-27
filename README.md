# Cuentilo — P12.1

Spanisch lernen mit Geschichten, Vokabular, Grammatik, Satzwerkstatt und Formenwerkstatt.

## Veröffentlichung auf GitHub Pages

1. Neues öffentliches Repository erstellen, z. B. `cuentilo` (am besten ohne initiales README, da dieses Paket eine eigene README enthält).
2. **Den Inhalt** dieser ZIP entpacken. Die `index.html` muss direkt im Stamm des Repositorys liegen, nicht in einem Unterordner.
3. Die entpackten Dateien per Git/GitHub Desktop hochladen und auf `main` pushen. 6000+ Dateien sind zu viel für einen komfortablen Upload im Browser.
4. In **Settings → Pages → Build and deployment**: **Deploy from a branch**, Branch **main**, Ordner **/(root)**.
5. Die Datei `.nojekyll` muss im Repository-Stamm erhalten bleiben. Sie verhindert eine unnötige Jekyll-Verarbeitung der statischen App.
6. Die neue Seite ist standardmäßig unter `https://<OWNER>.github.io/<REPOSITORY>/` erreichbar.

## Achtung: Browser-Lernstand

Der Lernstand wird im Browser mittels `localStorage` gespeichert. Die bestehenden Keys sind absichtlich NICHT geändert, damit SRS, Grammatik- und Übungsstände kompatibel bleiben.

Wenn alte Palabra- und neue Cuentilo-Seite auf der gleichen Domain (z. B. `josefpoz.github.io`) laufen, greifen sie im gleichen Browserprofil auf die gleichen lokalen Speicherbereiche zu, auch wenn sich der Repo-Pfad unterscheidet. Vor dem Wechsel bitte ein Backup aus der App exportieren.

Eine andere Domain, ein anderes Browserprofil oder eine eigenständig installierte iOS-Web-App kann abweichende lokale Daten haben. Für künftige Unabhängigkeit wäre eine geplante Speichermigration erforderlich.

## Inhalt

Dies ist eine vollständige, unveränderte P12.1-Anwendung ohne historische Änderungs- und Testberichte im Veröffentlichungsverzeichnis. Alle Runtime-Dateien, Story-Annotationen, Audioaufnahmen, IDs und Persistenzformate sind gegenüber P12.1 unverändert. Keine API-Schlüssel in dieses öffentliche Repo hochladen.
