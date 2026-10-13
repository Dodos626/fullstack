# Game catalog attribution

The Game Finder catalog is derived from fields made available by
[`leinstay/steamdb`](https://github.com/leinstay/steamdb), which is distributed under the
GNU General Public License version 3. See the upstream repository for the complete license and
source dataset.

The refresh includes Steam rows that expose a valid store URL and at least one multiplayer-related
Steam category. It excludes rows without a release date and rows whose release date is in the future.
Exact multiplayer capacity is not inferred because the source does not provide a reliable structured
player limit.

Run `npm --prefix backend run gamefinder:refresh-catalog` to stream the latest compressed upstream
release directly into PostgreSQL and rebuild source-option counts in `gamefinder_metrics`.

Game names, artwork, descriptions, prices, and platform data belong to Valve, Steam, their respective
publishers, and the upstream data providers. Displayed prices are snapshots and must be verified on
the Steam store before purchase.
