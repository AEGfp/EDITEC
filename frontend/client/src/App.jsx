import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { PermisosPage } from "./pages/PermisosPage";
import { PermisosFormPage } from "./pages/PermisosFormPage";
import { Navigation } from "./components/Navigation";

function App() {
  return (
    <BrowserRouter>
      <Navigation />
      <Routes>
        <Route path="/" element={<Navigate to="/" />}></Route>
        <Route path="/permisos" element={<PermisosPage />}></Route>
        <Route path="/permisos-crear" element={<PermisosFormPage />}></Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
