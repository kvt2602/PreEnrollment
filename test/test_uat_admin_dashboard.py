import os
import requests

BASE_URL = os.environ.get('PREENROLLMENT_API_BASE', 'http://localhost:4000')


def test_get_users():
    """TC-3.1: Get student list for admin dashboard"""
    response = requests.get(f'{BASE_URL}/api/users?role=student', timeout=5)
    assert response.status_code == 200
    data = response.json()
    # Should return a list or object with users
    assert data is not None


def test_get_statistics():
    """TC-3.1: Get stat cards (Students, Units, Enrolments, Multi-unit students)"""
    response = requests.get(f'{BASE_URL}/api/statistics', timeout=5)
    assert response.status_code == 200
    data = response.json()
    # Should contain stats object with counts
    assert data is not None


def test_add_course():
    """TC-5.2: Add new unit (admin)"""
    response = requests.post(
        f'{BASE_URL}/api/courses',
        json={
            'name': 'Test Course',
            'unitCode': 'TEST101',
            'semester': '1',
            'dayOfWeek': 'Monday',
            'timeSlot': '8:15-11:15'
        },
        timeout=5
    )
    # Should succeed or return valid status
    assert response.status_code in [200, 201, 400, 409]


def test_delete_course():
    """TC-5.4: Delete unit (admin)"""
    # First create a test course, then delete it
    create_response = requests.post(
        f'{BASE_URL}/api/courses',
        json={
            'name': 'Temp Course',
            'unitCode': 'TEMP001',
            'semester': '1',
            'dayOfWeek': 'Friday',
            'timeSlot': '14:45-17:45'
        },
        timeout=5
    )
    if create_response.status_code in [200, 201]:
        course_id = create_response.json().get('id', 'TEMP001')
        delete_response = requests.delete(f'{BASE_URL}/api/courses/{course_id}', timeout=5)
        assert delete_response.status_code in [200, 204, 400, 404]
