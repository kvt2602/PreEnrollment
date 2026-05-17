from pathlib import Path


def test_project_structure():
    root = Path(__file__).resolve().parent.parent
    assert (root / 'src').is_dir()
    assert (root / 'backend').is_dir()
    assert (root / '.github' / 'workflows').is_dir()
    assert (root / 'test').is_dir()
    assert (root / 'package.json').is_file()
