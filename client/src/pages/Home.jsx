import NavBar from "../components/NavBar2.jsx";
import HomeHero from "../components/HomePage/HomeHero2.jsx";
import ProductCombo from "../components/HomePage/ProductCombo.jsx";
import HomePrinciples from "../components/HomePage/HomePrinciples.jsx";
import HomeSupport from "../components/HomePage/HomeSupport.jsx";
import HomeQuestions from "../components/HomePage/HomeQuestions.jsx";
import Footer from "../components/Footer.jsx";
import Philosophy from "../components/HomePage/Philosophy.jsx";
import ProductPanel from "../components/HomePage/ProductPanel.jsx";
import ReviewSection from "../components/HomePage/ReviewCarousel.jsx";
import ShopByConcern from "../components/HomePage/ShopByConcern";

const Home = () => {
  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#F7F3EC] text-[#171715]">
      <NavBar />
      

      <main>
        <HomeHero />
        <ProductCombo />
        <ProductPanel />
        <ShopByConcern />
        <ReviewSection />
        <HomePrinciples />
        <Philosophy />
        <HomeSupport />
        <HomeQuestions />
      </main>

      <Footer />
    </div>
  );
};

export default Home;