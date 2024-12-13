import * as fs from "fs";
import { generateMd5Key, isDebug } from "./common/helpers";
import { generateReport, generateAnnotations } from "./report";
import {
  postAllAnnotations,
  putReport,
  BitbucketApiResponse
} from "./bitbucket-client";

export async function main(
  bitbucketRepoOwner: string,
  bitbucketRepoSlug: string,
  commitHash: string,
  bitbucketBuildNumber: string,
  eslintOutputFilePath: string,
  generateReport: Function, // eslint-disable-line
  sendReport: (
    bitbucketTeam: string,
    repoSlug: string,
    commitHash: string,
    externalId: string,
    reportPayload: any
  ) => Promise<BitbucketApiResponse>,
  generateAnnotations: (any) => object,
  sendAnnotations: Function // eslint-disable-line
) {
  let rawESLintOutput = "";
  try {
    console.log("Start generating Code Insight report...");
    rawESLintOutput = fs.readFileSync(eslintOutputFilePath, "utf-8");
    const eslintOutput = JSON.parse(rawESLintOutput);

    const codeInsightReport = generateReport(
      bitbucketRepoOwner,
      bitbucketRepoSlug,
      bitbucketBuildNumber,
      eslintOutput
    );
    const reportType = "test";
    const externalId = generateMd5Key(`${reportType}:${commitHash}`);

    const sendReportResult = await sendReport(
      bitbucketRepoOwner,
      bitbucketRepoSlug,
      commitHash,
      externalId,
      codeInsightReport
    );

    if (
      sendReportResult.statusCode === 200 ||
      sendReportResult.statusCode === 201
    ) {
      console.log("Code Insight report successfully generated!");
    } else {
      console.log(sendReportResult);
      if (!process.env.DONT_BREAK_BUILD) {
        throw new Error(
          `Bitbucket API returned unsuccessful response code: ${sendReportResult.statusCode}`
        );
      }
      return 0;
    }

    const codeInsightsAnnotations = generateAnnotations(eslintOutput);
    const numAnnotations = (codeInsightsAnnotations as Array<any>).length;

    if (numAnnotations > 0) {
      await sendAnnotations(
        bitbucketRepoOwner,
        bitbucketRepoSlug,
        commitHash,
        externalId,
        codeInsightsAnnotations
      );
      console.log("Added annotations to CodeInsights report");
    }
  } catch (error) {
    console.log(rawESLintOutput);
    throw new Error(error as any);
  }

  return 0;
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const eslintOutputFilePath = args[0];
  const bitbucketRepoOwner = process.env.BITBUCKET_REPO_OWNER || "";
  const bitbucketRepoSlug = process.env.BITBUCKET_REPO_SLUG || "";
  const commitHash = process.env.BITBUCKET_COMMIT || "";
  const bitbucketBuildNumber = process.env.BITBUCKET_BUILD_NUMBER || "";

  if (isDebug()) {
    console.log("Report arguments:");
    console.log("eslintOutputFilePath: ", eslintOutputFilePath);
    console.log("bitbucketRepoOwner: ", bitbucketRepoOwner);
    console.log("bitbucketRepoSlug : ", bitbucketRepoSlug);
    console.log("commitHash: ", commitHash);
    console.log("bitbucketBuildNumber: ", bitbucketBuildNumber);
  }

  main(
    bitbucketRepoOwner,
    bitbucketRepoSlug,
    commitHash,
    bitbucketBuildNumber,
    eslintOutputFilePath,
    generateReport,
    putReport,
    generateAnnotations,
    postAllAnnotations
  );
}
