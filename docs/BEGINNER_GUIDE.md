# Beginner guide: from downloaded files to a live website

## A. Install the basics

1. Install Node.js LTS from https://nodejs.org/.
2. Install Git from https://git-scm.com/downloads.
3. Restart your terminal after installation.
4. Confirm both work by running `node -v`, `npm -v`, and `git --version`.

## B. Start HAQ.NEWS

1. Extract the ZIP file.
2. Open the extracted `haq-news` folder.
3. Open Terminal (Mac) or PowerShell (Windows) in that folder.
4. Run `npm install`. This downloads the project's required packages.
5. Run `npm run dev`.
6. Open `http://localhost:3000` in your browser.
7. Keep the terminal running while you use the local site. Press Ctrl+C in the terminal to stop it.

## C. Test it

- Type a word in search.
- Change the category.
- Open a story.
- Toggle the interest chips and see the feed reorder.
- Save a story; bookmarks are stored in the current browser only.
- Run `npm test` in a second terminal (or stop the dev server first if needed).

## D. Put it online

Follow the GitHub and Vercel instructions in the main README. Deploying the demo does not require a paid plan or API keys, but provider limits and terms can change. A custom domain generally costs money; use the Vercel-provided address for the first test.

## E. Safe secrets

- `.env.example` is a template and contains no secret keys.
- Copy it to `.env.local` only on your computer.
- Never commit `.env.local`.
- Never put service-role keys or AI keys in client-side code.
- If a secret is accidentally pushed to GitHub, revoke/rotate it immediately; deleting the file in a later commit is not enough.
