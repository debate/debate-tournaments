# Ballot page element checklist

Every element on the beta ballot page, in render order, for approval one at a time. Line numbers are classic `mason/web/user/judge/ballot.mhtml`.
Stories: `general.stories.svelte` (shared), `debate.stories.svelte`, `mock_trial.stories.svelte`. Add a story for each event-type difference as it's handled.

## Route and page state
- [ ] **Route wiring**: `routes/user/judge/ballot/+page.svelte` loads the ballot context and renders `BallotLayout`; it only prints the ids today.
- [ ] **Unsupported ballot**: `OtherBallotContext` sends the judge to the classic ballot.
- [ ] **Early exits**: "You are not authorized to enter ballots for that judge." (231–241, admins and tourn owners get through as `notme`); "That tournament does not have tiebreakers set. Please contact the tournament tab staff..." back to the judge's panels (243–247); "That judge does not have a ballot in that room." (280–283). Classic redirects to home with the message (11–14 for missing ids).
- [ ] **Other ballot pages**: WSDC with point tiebreaks goes to `wsdc_ballot.mhtml` (39–41); tourns with `legion` go to `legion_ballot.mhtml` (45–47).
- [ ] **Already confirmed**: every ballot audited replaces the form with "This ballot has been entered and confirmed already. Changes to confirmed results require contacting the tournament staff." Mock trial instead shows its scored message, or "You are not required to score this round; you can just preside." when there are no scores. 1535–1567.
- [ ] **PO points gate**: with `po_points_required`, no PO points yet and not chair, the form is replaced by "You must give points to a presiding officer" and its explanation. 390–1404.
- [ ] **Mark started**: on load, set `started_by` and `judge_started` when not yet started, unless the viewer is acting for another judge (`notme`). 339–350.
- [ ] **Access polling**: call `checkBallotAccess` on load and every 2 minutes; on `refresh`, leave the page with its message. Skipped for the Congress chair. 643–666.

## Main column: header
- [ ] **Big Questions logo**: header gets a fourth segment for it. 1095–1109.
- [ ] **Room** (left): "Room: X" or "NO ROOM ASSIGNED" in person; "Room X" or "Room Link" link for online modes other than async. 1110–1130. Join buttons come with `online_room.mas` (see below).
- [x] **Round label** (center): event abbr (left out for mock trial) + round name (`Tab::Round::realname`: the label, else "Session N" for Congress or "Round N") + "Flt N" when `round.flighted > 1`. 1133–1140.
- [x] **Judge name** (right): code + first + middle + last 1142–1150.

## Main column: text blocks
- [x] **Chair label**: shown when `chair`; the event's `chairLabel`, else Parliamentarian (Congress) or Chair Judge, in capitals via CSS. The defaults are built in schemats so they can be translated. 1152–1162.
- [x] **Round notes** (`Round.notes`): "Note: …", warning style. 1166–1170. Plain text from the round settings textarea, often a Zoom link plus a contact email. Beta keeps line breaks and links bare `http(s)://` URLs; classic collapsed both. Story: General / Round Notes.
- [X] **Ballot header / bias statement**: bordered box, raw HTML. 1172–1178 and 1367, combined (see the notes log).
- [x] **Topic**: the event's topic ("TOPIC:"), else the published motion ("Motion:"), else the resolution ("Resolution:") + text, centered, bold, blue and larger like classic, with prose styles. 1330–1361. Big Questions is a separate item below.
- [x] **Rules**: `rules[]` (`ballot_rules_chair` for the chair, then `ballot_rules` unless chair + `chair_ballot_only`), HTML with prose styles. 1374–1386.
- [ ] **Big Questions rules**: `bqd_rules`. 1372–1376.
- [ ] **Errors slot**: empty for now; for "Oh, drat. Your ballot had errors." + the errors + "Please correct these before continuing." Classic fills it from the Congress equal-speech-count check ("Warning! Judge X has N scores for competitor Y while you have Z!", 392–448). 1448–1465.
- [x] **Points rules line**: shown when `scoring.points` and no `points.rubric`. "Points Rules: Range: min-max." + "Whole points only." + "Ties are OK."/"No ties." + "Ranks and points must agree." (`points.ranksAgree`) + "Winner must have higher points." (`winloss.lpw` forbid) + "Steps of X.", in classic's order. Range defaults by event type (0–6 Congress, 0–100 speech, 0–30 otherwise). 1468–1500.
- [x] **Accommodations Note**: `code: note` per entry with `ballot_notes`, in the order the API sends. 1506–1530. The API converts the saved text to plain text (tags removed, entities decoded, line breaks kept) and the UI keeps the line breaks; classic printed the saved HTML. Story: General / Accommodation Note.

## Main column: Congress tab strip (1180–1330)
- [ ] **Tab strip**: feedback, recency, rankings, speeches, seating; which tabs show depends on chair, audit and `sort_precedence` (1182–1212). Seating only with a seating-chart flag (1214–1224).
- [ ] **Presiding Officer select**: chair with `sort_precedence` only; entry codes, saves on change (`po_choose`). 1236–1274.
- [ ] **Tab panes**: recency (1276–1281), seating chart (1285–1294), feedback (1296–1309), speeches (1311–1325).

## Main column: regions (placeholders until the components exist)
- [ ] **Scoring**: Aff/Neg columns, points and winner. 1570–2818. Covers the sides and flips, speaker order, entry columns, ranks and points, rubrics, winner, low-point win, outstanding rubric and PO ratings, and their validation.
- [ ] **`lower_rules`** text below the scoring. 2719–2723.
- [ ] **Doubled-entry footnote**: explains the dagger marks on doubled entries. 2821–2828.

