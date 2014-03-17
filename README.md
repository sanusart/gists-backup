# Gist backup script

This script will download all gist files to local directory ("gists" by default)

Pre-run
---

Run `npm install`

Run
---

Run `node bkp.js USERNAME PASSWORD`

If all went well, you'll see "gists" directory populated with directories named after gist description.
Gists with similar descriptions will be appended with 'duplicate N' (where N is an incremented number), gists without description will simply be called 'Untitled'.
