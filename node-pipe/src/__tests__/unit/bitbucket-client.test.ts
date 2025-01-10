import axios, { AxiosInstance } from "axios";
import * as bitbucketClient from "../../bitbucket-client";
import { BitbucketApiResponse } from "../../bitbucket-client";

const bitbucketRepoOwner = "myteam";
const bitbucketRepoSlug = "myrepo";
const commitHash = "not-a-commit-hash";
const reportExternalId = "sample-report-external-id";
const fakeAnnotations = {
  name: "test"
};
const fakeReport = {
  name: "my-fake-report"
};

test("test postAnnotations can submit annotations", async () => {
  const mockAxiosPost = jest
    .fn()
    .mockResolvedValue({ status: 200, data: { name: "fake-response" } });
  const getMockedAxiosInstance = (): AxiosInstance => {
    const a = axios.create();
    a.post = mockAxiosPost;
    return a;
  };
  const res: BitbucketApiResponse = await bitbucketClient.postAnnotations(
    bitbucketRepoOwner,
    bitbucketRepoSlug,
    commitHash,
    reportExternalId,
    fakeAnnotations,
    getMockedAxiosInstance
  );
  expect(res.statusCode).toBe(200);
  expect(res.jsonObj.name).toBe("fake-response");
  expect(mockAxiosPost).toHaveBeenCalledTimes(1);
});

test("test putReport can submit a report", async () => {
  const mockAxiosPut = jest
    .fn()
    .mockResolvedValue({ status: 200, data: { name: "fake-response" } });
  const getMockedAxiosInstance = (): AxiosInstance => {
    const a = axios.create();
    a.put = mockAxiosPut;
    return a;
  };
  const res: BitbucketApiResponse = await bitbucketClient.putReport(
    bitbucketRepoOwner,
    bitbucketRepoSlug,
    commitHash,
    reportExternalId,
    fakeReport,
    getMockedAxiosInstance
  );
  expect(res.statusCode).toBe(200);
  expect(res.jsonObj.name).toBe("fake-response");
  expect(mockAxiosPut).toHaveBeenCalledTimes(1);
});

test("postAnnotations fails in an expected way", async () => {
  const mockAxiosPost = jest.fn().mockRejectedValue({
    response: {
      status: 404,
      statusText: "Not Found"
    }
  });
  const getMockedAxiosInstance = (): AxiosInstance => {
    const a = axios.create();
    a.post = mockAxiosPost;
    return a;
  };
  const promiseResponse: Promise<BitbucketApiResponse> = bitbucketClient.postAnnotations(
    bitbucketRepoOwner,
    bitbucketRepoSlug,
    commitHash,
    reportExternalId,
    fakeAnnotations,
    getMockedAxiosInstance
  );
  promiseResponse
    .then(() => {
      fail("should not return successful response");
    })
    .catch(err => {
      expect(err.response.status).toBe(404);
      expect(err.response.statusText).toBe("Not Found");
      expect(mockAxiosPost).toHaveBeenCalledTimes(1);
    });
});

test("putReport fails in an expected way", async () => {
  const mockAxiosPut = jest.fn().mockRejectedValue({
    response: {
      status: 404,
      statusText: "Not Found"
    }
  });
  const getMockedAxiosInstance = (): AxiosInstance => {
    const a = axios.create();
    a.put = mockAxiosPut;
    return a;
  };
  const promiseResponse: Promise<BitbucketApiResponse> = bitbucketClient.putReport(
    bitbucketRepoOwner,
    bitbucketRepoSlug,
    commitHash,
    reportExternalId,
    fakeReport,
    getMockedAxiosInstance
  );
  promiseResponse
    .then(() => {
      fail("should not return successful response");
    })
    .catch(err => {
      expect(err.response.status).toBe(404);
      expect(err.response.statusText).toBe("Not Found");
      expect(mockAxiosPut).toHaveBeenCalledTimes(1);
    });
});

test("chunking works correctly when posting annotations", async () => {
  // fill an array with > 1000 things and call postAllAnnotations and make sure we call postAnnotations exactly 10 times
  const a = Array(1200);
  a.fill("fakeAnnotation");
  const mockPostAnnotations = jest.fn().mockResolvedValue({ statusCode: 200 });
  await bitbucketClient.postAllAnnotations(
    "",
    "",
    "",
    "",
    a,
    mockPostAnnotations
  );
  expect(mockPostAnnotations).toHaveBeenCalledTimes(10);
});
