class Review {
  final String id;
  final String userEmail;
  final double rating;
  final String content;
  final DateTime createdAt;

  Review({
    required this.id,
    required this.userEmail,
    required this.rating,
    required this.content,
    required this.createdAt,
  });

  factory Review.fromJson(Map<String, dynamic> json) {
    return Review(
      id: json['id'].toString(),
      userEmail: json['user_email'] ?? 'Anonymous',
      rating: (json['rating'] as num).toDouble(),
      content: json['content'],
      createdAt: DateTime.parse(json['created_at']),
    );
  }
}
