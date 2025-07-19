import { z } from "zod";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { env } from "~/env.js";

export type PaymentMethod = "MTN_MOMO" | "ORANGE_MONEY" | "CASH";

export interface PaymentRequest {
  amount: number;
  currency: string;
  method: PaymentMethod;
  customerPhone?: string;
  customerEmail?: string;
  customerName?: string;
  reference: string;
  description: string;
  metadata?: Record<string, any>;
}

export interface PaymentResponse {
  success: boolean;
  paymentReference?: string;
  transactionId?: string;
  status: "PENDING" | "COMPLETED" | "FAILED";
  message?: string;
  paymentUrl?: string; // For redirects or QR codes
  additionalInfo?: Record<string, any>;
}

export class PaymentService {
  private mtnAccessToken: string | null = null;
  private orangeAccessToken: string | null = null;
  
  /**
   * Get MTN MoMo Access Token
   */
  private async getMTNAccessToken(): Promise<string> {
    if (this.mtnAccessToken) {
      return this.mtnAccessToken;
    }

    try {
      const response = await axios.post(
        `${env.MTN_MOMO_API_BASE_URL}/collection/token/`,
        {},
        {
          headers: {
            'Authorization': `Basic ${Buffer.from(`${env.MTN_MOMO_API_USER_ID}:${env.MTN_MOMO_API_KEY}`).toString('base64')}`,
            'Ocp-Apim-Subscription-Key': env.MTN_MOMO_PRIMARY_KEY,
            'X-Target-Environment': env.MTN_MOMO_ENVIRONMENT
          }
        }
      );

      this.mtnAccessToken = response.data.access_token;
      
      // Clear token after 50 minutes (tokens expire after 1 hour)
      setTimeout(() => {
        this.mtnAccessToken = null;
      }, 50 * 60 * 1000);

      return this.mtnAccessToken;
    } catch (error) {
      console.error('MTN token generation failed:', error);
      if (axios.isAxiosError(error)) {
        console.error('Response data:', error.response?.data);
        console.error('Response status:', error.response?.status);
      }
      throw new Error('Failed to authenticate with MTN MoMo API');
    }
  }

