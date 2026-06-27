import { Route, Routes } from "react-router-dom";
import HomepageContent from "../Components/AdminPanel/AdminContent/CMSHomePage.jsx";
import CMSHomepageReviews from "../Components/AdminPanel/AdminContent/CMSHomepageReviews.jsx";
import ReviewContent from "../Components/AdminPanel/AdminContent/CMSReview.jsx";
import CMSReviewForm from "../Components/AdminPanel/AdminContent/CMSReviewForm.jsx";
import ProductReviews from "../Components/AdminPanel/AdminContent/ProductReviews.jsx";
import CMSQuestions from "../Components/AdminPanel/AdminContent/CMSQuestions.jsx";
import AdminCollection from "../Components/AdminPanel/AdminCollection/AdminCollection.jsx";
import AdminProductForm from "../Components/AdminPanel/AdminCollection/CMSProductForm.jsx";
import AdminSidebar from "../Components/AdminPanel/AdminSidebar.jsx";
import AdminTopBar from "../Components/AdminPanel/AdminTopBar.jsx";
import AdminProfile from "../Components/AdminPanel/AdminProfile.jsx";
import AdminSettings from "../Components/AdminPanel/AdminSettings.jsx";
import AdminCollectionProducts from "../Components/AdminPanel/AdminCollection/AdminCollectionProducts.jsx";
import { colours, fonts } from "../theme/theme.js";

const AdminHome = () => {
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
        <div className="bg-white border border-stone-200/80 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200" style={{ fontFamily: fonts.secondary }}>
          <div className="flex justify-between items-center text-stone-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Sales</span>
            <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.5 4.5 8.25-8.25" />
            </svg>
          </div>
          <div className="text-2xl text-stone-850 font-semibold mt-2" style={{ fontFamily: fonts.primary }}>xyx</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">xyz</div>
        </div>

        <div className="bg-white border border-stone-200/80 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200" style={{ fontFamily: fonts.secondary }}>
          <div className="flex justify-between items-center text-stone-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Products</span>
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ color: colours.accent }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4" />
            </svg>
          </div>
          <div className="text-2xl text-stone-850 font-semibold mt-2" style={{ fontFamily: fonts.primary }}>n</div>
          <div className="text-[11px] text-stone-400 mt-1">Catalog items listed</div>
        </div>

        <div className="bg-white border border-stone-200/80 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200" style={{ fontFamily: fonts.secondary }}>
          <div className="flex justify-between items-center text-stone-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Pending Orders</span>
            <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="text-2xl text-stone-850 font-semibold mt-2" style={{ fontFamily: fonts.primary }}>n</div>
          <div className="text-[11px] text-amber-600 font-medium mt-1">Awaiting dispatch</div>
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
      <main className="flex-1 p-4 md:p-8 flex flex-col gap-6">
        <AdminTopBar />
        <div className="flex-1">
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
            <Route path="/content/questions" element={<CMSQuestions />} />

            {/* Collections Group */}
            <Route path="collection" element={<AdminCollection />} />
            <Route path="collection/add-product" element={<AdminProductForm />} />
            <Route path="collection/edit/:id" element={<AdminProductForm />} />
            <Route path="collection/:slug" element={<AdminCollectionProducts />} />
  
            {/* Profile & Settings routes */}
            <Route path="profile" element={<AdminProfile />} />
            <Route path="settings" element={<AdminSettings />} />
        </Routes>
      </div>
    </main>
  </div>
);
};

export default AdminDashBoard;