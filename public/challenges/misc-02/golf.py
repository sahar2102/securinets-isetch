f=lambda s:len(s)==25 and all(ord(c)^ord(s[i-1])==k[i]for i,c in enumerate(s) if i)
k=[0, 29, 26, 47, 9, 65, 69, 69, 65, 71, 6, 108, 43, 28, 91, 108, 111, 64, 67, 65, 70, 64, 68, 66, 15]
print(f(input()))
