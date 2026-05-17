import os
import requests

BASE_URL = os.environ.get('PREENROLLMENT_API_BASE', 'http://localhost:4000')


def test_admin_login_valid():
    """TC-1.1: Admin login with valid credentials"""
    response = requests.post(
        f'{BASE_URL}/api/auth/login',
        json={'email': 'admin@cihe.edu', 'password': 'admin123'},
        timeout=5
    )
    assert response.status_code == 200
    data = response.json()
    user = data.get('user', {})
    assert user.get('role') == 'admin'
    assert 'email' in user


def test_student_login_valid():
    """TC-1.2: Student login with valid credentials"""
    response = requests.post(
        f'{BASE_URL}/api/auth/login',
        json={'email': 'student@cihe.edu', 'password': 'student123'},
        timeout=5
    )
    assert response.status_code == 200
    data = response.json()
    user = data.get('user', {})
    assert user.get('role') == 'student'
    assert user.get('email') == 'student@cihe.edu'


def test_invalid_login():
    """TC-1.3: Invalid login (wrong password)"""
    response = requests.post(
        f'{BASE_URL}/api/auth/login',
        json={'email': 'student@cihe.edu', 'password': 'wrongpassword'},
        timeout=5
    )
    assert response.status_code != 200
    # Should fail or return an error
