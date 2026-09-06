# Vortex Unlocked

Unlocked fork of [Nexus-Mods/Vortex](https://github.com/Nexus-Mods/Vortex), the open-source mod
manager from Nexus Mods. Released under the GPL-3.0 license, same as upstream.
Unlocked by [Chaython](https://github.com/Chaython).

## What this fork changes

- **No premium upsell UI** - the "Go Premium" header banner, downloads-page speed-cap banner,
  dashboard dashlet, free/premium comparison modal, membership status badge and premium
  indicators are all gone.
- **No client-side premium gates** - parallel download threads, "Update All", collection
  bulk-install, one-click dependency installs and generated nxm downloads are available to
  every account. Note that anything the Nexus API itself enforces server-side (such as which
  CDN link your account gets) is still decided by the server - when the API refuses, Vortex
  Unlocked transparently falls back to the website link round-trip.
- **Hide the Dashboard tab** - new toggle under Settings -> Interface ("Hide Dashboard tab"),
  applied live, no restart needed.
- **Usage analytics / event reporting disabled** - no Mixpanel session, no OTel export.
- **Auto-updater disabled** - the in-app updater would install official Vortex releases and
  silently revert every change above. Update by re-running the build workflow instead.
- **Separate identity** - installs and stores data as "Vortex Unlocked", side by side with any
  official Vortex install.

## How the repository is structured

This repository is a _patch carrier_:

```
patches/vortex-unlocked.patch     # the full diff applied on top of upstream master
.github/workflows/build-vortex-unlocked.yml   # CI: clone upstream, patch, build, release
.upstream-base                    # upstream commit this snapshot was generated from
<source tree>                     # snapshot of upstream + patch applied (reference only)
```

CI never builds the source snapshot in this repository. Every run clones the **latest**
upstream Vortex master, applies `patches/vortex-unlocked.patch` (via `git apply --3way`, so
small upstream refactors still merge), builds the Windows installer and publishes it as a
release. New upstream commits are therefore picked up automatically without discarding the
unlocked modifications.

## One-time setup

1. Create a new (public or private) GitHub repository for your fork.
2. Push this repository's contents to it:
    ```bash
    git init
    git add .
    git commit -m "Vortex Unlocked"
    git remote add origin git@github.com:<you>/vortex-unlocked.git
    git push -u origin master
    ```
3. Make sure Actions are enabled for the repository (Settings -> Actions -> General).
4. The build triggers automatically on push, daily at 06:00 UTC, or manually
   (Actions -> "Build Vortex Unlocked" -> Run workflow). Grab the `vortex-unlocked-setup-*.exe`
   from the run's release or artifacts once it finishes.

## Updating the patch when upstream breaks it

If the workflow fails at "Apply Vortex Unlocked patch", upstream changed one of the patched
regions hard enough that even a 3-way merge can't reconcile it. To regenerate:

```bash
git clone https://github.com/Nexus-Mods/Vortex.git
cd Vortex
git apply --3way /path/to/patches/vortex-unlocked.patch
# resolve any conflicts in the marked files, then:
git add -A
git diff --cached 5bf1ae71a9b62ace7f43b12bd844d2fd83bb6489 HEAD > ../new.patch
```

...or simply redo the edits by hand on the new tree and re-diff against the new upstream
base. Replace `patches/vortex-unlocked.patch` and the `.upstream-base` file, then push - CI
picks it up from there.

## License

GPL-3.0, inherited from upstream Vortex. All modifications in this repository are published
here in source form, as the license requires.
