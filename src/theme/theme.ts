import originalStyled, { ThemedStyledInterface } from "styled-components";

export { css } from "styled-components";

export const theme = {
  colors: {
    background: "#212121",
    onBackground: "#ffffff",
  },
};

export type Theme = typeof theme;

export const styled = originalStyled as ThemedStyledInterface<typeof theme>;
