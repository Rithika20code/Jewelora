
import { Routes, Route } from 'react-router-dom';

import Home from '../pages/Home';
import Login from '../pages/Auth/Login';
import Register from '../pages/Auth/Register';
import JewellerDashboard from '../pages/Jeweller/JewellerDashboard';

import AITest from '../pages/Customer/AITest';
import CustomerDashboard from '../pages/Customer/CustomerDashboard';
import DesignStudio from '../pages/Customer/DesignStudio';
import DesignResult from '../pages/Customer/DesignResult';
import MyDesigns from '../pages/Customer/MyDesigns';
import Favorites from '../pages/Customer/Favorites';

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Customer Routes */}
      <Route
        path="/customer/dashboard"
        element={<CustomerDashboard />}
      />

      <Route
        path="/design-studio"
        element={<DesignStudio />}
      />

      <Route
        path="/design-result"
        element={<DesignResult />}
      />

      <Route
        path="/my-designs"
        element={<MyDesigns />}
      />

      <Route
        path="/favorites"
        element={<Favorites />}
      />

      <Route
        path="/ai-test"
        element={<AITest />}
      />

      {/* Jeweller Route */}
      <Route
        path="/jeweller/dashboard"
        element={<JewellerDashboard />}
        />
        <Route
  path="/jeweller-requests"
  element={<JewellerDashboard />}
/>
    </Routes>
  );
}

export default AppRoutes;
