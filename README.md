# Eseménykezelő alkalmazás – Frontend

React + MUI + FullCalendar alapú frontend az események heti naptár nézetben történő kezeléséhez.

> **Fontos:** a frontend a backend API-ra épül, ezért csak a backend elindítása és futása után indítsd el.

## Követelmények

- **Node.js**
- **npm**

## Első indítás

### 1. Belépés a repository mappájába és függőségek telepítése

```bash
cd event-handler-frontend
npm install
```

### 2. Környezeti változók beállítása

Másold át a példa env fájlt, és szükség esetén módosítsd az értékeket:

```bash
cp .env.sample .env
```

Az `.env` fájlnak a következő változót kell tartalmaznia:

```env
VITE_BACKEND_BASE_URL=http://localhost:3000
```

Ez a backend API címe — győződj meg róla, hogy a backend ezen a címen fut, mielőtt elindítod a frontendet.

### 3. Alkalmazás indítása fejlesztői módban

```bash
npm run dev
```

A frontend alapértelmezetten a `http://localhost:5173` címen fut.

## Hasznos parancsok

| Parancs         | Leírás                                |
| --------------- | ------------------------------------- |
| `npm run dev`   | Alkalmazás indítása fejlesztői módban |
| `npm run build` | Production build                      |
| `npm run lint`  | ESLint futtatása                      |
