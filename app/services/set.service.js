/** Provides a set of helper methods for manipulating sets */
class SetService {
    /** Gets the title of the set
    * @returns {string} The title of the set, or '' if unknown
    */
    getSetTitle(set) {
        try {
            return set.text.title.full.set.default.content;
        } catch {
            return '';
        }
    }

    /** Gets the title of the item
     * @returns {string} The title of the item, or '' if unknown
     */
    getItemTitle(item, encodeForUrl = false) {
        try {
            const titlePath = item.text.title.full;
            const title = titlePath[Object.keys(titlePath)[0]].default.content;

            if (encodeForUrl) return title.replace(/ /g, '-').toLowerCase();
            return title;
        } catch {
            return '';
        }
    }

    /** Gets the tile image url for an item
     * @returns {string} The image url of the item, or '' if unknown
     */
    getItemImageUrl(item) {
        try {
            const tileObject = item.image.tile['1.78'];
            return tileObject[Object.keys(tileObject)[0]].default.url;
        } catch {
            return '';
        }
    }

    /** Gets the detail page url for an item
     * @returns {string} The url of the item, or '#' if unknown
     */
    getItemUrl(item) {
        try {
            // https://www.disneyplus.com/series/the-right-stuff/4wCkPyO0JUux
            if (item.seriesId) return `https://www.disneyplus.com/series/${item.text.title.slug.series.default.content}/${item.encodedSeriesId}`;

            // https://www.disneyplus.com/movies/lost-on-everest/6ccrgpcKp2Fd
            if (item.programType === 'movie') return `https://www.disneyplus.com/movies/${this.getItemTitle(item, true)}/${item.family.encodedFamilyId}`;

            // https://www.disneyplus.com/franchise/the-lion-king
            if (item.type === 'StandardCollection') return `https://www.disneyplus.com/franchise/${this.getItemTitle(item, true)}`;
        } catch { 
            // This should be logged to some error service
        }
        
        return '#';
    }
}

const instance = new SetService();
Object.freeze(instance);

export default instance;