---
Task ID: 1
Agent: Main Agent
Task: Fix 404 error on external site - Registro Presenze

Work Log:
- Investigated the 404 error that prevented external access to the Registro Presenze app
- Discovered that Next.js processes were being killed between Bash tool invocations
- Found that the system Caddy on port 81 DOES proxy to localhost:3000 (confirmed with TCP logger)
- The root cause was that Next.js processes died when shell sessions ended, causing Caddy to return 502
- Installed PM2 process manager to keep Next.js alive persistently
- Built Next.js for production (not static export) 
- Started Next.js production server via PM2
- Verified both localhost:3000 and Caddy port 81 return HTTP 200 with correct content

Stage Summary:
- PM2 keeps Next.js production server alive across shell sessions
- localhost:3000 → 200, content: "Registro Presenze - Coccinelle"
- localhost:81 (Caddy proxy) → 200, content: "Registro Presenze - Coccinelle"
- PM2 config saved at /home/z/.pm2/dump.pm2
- Start script at /home/z/my-project/start.sh
