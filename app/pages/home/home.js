import DataService from '../../services/data.service';

import Swimlane from './swimlane';

export default class Home {

    /** Renders the home page */
    static render() {
        return DataService.getHomePageBlocks().then(response => {
            const root = document.getElementById('app-root');
            response.forEach(pageBlock => {

                // if the block is curated it'll have it's items so we can just load
                if (pageBlock.set.type === 'CuratedSet') {
                    Swimlane.create(root, pageBlock.set);

                // if the block is a setref, we need to go to the server to grab it's info
                } else if (pageBlock.set.type === 'SetRef') {
                    DataService.getRefSet(pageBlock.set.refId).then(refResponse => {
                        Swimlane.create(root, refResponse);
                    })
                }
            });
        });
    }
}