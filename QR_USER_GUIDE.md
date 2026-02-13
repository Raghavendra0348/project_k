# QR Code Vending Machine - User Guide

## 🎯 How It Works

Your vending machine system now has a seamless QR-based experience:

### For Users (Customer Flow):

1. **Visit the Website**
   - Open your vending machine website (e.g., `https://yourapp.com`)
   - You'll see the homepage with a "Scan QR Code to Start" button

2. **Scan QR Code**
   - Click the "Scan QR Code to Start" button
   - Allow camera access when prompted
   - Point your camera at the QR code on the vending machine
   - The system will automatically detect and redirect you to that machine's page

3. **Select Products**
   - Browse available products with real-time stock updates
   - See prices and availability instantly
   - Click on a product to select it

4. **Make Payment**
   - Pay securely via UPI, cards, or net banking (Razorpay)
   - Payment is processed in real-time
   - No cash needed!

5. **Collect Product**
   - Once payment is confirmed, the vending machine dispenses your product
   - Real-time updates ensure no lag between payment and dispensing

### For Admins (Setup):

#### Generate QR Codes:

1. **Access QR Generator**
   - In development: Visit `http://localhost:3000/admin/qr-generator`
   - In production: Visit `https://yourapp.com/admin/qr-generator`

2. **Create QR Code**
   - Enter your machine ID (e.g., `machine-001`, `machine-002`)
   - Or select from predefined machines
   - QR code generates automatically

3. **Download & Print**
   - Click "Download QR Code" button
   - Print the QR code (recommended: 10cm x 10cm or larger)
   - Laminate for durability

4. **Place on Vending Machine**
   - Attach the QR code to the front of your vending machine
   - Make sure it's at eye level and well-lit
   - Test by scanning with the app

## 📱 QR Code Format

The system supports multiple QR code formats:

1. **Simple Machine ID**: `machine-001`
2. **Prefixed Format**: `MACHINE:machine-001`
3. **Full URL**: `https://yourapp.com/machine/machine-001`

All formats work seamlessly with the scanner.

## 🔧 Technical Details

### Real-time Updates:
- Uses Firebase Firestore for real-time database
- Stock updates instantly when users make purchases
- No polling required - updates push to all connected clients
- Typical latency: < 200ms

### Payment Processing:
- Razorpay integration for secure payments
- Supports UPI, cards, net banking, and wallets
- Payment verification with HMAC signature
- Automatic stock reduction after successful payment

### Camera Support:
- Works on all modern browsers with camera access
- Supports both front and rear cameras
- Automatic camera selection (prefers rear camera)
- Graceful error handling for permission denials

## 🚀 Quick Start (Development)

1. **Start the backend:**
   ```bash
   cd functions
   npm run dev
   ```

2. **Start the frontend:**
   ```bash
   cd frontend
   npm start
   ```

3. **Generate QR codes:**
   - Visit `http://localhost:3000/admin/qr-generator`
   - Download QR codes for your test machines

4. **Test the flow:**
   - Open `http://localhost:3000` on your phone
   - Click "Scan QR Code to Start"
   - Scan one of the generated QR codes
   - Browse products and make a test payment

## 📝 Configuration

### Machine IDs:
Edit machine IDs in:
- [`frontend/src/pages/HomePage.jsx`](frontend/src/pages/HomePage.jsx) - Test machines list
- [`frontend/src/pages/QRGeneratorPage.jsx`](frontend/src/pages/QRGeneratorPage.jsx) - Predefined machines

### Razorpay Setup:
Create [`functions/.env`](functions/.env):
```env
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
```

### Firebase Setup:
Configured in [`frontend/src/services/firebase.js`](frontend/src/services/firebase.js)

## 🎨 Customization

### Add New Machines:
1. Generate QR code via admin panel
2. Add machine to Firestore database
3. Seed products for that machine
4. Print and attach QR code

### Styling:
- Built with Tailwind CSS
- Colors: Blue/Indigo gradient theme
- Fully responsive design
- Mobile-first approach

## 🐛 Troubleshooting

### Camera not working:
- Check browser permissions
- Ensure HTTPS (camera requires secure context)
- Try a different browser
- Check if camera is being used by another app

### QR code not scanning:
- Ensure good lighting
- Hold camera steady
- Try moving closer/farther from QR code
- Check QR code isn't damaged or blurry

### Payment issues:
- Verify Razorpay credentials in `.env`
- Check Firebase Functions logs
- Ensure test mode is enabled for testing
- Verify stock availability before payment

## 📊 Database Seeding

Seed test data:
```bash
cd functions
npm run seed
```

This creates:
- Test machines (machine-001, machine-002, etc.)
- Sample products with stock
- Test categories

## 🔒 Security

- HTTPS required in production
- Razorpay payment signature verification
- Firebase security rules
- Input validation on all endpoints
- No sensitive data in QR codes

## 📈 Monitoring

- Firebase Console: View real-time database updates
- Razorpay Dashboard: Monitor payments
- Browser DevTools: Debug frontend issues
- Firebase Functions Logs: Backend debugging

## 🆘 Support

For issues or questions:
1. Check this guide
2. Review Firebase/Razorpay documentation
3. Check browser console for errors
4. Review server logs

---

**Enjoy your QR-based vending machine system! 🎉**
