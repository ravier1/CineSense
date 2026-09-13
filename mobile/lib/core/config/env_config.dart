class EnvConfig {
  static const String devBaseUrl = 'http://localhost:3000/api';
  static const String prodBaseUrl = 'https://cinesense.stream/api';
  
  // Change this to true when deploying to production
  static const bool isProduction = false;
  
  static String get baseUrl => isProduction ? prodBaseUrl : devBaseUrl;
}
