import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { Provider } from "react-redux";
import { store } from "@src/store/index.js";
import { BrowserRouter } from "react-router-dom";
import BaseLayout from "@layouts/BaseLayout";
import "@assets/styles/fonts.scss";
import "@assets/styles/style.scss";
createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <BrowserRouter>
      <BaseLayout>
        <App />
      </BaseLayout>
    </BrowserRouter>
  </Provider>
);
