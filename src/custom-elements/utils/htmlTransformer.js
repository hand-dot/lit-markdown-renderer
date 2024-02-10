import { LitElement, html } from 'lit';

/**
 * @callback TransformFunction
 * @param {HTMLElement} element
 * @returns {HTMLElement|null}

 * @typedef {Object} TransformationObject
 * @property {string} selector
 * @property {TransformFunction} transform
 */
/**
 * @type {TransformationObject}
 */
const mp4Transformer = {
  selector: 'a',
  transform: (link) => {
    if (!link.href.includes('.mp4')) return null;
    const video = document.createElement('video');
    video.setAttribute('controls', '');
    video.setAttribute('width', '100%');
    video.setAttribute('preload', 'none');

    const source = document.createElement('source');
    source.setAttribute('src', link.href);
    source.setAttribute('type', 'video/mp4');
    video.appendChild(source);

    return video;
  },
};

/**
 * @type {TransformationObject}
 */
const youtubeTransformer = {
  selector: 'a[href*="youtube.com/watch"], a[href*="youtu.be/"]',
  transform: (link) => {
    const youtubeRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\/\?]+)/;
    const match = link.href.match(youtubeRegex);
    if (!match) return null;

    const videoId = match[1];
    const iframe = document.createElement('iframe');
    iframe.setAttribute('width', '100%');
    iframe.setAttribute('height', '100%');
    iframe.setAttribute(
      'src',
      `https://www.youtube.com/embed/${videoId}?si=oIQK2xOxkcOkIXsl`
    );
    iframe.setAttribute('title', 'YouTube video player');
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute(
      'allow',
      'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
    );
    iframe.setAttribute('allowfullscreen', '');
    iframe.setAttribute('loading', 'lazy');

    const div = document.createElement('div');
    div.setAttribute('class', 'responsive-iframe-container');
    div.appendChild(iframe);

    return div;
  },
};

/**
 * @type {TransformationObject}
 */
const imgTransformer = {
  selector: 'img',
  transform: (img) => {
    img.setAttribute('loading', 'lazy');
    return img; // Direct manipulation, no replacement needed
  },
};

/**
 * @type {TransformationObject}
 */
const twitterTransformer = {
  selector: 'a[href*="twitter.com/"]',
  transform: (link) => {
    const match = link.href.match(/twitter\.com\/(?:#!\/)?\w+\/status(?:es)?\/(\d+)/);
    if (!match) return null;
    const tweetId = match[1];
    const twitterEmbed = document.createElement('twitter-embed-lit');
    twitterEmbed.setAttribute('tweet-id', tweetId);

    return twitterEmbed;
  },
};

/**
 * @type {TransformationObject[]}
 */
const transformations = [
  mp4Transformer,
  youtubeTransformer,
  imgTransformer,
  twitterTransformer,
];

// ----------------------------

export const applyAll = (html) => {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  for (const transformation of transformations) {
    const { selector, transform } = transformation;
    const elements = doc.querySelectorAll(selector);
    for (const element of elements) {
      const newElement = transform(element);
      if (newElement) {
        element.parentNode.replaceChild(newElement, element);
      }
    }
  }
  return doc.body.innerHTML;
};


class TwitterEmbedLit extends LitElement {
  static get tag() {
    return "twitter-embed-lit";
  }
  constructor() {
    super();
    this.tweetId = null;
  }
  static get properties() {
    return {
      tweetId: {
        type: String,
        attribute: "tweet-id"
      },
    };
  }
  render() {
    return html`
      <div
        class="twitter-tweet twitter-tweet-rendered"
        style="display: flex; max-width: 550px; width: 100%; margin-top: 10px; margin-bottom: 10px;"
      >
        <iframe
          sandbox="allow-same-origin allow-scripts"
          scrolling="no"
          frameborder="0"
          loading="lazy"
          allowtransparency="true"
          allowfullscreen
          style="position: static; visibility: visible; height: 498px; display: block; flex-grow: 1;"
          title="Twitter Tweet"
          src="https://platform.twitter.com/embed/index.html?dnt=true&amp;frame=false&amp;hideCard=false&amp;hideThread=false&amp;id=${this
        .tweetId}"
          data-tweet-id="${this.tweetId}"
        >
        </iframe>
      </div>
    `;
  }
}

customElements.define(TwitterEmbedLit.tag, TwitterEmbedLit);
