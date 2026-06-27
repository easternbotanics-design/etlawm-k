import { colours, fonts } from "../../theme/theme.js";

function resolveImage(url) {
  if (!url) return "/products/placeholder.png";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return url.startsWith("/") ? url : `/${url}`;
}

export default function ProductImageGallery({ name, badge, images, fallbackImage }) {
  const galleryImages = images?.length
    ? images
    : [{ id: "fallback", image_url: fallbackImage }];

  return (
    <div className="flex flex-col gap-2">
      {galleryImages.map((image, index) => {
        const imageUrl = resolveImage(image.image_url);

        return (
          <figure
            key={image.id || `${imageUrl}-${index}`}
            className="relative m-0 overflow-hidden rounded-lg"
            style={{ backgroundColor: colours.primary }}
          >
            <img
              src={imageUrl}
              alt={`${name} view ${index + 1}`}
              className="h-full w-full object-cover"
              onError={(event) => {
                event.currentTarget.src = "/products/placeholder.png";
              }}
            />

            {index === 0 && badge && (
              <span
                className="absolute left-5 top-5 rounded-full px-4 py-2 text-[0.68rem] uppercase tracking-[0.16em]"
                style={{
                  backgroundColor: colours.text,
                  color: colours.background,
                  fontFamily: fonts.secondary,
                }}
              >
                {badge}
              </span>
            )}
          </figure>
        );
      })}
    </div>
  );
}