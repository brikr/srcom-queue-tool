import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { RecoilRoot } from "recoil";
import { ThemeProvider } from "styled-components";
import { AuthWrapper } from "./components/AuthWrapper";
import { Game } from "./pages/Game";
import { Home } from "./pages/Home";
import { theme } from "./theme";
import GlobalStyle from "./theme/global-style";

const App: React.FC = () => {
  return (
    <RecoilRoot>
      <ThemeProvider theme={theme}>
        <GlobalStyle />
        <AuthWrapper>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="game/:gameId" element={<Game />} />
              <Route path="*" element={<Navigate to="/" />}></Route>
            </Routes>
          </BrowserRouter>
        </AuthWrapper>
      </ThemeProvider>
    </RecoilRoot>
  );
};

export default App;
