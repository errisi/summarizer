import axios, { AxiosHeaders } from 'axios';
import { AppStage } from '../types/common';
import { appStage } from '../constants/appStages';
import { ACCESS_TOKEN_STORAGE_KEY } from '../constants/auth';

export const accessToken: string = localStorage.getItem('accessToken') || '';

const appAPIURLS: Record<AppStage, string> = {
  development: 'https://staging.finflo.io/api',
  staging: 'https://staging.finflo.io/api',
  production: 'https://app.finflo.io/api',
};

export const API_URL = appAPIURLS[appStage];

export const $api = axios.create({
  baseURL: API_URL,
});

$api.interceptors.request.use(config => {
  const accessToken = localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);

  if (!config.headers) {
    config.headers = new AxiosHeaders();
  }

  config.headers['Authorization'] = `Bearer ${accessToken!}`;
  return config;
});

$api.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
      window.location.href = '/';
    }
  }
);
