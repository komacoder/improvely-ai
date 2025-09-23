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
  // Debug: Check if amountInUzs is valid
  console.log('createPaycomCheckoutUrl called with:', {
    orderId,
    amountInUzs,
    language,
    returnUrl,
    amountType: typeof amountInUzs,
    isNaN: isNaN(amountInUzs)
  });

  console.log('Amount conversion:', {
    originalAmountUzs: amountInUzs,
    amountInTiyin: uzsToTiyin(amountInUzs),
    conversionFormula: `${amountInUzs} UZS * 100 = ${uzsToTiyin(amountInUzs)} tiyin`
  });

  // Validate amount
  if (!amountInUzs || isNaN(amountInUzs) || amountInUzs <= 0) {
    console.error('Invalid amount provided:', amountInUzs);
    throw new Error(`Invalid amount: ${amountInUzs}. Amount must be a positive number.`);
  }

  const amountInTiyin = uzsToTiyin(amountInUzs);
  
  if (amountInTiyin < PAYCOM_MINIMUM_AMOUNT_TIYIN) {
    console.warn(`Amount ${amountInUzs} UZS (${amountInTiyin} tiyin) is below Paycom minimum of 1000 UZS (${PAYCOM_MINIMUM_AMOUNT_TIYIN} tiyin)`);
    // Use minimum amount instead
    const adjustedAmount = PAYCOM_MINIMUM_AMOUNT_TIYIN;
    console.log(`Using adjusted amount: ${adjustedAmount} tiyin (1000 UZS)`);
  }
  
  // Use minimum amount if below threshold
  const finalAmount = Math.max(amountInTiyin, PAYCOM_MINIMUM_AMOUNT_TIYIN);
  
  console.log('Paycom URL Generation:', {
    orderId,
    originalAmountUzs: amountInUzs,
    originalAmountTiyin: amountInTiyin,
    finalAmountTiyin: finalAmount,
    language,
    returnUrl
  });
  
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
  console.log('generatePlanCheckoutUrl called with:', {
    orderId,
    planPrice,
    language,
    returnUrl,
    planPriceType: typeof planPrice,
    isNaN: isNaN(planPrice)
  });

  return createPaycomCheckoutUrl(orderId, planPrice, language, returnUrl);
};

/**
 * Decode Paycom parameters for debugging
 */
export const decodePaycomParams = (encodedString: string): string => {
  try {
    return atob(encodedString);
  } catch (error) {
    console.error('Error decoding Base64 string:', error);
    return '';
  }
};
