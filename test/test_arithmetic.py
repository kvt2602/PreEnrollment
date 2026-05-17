def multiply(a, b):
    return a * b


def test_multiply_positive_numbers():
    assert multiply(3, 4) == 12


def test_multiply_by_zero():
    assert multiply(7, 0) == 0


def test_multiply_negative_number():
    assert multiply(-2, 5) == -10
