import { Product, ProductPackage, StoreSettings, CurrencyCode, CurrencySettings, CartItem } from '../types';
import { formatCurrencyPrice } from './currency';

/**
 * Clean phone number to international WhatsApp format (only digits, no +, no spaces)
 */
export function cleanPhoneNumber(raw: string): string {
  return raw.replace(/[^0-9]/g, '');
}

/**
 * Generate WhatsApp checkout URL for a single product / package
 */
export function generateSingleWhatsAppCheckoutUrl(
  product: Product,
  selectedPackage: ProductPackage | undefined,
  quantity: number,
  currency: CurrencyCode,
  currencySettings: CurrencySettings,
  storeSettings: StoreSettings,
  customerNotes?: string
): string {
  const phone = cleanPhoneNumber(storeSettings.whatsapp_number || '905521234567');
  const prefix = storeSettings.whatsapp_prefix || 'مرحباً، أرغب في إتمام طلب المنتج الرقمي التالي:';

  const unitPrice = selectedPackage ? selectedPackage.base_price_usd : product.base_price_usd;
  const totalPriceUsd = unitPrice * quantity;
  const formattedTotal = formatCurrencyPrice(totalPriceUsd, currency, currencySettings);
  const formattedUnit = formatCurrencyPrice(unitPrice, currency, currencySettings);

  const packageName = selectedPackage
    ? `${selectedPackage.name} (${selectedPackage.quantity_label})`
    : 'الباقة الافتراضية / القياسية';

  const orderId = `DZ-${Date.now().toString().slice(-6)}`;

  let message = `${prefix}\n\n`;
  message += `📦 *المنتج:* ${product.name}\n`;
  if (product.mode === 'packages' || selectedPackage) {
    message += `💎 *الباقة:* ${packageName}\n`;
  }
  message += `🔢 *الكمية:* ${quantity}\n`;
  message += `💵 *سعر الوحدة:* ${formattedUnit}\n`;
  message += `💰 *المجموع الكلي:* ${formattedTotal}\n`;
  message += `⚡ *نوع التسليم:* ${product.delivery_time || 'فوري خلال دقائق'}\n`;
  message += `🔖 *رقم الطلب:* #${orderId}\n`;

  if (customerNotes && customerNotes.trim()) {
    message += `📝 *ملاحظات / بيانات الحساب:* ${customerNotes.trim()}\n`;
  }

  message += `\nيرجى تزويدي بطرق الدفع المتاحة لإتمام الطلب الآن. شكراً!`;

  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${phone}?text=${encodedMessage}`;
}

/**
 * Generate WhatsApp checkout URL for the entire Cart
 */
export function generateCartWhatsAppCheckoutUrl(
  items: CartItem[],
  currency: CurrencyCode,
  currencySettings: CurrencySettings,
  storeSettings: StoreSettings,
  customerNotes?: string
): string {
  const phone = cleanPhoneNumber(storeSettings.whatsapp_number || '905521234567');
  const prefix = storeSettings.whatsapp_prefix || 'مرحباً، أرغب في إتمام طلب المنتجات الرقمية التالية من سلة المشتريات:';

  const totalUsd = items.reduce((acc, item) => acc + item.totalPriceUsd, 0);
  const formattedGrandTotal = formatCurrencyPrice(totalUsd, currency, currencySettings);
  const orderId = `DZ-CART-${Date.now().toString().slice(-6)}`;

  let message = `${prefix}\n\n`;
  message += `🛒 *تفاصيل سلة المشتريات (${items.length} منتجات):*\n`;
  message += `──────────────────\n`;

  items.forEach((item, index) => {
    const pkgLabel = item.selectedPackage ? ` (${item.selectedPackage.name})` : '';
    const itemTotalFormatted = formatCurrencyPrice(item.totalPriceUsd, currency, currencySettings);
    message += `${index + 1}. *${item.product.name}*${pkgLabel}\n`;
    message += `   • الكمية: ${item.quantity} × ${formatCurrencyPrice(item.unitPriceUsd, currency, currencySettings)}\n`;
    message += `   • الإجمالي: ${itemTotalFormatted}\n\n`;
  });

  message += `──────────────────\n`;
  message += `💰 *المجموع النهائي للطلب:* ${formattedGrandTotal}\n`;
  message += `🔖 *رقم السلة:* #${orderId}\n`;

  if (customerNotes && customerNotes.trim()) {
    message += `📝 *ملاحظات العميل:* ${customerNotes.trim()}\n`;
  }

  message += `\nيرجى تأكيد توفر المنتجات وتزويدي ببيانات الدفع. شكراً لكم!`;

  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${phone}?text=${encodedMessage}`;
}
