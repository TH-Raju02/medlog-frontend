// Values sampled from the MedLog Figma file (1024px iPad frames rendered 1:1).
export const colors = {
  // Brand & actions
  primary: "#63A2BB",
  primaryStrong: "#2C7895",
  primaryDisabled: "#AFC3C9",
  brand: "#176B83",
  brandSection: "#126B85",
  logo: "#36829C",
  accent: "#48A0B7",
  link: "#3B82F6",

  // Surfaces
  background: "#F8FCFE",
  surface: "#FFFFFF",
  header: "#C6E2E8",
  statusBar: "#F3F7F9",
  overlay: "rgba(15, 35, 40, 0.10)",

  // Text
  text: "#17343C",
  heading: "#18343D",
  textBody: "#596F75",
  muted: "#668087",
  mutedLight: "#93A2A6",
  placeholder: "#A9B6BB",
  tabText: "#375159",
  menuText: "#263F47",
  white: "#FFFFFF",

  // Borders
  border: "#CFE0E4",
  divider: "#DCE5E5",
  inputBorder: "#D3E0E2",
  subHeaderBorder: "#DCE6E7",
  subHeaderSubtitle: "#94A4A9",

  // Inputs & controls
  inputBg: "#F1F4F8",
  searchBg: "#F8FAF9",
  optionSelectedBg: "#E0ECF1",
  radioRing: "#496168",
  checkbox: "#2D9780",
  checkboxBorder: "#B8D7DE",
  iconButtonBg: "#F4F8F9",

  // Navigation
  tabActiveBg: "#E7F2F5",
  tabActiveText: "#19718C",
  userPill: "#4C8CA2",
  userPillInner: "#E7F2F5",
  menuName: "#4596AA",

  // Soft buttons, chips, badges, avatars
  softButtonBg: "#E8F3F6",
  softButtonText: "#206B7C",
  chipSelectedBg: "#EDF7F9",
  chipBorder: "#D3E1E4",
  chipText: "#7D9095",
  badgeBg: "#EDF4F5",
  avatarBg: "#CCE7ED",
  avatarText: "#26758B",
  patientTealBg: "#D9EDF1",
  iconTileBg: "#E5F2F5",
  iconTile: "#2F839A",
  emptyTileBg: "#E9F4F6",
  emptyTileIcon: "#7DB7C4",
  emptyTitle: "#294A53",
  emptyText: "#A1AFB3",
  quickActionBg: "#EDF4FF",
  quickActionBorder: "#A8CBDD",

  // Status
  success: "#007A55",
  successBg: "#E6F4EF",
  successSoftBg: "#E3F2ED",
  warning: "#CC7730",
  warningBg: "#FFF2BF",
  danger: "#E7000B",
  dangerBg: "#FCEDED",
  dangerSwipeBg: "#FFE0E1",
  logout: "#FB2C36",
  dotToday: "#FB2C36",
  dotTomorrow: "#FF751F",
  dotLater: "#FFDF20",
  laterText: "#D29E00",

  // Table
  tableHeaderBg: "#F8FBFB",
  tableHeaderText: "#5D7880",

  // Auth screens
  authLabel: "#4D7E92",
  authInputBg: "#F8FCFE",
  authPlaceholder: "#B0BAC1",
  authSubtitle: "#98A4AC",
  authBackBg: "#EAF6FA",
  authBackText: "#ACB8C0",
  authIcon: "#9AA9AF",

  // Plans & checkout
  planSelected: "#2E90E5",
  planTitle: "#0F1A1D",
  planSaveGreenBg: "#E2F6F5",
  planSaveGreen: "#4FB9AC",
  planSaveBlueBg: "#DAECFA",
  planSaveBlue: "#2479C4",
  stripe: "#0074D4",
  stripeTestBg: "#FFDE92",
  stripeTestText: "#A8461C",

  // Clinical workspace
  allergyBg: "#FDE6E6",
  allergyBorder: "#F5B5B8",
  noAllergyBg: "#E3F2ED",
  softActionBg: "#EDF4FF",
  softActionText: "#5A93AE",
  reviewedBg: "#E3F2ED",
  pendingBg: "#FFF8E1",
  pendingText: "#C46A1A",
  tileBg: "#F4F6F7",
  tileActiveBg: "#DCEBF0",
  segmentBg: "#EEF3F5",
  dangerSoftBg: "#FDECEC",
  dischargedBg: "#F8ECEC",
  folder: "#E3AE4C",
  profileAvatar: "#1A8CBB",
  pdf: "#E04E4E",
};

export const metricTones = {
  teal: { bg: "#EEF8FA", fg: "#328AA0" },
  red: { bg: "#FCEDED", fg: "#E7000B" },
  brown: { bg: "#FCEEE8", fg: "#9D4F2C" },
  green: { bg: "#E8F5F0", fg: "#007A55" },
} as const;

export const gradients = {
  auth: ["#F6FBFD", "#D3EEF7", "#CAE5DC"] as const,
  authStops: [0, 0.6, 1] as const,
  button: ["#56B3D5", "#72C3B8"] as const,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const radius = {
  sm: 6,
  md: 8,
  lg: 10,
  xl: 12,
  xxl: 16,
  full: 999,
};

export const fonts = {
  regular: "Inter_400Regular",
  medium: "Inter_500Medium",
  semibold: "Inter_600SemiBold",
  bold: "Inter_700Bold",
};

export const typography = {
  pageTitle: { fontSize: 20, lineHeight: 28, fontFamily: fonts.semibold, color: colors.brand },
  pageSubtitle: { fontSize: 12, lineHeight: 18, fontFamily: fonts.regular, color: colors.muted },
  sectionTitle: { fontSize: 15, lineHeight: 22, fontFamily: fonts.semibold, color: colors.brandSection },
  cardTitle: { fontSize: 16, lineHeight: 24, fontFamily: fonts.semibold, color: colors.heading },
  subHeaderTitle: { fontSize: 17, lineHeight: 24, fontFamily: fonts.semibold, color: colors.heading },
  title: { fontSize: 20, lineHeight: 28, fontFamily: fonts.semibold, color: colors.heading },
  subtitle: { fontSize: 15, lineHeight: 22, fontFamily: fonts.semibold, color: colors.text },
  body: { fontSize: 14, lineHeight: 20, fontFamily: fonts.regular, color: colors.textBody },
  bodyStrong: { fontSize: 14, lineHeight: 20, fontFamily: fonts.semibold, color: colors.text },
  label: { fontSize: 13, lineHeight: 18, fontFamily: fonts.semibold, color: colors.text },
  caption: { fontSize: 12, lineHeight: 16, fontFamily: fonts.regular, color: colors.muted },
  badge: { fontSize: 10, lineHeight: 14, fontFamily: fonts.bold, letterSpacing: 0.4 },
  authTitle: { fontSize: 28, lineHeight: 36, fontFamily: fonts.bold, color: colors.primary },
  authLabel: { fontSize: 13, lineHeight: 18, fontFamily: fonts.semibold, color: colors.authLabel },
};

export const shadows = {
  card: {
    shadowColor: "#17343C",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  raised: {
    shadowColor: "#17343C",
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
};

export const breakpoints = {
  tablet: 600,
  desktop: 1200,
};

export const layout = {
  // Figma iPad frame: 1024 wide with 32px gutters → 960 content.
  maxContentWidth: 960,
  authFormWidth: 704,
  gutter: { phone: 16, tablet: 32 },
};
