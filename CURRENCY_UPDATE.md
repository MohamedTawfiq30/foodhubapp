# Currency Update: USD to INR

## Overview
The Food Ordering System has been updated to use Indian Rupees (INR) instead of US Dollars (USD) throughout the application.

## Changes Made

### 1. Currency Utility Library
Created `/src/lib/currency.ts` with the following features:
- **formatCurrency()**: Formats numbers as INR with ₹ symbol (e.g., ₹1,234.56)
- **formatCurrencyCompact()**: Formats large numbers in Indian notation (e.g., ₹1.2L for lakhs, ₹1.5Cr for crores)
- **parseCurrency()**: Parses currency strings to numbers
- **isValidPrice()**: Validates price inputs

### 2. Updated Components

#### Client-Side Pages:
- **RestaurantDetailsPage**: Food item prices display in INR
- **CartPage**: Cart totals, delivery fee (₹49), and subtotals in INR
- **CheckoutPage**: Order summary and total amount in INR
- **OrderHistoryPage**: Historical order amounts in INR
- **OrderTrackingPage**: Order details and item prices in INR

#### Admin-Side Pages:
- **AdminDashboardPage**: Revenue statistics in INR with compact notation (Lakhs/Crores)
- **AdminOrdersPage**: Order amounts in INR
- **AdminFoodPage**: Price input field labeled as "Price (₹)" with INR placeholder

### 3. Delivery Fee Update
Changed delivery fee from $2.99 to ₹49 (approximately equivalent)

### 4. Price Display Format
- All prices now display with ₹ symbol
- Indian number formatting (e.g., ₹1,23,456.78)
- Large amounts use compact notation:
  - ₹1.2L for 1.2 Lakhs (120,000)
  - ₹1.5Cr for 1.5 Crores (15,000,000)

## Usage for Admins

### Adding/Editing Food Items:
1. Navigate to Admin → Food Items
2. Click "Add Food Item" or edit existing item
3. Enter price in INR (e.g., 299 for ₹299.00)
4. The system will automatically format and display with ₹ symbol

### Price Guidelines:
- Typical food item prices: ₹50 - ₹500
- Premium items: ₹500 - ₹2000
- Delivery fee: ₹49 (fixed)

## Technical Notes

### For Developers:
- Import currency utilities: `import { formatCurrency } from '@/lib/currency'`
- Use `formatCurrency(amount)` for all price displays
- Use `formatCurrencyCompact(amount)` for dashboard statistics
- Database stores prices as decimal numbers (no currency symbol)
- All existing prices in database remain unchanged (just display format changed)

### Currency Conversion (Optional):
If you need to convert existing USD prices to INR:
- Current exchange rate: ~₹83 per $1 USD
- Example: $10 → ₹830

## Future Enhancements

### Optional: Real-time Currency Conversion
An Exchange Rate API integration is available if you need to:
- Support multiple currencies
- Convert prices dynamically
- Display prices in user's preferred currency

To implement:
1. Create Edge Function using the provided Exchange Rate API
2. Fetch USD to INR conversion rates
3. Store rates in database or cache
4. Apply conversion on price display

API Endpoint: `/v6/8192723d20263507156f9754/latest/USD`
Returns: Conversion rates including INR

## Testing Checklist

✅ All food item prices display with ₹ symbol
✅ Cart calculations use INR
✅ Checkout shows correct INR totals
✅ Order history displays INR amounts
✅ Admin dashboard shows revenue in INR
✅ Admin food management accepts INR input
✅ Delivery fee updated to ₹49

## Support

For questions or issues related to currency display:
1. Check `/src/lib/currency.ts` for formatting functions
2. Verify import statements in affected components
3. Ensure database prices are numeric (not strings)
4. Test with various price ranges (small, medium, large amounts)
