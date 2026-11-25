/*
 * Published tournaments.
 * ---------------------------------------------------------------
 * This file is the "database" of the static site. Edit it by hand, or
 * create a tournament at /admin.html and use "Export tournaments.js"
 * to download a new version of this file, then commit it.
 *
 * Field reference (all optional except id, name, startDate):
 *   id            url slug, unique  -> tournament.html?id=<id>
 *   name, series  title and the series it belongs to (used for filters)
 *   status        "upcoming" | "live" | "completed" (auto-derived from dates if omitted)
 *   startDate, endDate   "YYYY-MM-DD"
 *   time, venue, address, city, mapUrl
 *   entryFee, prizePool, format, registrationUrl, registrationDeadline, contactPhone
 *   summary       one line used on cards
 *   description   longer text, blank lines become paragraphs
 *   categories    ["Men's Doubles", ...]
 *   schedule      [{ time, item }]
 *   rules         ["...", ...]
 *   results       [{ category, winner, runnerUp, third }]
 *   stats         [{ label, value }]
 *   partners      ["...", ...]
 *   coverImage    path or URL
 *   images        [path or URL, ...]
 *   videos        [YouTube URL, or path to .mp4/.webm]
 */
window.TOURNAMENTS = [
  {
    id: "triple-threat-league-s2",
    name: "Triple Threat League — Season 2",
    series: "Triple Threat League",
    status: "upcoming",
    startDate: "2026-12-20",
    time: "Evening sessions",
    venue: "AfterrMatch",
    city: "Greater Noida",
    format: "Teams of 3 · Pool stage + knockouts",
    entryFee: "To be announced",
    prizePool: "Cash prizes + trophies",
    contactPhone: "9620588009",
    summary: "The winter season is coming. Build a team of three and chase the crown.",
    description:
      "After a sold-out Season 1, the Triple Threat League returns this winter.\n\nTeams of three battle through a pool stage into knockouts. Every match counts and only one team takes the crown.",
    categories: ["Team of 3 (mixed skill)"],
    schedule: [
      { time: "TBA", item: "Registrations open" },
      { time: "TBA", item: "Pool draw announced" },
      { time: "20 Dec", item: "Match day: pools, knockouts and final" }
    ],
    rules: [
      "Each team has 3 registered players",
      "Pool matches are played to 11 points, win by 2",
      "Knockouts are played to 15 points, win by 2"
    ],
    images: [],
    videos: []
  },
  {
    id: "pickle-ai-league-2026",
    name: "Pickle.ai League",
    series: "Pickle.ai League",
    status: "completed",
    startDate: "2026-10-11",
    venue: "Noida",
    city: "Noida",
    format: "Age-group doubles",
    summary: "Compete with your age group. Build your team. Own the court. Chase the crown.",
    description:
      "One League. One Crown. One Champion.\n\nThe Pickle.ai League brought together players across age groups for a full day of competitive doubles. No friends on the court, only competitors.",
    categories: ["Split 90+", "Men's 40+ Doubles", "Men's 30+ Doubles", "Men's Open Doubles"],
    results: [
      { category: "Split 90+", winner: "Rohit Verma & Vinay Maheshwari", runnerUp: "Sachin Pehwa & Amit Saxena" },
      { category: "Men's 40+ Doubles", winner: "Apoorv Vats & Pritam Sharma", runnerUp: "Amit Saxena & Sachin Pehwa" },
      { category: "Men's 30+ Doubles", winner: "Apoorv Vats & Pritam Sharma", runnerUp: "Gourav Soni & Rakesh Gupta" },
      { category: "Men's Open Doubles", winner: "Apoorv Vats & Piyush Walia", runnerUp: "Anmol Jain & Jaideep Singh" }
    ],
    images: [],
    videos: []
  },
  {
    id: "dupr-night-pickleplay-aug-2026",
    name: "DUPR Night @ Pickle Play",
    series: "DUPR Nights",
    status: "completed",
    startDate: "2026-08-08",
    time: "Evening",
    venue: "Pickle Play",
    city: "Noida, Sector 121",
    format: "Indoor DUPR-rated matches",
    prizePool: "₹40,000 cash prizes + vouchers",
    summary: "An indoor DUPR-rated tournament night with ₹40,000 in cash prizes and vouchers.",
    description:
      "DUPR Nights are evening events where every match counts towards your DUPR rating.\n\nPlay rated games, meet the community and compete for cash prizes and vouchers.",
    categories: ["DUPR-rated Doubles"],
    stats: [{ label: "Prize pool", value: "₹40K" }],
    images: [],
    videos: []
  },
  {
    id: "triple-threat-league-s1",
    name: "Triple Threat League — Season 1",
    series: "Triple Threat League",
    status: "completed",
    startDate: "2026-06-14",
    time: "Evening",
    venue: "AfterrMatch",
    city: "Greater Noida",
    format: "Teams of 3 · 3 pools + knockouts",
    summary: "12 teams. 3 pools. 36 warriors. About 70 matches. One crown.",
    description:
      "The first edition of the Triple Threat League, organised by Pickle.ai, brought together players from Noida, Delhi, Faridabad and across NCR.\n\nPlayers loved the team format, the level of competition and the atmosphere. Season 1 was just the beginning.",
    stats: [
      { label: "Teams", value: "12" },
      { label: "Pools", value: "3" },
      { label: "Players", value: "36" },
      { label: "Matches", value: "~70" }
    ],
    results: [
      {
        category: "Team Championship",
        winner: "Aman, Ritwik & Ankit (Faridabad)",
        runnerUp: "Siddharth & Team (Noida)",
        third: "Anmol Malik & Team (Noida), Pritam & Team (Pitampura)"
      }
    ],
    partners: ["Courtly (Platform Partner)", "AfterrMatch (Event Partner & Venue)"],
    images: [],
    videos: []
  },
  {
    id: "up-state-championship-2023",
    name: "1st UP State Pickleball Championship",
    series: "State Championship",
    status: "completed",
    startDate: "2023-11-05",
    time: "7:30 AM onwards",
    venue: "Raghav Global School",
    city: "Noida",
    format: "Open state-level championship",
    summary: "The first state-level pickleball championship in Uttar Pradesh, with 200+ registrations.",
    description:
      "Organised by the Uttar Pradesh Pickleball Association, the 1st UP State Pickleball Tournament drew more than 200 player registrations.\n\nPickleball in Noida started with residents of Prateek Laurel, Sector 120, where 30–40 players formed the Challengers Club. Bootcamps followed at Prateek, Amrapali Zodiac and Cleo County. An MOU with NOFAA then brought the game to 90+ high-rise societies.\n\nThe mission: build 1000+ skilled pickleball players across the state.",
    stats: [{ label: "Registrations", value: "200+" }],
    partners: ["SL", "Apartment Times", "DVonk", "FirstVista", "Mr Bhature", "S R College", "Franklin", "Prakash Hospital"],
    images: [],
    videos: []
  }
];
