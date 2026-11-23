# GitHub release setup

[The Hurt Locker repository](https://github.com/MotoMoto1234/the-hurt-locker)

1. Extract `the-hurt-locker-source-v1.1.0.zip` and commit its contents to the repository root. The manifest, scripts, styles, and release documentation belong in the source commit. Include `.gitignore` if your file browser hides dotfiles.
2. Create a GitHub release titled **The Hurt Locker 1.1.0** with tag **`v1.1.0`** on that commit. Paste the contents of `RELEASE-NOTES.md` into the description.
3. Attach `module.json` and `the-hurt-locker-v1.1.0.zip` from the generated release directory. Foundry installs from this module ZIP. GitHub generates its own source archives from the tagged commit.
4. Publish as a regular release and set it as **Latest**.

After publishing, confirm that the stable manifest reports version `1.1.0` and the versioned ZIP installs in Foundry. [Stable manifest](https://github.com/MotoMoto1234/the-hurt-locker/releases/latest/download/module.json), [versioned manifest](https://github.com/MotoMoto1234/the-hurt-locker/releases/download/v1.1.0/module.json), [installable ZIP](https://github.com/MotoMoto1234/the-hurt-locker/releases/download/v1.1.0/the-hurt-locker-v1.1.0.zip).
