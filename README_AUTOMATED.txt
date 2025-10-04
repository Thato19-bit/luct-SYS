AKER/THATOO - Prepared for Vercel deployment

Summary:
- Copied project into A K E R / T H A T O O (skipped node_modules and large files >10MB).
- Created api/ with 7 auto-generated wrappers for detected Express routes.
- Added vercel.json, .gitignore, and this README.

Key files:
- vercel.json (routes & builds)
- api/ (auto-generated wrappers)
- .gitignore

Frontend package.json adjusted: package.json

Counts:
- files_copied: 43
- files_skipped_due_to_size: 0
- node_modules_removed_count: 0
- js_ts_files_scanned: 16

Next steps:
1. Inspect api/ wrappers. If any wrapper returns the "Please adapt" message, open the original file and export a handler(req,res) that contains the route logic, or I can help convert specific files you point out.
2. Initialize git, commit, push to GitHub, then import to Vercel.
3. Add environment variables in Vercel dashboard if your app needs them.

If you want, tell me "AUTO CONVERT MORE" and I will try to convert specific backend files you care about into handlers.