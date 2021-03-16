export default function extendWith(object, extensions) {
    Object.keys(extensions).forEach((key) => {
        object[key] = extensions[key];
    });
}
