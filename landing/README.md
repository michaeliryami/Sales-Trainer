# Clozone Landing Page

Beautiful, conversion-focused landing page for Clozone.ai

## 🚀 Development

```bash
npm install
npm run dev
```

Visit http://localhost:5173

## 📦 Build for Production

```bash
npm run build
```

The `dist` folder will contain the production build.

## 🌐 Deployment

### Option 1: Vercel (Recommended)
1. Push to GitHub
2. Import project in Vercel
3. Configure custom domain: clozone.ai
4. Deploy!

### Option 2: Netlify
1. `npm run build`
2. Drag `dist` folder to Netlify
3. Configure custom domain

## 🎨 Customization

### Update Links:
- **Calendly**: Search for `calendly.com/your-link` and replace with your actual Calendly link
- **App URL**: Already set to `app.clozone.ai`
- **Email**: Update `hello@clozone.ai` and `sales@clozone.ai` with your actual emails

### Add Logo:
Place your logo files in `/public/`:
- `logo.png` (square, for favicon)
- `logolong.png` (horizontal, for header - optional)

### Update Content:
- Hero headline: Line 136 in `App.tsx`
- Features: Line 298 in `App.tsx`
- Pricing: Line 400 in `App.tsx`
- Footer: Line 596 in `App.tsx`

## 📊 What's Included

- ✅ Hero section with CTA
- ✅ Features grid (6 key features)
- ✅ Stats section
- ✅ Pricing cards (3 tiers)
- ✅ CTA section
- ✅ Footer with links
- ✅ Fixed navigation
- ✅ Responsive design
- ✅ Orange branding (#f26f25)
- ✅ Smooth animations
- ✅ SEO meta tags

## 🎯 Conversion Optimizations

- Multiple CTAs ("Book Demo" appears 4 times)
- Social proof section (add customer logos later)
- Clear pricing with volume discounts
- 14-day free trial messaging
- "No credit card required" trust signal
- FAQ section (add if needed)

## 📝 TODO Before Launch

- [ ] Add actual Calendly link
- [ ] Add logo files to `/public/`
- [ ] Add screenshot/demo video placeholder
- [ ] Add customer logos for social proof
- [ ] Set up analytics (Google Analytics, Plausible, etc.)
- [ ] Add FAQ section if needed
- [ ] Test on mobile devices
- [ ] Set up domain (clozone.ai)
- [ ] Configure SSL
- [ ] Add privacy policy and terms of service pages
