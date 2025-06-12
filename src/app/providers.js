'use client';

import { Provider } from "react-redux";
import { store } from "@/lib/store";
import { ThemeProvider } from "next-themes";

export default function Providers({ children }) {
  return (
    <Provider store={store}>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem={false}
        disableTransitionOnChange
      >
        {children}
      </ThemeProvider>
    </Provider>
  );
} 