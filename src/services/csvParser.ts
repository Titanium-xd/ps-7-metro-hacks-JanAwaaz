import { Complaint, ComplaintSource, ParsedBatchRow } from '../types';
import { classifyComplaint } from './classifier';
import { calculateUrgency } from './urgency';

/**
 * Robust CSV Line Parser supporting quotes, escaped quotes, and commas.
 */
export function parseCSVLines(csvContent: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let insideQuotes = false;

  const text = csvContent.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        currentField += '"';
        i++; // skip escaped quote
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      currentRow.push(currentField.trim());
      currentField = '';
    } else if (char === '\n' && !insideQuotes) {
      currentRow.push(currentField.trim());
      // Only push non-empty rows
      if (currentRow.some(col => col.length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentField = '';
    } else {
      currentField += char;
    }
  }

  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    if (currentRow.some(col => col.length > 0)) {
      rows.push(currentRow);
    }
  }

  return rows;
}

/**
 * Parses batch CSV or text string into a list of preview rows with pre-computed classifications.
 */
export function parseBatchInput(
  rawInput: string,
  existingComplaints: Complaint[] = []
): ParsedBatchRow[] {
  if (!rawInput.trim()) return [];

  const lines = parseCSVLines(rawInput);
  if (lines.length === 0) return [];

  // Check if first row is header
  const firstRow = lines[0].map(c => c.toLowerCase());
  const hasHeader = firstRow.some(col => 
    col.includes('text') || col.includes('feedback') || col.includes('complaint') || 
    col.includes('station') || col.includes('category') || col.includes('source')
  );

  let textIdx = 0;
  let stationIdx = -1;
  let sourceIdx = -1;
  let refIdx = -1;

  let dataRows: string[][] = [];

  if (hasHeader) {
    firstRow.forEach((col, idx) => {
      if (col.includes('text') || col.includes('feedback') || col.includes('complaint') || col.includes('grievance') || col.includes('desc')) {
        textIdx = idx;
      } else if (col.includes('station')) {
        stationIdx = idx;
      } else if (col.includes('source') || col.includes('channel')) {
        sourceIdx = idx;
      } else if (col.includes('id') || col.includes('ref')) {
        refIdx = idx;
      }
    });
    dataRows = lines.slice(1);
  } else {
    // If no header, if 1 column => text; if multiple, treat col 0 as text or id
    dataRows = lines;
  }

  const results: ParsedBatchRow[] = [];

  dataRows.forEach((row, index) => {
    const rawText = row[textIdx]?.trim() || (row.length === 1 ? row[0]?.trim() : '');
    const station = stationIdx >= 0 && row[stationIdx] ? row[stationIdx].trim() : 'General';
    const refId = refIdx >= 0 && row[refIdx] ? row[refIdx].trim() : undefined;
    
    let source: ComplaintSource = 'App';
    if (sourceIdx >= 0 && row[sourceIdx]) {
      const srcVal = row[sourceIdx].toLowerCase();
      if (srcVal.includes('email')) source = 'Email';
      else if (srcVal.includes('social') || srcVal.includes('twitter') || srcVal.includes('x')) source = 'Social Media';
      else if (srcVal.includes('paper') || srcVal.includes('form')) source = 'Paper Form';
      else if (srcVal.includes('app')) source = 'App';
      else source = 'Other';
    }

    if (!rawText) {
      results.push({
        rowNumber: index + 1,
        rawText: '',
        station,
        source,
        referenceId: refId,
        detectedLanguage: 'Unknown',
        predictedDepartment: 'Other / Needs Review',
        urgencyScore: 10,
        urgencyTier: 'ROUTINE',
        urgencyReasons: ['Empty row'],
        isValid: false,
        error: 'Complaint text is empty',
        selectedForImport: false
      });
      return;
    }

    const classification = classifyComplaint(rawText);
    const urgency = calculateUrgency(rawText, classification.department, station, existingComplaints);

    results.push({
      rowNumber: index + 1,
      rawText,
      station,
      source,
      referenceId: refId,
      detectedLanguage: classification.detectedLanguage,
      predictedDepartment: classification.department,
      urgencyScore: urgency.score,
      urgencyTier: urgency.tier,
      urgencyReasons: urgency.reasons,
      isValid: true,
      selectedForImport: true
    });
  });

  return results;
}

/**
 * Converts complaints array to standard CSV string.
 */
export function exportComplaintsToCSV(complaints: Complaint[]): string {
  const headers = [
    'ID',
    'Reference_ID',
    'Source',
    'Station',
    'Date_Time',
    'Detected_Language',
    'Department',
    'Urgency_Score',
    'Urgency_Tier',
    'Status',
    'Urgency_Reasons',
    'Raw_Complaint_Text',
    'Draft_Reply',
    'Sync_Status'
  ];

  const rows = complaints.map(c => [
    c.id,
    c.referenceId || '',
    c.source,
    c.station,
    c.dateTime,
    c.detectedLanguage,
    c.department,
    c.urgencyScore.toString(),
    c.urgencyTier,
    c.status,
    `"${c.urgencyReasons.join('; ').replace(/"/g, '""')}"`,
    `"${c.rawText.replace(/"/g, '""')}"`,
    `"${(c.draftReply?.text || '').replace(/"/g, '""')}"`,
    c.syncStatus
  ]);

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}
