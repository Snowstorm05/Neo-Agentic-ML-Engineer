import { useCallback } from "react";
import Home from "./components/Home";
import { useColorScheme } from "./hooks/useColorScheme";

export default function App() {
  const { scheme, setScheme } = useColorScheme();
  const handleThemeChange = useCallback(
    (value: "light" | "dark") => {
      setScheme(value);
    },
    [setScheme]
  );

  return <Home scheme={scheme} handleThemeChange={handleThemeChange} />;
}
