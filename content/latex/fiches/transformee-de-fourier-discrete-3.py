# Multiplie deux polynômes de degré n.
def fast_polynomial_multiply(F, G, n, omega):
  l1 = primitive_root_powers(omega, n)
  l2 = primitive_root_powers(power(omega, n-1), n)
  prod = [fft(F, n-1, l1)[i] * fft(G, n-1, l1)[i] for i in range(n)]
  h = fft(sum(prod[k] * X^k for k in range(len(prod))), n-1, l2)
  return sum(1/n * h[k] * X^k for k in range(len(h)))
