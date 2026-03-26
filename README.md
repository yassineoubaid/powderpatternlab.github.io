# Powder Pattern Lab

Powder Pattern Lab is a science-communication web app for teaching diffraction experiments. It guides the user through:

1. Building a chemical formula with atoms and fractional coordinates
2. Choosing the Bravais lattice, space group, and unit-cell parameters
3. Simulating an X-ray or neutron powder pattern with interactive peak zoom

## Local development

```powershell
npm.cmd install
npm.cmd run dev
```

The Vite dev server usually starts at [http://localhost:5173](http://localhost:5173).

## Free website deployment

This repo is ready for free deployment on GitHub Pages.

### Recommended free URL

- `https://powderpatternlab.github.io`

To use that exact free URL, create a GitHub repository named `powderpatternlab.github.io` and push this project to its `main` branch.

### What is already configured

- GitHub Actions workflow: [.github/workflows/deploy-pages.yml](/C:/Users/yassi/Desktop/codex_test/app_diffraction_test/.github/workflows/deploy-pages.yml)
- Automatic test run before deployment
- Automatic Vite base-path handling for both:
  - root sites like `powderpatternlab.github.io`
  - project sites like `username.github.io/repository-name`

### GitHub Pages setup

1. Create the GitHub repository.
2. Push this project to the `main` branch.
3. In GitHub, open `Settings` -> `Pages`.
4. Set `Source` to `GitHub Actions`.
5. Wait for the workflow to finish.

After that, GitHub Pages will publish the site automatically on each push to `main`.

## Build and test

```powershell
npm.cmd run test:run -- --reporter=verbose
npm.cmd run build
```

## Notes

- The site title is `Powder Pattern Lab`.
- For a custom paid domain later, you can add a `CNAME` file in `public/`.
