# Waypoint GO · Pitch flow, slide by slide

10 minutes · 26 steps on 39 deck slides (builds share a step) · built on the team's own flow.
Rule for every slide: **a few words on screen, the rest is said.** If a line on screen is longer than one breath, cut it.
The step number is the small number at the bottom right of each slide in **GO-pitch-flow.pptx**.

---

## 1. Is the flow good?

**Yes.** The team's second edit made problem 3 stronger. It now runs from wide to narrow, then answers:

> many edge cases → one set of tools → two speeds → one live case (the trip) → what happens today → the obvious fixes and why they break → our room → why text → how typing stops being friction → the trip, solved.

That is the chess structure from the first brief: **problem → obvious answers → what we did**.

### What this pass changed (accept or reject each)

| # | Change | Why |
|---|---|---|
| C1 | Filled step 11, **Every case, the same tools**: six cases on the left, five tools on the right, "485 cases · 5 tools · one record" | It is the point judges must remember: we did not build 485 features. The case icons move across from step 10 with Morph |
| C2 | Moved the **phone chain before the three obvious answers** (now steps 14, 15) | Today's reality first, then the fixes people would try. Before, the phone slide came after "three obvious answers" had already dismissed it |
| C3 | The third obvious answer is now **a WhatsApp group**, not phone calls (the notes already said so) | Phone calls are today, not a fix. A WhatsApp group is the question judges will ask about our room |
| C4 | Moved **"back to our trip"** to the end of problem 3 (step 18) | The why and the friction come before the payoff, so problem 3 ends on "minutes, not twenty calls" |
| C5 | Step 16 (one room) now says **who is in it and who decides**; cards and voice live on step 17 only | The old bullets repeated step 17 word for word |
| C6 | **Driver: works with no signal** is first and in green | It is the requirement the booklet names, and the reason the driver app is built the way it is |
| C7 | **MCP and admin split** into steps 20 and 21, each with a laptop mock | Room for the admin console screenshot |
| C8 | Hid the empty slide after "friction when typing"; footer numbers redone as steps | It would have shown a blank slide on stage |

### Facts to say correctly

- **Hiring vehicles:** the forecast shows the gap ten weeks ahead; the **admin** hires the vehicles and adds them to the fleet.
- **MCP:** a dispatcher tool today (connect your own AI, ask about the day, within their permissions; raising an issue needs their confirm); in future works, the bridge to the agentic enterprise.
- **Focus page** = the dispatcher's **Needs you** page.
- **Driver offline:** the day's working set is downloaded before the trip; deliveries, photos and signatures stay on the phone until sent. Loader and store manager are resilient (they keep working through a drop); the dispatcher is online only.
- **Admin console:** today a sample console on mock data; show only what the screenshot shows.

---

## 2. The deck at a glance

| Step | Deck slides | Slide | Time |
|---|---|---|---|
| 1 | 1-2 | Hook: Waypoint today | 0:25 |
| 2 | 3-5 | Three problems | 0:30 |
| 3 | 6 | GO reveal (logo animation) | 0:10 |
| 4 | 7-8 | Same hiker, better gear | 0:30 |
| 5 | 9-11 | Four people, one app | 0:15 |
| 6 | 12-14 | Problem 1: plan, explain, hire | 0:30 |
| 7 | 15 | Problem 1: the store's scheduler | 0:20 |
| 8 | 16-17 | Problem 2: watcher and focus page | 0:20 |
| 9 | 18-19 | Problem 2: every tool, no restrictions | 0:25 |
| 10 | 20 | Problem 3: ground-level edge cases | 0:25 |
| 11 | 21 | Problem 3: every case, the same tools | 0:25 |
| 12 | 22 | Problem 3: two baskets | 0:20 |
| 13 | 23-24 | Problem 3: a trip on the road (LIFO) | 0:35 |
| 14 | 25 | Problem 3: today, a chain of phone calls | 0:15 |
| 15 | 26-27 | Problem 3: three obvious answers | 0:25 |
| 16 | 28 | Problem 3: one room for the whole trip | 0:15 |
| 17 | 29-30 | Problem 3: why text, and friction when typing | 0:30 |
| 18 | 31 | Problem 3: back to our trip | 0:25 |
| 19 | 32 | Made for the driver | 0:25 |
| 20 | 33 | The dispatcher's MCP | 0:15 |
| 21 | 34 | The admin's console | 0:15 |
| 22 | 35 | Design (Designathon) | 0:10 |
| 23 | 36 | Built (Hackathon) | 0:20 |
| 24 | 37 | Intelligence (Datathon) | 0:20 |
| 25 | 38 | Future works: MCP | 0:20 |
| 26 | 39 | Close | 0:10 |
| | 40-44 | Backups, Q&A only | |
| | | **Total** | **9:15** |

