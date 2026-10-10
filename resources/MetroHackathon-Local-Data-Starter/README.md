# Metro Hackathon Local Data Starter

This is a small offline-ready **starter kit**, not a finished solution. Use only the files relevant to the actual challenge.

## Files

- `station_reference.csv` — official GMRC station-name references from the GMRC station-information page. It contains names only; it does **not** provide verified coordinates, service status, travel time, timetable, or a route graph. Check current information before presenting operational claims.
- `sample_incidents.csv` — invented fault reports for demonstrating a fault logger/dashboard.
- `sample_delay_scenarios.csv` — invented delay scenarios for testing a delay simulator. The sample times are not official timetable times.
- `sample_passenger_feedback.csv` — invented passenger feedback for testing search/category summaries. No records represent real people or complaints.
- `sample_map_points.geojson` — fake points and illustrative coordinates that can be loaded to test a map UI. These are **not actual bus stops** and must not be used for directions or claims about real transit access.

## Sources

Official GMRC station information: https://www.gujaratmetrorail.com/ahmedabad/information-of-entry-exit-gate-at-entrance/
Official GMRC Phase-II route map: https://www.gujaratmetrorail.com/wp-content/uploads/Reports/Phase-II-Map-Final.pdf
OpenStreetMap (for future verified map data): https://www.openstreetmap.org/

## How to use during the event

1. Read the challenge and identify what data it actually needs.
2. Reuse the station-name reference only if relevant.
3. Use a synthetic CSV for interface and workflow testing only when the challenge permits it.
4. If spatial accuracy matters, replace `sample_map_points.geojson` with verified geographic data. Do not claim these sample points are real.
5. If the solution requires working offline, keep required data files inside the project and test with the network switched off.
6. Add a note in the demo/README explaining which data is real and which is synthetic.

## Suggested loading options

- JavaScript: `fetch('/data/sample_incidents.csv')` works only if a CSV parser is included; otherwise use JSON.
- Python: `csv.DictReader` reads CSV files; Python's built-in `json` module reads GeoJSON.
- SQLite: import selected CSV rows if the challenge requires persistent local records.

Do not spend time integrating every file. One useful dataset matched to the prompt is better than several irrelevant ones.
