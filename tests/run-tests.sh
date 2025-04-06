#!/bin/bash

# Run all tests
npm test

# Run performance tests separately
npm test -- --testNamePattern="Performance Tests"

# Run integration tests separately
npm test -- --testNamePattern="Integration Tests" 