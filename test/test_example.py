"""Simple pytest examples for the PreEnrollment repo.

Run with: python -m pytest -q
"""

def add(a, b):
    return a + b


def test_add_positive():
    assert add(2, 3) == 5


def test_add_negative_and_positive():
    assert add(-1, 1) == 0


def test_add_zero():
    assert add(0, 0) == 0
