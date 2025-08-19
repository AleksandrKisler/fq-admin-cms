export function escapeHtml(str = '') {
    return str
        .replaceAll(/&/g, '&amp;')
        .replaceAll(/</g, '&lt;')
        .replaceAll(/>/g, '&gt;')
        .replaceAll(/"/g, '&quot;')
        .replaceAll(/'/g, '&#39;');
}

export function renderItalicsToHtml(input = '') {
    if (!input) return '';
    let s = escapeHtml(input);

    s = s.replace(/\[i\](.+?)\[\/i\]/gis, '<em>$1</em>');

    s = s
        .replace(/\\\*/g, '&#42;')
        .replace(/(^|[^\\])\*(.+?)\*/gs, '$1<em>$2</em>')
        .replace(/&#42;/g, '*');

    s = s
        .replace(/\\_/g, '&#95;')
        .replace(/(^|[^\\])_(.+?)_/gs, '$1<em>$2</em>')
        .replace(/&#95;/g, '_');

    return s;
}
