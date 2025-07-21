import { Home } from '../pages/home';
import { isDevelopmentStage } from './appStages';

export enum AppRoutes {
  home = '/',
  summarize = '/summarize',
}

const devRoutesArray = [
  {
    path: AppRoutes.home,
    Component: Home,
  },
];

const productionExcludedRoutes: string[] = [];

export const routesArray = isDevelopmentStage
  ? devRoutesArray
  : devRoutesArray.filter(
      ({ path }) => !productionExcludedRoutes.includes(path)
    );
