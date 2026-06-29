import React, { useState, useEffect, useRef } from 'react';
import api from '../../api/client.js';
import { useReactToPrint } from 'react-to-print';
import PrintableReceipt from '../../components/PrintableReceipt.jsx';
import { 
  Search, 
  ShoppingCart, 
  Trash2, 
  Printer, 
  MessageSquare, 
  Plus, 
  Minus, 
  CheckCircle2, 
  AlertCircle,
  AlertTriangle,
  Percent
} from 'lucide-react';
import toast from 'react-hot-toast';

const POS = () => {
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [cart, setCart] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [checkoutResult, setCheckoutResult] = useState(null);
  const [successModalOpen, setSuccessModalOpen] = useState(false);

  const receiptRef = useRef();

  // Autocomplete search with debounce
  useEffect(() => {
    if (!search.trim()) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    const handler = setTimeout(async () => {
      try {
        const res = await api.get(`/medicines?search=${search}&limit=5`);
        if (res.data && res.data.success) {
          setSearchResults(res.data.data.medicines);
        }
      } catch (error) {
        console.error('Autocomplete failed:', error);
      } finally {
        setSearching(false);
      }
    }, 300); // 300ms debounce
    return () => clearTimeout(handler);
  }, [search]);

  const addToCart = (med) => {
    // 1. Expiry Check
    const isExpired = new Date(med.expiryDate) <= new Date();
    if (isExpired) {
      toast.error(`Cannot sell "${med.description}" - it has expired!`);
      return;
    }

    // 2. Stock Check
    if ((med.qty ?? 0) <= 0) {
      toast.error(`"${med.description}" is currently out of stock.`);
      return;
    }

    const existingIndex = cart.findIndex(item => item._id === med._id);
    if (existingIndex > -1) {
      const existingItem = cart[existingIndex];
      if (existingItem.quantity >= med.qty) {
        toast.error(`Only ${med.qty} units of "${med.description}" available in inventory.`);
        return;
      }
      const updated = [...cart];
      updated[existingIndex].quantity += 1;
      setCart(updated);
    } else {
      // Use mrp as selling price, copy discount from inventory
      setCart([...cart, { ...med, quantity: 1, price: med.mrp, discount: med.discount ?? 0 }]);
    }
    setSearch('');
    setSearchResults([]);
    toast.success(`${med.description} added to cart.`);
  };

  const updateQuantity = (medId, delta, stockLimit) => {
    const updated = cart.map(item => {
      if (item._id === medId) {
        const targetQty = item.quantity + delta;
        if (targetQty <= 0) return null;
        if (targetQty > stockLimit) {
          toast.error(`Cannot exceed inventory limit: ${stockLimit} units.`);
          return item;
        }
        return { ...item, quantity: targetQty };
      }
      return item;
    }).filter(Boolean);
    setCart(updated);
  };

  const updateDiscount = (medId, value) => {
    const disc = Math.min(100, Math.max(0, Number(value) || 0));
    setCart(cart.map(item => item._id === medId ? { ...item, discount: disc } : item));
  };

  const removeFromCart = (medId) => {
    setCart(cart.filter(item => item._id !== medId));
    toast.success('Item removed from cart.');
  };

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const calculateDiscountTotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity * (item.discount || 0) / 100), 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal() - calculateDiscountTotal();
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error('Cart is empty.');
      return;
    }

    const payload = {
      items: cart.map(item => ({
        medicineId: item._id,
        quantity: item.quantity,
        price: item.price,
        discount: item.discount
      })),
      paymentMethod
    };

    try {
      const res = await api.post('/sales', payload);
      if (res.data && res.data.success) {
        setCheckoutResult(res.data.data);
        setSuccessModalOpen(true);
        setCart([]);
        toast.success('Transaction logged successfully!');
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Checkout failed.';
      toast.error(msg);
    }
  };

  // react-to-print handle hook trigger
  const handlePrint = useReactToPrint({
    content: () => receiptRef.current,
  });

  const sendWhatsAppReceipt = () => {
    if (!checkoutResult) return;
    
    // Construct message body
    const billId = checkoutResult._id.substring(checkoutResult._id.length - 8).toUpperCase();
    let text = `*Grace Medical Hall*\nPanchkhal-12, Kavre, Nepal\n---------------------------\n*INVOICE: #${billId}*\nDate: ${new Date(checkoutResult.createdAt).toLocaleDateString()}\n\n`;
    
    checkoutResult.items.forEach((item, index) => {
      const itemPrice = item.priceAtSale * item.quantity;
      const finalPrice = itemPrice * (1 - (item.discountAtSale || 0) / 100);
      text += `${index + 1}. ${item.medicine?.name} x ${item.quantity} = Rs. ${finalPrice.toFixed(2)}\n`;
    });
    
    text += `\n---------------------------\n*GRAND TOTAL: Rs. ${checkoutResult.totalPrice.toFixed(2)}*\nPayment: ${checkoutResult.paymentMethod}\nThank you for choosing us! Wish you good health.`;
    
    const encodedText = encodeURIComponent(text);
    const url = `https://wa.me/?text=${encodedText}`;
    window.open(url, '_blank');
  };

  const startNewSale = () => {
    setCheckoutResult(null);
    setSuccessModalOpen(false);
  };

  const grossSub = calculateSubtotal();
  const discTotal = calculateDiscountTotal();
  const grandTotal = calculateTotal();

  return (
    <div className="grid lg:grid-cols-3 gap-8 font-sans items-start relative">
      
      {/* Invisible Printer Component Hook */}
      <div className="hidden">
        <PrintableReceipt ref={receiptRef} sale={checkoutResult} />
      </div>

      {/* Left side: Search and Autocomplete Results */}
      <div className="lg:col-span-2 space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold text-text-primary dark:text-white tracking-tight">Point of Sale (POS)</h1>
          <p className="text-xs text-text-secondary dark:text-slate-400">Search products to construct client invoice</p>
        </div>

        {/* Search */}
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-text-secondary dark:text-slate-500">
            <Search className="h-5 w-5" />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Type medicine name (e.g. Paracetamol, Ibuprofen)..."
            className="w-full h-12 pl-11 pr-4 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-text-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-soft"
          />
        </div>

        {/* Search Results Autocomplete */}
        {search.trim() && (
          <div className="glass-panel rounded-2xl border border-slate-100 dark:border-slate-800 shadow-premium divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
            {searching ? (
              <div className="p-4 text-center text-xs text-text-secondary dark:text-slate-400 animate-pulse">Searching inventory records...</div>
            ) : searchResults.length > 0 ? (
              searchResults.map(med => {
                const isLow = (med.qty ?? 0) <= 10;
                const isExpired = new Date(med.expiryDate) <= new Date();

                return (
                  <div 
                    key={med._id} 
                    onClick={() => !isExpired && addToCart(med)}
                    className={`p-4 flex justify-between items-center cursor-pointer transition-colors ${
                      isExpired ? 'opacity-50 cursor-not-allowed bg-slate-50/50 dark:bg-slate-800/10' : 'hover:bg-slate-50 dark:hover:bg-slate-850'
                    }`}
                  >
                    <div>
                      <h4 className="font-bold text-text-primary dark:text-white capitalize">{med.description}</h4>
                      <p className="text-[10px] text-text-secondary dark:text-slate-400">
                        {med.pack} | Batch: {med.batch} | Exp: {new Date(med.expiryDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right flex items-center gap-4">
                      <div>
                        <span className="text-xs font-bold text-text-primary dark:text-white block">Rs. {(med.mrp ?? 0).toFixed(2)}</span>
                        {med.discount > 0 && <span className="text-[10px] text-emerald-500 font-bold">-{med.discount}% Disc</span>}
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          isExpired ? 'bg-red-500/10 text-red-500' : isLow ? 'bg-amber-500/10 text-amber-500' : 'bg-primary/10 text-primary dark:text-sky-400'
                        }`}>
                          {isExpired ? 'Expired' : `${med.qty} left`}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-4 text-center text-xs text-text-secondary dark:text-slate-400">No matching medicines found in catalog.</div>
            )}
          </div>
        )}
      </div>

      {/* Right side: Sticky checkout cart panel */}
      <div className="lg:col-span-1 lg:sticky lg:top-24 space-y-6">
        <div className="glass-card p-5 border border-slate-100 dark:border-slate-800 shadow-premium flex flex-col justify-between min-h-[400px]">
          
          {/* Cart Header */}
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-700 pb-3 mb-4">
            <h3 className="font-bold text-text-primary dark:text-white flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-primary" />
              <span>Checkout Cart</span>
            </h3>
            <span className="text-xs font-bold text-primary dark:text-sky-400 bg-primary/10 px-2 py-0.5 rounded-full">
              {cart.reduce((sum, item) => sum + item.quantity, 0)} Items
            </span>
          </div>

          {/* Cart Items list */}
          <div className="flex-1 overflow-y-auto max-h-[220px] space-y-3 mb-4 pr-1">
            {cart.length > 0 ? (
              cart.map(item => {
                const subtotal = item.price * item.quantity;
                const total = subtotal * (1 - (item.discount || 0) / 100);

                return (
                  <div key={item._id} className="border-b border-slate-100 dark:border-slate-800/40 pb-3 space-y-2">
                    <div className="flex justify-between items-start text-xs">
                      <div className="space-y-0.5 max-w-[130px]">
                        <h4 className="font-bold text-text-primary dark:text-white truncate capitalize">{item.description}</h4>
                        <p className="text-[10px] text-text-secondary dark:text-slate-400">Rs. {item.price.toFixed(2)} × {item.quantity}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden h-7">
                          <button onClick={() => updateQuantity(item._id, -1, item.qty)} className="px-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-text-secondary h-full">
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="px-2 font-bold text-text-primary dark:text-white text-xs">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item._id, 1, item.qty)} className="px-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-text-secondary h-full">
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <button onClick={() => removeFromCart(item._id)} className="text-danger hover:bg-red-50 dark:hover:bg-red-950/20 p-1.5 rounded-lg">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    {/* Discount editor */}
                    <div className="flex items-center gap-2">
                      <Percent className="h-3 w-3 text-text-secondary dark:text-slate-500" />
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={item.discount}
                        onChange={(e) => updateDiscount(item._id, e.target.value)}
                        className="w-16 h-6 px-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-emerald-500 font-bold focus:outline-none focus:ring-1 focus:ring-primary/30"
                      />
                      <span className="text-[10px] text-text-secondary dark:text-slate-400">% disc</span>
                      <span className="ml-auto font-bold text-text-primary dark:text-white text-xs">Rs.{total.toFixed(1)}</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12 text-xs text-text-secondary dark:text-slate-400">
                Cart is empty. Select products on the left.
              </div>
            )}
          </div>

          {/* Pricing calculations */}
          <div className="border-t border-slate-100 dark:border-slate-700 pt-4 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-text-secondary dark:text-slate-400 font-medium">Subtotal</span>
              <span className="font-bold text-text-primary dark:text-white">Rs. {grossSub.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-text-secondary dark:text-slate-400 font-medium">Total Discount</span>
              <span className="font-bold text-emerald-500">- Rs. {discTotal.toFixed(2)}</span>
            </div>
            <div className="border-b border-dotted border-slate-200 dark:border-slate-700 my-1"></div>
            <div className="flex justify-between text-sm font-extrabold uppercase">
              <span className="text-text-primary dark:text-white">Net Total</span>
              <span className="text-primary dark:text-sky-400">Rs. {grandTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="mt-4">
            <label className="block text-xs font-semibold text-text-secondary dark:text-slate-400 mb-1.5">Payment Method</label>
            <div className="grid grid-cols-3 gap-1.5">
              {['Cash', 'Card', 'Fonepay'].map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setPaymentMethod(method)}
                  className={`h-9 text-xs font-bold rounded-lg border transition-all ${
                    paymentMethod === method
                      ? 'bg-primary text-white border-primary shadow-soft'
                      : 'bg-white hover:bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-text-secondary'
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>

          {/* Checkout Action */}
          <button
            onClick={handleCheckout}
            disabled={cart.length === 0}
            className="w-full h-11 mt-5 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-sm transition-all shadow-soft shadow-primary/20 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Record Checkout & Print
          </button>
        </div>
      </div>

      {/* Success Modal */}
      {successModalOpen && checkoutResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={startNewSale}></div>
          <div className="w-full max-w-sm glass-card border border-slate-100 dark:border-slate-800 shadow-premium p-6 text-center relative z-10 animate-scale-up">
            
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 mb-4">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            
            <h3 className="text-xl font-extrabold text-text-primary dark:text-white tracking-tight">Checkout Completed</h3>
            <p className="text-xs text-text-secondary dark:text-slate-400 mt-1 mb-6">Invoice value: Rs. {checkoutResult.totalPrice.toFixed(2)}</p>

            <div className="space-y-2">
              <button 
                onClick={handlePrint}
                className="w-full h-10 flex items-center justify-center gap-2 rounded-xl bg-primary text-white hover:bg-primary-dark font-bold text-xs transition-all shadow-soft"
              >
                <Printer className="h-4 w-4" />
                <span>Print Thermal Receipt</span>
              </button>
              
              <button 
                onClick={sendWhatsAppReceipt}
                className="w-full h-10 flex items-center justify-center gap-2 rounded-xl bg-green-500 text-white hover:bg-green-600 font-bold text-xs transition-all shadow-soft"
              >
                <MessageSquare className="h-4 w-4" />
                <span>Share via WhatsApp</span>
              </button>

              <button 
                onClick={startNewSale}
                className="w-full h-10 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-text-primary dark:text-white font-bold text-xs transition-all mt-2"
              >
                New Transaction
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default POS;
