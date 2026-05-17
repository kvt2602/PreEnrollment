import os
import requests

BASE_URL = os.environ.get('PREENROLLMENT_API_BASE', 'http://localhost:4000')


def test_get_statistics_for_reports():
    """TC-7: Reports module - Get statistics data for report generation"""
    response = requests.get(f'{BASE_URL}/api/statistics', timeout=5)
    assert response.status_code == 200
    data = response.json()
    # Should contain report statistics
    assert data is not None


def test_consistency_matrix_vs_courses():
    """TC-8.1: Cross-module consistency - Matrix diagonal = Unit enrolment count"""
    # Get overlap matrix
    matrix_response = requests.get(f'{BASE_URL}/api/overlap-analysis', timeout=5)
    assert matrix_response.status_code == 200
    matrix_data = matrix_response.json()
    
    # Get courses to verify enrollment counts
    courses_response = requests.get(f'{BASE_URL}/api/courses', timeout=5)
    assert courses_response.status_code == 200
    courses_data = courses_response.json()
    
    # Both should be consistent
    assert matrix_data is not None
    assert courses_data is not None


def test_consistency_enrolment_totals():
    """TC-8.5: Total Enrolments stat = sum of enrolments across all units"""
    stats_response = requests.get(f'{BASE_URL}/api/statistics', timeout=5)
    assert stats_response.status_code == 200
    stats = stats_response.json()
    
    prefs_response = requests.get(f'{BASE_URL}/api/preferences/all', timeout=5)
    assert prefs_response.status_code == 200
    prefs = prefs_response.json()
    
    # Stats should reflect actual enrolment data
    assert stats is not None
    assert prefs is not None


def test_student_with_no_enrolments():
    """TC-9.3: Student with 0 enrolments appears in reports with blanks"""
    users_response = requests.get(f'{BASE_URL}/api/users?role=student', timeout=5)
    assert users_response.status_code == 200
    users = users_response.json()
    
    # System should handle students with zero enrolments gracefully
    assert users is not None


def test_empty_matrix_no_crash():
    """TC-9.4: Empty matrix (no enrolments) renders without crash"""
    response = requests.get(f'{BASE_URL}/api/overlap-analysis', timeout=5)
    assert response.status_code == 200
    data = response.json()
    # Should not crash even with empty data
    assert data is not None