Most time goes to steps 10-18 (problem 3). Steps 22-24 stay short. The spoken words are in **GO-pitch-script.md**; the "Say" lines below are the short version kept in the deck's notes.

---

## 3. Slide by slide

Each slide: **On screen** (the only text the audience reads) · **Visual** · **Say**.
"GO.pptx n" means reuse that slide from our design file. "Mock" means a screenshot or screen recording inside a MacBook, iPad or phone mockup.

---

### Step 1 · Hook: Waypoint today

**On screen**
> Every morning, 120 stores wait on one spreadsheet

**Visual** · GO.pptx 2-3: the line-art people (no colour = before GO), the message pop-ups (Fresh misses 8 AM · Chilled stock spoils · Disputes rest on memory), "How a delivery runs today".

**Say**
> This is Waypoint every morning. A hundred and twenty stores, sixty vehicles, and one dispatcher with a spreadsheet and a phone. It works today, because people work very hard.

---

### Step 2 · Three problems

**On screen** (three lines, one icon each)
> **On peak days, there are more orders than vehicles**
> **One dispatcher, up to 120 trips a day**
> **One late van starts a chain of phone calls**

Small grey line under each:
> Someone decides which stores wait · Plan, compare, defer, watch, alone · while every delivery window keeps closing

**Visual** · Three icons: a full truck with orders spilling over · one person and many trip lines · a chain of phones with a clock. Optional: our open ring beside each, closed later on its answer slide.

**Say**
> We found three problems that matter most. On peak days, there are more orders than vehicles, so someone must decide which stores wait. One dispatcher handles up to a hundred and twenty trips a day: planning, comparing, deferring, watching, alone. And when one van is late, the phone calls start, one store after another, while every delivery window keeps closing.

*Wording note:* full short sentences, not labels. "Demand handling", "cognitive load" and "communication" are our words; the audience needs the picture behind them. Each line has a number or an image a non-technical person can see.

---

### Step 3 · GO reveal

**On screen** · the logo animation (GO.pptx 1): "Ground Operations" collapses into the ring, which closes into **GO**.

**Say**
> So we built Waypoint GO. Ground Operations.

---

### Step 4 · Same hiker, better gear

**On screen**
> **Same hiker. Better gear.**
> Their know-how. Our tools.

**Visual** · Side by side, the same person:
- **Left, "Waypoint today":** line-art hiker, only good shoes, on a steep path.
- **Right, "Waypoint with GO":** the same hiker in colour, fully equipped. Each piece of gear has a small label:

| Gear | GO tool |
|---|---|
| Binoculars | Watcher |
| Map | Live trips |
| Compass | Plans explained in plain words |
| Radio | Trip chat room |
| Backpack | Scheduler |

**Say**
> Waypoint works today on people's effort, like a hike in just a good pair of shoes. GO adds the gear: binoculars, a map, a compass, a radio. The hiker is the same, with the same know-how. We don't take decisions away from Waypoint's people. We give them better tools.

---

### Step 5 · Four people, one app

**On screen** · GO.pptx 4-6 (the sketch versions): "4 People One app, Every Handoff on record", with the laptop, then the tablet, then the phone.

**Say**
> One app for four people. The dispatcher, on a laptop; the loader, on a shared tablet; and the store manager and the driver, on their phones.

