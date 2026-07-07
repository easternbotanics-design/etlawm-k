import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getProducts } from "../services/productService";
import shelfSvg from "../assets/shelf.svg";

const MOCK_PRODUCTS = [
  { id: 1, name: "Hair Serum", price: 850, image: "/products/hair-serum.png", slug: "hair-serum" },
  { id: 2, name: "Face Wash", price: 650, image: "/products/face-wash.png", slug: "face-wash" },
  { id: 3, name: "Hair Mask", price: 1200, image: "/products/hair-mask.png", slug: "hair-mask" },
];

const ProductCard = ({ product }) => {
  if (!product) return null;

  return (
    <div className="relative select-none flex flex-col items-center justify-end w-[clamp(80px,12vw,120px)]">
      {/* Product Image Link */}
      <Link 
        to={`/product/${product.slug}`} 
        className="relative z-10 flex flex-col items-center justify-end cursor-pointer transition-transform duration-300 ease-out hover:-translate-y-3 hover:scale-105"
      >
        {/* Soft Shadow on the shelf board */}
        <div className="absolute bottom-[2px] left-1/2 -translate-x-1/2 w-[70%] h-[4px] bg-[#5c503b]/25 blur-[2px] pointer-events-none" />
        
        {/* Product Image */}
        <img 
          src={product.image} 
          alt={product.name} 
          className="h-[clamp(90px,13vh,130px)] object-contain drop-shadow-[0_4px_6px_rgba(0,0,0,0.1)] transition-all duration-300"
        />
      </Link>
    </div>
  );
};

