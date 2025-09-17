import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { renderItalicsToHtml } from '../markup.js';

describe('renderItalicsToHtml', () => {
    it('renders [i]...[/i] markup', () => {
        assert.equal(
            renderItalicsToHtml('Это [i]важно[/i]!'),
            'Это <em>важно</em>!'
        );
    });

    it('renders asterisks with escaping support', () => {
        assert.equal(
            renderItalicsToHtml('Символы \\*звёздочки\\* и *курсив*'),
            'Символы *звёздочки* и <em>курсив</em>'
        );
    });

    it('renders underscores and escapes html', () => {
        assert.equal(
            renderItalicsToHtml('Тег <b> и _курсив_ и \\_подчёркивание_'),
            'Тег &lt;b&gt; и <em>курсив</em> и _подчёркивание_'
        );
    });
});