---

### Step 6 · When vehicles run short

**On screen** (three short tags appear one by one)
> Plan in seconds · Every waiting order explained · Hire ahead

**Visual** · MacBook mock: Generate plan → the waiting orders, each with its reason → Forecast showing the gap → the admin adding a hired vehicle.

**Say**
> When orders close at four, GO builds the plan in seconds, within every vehicle's limits. Every order that has to wait is explained. And the forecast shows ten weeks ahead when vehicles will run short, so the admin can hire them in time and add them to the fleet.

---

### Step 7 · More orders than vehicles: spread the peak

**On screen**
> **GO suggests a day when a vehicle already goes there**
> Only a suggestion

**Visual** · Phone mock, the store manager's order screen. A calendar strip: today 28 Oct; the manager picks **4 Nov**; **3 Nov** and **5 Nov** glow because other stores in the same district already have orders then.

**Say**
> But the best peak is the one you spread out. A store manager orders, and picks the fourth of November. Other stores in the same district already have orders on the third and the fifth, so GO suggests those days: a vehicle is going there anyway. It is only a suggestion. The store manager decides.

---

### Step 8 · One person, 120 trips: GO watches with them

**On screen**
> **Watcher** · alerts only when needed
> **Focus page** · everything that needs you, in one place

**Visual** · MacBook mock: Live with vans moving on the map, one stop turning at risk, the alert, then the "Needs you" page.

**Say**
> Second, cognitive load. The watcher follows every live trip and alerts the dispatcher only when something needs a decision. Everything that needs them is on one focus page: Needs you. They stop holding the whole day in their head.

---

### Step 9 · Every tool, no restrictions

**On screen** (four tags)
> Compare plans · Drag and drop · Defer · Explained in plain words

**Visual** · MacBook mock: two plans side by side → a stop dragged to another trip → one order deferred → the plain-language explanation of a waiting order, zoomed so the back row can read it.

**Say**
> And when they plan, nothing is locked. They compare two plans, drag a stop to another trip, defer an order, and GO explains its own suggestion in plain words. GO brings the tools. The dispatcher brings what only they know: which store opens late, which road floods.

---

### Step 10 · Ground operations break in ways no plan expects

**On screen** (six tiles, one icon and one short line each)
> On time, but the store closed early today
> The store is open, the mall's loading bay is not
> A van breaks down with chilled goods inside
> Nobody at the store to receive
> Loader: "all loaded." Store: "three cartons missing."
> Delivered with no signal, while the dispatcher skipped that store

Footer, small: **485 cases catalogued, each with how GO handles it**

**Visual** · Icons in our line style. They are named so Morph carries them into step 11.

**Say**
> Problem three is where operations really break. A van arrives on time, but the store closed early today. A van breaks down with chilled goods inside. The loader says everything was loaded; the store says three cartons are missing. A driver delivers with no signal, while the dispatcher has already skipped that store. We catalogued four hundred and eighty-five cases like these.

(More cases for Q&A are in section 4.)

---

### Step 11 · Every case, the same tools

**On screen**
> Left: the six case icons from step 10, shrunk into a column with two or three words each
> Right: **Report** · one tap, with photos / **Watcher** · spots it before anyone calls / **Ask** · GO asks the stores by itself / **Trip room** · everyone on the trip, one conversation / **Needs you** · a person decides, on record
> Footer: **485 cases · 5 tools · one record**

**Visual** · Morph from step 10: the tiles fall away, the icons slide into the column, an arrow points to the tools. Designer option: thin lines from each case to the two or three tools it uses.

**Say**
> We did not build a screen for each one. Every case goes through the same five tools. A report, in one tap, with photos. The watcher, which spots trouble before anyone calls. GO asking the stores by itself. One room for the trip. And Needs you, where a person decides. Four hundred and eighty-five cases. Five tools. One record.

*Why it matters:* this answers "how can a hackathon team handle 485 cases?" before anyone asks. A tool per case would be impossible to learn at 3 AM; five tools are learned once.

