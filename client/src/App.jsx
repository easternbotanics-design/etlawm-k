import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import ScrollToTop from './Components/ScrollToTop.jsx';
import Lenis from 'lenis';
import './App.css';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './Components/ProtectedRoute';
import AdminRoute from './Components/AdminPanel/AdminRoute';
import Home from './Pages/Home.jsx';
import Login from './Pages/Login.jsx';
import Collection from './Pages/Collection.jsx';
import Cart from './Pages/Cart.jsx';
import Product from './Pages/Product.jsx';
import Ingredients from './Pages/Ingredients.jsx';
import DashBoard from './Pages/DashBoard.jsx';
import Ritual from './Pages/Ritual.jsx';
import AdminDashBoard from './Pages/AdminDashBoard.jsx';
import OrderSuccess from './Pages/OrderSuccess.jsx';
import AdminOrderInfo from './Components/AdminPanel/AdminOrderInfo.jsx';
import { useAuth } from './context/AuthContext';
import Loader from './Components/Loader';
import FloatingCart from './Components/FloatingCart.jsx';
import Science from './Pages/Science.jsx';


function AppRoutes() {
  const { loading } = useAuth();

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.1,
      smoothWheel: true,
      smoothTouch: false,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);



  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#FCFBF9' }}>
        <Loader />
      </div>
    );
  }

  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        {/* <Route path="/login"                    element={<Login />} />*/}
        <Route path="/login" element={<Login />} />
        {/* Collection routes */}
        <Route path="/collection" element={<Collection />} />
        <Route path="/collection/:category" element={<Collection />} />
        {/* Individual product */}
        <Route path="/product/:slug" element={<Product />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/ritual" element={<Ritual />} />
        <Route path="/ingredients" element={<Ingredients />} />
        <Route path="/science" element={<Science />} />

        {/* Protected — redirects to /login if not authenticated */}
        <Route
          path="/dashboard/*"
          element={
            <ProtectedRoute>
              <DashBoard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders/:orderId/success"
          element={
            <ProtectedRoute>
              <OrderSuccess />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders/:orderId"
          element={
            <ProtectedRoute>
              <AdminOrderInfo />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}

        <Route
          path="/admin/*"
          element={
            <AdminRoute>
              <AdminDashBoard />
            </AdminRoute>
          }
        />
      </Routes>
      <FloatingCart />
    </>
  );
}

const App = () => (
  <Router>
    {/* AuthProvider wraps everything so any child can call useAuth() */}
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  </Router>
);

export default App;
