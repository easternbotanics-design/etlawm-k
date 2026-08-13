import NavBar from "../components/NavBar.jsx";
import HomeHero from "../components/HomePage/HomeHero.jsx";
import HomePrinciples from "../components/HomePage/HomePrinciples.jsx";
import HomeSupport from "../components/HomePage/HomeSupport.jsx";
import HomeQuestions from "../components/HomePage/HomeQuestions.jsx";
import Footer from "../components/Footer.jsx";
import Philosophy from "../components/HomePage/Philosophy3.jsx";
import ProductPanel from "../components/HomePage/ProductPanel.jsx";
import HomeDirections from "../components/HomePage/HomeDirections.jsx";
import HomePathways from "../components/HomePage/HomePathways.jsx";
import HomeInsights from "../components/HomePage/HomeInsights.jsx";
import HomeFinalCTA from "../components/HomePage/HomeFinalCTA.jsx";
import HomeFooter from "../components/HomePage/HomeFooter.jsx";
import HomeHeroCarousel from "../components/HomePage/HomeHeroCarousel.jsx";

const Home = () => {
  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#F7F3EC] text-[#171715]">
      <NavBar />

      <main>
        <HomeHero />
        <HomeHeroCarousel />
        {/* <HomeDirections />*/}
        {/* <HomePathways />*/}
        <ProductPanel />
        <HomePrinciples />
        <Philosophy />
        {/* <HomeInsights />*/}
        <HomeSupport />
        <HomeQuestions />
        {/* <HomeFinalCTA />*/}
      </main>

      <Footer />
    </div>
  );
};

export default Home;