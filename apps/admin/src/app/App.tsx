// src/app/App.tsx
import { RouteData } from '@/app/RouteData';
import PageLoader from '@/components/layouts/PageLoader';
import { SERVER_TYPE } from '@/constants';
import { initAxios } from '@/core/network';
import { RouteRenderer } from '@/core/route-meta';
import { store } from '@/store';
import { Suspense } from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';
import { persistStore } from 'redux-persist';
import { PersistGate } from 'redux-persist/integration/react';

function App() {
  // redux-persist의 상태 저장 관리 객체 생성
  const persistor = persistStore(store);

  function hdBeforLift() {
    const state = store.getState();

    const axios = initAxios(state.config.server == SERVER_TYPE.LIVE ? import.meta.env.VITE_API_BASE_URL_LIVE : import.meta.env.VITE_API_BASE_URL_DEV);

    if (state.auth.isSigned) {
      axios.defaults.headers.common = {};
      axios.defaults.headers.common['Authorization'] = `Bearer ${state.auth.accessToken}`;
    }
  }
  return (
    // Redux 상태 전역 제공
    <ReduxProvider store={store}>
      {/* persist된 상태를 재하이드레이션 될 때까지 대기 */}
      <PersistGate persistor={persistor} onBeforeLift={hdBeforLift}>
        <Router>
          {/* lazy로 불러오는 페이지에 대한 fallback 로딩 UI */}
          <Suspense fallback={<PageLoader className={'h-screen'} />}>
            {/* 라우트 렌더링 */}
            <RouteRenderer data={RouteData} />
          </Suspense>
        </Router>
      </PersistGate>
    </ReduxProvider>
  );
}

export default App;
