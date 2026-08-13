// import { useState, useEffect, useMemo } from 'react';
// import { useNavigate, Link } from 'react-router-dom';
// import { getProducts } from '../../services/productService.js';
// import { deleteProduct } from '../../services/adminService.js';
// import { colours, fonts } from '../../theme/theme.js';

// const SCOPED_CSS = `
//   .search-input:focus {
//     border-color: ${colours.accent} !important;
//     background-color: ${colours.background} !important;
//     box-shadow: 0 0 0 1px ${colours.accent} !important;
//   }
//   .add-product-btn:hover {
//     background-color: ${colours.accent} !important;
//     color: ${colours.background} !important;
//   }
//   .table-row:hover {
//     background-color: ${colours.primary} !important;
//   }
//   .action-btn-edit {
//     color: ${colours.accent} !important;
//   }
//   .action-btn-edit:hover {
//     color: ${colours.secondary} !important;
//   }
//   .action-btn-delete {
//     color: #EF4444 !important;
//   }
//   .action-btn-delete:hover {
//     color: #B91C1C !important;
//   }
// `;

// export default function AdminCollection() {
//     const [products, setProducts] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);
//     const [searchTerm, setSearchTerm] = useState('');
//     const [deleteModalOpen, setDeleteModalOpen] = useState(false);
//     const [productToDelete, setProductToDelete] = useState(null);
//     const [deleting, setDeleting] = useState(false);

//     const navigate = useNavigate();

//     // Fetch all products (including inactive ones)
//     const loadProducts = async () => {
//         setLoading(true);
//         setError(null);
//         try {
//             const data = await getProducts(true);
//             setProducts(data);
//         } catch (err) {
//             setError(err.message ?? 'Failed to load products.');
//         } finally {
//             setLoading(false);
//         }
//     };

//     useEffect(() => {
//         loadProducts();
//     }, []);

//     // Filter products based on search term
//     const filteredProducts = useMemo(() => {
//         const term = searchTerm.toLowerCase();
//         if (!term) return products;
//         return products.filter(product => {
//             const nameMatch = product.name?.toLowerCase().includes(term);
//             const descMatch = product.description?.toLowerCase().includes(term);
//             const catMatch = product.subtitle?.toLowerCase().includes(term);
//             return nameMatch || descMatch || catMatch;
//         });
//     }, [products, searchTerm]);

//     const openDeleteModal = (product) => {
//         setProductToDelete(product);
//         setDeleteModalOpen(true);
//     };

//     const closeDeleteModal = () => {
//         setProductToDelete(null);
//         setDeleteModalOpen(false);
//     };

//     const handleDelete = async () => {
//         if (!productToDelete) return;
//         setDeleting(true);
//         try {
//             await deleteProduct(productToDelete.id);
//             setProducts(products.filter(p => p.id !== productToDelete.id));
//             closeDeleteModal();
//         } catch (err) {
//             alert(err.message ?? 'Failed to delete product.');
//         } finally {
//             setDeleting(false);
//         }
//     };

//     return (
//         <div style={{ backgroundColor: colours.primary, fontFamily: fonts.secondary, color: colours.text }} className="min-h-screen flex flex-col">
//             <style>{SCOPED_CSS}</style>
//             <main className="flex-1 pt-28 px-4 md:px-8 max-w-7xl mx-auto w-full pb-16">
//                 {/* Header Section */}
//                 <div style={{ borderBottomColor: colours.border }} className="flex flex-col md:flex-row md:items-center md:justify-between border-b pb-6 mb-8 gap-4">
//                     <div>
//                         <div style={{ color: colours.accent }} className="flex items-center gap-2 text-xs uppercase tracking-widest mb-1 font-semibold">
//                             <span>Admin Portal</span>
//                             <span>•</span>
//                             <span>Inventory Control</span>
//                         </div>
//                         <h1 style={{ fontFamily: fonts.primary, color: colours.text }} className="text-3xl md:text-4xl tracking-wide font-normal">
//                             Product Dashboard
//                         </h1>
//                     </div>
                    
//                     <button
//                         onClick={() => navigate('/admin/collection/add')}
//                         style={{ backgroundColor: colours.secondary, color: colours.background }}
//                         className="add-product-btn transition-all duration-300 text-xs uppercase tracking-widest font-semibold px-6 py-3.5 rounded shadow-sm hover:shadow-md flex items-center gap-2 self-start md:self-auto border-none cursor-pointer"
//                     >
//                         <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
//                             <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
//                         </svg>
//                         Add New Product
//                     </button>
//                 </div>

