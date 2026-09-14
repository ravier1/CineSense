import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:cinesense/main.dart';

void main() {
  testWidgets('CineSense app renders', (tester) async {
    await tester.pumpWidget(
      const ProviderScope(
        child: CineSenseApp(),
      ),
    );

    expect(find.byType(CineSenseApp), findsOneWidget);
  });
}