Field	        | Value
Number        | 4242 4242 4242 4242
Expiry month  | any future month e.g. 12
Expiry year   | any future year, e.g. 2029
CVC	          | any 3 digits, e.g. 123
Postal code   | any, e.g. 1001

Card number	        | Result
4000 0036 0000 0016	| Requires 3D Secure authentication
4000 0000 0000 0101	| Incorrect CVC
4000 0000 0000 0341	| Address verification failure
4000 0000 0000 0119	| Card declined
4000 0027 0000 3155	| Insufficient funds
4000 0000 0000 9995	| Card expired