//                 {/* Search Bar & Stats */}
//                 <div style={{ backgroundColor: colours.background, borderColor: colours.border }} className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border p-4 rounded-lg">
//                     <div className="relative flex-1 max-w-md">
//                         <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
//                             <svg style={{ color: colours.accent }} className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
//                             </svg>
//                         </span>
//                         <input
//                             type="text"
//                             placeholder="Search by name, description, category..."
//                             value={searchTerm}
//                             onChange={(e) => setSearchTerm(e.target.value)}
//                             style={{ backgroundColor: colours.primary + "40", borderColor: colours.border, color: colours.text }}
//                             className="search-input w-full rounded py-2.5 pl-10 pr-4 text-sm placeholder-stone-400 focus:outline-none transition-all duration-200"
//                         />
//                     </div>
//                     <div style={{ color: colours.mutedText }} className="text-xs tracking-wider uppercase font-semibold">
//                         Showing {filteredProducts.length} of {products.length} Products
//                     </div>
//                 </div>

//                 {/* Products Table/Card View */}
//                 {loading ? (
//                     /* Loading Skeleton */
//                     <div className="space-y-4">
//                         {Array.from({ length: 5 }).map((_, i) => (
//                             <div key={i} style={{ backgroundColor: colours.surface }} className="h-20 w-full rounded animate-pulse" />
//                         ))}
//                     </div>
//                 ) : error ? (
//                     <div style={{ borderColor: colours.border }} className="text-center py-12 border rounded bg-red-50/50">
//                         <p className="text-red-700 font-serif text-lg mb-2">Failed to load inventory</p>
//                         <p style={{ color: colours.mutedText }} className="text-sm mb-4">{error}</p>
//                         <button onClick={loadProducts} style={{ color: colours.text }} className="text-xs uppercase tracking-widest font-semibold underline">
//                             Try Again
//                         </button>
//                     </div>
//                 ) : filteredProducts.length === 0 ? (
//                     <div style={{ borderColor: colours.border }} className="text-center py-16 border border-dashed rounded bg-white/20">
//                         <div className="text-3xl mb-3">🌿</div>
//                         <h3 style={{ fontFamily: fonts.primary, color: colours.text }} className="text-xl mb-1">No products found</h3>
//                         <p style={{ color: colours.mutedText }} className="text-sm">
//                             {searchTerm ? "Try searching for a different keyword." : "Get started by adding your first product!"}
//                         </p>
//                     </div>
//                 ) : (
//                     /* Desktop & Mobile Responsive Table */
//                     <div style={{ backgroundColor: colours.background, borderColor: colours.border }} className="border rounded shadow-sm overflow-hidden">
//                         <div className="overflow-x-auto">
//                             <table style={{ dividerColor: colours.border }} className="min-w-full divide-y">
//                                 <thead style={{ backgroundColor: colours.primary }}>
//                                     <tr>
//                                         <th scope="col" style={{ color: colours.text }} className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Product</th>
//                                         <th scope="col" style={{ color: colours.text }} className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Category</th>
//                                         <th scope="col" style={{ color: colours.text }} className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Price (₹)</th>
//                                         <th scope="col" style={{ color: colours.text }} className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Stock</th>
//                                         <th scope="col" style={{ color: colours.text }} className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Status</th>
//                                         <th scope="col" style={{ color: colours.text }} className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider">Actions</th>
//                                     </tr>
//                                 </thead>
//                                 <tbody style={{ dividerColor: colours.border }} className="divide-y bg-white/40">
//                                     {filteredProducts.map((product) => (
//                                         <tr key={product.id} className="table-row transition-all duration-150">
//                                             {/* Name / Image */}
//                                             <td className="px-6 py-4 whitespace-nowrap">
//                                                 <div className="flex items-center gap-4">
//                                                     <div style={{ backgroundColor: colours.primary, borderColor: colours.border }} className="w-12 h-16 rounded overflow-hidden flex-shrink-0 border">
//                                                         <img
//                                                             src={product.image}
//                                                             alt={product.name}
//                                                             className="w-full h-full object-cover"
//                                                             decoding="async"
//                                                             onError={(e) => { e.target.src = '/products/placeholder.png'; }}
//                                                         />
//                                                     </div>
//                                                     <div>
//                                                         <div style={{ fontFamily: fonts.primary, color: colours.text }} className="text-sm font-semibold flex items-center gap-2">
//                                                             {product.name}
//                                                             {product.isNew && (
//                                                                 <span style={{ backgroundColor: colours.accent, color: colours.background }} className="text-[9px] px-1.5 py-0.5 rounded uppercase tracking-wider font-sans font-bold">
//                                                                     New
//                                                                 </span>
//                                                             )}
//                                                             {product.badge && (
//                                                                 <span style={{ backgroundColor: colours.secondary, color: colours.background }} className="text-[9px] px-1.5 py-0.5 rounded uppercase tracking-wider font-sans font-bold">
//                                                                     {product.badge}
//                                                                 </span>
//                                                             )}
//                                                         </div>
//                                                         <div style={{ color: colours.mutedText }} className="text-xs truncate max-w-xs">
//                                                             {product.slug}
//                                                         </div>
//                                                     </div>
//                                                 </div>
//                                             </td>
//                                             {/* Category */}
//                                             <td style={{ color: colours.text }} className="px-6 py-4 whitespace-nowrap text-xs uppercase tracking-wider">
//                                                 {product.subtitle || 'Uncategorized'}
//                                             </td>
//                                             {/* Price */}
//                                             <td className="px-6 py-4 whitespace-nowrap">
//                                                 <div style={{ color: colours.text }} className="text-sm font-semibold">
//                                                     ₹{product.price}
//                                                 </div>
//                                                 {product.originalPrice && (
//                                                     <div style={{ color: colours.mutedText }} className="text-xs line-through">
//                                                         ₹{product.originalPrice}
//                                                     </div>
//                                                 )}
//                                             </td>
//                                             {/* Stock */}
//                                             <td className="px-6 py-4 whitespace-nowrap">
//                                                 <div style={{ color: product.stockQty <= 5 ? colours.accent : colours.text }} className="text-sm font-semibold">
//                                                     {product.stockQty} units
//                                                 </div>
//                                                 {product.stockQty <= 5 && (
//                                                     <div style={{ color: colours.accent }} className="text-[10px] uppercase tracking-widest font-bold">
//                                                         Low Stock
//                                                     </div>
//                                                 )}
//                                             </td>
//                                             {/* Status */}
//                                             <td className="px-6 py-4 whitespace-nowrap">
//                                                 <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider ${
//                                                     product.isActive 
//                                                         ? 'bg-green-50 text-green-700 border border-green-200' 
//                                                         : 'bg-gray-100 text-gray-500 border border-gray-200'
//                                                 }`}>
//                                                     {product.isActive ? 'Active' : 'Inactive'}
//                                                 </span>
//                                             </td>
//                                             {/* Actions */}
//                                             <td className="px-6 py-4 whitespace-nowrap text-right text-xs font-medium space-x-3">
//                                                 <button
//                                                     onClick={() => navigate(`/admin/collection/edit/${product.id}`)}
//                                                     className="action-btn-edit border-none bg-transparent cursor-pointer uppercase tracking-widest font-bold"
//                                                 >
//                                                     Edit
//                                                 </button>
//                                                 <button
//                                                     onClick={() => openDeleteModal(product)}
//                                                     className="action-btn-delete border-none bg-transparent cursor-pointer uppercase tracking-widest font-bold"
//                                                 >
//                                                     Delete
//                                                 </button>
//                                             </td>
//                                         </tr>
//                                     ))}
//                                 </tbody>
//                             </table>
//                         </div>
//                     </div>
//                 )}
//             </main>

