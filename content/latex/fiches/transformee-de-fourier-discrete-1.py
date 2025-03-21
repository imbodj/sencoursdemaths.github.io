# Exponentiation rapide. Calcul x^n.
def power(x, n):
    if n == 0:
        return 1
    if n == 1:
        return x
    if n % 2 == 0:
        return power(x*x, n//2)
    return x * power(x*x, (n-1)//2)

# Algorithme naïf pour calculer la transformée de Fourier rapide de f.
def naive_dft(f, omega):
    n = len(f)
    return [sum(f[k] * power(omega, i*k) for k in range(n)) for i in range(n)]