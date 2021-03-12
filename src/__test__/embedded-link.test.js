import { EmbeddedLink } from '../embedded-link';
import { Link } from '../link';

const rel = ['self'];
const href = 'http://example.com';

describe('EmbeddedLink', () => {
    it('should be instanceof Link', () => {
        const link = new EmbeddedLink(rel, href);

        expect(link).toBeInstanceOf(EmbeddedLink);
        expect(link).toBeInstanceOf(Link);
    });

    it('should require non-empty rel', () => {
        expect(() => new EmbeddedLink([], href)).toThrow(TypeError);
        expect(() => new EmbeddedLink([42], href)).toThrow(TypeError);
    });

    it('should ignore empty rel', () => {
        const link = new EmbeddedLink(rel, href);

        [[], [42]].forEach((value) => {
            link.rel = value;
            expect(link.rel).toEqual(rel);
        });
    });
});