---

### Step 12 · Two kinds of problems

**On screen** (two baskets)

| **Can be settled later** | **Can't wait** |
|---|---|
| Missing goods · Damage · Shortages | Window closing · Van stuck · Store closed |
| Report with photos → an issue with an owner, tracked to the end | A live decision, in minutes |

**Visual** · Left basket: loader's tablet and store manager's phone each taking a damage photo (mock) → an issue card with an owner. Right basket: a clock running down.

**Say**
> What changes is the clock. Some problems can be settled later: missing goods, damage, a shortage. They become an issue with an owner, tracked to the end. Others can't wait: a window is closing right now. That needs a live decision, in minutes. Let's follow one.

---

### Step 13 · Now, a trip on the road

**On screen**
> **Skip store 3?** Its goods are in front of store 4's.

**Visual** · Two builds:
1. A route line with five stores: **1 ✓ · 2 ✓ · 3 (window closing) · 4 · 5**.
2. The van from above, loaded last in, first out: **store 3's goods by the door**, then store 4, then store 5.
   Animate the only way to skip: store 3's goods out at store 4 → store 4's goods off → store 3's goods back in.

**Say**
> A van has five stores. Two are delivered. Then traffic: store three's window will close before the van gets there. Easy, just skip it? No. The van was loaded last in, first out, so store three's goods sit in front of store four's. To skip store three, the crew must unload its goods at store four, take store four's, and load store three's back in. One decision, and it needs the dispatcher, the driver and two store managers to agree. In the next ten minutes.

---

### Step 14 · Today, a chain of phone calls

**On screen**
> One call at a time. Nobody sees the whole picture. Nothing on record.

**Visual** · A chain: dispatcher → driver → store 3 → store 4 → driver again, with 07:12 → 07:31 above it.

**Say**
> Today, that decision is made by phone. The dispatcher calls the driver, then store three, then store four, then the driver again. One call at a time. Nobody sees the whole picture, and by evening nothing is on record.

---

### Step 15 · Three obvious answers, and why each breaks

**On screen** (three cards; the verdicts appear on the second build)

| Obvious answer | Why it breaks |
|---|---|
| Let AI decide everything | Who answers when it gets it wrong? |
| Buy a routing or tracking tool | It moves the van. It doesn't get store 4 to agree. |
| A WhatsApp group | Fast, but no structure. No record. |

**Say**
> There are three obvious ways to fix that. Let AI decide everything? When it leaves the same store waiting two days running, who answers for it? Buy a routing or tracking tool? It can move the van, but it can't get store four to lend its dock. Start a WhatsApp group? Fast, but nothing in it is structured, and nothing is on record.

---

### Step 16 · One room for the whole trip

**On screen** (four tags)
> The dispatcher, the driver, every store on it
> One picture, live, for everyone
> GO asks, and suggests the next step
> A person decides

**Visual** · Phone and MacBook mocks of the trip chat room.

**Say**
> So every trip gets one room. The dispatcher, the driver and every store manager on that trip, in one conversation, live. GO takes part: it asks the stores and suggests the next step. But a person decides.

---

### Step 17 · Communication: why text, and friction when typing

**On screen**, build 1, **Why text**
> **Freedom** · say what really happened, not only what a form allows
> **LLM consumption** · a message needs no AI to arrive; AI only where it helps
> **Audit** · every word has a name and a time

**On screen**, build 2, **Friction when typing**
> **Report** · one tap: running late, store closed, goods damaged
> **Template** · ready replies that fit the moment
> **Voice** · voice notes, and messages read aloud

**Visual** · Two phones playing the trip's conversation (recording R3).

**Say**
> Why a conversation, and not a form? Freedom: people say what really happened, not only what a form allows. Low AI cost: a message needs no AI to arrive, so AI is used only where it helps. And audit: every word has a name and a time. (click) But typing is friction, especially for a driver. So: reports in one tap. Ready replies that fit the moment. And voice: notes are transcribed, messages are read aloud.

---

### Step 18 · Back to our trip

