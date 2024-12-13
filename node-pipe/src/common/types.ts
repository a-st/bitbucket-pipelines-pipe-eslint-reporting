export enum ReportType {
  SECURITY = "SECURITY",
  COVERAGE = "COVERAGE",
  TEST = "TEST",
  BUG = "BUG"
}

export enum ReportDataType {
  BOOLEAN = "BOOLEAN",
  DATE = "DATE",
  DURATION = "DURATION",
  LINK = "LINK",
  NUMBER = "NUMBER",
  PERCENTAGE = "PERCENTAGE",
  TEXT = "TEXT"
}

export enum ReportResult {
  PASSED = "PASSED",
  FAILED = "FAILED"
}

export enum ReportHeader {
  TOTAL = "Total",
  CRITICAL_SEVERITY = "Critical severity",
  HIGH_SEVERITY = "High severity",
  MEDIUM_SEVERITY = "Medium severity",
  LOW_SEVERITY = "Low severity",
  ESLINT = "ESLint"
}

export enum AnnotationType {
  VULNERABILITY = "VULNERABILITY",
  CODE_SMELL = "CODE_SMELL",
  BUG = "BUG"
}

export enum Severity {
  low = "LOW",
  medium = "MEDIUM",
  high = "HIGH",
  critical = "CRITICAL"
}

export const Severities = {
  0: Severity.low,
  1: Severity.medium,
  2: Severity.high
};

export enum SeverityOrder {
  critical,
  high,
  medium,
  low
}
