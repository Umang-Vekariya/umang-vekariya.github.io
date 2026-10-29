# Umang Vekariya

Computer Science, AI & ML portfolio.

Website: https://umang-vekariya.github.io/

The `dist/` directory is the ready-to-publish website, including eight case studies, browser demonstrations, the neural playground, and the résumé. No server or package installation is needed to host it.

## Deployment

In repository Settings → Pages, select **GitHub Actions** as the source. The Pages workflow publishes `dist/` when `main` changes, or when run manually from Actions.

## Local preview

```sh
python3 -m http.server 4176 --directory dist
```

Open http://localhost:4176/. Serve over HTTP so browser modules and local demo assets load correctly.

This deployment snapshot contains only website files. Editing history and the private Sites project configuration are not included.