const PlantShelf = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await getProducts();
        const active = (data || []).filter(p => p.isActive);
        setProducts(active);
      } catch (err) {
        console.error("Failed to load products on shelf:", err);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  const getProductForSlot = (index) => {
    const list = products.length > 0 ? products : MOCK_PRODUCTS;
    if (index < list.length) {
      return list[index];
    }
    return null;
  };

  return (
    <section className="min-h-screen w-full bg-[#F5D6B8] py-8 px-4 flex flex-col items-center justify-center overflow-x-hidden relative">
      
      {/* Back to Home Button */}
      <Link 
        to="/" 
        className="absolute left-6 top-6 font-secondary text-[10px] md:text-xs text-[#5c503b] hover:text-[#080808] tracking-widest uppercase transition-colors duration-200 flex items-center gap-1 z-50"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-3.5 h-3.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        Home
      </Link>

      {/* Responsive Stretchy Shelf Container */}
      <div className="relative h-[480px] md:h-[640px] w-[95%] md:w-[60%] max-w-[800px] flex items-stretch bg-transparent mx-auto select-none mt-12 md:mt-0">
        
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-secondary text-sm text-[#5c503b] animate-pulse">
              Polishing the shelves...
            </span>
          </div>
        ) : (
          <>
            {/* Left Column (Covers x = 0 to 400 of the 975 width space) */}
            <div className="h-full relative shrink-0 z-10 overflow-hidden" style={{ aspectRatio: "400 / 1080" }}>
              <img 
                src={shelfSvg} 
                alt="" 
                className="absolute top-0 left-0 h-full max-w-none"
                style={{ aspectRatio: "975 / 1080" }}
              />

              {/* Inner Rack lines for Left Column */}
              {/* Rack 1 (Middle-Top, y = 515) */}
              <div className="absolute bg-black" style={{ left: "52.0%", right: 0, top: "47.68%", height: "1.85%" }} />
              {/* Rack 2 (Middle-Bottom, y = 752) */}
              <div className="absolute bg-black" style={{ left: "52.0%", right: 0, top: "69.63%", height: "1.85%" }} />

              {/* Shelf 2 Left: Product 0 */}
              <div 
                className="absolute animate-fade-in" 
                style={{ left: "86.87%", bottom: "52.3%", transform: "translateX(-50%)" }}
              >
                <ProductCard product={getProductForSlot(0)} />
              </div>

              {/* Shelf 3 Left: Product 3 */}
              <div 
                className="absolute animate-fade-in" 
                style={{ left: "86.87%", bottom: "30.37%", transform: "translateX(-50%)" }}
              >
                <ProductCard product={getProductForSlot(3)} />
              </div>

              {/* Shelf 4 Left: Product 6 */}
              <div 
                className="absolute animate-fade-in" 
                style={{ left: "86.87%", bottom: "5.5%", transform: "translateX(-50%)" }}
              >
                <ProductCard product={getProductForSlot(6)} />
              </div>
            </div>

            {/* Middle stretchable area (Covers x = 400 to 500) */}
            <div className="h-full flex-1 relative min-w-[30px] z-0">
              {/* Outer horizontal connecting rails */}
              {/* Bar 1 (Top decorative rail) */}
              <div className="absolute left-0 right-0 bg-black" style={{ top: "21.20%", height: "1.85%" }} />
              {/* Bar 2 (Union top frame) */}
              <div className="absolute left-0 right-0 bg-black" style={{ top: "23.98%", height: "1.85%" }} />

              {/* Stretched Inner Rack lines */}
              {/* Rack 1 (Middle-Top, y = 515) */}
              <div className="absolute left-0 right-0 bg-black" style={{ top: "47.68%", height: "1.85%" }} />
              {/* Rack 2 (Middle-Bottom, y = 752) */}
              <div className="absolute left-0 right-0 bg-black" style={{ top: "69.63%", height: "1.85%" }} />

              {/* Bar 3 (Union bottom frame) */}
              <div className="absolute left-0 right-0 bg-black" style={{ top: "91.57%", height: "1.85%" }} />
              {/* Bar 4 (Bottom decorative rail) */}
              <div className="absolute left-0 right-0 bg-black" style={{ top: "94.44%", height: "1.85%" }} />
            </div>

            {/* Right Column (Covers x = 500 to 975) */}
            <div className="h-full relative shrink-0 z-10 overflow-hidden" style={{ aspectRatio: "475 / 1080" }}>
              <img 
                src={shelfSvg} 
                alt="" 
                className="absolute top-0 right-0 h-full max-w-none"
                style={{ aspectRatio: "975 / 1080" }}
              />

              {/* Inner Rack lines for Right Column */}
              {/* Rack 1 (Middle-Top, y = 515) */}
              <div className="absolute bg-black" style={{ left: 0, right: "43.6%", top: "47.68%", height: "1.85%" }} />
              {/* Rack 2 (Middle-Bottom, y = 752) */}
              <div className="absolute bg-black" style={{ left: 0, right: "43.6%", top: "69.63%", height: "1.85%" }} />

              {/* Shelf 2 Right: Product 2 */}
              <div 
                className="absolute animate-fade-in" 
                style={{ left: "26.84%", bottom: "52.3%", transform: "translateX(-50%)" }}
              >
                <ProductCard product={getProductForSlot(2)} />
              </div>

              {/* Shelf 3 Right: Product 5 */}
              <div 
                className="absolute animate-fade-in" 
                style={{ left: "26.84%", bottom: "30.37%", transform: "translateX(-50%)" }}
              >
                <ProductCard product={getProductForSlot(5)} />
              </div>

              {/* Shelf 4 Right: Product 8 */}
              <div 
                className="absolute animate-fade-in" 
                style={{ left: "26.84%", bottom: "5.5%", transform: "translateX(-50%)" }}
              >
                <ProductCard product={getProductForSlot(8)} />
              </div>
            </div>
          </>
        )}

        {/* Center column products, positioned relative to the parent container to be exactly centered */}
        {!loading && (
          <>
            {/* Shelf 2 Center: Product 1 */}
            <div 
              className="absolute z-20 animate-fade-in pointer-events-auto" 
              style={{ left: "50%", bottom: "52.3%", transform: "translateX(-50%)" }}
            >
              <ProductCard product={getProductForSlot(1)} />
            </div>

            {/* Shelf 3 Center: Product 4 */}
            <div 
              className="absolute z-20 animate-fade-in pointer-events-auto" 
              style={{ left: "50%", bottom: "30.37%", transform: "translateX(-50%)" }}
            >
              <ProductCard product={getProductForSlot(4)} />
            </div>

            {/* Shelf 4 Center: Product 7 */}
            <div 
              className="absolute z-20 animate-fade-in pointer-events-auto" 
              style={{ left: "50%", bottom: "5.5%", transform: "translateX(-50%)" }}
            >
              <ProductCard product={getProductForSlot(7)} />
            </div>
          </>
        )}

      </div>
    </section>
  );
};

export default PlantShelf;