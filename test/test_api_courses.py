import os
import requests

BASE_URL = os.environ.get('PREENROLLMENT_API_BASE', 'http://localhost:4000')


def test_get_courses_returns_list():
    response = requests.get(f'{BASE_URL}/api/courses', timeout=5)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, dict)
    assert 'courses' in data
    assert isinstance(data['courses'], list)
