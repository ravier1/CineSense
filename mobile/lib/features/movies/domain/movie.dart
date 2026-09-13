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
      title: json['title'] ?? json['name'] ?? '',
      posterUrl: json['poster_path'] != null 
          ? 'https://image.tmdb.org/t/p/w500${json['poster_path']}'
          : 'https://images.unsplash.com/photo-1594908900066-3f47337549d8?w=500&auto=format&fit=crop&q=60',
      rating: (json['vote_average'] as num?)?.toDouble() ?? 0.0,
      overview: json['overview'] ?? '',
    );
  }
}
