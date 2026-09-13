import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../domain/review.dart';
import '../../auth/data/auth_repository.dart';
import '../../../core/config/env_config.dart';

final reviewRepositoryProvider = Provider((ref) {
  final authRepo = ref.watch(authRepositoryProvider);
  return ReviewRepository(Dio(), authRepo);
});

class ReviewRepository {
  final Dio _dio;
  final AuthRepository _authRepository;
  final String _baseUrl = EnvConfig.baseUrl;

  ReviewRepository(this._dio, this._authRepository);

  Future<List<Review>> fetchReviews(int movieId) async {
    try {
      final response = await _dio.get('$_baseUrl/reviews/$movieId');
      final List<dynamic> data = response.data;
      return data.map((json) => Review.fromJson(json)).toList();
    } catch (e) {
      throw Exception('Failed to load reviews: $e');
    }
  }

  Future<void> postReview({
    required int movieId,
    required double rating,
    required String content,
  }) async {
    try {
      final token = await _authRepository.getToken();
      await _dio.post(
        '$_baseUrl/reviews',
        data: {
          'movieId': movieId,
          'rating': rating,
          'content': content,
        },
        options: Options(
          headers: {
            'Authorization': 'Bearer $token',
          },
        ),
      );
    } catch (e) {
      throw Exception('Failed to post review: $e');
    }
  }
}
