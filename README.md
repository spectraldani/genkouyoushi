# Genkouyoushi Generator

A simple web-based tool for generating customizable Genkouyoushi grids in SVG format.

## Implemented features

- **Arbitrary paper sizes**
- **Styles**:
  - **Grid**: Standard box grid for characters.
  - **Ruled**: Vertical columns only.
  - **None**: Blank paper with margins.
- **Customizable Layout**:
  - Adjustable page margins and cell margin and sizes.
    - Change right margin to add ruby columns.
  - Toggle guidelines: Cross, diagonal, thirds, and inner box.
- **Title Column**: Add a dedicated vertical title column with customizable position and height.
- **Export Options**:
  - Live preview of the generated grid.
  - **Copy SVG**: Copy the raw SVG code to your clipboard.
  - **Download SVG**: Download the grid as a standalone `.svg` file.

## Under construction and bugs

- Title columns don't play nice with arbitrary margins around grids; currently only works with ruby margins and no margins.
- Not all features implemented in code are accessible in the front-end.
- No option for horizontal writing.

## Usage
1. Start a web server in the project directory (e.g., using `python -m http.server`).
2. Open `index.html` in your web browser.
3. Customize the grid settings using the provided controls.
4. Use the "Copy SVG" button to copy the SVG code or the "Download SVG" button to save the file.
5. Print the SVG file using your preferred method (e.g. using [Inkscape](https://inkscape.org/)).

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.