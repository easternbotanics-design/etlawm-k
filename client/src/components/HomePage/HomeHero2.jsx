import hero from "../../assets/herobanner2.webp";
import { colours } from "../../theme/theme.js";

const HomeHero = () => {
  return (
    <section className="relative h-[400px] md:h-[650px] lg:h-[750px] w-full overflow-hidden" style={{ backgroundColor: colours.secondary }}>
      <img
        src={hero}
        alt="ETLAWM hero banner"
        className="h-full w-full object-cover object-center"
      />
    </section>
  );
};

export default HomeHero;