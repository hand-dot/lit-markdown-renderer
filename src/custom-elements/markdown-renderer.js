import { LitElement, html, unsafeCSS } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { marked } from 'marked';
import { style } from '../style4markdownRenderer.js';
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

  loadExternalScript(src) {
    return new Promise((resolve, reject) => {
      // すでに同じスクリプトがロードされているか確認
      if (document.querySelector(`script[src="${src}"]`)) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.onload = () => resolve(script); // スクリプトのロード完了
      script.onerror = () => reject(new Error(`Failed to load the script: ${src}`)); // スクリプトのロード失敗

      document.head.appendChild(script);
    });
  }

  connectedCallback() {
    super.connectedCallback();
    this.loadExternalScript('https://platform.twitter.com/widgets.js')
      .then(async (e) => {
        console.log(e)
        console.log('window.twttr.widgets', window.twttr.widgets)
        const tweets = this.renderRoot.querySelectorAll('.twitter-tweet');
        for (const tweet of tweets) {
          console.log('window.twttr.widgets', window.twttr.widgets)
          console.log('tweet', tweet)
          const t = await window.twttr.widgets.createTweet(tweet.id, tweet);
          console.log('t', t)

        }
      })
      .catch(error => console.error(error));
  }

  disconnectedCallback() {
    super.disconnectedCallback();
  }

  async updated(changedProperties) {
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
