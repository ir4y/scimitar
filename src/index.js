import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { setUrl } from './libs/service-factory';
import './index.css';

setUrl('swapi.co');

ReactDOM.render(
  <App />,
  document.getElementById('root')
);
