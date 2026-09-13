class User {
  final String email;
  final String? token;

  User({required this.email, this.token});

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      email: json['user']['email'],
      token: json['token'],
    );
  }
}
