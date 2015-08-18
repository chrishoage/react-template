#React Project Template

This is a project template for React projects using my personal preferences.

It uses Gulp as the build system, Webpack as the bundler, React Hot Loader, Babel (Stage 0), SCSS, Autoprefixer, normalize.css and ESLint as the ES6 linter.

It is as bare bones as possible, and intentionally does not include any Flux implementation

##Getting Started
1. `git clone https://github.com/chrishoage/react-template.git my-project`
2. `cd my-project`
3. `npm install`
4. `npm start`
5. `open http://localhost:9000`

##Useage
- `npm start` to run dev server
- `npm run build` to build production code (Uglify, DeDupe, ExtractText[CSS])
- `npm run prodtest` to build production with webpack dev server


##Customization
Specify `PORT=8080` and/or `HOST=127.0.0.1` to override the defaults (9000 and localhost)
