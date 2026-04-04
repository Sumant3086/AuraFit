const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Ensure invoices directory exists
const invoicesDir = path.join(__dirname, '../invoices');
if (!fs.existsSync(invoicesDir)) {
  fs.mkdirSync(invoicesDir, { recursive: true });
}

const generateInvoice = async (orderData) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const fileName = `invoice-${orderData.orderId}-${Date.now()}.pdf`;
      const filePath = path.join(invoicesDir, fileName);
      
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // Header
      doc
        .fontSize(20)
        .fillColor('#00f5ff')
        .text('AURA FIT', 50, 50)
        .fontSize(10)
        .fillColor('#666')
        .text('Premium Fitness Center', 50, 75)
        .text('Email: info@aurafit.com', 50, 90)
        .text('Phone: +91 1234567890', 50, 105);

      // Invoice title
      doc
        .fontSize(20)
        .fillColor('#000')
        .text('INVOICE', 400, 50);

      // Invoice details
      doc
        .fontSize(10)
        .fillColor('#666')
        .text(`Invoice #: ${orderData.orderId}`, 400, 75)
        .text(`Date: ${new Date(orderData.date).toLocaleDateString()}`, 400, 90)
        .text(`Status: ${orderData.status}`, 400, 105);

      // Line
      doc
        .strokeColor('#00f5ff')
        .lineWidth(2)
        .moveTo(50, 140)
        .lineTo(550, 140)
        .stroke();

      // Customer details
      doc
        .fontSize(12)
        .fillColor('#000')
        .text('Bill To:', 50, 160)
        .fontSize(10)
        .fillColor('#666')
        .text(orderData.customerName || 'Customer', 50, 180)
        .text(orderData.email || '', 50, 195)
        .text(orderData.phone || '', 50, 210);

      // Items table header
      const tableTop = 260;
      doc
        .fontSize(10)
        .fillColor('#000')
        .text('Item', 50, tableTop)
        .text('Quantity', 250, tableTop)
        .text('Price', 350, tableTop)
        .text('Total', 450, tableTop);

      // Line under header
      doc
        .strokeColor('#ddd')
        .lineWidth(1)
        .moveTo(50, tableTop + 15)
        .lineTo(550, tableTop + 15)
        .stroke();

      // Items
      let yPosition = tableTop + 30;
      let subtotal = 0;

      if (orderData.items && orderData.items.length > 0) {
        orderData.items.forEach((item) => {
          const itemTotal = item.price * item.quantity;
          subtotal += itemTotal;

          doc
            .fontSize(9)
            .fillColor('#666')
            .text(item.name, 50, yPosition)
            .text(item.quantity.toString(), 250, yPosition)
            .text(`₹${item.price}`, 350, yPosition)
            .text(`₹${itemTotal}`, 450, yPosition);

          yPosition += 20;
        });
      } else {
        doc
          .fontSize(9)
          .fillColor('#666')
          .text(orderData.plan || 'Membership', 50, yPosition)
          .text('1', 250, yPosition)
          .text(`₹${orderData.totalAmount}`, 350, yPosition)
          .text(`₹${orderData.totalAmount}`, 450, yPosition);
        
        subtotal = orderData.totalAmount;
        yPosition += 20;
      }

      // Totals
      yPosition += 20;
      doc
        .strokeColor('#ddd')
        .lineWidth(1)
        .moveTo(350, yPosition)
        .lineTo(550, yPosition)
        .stroke();

      yPosition += 15;
      doc
        .fontSize(10)
        .fillColor('#000')
        .text('Subtotal:', 350, yPosition)
        .text(`₹${subtotal}`, 450, yPosition);

      yPosition += 20;
      const tax = subtotal * 0.18; // 18% GST
      doc
        .text('GST (18%):', 350, yPosition)
        .text(`₹${tax.toFixed(2)}`, 450, yPosition);

      yPosition += 20;
      const total = subtotal + tax;
      doc
        .fontSize(12)
        .fillColor('#00f5ff')
        .text('Total:', 350, yPosition)
        .text(`₹${total.toFixed(2)}`, 450, yPosition);

      // Payment status
      yPosition += 40;
      doc
        .fontSize(10)
        .fillColor(orderData.paymentStatus === 'paid' ? '#00ff88' : '#ff4757')
        .text(`Payment Status: ${orderData.paymentStatus?.toUpperCase() || 'PENDING'}`, 50, yPosition);

      // Footer
      doc
        .fontSize(8)
        .fillColor('#999')
        .text('Thank you for choosing AURA FIT!', 50, 700, { align: 'center', width: 500 })
        .text('For any queries, contact us at support@aurafit.com', 50, 715, { align: 'center', width: 500 });

      doc.end();

      stream.on('finish', () => {
        resolve({
          success: true,
          filePath,
          fileName,
        });
      });

      stream.on('error', (error) => {
        reject(error);
      });
    } catch (error) {
      reject(error);
    }
  });
};

const generateMembershipInvoice = async (membershipData) => {
  const orderData = {
    orderId: membershipData._id || 'MEM-' + Date.now(),
    date: membershipData.createdAt || new Date(),
    customerName: membershipData.name,
    email: membershipData.email,
    phone: membershipData.phone,
    plan: `${membershipData.plan} Membership`,
    totalAmount: membershipData.price,
    status: membershipData.status,
    paymentStatus: membershipData.paymentStatus || 'pending',
  };

  return generateInvoice(orderData);
};

module.exports = {
  generateInvoice,
  generateMembershipInvoice,
};
