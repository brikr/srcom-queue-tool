import originalStyled, { ThemedStyledInterface } from "styled-components";

export { css } from "styled-components";

export const theme = {
  colors: {
    background: "#303030",
    onBackground: "#ffffff",
    card: "#424242",
    onCard: "#ffffff",
  },
};

export type Theme = typeof theme;

export const styled = originalStyled as ThemedStyledInterface<Theme>;
