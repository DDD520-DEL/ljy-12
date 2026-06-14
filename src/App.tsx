import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import Reports from "@/pages/Reports";
import Assets from "@/pages/Assets";
import PasswordVault from "@/pages/PasswordVault";
import Heirs from "@/pages/Heirs";
import Will from "@/pages/Will";
import WillTemplates from "@/pages/WillTemplates";
import MFA from "@/pages/MFA";
import Witnesses from "@/pages/Witnesses";
import Executors from "@/pages/Executors";
import AuditLog from "@/pages/AuditLog";
import Simulation from "@/pages/Simulation";
import DonationPlanning from "@/pages/DonationPlanning";
import HeirVerificationCenter from "@/pages/HeirVerificationCenter";
import AssetCategoryStats from "@/pages/AssetCategoryStats";
import FamilyGraph from "@/pages/FamilyGraph";
import AccountSecurity from "@/pages/AccountSecurity";
import RecoveryKeySharding from "@/pages/RecoveryKeySharding";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/security" element={<AccountSecurity />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/assets" element={<Assets />} />
          <Route path="/vault" element={<PasswordVault />} />
          <Route path="/heirs" element={<Heirs />} />
          <Route path="/will" element={<Will />} />
          <Route path="/will-templates" element={<WillTemplates />} />
          <Route path="/simulation" element={<Simulation />} />
          <Route path="/mfa" element={<MFA />} />
          <Route path="/witnesses" element={<Witnesses />} />
          <Route path="/executors" element={<Executors />} />
          <Route path="/audit" element={<AuditLog />} />
          <Route path="/donation" element={<DonationPlanning />} />
          <Route path="/heir-verification" element={<HeirVerificationCenter />} />
          <Route path="/asset-stats" element={<AssetCategoryStats />} />
          <Route path="/family-graph" element={<FamilyGraph />} />
          <Route path="/recovery-sharding" element={<RecoveryKeySharding />} />
        </Route>
      </Routes>
    </Router>
  );
}
