import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import * as serviceWorker from "./serviceWorker";
import { WalletProviderProvider } from "./context/WalletProvider";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import { BiconomyProvider } from "./context/Biconomy";
import BitskiCallback from "./pages/BitskiCallback";
// import { Provider } from 'react-redux'
// import store from './redux/store'

ReactDOM.render(
  // <Provider store={store}>
  <WalletProviderProvider>
    <BiconomyProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/bitskicallback" element={<BitskiCallback />} />
          <Route path="/*" element={<App />} />
        </Routes>
      </BrowserRouter>
    </BiconomyProvider>
  </WalletProviderProvider>,
  // </Provider>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
