import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'features/auth/presentation/login_screen.dart';
import 'features/auth/presentation/auth_state.dart';
import 'features/movies/presentation/home_screen.dart';

void main() {
  runApp(
    const ProviderScope(
      child: CineSenseApp(),
    ),
  );
}

class CineSenseApp extends ConsumerWidget {
  const CineSenseApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authStateProvider);

    return MaterialApp(
      title: 'CineSense',
      debugShowCheckedModeBanner: false,
      theme: ThemeData.dark().copyWith(
        scaffoldBackgroundColor: const Color(0xFF0A0510),
        primaryColor: const Color(0xFFFF1493),
      ),
      home: authState.when(
        data: (token) => token != null 
            ? const HomeScreen() 
            : const LoginScreen(),
        loading: () => const Scaffold(body: Center(child: CircularProgressIndicator())),
        error: (_, __) => const LoginScreen(),
      ),
    );
  }
}
