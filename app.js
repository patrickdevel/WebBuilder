let selectedElement = null;

// Initial-Events für bereits existierende Elemente verknüpfen
document.querySelectorAll('#canvas *').forEach(el => attachEvents(el));

function attachEvents(el) {
    // Verhindert, dass Klicks auf Spalten/Grids abfärben
    el.addEventListener('click', (e) => {
        if (el.classList.contains('web-col') || el.classList.contains('web-grid')) return;
        e.stopPropagation();
        
        // Altes Element deselektieren
        if (selectedElement) selectedElement.classList.remove('selected-element');
        
        // Neues Element auswählen
        selectedElement = el;
        selectedElement.classList.add('selected-element');
        
        // Inspector öffnen & Werte laden
        document.getElementById('inspector').style.display = 'flex';
        document.getElementById('inspectMargin').value = parseInt(window.getComputedStyle(el).marginBottom) || 0;
    });

    // Rechtsklick zum Löschen
    el.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (selectedElement === el) {
            document.getElementById('inspector').style.display = 'none';
            selectedElement = null;
        }
        el.remove();
    });
}

// Komponente hinzufügen (Prüft, ob Spalte ausgewählt ist)
function addComponent(tag, className, defaultText) {
    const el = document.createElement(tag);
    el.className = className;
    el.innerText = defaultText;
    el.contentEditable = "true";
    attachEvents(el);

    // Wenn eine leere Spalte existiert, schieben wir es da rein, ansonsten ans Ende des Canvas
    const activeCol = document.querySelector('.web-col:hover') || document.querySelector('.web-col');
    if (activeCol) {
        activeCol.appendChild(el);
    } else {
        document.getElementById('canvas').appendChild(el);
    }
}

// Spalten-Grid hinzufügen
function addGrid(columns) {
    const grid = document.createElement('div');
    grid.className = `web-grid grid-${columns}`;
    
    for (let i = 0; i < columns; i++) {
        const col = document.createElement('div');
        col.className = 'web-col';
        grid.appendChild(col);
    }
    
    // Rechtsklick löscht das ganze Grid
    grid.addEventListener('contextmenu', (e) => { e.preventDefault(); grid.remove(); });
    document.getElementById('canvas').appendChild(grid);
}

// Inspector-Änderungen anwenden
function adjustSelectedElement(property, value) {
    if (selectedElement) {
        selectedElement.style[property] = value;
    }
}

function updateTheme() {
    const theme = document.getElementById('themeSelect').value;
    document.getElementById('canvas').className = theme;
}

// EXPORT-FUNKTION
function cleanExport() {
    const theme = document.getElementById('themeSelect').value;
    const canvasClone = document.getElementById('canvas').cloneNode(true);
    
    // Aufräumarbeiten vor dem Speichern
    canvasClone.querySelectorAll('*').forEach(el => {
        el.removeAttribute('contenteditable');
        el.classList.remove('selected-element');
        
        // Wir entfernen die gestrichelten Hilfsrahmen der Spalten für die echte Website
        if (el.classList.contains('web-grid')) el.style.border = 'none';
        if (el.classList.contains('web-col')) el.style.border = 'none';
    });

    const cleanHTML = canvasClone.innerHTML;

    const exportCode = `<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Meine veröffentlichte Webseite</title>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap">
    <style>
        body { margin: 0; padding: 60px 20px; font-family: 'Inter', sans-serif; display: flex; justify-content: center; transition: background 0.3s; }
        .wrapper { width: 100%; max-width: 940px; }
        /* Hier laden wir die Styles direkt, damit die exportierte index.html eine Standalone-Datei bleibt */
    </style>
    <link rel="stylesheet" href="style.css"> 
</head>
<body class="${theme}" style="display:block; height: auto; overflow: visible; padding: 80px 20px;">
    <div class="wrapper">
        ${cleanHTML}
    </div>
</body>
</html>`;

    const blob = new Blob([exportCode], { type: 'text/html' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'index.html';
    link.click();
}
