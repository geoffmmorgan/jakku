import './swimlane.css';
import SetService from '../../services/set.service';

/** A factory for creating new Swimlanes from Sets */
class SwimlaneFactory {

    /** Creates a Swimlane as the last child of the given parent
     * @param {HTMLDivElement} parent The parent container in which to append this swimlane
     * @param {Object} set The set representing the swimlane
     * */
    create(parent, set) {
        const swimlaneContainer = document.createElement('div');
        swimlaneContainer.classList.add('swimlane', 'focus-group');
        parent.append(swimlaneContainer);

        swimlaneContainer.append(this.#createHeader(SetService.getSetTitle(set)));

        // This container will house all the swimlane items
        const swimlaneItemsContainer = document.createElement('div');
        swimlaneItemsContainer.classList.add('swimlane-items', 'scrollable-x')
        swimlaneContainer.appendChild(swimlaneItemsContainer);

        // create the swimlane items
        set.items.forEach(item => swimlaneItemsContainer.append(this.#createSwimlaneItem(item)));
    }

    /** Creates the header of the swimlane
     * @param {string} text The text to include in the header
     * @returns {HTMLDivElement} The header element
     */
    #createHeader(text) {
        const header = document.createElement('div');
        header.innerHTML = `<div class="swimlane-header">${text}</div>`
        return header;
    }

    /** Creates a swimlane item
     * @param {Object} item The item to represent in the swimlane
     * @returns {HTMLAnchorElement} The anchor representing the item
     */
    #createSwimlaneItem(item) {
        const itemContainer = document.createElement('a');
        itemContainer.classList.add('swimlane-item');
        itemContainer.href = SetService.getItemUrl(item);
        itemContainer.addEventListener('focus', (event) => this.#onItemFocus(event.target, item));
        itemContainer.addEventListener('blur', (event) => this.#onItemBlur(event.target, item));

        // create the main content
        // a title in case the images fail to load
        // a lazy loaded image container
        itemContainer.innerHTML = `
            <div class="title">${SetService.getItemTitle(item)}</div>
            <img width="319" height="179" src="${SetService.getItemImageUrl(item)}" onerror='this.style.display = "none"' loading="lazy">
        `;
        return itemContainer;
    }

    /** Callback for focus, begins video playback if available after 1 second
     * @param {HTMLAnchorElement} target The element with focus
     * @param {*} item The item context (from set)
     */
    #onItemFocus(target, item) {
        if (item.videoArt?.length) {
            window.setTimeout(() => {
                if (document.activeElement !== target) return;
                const videoTag = document.createElement('video');
                videoTag.classList.add('inline-video');
                videoTag.src = item.videoArt[0].mediaMetadata.urls[0].url;
                videoTag.autoplay = true;
                videoTag.addEventListener('ended', () => this.#onItemBlur(target));
                target.appendChild(videoTag)
            }, 1000);
        }
    }

    /** Call for blur, cleans up the video player
     * @param {HTMLAnchorElement} target The element losing focus
     */
    #onItemBlur(target) {
        if (target.lastElementChild.tagName === 'VIDEO') {
            target.lastElementChild.classList.add('remove');

            // delay removing so we can fade it out first
            window.setTimeout(() => target.lastElementChild.remove(), 500);
        };
    }
}

const instance = new SwimlaneFactory();
Object.freeze(instance);

export default instance;