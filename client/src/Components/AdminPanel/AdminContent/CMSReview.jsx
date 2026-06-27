import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SectionCard from "../../SectionCard";
import { getProducts } from "../../../services/productService";

const ReviewContent = () => {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getProducts(true);

        setProducts(data);
      } catch (err) {
        setError(err.message || "Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  return (
    <div className="px-10 py-8">
      <h1 className="font-serif text-2xl font-semibold text-[#171715]">
        Product Reviews
      </h1>

      <div className="flex items-center justify-between">
        <p className="mt-1 text-sm text-[#7C7770]">
          Manage customer reviews product-wise.
        </p>
        <button
          onClick={() => navigate('/admin/content/reviews/add-review')}
          className="mt-1 px-5 py-2.5 rounded-lg text-xs uppercase tracking-widest font-semibold transition-all duration-200 cursor-pointer border-none shadow-sm hover:shadow-md"
          style={{ backgroundColor: '#171715', color: '#f8f8f8' }}
        >
          + Add Review
        </button>
      </div>

      {loading && (
        <p className="mt-8 text-sm text-[#7C7770]">
          Loading products...
        </p>
      )}

      {error && (
        <p className="mt-8 text-sm text-red-600">
          {error}
        </p>
      )}

      {!loading && !error && (
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => (
            <SectionCard
              key={product.id}
              title={product.name}
              description={`Customer Reviews on ${product.name}`}
              onClick={() => navigate(`/admin/content/reviews/${product.slug}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewContent;