import localfont from "next/font/local";

export const gordita = localfont({
  src: [
    {
      path: "../styles/Gordita/Gordita Thin.woff",
      weight: "400",
      style: "normal",
    },
    {
      path: "../styles/Gordita/Gordita Thin Italic.woff",
      weight: "400",
      style: "italic",
    },
    {
      path: "../styles/Gordita/Gordita Light.woff",
      weight: "400",
      style: "normal",
    },
    {
      path: "../styles/Gordita/Gordita Light Italic.woff",
      weight: "400",
      style: "italic",
    },
    {
      path: "../styles/Gordita/Gordita Regular.woff",
      weight: "500",
      style: "normal",
    },
    {
      path: "../styles/Gordita/Gordita Regular Italic.woff",
      weight: "500",
      style: "italic",
    },
    {
      path: "../styles/Gordita/Gordita Medium.woff",
      weight: "500",
      style: "normal",
    },
    {
      path: "../styles/Gordita/Gordita Medium Italic.woff",
      weight: "500",
      style: "italic",
    },
    {
      path: "../styles/Gordita/Gordita Bold.woff",
      weight: "600",
      style: "normal",
    },
    {
      path: "../styles/Gordita/Gordita Bold Italic.woff",
      weight: "600",
      style: "italic",
    },
    {
      path: "../styles/Gordita/Gordita Black.woff",
      weight: "700",
      style: "normal",
    },
    {
      path: "../styles/Gordita/Gordita Black Italic.woff",
      weight: "700",
      style: "italic",
    },
    {
      path: "../styles/Gordita/Gordita Ultra.woff",
      weight: "800",
      style: "normal",
    },
    {
      path: "../styles/Gordita/Gordita Ultra Italic.woff",
      weight: "800",
      style: "italic",
    },
  ],
  variable: "--font-gordita",
  display: "swap",
  preload: true,
  weight: "500",
});
