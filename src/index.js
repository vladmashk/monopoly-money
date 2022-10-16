import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './GUI/App.js';
import Client from "./Client.js";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

/**
 * @param {number} money
 * @return {string}
 */
export function formatMoney(money) {
    return money.toLocaleString("en-US").replace(/,/g, " ");
}

export const client = new Client();
