#!/usr/bin/env bash
set -euo pipefail

usage() {
  printf 'Usage: %s <album-id> "Album title"\n' "${0##*/}"
  printf 'Example: %s mumbai_2026 "Mumbai 2026"\n' "${0##*/}"
}

fail() {
  printf 'Error: %s\n' "$1" >&2
  exit 1
}

if [[ ${1:-} == --help || ${1:-} == -h ]]; then
  usage
  exit 0
fi
if [[ $# != 2 ]]; then
  usage >&2
  exit 1
fi

album_id=$1
album_title=$2
[[ $album_id =~ ^[a-z0-9]+([_-][a-z0-9]+)*$ ]] ||
  fail 'Album ID must contain lowercase letters/numbers separated by hyphens or underscores.'
[[ $album_title =~ [^[:space:]] ]] || fail 'Album title cannot be empty.'
[[ $album_title != *$'\n'* && $album_title != *$'\r'* ]] ||
  fail 'Album title must be a single line.'

project_root=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
registry="$project_root/_data/photo_albums.yml"
photo_data="$project_root/_data/photos/$album_id.yml"
album_page="$project_root/photos/$album_id.html"
[[ -f $registry ]] || fail 'Album registry not found.'
for album_file in "$photo_data" "$album_page"; do
  [[ ! -e $album_file && ! -L $album_file ]] || fail "File already exists: $album_file"
done
if grep -Eq "^[[:space:]-]*id:[[:space:]]*['\"]?$album_id['\"]?[[:space:]]*(#.*)?$" "$registry"; then
  fail "Album is already registered: $album_id"
fi

# YAML single-quoted strings escape apostrophes by doubling them.
yaml_title=${album_title//\'/\'\'}
printf '[]\n' > "$photo_data"
printf '%s\n' '---' 'layout: photo-gallery' "title: '$yaml_title'" \
  "album: $album_id" "permalink: /photos/$album_id/" '---' > "$album_page"
printf '\n- id: %s\n  title: '\''%s'\''\n  url: /photos/%s/\n' \
  "$album_id" "$yaml_title" "$album_id" >> "$registry"

printf 'Created /photos/%s/\nAdd photos to %s\n' "$album_id" "$photo_data"
