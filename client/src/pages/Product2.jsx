import { useParams } from "react-router-dom";
import ProductPage from "../components/ProductPage/ProductTemplate2.jsx";
import NavBar from "../components/NavBar2";
import ReviewGrid from "../components/ProductPage/ReviewPanel.jsx";
import SuggestedProducts from "../components/ProductPage/SuggestedProducts.jsx";
import Footer from "../components/Footer";
import IngredientSection from "../components/ProductPage/IngredientsSection2.jsx";
import ProductFAQSection from "../components/ProductPage/ProductFAQSection.jsx";
import { colours, fonts } from "../theme/theme.js";

const Product = () => {
  const { slug } = useParams();

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: colours.subBackground,
      }}
    >
      <NavBar />
      <ProductPage />
      <ReviewGrid />
      <IngredientSection slug={slug} />
      <ProductFAQSection slug={slug} />
      <SuggestedProducts currentSlug={slug} />
      <Footer />
    </div>
  );
};

export default Product;