/** Handles navigation in the application */
class SpatialNavigation {
    // timeout used as an input throttle
    #timeoutId = undefined;

    /** Initializes the navigation framework */
    initialize() {
        // inital navigation to find something on the page to have default focus
        this.navigate('down');

        document.addEventListener('keydown', (event) => {
            if (this.#timeoutId) return;

            // we will ignore input for 500ms anytime a key is pressed to avoid overwhelming the app with navigation
            this.#timeoutId = window.setTimeout(() => this.#timeoutId = undefined, 500);

            switch (event.code) {
                case 'ArrowUp':
                    this.navigate('up');
                    break;
                case 'ArrowDown':
                    this.navigate('down');
                    break;
                case 'ArrowLeft':
                    this.navigate('left');
                    break;
                case 'ArrowRight':
                    this.navigate('right');
                    break;
            }
        });
    }

    /** Navigates in a particular direction from the currently focused item. If nothing is focused, than the first item on the page will be. 
     * @param direction {'up' | 'down' | 'left' | 'right'}
     * */
    navigate(direction) {
        // if no active element (body doesn't count), then find the first focusable item on the page and focus
        if (!document.activeElement || document.activeElement.tagName === 'BODY') {
            document.querySelector('a, button').focus();
            return;
        }

        // find all things that are focusable, ignore whatever is currently in focus
        const candidates = Array.from(document.querySelectorAll('a:not(:focus), button:not(:focus)')).map(element => ({ element: element, box: element.getBoundingClientRect() }));

        const boundingBox = document.activeElement.getBoundingClientRect();

        let focusedPoint = { x: 0, y: 0 };
        let targetElement = undefined;
        let filterFunction = undefined;

        // for each direction we will construct a point representative of the element, then filter down to candidates suitable to navigate to. Candidates must be at least one
        // pixel further in the direction of the navigation to count
        switch (direction) {
            case 'up':
                filterFunction = (c) => c.box.top < boundingBox.top;
                focusedPoint = { x: boundingBox.left, y: boundingBox.top };
                break;
            case 'down':
                filterFunction = (c) => c.box.bottom > boundingBox.bottom;
                focusedPoint = { x: boundingBox.left, y: boundingBox.bottom };
                break;
            case 'left':
                filterFunction = (c) => c.box.left < boundingBox.left;
                focusedPoint = { x: boundingBox.left, y: boundingBox.bottom - boundingBox.height / 2 }
                break;
            case 'right':
                filterFunction = c => c.box.right > boundingBox.right;
                focusedPoint = { x: boundingBox.right, y: boundingBox.bottom - boundingBox.height / 2 };
                break;
        }
        targetElement = this.#findTargetElement(focusedPoint, candidates.filter(filterFunction).map(c => ({ element: c.element, x: c.box.left, y: c.box.top })));

        // if we found something to focus on, call focus, then scroll it into view
        if (targetElement) {
            targetElement.focus();

            if (['left', 'right'].includes(direction)) {
                this.#scrollIntoViewHorizontal(targetElement);
            } else if (['up', 'down'].includes(direction)) {
                this.#scrollIntoViewVertical(targetElement);
            }
        }
    }

    /** Scrolls (translates) the page horizontally to bring the targetElement into view 
     * @param {HTMLElement} targetElement The element to bring into view */
    #scrollIntoViewHorizontal(targetElement) {
        const box = targetElement.getBoundingClientRect();
        const style = window.getComputedStyle(targetElement);

        let parent = targetElement.parentElement;

        // find the parent that is horizontally scrollable
        while (!parent.classList.contains('scrollable-x')) parent = parent.parentElement;
        const currentTransform = this.#parseTransform(parent.style.transform);

        // find all the mins, maxes and widths needed for calculations
        const viewportMin = Math.abs(currentTransform.x);
        const viewportMax = Math.abs(currentTransform.x) + window.innerWidth;
        const marginLeft = parseInt(style.getPropertyValue('margin-left'), 10);
        const marginRight = parseInt(style.getPropertyValue('margin-right'), 10)
        const left = box.left - marginLeft;
        const right = box.right + marginRight;
        const width = marginLeft + box.width + marginRight;

        // complex bit here, but we're trying to determine if we need to scroll, and if so how much
        // the translate3d moves the swimlane left or right so that the selected item is in view
        // 0 is inital swimlane position, more negative numbers moves the swimlane left, numbers closer to 0 shift the swimlane right
        // we use translate3d here, even though we're 2d, because 3d on some browsers enables the gpu for better performance

        // is our element within the current viewport of the screen, if so there's nothing to do
        if (left + Math.abs(currentTransform.x) >= viewportMin && right + Math.abs(currentTransform.x) <= viewportMax) return;

        // is our element off the left side of the screen, if so shift left
        if (left + Math.abs(currentTransform.x) < viewportMin) {
            parent.style.transform = `translate3d(${Math.min(currentTransform.x + width, 0)}px,0,0)`;

            // is our element off the right side of the screen, if so shift right
        } else if (right + Math.abs(currentTransform.x) > viewportMax) {
            parent.style.transform = `translate3d(${currentTransform.x - width}px,0,0)`;
        } else {
            // If we get here, something has gone wrong and we haven't accounted for a case
            console.error('Navigation Failed')
        }
    }

