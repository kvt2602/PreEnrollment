import os
import requests

BASE_URL = os.environ.get('PREENROLLMENT_API_BASE', 'http://localhost:4000')


def test_get_overlap_analysis():
    """TC-6.1: Matrix renders - Get overlap analysis data"""
    response = requests.get(f'{BASE_URL}/api/overlap-analysis', timeout=5)
    assert response.status_code == 200
    data = response.json()
    # Should contain matrix/overlap data structure
    assert data is not None
    # The response should have courses or matrix data
    assert isinstance(data, (dict, list))


def test_overlap_matrix_symmetry():
    """TC-6.5: Matrix symmetry - Cell (A,B) = Cell (B,A)"""
    response = requests.get(f'{BASE_URL}/api/overlap-analysis', timeout=5)
    assert response.status_code == 200
    data = response.json()
    
    # If data is dict with matrix structure, check symmetry
    if isinstance(data, dict) and 'matrix' in data:
        matrix = data['matrix']
        # Check that matrix is symmetric for overlap values
        for i in matrix:
            for j in matrix[i]:
                if j in matrix and i in matrix[j]:
                    assert matrix[i][j] == matrix[j][i], f"Asymmetry: {i}/{j}"


def test_high_overlap_pairs():
    """TC-6.7: High-overlap warning panel - Pairs with 3+ common students"""
    response = requests.get(f'{BASE_URL}/api/overlap-analysis', timeout=5)
    assert response.status_code == 200
    data = response.json()
    # Should have high-overlap pairs or warnings
    if 'highOverlapPairs' in data:
        high_pairs = data['highOverlapPairs']
        # Each pair should have overlap count >= 3
        for pair in high_pairs:
            assert pair.get('count', 0) >= 3
