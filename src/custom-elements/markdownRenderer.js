import { LitElement, html, unsafeCSS } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { marked } from 'marked';
import { style } from '../style4markdownRenderer';
import { applyAll } from './utils/htmlTransformer.js';
import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('typescript', typescript);

export class markdownRenderer extends LitElement {
  static properties = {
    markdown: '',
    scrollTo: '',
  };
  static styles = unsafeCSS(style);

  constructor() {
    super();
  }

  connectedCallback() {
    super.connectedCallback();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
  }

  updated(changedProperties) {
    if (changedProperties.has('markdown')) {
      const codeBlocks = this.renderRoot.querySelectorAll('pre code');
      codeBlocks.forEach((block) => {
        hljs.highlightElement(block);
      });
      const heads = this.renderRoot.querySelectorAll('h2, h3');
      heads.forEach((head, index) => {
        head.id = 'header-' + index;
      });
    }
    if (changedProperties.has('scrollTo')) {
      const [id] = this.scrollTo.split('/');
      const target = this.renderRoot.getElementById(id);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }

  render() {
    const myHtml = marked(this.markdown);
    const finalHtml = applyAll(myHtml);
    return html`<div class="markdown-body">
            ${unsafeHTML(finalHtml)}
            </div>`;
  }
}
customElements.define('markdown-renderer', markdownRenderer);
