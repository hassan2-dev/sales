import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export type OtpiqProvider =
  | 'auto'
  | 'whatsapp-sms'
  | 'telegram-sms'
  | 'whatsapp-telegram-sms'
  | 'sms'
  | 'whatsapp'
  | 'telegram';

export interface OtpiqSendResult {
  smsId: string;
  message?: string;
  remainingCredit?: number;
  cost?: number;
}

@Injectable()
export class OtpiqService {
  private readonly logger = new Logger(OtpiqService.name);
  private readonly baseUrl = 'https://api.otpiq.com/api';

  constructor(private readonly config: ConfigService) {}

  isConfigured(): boolean {
    return Boolean(this.config.get<string>('OTPIQ_API_KEY')?.trim());
  }

  /**
   * Sends a verification code via OTPIQ.
   * Phone must be E.164 (`+964…`); OTPIQ expects digits only, no plus.
   */
  async sendVerificationCode(phoneE164: string, code: string): Promise<OtpiqSendResult> {
    const apiKey = this.config.get<string>('OTPIQ_API_KEY')?.trim();
    if (!apiKey) {
      throw new Error('OTPIQ_API_KEY is not set');
    }

    const phoneNumber = phoneE164.replace(/\D/g, '');
    const provider = (this.config.get<string>('OTPIQ_PROVIDER')?.trim() ||
      'whatsapp') as OtpiqProvider;
    const senderId = this.config.get<string>('OTPIQ_SENDER_ID')?.trim();

    const response = await fetch(`${this.baseUrl}/sms`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phoneNumber,
        smsType: 'verification',
        verificationCode: code,
        provider,
        ...(senderId ? { senderId } : {}),
      }),
    });

    const body = (await response.json().catch(() => ({}))) as Record<string, unknown>;

    if (!response.ok) {
      const detail =
        (typeof body.error === 'string' && body.error) ||
        (typeof body.message === 'string' && body.message) ||
        `OTPIQ request failed (${response.status})`;
      this.logger.error(`OTPIQ SMS failed for ${phoneNumber}: ${detail}`);
      const error = new Error(detail);
      (error as Error & { status?: number }).status = response.status;
      throw error;
    }

    return {
      smsId: String(body.smsId ?? ''),
      message: typeof body.message === 'string' ? body.message : undefined,
      remainingCredit:
        typeof body.remainingCredit === 'number' ? body.remainingCredit : undefined,
      cost: typeof body.cost === 'number' ? body.cost : undefined,
    };
  }
}
