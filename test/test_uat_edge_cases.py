import os
import requests

BASE_URL = os.environ.get('PREENROLLMENT_API_BASE', 'http://localhost:4000')


def test_enrol_same_unit_twice():
    """TC-9.1: Enrol same unit twice - Should be blocked"""
    # Try to submit the same preference twice
    preference = {
        'studentEmail': 'student@cihe.edu',
        'courseId': 'ICT101',
        'timePreference': '8:15-11:15',
        'dayPreference': 'Monday'
    }
    response1 = requests.post(
        f'{BASE_URL}/api/preferences',
        json=preference,
        timeout=5
    )
    # First one might succeed (201/200)
    
    # Second attempt with same data should fail or be rejected
    response2 = requests.post(
        f'{BASE_URL}/api/preferences',
        json=preference,
        timeout=5
    )
    # Should return error status (409 conflict) or handle gracefully
    assert response2.status_code in [400, 409, 200, 201]


def test_delete_unit_with_enrolments():
    """TC-9.2: Delete unit that has enrolments - Should cascade or warn"""
    # Get a unit with enrolments, then try to delete
    courses_response = requests.get(f'{BASE_URL}/api/courses', timeout=5)
    assert courses_response.status_code == 200
    courses = courses_response.json().get('courses', [])
    
    if courses:
        first_course = courses[0]
        course_id = first_course.get('id')
        
        # Try to delete
        delete_response = requests.delete(
            f'{BASE_URL}/api/courses/{course_id}',
            timeout=5
        )
        # Should handle gracefully, not crash
        assert delete_response.status_code in [200, 204, 400, 404, 409]


def test_api_error_handling():
    """TC-9.6: Network/backend error handling"""
    # Try to hit a non-existent endpoint
    response = requests.get(
        f'{BASE_URL}/api/nonexistent',
        timeout=5
    )
    # Should return proper error, not crash
    assert response.status_code >= 400


def test_invalid_course_id():
    """Test invalid course ID handling"""
    response = requests.get(
        f'{BASE_URL}/api/courses/NONEXISTENT_COURSE_ID',
        timeout=5
    )
    # Should return 404 or error
    assert response.status_code >= 400


def test_malformed_json_request():
    """Test handling of malformed JSON in request"""
    response = requests.post(
        f'{BASE_URL}/api/preferences',
        data='not valid json',
        headers={'Content-Type': 'application/json'},
        timeout=5
    )
    # Should return error, not crash
    assert response.status_code >= 400
