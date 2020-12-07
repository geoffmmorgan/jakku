/** Provides methods for retreiving data from the server */
class DataService {
    /** Gets the page blocks for the home page 
     * @returns {Array} Returns an array of page blocks */
    getHomePageBlocks() {
        return fetch(`https://cd-static.bamgrid.com/dp-117731241344/home.json`).then(response => response.json()).then(body => body.data.StandardCollection.containers).catch(() => {
            window.alert('Failed to load home page blocks!');
        });
    }

    /** Gets the ref set for a given refId
     * @param {string} refId The refId to retreive
     * @returns {Array} Returns an array of page blocks */
    getRefSet(refId) {
        return fetch(`https://cd-static.bamgrid.com/dp-117731241344/sets/${refId}.json`).then(response => response.json()).then(body => body.data[Object.keys(body.data)[0]]).catch(() => {
            window.alert('Failed to load ref set!');
        });;
    }
}

const instance = new DataService();
Object.freeze(instance);

export default instance;