import os
import requests

BASE_URL = os.environ.get('PREENROLLMENT_API_BASE', 'http://localhost:4000')


def test_get_courses_list():
    """TC-2.1: View available units"""
    response = requests.get(f'{BASE_URL}/api/courses', timeout=5)
    assert response.status_code == 200
    data = response.json()
    assert 'courses' in data
    courses = data['courses']
    assert len(courses) > 0
    # Each course should have required fields
    for course in courses:
        assert 'id' in course
        assert 'name' in course
        assert 'dayOfWeek' in course
        assert 'timeSlot' in course


def test_get_all_preferences():
    """TC-2.2: View student preferences/enrolments"""
    response = requests.get(f'{BASE_URL}/api/preferences/all', timeout=5)
    assert response.status_code == 200
    # Should return a list or object
    data = response.json()
    assert data is not None


def test_submit_preference():
    """TC-2.2: Submit preference (enrol in a unit)"""
    response = requests.post(
        f'{BASE_URL}/api/preferences',
        json={
            'studentEmail': 'student@cihe.edu',
            'courseId': 'ICT101',
            'timePreference': '8:15-11:15',
            'dayPreference': 'Monday'
        },
        timeout=5
    )
    # Should succeed or return appropriate status
    assert response.status_code in [200, 201, 400, 409]
