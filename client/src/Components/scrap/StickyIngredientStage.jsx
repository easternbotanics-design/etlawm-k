import { motion } from "framer-motion";

import BreweryPotPlaceholder from "./Kettle.jsx";
import IngredientScene from "./IngredientScene.jsx";

const StickyIngredientStage = ({
  ingredientsList,
  scrollYProgress,
  potY,
  potScale,
  potOpacity,
}) => {
  return (
    <div className="sticky top-0 h-screen overflow-hidden">
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: "50%",
          transform: "translateX(-181.7%)",
          width: "380px",
          maxWidth: "42vw",
          zIndex: 45,
        }}
      >
        <motion.div
          style={{
            y: potY,
            scale: potScale,
            opacity: potOpacity,
            transformOrigin: "181.7% bottom",
          }}
          className="w-full h-auto"
        >
          <BreweryPotPlaceholder
            scrollProgress={scrollYProgress}
            total={ingredientsList.length}
            className="h-auto w-full"
          />
        </motion.div>
      </div>

      {ingredientsList.map((ingredient, index) => (
        <IngredientScene
          key={ingredient.id}
          ingredient={ingredient}
          index={index}
          total={ingredientsList.length}
          scrollProgress={scrollYProgress}
        />
      ))}
    </div>
  );
};

export default StickyIngredientStage;