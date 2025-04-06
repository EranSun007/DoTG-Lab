export function measurePerformance(fn, iterations = 1000) {
    const startTime = performance.now();
    
    for (let i = 0; i < iterations; i++) {
        fn();
    }
    
    const endTime = performance.now();
    return endTime - startTime;
}

export function assertPerformance(fn, maxDuration, iterations = 1000) {
    const duration = measurePerformance(fn, iterations);
    expect(duration).toBeLessThan(maxDuration);
} 