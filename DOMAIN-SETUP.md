# VELTRIX Domain Setup — veltrixclient.de

Die Website wird über GitHub Pages aus dem Repository `GxCracks/veltrix-client` veröffentlicht. Die Produktionsdomain ist:

`https://veltrixclient.de`

## 1. DNS beim Domain-Anbieter

### A Records für die Hauptdomain

Lege für `veltrixclient.de` bzw. Host `@` diese vier A-Records an:

| Typ | Host | Wert |
| --- | --- | --- |
| A | @ | `185.199.108.153` |
| A | @ | `185.199.109.153` |
| A | @ | `185.199.110.153` |
| A | @ | `185.199.111.153` |

Falls dein Anbieter bereits einen A-, ALIAS- oder ANAME-Record für `@` gesetzt hat, der auf ein anderes Hosting zeigt, entferne den widersprüchlichen Eintrag.

### AAAA Records für IPv6

GitHub Pages unterstützt IPv6. Wenn dein DNS-Anbieter AAAA-Records erlaubt, lege zusätzlich diese vier Einträge für Host `@` an:

| Typ | Host | Wert |
| --- | --- | --- |
| AAAA | @ | `2606:50c0:8000::153` |
| AAAA | @ | `2606:50c0:8001::153` |
| AAAA | @ | `2606:50c0:8002::153` |
| AAAA | @ | `2606:50c0:8003::153` |

### CNAME für www

Damit `www.veltrixclient.de` ebenfalls funktioniert, lege an:

| Typ | Host | Wert |
| --- | --- | --- |
| CNAME | www | `gxcracks.github.io` |

Die Hauptdomain bleibt `veltrixclient.de`. Wenn GitHub Pages auf die Apex-Domain konfiguriert ist, kann GitHub die `www`-Variante auf die Hauptdomain umleiten.

## 2. Custom Domain in GitHub Pages setzen

Öffne auf GitHub:

`Repository → Settings → Pages → Custom domain`

Trage exakt ein:

`veltrixclient.de`

Speichere die Einstellung. Die Datei `CNAME` im Repository enthält ebenfalls exakt `veltrixclient.de` und wird bei jedem Pages-Deployment mit veröffentlicht.

## 3. HTTPS aktivieren

Warte nach der DNS-Umstellung, bis GitHub die Domain verifiziert und ein TLS-Zertifikat bereitgestellt hat. Danach unter:

`Repository → Settings → Pages`

`Enforce HTTPS` aktivieren. Die Option kann nach DNS-Änderungen eine Weile brauchen, bis sie verfügbar ist.

## 4. DNS-Propagation

DNS-Änderungen sind nicht immer sofort weltweit aktiv. Je nach Anbieter und TTL kann die Umstellung einige Minuten bis mehrere Stunden dauern.

## 5. Optional: Domain bei GitHub verifizieren

Für zusätzlichen Schutz gegen Domain-Takeover kann die Domain im GitHub-Konto unter den Pages-/Domain-Einstellungen verifiziert werden. GitHub erzeugt dafür einen individuellen TXT-Record. Den TXT-Wert nicht erfinden, sondern direkt aus GitHub übernehmen.

## 6. Erwartetes Ergebnis

Nach erfolgreicher Einrichtung:

- `https://veltrixclient.de` → VELTRIX Website
- `https://www.veltrixclient.de` → Weiterleitung zur Hauptdomain
- GitHub Actions → automatisches Pages-Deployment bei Push auf `main`
- HTTPS → über GitHub Pages TLS
