import { useParams } from "react-router-dom";
import NavBar from "../components/NavBar.jsx";
import Footer from "../components/Footer.jsx";
import IngredientsProductGrid from "../components/Ingredients/IngredientsProductGrid.jsx";
import IngredientDetailView from "../components/Ingredients/IngredientDetailView.jsx";
import { colours } from "../theme/theme.js";

const Ingredients = () => {
  const { slug } = useParams();

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: colours.background,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <NavBar />

      <main style={{ flex: 1, paddingTop: "80px" }}>
        {slug ? (
          <IngredientDetailView productSlug={slug} />
        ) : (
          <IngredientsProductGrid />
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Ingredients;