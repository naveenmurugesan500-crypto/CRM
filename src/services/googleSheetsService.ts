import { MetaLead, GoogleSheetConfig } from '../types/crm';
import { MetaStorageService } from './storage';

export interface SheetParseResult {
  leads: MetaLead[];
  headers: string[];
  totalRows: number;
}

export interface SheetConnectionTestResult {
  success: boolean;
  message: string;
  sheetId?: string;
  gid?: string;
  totalRows?: number;
  headers?: string[];
  sampleLeads?: MetaLead[];
}

export const DEFAULT_GOOGLE_SHEET_CONFIG: GoogleSheetConfig = {
  sheetUrl: '',
  sheetId: '',
  gid: '0',
  sheetName: '',
  autoSync: true,
  syncInterval: 2, // Default every 2 minutes
  isConnected: false,
  lastSyncStatus: 'idle',
  totalSyncedCount: 0,
  newLeadsFound: 0,
  lastFetchedRows: 0,
};

export class GoogleSheetsService {
  /**
   * Extracts Google Spreadsheet ID and GID from any Google Sheet URL:
   * Handles:
   * - Edit links: https://docs.google.com/spreadsheets/d/{ID}/edit#gid=0
   * - Share links: https://docs.google.com/spreadsheets/d/{ID}/view?usp=sharing
   * - Published to web links: https://docs.google.com/spreadsheets/d/e/{ID}/pubhtml or pub?output=csv
   * - Direct Gviz links: https://docs.google.com/spreadsheets/d/{ID}/gviz/tq?tqx=out:csv
   */
  static parseSheetUrl(url: string): { sheetId: string; gid: string; isPublished: boolean; isValid: boolean } {
    if (!url || typeof url !== 'string') {
      return { sheetId: '', gid: '0', isPublished: false, isValid: false };
    }

    const trimmed = url.trim();

    // Check for published web link (2PACX-... format)
    const pubMatch = trimmed.match(/\/spreadsheets\/d\/e\/([a-zA-Z0-9-_]+)/);
    if (pubMatch && pubMatch[1]) {
      const gidMatch = trimmed.match(/[?&#]gid=([0-9]+)/);
      return {
        sheetId: pubMatch[1],
        gid: gidMatch ? gidMatch[1] : '0',
        isPublished: true,
        isValid: true,
      };
    }

    // Standard spreadsheet ID
    const standardMatch = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (standardMatch && standardMatch[1]) {
      const gidMatch = trimmed.match(/[?&#]gid=([0-9]+)/);
      return {
        sheetId: standardMatch[1],
        gid: gidMatch ? gidMatch[1] : '0',
        isPublished: false,
        isValid: true,
      };
    }

    // Plain ID entered directly
    if (/^[a-zA-Z0-9-_]{20,}$/.test(trimmed)) {
      return {
        sheetId: trimmed,
        gid: '0',
        isPublished: false,
        isValid: true,
      };
    }

    return { sheetId: '', gid: '0', isPublished: false, isValid: false };
  }

  /**
   * Generates URLs to fetch CSV directly from Google Sheets
   */
  static getCsvEndpoints(sheetUrl: string, customGid?: string, sheetName?: string): string[] {
    const { sheetId, gid: parsedGid, isPublished, isValid } = this.parseSheetUrl(sheetUrl);
    if (!isValid || !sheetId) return [];

    const gid = customGid || parsedGid || '0';
    const endpoints: string[] = [];

    if (isPublished) {
      // Published web app format
      endpoints.push(`https://docs.google.com/spreadsheets/d/e/${sheetId}/pub?output=csv${gid ? `&gid=${gid}` : ''}`);
    } else {
      // 1. Google Visualization API (Most reliable for CORS & formatting)
      let gvizUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&gid=${gid}`;
      if (sheetName && sheetName.trim()) {
        gvizUrl += `&sheet=${encodeURIComponent(sheetName.trim())}`;
      }
      endpoints.push(gvizUrl);

      // 2. Standard Google Drive CSV Export
      endpoints.push(`https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`);

      // 3. Alternate public csv output
      endpoints.push(`https://docs.google.com/spreadsheets/d/${sheetId}/pub?output=csv&gid=${gid}`);
    }

    return endpoints;
  }

  /**
   * Fetches the raw CSV content from Google Sheets
   */
  static async fetchSheetCsv(sheetUrl: string, gid?: string, sheetName?: string): Promise<string> {
    const endpoints = this.getCsvEndpoints(sheetUrl, gid, sheetName);
    if (endpoints.length === 0) {
      throw new Error('Invalid Google Sheet URL. Please ensure you have copied the full Google Sheet address.');
    }

    let lastError: Error | null = null;

    for (const url of endpoints) {
      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'text/csv, text/plain, */*',
          },
          // Cache busting to guarantee fresh leads
          cache: 'no-store',
        });

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            throw new Error('Google Sheet is restricted. Please change General Access to "Anyone with the link can view" or choose File > Share > Publish to web.');
          }
          throw new Error(`Google Sheets responded with HTTP status ${response.status}`);
        }

        const text = await response.text();

        // Check if Google returned an HTML login redirect page instead of CSV
        if (text.includes('<!DOCTYPE html>') || text.includes('accounts.google.com') || text.includes('<html')) {
          throw new Error('Google Sheet is private. Set sheet sharing to "Anyone with the link can view" (Viewer) in Google Sheets.');
        }

        // Check if there is actual CSV content
        if (!text || text.trim().length === 0) {
          throw new Error('The Google Sheet returned empty data.');
        }

        return text;
      } catch (err: any) {
        lastError = err;
        // Continue to next fallback endpoint if available
      }
    }

    throw lastError || new Error('Could not fetch data from Google Sheet. Please check the link and permissions.');
  }

  /**
   * Tests the connection and parses a preview of the leads
   */
  static async testConnection(sheetUrl: string, gid?: string, sheetName?: string): Promise<SheetConnectionTestResult> {
    try {
      const { sheetId, gid: parsedGid, isValid } = this.parseSheetUrl(sheetUrl);
      if (!isValid || !sheetId) {
        return {
          success: false,
          message: 'Invalid Google Sheet URL. Please paste a valid docs.google.com/spreadsheets link.',
        };
      }

      const activeGid = gid || parsedGid || '0';
      const rawCsv = await this.fetchSheetCsv(sheetUrl, activeGid, sheetName);
      const leads = MetaStorageService.parseMetaAdsCSV(rawCsv);

      // Extract raw header columns for diagnosis
      const firstLine = rawCsv.split(/\r?\n/)[0] || '';
      const headers = firstLine.split(',').map(h => h.replace(/^["']|["']$/g, '').trim()).filter(Boolean);

      return {
        success: true,
        message: `Successfully connected! Detected ${leads.length} leads across ${headers.length} columns in your Google Sheet.`,
        sheetId,
        gid: activeGid,
        totalRows: leads.length,
        headers,
        sampleLeads: leads.slice(0, 3),
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Failed to connect to Google Sheet. Check permissions and URL.',
      };
    }
  }

  /**
   * Fetches latest leads and synchronizes into Untouched Leads
   */
  static async fetchLatestLeads(config: GoogleSheetConfig): Promise<{ leads: MetaLead[]; totalRows: number }> {
    if (!config.sheetUrl) {
      return { leads: [], totalRows: 0 };
    }

    const rawCsv = await this.fetchSheetCsv(config.sheetUrl, config.gid, config.sheetName);
    const parsedLeads = MetaStorageService.parseMetaAdsCSV(rawCsv);

    return {
      leads: parsedLeads,
      totalRows: parsedLeads.length,
    };
  }

  /**
   * Google Apps Script code generator for real-time webhook push
   * (Optional advanced option for users who want row-level triggers)
   */
  static generateAppsScriptTemplate(sheetName: string = 'Sheet1'): string {
    return `// ==========================================
// Meta Lead Ads Google Sheet -> CRM Webhook Push
// Paste into: Extensions > Apps Script in your Google Sheet
// ==========================================

function onFormSubmitOrEdit(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("${sheetName || 'Sheet1'}");
  if (!sheet) return;
  
  var lastRow = sheet.getLastRow();
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var lastRowValues = sheet.getRange(lastRow, 1, 1, sheet.getLastColumn()).getValues()[0];
  
  var leadData = {};
  for (var i = 0; i < headers.length; i++) {
    leadData[headers[i]] = lastRowValues[i];
  }
  
  Logger.log("New Meta lead captured: " + JSON.stringify(leadData));
}

// Create an installable trigger:
// Triggers (Clock icon) > Add Trigger > onFormSubmitOrEdit > From spreadsheet > On form submit (or On change)
`;
  }
}
