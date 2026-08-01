import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./app/app-shell";
import { PingPage } from "./features/ping";
import { DNSPage } from "./features/dns";
import { TraceroutePage } from "./features/traceroute";

const App = () => (
  <AppShell>
    <Routes>
      <Route path="/" element={<Navigate to="/ping" replace />} />
      <Route path="/ping" element={<PingPage />} />
      <Route path="/dns" element={<DNSPage />} />
      <Route path="/traceroute" element={<TraceroutePage />} />
    </Routes>
  </AppShell>
);

export default App;
