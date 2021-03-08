import { EmbeddedLink } from '../embedded-link';
import { Link } from '../link';

describe('EmbeddedLink', () => {
    it('should be instanceof Link', () => {
        const link = new EmbeddedLink(['self'], 'http://example.com');

        expect(link).toBeInstanceOf(EmbeddedLink);
        expect(link).toBeInstanceOf(Link);
    });
});
