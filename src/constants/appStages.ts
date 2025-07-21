import { AppStage } from '../types/common';

export const appStage = (import.meta.env.VITE_STAGE ||
  AppStage.development) as AppStage;

export const isDevelopmentStage = appStage === AppStage.development;
export const isProductionStage = appStage === AppStage.production;
export const isStagingStage = appStage === AppStage.staging;
