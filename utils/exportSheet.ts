import * as XLSXColor from 'xlsx-color';
import { Panel } from '@/utils/organize';

export const panelColors: { [key: string]: string } = {
  'C': 'fcba03', // Yellow for Commercial
  'L': '88d18a', // Green for Land
  'R': 'e3848a', // Red for Residential
  'BPP': '739deb' // Blue for BPP
};

export function exportPanelsToExcel(panels: Panel[]) {
  const ws_data: (string | number)[][] = [];

  // Header
  ws_data.push(['Name', 'Room Number', 'Panel Type']);

  panels.forEach(panel => {
    panel.members.forEach(member => {
      switch (panel.type) {
        case 'C':
          ws_data.push([member.name, panel.roomNumber, 'Commercial']);
          break;
        case 'L':
          ws_data.push([member.name, panel.roomNumber, 'Land']);
          break;
        case 'R':
          ws_data.push([member.name, panel.roomNumber, 'Residential']);
          break;
        case 'BPP':
          ws_data.push([member.name, panel.roomNumber, 'BPP']);
          break;
        default:
          ws_data.push([member.name, panel.roomNumber, 'Unknown']);
          break;
      }
    });
  });

  // Add some empty rows for separation
  ws_data.push([]);
  ws_data.push([]);

  // Append color key
  ws_data.push(['Color Key:']);
  for (let type in panelColors) {
    switch (type) {
      case 'C':
        ws_data.push(['Commercial']);
        break;
      case 'L':
        ws_data.push(['Land']);
        break;
      case 'R':
        ws_data.push(['Residential']);
        break;
      case 'BPP':
        ws_data.push(['BPP']);
        break;
      default:
        ws_data.push(['Unknown']);
        break;
    }
  }

  const spreadsheet = XLSXColor.utils.book_new();
  const sheetName = 'Panels';
  XLSXColor.utils.book_append_sheet(spreadsheet, XLSXColor.utils.aoa_to_sheet(ws_data), sheetName);

  // Apply color coding to room number cells based on panel type
  for (let i = 1; i < ws_data.length; i++) {
    let panelType = "";
    switch (ws_data[i][2]) {
      case 'Commercial':
        panelType = 'C';
        break;
      case 'Land':
        panelType = 'L';
        break;
      case 'Residential':
        panelType = 'R';
        break;
      case 'BPP':
        panelType = 'BPP';
        break;
      default:
        panelType = 'Unknown';
        break;
    }
    const cellAddress = `B${i + 1}`; // +1 because Excel is 1-indexed

    if (spreadsheet.Sheets[sheetName][cellAddress]) {
      spreadsheet.Sheets[sheetName][cellAddress].s = {
        fill: {
          patternType: "solid",
          fgColor: { rgb: panelColors[panelType] }
        }
      };
    }
  }

  // Color the cells for the color key
  let startColorKeyIndex = ws_data.length - Object.keys(panelColors).length;
  for (let type in panelColors) {
    const cellAddress = `A${startColorKeyIndex + 1}`; // +1 because Excel is 1-indexed
    if (spreadsheet.Sheets[sheetName][cellAddress]) {
      spreadsheet.Sheets[sheetName][cellAddress].s = {
        fill: {
          patternType: "solid",
          fgColor: { rgb: panelColors[type] }
        }
      };
    }
    startColorKeyIndex++;
  }

  XLSXColor.writeFile(spreadsheet, 'panels.xlsx');
}