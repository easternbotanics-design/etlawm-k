import PageTemplate from "../components/Ingredients/IngredientsTemplate";
import NavBar from "../components/NavBar2";
import { colours } from "../theme/theme";

const Scrap = () => {
  return (
    <div style={{ backgroundColor: colours.background, minHeight: "100vh" }}>
      <NavBar />
      <div className="pt-20 md:pt-24">
        <PageTemplate />
      </div>
    </div>
  );
};

export default Scrap;