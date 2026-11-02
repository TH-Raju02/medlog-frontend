# MedLog Mobile

Expo (React Native) client for MedLog. UI follows the Figma MedLog Application UI and the feature list QA rules (#160–#174).

## Setup

```bash
cp .env.example .env
npm install
npx expo start
```

Set `EXPO_PUBLIC_API_URL` to your API base (use your LAN IP on a physical device).

## Screens
- Welcome / Login / Register (KW default) / OTP verify
- Dashboard Key Metrics
- Patients directory + details
- New Admission (7 steps: Manual Entry / Extract by AI; optional Ward/Room/Bed)
- Hospital Medication & Previous Antibiotics sections
- Protocol and References (no file icons)
- Specialty, Transfers, Settings, Profile

## Design tokens
Primary `#1B6EF3`, navy text, light clinical background — see `src/theme/tokens.ts`.
