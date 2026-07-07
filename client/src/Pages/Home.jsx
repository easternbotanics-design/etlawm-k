import NavBar from "../Components/NavBar2.jsx";
import HomeHero from "../Components/HomePage/HomeHero.jsx";
import HomePrinciples from "../Components/HomePage/HomePrinciples.jsx";
import HomeSupport from "../Components/HomePage/HomeSupport.jsx";
import HomeQuestions from "../Components/HomePage/HomeQuestions.jsx";
import Footer from "../Components/Footer.jsx";
import Philosophy from "../Components/HomePage/Philosophy3.jsx";
import ProductPanel from "../Components/HomePage/ProductPanel.jsx";
import HomeDirections from "../Components/HomePage/HomeDirections.jsx";
import HomePathways from "../Components/HomePage/HomePathways.jsx";
import HomeInsights from "../Components/HomePage/HomeInsights.jsx";
import HomeFinalCTA from "../Components/HomePage/HomeFinalCTA.jsx";
import HomeFooter from "../Components/HomePage/HomeFooter.jsx";

const Home = () => {
  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#F7F3EC] text-[#171715]">
      <NavBar />

      <main>
        <HomeHero />
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