# Gestione Permessi - Modar S.p.A.

Applicazione web per la gestione di permessi e ferie aziendali.

## Stack
- **Frontend/Backend**: Next.js 14 (App Router)
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: JWT custom (email + PIN 5 cifre)
- **Email**: n8n webhook → Gmail
- **Calendario**: FullCalendar.js

## Setup locale

### 1. Installa dipendenze
```bash
npm install
```

### 2. Configura .env
```
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/gestione_permessi"
NEXTAUTH_SECRET="stringa-random-sicura"
NEXTAUTH_URL="http://localhost:3000"

N8N_WEBHOOK_RICHIESTA_INVIATA="https://tuo-n8n/webhook/richiesta-inviata"
N8N_WEBHOOK_RICHIESTA_APPROVATA="https://tuo-n8n/webhook/richiesta-approvata"
N8N_WEBHOOK_RICHIESTA_RIFIUTATA="https://tuo-n8n/webhook/richiesta-rifiutata"
```

### 3. Crea il database e migra lo schema
```bash
npm run db:push
```

### 4. Crea utente admin iniziale
```bash
npm run db:seed
# email: admin@modar.it  |  PIN: 12345
```

### 5. Avvia in sviluppo
```bash
npm run dev
```

---

## Deploy su VPS Hostinger

### PostgreSQL
```bash
sudo apt install postgresql postgresql-contrib
sudo -u postgres createuser --interactive
sudo -u postgres createdb gestione_permessi
```

### Build e PM2
```bash
npm run build
npm install -g pm2
pm2 start npm --name "gestione-permessi" -- start
pm2 save && pm2 startup
```

### Nginx (proxy)
```nginx
server {
    listen 80;
    server_name tuodominio.it;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## n8n - Configurazione workflow

### Webhook richiesta inviata (`/webhook/richiesta-inviata`)
- Trigger: Webhook POST
- Azione: Gmail → invia email al responsabile

**Body ricevuto:**
```json
{
  "tipo": "NUOVA_RICHIESTA",
  "richiesta": { "id": "...", "tipo": "PERMESSO", "dataInizio": "...", "oraInizio": "09:00", "oraFine": "11:00" },
  "dipendente": { "nome": "Mario", "cognome": "Rossi", "email": "mario@modar.it" }
}
```

### Webhook approvata/rifiutata
**Body ricevuto:**
```json
{
  "tipo": "RICHIESTA_APPROVATA",
  "richiesta": { "stato": "APPROVATA", "motivazione": "..." },
  "dipendente": { "nome": "Mario", "cognome": "Rossi", "email": "mario@modar.it" },
  "responsabile": { "nome": "Anna", "cognome": "Bianchi", "email": "anna@modar.it" }
}
```

---

## Struttura pagine

| URL | Ruolo | Descrizione |
|-----|-------|-------------|
| `/login` | Tutti | Login email + PIN |
| `/dashboard` | Dipendente | Le mie richieste |
| `/nuova-richiesta` | Dipendente | Crea richiesta permesso/ferie |
| `/admin` | Responsabile | Lista richieste team |
| `/admin/calendario` | Responsabile | Calendario assenze |
| `/admin/utenti` | Responsabile | Gestione utenti e PIN |
#FINE
