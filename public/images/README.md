# Bilder

Die Fotos der Live-Seite sind nicht im Repo. Lege hier deine eigenen Bilder ab, zum Beispiel:

```
public/images/about/
public/images/projects/
public/images/setup/
public/images/travel/<reiseziel>/
```

und trage sie in `src/lib/seed-data.ts` mit dem Pfad ab `/images/...` ein.

Vor dem Commit Metadaten entfernen (GPS, Kamera, Datum): `exiftool -all= -overwrite_original *.jpg`
