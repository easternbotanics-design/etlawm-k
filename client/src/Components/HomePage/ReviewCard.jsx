import { colours, fonts } from "../../theme/theme";
import { Link } from "react-router-dom";

const ReviewCard = ({ review }) => {
  return (
    <div className="ml-1 w-[360px] shrink-0 transition-transform duration-300 ease-out hover:z-10 hover:scale-105 cursor-pointer">
      
      {/* customer review*/}
      <div
        className="relative flex h-[300px] flex-col justify-between rounded-lg px-10 py-8 shadow-[0_12px_35px_rgba(0,0,0,0.07)]"
        style={{
          backgroundColor: colours.background,
          fontFamily: fonts.primary
        }}
      >
        <div>
          <Link
            to={review.productLink}
            className="mb-3 block w-fit text-sm font-semibold underline-offset-4 hover:underline"
            style={{
              color: colours.accent,
            }}
          >
            {review.productName}
          </Link>
          <div className="mb-1 flex gap-1 text-lg text-emerald-400">
            {Array.from({ length: review.rating }).map((_, index) => (
              <span key={index}>★</span>
            ))}
          </div>
          
          <p
            className="line-clamp-4 text-sm leading-6 text-neutral-700 align-top"
            style={{
              fontFamily: fonts.secondary
            }}
          >
            {review.text}
          </p>
        </div>


        {/* customer info */}
        <div className="min-w-0 flex h-[52px] gap-3 items-center pl-1">
          <h4
            className="truncate text-lg font-semibold text-neutral-900"
            style={{
              fontFamily: fonts.secondary
            }}
          >
            {review.name}
          </h4>
        </div>
      </div>
    </div>
  );
};

export default ReviewCard;