// ── static content----

const CONTENT = {

  karatsuba: {
    name: "Karatsuba Multiplication",
    dot: "#F2A7BB",
    info: "Multiply large numbers using 3 recursive calls instead of 4.",
    complexityTags: ["T(n) = 3T(n/2) + O(n)", "O(n^1.585)"],

    history: {
      title: "The Story Behind Karatsuba Multiplication",
      body: `
        <p>In 1960, the great Soviet mathematician Andrei Kolmogorov confidently declared that multiplying two n-digit numbers required at least O(n²) operations — he believed this was an unavoidable lower bound. He even organised a seminar at Moscow State University to formalise this idea.</p>
        <p>Then a 23-year-old student named Anatoly Karatsuba attended that seminar. Within a week, he shattered Kolmogorov's conjecture. His key insight was electrifying: instead of computing four products to multiply two 2-digit numbers (ac, ad, bc, bd), you only need three. The fourth comes for free through a clever algebraic rearrangement.</p>
        <p>Specifically, if you want z0 = b×d and z2 = a×c, you can get z1 = a×d + b×c by computing (a+b)×(c+d) − z0 − z2. This simple trick, repeated recursively, changes everything. The recurrence T(n) = 3T(n/2) + O(n) resolves to O(n^1.585) — a genuine breakthrough.</p>
        <p>Kolmogorov was so impressed that he published Karatsuba's result in 1962, against Karatsuba's wishes — he wanted more time to polish the paper. It became one of the earliest examples of divide and conquer beating a seemingly optimal classical algorithm, and opened the door to a whole field of fast arithmetic.</p>
      `,
      quote: "Within one week after Kolmogorov's seminar, I found the algorithm now named after me. — Anatoly Karatsuba"
    },

    pseudo: `KARATSUBA(x, y):
  // Base case: single digit multiplication
  if x < 10 or y < 10:
    return x * y

  // Split at midpoint m = floor(n/2)
  n  ← max(digits(x), digits(y))
  m  ← floor(n / 2)

  // Split x = a·10^m + b
  a  ← floor(x / 10^m)
  b  ← x mod 10^m

  // Split y = c·10^m + d
  c  ← floor(y / 10^m)
  d  ← y mod 10^m

  // Three recursive multiplications (not four!)
  z0 ← KARATSUBA(b, d)          // b × d
  z2 ← KARATSUBA(a, c)          // a × c
  z1 ← KARATSUBA(a+b, c+d)     // (a+b)(c+d)
       − z2 − z0                // subtract to isolate ad+bc

  // Combine results
  return z2·10^(2m) + z1·10^m + z0`,

    pseudoLines: [
      "KARATSUBA(x, y):",
      "  if x < 10 or y < 10:",
      "    return x * y",
      "  n ← max(digits(x), digits(y))",
      "  m ← floor(n / 2)",
      "  a ← floor(x / 10^m); b ← x mod 10^m",
      "  c ← floor(y / 10^m); d ← y mod 10^m",
      "  z0 ← KARATSUBA(b, d)",
      "  z2 ← KARATSUBA(a, c)",
      "  z1 ← KARATSUBA(a+b, c+d) − z2 − z0",
      "  return z2·10^(2m) + z1·10^m + z0"
    ],

    code: {
      c: `#include <stdio.h>
#include <math.h>

/* Count digits in a number */
int numDigits(long long n) {
    if (n == 0) return 1;
    int d = 0;
    while (n > 0) { d++; n /= 10; }
    return d;
}

/* Karatsuba multiplication */
long long karatsuba(long long x, long long y) {
    /* Base case */
    if (x < 10 || y < 10)
        return x * y;

    int n = fmax(numDigits(x), numDigits(y));
    int m = n / 2;
    long long p = (long long)pow(10, m);

    /* Split x = a*10^m + b */
    long long a = x / p, b = x % p;
    /* Split y = c*10^m + d */
    long long c = y / p, d = y % p;

    /* Three recursive calls */
    long long z0 = karatsuba(b, d);
    long long z2 = karatsuba(a, c);
    long long z1 = karatsuba(a+b, c+d) - z2 - z0;

    return z2*(long long)pow(10,2*m) + z1*p + z0;
}

int main() {
    printf("%lld\\n", karatsuba(201, 345)); /* 69345 */
    return 0;
}`,

      cpp: `#include <iostream>
#include <cmath>
using namespace std;

int numDigits(long long n) {
    if (n == 0) return 1;
    int d = 0;
    while (n > 0) { d++; n /= 10; }
    return d;
}

long long karatsuba(long long x, long long y) {
    if (x < 10 || y < 10) return x * y;

    int n = max(numDigits(x), numDigits(y));
    int m = n / 2;
    long long p = (long long)pow(10, m);

    long long a = x / p, b = x % p;
    long long c = y / p, d = y % p;

    long long z0 = karatsuba(b, d);
    long long z2 = karatsuba(a, c);
    long long z1 = karatsuba(a+b, c+d) - z2 - z0;

    return z2*(long long)pow(10,2*m) + z1*p + z0;
}

int main() {
    cout << karatsuba(201, 345) << endl; // 69345
    return 0;
}`,

      python: `import math

def karatsuba(x, y):
    # Base case: single digit
    if x < 10 or y < 10:
        return x * y

    n = max(len(str(x)), len(str(y)))
    m = n // 2

    # Split: x = a*10^m + b
    p  = 10 ** m
    a, b = x // p, x % p
    c, d = y // p, y % p

    # Three recursive calls
    z0 = karatsuba(b, d)
    z2 = karatsuba(a, c)
    z1 = karatsuba(a + b, c + d) - z2 - z0

    return z2 * (10 ** (2*m)) + z1 * p + z0

print(karatsuba(201, 345))  # 69345`,

      java: `public class Karatsuba {

    static int numDigits(long n) {
        if (n == 0) return 1;
        int d = 0;
        while (n > 0) { d++; n /= 10; }
        return d;
    }

    static long karatsuba(long x, long y) {
        // Base case
        if (x < 10 || y < 10) return x * y;

        int n = Math.max(numDigits(x), numDigits(y));
        int m = n / 2;
        long p = (long)Math.pow(10, m);

        long a = x / p, b = x % p;
        long c = y / p, d = y % p;

        long z0 = karatsuba(b, d);
        long z2 = karatsuba(a, c);
        long z1 = karatsuba(a+b, c+d) - z2 - z0;

        return z2*(long)Math.pow(10,2*m) + z1*p + z0;
    }

    public static void main(String[] args) {
        System.out.println(karatsuba(201, 345)); // 69345
    }
}`
    },

    complexity: `
      <h3>The Classical Problem</h3>
      <p>To multiply two n-digit numbers the classical way (long multiplication), you need <strong>n²</strong> single-digit multiplications. For large numbers — like in cryptography where numbers have thousands of digits — this is far too slow.</p>

      <h3>Karatsuba's Key Insight</h3>
      <p>Split x = a·10^m + b and y = c·10^m + d. The naive approach needs four multiplications: ac, ad, bc, bd. Karatsuba observed that ad + bc = (a+b)(c+d) − ac − bd, reducing four multiplications to three.</p>

      <div class="recurrence-block">T(n) = 3T(n/2) + O(n)</div>

      <h3>Applying the Master Theorem</h3>
      <p>With a=3, b=2, f(n)=O(n): we compare n^(log₂3) ≈ n^1.585 with n^1. Since 1.585 > 1, we're in Case 1 of the Master Theorem.</p>
      <div class="recurrence-block">T(n) = O(n^log₂3) ≈ O(n^1.585)</div>

      <h3>Complexity Comparison</h3>
      <table class="complexity-table">
        <tr><th>Algorithm</th><th>Multiplications</th><th>Complexity</th></tr>
        <tr><td>Classical (long multiplication)</td><td>4 per level</td><td>O(n²)</td></tr>
        <tr><td>Karatsuba</td><td>3 per level</td><td>O(n^1.585)</td></tr>
        <tr><td>Schönhage–Strassen (advanced)</td><td>FFT-based</td><td>O(n log n log log n)</td></tr>
      </table>

      <p>For 1000-digit numbers, Karatsuba is roughly <strong>1000^(2−1.585) ≈ 7 times faster</strong> than classical multiplication. The savings compound dramatically at scale.</p>
    `
  },

  // ── MAX SUBARRAY ──────────────────────────────────────────────────────────
  maxsubarray: {
    name: "Maximum Subarray Problem",
    dot: "#A8E6CF",
    info: "Find the contiguous subarray with the largest sum using divide and conquer.",
    complexityTags: ["T(n) = 2T(n/2) + O(n)", "O(n log n)"],

    history: {
      title: "The Story Behind Maximum Subarray",
      body: `
        <p>The Maximum Subarray Problem was first proposed by Ulf Grenander in 1977 as a simplified model for maximum likelihood estimation in two-dimensional pattern recognition. The question was deceptively simple: given an array of numbers, find the contiguous subarray with the largest sum.</p>
        <p>Grenander's original algorithm ran in O(n³). Within a year, Michael Shamos reduced this to O(n²). The breakthrough came when Shamos shared the problem with his colleague Jay Kadane at a seminar — Kadane solved it in O(n) in a matter of minutes, producing what we now call Kadane's Algorithm.</p>
        <p>The divide and conquer approach, while not the fastest solution at O(n log n), is taught universally in algorithm courses because it perfectly illustrates the paradigm: split the array in half, solve each half recursively, then handle the case where the maximum subarray crosses the midpoint.</p>
        <p>This crossing case is the elegant heart of the divide and conquer approach — it can be solved in O(n) by simply extending outward from the midpoint in both directions.</p>
      `,
      quote: "Kadane solved in minutes what took others months. Sometimes the right perspective is everything."
    },

    pseudo: `MAX_SUBARRAY(arr, low, high):
  // Base case: single element
  if low == high:
    return (low, high, arr[low])

  mid ← floor((low + high) / 2)

  // Recursively solve left half
  (l_low, l_high, l_sum) ← MAX_SUBARRAY(arr, low, mid)

  // Recursively solve right half
  (r_low, r_high, r_sum) ← MAX_SUBARRAY(arr, mid+1, high)

  // Solve crossing case in O(n)
  (c_low, c_high, c_sum) ← MAX_CROSSING(arr, low, mid, high)

  // Return the best of the three
  if l_sum >= r_sum and l_sum >= c_sum:
    return (l_low, l_high, l_sum)
  elif r_sum >= l_sum and r_sum >= c_sum:
    return (r_low, r_high, r_sum)
  else:
    return (c_low, c_high, c_sum)

MAX_CROSSING(arr, low, mid, high):
  // Extend left from mid
  left_sum ← -∞; sum ← 0
  for i from mid downto low:
    sum ← sum + arr[i]
    if sum > left_sum: left_sum ← sum; max_left ← i

  // Extend right from mid+1
  right_sum ← -∞; sum ← 0
  for j from mid+1 to high:
    sum ← sum + arr[j]
    if sum > right_sum: right_sum ← sum; max_right ← j

  return (max_left, max_right, left_sum + right_sum)`,

    pseudoLines: [
      "MAX_SUBARRAY(arr, low, high):",
      "  if low == high: return (low, high, arr[low])",
      "  mid ← floor((low + high) / 2)",
      "  left ← MAX_SUBARRAY(arr, low, mid)",
      "  right ← MAX_SUBARRAY(arr, mid+1, high)",
      "  cross ← MAX_CROSSING(arr, low, mid, high)",
      "  return max(left, right, cross)"
    ],

    code: {
      python: `def max_crossing(arr, low, mid, high):
    left_sum = float('-inf')
    s = 0
    max_left = mid
    for i in range(mid, low - 1, -1):
        s += arr[i]
        if s > left_sum:
            left_sum = s
            max_left = i

    right_sum = float('-inf')
    s = 0
    max_right = mid + 1
    for j in range(mid + 1, high + 1):
        s += arr[j]
        if s > right_sum:
            right_sum = s
            max_right = j

    return (max_left, max_right, left_sum + right_sum)

def max_subarray(arr, low, high):
    if low == high:
        return (low, high, arr[low])

    mid = (low + high) // 2
    l = max_subarray(arr, low, mid)
    r = max_subarray(arr, mid + 1, high)
    c = max_crossing(arr, low, mid, high)

    return max(l, r, c, key=lambda x: x[2])

arr = [-2, 1, -3, 4, -1, 2, 1, -5, 4]
lo, hi, total = max_subarray(arr, 0, len(arr)-1)
print(f"Max subarray: {arr[lo:hi+1]}, sum = {total}")`,
      c: `#include <stdio.h>
#include <limits.h>

typedef struct { int low, high, sum; } Result;

Result maxCrossing(int* a, int low, int mid, int high) {
    int lsum = INT_MIN, s = 0, ml = mid;
    for (int i = mid; i >= low; i--) {
        s += a[i];
        if (s > lsum) { lsum = s; ml = i; }
    }
    int rsum = INT_MIN; s = 0;
    int mr = mid + 1;
    for (int j = mid+1; j <= high; j++) {
        s += a[j];
        if (s > rsum) { rsum = s; mr = j; }
    }
    return (Result){ml, mr, lsum + rsum};
}

Result maxSubarray(int* a, int low, int high) {
    if (low == high) return (Result){low, high, a[low]};
    int mid = (low + high) / 2;
    Result l = maxSubarray(a, low, mid);
    Result r = maxSubarray(a, mid+1, high);
    Result c = maxCrossing(a, low, mid, high);
    if (l.sum >= r.sum && l.sum >= c.sum) return l;
    if (r.sum >= l.sum && r.sum >= c.sum) return r;
    return c;
}

int main() {
    int a[] = {-2,1,-3,4,-1};
    Result res = maxSubarray(a, 0, 8);
    printf("[%d..%d] sum=%d\\n", res.low, res.high, res.sum);
}`,
      cpp: `#include <iostream>
#include <climits>
using namespace std;

struct Result { int low, high, sum; };

Result maxCrossing(int* a, int low, int mid, int high) {
    int lsum = INT_MIN, s = 0, ml = mid;
    for (int i = mid; i >= low; i--) {
        s += a[i];
        if (s > lsum) { lsum = s; ml = i; }
    }
    int rsum = INT_MIN; s = 0, mr = mid+1;
    for (int j = mid+1; j <= high; j++) {
        s += a[j];
        if (s > rsum) { rsum = s; mr = j; }
    }
    return {ml, mr, lsum + rsum};
}

Result maxSubarray(int* a, int low, int high) {
    if (low == high) return {low, high, a[low]};
    int mid = (low + high) / 2;
    auto l = maxSubarray(a, low, mid);
    auto r = maxSubarray(a, mid+1, high);
    auto c = maxCrossing(a, low, mid, high);
    if (l.sum >= r.sum && l.sum >= c.sum) return l;
    if (r.sum >= l.sum && r.sum >= c.sum) return r;
    return c;
}`,
      java: `public class MaxSubarray {
    static int[] maxCrossing(int[] a, int low, int mid, int high) {
        int lsum = Integer.MIN_VALUE, s = 0, ml = mid;
        for (int i = mid; i >= low; i--) {
            s += a[i];
            if (s > lsum) { lsum = s; ml = i; }
        }
        int rsum = Integer.MIN_VALUE; s = 0;
        int mr = mid + 1;
        for (int j = mid+1; j <= high; j++) {
            s += a[j];
            if (s > rsum) { rsum = s; mr = j; }
        }
        return new int[]{ml, mr, lsum + rsum};
    }

    static int[] maxSubarray(int[] a, int low, int high) {
        if (low == high) return new int[]{low, high, a[low]};
        int mid = (low + high) / 2;
        int[] l = maxSubarray(a, low, mid);
        int[] r = maxSubarray(a, mid+1, high);
        int[] c = maxCrossing(a, low, mid, high);
        if (l[2]>=r[2] && l[2]>=c[2]) return l;
        if (r[2]>=l[2] && r[2]>=c[2]) return r;
        return c;
    }
}`
    },

    complexity: `
      <h3>The Problem</h3>
      <p>Given an array of integers (which may be negative), find the contiguous subarray with the maximum sum. For example, in [-2, 1, -3, <strong>4, -1, 2, 1</strong>, -5, 4], the answer is [4, -1, 2, 1] with sum 6.</p>

      <h3>Divide and Conquer Approach</h3>
      <p>Split the array at the midpoint. The maximum subarray must lie entirely in the left half, entirely in the right half, or cross the midpoint. The crossing case takes O(n) time.</p>
      <div class="recurrence-block">T(n) = 2T(n/2) + O(n)</div>

      <h3>Master Theorem</h3>
      <p>With a=2, b=2, f(n)=O(n): n^(log₂2) = n^1 = n. Since f(n) = O(n) = O(n^log_b a), we are in Case 2.</p>
      <div class="recurrence-block">T(n) = O(n log n)</div>

      <h3>Algorithm Comparison</h3>
      <table class="complexity-table">
        <tr><th>Approach</th><th>Complexity</th><th>Notes</th></tr>
        <tr><td>Brute Force</td><td>O(n²)</td><td>Check all subarrays</td></tr>
        <tr><td>Divide & Conquer</td><td>O(n log n)</td><td>This implementation</td></tr>
        <tr><td>Kadane's Algorithm</td><td>O(n)</td><td>Optimal DP solution</td></tr>
      </table>
    `
  },

  // ── STRASSEN ──────────────────────────────────────────────────────────────
  strassen: {
    name: "Strassen's Matrix Multiplication",
    dot: "#A7C7E7",
    info: "Multiply 2×2 matrices using 7 multiplications instead of 8.",
    complexityTags: ["T(n) = 7T(n/2) + O(n²)", "O(n^2.807)"],

    history: {
      title: "The Story Behind Strassen's Algorithm",
      body: `
        <p>For decades, the standard algorithm for multiplying two n×n matrices required O(n³) operations — each of the n² entries in the result needs n multiplications. In 1969, Volker Strassen published a surprising result: you can multiply two 2×2 matrices using only 7 scalar multiplications instead of the obvious 8.</p>
        <p>The key insight was the same as Karatsuba's: define intermediate products cleverly so that additions can replace multiplications. Strassen defined 7 products (M1 through M7) involving sums of matrix entries, then showed how to combine them to recover all four entries of the result matrix.</p>
        <p>Applied recursively to larger matrices by dividing them into 2×2 blocks, this gives a recurrence T(n) = 7T(n/2) + O(n²), which resolves to O(n^log₂7) ≈ O(n^2.807) — beating the classical O(n³) for large n.</p>
        <p>Strassen's algorithm opened the question of the true complexity of matrix multiplication, which remains open today. The current best known bound is O(n^2.371), but Strassen's 1969 result was the first to break the cubic barrier.</p>
      `,
      quote: "Breaking the cubic barrier seemed impossible — until Strassen showed 7 multiplications were enough."
    },

    pseudo: `STRASSEN(A, B):
  // Base case: 1×1 matrix
  if size == 1:
    return [[A[0][0] * B[0][0]]]

  // Partition into 2×2 block matrices
  A11, A12, A21, A22 ← partition(A)
  B11, B12, B21, B22 ← partition(B)

  // 7 recursive multiplications (Strassen's products)
  M1 ← STRASSEN(A11+A22, B11+B22)
  M2 ← STRASSEN(A21+A22, B11)
  M3 ← STRASSEN(A11, B12−B22)
  M4 ← STRASSEN(A22, B21−B11)
  M5 ← STRASSEN(A11+A12, B22)
  M6 ← STRASSEN(A21−A11, B11+B12)
  M7 ← STRASSEN(A12−A22, B21+B22)

  // Combine to get result quadrants
  C11 ← M1 + M4 − M5 + M7
  C12 ← M3 + M5
  C21 ← M2 + M4
  C22 ← M1 − M2 + M3 + M6

  return assemble(C11, C12, C21, C22)`,

    pseudoLines: [
      "STRASSEN(A, B):",
      "  if size == 1: return A[0][0] * B[0][0]",
      "  Partition A, B into 2×2 blocks",
      "  M1 ← STRASSEN(A11+A22, B11+B22)",
      "  M2 ← STRASSEN(A21+A22, B11)",
      "  M3 ← STRASSEN(A11, B12−B22)",
      "  M4 ← STRASSEN(A22, B21−B11)",
      "  M5 ← STRASSEN(A11+A12, B22)",
      "  M6 ← STRASSEN(A21−A11, B11+B12)",
      "  M7 ← STRASSEN(A12−A22, B21+B22)",
      "  Combine M1..M7 into C11, C12, C21, C22"
    ],

    code: {
      python: `def add(A, B):
    return [[A[i][j]+B[i][j] for j in range(len(A))] for i in range(len(A))]

def sub(A, B):
    return [[A[i][j]-B[i][j] for j in range(len(A))] for i in range(len(A))]

def strassen(A, B):
    n = len(A)
    if n == 1:
        return [[A[0][0] * B[0][0]]]

    mid = n // 2
    # Split
    A11 = [r[:mid] for r in A[:mid]]; A12 = [r[mid:] for r in A[:mid]]
    A21 = [r[:mid] for r in A[mid:]]; A22 = [r[mid:] for r in A[mid:]]
    B11 = [r[:mid] for r in B[:mid]]; B12 = [r[mid:] for r in B[:mid]]
    B21 = [r[:mid] for r in B[mid:]]; B22 = [r[mid:] for r in B[mid:]]

    # 7 products
    M1 = strassen(add(A11,A22), add(B11,B22))
    M2 = strassen(add(A21,A22), B11)
    M3 = strassen(A11, sub(B12,B22))
    M4 = strassen(A22, sub(B21,B11))
    M5 = strassen(add(A11,A12), B22)
    M6 = strassen(sub(A21,A11), add(B11,B12))
    M7 = strassen(sub(A12,A22), add(B21,B22))

    C11 = add(sub(add(M1,M4),M5),M7)
    C12 = add(M3,M5)
    C21 = add(M2,M4)
    C22 = add(sub(add(M1,M3),M2),M6)

    top = [C11[i]+C12[i] for i in range(mid)]
    bot = [C21[i]+C22[i] for i in range(mid)]
    return top + bot`,
      c: `/* Strassen for 2x2 matrices for clarity */
void strassen2x2(int A[2][2], int B[2][2], int C[2][2]) {
    int m1 = (A[0][0]+A[1][1]) * (B[0][0]+B[1][1]);
    int m2 = (A[1][0]+A[1][1]) * B[0][0];
    int m3 = A[0][0] * (B[0][1]-B[1][1]);
    int m4 = A[1][1] * (B[1][0]-B[0][0]);
    int m5 = (A[0][0]+A[0][1]) * B[1][1];
    int m6 = (A[1][0]-A[0][0]) * (B[0][0]+B[0][1]);
    int m7 = (A[0][1]-A[1][1]) * (B[1][0]+B[1][1]);
    C[0][0] = m1+m4-m5+m7;
    C[0][1] = m3+m5;
    C[1][0] = m2+m4;
    C[1][1] = m1-m2+m3+m6;
}`,
      cpp: `// Strassen 2x2 demonstration
void strassen(int A[2][2], int B[2][2], int C[2][2]) {
    int m1=(A[0][0]+A[1][1])*(B[0][0]+B[1][1]);
    int m2=(A[1][0]+A[1][1])*B[0][0];
    int m3=A[0][0]*(B[0][1]-B[1][1]);
    int m4=A[1][1]*(B[1][0]-B[0][0]);
    int m5=(A[0][0]+A[0][1])*B[1][1];
    int m6=(A[1][0]-A[0][0])*(B[0][0]+B[0][1]);
    int m7=(A[0][1]-A[1][1])*(B[1][0]+B[1][1]);
    C[0][0]=m1+m4-m5+m7; C[0][1]=m3+m5;
    C[1][0]=m2+m4;        C[1][1]=m1-m2+m3+m6;
}`,
      java: `public class Strassen {
    static int[][] strassen2x2(int[][] A, int[][] B) {
        int m1=(A[0][0]+A[1][1])*(B[0][0]+B[1][1]);
        int m2=(A[1][0]+A[1][1])*B[0][0];
        int m3=A[0][0]*(B[0][1]-B[1][1]);
        int m4=A[1][1]*(B[1][0]-B[0][0]);
        int m5=(A[0][0]+A[0][1])*B[1][1];
        int m6=(A[1][0]-A[0][0])*(B[0][0]+B[0][1]);
        int m7=(A[0][1]-A[1][1])*(B[1][0]+B[1][1]);
        return new int[][]{{m1+m4-m5+m7,m3+m5},{m2+m4,m1-m2+m3+m6}};
    }
}`
    },

    complexity: `
      <h3>The Classical Problem</h3>
      <p>Multiplying two n×n matrices naively requires O(n³) operations — for each of the n² output entries, you compute a dot product of length n. For large matrices used in machine learning and scientific computing, this is prohibitively expensive.</p>

      <h3>Strassen's Trick</h3>
      <p>For 2×2 matrices, the naive approach needs 8 multiplications. Strassen defined 7 cleverly combined products M1–M7 that allow reconstruction of all four output entries, saving one multiplication per recursive level.</p>
      <div class="recurrence-block">T(n) = 7T(n/2) + O(n²)</div>

      <h3>Master Theorem</h3>
      <p>With a=7, b=2, f(n)=O(n²): n^(log₂7) ≈ n^2.807 > n^2. We are in Case 1.</p>
      <div class="recurrence-block">T(n) = O(n^log₂7) ≈ O(n^2.807)</div>

      <table class="complexity-table">
        <tr><th>Algorithm</th><th>Multiplications</th><th>Complexity</th></tr>
        <tr><td>Classical</td><td>8 per 2×2 block</td><td>O(n³)</td></tr>
        <tr><td>Strassen</td><td>7 per 2×2 block</td><td>O(n^2.807)</td></tr>
        <tr><td>Best known (2023)</td><td>—</td><td>O(n^2.371)</td></tr>
      </table>
    `
  },

  // ── CLOSEST PAIR ─────────────────────────────────────────────────────────
  closestpair: {
    name: "Closest Pair of Points",
    dot: "#C9B8E8",
    info: "Find the two closest points in a plane in O(n log n) time.",
    complexityTags: ["T(n) = 2T(n/2) + O(n log n)", "O(n log n)"],

    history: {
      title: "The Story Behind Closest Pair of Points",
      body: `
        <p>The Closest Pair of Points problem asks: given n points in a 2D plane, find the pair with the smallest Euclidean distance. The naive approach checks all n(n-1)/2 pairs in O(n²) time.</p>
        <p>In 1975, Michael Shamos and Dan Hoey published a divide and conquer algorithm achieving O(n log n) — a significant improvement. The algorithm splits points by their x-coordinate, recursively finds the closest pair in each half, then cleverly checks pairs that might cross the dividing line.</p>
        <p>The key insight is that after finding δ = min(left_min, right_min), you only need to check points within a vertical strip of width 2δ around the dividing line. And within that strip, it can be proven that each point has at most 7 other points within distance δ to check — making the strip check O(n).</p>
        <p>This algorithm is a beautiful example of how geometric intuition can bound the work in the combine step, turning what seems like an O(n²) problem into O(n log n).</p>
      `,
      quote: "The strip contains at most 8 points per δ×2δ rectangle — a beautiful geometric bound."
    },

    pseudo: `CLOSEST_PAIR(points):
  // Sort by x-coordinate (done once at the start)
  Sort points by x-coordinate

  return CLOSEST_REC(points)

CLOSEST_REC(pts):
  // Base cases
  if |pts| <= 3:
    return BRUTE_FORCE(pts)

  mid ← |pts| / 2
  midPoint ← pts[mid]

  // Divide: split into left and right halves
  left  ← pts[0..mid]
  right ← pts[mid+1..]

  // Conquer: recurse on each half
  d_left  ← CLOSEST_REC(left)
  d_right ← CLOSEST_REC(right)
  δ ← min(d_left, d_right)

  // Combine: check strip of width 2δ
  strip ← points where |x − midPoint.x| < δ
  Sort strip by y-coordinate
  d_strip ← CHECK_STRIP(strip, δ)

  return min(δ, d_strip)

CHECK_STRIP(strip, δ):
  for each point p in strip:
    check next 7 points in strip
    update minimum if closer pair found`,

    pseudoLines: [
      "CLOSEST_PAIR(points):",
      "  Sort points by x-coordinate",
      "  return CLOSEST_REC(points)",
      "CLOSEST_REC(pts):",
      "  if |pts| <= 3: return BRUTE_FORCE(pts)",
      "  mid ← |pts| / 2",
      "  d_left ← CLOSEST_REC(left half)",
      "  d_right ← CLOSEST_REC(right half)",
      "  δ ← min(d_left, d_right)",
      "  strip ← points within δ of midline",
      "  return min(δ, CHECK_STRIP(strip, δ))"
    ],

    code: {
      python: `import math

def dist(p1, p2):
    return math.sqrt((p1[0]-p2[0])**2 + (p1[1]-p2[1])**2)

def brute_force(pts):
    min_d = float('inf')
    for i in range(len(pts)):
        for j in range(i+1, len(pts)):
            min_d = min(min_d, dist(pts[i], pts[j]))
    return min_d

def strip_closest(strip, d):
    strip.sort(key=lambda p: p[1])
    min_d = d
    for i in range(len(strip)):
        for j in range(i+1, min(i+8, len(strip))):
            if strip[j][1] - strip[i][1] >= min_d:
                break
            min_d = min(min_d, dist(strip[i], strip[j]))
    return min_d

def closest_rec(pts):
    n = len(pts)
    if n <= 3:
        return brute_force(pts)
    mid = n // 2
    mid_x = pts[mid][0]
    d = min(closest_rec(pts[:mid]), closest_rec(pts[mid:]))
    strip = [p for p in pts if abs(p[0] - mid_x) < d]
    return min(d, strip_closest(strip, d))

def closest_pair(points):
    pts = sorted(points, key=lambda p: p[0])
    return closest_rec(pts)`,
      c: `#include <math.h>
#include <float.h>

double dist(double x1,double y1,double x2,double y2){
    return sqrt((x1-x2)*(x1-x2)+(y1-y2)*(y1-y2));
}

double bruteForce(double px[],double py[],int n){
    double d=DBL_MAX;
    for(int i=0;i<n;i++)
        for(int j=i+1;j<n;j++)
            if(dist(px[i],py[i],px[j],py[j])<d)
                d=dist(px[i],py[i],px[j],py[j]);
    return d;
}`,
      cpp: `#include <algorithm>
#include <cmath>
#include <float.h>
using namespace std;

struct Point { double x, y; };

double dist(Point a, Point b){
    return sqrt((a.x-b.x)*(a.x-b.x)+(a.y-b.y)*(a.y-b.y));
}

double stripClosest(vector<Point>& s, double d){
    sort(s.begin(),s.end(),[](Point a,Point b){return a.y<b.y;});
    double mn=d;
    for(int i=0;i<s.size();i++)
        for(int j=i+1;j<s.size()&&s[j].y-s[i].y<mn;j++)
            mn=min(mn,dist(s[i],s[j]));
    return mn;
}`,
      java: `import java.util.*;

public class ClosestPair {
    static double dist(double[] a, double[] b){
        return Math.sqrt(Math.pow(a[0]-b[0],2)+Math.pow(a[1]-b[1],2));
    }
    static double bruteForce(double[][] pts, int n){
        double d=Double.MAX_VALUE;
        for(int i=0;i<n;i++)
            for(int j=i+1;j<n;j++)
                d=Math.min(d,dist(pts[i],pts[j]));
        return d;
    }
}`
    },

    complexity: `
      <h3>The Problem</h3>
      <p>Given n points in a 2D plane, find the pair with the minimum Euclidean distance. Applications include collision detection, clustering, and geographic proximity searches.</p>

      <h3>The Divide Step</h3>
      <p>Sort points by x-coordinate. Split at the median. Recursively find the closest pair in each half. Let δ = min of the two results.</p>

      <h3>The Combine Step</h3>
      <p>Only points within δ of the dividing line can beat δ. Within this strip, each point needs to be compared with at most 7 others (geometric proof). So the strip check is O(n).</p>

      <div class="recurrence-block">T(n) = 2T(n/2) + O(n log n)</div>
      <div class="recurrence-block">T(n) = O(n log² n) → with optimization: O(n log n)</div>

      <table class="complexity-table">
        <tr><th>Approach</th><th>Complexity</th></tr>
        <tr><td>Brute Force</td><td>O(n²)</td></tr>
        <tr><td>Divide & Conquer</td><td>O(n log n)</td></tr>
      </table>
    `
  }
};
