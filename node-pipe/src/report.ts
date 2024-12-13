import * as path from "path";
import {
  ReportDataType,
  ReportResult,
  ReportType,
  ReportHeader,
  AnnotationType,
  Severities,
  Severity,
  SeverityOrder
} from "./common/types";

const MAX_ISSUES_PER_REPORT = 1000;
export const LOGO_URL =
  "https://www.vectorlogo.zone/logos/eslint/eslint-icon.svg";

export const generateReport = (
  bitbucketRepoOwner: string,
  bitbucketRepoSlug: string,
  bitbucketBuildNumber: string,
  eslintOutput: any
): object => {
  const issues = getIssuesList(eslintOutput);
  let totalErrorCount = 0;
  let totalWarningCount = 0;
  let totalFixableErrorCount = 0;
  let totalFixableWarningCount = 0;

  let totalHighSeverity = 0;
  let totalMediumSeverity = 0;
  let totalLowSeverity = 0;

  issues.forEach(issue => {
    totalErrorCount += issue.errorCount;
    totalFixableErrorCount += issue.fixableErrorCount;
    totalWarningCount += issue.warningCount;
    totalFixableWarningCount += issue.fixableWarningCount;
    issue.messages.forEach(message => {
      totalHighSeverity += message.severity === Severity.high ? 1 : 0;
      totalMediumSeverity += message.severity === Severity.medium ? 1 : 0;
      totalLowSeverity += message.severity === Severity.low ? 1 : 0;
    });
  });

  const totalIssues = totalErrorCount + totalWarningCount;
  const reportResult = totalIssues ? ReportResult.FAILED : ReportResult.PASSED;
  const title = `ESLint Report`;

  return {
    type: "report",
    report_type: ReportType.TEST, // eslint-disable-line
    reporter: ReportHeader.ESLINT,
    result: reportResult,
    logo_url: LOGO_URL, // eslint-disable-line
    title: title,
    link: createLinkUrl(
      bitbucketRepoOwner,
      bitbucketRepoSlug,
      bitbucketBuildNumber
    ),
    details: detailsContent(
      totalIssues,
      totalErrorCount,
      totalWarningCount,
      totalFixableErrorCount,
      totalFixableWarningCount
    ),
    data: dataContent(
      totalIssues,
      totalHighSeverity,
      totalMediumSeverity,
      totalLowSeverity
    )
  };
};

export function parseSeverityOrder(severity: string): SeverityOrder {
  const lcSev = severity.toLowerCase();
  if (lcSev === "critical") {
    return SeverityOrder.critical;
  } else if (lcSev === "high") {
    return SeverityOrder.high;
  } else if (lcSev === "medium") {
    return SeverityOrder.medium;
  } else if (lcSev === "low") {
    return SeverityOrder.low;
  } else {
    throw new Error(`invalid severity: ${severity}`);
  }
}

export const annotationDetails = issue => {
  const detail = `ESLint Rule ID: ${issue.id}`;
  return detail;
};

export const generateAnnotations = (eslintOutput: any): object => {
  const issues = getIssuesList(eslintOutput);
  const targetFile = eslintOutput.displayTargetFile;

  const sortedIssues = issues.sort((prev, next) => {
    const prevSev = parseSeverityOrder(prev.severity);
    const nextSev = parseSeverityOrder(next.severity);
    return prevSev - nextSev;
  });

  return sortedIssues.slice(0, MAX_ISSUES_PER_REPORT).map((issue, index) => ({
    type: "report_annotation",
    annotation_type: AnnotationType.VULNERABILITY, // eslint-disable-line
    external_id: `${index}:${issue.id}`, // eslint-disable-line
    summary: `${issue.name}@${issue.version}: ${issue.title}`,
    severity: Severity[issue.severity],
    path: targetFile,
    details: annotationDetails(issue)
  }));
};

const getIssuesList = (eslintOutput): any => {
  if (!Array.isArray(eslintOutput)) {
    eslintOutput = [eslintOutput];
  }

  let issues = [];
  eslintOutput.forEach(output => {
    const relativePath = path.relative(process.cwd(), output.filePath);
    output.messages.forEach(message => {
      message.severity = Severities[message.severity];
      message.path = relativePath;
    });

    issues = issues.concat(output);
  });

  console.log(issues);

  return issues;
};

const detailsContent = (
  totalIssues: number,
  totalErrors: number,
  totalWarnings: number,
  totalFixableErrors: number,
  totalFixableWarnings: number
): string =>
  `This pull request introduces ${totalIssues} problems (${totalErrors} errors, ${totalWarnings} warnings). ` +
  `${totalFixableErrors} errors and ${totalFixableWarnings} warnings potentially fixable with the '--fix' option.`;

const createLinkUrl = (
  bitbucketRepoOwner,
  bitbucketRepoSlug,
  bitbucketBuildNumber
): URL =>
  new URL(
    `https://bitbucket.org/${bitbucketRepoOwner}/${bitbucketRepoSlug}/addon/pipelines/home#!/results/${bitbucketBuildNumber}`
  );
const dataContent = (
  totalIssues,
  totalHighSeverity,
  totalMediumSeverity,
  totalLowSeverity
) => [
  {
    title: ReportHeader.TOTAL,
    type: ReportDataType.NUMBER,
    value: totalIssues
  },
  {
    title: ReportHeader.HIGH_SEVERITY,
    type: ReportDataType.NUMBER,
    value: totalHighSeverity
  },
  {
    title: ReportHeader.MEDIUM_SEVERITY,
    type: ReportDataType.NUMBER,
    value: totalMediumSeverity
  },
  {
    title: ReportHeader.LOW_SEVERITY,
    type: ReportDataType.NUMBER,
    value: totalLowSeverity
  }
];
