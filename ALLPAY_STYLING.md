# Allpay Hosted Fields Styling Guide

## Current Implementation

The payment form is now displayed in a modal popup that matches your site's design:
- **Modal Background**: `#FFF0DC` (cream)
- **Border Color**: `#F0BB78` (gold/beige)
- **Text Color**: `#543A14` (dark brown)
- **Button Color**: `#F0BB78` (gold/beige)

## Customizing the Payment Form Fields (Inside Iframe)

The payment form fields (card number, expiration date, CVC) are rendered inside an iframe from Allpay's domain. To customize their styling, you need to configure CSS in Allpay's settings:

### Steps:

1. **Go to Allpay Dashboard**:
   - Navigate to: Settings → Integrations → My sites
   - Click "Hosted Fields settings" for your integration

2. **Configure CSS Styles**:
   - In the CSS customization section, you can add custom CSS to style the input fields
   - Allpay provides CSS customization options for:
     - Input field borders
     - Input field colors
     - Placeholder text
     - Focus states
     - Error states

3. **Suggested CSS** (to match your site's color scheme):
   ```css
   /* Input fields */
   .allpay-input {
     border-color: #F0BB78;
     color: #543A14;
   }
   
   /* Focus state */
   .allpay-input:focus {
     border-color: #F0BB78;
     box-shadow: 0 0 0 3px rgba(240, 187, 120, 0.1);
   }
   
   /* Placeholder */
   .allpay-input::placeholder {
     color: #543A14;
     opacity: 0.6;
   }
   ```

**Note**: The exact CSS class names may vary depending on Allpay's implementation. Check Allpay's documentation for the correct selectors.

### Limitations:

- You can only style what Allpay's API allows
- Some styling may be restricted for security/compliance reasons
- The iframe content is from Allpay's domain, so direct CSS injection from your site won't work
- All customization must be done through Allpay's Hosted Fields settings

## Current Modal Styling

The modal container around the iframe is fully styled to match your site:
- Cream background (`#FFF0DC`)
- Gold borders (`#F0BB78`)
- Dark brown text (`#543A14`)
- Serif font for headings
- Smooth animations

The modal will automatically appear when the user clicks "Complete Purchase" and the payment URL is ready.

