import math

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

print(karatsuba(48,20))  # 69345