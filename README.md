# Welcome

This blog is hosted at [https://akshaydewan.me](https://akshaydewan.me)

# Implementation Notes 

## Photography gallery

The gallery lives at `/photos/`. Upload compressed photos manually to the public
R2 bucket, then edit `_data/photos.yml`. Replace `[]` with a list of entries
containing a URL, caption, width, and height (no `photos:` wrapper is needed):

```yaml
- url: "https://photos.akshaydewan.me/mountains.jpg"
  caption: "Evening light in the mountains"
  width: 1600
  height: 1067
- url: "https://photos.akshaydewan.me/street.jpg"
  caption: "A quiet street after the rain"
  width: 1067
  height: 1600
```

Photos are placed in YAML order into the shorter column for a masonry layout.
The viewer and keyboard navigation follow YAML order. Move an entire entry to
change the order.
Captions are displayed only in the modal viewer and also used as image alt text. Use
quoted YAML strings; escape double quotes inside a caption as `\"`.
Set `width` and `height` to the uploaded image's actual pixel dimensions, as
positive integers without units. No thumbnails or EXIF fields are needed.

The gallery preserves each photo's proportions and uses native browser lazy
loading, which may fetch photos shortly before they become visible. The supplied
dimensions become HTML `width` and `height` attributes so the browser can reserve
space at the correct aspect ratio before loading. CSS scales images to the tile
width while keeping their height proportional.

The gallery uses the available page width with 24px side gutters and at most
two columns. Each column stacks independently with 24px spacing, avoiding gaps
below shorter photos. It switches to one column on narrow screens. The layout
updates when the viewport or image sizes change; without JavaScript
the gallery uses a regular grid.

Click a photo to open a modal viewer filling the viewport with a 12px margin.
Its size stays the same between photos. Images fit the available area without
cropping; smaller images stay at their natural size, centered in the viewer.
The caption appears below the photo. Use the
previous/next buttons or Left/Right arrow keys to navigate in YAML order; the
controls stop at the first and last photo. Close with the X button or Escape.
Navigation buttons overlay the left and right edges of the photo. Horizontal
trackpad scrolling and touch swipes over the photo also navigate the gallery.

Both the grid and viewer use the same original image URL. Only the original
pixel dimensions belong in YAML; no scaled dimensions or separate thumbnail
files are needed. The viewer loads the selected photo on demand. Without
JavaScript or modal-dialog support, clicking a photo opens the image directly.

Keep `[]` in `_data/photos.yml` to display “Photos coming soon.” The image
subdomain must be configured separately before its URLs will work. Images are
not automatically discovered from the bucket.

### EXIF details

Click the camera-and-EXIF button beside Close to read the photo's embedded EXIF.
The parser and metadata requests start only after this click. Browsing with
the details pane closed does not request EXIF. A separate “Photo details” pane
slides in from the right. It shows a loading card with a spinner and skeleton lines,
then replaces that card with camera, lens, shutter speed, aperture, and ISO rows
with matching SVG icons. JPEG and WebP are supported, and no EXIF fields need
to be added to `_data/photos.yml`.

The photo controls remain usable while details are open. Navigating keeps the
pane open and loads the selected photo's EXIF, reusing cached results or pending
requests when available. Close the details pane with its X or Escape to leave
the photo viewer open. The photo's X closes both views. On wide screens details
sit to the right; on narrow screens they sit below the photo so navigation and
Close remain accessible. Reduced-motion preferences disable the slide and
spinner animation. Closing the viewer resets the pane. Missing fields are
omitted. Photos without EXIF show “No EXIF details available.” Failed reads show
a Retry button. Metadata loading does not block the photo or controls.
Results and pending reads are cached for the visit. Hiding details lets an
already-started request finish into the cache. The selected photo may require
additional metadata range requests; WebP metadata after the pixel data may
require a full-file read.

Preserve EXIF when exporting or compressing your images. For example, Google's
`cwebp` drops metadata by default; to preserve EXIF and the colour profile:

```sh
cwebp -q 85 -metadata exif,icc input.jpg -o output.webp
```

See the [cwebp documentation](https://developers.google.com/speed/webp/docs/cwebp).

For browser extraction, configure the public R2 bucket to allow cross-origin
reads. An example CORS policy for this blog and local preview is:

```json
[
  {
    "AllowedOrigins": [
      "https://akshaydewan.me",
      "http://localhost:4000",
      "http://127.0.0.1:4000"
    ],
    "AllowedMethods": ["GET"],
    "AllowedHeaders": ["Range"],
    "ExposeHeaders": ["Content-Range"]
  }
]
```

Use your actual preview origin and port if different. Apply the policy in R2's
bucket settings; see [Cloudflare's CORS guide](https://developers.cloudflare.com/r2/buckets/cors/).
If the custom domain already caches images, purge its cached responses after
changing CORS so the new headers take effect. Verify the image response permits
your page's origin and exposes `Content-Range` when serving partial content.
Without suitable CORS headers, images can still display while EXIF extraction
fails and its details remain hidden.

The site includes [ExifReader 4.46.0](https://github.com/mattiasw/ExifReader/releases/tag/v4.46.0)
locally, with its license and source information in `assets/vendor/`.

## Local preview

The project uses **Ruby 3.3.12** through rbenv and **Bundler 2.6.9**. The tracked
`.ruby-version` selects Ruby automatically inside this repository, and the
Gemfile checks that version. `Gemfile.lock` pins Bundler and the dependencies.
Jekyll uses the 4.3 series, which includes the logger fix required by Ruby 3.3.

### One-time macOS setup

Install rbenv and ruby-build with Homebrew, then enable rbenv in your shell:

```sh
brew install rbenv ruby-build
rbenv init
```

Open a new terminal so the shell configuration takes effect. In this repository,
install its pinned Ruby and Bundler:

```sh
rbenv install -s 3.3.12
gem install bundler -v 2.6.9 --no-document
rbenv rehash
rbenv version
ruby --version
bundle _2.6.9_ --version
```

`rbenv version` should report `3.3.12` selected by this repository's
`.ruby-version`. `rbenv which ruby` should point into
`~/.rbenv/versions/3.3.12/`, rather than `/usr/bin/ruby`. These steps also work
with an existing rbenv installation on Linux; use your distribution's
installation instructions instead of Homebrew if needed.

Install gems into the selected rbenv Ruby without `sudo` or `--user-install`.
Do not update macOS's system RubyGems. If you previously added the system Ruby's
user gem directory to `PATH`, keep rbenv's shims ahead of it. See the
[rbenv setup guide](https://github.com/rbenv/rbenv#installation).

### Run the site

```sh
bundle _2.6.9_ install
bundle _2.6.9_ exec jekyll serve
```

Open `http://localhost:4000/photos/`. For a production build:

```sh
JEKYLL_ENV=production bundle _2.6.9_ exec jekyll build
```

WEBrick is included explicitly because Jekyll needs it for local serving on
Ruby 3. If compiling Ruby or a native gem fails on macOS, ensure Xcode Command
Line Tools are installed (`xcode-select --install`) and check that
`rbenv which ruby` points to the project Ruby.
