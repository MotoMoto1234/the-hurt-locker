# First GitHub release setup

Repository: https://github.com/MotoMoto1234/the-hurt-locker

## Repository files

1. Extract `the-hurt-locker-source-v1.0.0.zip` locally.
2. In GitHub choose **Add file > Upload files** (or the upload link for an empty repository).
3. Upload the extracted files and folders into the repository root, not the ZIP itself. `module.json`, `README.md`, `scripts/`, `styles/`, and `tools/` belong at the root. Include `.gitignore` if your file browser hides dotfiles.
4. Commit to the default branch. Suggested message: `Prepare The Hurt Locker 1.0`.

## Release

- Tag: **v1.0.0**, created on the commit containing these files.
- Title: **The Hurt Locker 1.0**.
- Description: paste `RELEASE-NOTES.md`.
- Attach **module.json** and **the-hurt-locker-v1.0.0.zip** from the generated release folder, with exactly those filenames.
- Optionally attach **SHA256SUMS.txt**.
- Publish as a normal release (not a prerelease) and select **Latest** if offered.

Do not use GitHub's auto-generated Source code ZIP for the Foundry download. Use the prepared installable ZIP.

## Verify after publishing

Stable installation/update manifest:
https://github.com/MotoMoto1234/the-hurt-locker/releases/latest/download/module.json

Version-specific manifest:
https://github.com/MotoMoto1234/the-hurt-locker/releases/download/v1.0.0/module.json

Installable archive:
https://github.com/MotoMoto1234/the-hurt-locker/releases/download/v1.0.0/the-hurt-locker-v1.0.0.zip

These are prepared destinations, live only after publishing the release assets. Confirm the downloaded manifest reports 1.0.0 and try installation through Foundry.

The display release is **1.0**; the manifest version is **1.0.0**. It includes every fix from local build 1.0.3. Local testers should replace that build manually because the public version is numerically lower.
