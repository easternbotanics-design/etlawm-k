import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import ScrollToTop from './components/ScrollToTop.jsx';
import Lenis from 'lenis';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AdminRoute from './components/AdminPanel/AdminRoute.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Collection from './pages/Collection.jsx';
import Cart from './pages/Cart.jsx';
// import Product from './pages/Product2.jsx';
import Product from './pages/Product.jsx';
import Ingredients from './pages/Ingredients.jsx';
import DashBoard from './pages/DashBoard.jsx';
import Ritual from './pages/Ritual.jsx';
import AdminDashBoard from './pages/AdminDashBoard.jsx';
import OrderSuccess2 from './pages/OrderSuccess2.jsx';
import AdminOrderInfo from './components/AdminPanel/AdminOrderInfo2.jsx';
import AdminCartInfo from './components/AdminPanel/AdminCartInfo.jsx';
import { useAuth } from './context/AuthContext';
import Loader from './components/LoaderHamster.jsx';
import FloatingCart from './components/FloatingCart.jsx';
import Science from './pages/Science.jsx';
import usePageTracking from './hooks/usePageTracking.js';
// import Scrap from './Scrap.jsx';

function AppRoutes() {
  const { loading } = useAuth();
  usePageTracking();


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
        {/* <Route path="/scrap" element={<Scrap />} />*/}
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
        <Route path="/ingredient/:slug" element={<Ingredients />} />
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
              <OrderSuccess2 />
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

        <Route
          path="/cart/:cartId"
          element={
            <ProtectedRoute>
              <AdminOrderInfo />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}

        <Route
          path="/admin/operations/carts/:orderId"
          element={
            <AdminRoute>
              <AdminCartInfo />
            </AdminRoute>
          }
        />

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
