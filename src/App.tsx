import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { routesArray } from './constants/routes';
import { App as AppContext, ConfigProvider } from 'antd';

export const App = () => {
  return (
    <AppContext>
      <ConfigProvider>
        <Router>
          <Routes>
            {routesArray.map(({ path, Component }) => (
              <Route key={path} path={path} element={<Component />} />
            ))}

            <Route path="*" element={<div>Not found</div>} />
          </Routes>
        </Router>
      </ConfigProvider>
    </AppContext>
  );
};