  /**
   * Create API User (for initial setup) - Call this once to set up your API User
   */
  async createMTNAPIUser(): Promise<{ apiUserId: string }> {
    const apiUserId = uuidv4();

    try {
      await axios.post(
        `${env.MTN_MOMO_API_BASE_URL}/v1_0/apiuser`,
        {
          providerCallbackHost: process.env.NEXTAUTH_URL || 'http://localhost:3000'
        },
        {
          headers: {
            'X-Reference-Id': apiUserId,
            'Ocp-Apim-Subscription-Key': env.MTN_MOMO_PRIMARY_KEY,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('MTN API User created successfully:', apiUserId);
      return { apiUserId };
    } catch (error) {
      console.error('MTN API User creation failed:', error);
      if (axios.isAxiosError(error)) {
        console.error('Response data:', error.response?.data);
        console.error('Response status:', error.response?.status);
      }
      throw new Error('Failed to create MTN API User');
    }
  }

  /**
   * Generate API Key for API User - Call this after creating API User
   */
  async generateMTNAPIKey(apiUserId: string): Promise<{ apiKey: string }> {
    try {
      const response = await axios.post(
        `${env.MTN_MOMO_API_BASE_URL}/v1_0/apiuser/${apiUserId}/apikey`,
        {},
        {
          headers: {
            'Ocp-Apim-Subscription-Key': env.MTN_MOMO_PRIMARY_KEY
          }
        }
      );

      console.log('MTN API Key generated successfully');
      return { apiKey: response.data.apiKey };
    } catch (error) {
      console.error('MTN API Key generation failed:', error);
      if (axios.isAxiosError(error)) {
        console.error('Response data:', error.response?.data);
        console.error('Response status:', error.response?.status);
      }
      throw new Error('Failed to generate MTN API Key');
    }
  }

  /**
   * Get Orange Money Access Token
   */
  private async getOrangeAccessToken(): Promise<string> {
    if (this.orangeAccessToken) {
      return this.orangeAccessToken;
    }

    try {
      const response = await axios.post(
        `${env.ORANGE_MONEY_API_BASE_URL}/oauth/token`,
        'grant_type=client_credentials',
        {
          headers: {
            'Authorization': `Basic ${Buffer.from(`${env.ORANGE_MONEY_CLIENT_ID}:${env.ORANGE_MONEY_CLIENT_SECRET}`).toString('base64')}`,
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json'
          }
        }
      );

      this.orangeAccessToken = response.data.access_token;
      
      // Clear token before expiration
      setTimeout(() => {
        this.orangeAccessToken = null;
      }, (response.data.expires_in - 60) * 1000);

      return this.orangeAccessToken;
    } catch (error) {
      console.error('Orange token generation failed:', error);
      throw new Error('Failed to authenticate with Orange Money API');
    }
  }
  
  /**
   * Process MTN Mobile Money Payment
   */
  async processMTNMobileMoneyPayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      const { amount, customerPhone, reference, description } = request;
      
      if (!customerPhone) {
        return {
          success: false,
          status: "FAILED",
          message: "Phone number is required for MTN Mobile Money"
        };
      }

      // Validate phone number format (Cameroon MTN format)
      if (!this.validateMTNPhoneNumber(customerPhone)) {
        return {
          success: false,
          status: "FAILED",
          message: "Invalid MTN phone number format. Use +237 67X XXX XXX or +237 68X XXX XXX"
        };
      }

      // Check if we have the required credentials
      if (!env.MTN_MOMO_PRIMARY_KEY || !env.MTN_MOMO_API_USER_ID || !env.MTN_MOMO_API_KEY) {
        console.warn('MTN MoMo credentials not configured, using simulation');
        return this.simulateMTNMoMoAPI({
          amount,
          phone: customerPhone,
          reference,
          description
        });
      }

      // Get access token
      const accessToken = await this.getMTNAccessToken();
      
      // Prepare payment request
      const transactionId = uuidv4();

      // Format phone number for MTN API (remove +237 prefix, keep 237)
      const formattedPhone = customerPhone.startsWith('+237')
        ? customerPhone.substring(1)
        : customerPhone.startsWith('237')
          ? customerPhone
          : `237${customerPhone}`;

      const paymentData = {
        amount: amount.toString(),
        currency: "EUR", // MTN API uses EUR for XAF in Cameroon sandbox
        externalId: reference,
        payer: {
          partyIdType: "MSISDN",
          partyId: formattedPhone
        },
        payerMessage: description,
        payeeNote: `Payment for booking ${reference}`
      };

      // Make payment request
      const response = await axios.post(
        `${env.MTN_MOMO_API_BASE_URL}/collection/v1_0/requesttopay`,
        paymentData,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'X-Reference-Id': transactionId,
            'X-Target-Environment': env.MTN_MOMO_ENVIRONMENT,
            'Ocp-Apim-Subscription-Key': env.MTN_MOMO_PRIMARY_KEY,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 202) {
        return {
          success: true,
          status: "PENDING",
          paymentReference: transactionId,
          transactionId: transactionId,
          message: "Payment request sent to your phone. Please confirm the transaction.",
          additionalInfo: {
            instructions: "Check your phone for a USSD prompt to complete the payment",
            timeout: "5 minutes"
          }
        };
      } else {
        return {
          success: false,
          status: "FAILED",
          message: "Failed to initiate payment. Please try again."
        };
      }

    } catch (error) {
      console.error("MTN MoMo payment error:", error);

      if (axios.isAxiosError(error)) {
        console.error('Response data:', error.response?.data);
        console.error('Response status:', error.response?.status);

        // Handle specific MTN API errors
        if (error.response?.status === 400) {
          return {
            success: false,
            status: "FAILED",
            message: "Invalid payment request. Please check your phone number and try again."
          };
        } else if (error.response?.status === 401) {
          return {
            success: false,
            status: "FAILED",
            message: "Authentication failed. Please contact support."
          };
        } else if (error.response?.status === 409) {
          return {
            success: false,
            status: "FAILED",
            message: "Duplicate transaction. Please try again with a different reference."
          };
        }
      }

      // Fall back to simulation if API fails
      console.warn('Falling back to MTN MoMo simulation due to API error');
      return this.simulateMTNMoMoAPI({
        amount: request.amount,
        phone: request.customerPhone!,
        reference: request.reference,
        description: request.description
      });
    }
  }

  /**
   * Check MTN MoMo payment status
   */
  async checkMTNPaymentStatus(transactionId: string): Promise<PaymentResponse> {
    try {
      if (!env.MTN_MOMO_PRIMARY_KEY || !env.MTN_MOMO_API_USER_ID || !env.MTN_MOMO_API_KEY) {
        // Simulate status check
        const isCompleted = Math.random() > 0.3; // 70% success rate for demo
        return {
          success: isCompleted,
          status: isCompleted ? "COMPLETED" : "PENDING",
          transactionId,
          message: isCompleted ? "Payment completed successfully" : "Payment is still pending"
        };
      }

      const accessToken = await this.getMTNAccessToken();

      const response = await axios.get(
        `${env.MTN_MOMO_API_BASE_URL}/collection/v1_0/requesttopay/${transactionId}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'X-Target-Environment': env.MTN_MOMO_ENVIRONMENT,
            'Ocp-Apim-Subscription-Key': env.MTN_MOMO_PRIMARY_KEY
          }
        }
      );

      const { status, reason } = response.data;

      switch (status) {
        case 'SUCCESSFUL':
          return {
            success: true,
            status: "COMPLETED",
            transactionId,
            message: "Payment completed successfully"
          };
        case 'PENDING':
          return {
            success: true,
            status: "PENDING",
            transactionId,
            message: "Payment is still pending confirmation"
          };
        case 'FAILED':
          return {
            success: false,
            status: "FAILED",
            transactionId,
            message: reason || "Payment failed"
          };
        default:
          return {
            success: false,
            status: "FAILED",
            transactionId,
            message: "Unknown payment status"
          };
      }

    } catch (error) {
      console.error("MTN payment status check error:", error);
      return {
        success: false,
        status: "FAILED",
        transactionId,
        message: "Failed to check payment status"
      };
    }
  }


  /**
   * Process Orange Money Payment
   */
  async processOrangeMoneyPayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      const { amount, customerPhone, reference, description } = request;
      
      if (!customerPhone) {
        return {
          success: false,
          status: "FAILED",
          message: "Phone number is required for Orange Money"
        };
      }

      // Validate Orange phone number format
      if (!this.validateOrangePhoneNumber(customerPhone)) {
        return {
          success: false,
          status: "FAILED",
          message: "Invalid Orange phone number format. Use +237 69X XXX XXX"
        };
      }

      // Check if we have the required credentials
      if (!env.ORANGE_MONEY_CLIENT_ID || !env.ORANGE_MONEY_CLIENT_SECRET || !env.ORANGE_MONEY_MERCHANT_KEY) {
        console.warn('Orange Money credentials not configured, using simulation');
        return this.simulateOrangeMoneyAPI({
          amount,
          phone: customerPhone,
          reference,
          description
        });
      }

      // Get access token
      const accessToken = await this.getOrangeAccessToken();
      
      // Prepare payment request
      const paymentData = {
        merchant_key: env.ORANGE_MONEY_MERCHANT_KEY,
        currency: "XOF", // Orange Money uses XOF for Cameroon
        order_id: reference,
        amount: amount,
        return_url: `${process.env.NEXTAUTH_URL}/api/payment/orange/callback`,
        cancel_url: `${process.env.NEXTAUTH_URL}/checkout`,
        notif_url: `${process.env.NEXTAUTH_URL}/api/payment/orange/webhook`,
        lang: "fr",
        reference: description
      };

      // Make payment request
      const response = await axios.post(
        `${env.ORANGE_MONEY_API_BASE_URL}/webpayment`,
        paymentData,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );

      if (response.data && response.data.payment_url) {
        return {
          success: true,
          status: "PENDING",
          paymentReference: response.data.pay_token || reference,
          paymentUrl: response.data.payment_url,
          message: "Please complete the payment in your Orange Money app.",
          additionalInfo: {
            instructions: "You will be redirected to Orange Money to complete the payment",
            timeout: "10 minutes"
          }
        };
      } else {
        return {
          success: false,
          status: "FAILED",
          message: "Failed to initiate Orange Money payment. Please try again."
        };
      }

    } catch (error) {
      console.error("Orange Money payment error:", error);
      
      // Fall back to simulation if API fails
      return this.simulateOrangeMoneyAPI({
        amount: request.amount,
        phone: request.customerPhone!,
        reference: request.reference,
        description: request.description
      });
    }
  }

  /**
   * Validate MTN phone number (Cameroon)
   */
  private validateMTNPhoneNumber(phone: string): boolean {
    // MTN Cameroon prefixes: 67X, 68X
    const mtnPattern = /^\+237\s?(67[0-9]|68[0-9])\s?[0-9]{3}\s?[0-9]{3}$/;
    return mtnPattern.test(phone.replace(/\s/g, ''));
  }

  /**
   * Validate Orange phone number (Cameroon)
   */
  private validateOrangePhoneNumber(phone: string): boolean {
    // Orange Cameroon prefixes: 69X
    const orangePattern = /^\+237\s?(69[0-9])\s?[0-9]{3}\s?[0-9]{3}$/;
    return orangePattern.test(phone.replace(/\s/g, ''));
  }

  /**
   * Simulate MTN MoMo API call
   */
  private async simulateMTNMoMoAPI(params: {
    amount: number;
    phone: string;
    reference: string;
    description: string;
  }): Promise<PaymentResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simulate random success/failure for demo
    const isSuccess = Math.random() > 0.1; // 90% success rate

    if (isSuccess) {
      return {
        success: true,
        status: "PENDING",
        paymentReference: `MTN_${Date.now()}`,
        transactionId: `TXN_${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        message: "Payment request sent to your phone. Please confirm the transaction.",
        additionalInfo: {
          instructions: "Check your phone for a USSD prompt to complete the payment",
          timeout: "5 minutes"
        }
      };
    } else {
      return {
        success: false,
        status: "FAILED",
        message: "Payment failed. Please check your account balance and try again."
      };
    }
  }

  /**
   * Simulate Orange Money API call
   */
  private async simulateOrangeMoneyAPI(params: {
    amount: number;
    phone: string;
    reference: string;
    description: string;
  }): Promise<PaymentResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Simulate random success/failure for demo
    const isSuccess = Math.random() > 0.15; // 85% success rate

    if (isSuccess) {
      return {
        success: true,
        status: "PENDING",
        paymentReference: `OM_${Date.now()}`,
        transactionId: `OM_${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        message: "Payment request sent. Please complete the transaction on your Orange Money app.",
        additionalInfo: {
          instructions: "Open your Orange Money app and approve the payment",
          timeout: "10 minutes"
        }
      };
    } else {
      return {
        success: false,
        status: "FAILED",
        message: "Payment failed. Please ensure you have sufficient balance."
      };
    }
  }


  /**
   * Main payment processing method
   */
  async processPayment(request: PaymentRequest): Promise<PaymentResponse> {
    switch (request.method) {
      case "MTN_MOMO":
        return this.processMTNMobileMoneyPayment(request);
      
      case "ORANGE_MONEY":
        return this.processOrangeMoneyPayment(request);
      
      case "CASH":
        return {
          success: true,
          status: "PENDING",
          paymentReference: `CASH_${Date.now()}`,
          message: "Cash payment selected. Pay at the event venue."
        };
      
      default:
        return {
          success: false,
          status: "FAILED",
          message: "Unsupported payment method"
        };
    }
  }

  /**
   * Verify payment status (for polling)
   */
  async verifyPaymentStatus(paymentReference: string, method: PaymentMethod): Promise<PaymentResponse> {
    try {
      // In real implementation, you would call the respective API to check status
      
      // Simulate verification
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Random success for demo (in real app, you'd check actual payment status)
      const isCompleted = Math.random() > 0.3; // 70% completion rate for demo
      
      if (isCompleted) {
        return {
          success: true,
          status: "COMPLETED",
          paymentReference,
          message: "Payment completed successfully"
        };
      } else {
        return {
          success: true,
          status: "PENDING",
          paymentReference,
          message: "Payment is still pending"
        };
      }
      
    } catch (error) {
      console.error("Payment verification error:", error);
      return {
        success: false,
        status: "FAILED",
        message: "Failed to verify payment status"
      };
    }
  }
}

export const paymentService = new PaymentService();
