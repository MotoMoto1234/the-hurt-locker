import hashlib
import json
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile

root = Path(__file__).resolve().parents[1]
manifest = json.loads((root / "module.json").read_text(encoding="utf-8"))
version = manifest["version"]
release = root / "dist" / f"v{version}"
release.mkdir(parents=True, exist_ok=True)
repo = "https://github.com/MotoMoto1234/the-hurt-locker"
assert manifest["manifest"] == f"{repo}/releases/latest/download/module.json"
assert manifest["download"] == f"{repo}/releases/download/v{version}/the-hurt-locker-v{version}.zip"
files = ["module.json", "README.md", "CHANGELOG.md", "scripts/main.mjs", "scripts/feed.mjs", "styles/hurt-locker.css"]
archive = release / f"the-hurt-locker-v{version}.zip"
with ZipFile(archive, "w", ZIP_DEFLATED) as zipped:
    for name in files:
        zipped.write(root / name, f"the-hurt-locker/{name}")
with ZipFile(archive) as zipped:
    assert zipped.testzip() is None
    assert set(zipped.namelist()) == {f"the-hurt-locker/{name}" for name in files}
    assert json.loads(zipped.read("the-hurt-locker/module.json")) == manifest
    for name in files:
        assert zipped.read(f"the-hurt-locker/{name}") == (root / name).read_bytes()
(release / "module.json").write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
digest = hashlib.sha256(archive.read_bytes()).hexdigest()
source_files = files + [".gitignore", "tools/build_release.py", "RELEASE-NOTES.md", "RELEASE-SETUP.md"]
source_archive = release / f"the-hurt-locker-source-v{version}.zip"
with ZipFile(source_archive, "w", ZIP_DEFLATED) as zipped:
    for name in source_files:
        zipped.write(root / name, name)
with ZipFile(source_archive) as zipped:
    assert zipped.testzip() is None
    assert set(zipped.namelist()) == set(source_files)
    for name in source_files:
        assert zipped.read(name) == (root / name).read_bytes()
for name in ["RELEASE-NOTES.md", "RELEASE-SETUP.md"]:
    (release / name).write_bytes((root / name).read_bytes())
checksums = "".join(f"{hashlib.sha256(item.read_bytes()).hexdigest()}  {item.name}\n" for item in [archive, source_archive, release / "module.json"])
(release / "SHA256SUMS.txt").write_text(checksums, encoding="utf-8")
print(f"Built and verified {archive} ({archive.stat().st_size:,} bytes)")
print(f"Built and verified {source_archive} ({source_archive.stat().st_size:,} bytes)")
print(f"SHA256: {digest}")
