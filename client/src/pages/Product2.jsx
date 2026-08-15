import { useParams } from "react-router-dom";
import ProductPage from "../components/ProductPage/ProductTemplate2.jsx";
import NavBar from "../components/NavBar";
import ReviewGrid from "../components/ProductPage/ReviewPanel.jsx";
import SuggestedProducts from "../components/ProductPage/SuggestedProducts.jsx";
import Footer from "../components/Footer";
import IngredientSection from "../components/ProductPage/IngredientsSection.jsx";
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
      <IngredientSection slug={slug} />
      <ReviewGrid />
      <SuggestedProducts currentSlug={slug} />
      <Footer />
    </div>
  );
};

export default Product;