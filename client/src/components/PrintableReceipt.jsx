import React, { forwardRef } from 'react';

const PrintableReceipt = forwardRef(({ sale }, ref) => {
  if (!sale) return null;

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const calculateSubtotal = () => {
    return sale.items.reduce((sum, item) => sum + (item.priceAtSale * item.quantity), 0);
  };

  const subtotal = calculateSubtotal();
  const discountTotal = subtotal - sale.totalPrice;

  return (
    <div ref={ref} className="print-area hidden p-4 max-w-[80mm] bg-white text-black font-mono text-xs">
      {/* Receipt Header */}
      <div className="text-center mb-3">
        <h2 className="text-sm font-extrabold uppercase tracking-wide">Grace Medical Hall</h2>
        <p className="text-[10px]">Panchkhal-12, Kavre, Nepal</p>
        <p className="text-[10px]">Ph: +977-11-400XXX | Mob: +977-98XXXXXXXX</p>
        <div className="border-b border-dashed border-black my-2"></div>
        <h3 className="font-bold uppercase text-[10px] tracking-widest">Sales Invoice</h3>
      </div>

      {/* Metadata */}
      <div className="space-y-1 mb-3 text-[10px]">
        <div className="flex justify-between">
          <span>Invoice No:</span>
          <span className="font-bold">{sale._id.substring(sale._id.length - 8).toUpperCase()}</span>
        </div>
        <div className="flex justify-between">
          <span>Date:</span>
          <span>{formatDate(sale.createdAt || new Date())}</span>
        </div>
        <div className="flex justify-between">
          <span>Billed By:</span>
          <span className="capitalize">{sale.soldBy?.username || 'Staff'}</span>
        </div>
        <div className="flex justify-between">
          <span>Payment Mode:</span>
          <span className="font-bold">{sale.paymentMethod}</span>
        </div>
      </div>

      <div className="border-b border-dashed border-black my-2"></div>

      {/* Cart Items Table */}
      <table className="w-full text-left text-[10px] mb-2">
        <thead>
          <tr className="border-b border-dashed border-black">
            <th className="pb-1 font-bold">Medicine</th>
            <th className="pb-1 text-center font-bold">Qty</th>
            <th className="pb-1 text-right font-bold">Rate</th>
            <th className="pb-1 text-right font-bold">Total</th>
          </tr>
        </thead>
        <tbody>
          {sale.items.map((item, index) => {
            const itemSubtotal = item.priceAtSale * item.quantity;
            const itemTotal = itemSubtotal * (1 - (item.discountAtSale || 0) / 100);

            return (
              <React.Fragment key={index}>
                <tr className="align-top">
                  <td className="pt-1.5 font-bold" colSpan="4">
                    {item.medicine?.name || 'Medicine Name'}
                  </td>
                </tr>
                <tr className="border-b border-dotted border-black/30 align-top">
                  <td className="pb-1 text-[9px] text-gray-700">
                    Batch: {item.medicine?.batchNo || 'N/A'} {item.discountAtSale > 0 && `(Disc ${item.discountAtSale}%)`}
                  </td>
                  <td className="pb-1 text-center">{item.quantity}</td>
                  <td className="pb-1 text-right">Rs.{item.priceAtSale.toFixed(2)}</td>
                  <td className="pb-1 text-right">Rs.{itemTotal.toFixed(2)}</td>
                </tr>
              </React.Fragment>
            );
          })}
        </tbody>
      </table>

      <div className="border-b border-dashed border-black my-2"></div>

      {/* Summary calculation */}
      <div className="space-y-1 text-[10px] font-bold">
        <div className="flex justify-between">
          <span>Gross Subtotal:</span>
          <span>Rs. {subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Discount Amount:</span>
          <span>Rs. {discountTotal.toFixed(2)}</span>
        </div>
        <div className="border-b border-dotted border-black my-1"></div>
        <div className="flex justify-between text-xs font-extrabold uppercase">
          <span>Net Grand Total:</span>
          <span>Rs. {sale.totalPrice.toFixed(2)}</span>
        </div>
      </div>

      <div className="border-b border-dashed border-black my-3"></div>

      <div className="text-center text-[9px] space-y-1">
        <p className="font-bold">Thank You For Your Patronage!</p>
        <p>Get well soon!</p>
        <p className="text-[7px] text-gray-500 pt-2">Powered by Grace Medical Hall System</p>
      </div>
    </div>
  );
});

PrintableReceipt.displayName = 'PrintableReceipt';
export default PrintableReceipt;