**On screen** · the room, live:
> GO → Store 3: Can someone receive later? · Store 3: No (voice note, transcribed) · GO suggests → Store 4: May we use your dock? · Store 4: Yes · Driver: new plan on the phone

**Say**
> Back to our trip. GO asks store three: can someone receive later? A voice note comes back: no, our staff leave at seven thirty. GO suggests the next step: ask store four for its dock. The dispatcher sends it. Store four taps yes. The driver sees the new plan on the phone. Minutes, not twenty calls, and every word on record.

---

### Step 19 · Made for the driver

**On screen** (four lines, the first in green)
> **Works with no signal** · the day's trip on the phone; proof sent when signal returns
> Dark screen while driving · nothing to read, nothing to tap
> Next stop, one action · and the Fuel QR, even offline
> Voice notes to listen to, not read

**Visual** · Phone mock in night mode: airplane mode on, a delivery saved and queued → the driving screen going dark → the Fuel QR with no signal bars → a voice note playing.

**Say**
> For the driver, the first rule is that GO works with no signal. The day's trip is on the phone before the van leaves; deliveries, photos and signatures are sent when the signal returns. While the van moves, the screen goes dark: nothing to read, nothing to tap. When it stops: the next stop, one action, and a Fuel QR that works offline. And anyone can leave the driver a voice note, so the driver listens instead of reading.

---

### Step 20 · The dispatcher's MCP

**On screen** · title **Ask GO with your own AI**
> MCP: connect your own AI · "Which trips are at risk this morning?"
> Reads the day, within their permissions · trips, plans, issues, the audit trail
> Never acts alone · raising an issue still needs their confirm

**Visual** · MacBook mock: an AI assistant window asking "Which trips are at risk this morning?" and GO's answer.

**Say**
> Two more tools. The dispatcher can connect their own AI assistant to GO through MCP, and simply ask: which trips are at risk this morning? It reads the day within the permissions the dispatcher already has, and it never acts alone: even raising an issue waits for their confirm.

---

### Step 21 · The admin's console

**On screen** · title **Run the rules, without a developer**
> Users, roles and policies · permissions written like a cloud console
> Vehicles and planning parameters · changed without a new release
> Every change audited · who, what, when and why

**Visual** · MacBook mock of the admin console: the policy editor (effect, action, resource, condition), showing who a change affects before it is saved.

**Say**
> And the admin runs the business without a developer: users and roles, permission policies written like a cloud console, vehicles and planning parameters, changed without a new release. Every change, like every decision in GO, is audited: who, what, when, and why.

---

### Step 22 · Design (Designathon)

**On screen** · GO.pptx 7: "Designed for people who start at 3 AM".
> GO green: the next step · Teal: decisions · Night: no glare at 3 AM
> One action per screen · Slide to confirm · සිංහල · தமிழ் · English

**Say**
> We designed it for people who start at three in the morning: dark screens with no glare, one action per screen, slide to confirm so nothing is tapped by mistake, colour only where it means something, and Sinhala, Tamil and English.

---

### Step 23 · Built (Hackathon)

**On screen**
> Built to run, live today

**Visual** · Architecture diagram, left to right:
Four role apps (Next.js, installable, offline) → one backend (Spring Boot, business modules) → PostgreSQL (row-level security). Beside the backend: ML service (Python) · speech service · MCP server · warehouse API.
One row of numbers: **485** edge cases · **329** rules · **385** automated test files · **waypointgo.live**

Reuse the GO.pptx 9 layout, **without** the LKR 19,000 card.

**Say**
> We built it, and it is live. Four role apps that work offline, one backend in business modules, and a database that checks every permission on every row. Four hundred and eighty-five edge cases, each with a rule and a test.

---

### Step 24 · Intelligence (Datathon)

**On screen** · GO.pptx 10: Predict · Foresee · Decide, with one number each **[confirm with the ML owner]**:
> 7 in 10 late deliveries flagged before the van leaves
> Demand within about 3% over ten weeks
> Busiest day: [N] of 85 orders served, every wait explained

