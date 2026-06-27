import { ArrowLeft } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ProductTable from "./CollectionProductsTable";
import { getProducts } from "../../../services/productService";
import { getCategories } from "../../../services/categoryService";
import { colours, fonts } from "../../../theme/theme";
const EditButton = ({ name, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={name}
      style={{
        borderColor: colours.border,
        backgroundColor: colours.background,
        fontFamily: fonts.secondary,
      }}
      className="group flex cursor-pointer items-center justify-center rounded-xl border px-3 py-3 text-sm font-medium duration-300"
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = colours.accent;
        e.currentTarget.style.backgroundColor = colours.primary;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = colours.border;
        e.currentTarget.style.backgroundColor = colours.background;
      }}
    >
      <span
        style={{ color: colours.text }}
        className="transition-colors duration-300 group-hover:text-[#A77C6B]"
      >
        {name}
      </span>
    </button>
  );
};


const AdminCollectionProducts = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const [productsData, categoriesData] = await Promise.all([
          getProducts(true),
          getCategories(),
        ]);

        setProducts(productsData);
        setCategories(categoriesData);
      } catch (err) {
        setError(err.message || "Failed to load collection data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const currentCategory = useMemo(() => {
    if (slug === "all-products") return "All Products";

    const matchedCategory = categories.find((category) => category.slug === slug);

    return matchedCategory?.name || slug;
  }, [categories, slug]);

  const filteredProducts = useMemo(() => {
    if (slug === "all-products") {
      return products;
    }

    return products.filter((product) => product.category === slug);
  }, [products, slug]);

  const handleEdit = (product) => {
    navigate(`/admin/collection/edit/${product.id}`);
  };

  const handleDelete = async (product) => {
    console.log("Delete product:", product);
  };

  return (
    <div
      className="px-10 py-8"
      style={{
        backgroundColor: colours.background,
        fontFamily: fonts.secondary,
      }}
    >





      <button
        type="button"
        onClick={() => navigate("/admin/collection")}
        className="group mb-4 flex cursor-pointer items-center gap-1 text-sm"
        style={{ color: colours.accent }}
      >
        <ArrowLeft
          size={18}
          className="transition-transform duration-100 group-hover:-translate-x-1"
          style={{
            color: colours.accent,
          }}
        />
      
        <span>Back</span>
      </button>


      
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-2xl font-semibold"
            style={{
              color: colours.secondary,
              fontFamily: fonts.primary,
            }}
          >
            {currentCategory}
          </h1>
    
          <p className="mt-1 text-sm" style={{ color: colours.mutedText }}>
            Manage products inside this collection.
          </p>
        </div>
        <div>
          <EditButton
            name="Add Product"
            onClick={() => navigate('/admin/collection/add-product')}
          />
        </div>
      </div>  







      
      {loading && (
        <p className="mt-8 text-sm" style={{ color: colours.mutedText }}>
          Loading products...
        </p>
      )}

      {error && (
        <p className="mt-8 text-sm text-red-600">
          {error}
        </p>
      )}

      {!loading && !error && (
        <ProductTable
          products={filteredProducts}
          onEdit={handleEdit}
          onDeleted={(deletedProduct) => {
            setProducts((prev) =>
              prev.filter((product) => product.id !== deletedProduct.id)
            );
          }}
        />
      )}
    </div>
  );
};

export default AdminCollectionProducts;