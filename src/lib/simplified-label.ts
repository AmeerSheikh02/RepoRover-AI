const KEYWORD_LABELS: Array<{ keywords: string[]; label: string }> = [
  { keywords: ["auth", "login", "signup"], label: "Authentication Module" },
  { keywords: ["api", "service"], label: "Backend Service Module" },
  { keywords: ["component", "ui"], label: "UI Components" },
  { keywords: ["config", "env"], label: "Configuration Module" },
  { keywords: ["page", "route", "screen"], label: "Feature Views" },
  { keywords: ["model", "schema", "entity"], label: "Data Models" },
  { keywords: ["test", "spec", "__tests__"], label: "Test Suite" },
  { keywords: ["util", "helper", "common"], label: "Utilities" },
];

export type PathNodeKind = "file" | "folder";

const simplifiedLabelCache = new Map<string, string>();

function normalizeFilePath(filePath: string): string {
  return filePath.replace(/\\/g, "/").replace(/\/+/g, "/").toLowerCase();
}

function buildCacheKey(normalizedPath: string, kind: PathNodeKind): string {
  return `${kind}:${normalizedPath}`;
}

function humanizeSegment(value: string): string {
  return value
    .replace(/\.[^.]+$/, "")
    .replace(/[-_]+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (character) => character.toUpperCase())
    .trim() || value;
}

function classifySimplifiedLabel(normalizedPath: string, kind: PathNodeKind): string {
  const segments = normalizedPath.split("/").filter(Boolean);
  const terminalSegment = segments[segments.length - 1] || normalizedPath;
  const searchSpace = `${normalizedPath} ${terminalSegment}`;

  for (const entry of KEYWORD_LABELS) {
    if (entry.keywords.some((keyword) => searchSpace.includes(keyword))) {
      return entry.label;
    }
  }

  if (kind === "folder") {
    return `${humanizeSegment(terminalSegment)} Module`;
  }

  return `${humanizeSegment(terminalSegment)} File`;
}

export function simplifyFilePathLabel(filePath: string, kind: PathNodeKind = "file"): string {
  const normalizedPath = normalizeFilePath(filePath);
  const cacheKey = buildCacheKey(normalizedPath, kind);

  const cachedLabel = simplifiedLabelCache.get(cacheKey);
  if (cachedLabel) {
    return cachedLabel;
  }

  const resolvedLabel = classifySimplifiedLabel(normalizedPath, kind);
  simplifiedLabelCache.set(cacheKey, resolvedLabel);
  return resolvedLabel;
}

export function precomputeSimplifiedLabelMap(filePaths: string[], kind: PathNodeKind = "file"): Map<string, string> {
  const labelMap = new Map<string, string>();

  for (const filePath of filePaths) {
    const normalizedPath = normalizeFilePath(filePath);
    labelMap.set(normalizedPath, simplifyFilePathLabel(normalizedPath, kind));
  }

  return labelMap;
}

export function getSimplifiedLabelIcon(simplifiedLabel: string): string {
  if (simplifiedLabel.includes("UI")) {
    return "🎨";
  }

  if (simplifiedLabel.includes("Authentication")) {
    return "🔐";
  }

  if (simplifiedLabel.includes("Backend")) {
    return "⚙️";
  }

  return "";
}