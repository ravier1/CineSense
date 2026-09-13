import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../domain/user.dart';

final authRepositoryProvider = Provider((ref) => AuthRepository());

class AuthRepository {
  final Dio _dio = Dio(BaseOptions(baseUrl: 'http://localhost:3000/api/auth')); // Update with real IP for physical devices
  final _storage = const FlutterSecureStorage();

  Future<void> register(String email, String password) async {
    try {
      await _dio.post('/register', data: {'email': email, 'password': password});
    } on DioException catch (e) {
      throw e.response?.data['error'] ?? 'Registration failed';
    }
  }

  Future<User> verifyOtp(String email, String otp) async {
    try {
      final response = await _dio.post('/verify-otp', data: {'email': email, 'otp': otp});
      final user = User.fromJson(response.data);
      if (user.token != null) {
        await _storage.write(key: 'token', value: user.token);
      }
      return user;
    } on DioException catch (e) {
      throw e.response?.data['error'] ?? 'OTP Verification failed';
    }
  }

  Future<User> login(String email, String password) async {
    try {
      final response = await _dio.post('/login', data: {'email': email, 'password': password});
      final user = User.fromJson(response.data);
      if (user.token != null) {
        await _storage.write(key: 'token', value: user.token);
      }
      return user;
    } on DioException catch (e) {
      throw e.response?.data['error'] ?? 'Login failed';
    }
  }

  Future<String?> getToken() async {
    return await _storage.read(key: 'token');
  }

  Future<void> logout() async {
    await _storage.delete(key: 'token');
  }
}
