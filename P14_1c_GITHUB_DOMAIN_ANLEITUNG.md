# Cuentilo P14.1c – Vollversion und Domain cuentilo.de

**Basis:** P14.1a Fix 1. Alle bisherigen Lerninhalte, Grafiken und Audiodateien sind in dieser ZIP enthalten.

## Änderungen
- `impressum.html`, `datenschutz.html`, `legal.css`: eigenständige Rechtsseiten.
- Rechtslinks im Einstellungsbereich und im Footer. Auch ohne funktionierende JS-App direkt erreichbar.
- Dateiimporte entfernt: weder Lernstands-JSON noch CSV hochladen; zugehörige Event-Handler/CSV-Parser in `app.js` entfernt.
- Lernstandexport bleibt optional hinter „Datensicherung“.
- `CNAME` enthält `cuentilo.de` und ist im Root enthalten.
- Vorhandener SRS-Speicherschlüssel `palabra-foundation-05a2-v1` unverändert; keine Lösch- oder Migrationsroutine.

## Veröffentlichung mit GitHub Desktop
1. ZIP entpacken. **Alle Dateien und Unterordner** aus dem entpackten Inhalt direkt in den lokalen Repository-Ordner kopieren und bei vorhandenen Dateien ersetzen (nicht den übergeordneten ZIP-Ordner hinein kopieren).
2. In GitHub Desktop `cuentilo` auswählen. Unter `Changes` insbesondere `CNAME`, `impressum.html`, `datenschutz.html`, `legal.css`, `style-p14-1c.css`, `learn_course_p14_data.js` kontrollieren.
3. Commit-Nachricht `Cuentilo P14.1c – Rechtliches & Domain` → `Commit to main` → `Push origin`.
4. Repository auf github.com öffnen → `Settings` → `Pages` → `Custom domain`: `cuentilo.de` → `Save`. Da `CNAME` bereits in der ZIP liegt, kann GitHub die Zuordnung im Branch lesen; beim Speichern darf die Datei nicht mit einer anderen Domain überschrieben werden.

## IONOS DNS für cuentilo.de
`IONOS > Domains & SSL > cuentilo.de > DNS`:

| Typ | Host | Wert |
| --- | --- | --- |
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |
| CNAME | www | josefpoz.github.io |

Entferne nur sich widersprechende alte Website-A-/AAAA-/www-Einträge. **Nicht ändern oder löschen:** MX-Records, SPF/DKIM/DMARC und andere E-Mail-DNS-Einträge von IONOS. Sonst könnte `kontakt@cuentilo.de` ausfallen. Keine Wildcard-DNS-Einträge.

Danach in GitHub `Settings > Pages > Enforce HTTPS` aktivieren, sobald verfügbar. DNS kann bis zu 24 Stunden benötigen; auch das HTTPS-Zertifikat kann verzögert bereitstehen.

### Prüfen
- https://cuentilo.de/
- https://cuentilo.de/impressum.html
- https://cuentilo.de/datenschutz.html
- https://cuentilo.de/check-release.html
- https://www.cuentilo.de/ (Weiterleitung zur Hauptdomain)
- Learn: 13 Stationen. Stories, Vocab, Audio: Funktionstests auf iPhone/PC.
- Sende eine Testmail an `kontakt@cuentilo.de` und prüfe Empfang/Antwort.

### WICHTIG: Bestehende Lernstände und Safari-App
`github.io` und `cuentilo.de` haben **getrennte Browser-Speicherbereiche**. Die bisherigen Lernstände erscheinen deshalb auf cuentilo.de nicht automatisch; das neue Cuentilo beginnt dort ggf. leer. Eine JSON-Sicherung der bisherigen App bleibt möglich, **kann in P14.1c jedoch nicht importiert werden**. Dies ist die bewusst gewählte Sicherheitsentscheidung. Vor dem Domainwechsel auf der bisherigen App vorsorglich den JSON-Export ausführen, wenn du den dortigen Lernstand archivieren möchtest. Achtung: Nach der GitHub-Pages-Domainumstellung kann die alte github.io-URL automatisch zur neuen Domain weiterleiten. Die alte iPhone-Web-App daher nicht löschen, aber gehe nicht davon aus, dass du danach noch auf die alten Daten zugreifen kannst. Ein späterer Umzug benötigt eine eigene sichere Migration oder Cloud-Sync.

### Rechtlicher Hinweis
Die Textentwürfe wurden mit den vorliegenden Betreiberangaben erstellt und anhand der statischen App-Struktur angepasst. Dies ist keine verbindliche Rechtsberatung oder Zertifizierung. Vor breiter öffentlicher Vermarktung insbesondere Einordnung § 5 DDG, Hosting-/Drittlandinformationen und tatsächliche Datenschutzeinstellungen ggf. fachlich überprüfen lassen.

Offizielle Anleitungen:
https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site
https://www.ionos.de/hilfe/domains/dns-einstellungen/
