import { Link } from './link';

export class EmbeddedLink extends Link {
    constructor(rel, href, options = {}) {
        super(rel, href, options);
    }
}
