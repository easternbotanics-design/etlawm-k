import { useState, useEffect, useMemo } from "react";
import { Route, Routes } from "react-router-dom";
import HomepageContent from "../components/AdminPanel/AdminContent/CMSHomePage.jsx";
import CMSHomepageReviews from "../components/AdminPanel/AdminContent/CMSHomepageReviews.jsx";
import ReviewContent from "../components/AdminPanel/AdminContent/CMSReview.jsx";
import CMSReviewForm from "../components/AdminPanel/AdminContent/CMSReviewForm.jsx";
import ProductReviews from "../components/AdminPanel/AdminContent/ProductReviews.jsx";
import AdminCollection from "../components/AdminPanel/AdminCollection/AdminCollection.jsx";
import AdminProductForm from "../components/AdminPanel/AdminCollection/CMSProductForm.jsx";
import AdminSidebar from "../components/AdminPanel/AdminSidebar.jsx";
import AdminTopBar from "../components/AdminPanel/AdminTopBar.jsx";
import AdminProfile from "../components/AdminPanel/AdminProfile.jsx";
import AdminSettings from "../components/AdminPanel/AdminSettings.jsx";
import AdminCollectionProducts from "../components/AdminPanel/AdminCollection/AdminCollectionProducts.jsx";
import CMSIngredients from "../components/AdminPanel/AdminContent/CMSIngredients.jsx";
import CMSIngredientForm from "../components/AdminPanel/AdminContent/CMSIngredientForm.jsx";
import CMSRituals from "../components/AdminPanel/AdminContent/CMSRituals.jsx";
import CMSRitualForm from "../components/AdminPanel/AdminContent/CMSRitualForm.jsx";
import CMSScience from "../components/AdminPanel/AdminContent/CMSScience.jsx";
import CMSScienceForm from "../components/AdminPanel/AdminContent/CMSScienceForm.jsx";
import AdminOrders from "../components/AdminPanel/AdminOperations/AdminOrders.jsx";
import AdminCarts from "../components/AdminPanel/AdminOperations/AdminCarts.jsx";
import AdminCustomers from "../components/AdminPanel/AdminCustomers.jsx";
import AdminQuestions from "../components/AdminPanel/AdminQuestions.jsx";
import AdminCoupons from "../components/AdminPanel/AdminOperations/AdminCoupons.jsx";
import AdminShipments from "../components/AdminPanel/AdminOperations/AdminShipments.jsx";
import AdminInventory from "../components/AdminPanel/AdminOperations/AdminInventory.jsx";
import { colours, fonts } from "../theme/theme.js";
import { getDashboardStats, getAdminAnalytics } from "../services/adminService.js";


