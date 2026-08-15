const DELIMITER = ",";

const NEWLINE = "\n";

const NEEDS_QUOTES = /[",\r\n]/;

const BOM = "﻿";

function escapeValue(value: string) {
  return NEEDS_QUOTES.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

export function toCsv(columns: string[], rows: Record<string, string>[]): string {
  const lines = [columns.map(escapeValue).join(DELIMITER)];

  for (const row of rows) {
    lines.push(columns.map((column) => escapeValue(row[column] ?? "")).join(DELIMITER));
  }

  return `${lines.join(NEWLINE)}${NEWLINE}`;
}

function parseCells(content: string): string[][] {
  const table: string[][] = [];

  let cells: string[] = [];
  let value = "";
  let quoted = false;

  const endCell = () => {
    cells.push(value);
    value = "";
  };

  const endRow = () => {
    endCell();
    table.push(cells);
    cells = [];
  };

  for (let index = 0; index < content.length; index++) {
    const char = content[index];

    if (quoted) {
      if (char !== '"') {
        value += char;
        continue;
      }

      if (content[index + 1] === '"') {
        value += '"';
        index++;
        continue;
      }

      quoted = false;
      continue;
    }

    if (char === '"' && value === "") {
      quoted = true;
      continue;
    }

    if (char === DELIMITER) {
      endCell();
      continue;
    }

    if (char === "\r") continue;

    if (char === NEWLINE) {
      endRow();
      continue;
    }

    value += char;
  }

  if (value !== "" || cells.length > 0) endRow();

  return table;
}

export function fromCsv(content: string): Record<string, string>[] {
  const [header, ...rows] = parseCells(content.startsWith(BOM) ? content.slice(BOM.length) : content);

  if (!header) return [];

  return rows
    .filter((cells) => cells.some((cell) => cell.trim() !== ""))
    .map((cells) => Object.fromEntries(header.map((column, index) => [column.trim(), cells[index] ?? ""])));
}
