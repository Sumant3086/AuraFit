# Payment Setup Documentation

## Razorpay Integration

This application uses Razorpay payment gateway for processing orders. The payment flow has been configured to use your Razorpay payment link.

### Environment Configuration

The Razorpay payment link has been added to your server environment file:

```
RAZORPAY_PAYMENT_LINK=https://razorpay.me/@sumantyadav
```

### Payment Flow

1. **Order Creation**: When a user clicks "Proceed to Checkout" in the shopping cart:
   - Order is created in the database with status "Pending"
   - Payment status is set to "Pending"
   - Order ID is stored in localStorage for payment confirmation

2. **Payment Processing**: 
   - User is redirected to the Razorpay payment link in a new tab
   - User is also redirected to the payment confirmation page

3. **Payment Confirmation**:
   - Users can confirm their payment on the `/confirm-payment` page
   - Order status is updated to "Processing" and payment status to "Paid"
   - Users can then view their orders in "My Orders" section

### API Endpoints

#### Order Management
- `POST /api/orders` - Create new order
- `GET /api/orders/user/email/:email` - Get orders by user email
- `PUT /api/orders/:id/status` - Update order status
- `POST /api/orders/:id/confirm-payment` - Confirm payment for an order
- `GET /api/orders/payment/razorpay-link` - Get Razorpay payment link

#### Admin Management
- `GET /api/admin/orders` - Get all orders (admin)
- `PATCH /api/admin/orders/:id/status` - Update order status (admin)

### Order Status Flow

1. **Pending** - Order created, payment not completed
2. **Processing** - Payment confirmed, order being prepared
3. **Shipped** - Order dispatched
4. **Delivered** - Order delivered to customer
5. **Cancelled** - Order cancelled

### Payment Status Flow

1. **Pending** - Payment not completed
2. **Paid** - Payment successful
3. **Failed** - Payment failed
4. **Refunded** - Payment refunded

### Usage Instructions

1. **For Customers**:
   - Add items to cart and proceed to checkout
   - Complete payment using the Razorpay link
   - Confirm payment on the confirmation page
   - Track orders in "My Orders" section

2. **For Admins**:
   - View all orders in admin dashboard
   - Update order statuses as needed
   - Monitor payment confirmations

### Testing the Payment System

1. Add items to cart
2. Proceed to checkout (must be logged in)
3. Complete the payment flow
4. Verify order appears in "My Orders"
5. Test payment confirmation functionality

### Troubleshooting

- Ensure server environment variables are properly set
- Check that MongoDB connection is working
- Verify all API endpoints are accessible
- Test payment link accessibility

### Security Notes

- Payment processing is handled by Razorpay
- Order data is stored securely in MongoDB
- User authentication is required for order placement
- Admin routes should be protected in production