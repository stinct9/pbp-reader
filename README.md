# Purushottam Bolya Prite · પુરુષોત્તમ બોલ્યા પ્રીતે

Verbatim words of Bhagwan Swaminarayan, compiled from *Shri Haricharitramrut Sagar*.
Extracted from [anirdesh.com/pbp](https://www.anirdesh.com/pbp/) and paired with an English
rendering, so the text can be read in English without the Gujarati ever going away.

**Personal study copy.** The Gujarati is someone else's publication; this folder is a reading
aid for one person, kept local. Don't publish it.

## What's here

```
Text/         Bilingual — English passage, Gujarati beneath it, HCS citation. The main read.
Gujarati/     Source only, block-numbered. The authority; untouched by translation.
Reader/       index.html — open it in a browser. English with the original on hover/click.
Topics.md     "I have a question about X" → which chapter to open.
pbp.json      Everything, structured, for grepping and scripting.
_work/        Scrape → parse → translate → build pipeline, plus the translation contract.
```

## The shape of the text

31 chapters, each a **theme** (satsang, dharma, humility, hardship, ego, maya…), plus front
matter. 2,309 passages. Most chapters end with a **પરિશિષ્ટ (appendix)** — the compiler's own
corroboration, kept distinct from Maharaj's words.

Nearly every passage is a self-contained excerpt in the same frame: *at [place], to [person],
Shriharí said "…"*. Each carries a footnote into *Haricharitramrut Sagar* as
`HCS part/chapter/verses` — the deepest citation available, since this book is itself a
compilation. 1,340 such references were captured.

**Block ids** (`[1959]`) are stable across every file. Cite a passage by chapter + id, e.g.
*PBP 25.1959*, and it's findable in all four representations.

## Reading it

Open `Reader/index.html` in any browser — no server needed.

- **English / Both / ગુજરાતી** — three view modes.
- **Hover** a passage → the Gujarati floats up beside it. **Click** → it pins open, with the
  HCS reference.
- **Search** runs over the English (and falls back to the Gujarati), so the text is finally
  searchable without reading Gujarati.

## On the translation

The English is a **reading aid, not a replacement**, and the pairing is permanent — every
passage keeps its original underneath, at the same block id, so nothing is stranded behind a
translator's choice. The rules are in `_work/TRANSLATION-GUIDE.md`; the important ones:

- **1:1, never merged or summarised.** One Gujarati block, one English block.
- **Technical vocabulary is not translated** — *satsang*, *mahima*, *khap*, *nirdoshbuddhi*,
  *dehbhav* stay as themselves, matching the BAPS English Vachanamrut in
  `../Vachanamrut/13-Glossary.md`. Turning *satsang* into "holy company" is exactly where the
  meaning leaks out, and it's the single biggest fidelity lever in the whole job.
- **Vraj-bhasha verses are transliterated, not translated**, with a plain-sense gloss in
  brackets. They're metrical scripture; a paraphrase would misrepresent them.
- **The frame is preserved** — place, person, direct speech, quotation marks. That's what
  makes a passage re-findable and keeps Maharaj's voice first-person.
- **Uncertain passages are flagged, not smoothed.** A marked literal beats a fluent invention.

### Two English layers

The reader shows both, always labelled, never mixed up:

| Layer | What it is | Marked |
|---|---|---|
| **reviewed** | Translated against the contract above, audited, terms locked to the BAPS glossary | no badge |
| **machine** | translate-shell/Google baseline — readable, but rough on devotional register | amber `machine` badge, greyed text |

Reviewed always wins: refining a chapter later simply supersedes its machine baseline.
Reviewed so far — 258 passages, all audited clean:
**5** (Parabrahman Purushottam Narayan, 125), **8** (Het-Prit, 65),
**11** (Khap-Sahanshilta, 34), **25** (Sukh-Dukh, 34).

**Trust the badge.** A `machine` passage is fine for finding your way around and for
searching, but don't lean on its exact wording — it renders place names loosely and flattens
the technical vocabulary. If a machine passage matters to you, ask for that chapter to be
done properly, or check the Gujarati beside it.

### Filling in the rest (free, no API key)

```bash
brew install translate-shell                      # one time
python3 _work/scripts/mt_baseline.py              # every remaining chapter
python3 _work/scripts/mt_baseline.py 21 22        # or just these
python3 _work/scripts/build.py && python3 _work/scripts/build_reader.py
```

Resumable and safe to interrupt — it caches each block and re-runs skip what's done. ~2,150
passages at ~1.2s each is roughly an hour and a half; leave it running.

### Audit

`_work/scripts/audit.py` and `audit2.py` check a translated chapter against the contract:
1:1 alignment, dropped-content (length-ratio) detection, sentence parity, forbidden
translations of reserved vocabulary, verse handling, and citation integrity. All three
chapters pass clean.

`_work/scripts/consistency.py` handles the one structural hazard: because the book is a
topical compilation, the compiler reuses passages under several themes — 13 cross-chapter
twin pairs. Run it on a chapter **before** translating it:

```bash
python3 _work/scripts/consistency.py 21     # shows twins already translated, and the exact
                                            # spans where that chapter's Gujarati differs
```

Twins are near-identical but rarely identical. Block 638 (ch8) and 820 (ch11) differ by two
words — સંતનો સંગ *જેટલો* vs સત્સંગ — which changes the sense from "not attaining satsang" to
a proportional "however much he fails to obtain the company of the Sant." Always translate
from the chapter's own text.

## Rebuilding

```bash
python3 _work/scripts/fetch.py        # re-scrape (skips what it has; 1.5s between requests)
python3 _work/scripts/parse.py        # HTML → _work/pbp_gujarati.json
export ANTHROPIC_API_KEY=sk-...
python3 _work/scripts/translate.py    # resumable; or name chapters: translate.py 11 25
python3 _work/scripts/build.py        # → pbp.json + Text/
python3 _work/scripts/build_reader.py # → Reader/data.js
```

Re-translation never touches the Gujarati — `Gujarati/` and `_work/raw/` are the ground truth,
so the English can be redone or improved chapter by chapter without re-scraping anything.

## Known issues

- The source page for ch. 21 is titled **૫૧** (51); the correct number, 21, is taken from the
  page slug.
- The source's own numbering sometimes carries a parenthetical correction, e.g.
  `8/20(19)/19-22`; preserved as-is. A few refs use a Gujarati sub-chapter marker
  (`11/61(51-b)`) or the word `tarang`, transliterated on build.
- **200 footnotes quote the source verse** from *Haricharitramrut Sagar* before giving the
  reference. These are split into `src` (the citation) and `src_verse` (the Devanagari
  verse), and the reader shows the verse in its own panel rather than as a citation.
