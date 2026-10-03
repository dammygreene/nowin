# NOWIN Winning Guide — Verification Status

**Status: no browser playthroughs recorded.** This guide intentionally does not publish source-derived routes as if they were observed gameplay. The audit environment has no installed interactive browser engine, so no real loss, restart, betrayal discovery, or win has been performed in this checkout.

The six cabinets below are the complete live set. A “fresh-run win” means a win started after opening/restarting the cabinet, not a unit-test result or a static-code inference.

| Cabinet | Observed winning trick | Fresh-run wins reproduced | Verification status |
| --- | --- | ---: | --- |
| Snake | Not yet observed in an interactive browser. | 0 | Blocked: browser engine unavailable. |
| Flap | Not yet observed in an interactive browser. | 0 | Blocked: browser engine unavailable. |
| Tetris | Not yet observed in an interactive browser. | 0 | Blocked: browser engine unavailable. |
| Cross | Not yet observed in an interactive browser. | 0 | Blocked: browser engine unavailable. |
| Pong | Not yet observed in an interactive browser. | 0 | Blocked: browser engine unavailable. |
| Tic-Tac-Toe | Not yet observed in an interactive browser. | 0 | Blocked: browser engine unavailable. |

## Required completion protocol

Before this document can become a player guide or the product can be called release-ready:

1. Run the **production build** in a real browser.
2. For every cabinet, record a normal loss, restart from a fresh run, identify the in-game betrayal and counterplay through play, and record the exact successful input trace.
3. Reproduce at least three independent fresh-run wins per cabinet where practical. Note any cabinet that cannot meet that target and why.
4. Replace only the corresponding row above with observed trick wording, measured win count, device/browser, viewport, build identifier, and date.
5. Repeat at desktop and mobile viewports before making device-support claims.

Unit tests validate selected deterministic contracts, but they are not gameplay evidence and do not count toward this table.
