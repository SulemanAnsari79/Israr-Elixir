import { useContext, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContextDefinition';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import api from '../../services/Api.js';
import {
    StarIcon,
    ShoppingBasket01Icon,
    SecurityCheckIcon,
    DeliveryTruck01Icon,
    ArrowLeft01Icon,
    InformationCircleIcon,
    Message01Icon,
    Share01Icon
} from 'hugeicons-react';

const SelectedProduct = () => {
    const { productId } = useParams();
    const { products, addToCart, navigate } = useContext(AuthContext);
    const [productData, setProductData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState('');
    const [size, setSize] = useState("");
    const [activeImage, setActiveImage] = useState(0);

    const fetchProductData = async () => {
        setLoading(true);
        const localProduct = products.find((item) => String(item._id) === String(productId));
        if (localProduct) {
            setProductData(localProduct);
            setLoading(false);
            return;
        }
        try {
            const response = await api.get(`/product/get/${productId}`);
            if (response?.data?.product) setProductData(response.data.product);
            else setLoadError('Product not found.');
        } catch {
            setLoadError('Failed to load product details.');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { fetchProductData(); }, [productId, products]);

    useEffect(() => {
        if (!productData) return;
        const availableSizes = Array.isArray(productData.sizes) ? productData.sizes : [];
        setSize(availableSizes[0] || "");
        setActiveImage(0);
    }, [productData]);

    if (loading) return (
        <div className="store-page min-h-screen flex items-center justify-center font-['Plus_Jakarta_Sans']">
            <div className="animate-pulse flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="font-black text-slate-400 uppercase text-[10px] tracking-widest">Preparing your view...</p>
            </div>
        </div>
    );
    if (!productData) return (
        <div className="store-page min-h-screen flex items-center justify-center font-['Plus_Jakarta_Sans']">
            <p className="font-black text-slate-500">{loadError || 'Product not found.'}</p>
        </div>
    );

    const rawImages = Array.isArray(productData.images) ? productData.images : [productData.images].filter(Boolean);
    const firstImage = rawImages[0] || '';
    const sizes = Array.isArray(productData.sizes) ? productData.sizes : [];

    return (
        <div className="store-page min-h-screen font-['Plus_Jakarta_Sans']">
            <Navbar />

            <main className="mx-auto max-w-7xl px-5 py-8 md:px-8 md:py-16">
                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors mb-10 group"
                >
                    <ArrowLeft01Icon size={20} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="text-xs font-black uppercase tracking-widest">Back to collection</span>
                </button>

                <div className="grid gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(360px,.9fr)] lg:gap-16">

                    {/* LEFT: IMAGE GALLERY */}
                    <div className="grid grid-cols-[72px_minmax(0,1fr)] gap-4 sm:grid-cols-[92px_minmax(0,1fr)] sm:gap-6">
                        <div className="flex max-h-[620px] flex-col gap-3 overflow-y-auto pr-1">
                            {rawImages.map((image, index) => (
                                <button
                                    type="button"
                                    key={`${image}-${index}`}
                                    onClick={() => setActiveImage(index)}
                                    aria-label={`View image ${index + 1} of ${rawImages.length}`}
                                    className={`aspect-square shrink-0 overflow-hidden border bg-[#f1ece5] transition ${
                                        activeImage === index
                                            ? 'border-[#806345] ring-1 ring-[#806345]'
                                            : 'border-transparent opacity-65 hover:border-[#d8cbbb] hover:opacity-100'
                                    }`}
                                >
                                    <img src={image} alt="" className="h-full w-full object-contain p-2" />
                                </button>
                            ))}
                        </div>

                        <div className="relative aspect-square overflow-hidden bg-[#f1ece5] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)]">
                            <img
                                className="h-full w-full object-contain p-8 transition-opacity duration-300 sm:p-14"
                                src={rawImages[activeImage] || firstImage}
                                alt={productData.name}
                            />
                            {/* Actions Overlay */}
                            <div className="absolute top-6 right-6 flex flex-col gap-3">
                                <button type="button" aria-label="Share product" className="rounded-2xl bg-white/80 p-4 text-slate-900 shadow-sm backdrop-blur-md transition-all hover:bg-white">
                                    <Share01Icon size={20} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: PRODUCT INFO */}
                    <div className="flex flex-col">
                        <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full bg-blue-50 px-4 py-2">
                            <SecurityCheckIcon size={16} className="text-blue-600" variant="bulk" />
                            <span className="text-[10px] font-black text-blue-600 uppercase tracking-wider">A considered fragrance</span>
                        </div>

                        <h1 className="mb-4 text-4xl font-black leading-tight tracking-tighter text-slate-900 md:text-5xl">
                            {productData.name}
                        </h1>

                        <div className="flex items-center gap-6 mb-8">
                            <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                    <StarIcon key={i} size={18} className="text-amber-400" variant="bulk" />
                                ))}
                                <span className="ml-2 text-sm font-black text-slate-900">4.9</span>
                            </div>
                            <div className="h-4 w-[1px] bg-slate-200"></div>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">120 Verified Reviews</span>
                        </div>

                        <p className="mb-10 border-l-4 border-slate-100 pl-6 text-slate-500 font-medium leading-relaxed">
                            {productData.description || "Technical details pending verification."}
                        </p>

                        <div className="mb-10">
                            <span className="text-4xl font-black text-[#1A56DB] tracking-tighter">₹{productData.price}</span>
                            <span className="ml-4 text-slate-400 line-through font-bold">₹{Math.round(productData.price * 1.2)}</span>
                        </div>

                        {/* Size Selection */}
                        {sizes.length > 0 && (
                            <div className="mb-10">
                                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4 ml-1">Select Dosage/Size</p>
                                <div className="flex flex-wrap gap-3">
                                    {sizes.map((item, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setSize(item)}
                                            className={`min-w-[80px] py-4 px-6 rounded-2xl text-xs font-black uppercase tracking-widest transition-all
                                                ${item === size
                                                    ? 'bg-slate-900 text-white shadow-xl shadow-slate-200 -translate-y-1'
                                                    : 'bg-white text-slate-400 border border-slate-100 hover:border-slate-300'}`}
                                        >
                                            {item}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Main Action */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <button
                                onClick={() => addToCart(productData._id, size)}
                                className="flex-1 bg-[#1A56DB] text-white py-6 rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-blue-200 hover:bg-blue-700 transition-all transform active:scale-95 flex items-center justify-center gap-3"
                            >
                                <ShoppingBasket01Icon size={20} variant="bulk" />
                                Add to bag
                            </button>
                        </div>

                    </div>
                </div>

                {/* FEATURES */}
                <section className="mt-20 border-y border-[#e9e1d7] py-10 md:mt-28">
                    <div className="mb-8 flex items-center gap-3">
                        <InformationCircleIcon size={22} className="text-[#806345]" />
                        <h2 className="text-2xl font-black tracking-tight text-slate-900">Why you'll love it</h2>
                    </div>
                    <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
                        {[
                            { icon: <SecurityCheckIcon />, title: "100% Original", desc: "Direct from Lab" },
                            { icon: <DeliveryTruck01Icon />, title: "Free Shipping", desc: "Orders over ₹499" },
                            { icon: <Message01Icon />, title: "7 Day Returns", desc: "Hassle-free policy" }
                        ].map((feature) => (
                            <div key={feature.title} className="flex items-center gap-4">
                                <div className="text-[#806345]">{feature.icon}</div>
                                <div>
                                    <h3 className="text-[11px] font-black uppercase tracking-tight text-slate-900">{feature.title}</h3>
                                    <p className="text-[11px] font-bold text-slate-400">{feature.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* REVIEWS */}
                <section className="py-16 md:py-24">
                    <div className="mb-8 flex items-end justify-between gap-4 border-b border-[#e9e1d7] pb-6">
                        <div>
                            <p className="mb-2 text-[10px] font-black uppercase tracking-[.2em] text-[#806345]">Customer feedback</p>
                            <h2 className="text-3xl font-black tracking-tight text-slate-900">Reviews</h2>
                        </div>
                        <div className="flex items-center gap-2 text-sm font-black text-slate-900">
                            <StarIcon size={18} className="text-amber-400" variant="bulk" /> 4.9
                        </div>
                    </div>
                    <div className="rounded-[2rem] border border-dashed border-[#d8cbbb] bg-white/60 py-16 text-center">
                        <Message01Icon size={42} className="mx-auto mb-5 text-[#d8cbbb]" />
                        <h3 className="text-xl font-black tracking-tight text-slate-900">No reviews yet</h3>
                        <p className="mt-2 text-sm font-bold text-slate-400">Be the first to share your experience with this fragrance.</p>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}

export default SelectedProduct;