const AdminHome = () => {
  const [stats, setStats] = useState({
    activeProductsCount: 0,
    pendingOrdersCount: 0,
    sales: [],
    products: [],
  });
  const [analytics, setAnalytics] = useState({
    totalVisits: 0,
    uniqueVisitors: 0,
    todayVisits: 0,
    yesterdayVisits: 0,
    thisWeekVisits: 0,
    thisMonthVisits: 0,
    pageVisits: [],
  });
  const [loading, setLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [error, setError] = useState("");
  const [timeframe, setTimeframe] = useState("all"); // "today" | "last7" | "last30" | "year" | "all"
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);
        setError("");
        const data = await getDashboardStats();
        if (data.success) {
          setStats({
            activeProductsCount: data.activeProductsCount,
            pendingOrdersCount: data.pendingOrdersCount,
            sales: data.sales || [],
            products: data.products || [],
          });
        } else {
          setError(data.message || "Failed to load stats");
        }
      } catch (err) {
        setError(err.message || "Failed to load stats");
      } finally {
        setLoading(false);
      }
    }

    async function fetchAnalyticsData() {
      try {
        setAnalyticsLoading(true);
        const data = await getAdminAnalytics();
        if (data.success && data.analytics) {
          setAnalytics(data.analytics);
        }
      } catch (err) {
        console.error("Failed to load website analytics:", err);
      } finally {
        setAnalyticsLoading(false);
      }
    }

    fetchStats();
    fetchAnalyticsData();
  }, []);


  const aggregatedData = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const filteredSales = (stats.sales || []).filter((sale) => {
      if (timeframe === "all") return true;
      const saleDate = new Date(sale.created_at);

      if (timeframe === "today") {
        return saleDate >= todayStart;
      }

      const diffTime = Math.abs(now - saleDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (timeframe === "last7") {
        return diffDays <= 7;
      }
      if (timeframe === "last30") {
        return diffDays <= 30;
      }
      if (timeframe === "year") {
        return diffDays <= 365;
      }
      return true;
    });

    const distinctOrders = {};
    const productQuantities = {};

    // Initialize all products count to 0
    (stats.products || []).forEach((p) => {
      productQuantities[p.id] = 0;
    });

    filteredSales.forEach((sale) => {
      if (distinctOrders[sale.order_id] === undefined) {
        distinctOrders[sale.order_id] = parseFloat(sale.total) || 0;
      }

      if (productQuantities[sale.product_id] !== undefined) {
        productQuantities[sale.product_id] += parseInt(sale.quantity, 10);
      } else {
        productQuantities[sale.product_id] = parseInt(sale.quantity, 10);
      }
    });

    const totalRevenue = Object.values(distinctOrders).reduce((sum, val) => sum + val, 0);
    const salesCount = Object.keys(distinctOrders).length;

    // Map all products to their image and quantity sold
    const productsSold = (stats.products || []).map((p) => ({
      id: p.id,
      name: p.name,
      image_url: p.primary_image,
      quantity: productQuantities[p.id] || 0,
    })).sort((a, b) => b.quantity - a.quantity);

    return { totalRevenue, salesCount, productsSold };
  }, [stats.sales, stats.products, timeframe]);

  return (
    <div className="space-y-8 animate-in fade-in duration-300" style={{ fontFamily: fonts.secondary }}>
      <div>
        <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-primaryAccent mb-1 font-semibold">
        </div>
        <h1 className="text-3xl md:text-4xl text-textPrimary tracking-wide font-normal" style={{ fontFamily: fonts.primary }}>
          Dashboard Summary
        </h1>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-stone-200/80 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col justify-between" style={{ fontFamily: fonts.secondary }}>
          <div>
            <div className="flex justify-between items-center text-stone-400">
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-400">Total Sales</span>
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className="px-1.5 py-0.5 text-[10px] rounded border bg-stone-50 border-stone-200 text-stone-600 cursor-pointer outline-none focus:ring-1 focus:ring-accent transition-all duration-200"
                style={{ fontFamily: fonts.secondary, borderColor: colours.border }}
              >
                <option value="today">Today</option>
                <option value="last7">Last 7 Days</option>
                <option value="last30">30 Days</option>
                <option value="year">Year</option>
                <option value="all">All Time</option>
              </select>
            </div>
            {loading ? (
              <div className="flex items-center gap-2 py-4 animate-pulse">
                <div style={{ borderTopColor: colours.accent }} className="animate-spin rounded-full h-4 w-4 border-2 border-stone-200"></div>
                <span className="text-xs text-stone-400">Loading...</span>
              </div>
            ) : error ? (
              <div className="text-xs text-red-500 mt-2">{error}</div>
            ) : (
              <>
                <div className="text-2xl text-stone-850 font-semibold mt-2" style={{ fontFamily: fonts.primary }}>
                  ₹{aggregatedData.totalRevenue.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
                <div className="text-[11px] text-emerald-600 font-medium mt-1 mb-3">
                  {aggregatedData.salesCount} {aggregatedData.salesCount === 1 ? "sale" : "sales"} made
                </div>
                
                <button
                  onClick={() => setIsDetailsOpen(true)}
                  className="w-full py-1.5 px-3 text-xs font-semibold bg-stone-50 hover:bg-stone-100 hover:text-stone-900 border border-stone-200 rounded-lg text-stone-700 transition-colors duration-150 cursor-pointer"
                  style={{ fontFamily: fonts.secondary, borderColor: colours.border }}
                >
                  Details
                </button>
              </>
            )}
          </div>
        </div>

        <div className="bg-white border border-stone-200/80 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200" style={{ fontFamily: fonts.secondary }}>
          <div className="flex justify-between items-center text-stone-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Products</span>
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ color: colours.accent }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4" />
            </svg>
          </div>
          <div className="text-2xl text-stone-850 font-semibold mt-2" style={{ fontFamily: fonts.primary }}>
            {loading ? "..." : stats.activeProductsCount}
          </div>
          <div className="text-[11px] text-stone-400 mt-1">Catalog items listed</div>
        </div>

        <div className="bg-white border border-stone-200/80 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200" style={{ fontFamily: fonts.secondary }}>
          <div className="flex justify-between items-center text-stone-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Pending Orders</span>
            <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="text-2xl text-stone-850 font-semibold mt-2" style={{ fontFamily: fonts.primary }}>
            {loading ? "..." : stats.pendingOrdersCount}
          </div>
          <div className="text-[11px] text-amber-600 font-medium mt-1">Awaiting dispatch</div>
        </div>
      </div>

      {/* Details Popup Modal */}
      {isDetailsOpen && (
        <div className="fixed inset-0 bg-black/40 z-[999] flex items-center justify-center backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-stone-200 max-w-lg w-full max-h-[80vh] overflow-hidden flex flex-col shadow-2xl mx-4 animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-stone-100">
              <div>
                <h3 className="text-lg font-semibold text-stone-850" style={{ fontFamily: fonts.primary }}>Sales Details</h3>
                <p className="text-[11px] text-stone-400">Timeframe: <span className="capitalize font-semibold text-accent" style={{ color: colours.accent }}>{timeframe.replace("last", "last ")}</span></p>
              </div>
              <button
                onClick={() => setIsDetailsOpen(false)}
                className="p-1.5 rounded-full hover:bg-stone-100 transition-colors cursor-pointer text-stone-400 hover:text-stone-700 border-none bg-transparent"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-3" data-lenis-prevent>
              {aggregatedData.productsSold.length === 0 ? (
                <div className="text-center py-8 text-sm text-stone-400 italic">No products listed.</div>
              ) : (
                aggregatedData.productsSold.map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-2.5 rounded-xl border border-stone-100/80 hover:bg-stone-50/50 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Product Photo */}
                      <div className="w-12 h-12 rounded-lg bg-stone-50 border border-stone-200/60 overflow-hidden flex items-center justify-center shrink-0">
                        {product.image_url ? (
                          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <svg className="w-6 h-6 text-stone-300" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                          </svg>
                        )}
                      </div>
                      {/* Product Name */}
                      <span className="text-xs font-semibold text-stone-700 leading-tight truncate pr-4">
                        {product.name}
                      </span>
                    </div>
                    {/* Quantity Sold */}
                    <span
                      className="text-xs font-bold px-2.5 py-1 rounded-md shrink-0 border"
                      style={{
                        backgroundColor: product.quantity > 0 ? `${colours.accent}15` : '#faf9f6',
                        borderColor: product.quantity > 0 ? `${colours.accent}30` : colours.border,
                        color: product.quantity > 0 ? colours.accent : '#8c8c8c'
                      }}
                    >
                      Sold: {product.quantity}
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-stone-100 bg-stone-50 flex justify-between items-center text-xs text-stone-500 font-medium">
              <span>Total products listed: {aggregatedData.productsSold.length}</span>
              <button
                onClick={() => setIsDetailsOpen(false)}
                className="py-1.5 px-4 bg-stone-700 hover:bg-stone-800 text-white font-semibold rounded-lg transition-colors cursor-pointer border-none"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Website Analytics Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl md:text-2xl text-stone-800 font-normal tracking-wide" style={{ fontFamily: fonts.primary }}>
            Website Analytics
          </h2>
          <span className="text-xs text-stone-400 font-medium">Real-time Visitor Metrics</span>
        </div>

        {/* Analytics Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white border border-stone-200/80 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col justify-between" style={{ fontFamily: fonts.secondary }}>
            <div className="flex justify-between items-center text-stone-400">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Total Visits</span>
              <svg className="w-4 h-4 text-stone-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div className="text-2xl text-stone-850 font-semibold mt-2" style={{ fontFamily: fonts.primary }}>
              {analyticsLoading ? "..." : (analytics.totalVisits || 0).toLocaleString("en-US")}
            </div>
            <div className="text-[11px] text-stone-400 mt-1">All recorded page views</div>
          </div>

          <div className="bg-white border border-stone-200/80 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col justify-between" style={{ fontFamily: fonts.secondary }}>
            <div className="flex justify-between items-center text-stone-400">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Unique Visitors</span>
              <svg className="w-4 h-4 text-stone-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.647-6.374-1.765a4.125 4.125 0 017.898-2.072M12 9a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5zm7.5 3.75a3 3 0 100-6 3 3 0 000 6z" />
              </svg>
            </div>
            <div className="text-2xl text-stone-850 font-semibold mt-2" style={{ fontFamily: fonts.primary }}>
              {analyticsLoading ? "..." : (analytics.uniqueVisitors || 0).toLocaleString("en-US")}
            </div>
            <div className="text-[11px] text-stone-400 mt-1">Distinct visitor IDs</div>
          </div>

          <div className="bg-white border border-stone-200/80 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col justify-between" style={{ fontFamily: fonts.secondary }}>
            <div className="flex justify-between items-center text-stone-400">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Visits Today</span>
              <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-2xl text-stone-850 font-semibold mt-2" style={{ fontFamily: fonts.primary }}>
              {analyticsLoading ? "..." : (analytics.todayVisits || 0).toLocaleString("en-US")}
            </div>
            <div className="text-[11px] text-emerald-600 font-medium mt-1">Since 00:00 today</div>
          </div>

          <div className="bg-white border border-stone-200/80 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col justify-between" style={{ fontFamily: fonts.secondary }}>
            <div className="flex justify-between items-center text-stone-400">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Visits This Week</span>
              <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
            </div>
            <div className="text-2xl text-stone-850 font-semibold mt-2" style={{ fontFamily: fonts.primary }}>
              {analyticsLoading ? "..." : (analytics.thisWeekVisits || 0).toLocaleString("en-US")}
            </div>
            <div className="text-[11px] text-stone-400 mt-1">Current calendar week</div>
          </div>

          <div className="bg-white border border-stone-200/80 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col justify-between" style={{ fontFamily: fonts.secondary }}>
            <div className="flex justify-between items-center text-stone-400">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Visits This Month</span>
              <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
              </svg>
            </div>
            <div className="text-2xl text-stone-850 font-semibold mt-2" style={{ fontFamily: fonts.primary }}>
              {analyticsLoading ? "..." : (analytics.thisMonthVisits || 0).toLocaleString("en-US")}
            </div>
            <div className="text-[11px] text-stone-400 mt-1">Current calendar month</div>
          </div>
        </div>

        {/* Page Visit Breakdown Card */}
        <div className="bg-white border border-stone-200/80 rounded-2xl p-6 shadow-sm" style={{ fontFamily: fonts.secondary }}>
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-base text-stone-850 font-semibold" style={{ fontFamily: fonts.primary }}>Top Page Visits</h3>
              <p className="text-xs text-stone-400">Page-level visit breakdown sorted by popularity</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-stone-100 text-stone-600">
              {(analytics.pageVisits || []).length} routes tracked
            </span>
          </div>

          {analyticsLoading ? (
            <div className="py-6 text-center text-xs text-stone-400 animate-pulse">Loading page visits breakdown...</div>
          ) : (analytics.pageVisits || []).length === 0 ? (
            <div className="py-6 text-center text-xs text-stone-400 italic">No page visits recorded yet.</div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1" data-lenis-prevent>
              {(analytics.pageVisits || []).map((pv, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl border border-stone-100 hover:bg-stone-50/60 transition-colors">
                  <div className="flex items-center gap-3 min-w-0 pr-4">
                    <span className="text-xs font-bold text-stone-300 w-5 shrink-0 text-right">#{idx + 1}</span>
                    <span className="text-xs font-mono font-medium text-stone-800 truncate bg-stone-50 px-2 py-0.5 rounded border border-stone-200/60">
                      {pv.path}
                    </span>
                  </div>
                  <span
                    className="text-xs font-bold px-2.5 py-1 rounded-md shrink-0 border"
                    style={{
                      backgroundColor: `${colours.accent}12`,
                      borderColor: `${colours.accent}25`,
                      color: colours.accent,
                    }}
                  >
                    {pv.visits.toLocaleString("en-US")} {pv.visits === 1 ? "visit" : "visits"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Links Section */}
      <div className="bg-stone-50 border border-stone-200/60 rounded-2xl p-6 md:p-8" style={{ fontFamily: fonts.secondary }}>

        <h3 className="text-lg text-stone-800 font-semibold mb-4" style={{ fontFamily: fonts.primary }}>Quick Management Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <a href="/admin/collection" className="bg-white hover:bg-stone-100/50 border border-stone-200/80 p-4 rounded-xl flex items-center gap-4 transition-colors">
            <div className="p-2.5 rounded-lg" style={{ background: `${colours.primary}66`, color: colours.accent }}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-3.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
            </div>
            <div>
              <div className="text-sm font-semibold text-stone-800">Browse Catalog</div>
              <div className="text-xs text-stone-400 mt-0.5">View and filter products</div>
            </div>
          </a>
          
          <a href="/admin/collection/add-product" className="bg-white hover:bg-stone-100/50 border border-stone-200/80 p-4 rounded-xl flex items-center gap-4 transition-colors">
            <div className="p-2.5 rounded-lg" style={{ background: `${colours.primary}66`, color: colours.accent }}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </div>
            <div>
              <div className="text-sm font-semibold text-stone-800">Add New Product</div>
              <div className="text-xs text-stone-400 mt-0.5">Create new item entry</div>
            </div>
          </a>

          <a href="/admin/content/homepage" className="bg-white hover:bg-stone-100/50 border border-stone-200/80 p-4 rounded-xl flex items-center gap-4 transition-colors">
            <div className="p-2.5 rounded-lg" style={{ background: `${colours.primary}66`, color: colours.accent }}>
              <svg
                className="w-5 h-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 800 800"
                fill="currentColor"
              >
                <path d="M601 68.5c-18.8 3.6-37.3 11.4-55.6 23.6-13.7 9.2-.7-3.7-251.7 248.6C168 467 88.2 548 85.4 552c-7.4 10.6-11.5 19.2-15.7 33.5-1.9 6.4-2.1 10.3-2.4 47.9-.4 35.3-.2 41.9 1.2 48.3 5.3 23.7 25.4 44.3 48.7 49.8 9.4 2.2 79.1 2.2 90.8-.1 14.9-2.8 28.6-8.7 41-17.8 3-2.2 74.6-73.3 159-158 292.5-293.8 294-295.3 301-305.4 17.7-25.3 24.8-48.3 23.7-76.7-.6-17.7-3.6-29.6-11.2-45-6.4-13-12.6-21.5-22.8-31.2-13.6-12.9-29.7-21.9-48.2-26.9-8.5-2.3-12.4-2.7-26-3-10.8-.2-18.4.2-23.5 1.1m30.2 65.6c18 3.8 31.9 18.5 34.9 36.9 2 12.7-2 27.3-11.3 40.7-1.8 2.7-9.3 11-16.7 18.6l-13.5 13.8-35.3-35.3-35.3-35.3 9.3-9.3c15-15.2 27.5-23.6 41.7-28.1 10.6-3.3 17.5-3.8 26.2-2m-54.4 157.1c-.2.4-82.9 83.6-183.8 184.9-171.6 172.3-183.9 184.4-190 187.3l-6.5 3.1h-63v-31c0-33.4.3-36 5.3-43.3 1.5-2.3 85-86.8 185.6-187.7l182.9-183.7 34.9 34.9c19.1 19.1 34.7 35.1 34.6 35.5M422.4 668.8c-9.9 3.5-18 12-21 22-4.7 16.2 4.4 34.2 20.2 40.2 5.5 2 6.2 2 146.2 1.8l140.7-.3 5.5-2.6c6.6-3.2 12.3-8.7 15.8-15.4 2.3-4.3 2.7-6.2 2.7-14 0-7.7-.4-9.8-2.6-14.5-3.3-7-8.9-12.6-15.9-15.9l-5.5-2.6-140.5-.2c-132.1-.2-140.8-.1-145.6 1.5" />
              </svg>
            </div>
            <div>
              <div className="text-sm font-semibold text-stone-800">Edit Website CMS</div>
              <div className="text-xs text-stone-400 mt-0.5">Configure homepage contents</div>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}

const AdminDashBoard = () => {
  return (
    <div className="min-h-screen bg-mainBackground flex flex-col md:flex-row" style={{ fontFamily: fonts.secondary, backgroundColor: colours.background }}>
      {/* Left Sidebar */}
      <AdminSidebar />

      {/* Main Area */}
      <main className="flex-1 flex flex-col min-w-0">
        <AdminTopBar />
        <div className="flex-1 p-4 md:p-8">
          <Routes>
          {/* Dashboard */}
            <Route path="/dashboard" element={<AdminHome />} />

            {/* Content Group */}
            <Route path="/content/homepage" element={<HomepageContent />} />
            <Route path="/content/homepage/reviews" element={<CMSHomepageReviews />} />
            <Route path="/content/reviews" element={<ReviewContent />} />
            <Route path="/content/reviews/add-review" element={<CMSReviewForm />} />
            <Route path="/content/reviews/edit/:id" element={<CMSReviewForm />} />
            <Route path="/content/reviews/:slug" element={<ProductReviews />} />
            <Route path="/content/ingredients" element={<CMSIngredients />} />
            <Route path="/content/ingredients/add" element={<CMSIngredientForm />} />
            <Route path="/content/ingredients/edit/:id" element={<CMSIngredientForm />} />
            <Route path="/content/rituals" element={<CMSRituals />} />
            <Route path="/content/rituals/add" element={<CMSRitualForm />} />
            <Route path="/content/rituals/edit/:id" element={<CMSRitualForm />} />
            <Route path="/content/science" element={<CMSScience />} />
            <Route path="/content/science/add" element={<CMSScienceForm />} />
            <Route path="/content/science/edit/:id" element={<CMSScienceForm />} />
            <Route path="/content/questions" element={<AdminQuestions />} />


            {/* Collections Group */}
            <Route path="collection" element={<AdminCollection />} />
            <Route path="collection/add-product" element={<AdminProductForm />} />
            <Route path="collection/edit/:id" element={<AdminProductForm />} />
            <Route path="collection/:slug" element={<AdminCollectionProducts />} />
  
            {/* Operations Group */}
            <Route path="operations/orders" element={<AdminOrders />} />
            <Route path="operations/carts" element={<AdminCarts />} />
            <Route path="operations/coupons" element={<AdminCoupons />} />
            <Route path="operations/shipments" element={<AdminShipments />} />
            <Route path="operations/inventory" element={<AdminInventory />} />

            {/* Profile & Settings routes */}
            <Route path="customers" element={<AdminCustomers />} />
            <Route path="profile" element={<AdminProfile />} />
            <Route path="settings" element={<AdminSettings />} />
        </Routes>
      </div>
    </main>
  </div>
);
};

export default AdminDashBoard;