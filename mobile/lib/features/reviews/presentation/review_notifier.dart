import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../domain/review.dart';
import '../data/review_repository.dart';

final movieReviewsProvider = StateNotifierProvider.family<ReviewNotifier, AsyncValue<List<Review>>, int>((ref, movieId) {
  final repository = ref.watch(reviewRepositoryProvider);
  return ReviewNotifier(repository, movieId);
});

class ReviewNotifier extends StateNotifier<AsyncValue<List<Review>>> {
  final ReviewRepository _repository;
  final int _movieId;

  ReviewNotifier(this._repository, this._movieId) : super(const AsyncValue.loading()) {
    fetchReviews();
  }

  Future<void> fetchReviews() async {
    state = const AsyncValue.loading();
    try {
      final reviews = await _repository.fetchReviews(_movieId);
      state = AsyncValue.data(reviews);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> addReview(double rating, String content) async {
    try {
      await _repository.postReview(
        movieId: _movieId,
        rating: rating,
        content: content,
      );
      await fetchReviews();
    } catch (e) {
      // You might want to handle this error specifically or rethrow
      rethrow;
    }
  }
}
