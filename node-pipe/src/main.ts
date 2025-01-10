import { putReport } from "./bitbucket-client";
import { generateMd5Key, isDebug } from "./common/helpers";
import { generateReport } from "./report";

export async function main(
  bitbucketRepoOwner: string,
  bitbucketRepoSlug: string,
  commitHash: string,
  bitbucketBuildNumber: string,
  eslintReportGlob: string
) {
  console.log("Start generating ESLint Code Insight report...");
  try {
    const codeInsightReport = generateReport(
      bitbucketRepoOwner,
      bitbucketRepoSlug,
      bitbucketBuildNumber,
      eslintReportGlob
    );
    const reportType = "test";
    const externalId = generateMd5Key(`${reportType}:${commitHash}`);

    const sendReportResult = await putReport(
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
      console.log("ESLint Code Insight report successfully generated!");
    } else {
      console.log(sendReportResult);
      if (!process.env.DONT_BREAK_BUILD) {
        throw new Error(
          `Bitbucket API returned unsuccessful response code: ${sendReportResult.statusCode}`
        );
      }
      return 0;
    }
  } catch (error) {
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
    eslintOutputFilePath
  );
}