### Submit (2830–2891, hidden for a rubric with points outside speech)
- [ ] **Offline warning**: "Warning: Your Browser Appears To Be Offline", shown when a feedback save fails. 2832–2847.
- [ ] **Low-Point Ranks checkbox**: `allow_lowpoints`. 2850–2869.
- [ ] **Submit button**: "Save Scores" for mock trial, else "Submit Ballot"; hidden while a low-point win is pending and unconfirmed. 2874–2881, 1047–1051.
- [ ] **Signature line**: `dumb_signature_line` text. 2887–2891.

### Feedback (2892–3132; not for Congress, or mock trial without `mock_trial_feedback`)
- [ ] **Heading**: "Feedback". 2901–2907.
- [ ] **Edit-until notice**: "You can write & edit feedback until [tourn end]..." + submit ranks first, then edit under the Past tab. 2949–2962.
- [ ] **Word minimums**: `comments_plz` "At least N words of feedback are required for each speaker before you may submit your ballot." (2964–2969); `rfd_plz` "A written RFD of at least N words is required...", with mock trial's "reason for verdict" wording (2971–2980).
- [ ] **Box switcher**: tabs (Reason for Verdict / Rankings / Decision, then one per entry by code) under 4 ballots (2983–3013); a "Comments for" select at 4 or more, "Everyone (Reason for Rankings)" then entries, with names when `ballot_names` differs from the code (2910–2945).
- [ ] **RFD box**: "These comments go to all participants in the round." (+ "Must be at least N words long." for debate with `rfd_plz`), Save Feedback button, textarea with the minimum as placeholder. 3015–3056.
- [ ] **Per-entry boxes**: "These comments go only to CODE [school code / school / entry name / title / first names] & coaches", Save Feedback button, textarea with the minimum as placeholder. 3058–3132.
- [ ] **Saving**: per box via `comment_save`, auto-save on box switch and once on load, "All comments and feedback were saved" / "Errors were encountered saving; is your network connection active?". 677–743, 798–810, 1069–1091.
- [ ] **Rich text**: classic uses TinyMCE for these boxes. 537.

### Below feedback
- [ ] **Big Questions footer**: NSDA and Templeton logos, linked, new tab. 3144–3171.
- [ ] **Congress parliamentarian note**: chair + audit: "You are the parliamentarian for this round. You will not rank the speakers until the end of all sessions. Please use this screen to provide feedback." 3173–3178.
- [ ] **Topics for {round}**: `ballotTopics`, raw HTML. 3184–3190.

## Sidebar
- [x] **Tourn logo**: max 220px wide. 3194–3203.
- [x] **"This round" + Start time**. 3206–3218.
- [x] **Round row**: links to the beta invite schematic (`/invite/[tourn]/rounds/[eventAbbr]/[roundNumber]`), else the tournament's rounds list. Classic's duplicate table-icon link is left out. 3220–3240.
- [x] **Flight row**: flighted rounds only. 3241–3249.
- [x] **Doc Share row**: external link. 3250–3263.
- [x] **Room row**: in person only. 3264–3272.
- [x] **Panel row**: the other judges when the round has more than one, chair first then by last name. "Chair:" before the chair's name; mock trial shows "Presiding" (red) or "Scorer" (blue) instead. Pronouns as "(she/her)". ~3273–3330.
- [x] **Pronouns row** (classic labels it "Entry"): every student with a pronoun, by last name: entry code + first, middle, last name (pronoun). Hidden with `limit_info` (the API sends no pronouns). 3335–3346, 504–528.
- [x] **Deadline row**: time in blue, "Time Left:" countdown that keeps going past the deadline in red, classic's tooltip. ~3390–3420.
- [ ] **Timers**: heading + placeholder; hidden when timers are off. 3452–3500.
- [x] **Point Scale**: points + description rows. 3512–3545.
- [x] **Speech Times**: speech + time rows. 3562–3600.

## Page behavior
- [x] **Sidebar** is a drawer below `lg` and a column at `lg` and up (`WithSidebar`).

## Not built yet (in classic)
- [ ] **Online room join** (`funclib/online_room.mas`): sync link priority (`override_link`, then `judge_url` for judges and tab, then `room.url`) with passwords; NSDA Campus JWT form POST; hybrid badge with `map_url`; `online_event_match`; join logging to `campus_log`. Needs an indexcards service plus an endpoint. 1114, 3436.
- [ ] **Coin Flips row**: built in `BallotSidebar` for online flips (`debate.sides === 'flip'`): "Complete" in green once `flipStatus` is `done`, else "Incomplete" in orange. Stories: Debate / Flip Incomplete and Flip Complete. 3372–3388.
- [ ] **Sides heading**: "Sides Set", "Select Side" or "FLIP COMPLETE"/"FLIP INCOMPLETE", centered at the top of `BallotLayout`'s scoring region for debate. Moves over the sides column when the scoring columns exist. 1674–1686.
- [ ] **Flip polling**: in the page, while `debate.sides === 'flip'`, poll `/status` every 2 minutes and reload the context when any `Entries` side or `flipStatus` differs from it (classic reloaded the page). 607–641.
- [ ] **Prep Breakout Rooms**: online prep. 3423–3445.
- [ ] **Pending / Completed ballots** lists: the person's other ballots in this tourn, published rounds only; pending link to the ballot, completed to `rfd_only.mhtml`. Classic builds both links with the wrong judge id (3644, 3684). Not in the context. 3599–3694.
- [ ] **Big Questions speech times**: `bqd_speech_times` replaces the event's speech times. 219.
