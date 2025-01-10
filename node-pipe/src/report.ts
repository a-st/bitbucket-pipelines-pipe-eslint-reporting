import * as fs from "fs";
import { Glob } from "glob";
import * as path from "path";
import {
  AnnotationType,
  ReportDataType,
  ReportHeader,
  ReportResult,
  ReportType,
  Severities,
  Severity
} from "./common/types";

export const LOGO_URL =
  "https://www.vectorlogo.zone/logos/eslint/eslint-icon.svg";

export function generateReport(
  bitbucketRepoOwner: string,
  bitbucketRepoSlug: string,
  bitbucketBuildNumber: string,
  eslintReportGlob: string
): object {
  const glob = new Glob(eslintReportGlob, {});
  const eslintReports = glob.walkSync();

  let totalErrorCount = 0;
  let totalWarningCount = 0;
  let totalFixableErrorCount = 0;
  let totalFixableWarningCount = 0;

  let totalHighSeverity = 0;
  let totalMediumSeverity = 0;
  let totalLowSeverity = 0;

  for (const eslintReport of eslintReports) {
    console.log(`Processing ${eslintReport}`);
    const rawESLintOutput = fs.readFileSync(eslintReport, "utf-8");
    const eslintOutput = JSON.parse(rawESLintOutput);
    const issues = getIssuesList(eslintOutput);

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
  }

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
}

export const annotationDetails = issue => {
  const detail = `ESLint Rule ID: ${issue.id}`;
  return detail;
};

export const generateAnnotations = (
  eslintReportGlob: string,
  externalId: string
): object => {
  const glob = new Glob(eslintReportGlob, {});
  const eslintReports = glob.walkSync();

  let annotations: Array<object> = [];
  let i = 0;
  for (const eslintReport of eslintReports) {
    console.log(`Processing ${eslintReport}`);
    const rawESLintOutput = fs.readFileSync(eslintReport, "utf-8");
    const eslintOutput = JSON.parse(rawESLintOutput);
    const issues = getIssuesList(eslintOutput);

    issues.forEach(issue => {
      issue.messages.forEach(message => {
        annotations = annotations.concat({
          external_id: `${externalId}.${i++}`,
          path: message.path,
          annotation_type: AnnotationType.CODE_SMELL,
          summary: message.message,
          line: message.line,
          severity: message.severity
        });
      });
    });
  }

  return annotations;
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
