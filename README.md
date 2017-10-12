# Electron screen problem

Minimum reproduction for https://github.com/electron/electron/issues/10741

Tested on Ubuntu 16.04 / Debian stretch. Shows that electron's screen information is sometimes outdated.

## run

Best is to run on a system with only 1 screen (external or internal).

```
npm install
npm run start
```

output should be similar to:

```
1. Getting and comparing screens from xrandr and electron
(eDP1) Xrandr mode: 1360x768, Electron mode: 1360x768 => OK


Setting new mode on display (eDP1): 1366x768
Display mode changed


2. Getting and comparing screens from xrandr and electron
(eDP1) Xrandr mode: 1366x768, Electron mode: 1360x768 => NOT OK!


Waiting one second


3. Getting and comparing screens from xrandr and electron
(eDP1) Xrandr mode: 1366x768, Electron mode: 1366x768 => OK
```

The `NOT OK` on the second step shows the problem.