//             {/* Delete Confirmation Modal */}
//             {deleteModalOpen && (
//                 <div style={{ backgroundColor: 'rgba(8, 8, 8, 0.4)' }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
//                     <div style={{ backgroundColor: colours.background, borderColor: colours.border }} className="border rounded-lg shadow-xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
//                         <div style={{ backgroundColor: colours.primary, borderBottomColor: colours.border }} className="px-6 py-4 border-b">
//                             <h3 style={{ fontFamily: fonts.primary, color: colours.text }} className="text-lg font-semibold">
//                                 Confirm Deletion
//                             </h3>
//                         </div>
//                         <div className="p-6">
//                             <p style={{ color: colours.mutedText }} className="text-sm leading-relaxed">
//                                 Are you sure you want to permanently delete <strong style={{ color: colours.text }}>{productToDelete?.name}</strong>? This action is irreversible and will remove all product details and associated images.
//                             </p>
//                         </div>
//                         <div style={{ backgroundColor: colours.primary, borderTopColor: colours.border }} className="px-6 py-4 border-t flex justify-end gap-3">
//                             <button
//                                 onClick={closeDeleteModal}
//                                 disabled={deleting}
//                                 style={{ borderColor: colours.border, color: colours.text, backgroundColor: colours.background }}
//                                 className="border hover:bg-stone-50 transition-colors text-xs uppercase tracking-widest font-bold px-4 py-2.5 rounded cursor-pointer"
//                             >
//                                 Cancel
//                             </button>
//                             <button
//                                 onClick={handleDelete}
//                                 disabled={deleting}
//                                 style={{ backgroundColor: '#EF4444', color: '#FFFFFF' }}
//                                 className="hover:bg-red-700 transition-colors text-xs uppercase tracking-widest font-bold px-4 py-2.5 rounded flex items-center gap-2 border-none cursor-pointer"
//                             >
//                                 {deleting ? 'Deleting...' : 'Delete Product'}
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// }

