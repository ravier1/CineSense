import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../domain/movie.dart';
import '../../../core/config/env_config.dart';

final movieRepositoryProvider = Provider((ref) => MovieRepository(Dio()));

class MovieRepository {
  final Dio _dio;
  final String _baseUrl = EnvConfig.baseUrl;

  MovieRepository(this._dio);

  Future<List<Movie>> fetchTrendingMovies() async {
    try {
      final response = await _dio.get('$_baseUrl/movies/trending');
      final List<dynamic> results = response.data['results'];
      return results.map((json) => Movie.fromJson(json)).toList();
    } catch (e) {
      throw Exception('Failed to load trending movies: $e');
    }
  }

  Future<List<Movie>> fetchPopularMovies() async {
    try {
      final response = await _dio.get('$_baseUrl/movies/popular');
      final List<dynamic> results = response.data['results'];
      return results.map((json) => Movie.fromJson(json)).toList();
    } catch (e) {
      throw Exception('Failed to load popular movies: $e');
    }
  }

  Future<List<Movie>> fetchTopRatedMovies() async {
    try {
      final response = await _dio.get('$_baseUrl/movies/top-rated');
      final List<dynamic> results = response.data['results'];
      return results.map((json) => Movie.fromJson(json)).toList();
    } catch (e) {
      throw Exception('Failed to load top rated movies: $e');
    }
  }

  Future<List<Movie>> fetchTrendingTvShows() async {
    try {
      final response = await _dio.get('$_baseUrl/tv/trending');
      final List<dynamic> results = response.data['results'];
      return results.map((json) => Movie.fromJson(json)).toList();
    } catch (e) {
      throw Exception('Failed to load trending TV shows: $e');
    }
  }

  Future<List<Movie>> fetchUpcomingMovies() async {
    try {
      final response = await _dio.get('$_baseUrl/movies/upcoming');
      final List<dynamic> results = response.data['results'];
      return results.map((json) => Movie.fromJson(json)).toList();
    } catch (e) {
      throw Exception('Failed to load upcoming movies: $e');
    }
  }

  Future<List<Movie>> searchMovies(String query) async {
    try {
      final response = await _dio.get(
        '$_baseUrl/movies/search',
        queryParameters: {'query': query},
      );
      final List<dynamic> data = response.data;
      return data.map((json) => Movie.fromJson(json)).toList();
    } catch (e) {
      throw Exception('Failed to search movies: $e');
    }
  }

  Future<String> fetchAiReview(int movieId, String title) async {
    try {
      final response = await _dio.post(
        '$_baseUrl/critic',
        data: {
          'movieId': movieId,
          'title': title,
        },
      );
      return response.data['review'];
    } catch (e) {
      throw Exception('Failed to load AI review: $e');
    }
  }
}
