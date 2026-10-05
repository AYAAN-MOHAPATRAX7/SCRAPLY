# SCRAPLY Integrated Services

This folder contains teammate-provided backend modules preserved as supplied.

## recovery-api
Includes:
- HarvestGuard FastAPI router/service/Gemma integration
- Buyer API module
- Tests and static test dashboard

Run from `services/recovery-api`:

```bash
pip install -r requirements.txt
python main.py
```

The backend uses the environment variables documented in its `.env.example`.

The React SCRAPLY application remains the main frontend. The Smart Map is integrated into the existing `matching` navigation hook.
