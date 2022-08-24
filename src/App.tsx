import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "styled-components";
import { Game } from "./pages/Game";
import { Home } from "./pages/Home";
import { theme } from "./theme";
import GlobalStyle from "./theme/global-style";

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="game/:gameId" element={<Game />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
