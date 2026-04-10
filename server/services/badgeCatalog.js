/**
 * Badge Catalog — static definitions for all 9 volunteer reputation badges.
 * Each svgPath is the inner content of an SVG with viewBox="0 0 32 32".
 * No outer <svg> tag — just path/shape elements for use in a <defs> sprite.
 */

const BADGES = [
  {
    id: 'first_step',
    name: 'First Step',
    icon: '🎖️',
    description: 'Awarded for completing your first volunteer event.',
    criterionLabel: 'Complete 1 event',
    svgPath: `<path fill="#026670" d="M14 6c0-2.21 1.79-4 4-4s4 1.79 4 4-1.79 4-4 4-4-1.79-4-4zm-4 14c0-2.21 1.79-4 4-4s4 1.79 4 4-1.79 4-4 4-4-1.79-4-4zm10 2c0 1.1-.9 2-2 2H8c-1.1 0-2-.9-2-2v-1c0-2.76 2.24-5 5-5h2c.34 0 .67.04 1 .1V14c0-2.76 2.24-5 5-5h1c1.1 0 2 .9 2 2v1c0 2.76-2.24 5-5 5h-.1c.06.33.1.66.1 1v1z"/>`,
  },
  {
    id: 'team_player',
    name: 'Team Player',
    icon: '🤝',
    description: 'Awarded for completing 5 volunteer events.',
    criterionLabel: 'Complete 5 events',
    svgPath: `<circle cx="16" cy="8" r="4" fill="#439093"/>
<circle cx="7" cy="13" r="3.5" fill="#439093"/>
<circle cx="25" cy="13" r="3.5" fill="#439093"/>
<path fill="#026670" d="M10 22c0-3.31 2.69-6 6-6s6 2.69 6 6v2H10v-2z"/>
<path fill="#439093" d="M2 26c0-2.76 2.24-5 5-5h1.5c-.32.9-.5 1.93-.5 3v2H2v-2zm18.5-2c0-1.07-.18-2.1-.5-3H21c2.76 0 5 2.24 5 5v2h-7.5v-2z" opacity="0.8"/>`,
  },
  {
    id: 'dedicated',
    name: 'Dedicated',
    icon: '🛡️',
    description: 'Awarded for completing 10 volunteer events.',
    criterionLabel: 'Complete 10 events',
    svgPath: `<path fill="#026670" d="M16 2L4 7v9c0 6.08 5.14 11.74 12 13 6.86-1.26 12-6.92 12-13V7L16 2z"/>
<path fill="#EDEAE5" d="M13 18.5l-4-4 1.41-1.41L13 15.67l8.59-8.59L23 8.5l-10 10z"/>`,
  },
  {
    id: 'centurion',
    name: 'Centurion',
    icon: '⚔️',
    description: 'Awarded for reaching 100 XP.',
    criterionLabel: 'Reach 100 XP',
    svgPath: `<path fill="#D6843C" d="M16 2c-1.5 0-3 .5-4 1.5L9 6H7c-1.1 0-2 .9-2 2v2c0 3.5 2 6.5 5 8.2V20h8v-1.8c3-1.7 5-4.7 5-8.2V8c0-1.1-.9-2-2-2h-2l-3-2.5C15.5 2.2 15.75 2 16 2z"/>
<path fill="#026670" d="M10 8h12v2c0 3.31-2.69 6-6 6s-6-2.69-6-6V8z"/>
<rect fill="#D6843C" x="11" y="20" width="10" height="2" rx="1"/>
<rect fill="#D6843C" x="9" y="22" width="14" height="2" rx="1"/>
<path fill="#EDEAE5" d="M13 11l1.5 3 3-4.5" stroke="#EDEAE5" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
  },
  {
    id: 'rising_star',
    name: 'Rising Star',
    icon: '⭐',
    description: 'Awarded for reaching 300 XP.',
    criterionLabel: 'Reach 300 XP',
    svgPath: `<polygon fill="#D6843C" points="16,3 19.5,12 29,12 21.5,17.5 24.5,27 16,21.5 7.5,27 10.5,17.5 3,12 12.5,12"/>
<path fill="#026670" d="M16 18v8" stroke="#026670" stroke-width="2.5" stroke-linecap="round"/>
<path fill="none" stroke="#026670" stroke-width="2" stroke-linecap="round" d="M12 22l4-4 4 4"/>`,
  },
  {
    id: 'veteran',
    name: 'Veteran',
    icon: '🏅',
    description: 'Awarded for reaching 600 XP.',
    criterionLabel: 'Reach 600 XP',
    svgPath: `<circle cx="16" cy="12" r="7" fill="#D6843C"/>
<circle cx="16" cy="12" r="5" fill="#EDEAE5"/>
<circle cx="16" cy="12" r="3" fill="#D6843C"/>
<path fill="#026670" d="M13 19l-4 9h14l-4-9H13z"/>
<path fill="#439093" d="M13 19h6l1 3H12l1-3z"/>`,
  },
  {
    id: 'top_rated',
    name: 'Top Rated',
    icon: '💎',
    description: 'Awarded for receiving 3 five-star ratings.',
    criterionLabel: 'Receive 3 five-star ratings',
    svgPath: `<path fill="#D6843C" d="M5 12h22v2c0 1.1-.9 2-2 2H7c-1.1 0-2-.9-2-2v-2z"/>
<path fill="#D6843C" d="M8 12V8c0-1.1.9-2 2-2h12c1.1 0 2 .9 2 2v4H8z"/>
<path fill="#026670" d="M10 6V4c0-1.1.9-2 2-2h8c1.1 0 2 .9 2 2v2H10z"/>
<rect fill="#D6843C" x="14" y="16" width="4" height="6" rx="1"/>
<rect fill="#026670" x="10" y="22" width="12" height="2" rx="1"/>
<polygon fill="#EDEAE5" points="16,7 17,9.5 19.5,9.5 17.5,11 18.5,13.5 16,12 13.5,13.5 14.5,11 12.5,9.5 15,9.5"/>`,
  },
  {
    id: 'consistent',
    name: 'Consistent',
    icon: '📅',
    description: 'Awarded for completing events across 3 different calendar months.',
    criterionLabel: 'Active across 3 months',
    svgPath: `<rect fill="#026670" x="3" y="5" width="26" height="22" rx="3"/>
<rect fill="#EDEAE5" x="3" y="5" width="26" height="7" rx="3"/>
<rect fill="#EDEAE5" x="3" y="9" width="26" height="3"/>
<rect fill="#026670" x="3" y="9" width="26" height="3"/>
<line x1="8" y1="5" x2="8" y2="2" stroke="#D6843C" stroke-width="2" stroke-linecap="round"/>
<line x1="24" y1="5" x2="24" y2="2" stroke="#D6843C" stroke-width="2" stroke-linecap="round"/>
<circle cx="10" cy="18" r="2.5" fill="#439093"/>
<circle cx="16" cy="18" r="2.5" fill="#439093"/>
<circle cx="22" cy="18" r="2.5" fill="#439093"/>`,
  },
  {
    id: 'legend',
    name: 'Legend',
    icon: '👑',
    description: 'Awarded for reaching 2000 XP.',
    criterionLabel: 'Reach 2000 XP',
    svgPath: `<path fill="#D6843C" d="M16 2c0 0-2 4-2 8 0 1.5.5 3 1 4-1-.5-3-2-3-5 0 0-4 4-4 9 0 5.52 4.48 10 10 10s10-4.48 10-10c0-7-6-12-6-12-1 3-2 4-3 5 .5-1 1-2.5 1-4 0-3-4-5-4-5z"/>
<path fill="#026670" d="M16 14c0 0-1 2-1 4.5 0 1 .3 2 .7 2.7-.5-.3-1.7-1.2-1.7-3.2 0 0-2 2-2 4.5 0 2.76 2.24 5 5 5s5-2.24 5-5c0-4-4-6-4-6-.5 1.5-1 2-1.5 2.5.3-.5.5-1.2.5-2 0-1.5-1-3-1-3z"/>`,
  },
];

/**
 * Returns the badge definition for the given id, or undefined if not found.
 * @param {string} id
 * @returns {object|undefined}
 */
function getBadgeById(id) {
  return BADGES.find((badge) => badge.id === id);
}

module.exports = { BADGES, getBadgeById };
