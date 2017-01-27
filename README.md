# Gist backup

This package will download all gist files to directories named after gist description.

Pre-run
---

Run `[sudo] npm install gist-backup --global`

Run
---

`gist-backup <github-username> <github-password> <http://enterprise-URL or https://api.github.com> <path/to/backups>`

or just

`gist-backup` (will be prompted for username, password and local path to backup directory)

---

If all went well, you'll see "gists" directory populated with directories named after gist description.
Gists with similar descriptions will be appended with 'duplicate N' (where N is an incremented number), gists without description will simply be called 'Untitled'.
