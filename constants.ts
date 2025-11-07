import { TeamMember, Stage } from './types';

export const STAGES: Stage[] = ['Applied', 'Screening', 'Interview', 'Offer', 'Hired', 'Rejected'];

export const TEAM_MEMBERS: TeamMember[] = [
  { id: 'tm1', name: 'Alice Johnson', avatar_url: 'https://picsum.photos/seed/alice/100/100' },
  { id: 'tm2', name: 'Bob Williams', avatar_url: 'https://picsum.photos/seed/bob/100/100' },
  { id: 'tm3', name: 'Charlie Brown', avatar_url: 'https://picsum.photos/seed/charlie/100/100' },
  { id: 'tm4', name: 'Diana Miller', avatar_url: 'https://picsum.photos/seed/diana/100/100' },
];

// A clean, consistent SVG icon to use as the default avatar.
export const DEFAULT_AVATAR_URL = 'data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23a1a1aa"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>';
