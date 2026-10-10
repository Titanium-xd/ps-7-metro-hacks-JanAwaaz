import { StationReference } from '../types';

export const GMRC_STATIONS: StationReference[] = [
  { id: 'STN-01', name: 'Koteshwar Road', type: 'Elevated', corridor: 'Phase-II North' },
  { id: 'STN-02', name: 'Vishwakarma College', type: 'Elevated', corridor: 'Phase-II North' },
  { id: 'STN-03', name: 'Tapovan Circle', type: 'Elevated', corridor: 'Phase-II North' },
  { id: 'STN-04', name: 'Narmada Canal', type: 'Elevated', corridor: 'Phase-II North' },
  { id: 'STN-05', name: 'Koba Circle', type: 'Elevated', corridor: 'Phase-II North' },
  { id: 'STN-06', name: 'Juna Koba', type: 'Elevated', corridor: 'Phase-II North' },
  { id: 'STN-07', name: 'Koba Gam', type: 'Elevated', corridor: 'Phase-II North' },
  { id: 'STN-08', name: 'GNLU', type: 'Elevated', corridor: 'Phase-II Branch' },
  { id: 'STN-09', name: 'Raysan', type: 'Elevated', corridor: 'Phase-II Gandhinagar' },
  { id: 'STN-10', name: 'Randesan', type: 'Elevated', corridor: 'Phase-II Gandhinagar' },
  { id: 'STN-11', name: 'Dholakuva Circle', type: 'Elevated', corridor: 'Phase-II Gandhinagar' },
  { id: 'STN-12', name: 'Infocity', type: 'Elevated', corridor: 'Phase-II Gandhinagar' },
  { id: 'STN-13', name: 'Sector-1', type: 'Elevated', corridor: 'Phase-II Gandhinagar' },
  { id: 'STN-14', name: 'Sector-10A', type: 'Elevated', corridor: 'Phase-II Gandhinagar' },
  { id: 'STN-15', name: 'Sachivalaya', type: 'Elevated', corridor: 'Phase-II Gandhinagar' },
  { id: 'STN-16', name: 'PDEU', type: 'Elevated', corridor: 'Phase-II Branch' },
  { id: 'STN-17', name: 'GIFT City', type: 'Elevated', corridor: 'Phase-II Branch' },
  { id: 'STN-18', name: 'Akshardham', type: 'Elevated', corridor: 'Phase-II Gandhinagar' },
  { id: 'STN-19', name: 'Juna Sachivalaya', type: 'Elevated', corridor: 'Phase-II Gandhinagar' },
  { id: 'STN-20', name: 'Sector-16', type: 'Elevated', corridor: 'Phase-II Gandhinagar' },
  { id: 'STN-21', name: 'Sector-24', type: 'Elevated', corridor: 'Phase-II Gandhinagar' },
  { id: 'STN-22', name: 'Mahatma Mandir', type: 'Elevated', corridor: 'Phase-II Gandhinagar' }
];

export const GMRC_STATION_NAMES: string[] = GMRC_STATIONS.map(s => s.name);
