# Prathik Mobile App Architecture (Flutter)

This directory acts as the root for the cross-platform mobile application, sharing the same Node.js Auto Trading backend.

## 1. Directory Structure

```text
lib/
 ├── core/
 │   ├── api.dart          # Direct HTTP calls to backend (Node.js)
 │   ├── auth.dart         # JWT Token management (SecureStorage)
 │   └── constants.dart    # Base URLs, theme colors (Emerald/Dark)
 ├── models/
 │   ├── user_model.dart   # Maps to Node backend User schema
 │   └── trade_model.dart  
 ├── screens/
 │   ├── login_screen.dart # Mobile/OTP input view
 │   ├── otp_screen.dart   # OTP Verification
 │   ├── dashboard.dart    # Auto Trading WebSocket viewer
 │   └── pricing.dart      # In-App purchases / Razorpay Integration
 └── main.dart
```

## 2. API Integration Example (OTP Auth)

```dart
import 'package:http/http.dart' as http;
import 'dart:convert';

class ApiService {
  static const String baseUrl = 'http://api.yourdomain.com';

  static Future<bool> sendOtp(String phone) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/send-otp'),
      body: jsonEncode({'phone': phone}),
      headers: {'Content-Type': 'application/json'},
    );
    return response.statusCode == 200;
  }

  static Future<String?> verifyOtp(String phone, String otp) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/verify'),
      body: jsonEncode({'phone': phone, 'otp': otp}),
      headers: {'Content-Type': 'application/json'},
    );
    
    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return data['token']; // Save this to SecureStorage
    }
    return null;
  }
}
```

## 3. Security Requirements

To ensure SEBI compliance and prevent strategy leaking, you MUST prevent screenshots on the mobile app.

### Android Setup:
In `android/app/src/main/kotlin/com/example/prathik/MainActivity.kt`:

```kotlin
import android.os.Bundle
import android.view.WindowManager
import io.flutter.embedding.android.FlutterActivity

class MainActivity: FlutterActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        // Blocks screenshots and screen recordings natively
        window.setFlags(WindowManager.LayoutParams.FLAG_SECURE, WindowManager.LayoutParams.FLAG_SECURE)
    }
}
```

### iOS Setup:
iOS does not offer a native screenshot-blocking API. You must either use `flutter_windowmanager` plugin or manually detect backgrounding in `AppDelegate.swift` and apply a Gaussian Blur overlay over the trading window.