    /** Scrolls (translates) the page vertically to bring the targetElement into view 
    * @param {HTMLElement} targetElement The element to bring into view */
    #scrollIntoViewVertical(targetElement) {
        // find the focus group for this element, allows us to ensure we bring in the header when navigating up/down
        let focusGroupElement = targetElement;
        while (!focusGroupElement.classList.contains('focus-group')) {
            focusGroupElement = focusGroupElement.parentElement;
        }
        const box = focusGroupElement.getBoundingClientRect();
        const style = window.getComputedStyle(focusGroupElement);

        // find the parent that is vertically scrollable
        let parent = targetElement.parentElement;
        while (!parent.classList.contains('scrollable-y')) parent = parent.parentElement;
        const currentTransform = this.#parseTransform(parent.style.transform);

        // find all the mins, maxes and widths needed for calculations
        const viewportMin = Math.abs(currentTransform.y);
        const viewportMax = Math.abs(currentTransform.y) + window.innerHeight;
        const marginTop = parseInt(style.getPropertyValue('margin-top'), 10);
        const marginBottom = parseInt(style.getPropertyValue('margin-bottom'), 10)
        const top = box.top - marginTop;
        const bottom = box.bottom + marginBottom;
        const height = marginTop + box.height + marginBottom;

        // complex bit here, but we're trying to determine if we need to scroll, and if so how much
        // the translate3d moves the collection of swimlanes up or down so that the selected item is in view
        // 0 is inital position, more negative numbers moves the swimlanes up, numbers closer to 0 shift the swimlane down
        // we use translate3d here, even though we're 2d, because 3d on some browsers enables the gpu for better performance

        // is our element within the current viewport of the screen, if so there's nothing to do
        if (top + Math.abs(currentTransform.y) >= viewportMin && bottom + Math.abs(currentTransform.y) <= viewportMax) return;

        // is our element off the top of the screen, if so shift up
        if (top + Math.abs(currentTransform.y) < viewportMin) {
            parent.style.transform = `translate3d(0,${Math.min(currentTransform.y + height, 0)}px,0)`;

            // is our element off the bottom of the screen, if so shift down
        } else if (bottom + Math.abs(currentTransform.y) > viewportMax) {
            parent.style.transform = `translate3d(0,${currentTransform.y - height}px,0)`;
        } else {
            // If we get here, something has gone wrong and we haven't accounted for a case
            console.error('Navigation Failed')
        }
    }

    /** Helper function to parse the string representation of a transform into it's parts
     * @param {string} transformString The string transform: translate3d(0px, 100px, 0px)
     * @returns {{x: number, y: number, z: number}} The transform components
     */
    #parseTransform(transformString) {
        const transform = { x: 0, y: 0, z: 0 };

        if (transformString) {
            const translations = transformString
                .replace('translate3d(', '')
                .replace(/px/gi, '')
                .replace(')', '')
                .split(', ')
                .map(n => Number(n));

            transform.x = translations[0];
            transform.y = translations[1];
            transform.z = translations[2];
        }

        return transform;
    }

    /** Determines what element is closest to a point using the Euclidean Distance
     * @param {x: number, y: number} focusedPoint The reference point 
     * @param {Array<{x: number, y: number, element: HTMLElement}>} candidates An array of candidates to evaluate
     * @returns {HTMLElement | undefined} The closest element, or undefined if unknown
     */
    #findTargetElement(focusedPoint = { x: 0, y: 0 }, candidates = []) {
        const distances = candidates.map(candidate => {
            const internal = Math.pow(focusedPoint.x - candidate.x, 2) + Math.pow(focusedPoint.y - candidate.y, 2);
            return { element: candidate.element, distance: Math.sqrt(internal) };
        });

        if (distances.length) return distances.sort((a, b) => a.distance - b.distance)[0].element;
        return undefined;
    }
}

const instance = new SpatialNavigation();
Object.freeze(instance);

export default instance;