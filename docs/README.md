# HTML to PDF Action Handler

Allows to render locally stored HTML document into PDF file

**ID:** `com.fireblink.fbl.plugins.html.to.pdf`

**Aliases:**

- `fbl.plugins.html.to.pdf`
- `html.to.pdf`
- `html->pdf`

```yaml
html->pdf:
  # [optional] maximum time to wait for page to load in seconds
  # Default value: 30 (30 seconds)
  # Min value: 1 second
  # Max value: 3600 seconds (1 hour)
  timeout: 45

  # [optional] function name on `window` object that page should call to start rendering,
  # e.g. window.iAmReady();
  # Note: function is added after page stops loading, so make sure to not call it right away.
  # E.g. `setTimeout(window.iAmReady, 1000);` will not work, while
  # setTimeout(() => {
  #   window.iAmReady();
  # }, 1000);
  # will probably work.
  readyFunction: iAmReady

  # [required] information on where to find the HTML file and related assets
  from:
    # [required] folder that contains html file and all assets (images, fonts, etc)
    folder: /some/folder

    # [required] relative path to the HTML file inside the folder
    relativePath: index.html

  # [required] PDF generation information
  pdf:
    # [required] path to where store the PDF file (should also iclude the name of the file and extension)
    path: result.pdf

    # [optional] page format to render
    # Default value: A4
    # Possible values:
    # - "Letter"
    # - "Legal"
    # - "Tabloid"
    # - "Ledger"
    # - "A0"
    # - "A1"
    # - "A2"
    # - "A3"
    # - "A4"
    # - "A5"
    format: A5

    # [optional] Paper orientation.
    # Default value: false
    landscape: true

    # [optional] Display header and footer.
    # Default value: false
    displayHeaderFooter: true

    # [optional] HTML template for the print header.
    # Should be valid HTML markup with following classes used to inject printing values into them:
    # - `date` formatted print date
    # - `title` document title
    # - `url` document location
    # - `pageNumber` current page number
    # - `totalPages` total pages in the document
    headerTemplate: `
      <div class="date"></div>
      <div class="title"></div>
      <div class="url"></div>
      <div><span class="pageNumber"></span> of <span class="totalPages"></span></div>
    `

    # [optional] HTML template for the print footer.
    # Should be valid HTML markup with following classes used to inject printing values into them:
    # - `date` formatted print date
    # - `title` document title
    # - `url` document location
    # - `pageNumber` current page number
    # - `totalPages` total pages in the document
    footerTemplate: `
      <div class="date"></div>
      <div class="title"></div>
      <div class="url"></div>
      <div><span class="pageNumber"></span> of <span class="totalPages"></span></div>
    `

    # [optional] Print background graphics.
    # Default value: false
    printBackground: true

    # [optional] Paper ranges to print, e.g., '1-5, 8, 11-13'.
    # Default value: '' which means print all pages.
    pageRanges: '1-5'

    # [optional] Paper width (string or number).
    width: 640
    # [optional] Paper height (string or number)
    height: 960

    # [optional] Paper margins, defaults to none.
    margin:
      # [optional] Top margin (string or number).
      # Default value: 0
      top: 10

      # [optional] Right margin (string or number).
      # Default value: 0
      right: 10

      # [optional] Bottom margin (string or number).
      # Default value: 0
      bottom: 10

      # [optional] Left margin (string or number).
      # Default value: 0
      left: 10

    # [optional] Give any CSS @page size declared in the page priority over what is
    # declared in width and height or format options.
    # Default value: false which will scale the content to fit the paper size.
    preferCSSPageSize: boolean;
```

**Warning:** headless Chrome browser is started with `--no-sandbox` and `--disable-setuid-sandbox` arguments, meaning sandbox is disabled. You should only use PDF rendering with the html content you trust.
