import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
export type httpMethod = "get" | "post" | "put" | "patch";
export async function bcxEmplyoees(
  url: string,
  method: httpMethod = "get",
  payload?: any,
  authHeaders?: {
    Authorization: string;
    "Content-Type": string;
  }
) {
  const config: AxiosRequestConfig = {
    method: method,
    url: url,
    baseURL: process.env.DRUPAL_API_URL,
    headers: authHeaders,
    data: payload,
  };
  const response: AxiosResponse = await axios(config);
  return response;
}
