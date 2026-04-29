import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import App from './App';
import reducer from './redux/reducer';

const store = createStore(reducer);

const container = document.getElementById('root');
if (!container) {
  throw new Error('Root container missing in index.html');
}

createRoot(container).render(
  <Provider store={store}>
    <App />
  </Provider>,
);
