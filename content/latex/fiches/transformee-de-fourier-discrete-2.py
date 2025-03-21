# Renvoie les indices impairs d'une liste.
def odd_indices(l):
  return [l[2*k+1] for k in range(len(l)//2)]

# Fusionne deux listes de longueur égale en alternant les termes.
def alternate_merge(l1, l2):
  return [val for pair in zip(l1, l2) for val in pair]

# Calcule et renvoie les puissances successives de la racine primitive n-ième omega.
def primitive_root_powers(omega, n):
  return [power(omega, k) for k in range(n)]

# Cette fonction renvoie la transformée de Fourier discrète de F en omega. La liste l demandée est la liste des puissances de omega.
def fft(F, m, l):
  n = m + 1
  if n == 1:
    return [0] if F == 0 else [F.list()[0]]
  (F1, F0) = F.quo_rem(X^(n/2))
  R0 = F0+F1
  R1 = F0-F1
  l2 = odd_indices(l)
  return alternate_merge(fft(R0, n/2-1, l2), fft(R1.substitute(X=l[1]*X), n/2-1, l2))
