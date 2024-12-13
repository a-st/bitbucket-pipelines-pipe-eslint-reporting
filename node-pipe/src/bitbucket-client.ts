import axios, { AxiosInstance } from "axios";
import * as _ from "lodash";

const BITBUCKET_API_HOSTNAME = "api.bitbucket.org";
const BITBUCKET_API_PROXY_HOST = "host.docker.internal";
const BITBUCKET_API_PROXY_PORT = 29418;

export interface BitbucketApiResponse {
  success: boolean;
  statusCode: number;
  jsonObj: any;
}

export function getProxiedAxiosInstance(): AxiosInstance {
  return axios.create({
    proxy: {
      host: BITBUCKET_API_PROXY_HOST,
      port: BITBUCKET_API_PROXY_PORT
    }
  });
}

export function getReportPutUrl(
  bitbucketRepoOwner: string,
  bitbucketRepoSlug: string,
  commitHash: string,
  reportExternalId: string
): string {
  return `http://${BITBUCKET_API_HOSTNAME}/2.0/repositories/${bitbucketRepoOwner}/${bitbucketRepoSlug}/commit/${commitHash}/reports/${reportExternalId}`;
}

export function getAnnotationsPostUrl(
  bitbucketRepoOwner: string,
  bitbucketRepoSlug: string,
  commitHash: string,
  reportExternalId: string
): string {
  return `http://${BITBUCKET_API_HOSTNAME}/2.0/repositories/${bitbucketRepoOwner}/${bitbucketRepoSlug}/commit/${commitHash}/reports/${reportExternalId}/annotations`;
}

export async function putReport(
  bitbucketRepoOwner: string,
  bitbucketRepoSlug: string,
  commitHash: string,
  reportExternalId: string,
  reportPayload: any,
  getAxiosInstance: () => AxiosInstance = getProxiedAxiosInstance
): Promise<BitbucketApiResponse> {
  const proxiedAxios = getAxiosInstance();
  const url = getReportPutUrl(
    bitbucketRepoOwner,
    bitbucketRepoSlug,
    commitHash,
    reportExternalId
  );
  return put(proxiedAxios, url, reportPayload);
}

// chunk the annotations into chunks of 100 and send them all, up to 1000 (both are API endpoint limitations
export async function postAllAnnotations(
  bitbucketRepoOwner: string,
  bitbucketRepoSlug: string,
  commitHash: string,
  reportExternalId: string,
  codeInsightsAnnotations: any,
  postAnnotationsFunction: (
    bitbucketRepoOwner: string,
    bitbucketRepoSlug: string,
    commitHash: string,
    reportExternalId: string,
    annotationsPayload: any
  ) => Promise<BitbucketApiResponse> = postAnnotations
) {
  const arrayAnnotations = codeInsightsAnnotations as Array<any>;
  const chunkedAnnotations = _.chunk(arrayAnnotations.slice(0, 1000), 100);

  for (const nextBatchOf100Annotations of chunkedAnnotations) {
    let chunkApiResult: BitbucketApiResponse | undefined;
    try {
      chunkApiResult = await postAnnotationsFunction(
        bitbucketRepoOwner,
        bitbucketRepoSlug,
        commitHash,
        reportExternalId,
        nextBatchOf100Annotations
      );
    } catch (e) {
      if (!process.env.DONT_BREAK_BUILD) {
        throw e;
      }
    }

    if (chunkApiResult?.statusCode !== 200) {
      const message = "Error sending annotations to Bitbucket API";
      console.log(message);
      console.log("\nResponse: \n" + chunkApiResult?.jsonObj);
      console.log("\nResponse Status: " + chunkApiResult?.statusCode);
      if (!process.env.DONT_BREAK_BUILD) {
        throw new Error(message);
      }
    }
  }
}

// should not use for more than 100 annotations because the API endpoint doesn't except it
export async function postAnnotations(
  bitbucketRepoOwner: string,
  bitbucketRepoSlug: string,
  commitHash: string,
  reportExternalId: string,
  codeInsightsAnnotations: any,
  getAxiosInstance: () => AxiosInstance = getProxiedAxiosInstance
): Promise<BitbucketApiResponse> {
  const proxiedAxios = getAxiosInstance();
  const url = getAnnotationsPostUrl(
    bitbucketRepoOwner,
    bitbucketRepoSlug,
    commitHash,
    reportExternalId
  );
  const arrayAnnotations = codeInsightsAnnotations as Array<any>;
  if (arrayAnnotations.length > 100) {
    const message = `Cannot post more than 100 annotations at once (arrayAnnotations=${arrayAnnotations.length})`;
    console.log(message);
    throw new Error(message);
  } else {
    return post(proxiedAxios, url, codeInsightsAnnotations);
  }
}

export async function put(
  axiosInstance: AxiosInstance,
  url: string,
  postBody: any
): Promise<BitbucketApiResponse> {
  try {
    const axiosResponse = await axiosInstance.put(url, postBody);
    const responseObj = axiosResponse?.data;
    return {
      success: true,
      statusCode: axiosResponse.status,
      jsonObj: responseObj
    };
  } catch (err) {
    console.log(err);
    if (!process.env.DONT_BREAK_BUILD) {
      throw err;
    }
    return {
      success: false,
      statusCode: 0,
      jsonObj: {}
    };
  }
}

export async function post(
  axiosInstance: AxiosInstance,
  url: string,
  postBody: any
): Promise<BitbucketApiResponse> {
  try {
    const axiosResponse = await axiosInstance.post(url, postBody);
    const responseObj = axiosResponse?.data;
    return {
      success: true,
      statusCode: axiosResponse.status,
      jsonObj: responseObj
    };
  } catch (err) {
    console.log(err);
    if (!process.env.DONT_BREAK_BUILD) {
      throw err;
    }
    return {
      success: false,
      statusCode: 0,
      jsonObj: {}
    };
  }
}
