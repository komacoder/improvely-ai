const PAYCOM_MERCHANT_ID = '68c2b4853c62807f740dfab5';

const generateOrderId = (): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `order_${timestamp}_${random}`;
};


const uzsToTiyin = (uzsAmount: number): number => {
  return Math.round(uzsAmount * 100);
};


const PAYCOM_MINIMUM_AMOUNT_TIYIN = 100000; // 1000 UZS minimum (backend amount is already correct)


export const createPaycomCheckoutUrl = (
  orderId: string,
  amountInUzs: number,
  language: 'ru' | 'uz' | 'en' = 'uz',
  returnUrl: string = window.location.origin
): string => {

  // Validate amount
  if (!amountInUzs || isNaN(amountInUzs) || amountInUzs <= 0) {
    throw new Error(`Invalid amount: ${amountInUzs}. Amount must be a positive number.`);
  }

  const amountInTiyin = uzsToTiyin(amountInUzs);
  
  if (amountInTiyin < PAYCOM_MINIMUM_AMOUNT_TIYIN) {
    // Use minimum amount instead
    const adjustedAmount = PAYCOM_MINIMUM_AMOUNT_TIYIN;
  }
  
  // Use minimum amount if below threshold
  const finalAmount = Math.max(amountInTiyin, PAYCOM_MINIMUM_AMOUNT_TIYIN);
  
  // Construct parameters string
  const params = [
    `m=${PAYCOM_MERCHANT_ID}`,
    `ac.orderId=${orderId}`,
    `a=${finalAmount}`,
    `l=${language}`,
    `c=${returnUrl}`,
    `ct=3000`, // 3 seconds delay
    `cr=860`, // UZS currency code
  ].join(';');

  const encodedParams = btoa(params);

  return `https://checkout.paycom.uz/${encodedParams}`;
};

/**
 * Generate Paycom checkout URL for a plan
 */
export const generatePlanCheckoutUrl = (
  orderId: string,
  planPrice: number,
  language: 'ru' | 'uz' | 'en' = 'uz',
  returnUrl: string = window.location.origin
): string => {
  return createPaycomCheckoutUrl(orderId, planPrice, language, returnUrl);
};

/**
 * Decode Paycom parameters for debugging
 */
export const decodePaycomParams = (encodedString: string): string => {
  try {
    return atob(encodedString);
  } catch (error) {
    return '';
  }
};
