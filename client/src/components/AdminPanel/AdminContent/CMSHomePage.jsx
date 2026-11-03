import AdminCard from "../AdminCard";
import { useNavigate } from "react-router-dom";

const HomepageContent = () => {
  const navigate = useNavigate();
  
  const cards = [
    {
      title: "Carousel",
      description: "Home Page Carousel Slides",
    },
    {
      title: "Reviews",
      description: "Home Page Review Section",
    },
  ];
  return (
    <div className="px-6 py-8">
      <h1 className="font-serif text-2xl font-semibold text-[#171715]">
        Homepage
      </h1>

      <p className="mt-1 text-sm text-[#7C7770]">
        Manage sections displayed on the homepage.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <AdminCard
            key={card.title}
            title={card.title}
            onClick={() => navigate(`/admin/content/homepage/${card.title.toLowerCase()}`)}
          />
        ))}
      </div>
    </div>
  );
};

export default HomepageContent;