Under it: Rules first → our models → AI only for words → **a person decides**

**Say**
> Our models predict which deliveries will be late before the van leaves, forecast demand ten weeks ahead, and find the best plan when vehicles run short. Rules first, then our models, AI only for words, and a person always decides.

---

### Step 25 · Future works: ready for the agentic enterprise

**On screen**
> **Future-proof, through MCP**
> Today: the dispatcher's AI reads the day
> Tomorrow: every GO tool, a tool for your agents

**Visual** · GO in the centre, an MCP connector, and AI agents around it. A small lock: same permissions, same audit.

**Say**
> Enterprises are moving to AI agents. When Waypoint gets there, the MCP the dispatcher uses today becomes the bridge: every GO tool can become a tool for its agents, under the same permissions and the same audit. That is why GO is future-proof.

---

### Step 26 · Close

**On screen**
> **Their know-how. Our tools.**
> Waypoint GO · Ground Operations

**Visual** · Choose one:
- the hiker from step 4 at the summit, fully equipped; or
- the step 1 scene redrawn in colour: the same people, calm, phones quiet.

Optional ask, one line: "Let us run it at the Kandy depot."

**Say**
> Same people. Same know-how. Better tools. This is Waypoint GO. Thank you.

---

## 4. Edge cases for steps 10-11 and for Q&A

From our edge case register (docs/architecture/EDGE-CASES.md), the ones a person outside logistics would not think of. Step 10 uses the first six.

| Case | What GO does | Register |
|---|---|---|
| The van arrives on plan, but the store's window has already closed today | Treated as late; the store is asked or the stop is skipped with a reason | EXE-17 |
| The store is open, but the mall's loading bay has closed | Mall windows are planned in; a late mall stop is redelivered, never waited on | EXE-19, EXE-20 |
| A van breaks down mid-route with goods on board | The driver marks it broken; the plan follows | EXE-08 |
| Nobody at the store to receive, or the manager is away | The driver reports from the door; the dispatcher decides | RCP-21, EXE-07 |
| Loader passed every check, driver recorded delivered, store reports items missing | Loader's check, photos and the handover PIN settle it | RCP-06 |
| A stop recorded offline is replayed hours later, after the dispatcher changed it | The clash is shown to a person, never merged | EXE-21, EXE-38 |
| The proof photo shows a full load, but the store still reports missing goods | Evidence decides, recorded in the issue | RCP-07 |
| The store reports a shortage the loader already flagged at the dock | Linked to the loader's flag, not a new problem | RCP-16 |
| The plan changes while the loader is working from the old list | The loader sees the change before release | LOD-07 |
| One long unload makes every later stop late | Arrival times move for every later stop, and the dispatcher is told | EXE-41, EXE-42 |
| The driver needs the Fuel QR at a pump with no signal | The QR is kept on the phone | EXE-34 |
| A store tries to cancel an order that is already loaded | Refused with the reason; the store raises an issue instead | ORD-10 |
| A store's answer arrives after the deadline | Kept and marked late; the dispatcher was already told to phone | R-ISS-13, R-ISS-14 |

---

## 5. Words on the slides

- Full short sentences for problems, never two-word labels. A non-technical listener needs the picture, not the category.
- Store **one, two, three**: never outlet ids like OUT077 on a slide.
- **Report** = what a person sends from the field. **Issue** = the recorded problem with an owner. Use these two words the same way on every slide.
- 24-hour time on screen (06:52, 16:00).
- No money anywhere.
- No em dashes or en dashes in slide text.

---

## 6. Still to confirm

| Item | Who |
|---|---|
| The three Datathon numbers on step 24 (the repository says both 74 and 77 of 85 for the busiest day) | ML owner |
| Hiker images for steps 4 and 26, in our line-art and colour styles | Designer |
| Screen recordings for each mock, including the admin console (step 21) and an AI assistant over MCP (step 20) | Team, on the demo control room |
| Thin case-to-tool lines on step 11, if wanted | Designer |
| Keep or drop the closing ask (step 26) | Team |
