import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import Assets from "@/pages/Assets";
import Heirs from "@/pages/Heirs";
import Will from "@/pages/Will";
import MFA from "@/pages/MFA";
import Witnesses from "@/pages/Witnesses";
import AuditLog from "@/pages/AuditLog";
import Simulation from "@/pages/Simulation";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/assets" element={<Assets />} />
          <Route path="/heirs" element={<Heirs />} />
          <Route path="/will" element={<Will />} />
          <Route path="/simulation" element={<Simulation />} />
          <Route path="/mfa" element={<MFA />} />
          <Route path="/witnesses" element={<Witnesses />} />
          <Route path="/audit" element={<AuditLog />} />
        </Route>
      </Routes>
    </Router>
  );
}
