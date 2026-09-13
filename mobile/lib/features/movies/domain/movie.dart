class Movie {
  final String id;
  final String title;
  final String posterUrl;
  final double rating;
  final String overview;

  const Movie({
    required this.id,
    required this.title,
    required this.posterUrl,
    required this.rating,
    required this.overview,
  });

  factory Movie.fromJson(Map<String, dynamic> json) {
    return Movie(
      id: json['id'].toString(),
      title: json['title'] ?? '',
      posterUrl: 'https://image.tmdb.org/t/p/w500${json['poster_path']}',
      rating: (json['vote_average'] as num?)?.toDouble() ?? 0.0,
      overview: json['overview'] ?? '',
    );
  }
}
