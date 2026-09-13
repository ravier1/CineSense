import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'core/theme/app_theme.dart';
import 'features/movies/presentation/home_screen.dart';

void main() {
  runApp(
    const ProviderScope(
      child: CineSenseApp(),
    ),
  );
}

class CineSenseApp extends StatelessWidget {
  const CineSenseApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'CineSense',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.darkTheme,
      home: const HomeScreen(),
    );
  }
}
