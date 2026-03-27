import jwt from 'jsonwebtoken';
// Example using Twilio for SMS or AWS SNS / Firebase
// import twilio from 'twilio'; 

const JWT_SECRET = process.env.JWT_SECRET || 'prathik_super_secret_key';
const MOCK_OTP = '123456'; 

export class AuthService {
  /**
   * Generates and sends OTP to the user's mobile or email
   */
  static async sendOtp(identifier: string): Promise<boolean> {
    // 1. Generate random 6 digit OTP
    // const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // 2. Save OTP to Redis with 5 minute expiration (simulated here)
    // await redis.set(`otp:${identifier}`, otp, 'EX', 300);

    // 3. Send SMS using Twilio or MSG91
    /*
    const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);
    await client.messages.create({
      body: `Your Prathik Auto-Trading OTP is ${otp}`,
      from: '+1234567890',
      to: identifier
    });
    */
    
    console.log(`[MOCK] Sent OTP ${MOCK_OTP} to ${identifier}`);
    return true;
  }

  /**
   * Verifies OTP and generates a secure JWT Session
   */
  static async verifyOtpAndLogin(identifier: string, otp: string) {
    // 1. Fetch OTP from Redis
    // const storedOtp = await redis.get(`otp:${identifier}`);

    if (otp !== MOCK_OTP) {
      throw new Error('Invalid OTP');
    }

    // 2. Find or create user in Database
    const user = {
      id: "usr_1234",
      phone: identifier,
      name: "Prathik",
      subscriptionStatus: "trial", // 1 month free trial constraint
      autoTradeEnabled: false
    };

    // 3. Generate JWT
    const token = jwt.sign(
      { userId: user.id, role: 'user', subStatus: user.subscriptionStatus },
      JWT_SECRET,
      { expiresIn: '7d' } // 7-day secure session
    );

    return { user, token };
  }
}
