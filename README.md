<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/aafca110-dec1-4347-a2c4-e4ce59a1a0e3

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`


## Integrated teammate modules

This version integrates:
- Smart Map + Matching under `src/components/matching/SmartMapDashboard.jsx`
- HarvestGuard backend under `services/recovery-api/harvestguard/`
- Buyer backend under `services/recovery-api/buyer/`

The original teammate Smart Map component was preserved rather than rewritten. The existing SCRAPLY `matching` navigation hook now renders it.


## Integrated UI

The main React app now includes:
- `HarvestGuard` under the Actions palette (Farmer/Admin)
- `Smart Map & Matching` under the Actions palette
- Food-listing "Find Receiver" actions open Smart Map
- HarvestGuard can add its recommendation into the existing recovery pipeline for Farmer/Admin

### Run

```bash
npm install
npm run dev
```

The SCRAPLY full-stack server runs on `http://localhost:3000`.

### Optional teammate HarvestGuard API

The original FastAPI HarvestGuard service is preserved under `services/recovery-api`.
Run it separately from that directory if you want the original `/api/harvestguard/*` endpoints:

```bash
pip install -r requirements.txt
python main.py
```

It defaults to port 8000. The React HarvestGuard UI tries port 8000 first and then falls back to the SCRAPLY Node AI endpoint on port 3000.
